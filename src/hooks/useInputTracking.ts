import { useRef, useCallback, useEffect } from 'react';
import sensors, { flushEvents } from '../utils/tracker';
import config from '../utils/trackConfig';

// 检查埋点功能是否启用 - 最高级别控制
const isTrackingEnabled = config.FEATURES.ENABLED;

// TrackingData接口使用与SpringBoot服务器匹配的结构
interface TrackingData {
  // SpringBoot控制器期望的事件名
  event: string;
  // distinct_id需要在根级别
  distinct_id: string;
  // 其他属性将被放在properties字段中
  content: string;
  input_length: number;
  page: string;
  timestamp: number;
  room_id?: number;
  platform: string;
  device_type: string;
  module: string;
  event_fingerprint: string;
  // 新增字段，标记是增加还是删除操作
  input_action: 'add' | 'delete';
  // 新增字段，记录最大长度
  max_length?: number;
}

// 从配置文件获取允许的埋点事件名称
const ALLOWED_EVENTS = config.ALLOWED_EVENTS;

// 从配置文件获取调试开关
const DEBUG_MODE = config.DEBUG.ENABLED;

// 从配置文件获取防抖时间间隔
const DEBOUNCE_TIME = {
  chat_input_typing_add: config.DEBOUNCE.chat_input_typing_add,     // 增加内容时等待更长时间，只保留最终状态
  chat_input_typing_delete: config.DEBOUNCE.chat_input_typing_delete,  // 删除操作更快记录
  chat_input_blur: 1000,          // 虽然已移除但保留配置以备将来使用
  chat_input_before_send: 500,
  chat_input_sent: 500,
  chat_message_received: 500
};

// 生成事件指纹，用于更精确的去重
const generateEventFingerprint = (eventName: string, content: string, inputAction: 'add' | 'delete', roomId?: number): string => {
  // 提取内容的前30个字符作为指纹的一部分
  const contentDigest = content.substring(0, 30);
  // 组合事件名、内容摘要、操作类型和房间ID生成唯一指纹
  return `${eventName}_${contentDigest}_${inputAction}_${roomId || 0}`;
};

  // 全局记录上次发送的事件，用于防止重复
const lastEvents: Record<string, {
  content: string;
  timestamp: number;
  count: number;  // 追踪尝试次数
  fingerprint: string; // 添加指纹字段
  length: number; // 记录内容长度
}> = {};

// 检查是否为拼音输入法状态（包含未完成的拼音）
// 当前未使用，保留供将来可能的功能
// const isPinyinInput = (content: string): boolean => {
//   // 检查是否包含拼音输入法特征
//   const hasPinyinMarkers = /[a-z]+['`]?$/i.test(content); // 以小写字母结尾可能是拼音
//   return hasPinyinMarkers;
// };

// 检查是否重复事件 - 防止短时间内相同事件重复发送
const isDuplicateEvent = (eventName: string, content: string, inputAction: 'add' | 'delete', roomId?: number): boolean => {
  const now = Date.now();
  // 生成事件指纹
  const fingerprint = generateEventFingerprint(eventName, content, inputAction, roomId);
  
  // 首先检查是否有任何类型事件的重复发送（全局限制）
  const allContentKeys = Object.keys(lastEvents).filter(k => 
    lastEvents[k].fingerprint === fingerprint && 
    now - lastEvents[k].timestamp < 500
  );
  
  if (allContentKeys.length > 0) {
    // 有任何事件类型最近500ms内发送过相同内容
    if (DEBUG_MODE) {
      console.log(`🛑 全局重复检测: 相同指纹 "${fingerprint}" 在500ms内已发送过`);
    }
    return true;
  }
  
  // 检查是否存在相同事件类型的重复
  const eventWithAction = `${eventName}_${inputAction}`;
  const sameEventKeys = Object.keys(lastEvents).filter(k => 
    k.startsWith(eventWithAction) && 
    lastEvents[k].fingerprint === fingerprint &&
    now - lastEvents[k].timestamp < DEBOUNCE_TIME[`chat_input_typing_${inputAction}` as keyof typeof DEBOUNCE_TIME]
  );
  
  if (sameEventKeys.length > 0) {
    // 更新计数
    sameEventKeys.forEach(k => {
      lastEvents[k].count = (lastEvents[k].count || 0) + 1;
    });
    
    if (DEBUG_MODE) {
      console.log(`🔄 忽略第${lastEvents[sameEventKeys[0]].count}次重复事件: ${eventName}(${inputAction})，距上次发送仅 ${now - lastEvents[sameEventKeys[0]].timestamp}ms`);
    }
    return true;
  }
  
  // 生成唯一键，加入操作类型
  const key = `${eventName}_${inputAction}_${now}`;
  
  // 记录本次事件
  lastEvents[key] = { 
    content, 
    timestamp: now, 
    count: 1,
    fingerprint,
    length: content.length
  };
  
  // 清理过期事件记录
  setTimeout(() => {
    delete lastEvents[key];
  }, 10000); // 延长保留时间到10秒，增强防重复能力
  
  return false;
};

// 获取用户ID - 增强从session获取
const getUserId = (): string => {
  try {
    // 1. 从localStorage尝试获取
    const localId = localStorage.getItem('userId') || localStorage.getItem('user_id');
    if (localId) return localId;
    
    // 2. 从sessionStorage尝试获取
    const sessionId = sessionStorage.getItem('userId') || sessionStorage.getItem('user_id') || sessionStorage.getItem('token');
    if (sessionId) return sessionId;
    
    // 3. 从jwtToken获取
    const jwtToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
    if (jwtToken) {
      // 简单解析JWT，不做验证
      try {
        const base64Url = jwtToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        if (payload.userId || payload.sub) {
          return payload.userId || payload.sub;
        }
      } catch (e) {
        console.warn('无法解析JWT', e);
      }
    }
    
    // 4. 从全局变量获取
    if ((window as any).userInfo?.userId) {
      return (window as any).userInfo.userId;
    }
    
    // 5. 尝试从document.cookie获取
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'userId' || name === 'user_id') {
        return value;
      }
    }
    
    // 6. 尝试从页面URL获取
    const urlParams = new URLSearchParams(window.location.search);
    const urlUserId = urlParams.get('userId') || urlParams.get('user_id');
    if (urlUserId) return urlUserId;
    
    console.warn('⚠️ 无法获取有效的userId，使用anonymous');
    return 'anonymous';
  } catch (e) {
    console.error('获取userId时出错:', e);
    return 'anonymous';
  }
};

// 埋点日志函数
const logTracking = (eventName: string, data: TrackingData) => {
  // 如果调试模式关闭或不显示日志，则直接返回
  if (!DEBUG_MODE || !config.DEBUG.CONSOLE_LOG) return;
  
  // 检查是否为允许的事件
  if (!ALLOWED_EVENTS.includes(eventName)) {
    console.log(`🚫 忽略未配置的事件: ${eventName}`);
    return;
  }
  
  console.group(`📊 埋点事件: ${eventName}`);
  
  // 根据配置决定是否显示内容详情
  if (config.DEBUG.SHOW_CONTENT_DETAILS) {
    console.log(`📝 内容: ${data.content.substring(0, 50)}${data.content.length > 50 ? '...' : ''}`);
  }
  
  // 根据配置决定是否显示长度信息
  if (config.DEBUG.SHOW_LENGTH_INFO) {
    console.log(`📏 长度: ${data.input_length}`);
    if (data.max_length) console.log(`📏 最大长度: ${data.max_length}`);
  }
  
  // 根据配置决定是否显示操作类型
  if (config.DEBUG.SHOW_ACTION_TYPE) {
    console.log(`🧩 操作: ${data.input_action === 'add' ? '增加内容' : '删除内容'}`);
  }
  
  console.log(`🏠 页面: ${data.page}`);
  
  // 根据配置决定是否显示时间信息
  if (config.DEBUG.SHOW_TIME_INFO) {
    console.log(`🕒 时间: ${new Date(data.timestamp).toLocaleTimeString()}`);
  }
  
  // 根据配置决定是否显示ID信息
  if (config.DEBUG.SHOW_IDS) {
    console.log(`👤 用户ID: ${data.distinct_id}`);
    if (data.room_id) console.log(`🔑 房间ID: ${data.room_id}`);
  }
  
  console.groupEnd();
};

// 检查内容是否满足记录条件（至少两个中文字符或两个英文单词）
const isContentEligible = (content: string): boolean => {
  if (!content || !content.trim()) return false;
  
  // 检查中文字符数量
  const chineseChars = content.match(/[\u4e00-\u9fa5]/g);
  if (chineseChars && chineseChars.length > 2) {
    return true;
  }
  
  // 检查英文单词数量
  const englishWords = content.trim().split(/\s+/).filter(word => /[a-zA-Z]/.test(word));
  if (englishWords.length > 2) {
    return true;
  }
  
  // 检查总字符数，也可以作为补充条件
  if (content.length > 10) {
    return true;
  }
  
  return false;
};

// 检查两个内容之间的差异是否足够大
const isChangeSufficient = (oldContent: string, newContent: string): boolean => {
  if (!oldContent || !newContent) return true; // 如果任一内容为空，视为变化足够
  
  // 计算字符差异
  const diff = Math.abs(newContent.length - oldContent.length);
  if (diff >= 5) return true; // 如果字符差异大于等于5，视为变化足够
  
  // 检查中文字符差异
  const oldChineseChars = oldContent.match(/[\u4e00-\u9fa5]/g) || [];
  const newChineseChars = newContent.match(/[\u4e00-\u9fa5]/g) || [];
  if (Math.abs(oldChineseChars.length - newChineseChars.length) >= 2) {
    return true;
  }
  
  // 检查英文单词差异
  const oldEnglishWords = oldContent.trim().split(/\s+/).filter(word => /[a-zA-Z]/.test(word));
  const newEnglishWords = newContent.trim().split(/\s+/).filter(word => /[a-zA-Z]/.test(word));
  if (Math.abs(oldEnglishWords.length - newEnglishWords.length) >= 2) {
    return true;
  }
  
  return false;
};

export const useInputTracking = (roomId?: number) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // 记录已触发事件，避免重复
  // const eventTracked = useRef<{[key: string]: boolean}>({});
  // 记录组件级别的最后事件时间
  const lastEventTime = useRef<{[key: string]: number}>({});
  // 记录上一次输入的内容长度，用于比较是增加还是删除
  const lastInputLength = useRef<number>(0);
  // 记录当前输入会话中的最大内容长度
  const maxInputLength = useRef<number>(0);
  // 记录最后一次输入的内容
  const lastInputContent = useRef<string>('');
  // 记录最后一次记录的内容，用于比较变化
  const lastRecordedContent = useRef<string>('');
  // 记录是否有待发送的增加类型事件
  const hasPendingAddEvent = useRef<boolean>(false);
  // 记录本次会话的状态，用于记录减少操作
  const sessionState = useRef<{
    maxContent: string;
    wasReduced: boolean;
    lastReducedContent: string;
  }>({
    maxContent: '',
    wasReduced: false,
    lastReducedContent: ''
  });
  // 记录输入法组合状态（用于过滤拼音输入）
  const isComposing = useRef<boolean>(false);
  // 记录组合结束后待处理的内容
  const pendingContent = useRef<string>('');

  // 清理函数 - 在组件卸载时发送最后的状态
  useEffect(() => {
    return () => {
      // 如果埋点功能被禁用，直接返回
      if (!isTrackingEnabled) {
        return;
      }
      
      // 如果有未发送的内容且长度大于0，发送最终状态
      if (lastInputContent.current.trim().length > 0) {
        // 发送最终状态的埋点数据
        if (DEBUG_MODE && config.DEBUG.CONSOLE_LOG) {
          console.log('🏁 组件卸载，发送最终输入状态');
        }
        
        // 触发最终状态埋点，使用特殊的input_action标识符
        const finalData = getTrackingData(
          lastInputContent.current,
          'chat_input_typing',
          'add'
        );
        
        // 添加最大长度信息
        finalData.max_length = maxInputLength.current;
        
        sensors.track('chat_input_typing', finalData);
        flushEvents(); // 立即尝试发送队列中的事件
      }
    };
  }, [roomId]);

  const getTrackingData = useCallback((content: string, eventName: string, inputAction: 'add' | 'delete'): TrackingData => {
    const userId = getUserId();
    const timestamp = Date.now();
    
    // 生成事件指纹
    const fingerprint = generateEventFingerprint(eventName, content, inputAction, roomId);
    
    return {
      // 关键字段，与SpringBoot @RequestBody Map<String, Object> payload 匹配
      event: eventName,  // SpringBoot控制器会从这里提取事件名
      // 明确设置distinct_id到根级别
      distinct_id: userId,
      // 以下字段将被自动放入properties
      content,
      input_length: content.length,
      page: window.location.pathname,
      timestamp,
      room_id: roomId,
      platform: 'web',
      device_type: 'browser',
      module: 'chat',
      // 添加指纹用于跟踪和去重
      event_fingerprint: fingerprint,
      // 添加操作类型标记
      input_action: inputAction,
      // 添加最大长度信息（如果是删除操作或最终状态）
      max_length: inputAction === 'delete' || eventName === 'chat_input_before_send' ? maxInputLength.current : undefined
    };
  }, [roomId]);

  // 通用的埋点发送函数，集中处理重复检查
  const trackEvent = useCallback((eventName: string, content: string, inputAction: 'add' | 'delete') => {
    // 如果埋点功能被禁用，直接返回
    if (!isTrackingEnabled) {
      return;
    }
    
    // 检查是否为允许的事件
    if (!ALLOWED_EVENTS.includes(eventName)) {
      if (DEBUG_MODE) console.log(`🚫 不跟踪事件: ${eventName}`);
      return;
    }
    
    // 新规则：只要文字发生变化就记录，不做内容长度和变化检查
    // 转折点过滤会在队列中自动处理
    
    // 只做基本的重复检查 - 防止完全相同的内容在极短时间内重复
    const now = Date.now();
    const lastTime = lastEventTime.current[`${eventName}_${inputAction}`] || 0;
    
    // 极短时间内（50ms）的重复检查，防止意外的重复触发
    if (now - lastTime < 50) {
      if (DEBUG_MODE && config.DEBUG.VERBOSE) console.log(`⏱️ 极短时间重复: ${eventName}(${inputAction}) 间隔 ${now - lastTime}ms`);
      return;
    }
    
    // 检查内容是否与上次完全相同
    if (lastRecordedContent.current === content) {
      if (DEBUG_MODE && config.DEBUG.VERBOSE) console.log(`🚫 内容完全相同，跳过: ${content.substring(0, 20)}`);
      return;
    }
    
    // 更新最后事件时间和记录的内容
    lastEventTime.current[`${eventName}_${inputAction}`] = now;
    lastRecordedContent.current = content;
    
    const data = getTrackingData(content, eventName, inputAction);
    
    if (DEBUG_MODE && config.DEBUG.CONSOLE_LOG && config.DEBUG.VERBOSE) {
      let message = `📤 准备发送事件: ${eventName}(${inputAction})`;
      if (config.DEBUG.SHOW_CONTENT_DETAILS) {
        message += `, 指纹: ${data.event_fingerprint}`;
      }
      console.log(message);
    }
    
    sensors.track(eventName, data);
    logTracking(eventName, data);

    // 新增：每次添加埋点时直接在控制台显示队列中的所有事件
    if (DEBUG_MODE && config.FEATURES.AUTO_DUMP_QUEUE && (sensors as any).debug) {
      (sensors as any).debug.dumpQueue();
    }
  }, [getTrackingData, roomId]);

  // 处理输入法组合开始（拼音输入开始）
  const handleCompositionStart = useCallback(() => {
    isComposing.current = true;
    if (DEBUG_MODE && config.DEBUG.VERBOSE) {
      console.log('🎯 输入法组合开始（拼音输入中...）');
    }
  }, []);

  // 处理输入法组合结束（拼音转换为中文完成）
  const handleCompositionEnd = useCallback((content: string) => {
    isComposing.current = false;
    pendingContent.current = content;
    
    if (DEBUG_MODE && config.DEBUG.VERBOSE) {
      console.log('🎯 输入法组合结束（拼音已转换为中文）');
    }
    
    // 组合结束后立即处理内容
    // 使用 setTimeout 确保在 input 事件之后执行
    setTimeout(() => {
      if (pendingContent.current) {
        handleTypingInternal(pendingContent.current);
        pendingContent.current = '';
      }
    }, 0);
  }, []);

  // 内部的 typing 处理函数
  const handleTypingInternal = useCallback((content: string) => {
    if (!content.trim()) {
      lastInputLength.current = 0;
      maxInputLength.current = 0;
      lastInputContent.current = '';
      sessionState.current = {
        maxContent: '',
        wasReduced: false,
        lastReducedContent: ''
      };
      return;
    }
    
    // 保存当前内容用于组件卸载时发送
    lastInputContent.current = content;
    
    // 比较当前内容长度与队列最新记录的长度，判断是增加还是删除
    const currentLength = content.length;
    const previousLength = lastInputLength.current; // 保存上一次的长度用于状态判断
    // 从tracker获取队列最新记录的长度
    const queueLastLength = (sensors as any).getQueueLastLength?.() || lastInputLength.current;
    const inputAction: 'add' | 'delete' = currentLength >= queueLastLength ? 'add' : 'delete';
    
    // 更新上一次输入长度
    lastInputLength.current = currentLength;
    
    // 更新本次会话的最大长度
    if (currentLength > maxInputLength.current) {
      maxInputLength.current = currentLength;
      sessionState.current.maxContent = content;
    }
    
    // 新规则：只要文字发生变化就立即记录埋点，让队列中的转折点过滤来处理
    // 不再使用防抖延迟，减少数据延迟
    trackEvent('chat_input_typing', content, inputAction);
    
    // 更新会话状态
    if (inputAction === 'delete') {
      sessionState.current.lastReducedContent = content;
      if (!sessionState.current.wasReduced) {
        sessionState.current.wasReduced = true;
      }
    } else {
      // 如果从删除状态恢复增加，重置删除状态
      if (sessionState.current.wasReduced && currentLength > previousLength) {
        sessionState.current.wasReduced = false;
      }
    }
  }, [trackEvent]);

  // 修改typing处理函数，区分增加和删除操作，实现新的埋点规则
  const handleTyping = useCallback((content: string) => {
    // 如果正在输入法组合中（拼音输入中），不记录埋点
    if (isComposing.current) {
      if (DEBUG_MODE && config.DEBUG.VERBOSE) {
        console.log('⏸️ 输入法组合中，跳过埋点记录');
      }
      return;
    }
    
    // 非组合状态，正常处理
    handleTypingInternal(content);
  }, [handleTypingInternal]);

  // 发送消息的处理函数 - 增加发送前记录最终状态
  const handleSend = useCallback((content: string) => {
    if (!content.trim()) return;
    
    // 如果埋点功能被禁用，直接返回
    if (!isTrackingEnabled) {
      return;
    }
    
    // 发送前记录最终输入状态并触发批量埋点发送
    if (lastInputContent.current.trim().length > 0) {
      // 创建最终状态的数据
      const finalData = getTrackingData(
        lastInputContent.current,
        'chat_input_typing',
        'add'
      );
      
      // 添加最大长度信息
      finalData.max_length = maxInputLength.current;
      
      if (DEBUG_MODE && config.DEBUG.CONSOLE_LOG) {
        console.log('📨 发送消息前，记录最终输入状态');
        console.log(`📏 最大长度: ${maxInputLength.current}`);
      }
      
      sensors.track('chat_input_typing', finalData);
      
      // 消息发送时触发批量埋点发送
      if (config.FEATURES.SEND_MESSAGE_TRIGGER) {
        if (DEBUG_MODE && config.DEBUG.CONSOLE_LOG) console.log('🚀 发送消息触发批量埋点发送');
        flushEvents();
      }
    }
    
    // 重置状态，为下一次输入做准备
    lastInputLength.current = 0;
    maxInputLength.current = 0;
    lastInputContent.current = '';
    hasPendingAddEvent.current = false;
    sessionState.current = {
      maxContent: '',
      wasReduced: false,
      lastReducedContent: ''
    };
    
    if (DEBUG_MODE) {
      console.log('🚫 发送消息埋点已禁用:', content.substring(0, 30));
    }
    // 不再触发发送消息埋点事件
  }, [getTrackingData]);

  // 处理接收到新消息的事件
  const handleMessageReceived = useCallback((content: string, _senderId?: number) => {
    if (!isTrackingEnabled) return;
    
    // 消息接收事件不需要内容检查
    trackEvent('chat_message_received', content, 'add');
  }, [trackEvent]);

  return {
    handleTyping,
    handleSend,
    handleMessageReceived,
    handleCompositionStart,
    handleCompositionEnd
  };
}; 