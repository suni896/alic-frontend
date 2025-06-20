import { useRef, useCallback } from 'react';
import sensors from '../utils/tracker';

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
}

// 定义允许的埋点事件名称，仅这些事件会被发送
const ALLOWED_EVENTS = [
  // 移除不需要的埋点事件
  'chat_input_typing',
  // 'chat_input_blur',
  'chat_input_before_send',
  'chat_input_sent',
  'chat_message_received'
];

// 调试开关 - 设置为true以查看埋点日志
const DEBUG_MODE = true;

// 定义防抖时间间隔（毫秒）- 大幅增加时间间隔，确保不会重复
const DEBOUNCE_TIME = {
  chat_input_typing: 3000,    // 类型事件防抖，3秒内只允许一次相同内容
  chat_input_blur: 1000,      // 虽然已移除但保留配置以备将来使用
  chat_input_before_send: 500,
  chat_input_sent: 500,
  chat_message_received: 500
};

// 全局记录上次发送的事件，用于防止重复
const lastEvents: Record<string, {
  content: string;
  timestamp: number;
  count: number;  // 追踪尝试次数
}> = {};

// 检查是否重复事件 - 防止短时间内相同事件重复发送
const isDuplicateEvent = (eventName: string, content: string): boolean => {
  const now = Date.now();
  // 确保生成唯一键
  const key = `${eventName}_${content.substring(0, 20)}_${now % 10000}`;
  
  // 首先检查是否有任何类型事件的重复发送（全局限制）
  const allContentKeys = Object.keys(lastEvents).filter(k => 
    k.includes(content.substring(0, 20)) && 
    now - lastEvents[k].timestamp < 500
  );
  
  if (allContentKeys.length > 0) {
    // 有任何事件类型最近500ms内发送过相同内容
    if (DEBUG_MODE) {
      console.log(`🛑 全局重复检测: 相同内容 "${content.substring(0, 20)}..." 在500ms内已发送过`);
    }
    return true;
  }
  
  // 检查是否存在相同事件类型的重复
  const sameEventKeys = Object.keys(lastEvents).filter(k => 
    k.startsWith(eventName) && 
    lastEvents[k].content === content && 
    now - lastEvents[k].timestamp < DEBOUNCE_TIME[eventName as keyof typeof DEBOUNCE_TIME]
  );
  
  if (sameEventKeys.length > 0) {
    // 更新计数
    sameEventKeys.forEach(k => {
      lastEvents[k].count = (lastEvents[k].count || 0) + 1;
    });
    
    if (DEBUG_MODE) {
      console.log(`🔄 忽略第${lastEvents[sameEventKeys[0]].count}次重复事件: ${eventName}，距上次发送仅 ${now - lastEvents[sameEventKeys[0]].timestamp}ms`);
    }
    return true;
  }
  
  // 记录本次事件
  lastEvents[key] = { content, timestamp: now, count: 1 };
  
  // 清理过期事件记录
  setTimeout(() => {
    delete lastEvents[key];
  }, 5000);
  
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
  if (!DEBUG_MODE) return;
  
  // 检查是否为允许的事件
  if (!ALLOWED_EVENTS.includes(eventName)) {
    console.log(`🚫 忽略未配置的事件: ${eventName}`);
    return;
  }
  
  console.group(`📊 埋点事件: ${eventName}`);
  console.log(`📝 内容: ${data.content.substring(0, 50)}${data.content.length > 50 ? '...' : ''}`);
  console.log(`📏 长度: ${data.input_length}`);
  console.log(`🏠 页面: ${data.page}`);
  console.log(`🕒 时间: ${new Date(data.timestamp).toLocaleTimeString()}`);
  console.log(`👤 用户ID: ${data.distinct_id}`);
  if (data.room_id) console.log(`🔑 房间ID: ${data.room_id}`);
  console.groupEnd();
};

export const useInputTracking = (roomId?: number) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // 记录已触发事件，避免重复
  const eventTracked = useRef<{[key: string]: boolean}>({});

  const getTrackingData = useCallback((content: string, eventName: string): TrackingData => {
    const userId = getUserId();
    
    return {
      // 关键字段，与SpringBoot @RequestBody Map<String, Object> payload 匹配
      event: eventName,  // SpringBoot控制器会从这里提取事件名
      // 明确设置distinct_id到根级别
      distinct_id: userId,
      // 以下字段将被自动放入properties
      content,
      input_length: content.length,
      page: window.location.pathname,
      timestamp: Date.now(),
      room_id: roomId,
      platform: 'web',
      device_type: 'browser',
      module: 'chat'
    };
  }, [roomId]);

  // 通用的埋点发送函数，集中处理重复检查
  const trackEvent = useCallback((eventName: string, content: string) => {
    // 检查是否为允许的事件
    if (!ALLOWED_EVENTS.includes(eventName)) {
      if (DEBUG_MODE) console.log(`🚫 不跟踪事件: ${eventName}`);
      return;
    }
    
    // 防止重复发送同一事件
    if (isDuplicateEvent(eventName, content)) {
      return;
    }
    
    const data = getTrackingData(content, eventName);
    sensors.track(eventName, data);
    logTracking(eventName, data);
  }, [getTrackingData]);

  // 恢复typing处理函数的功能
  const handleTyping = useCallback((content: string) => {
    if (!content.trim()) return;
    
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      trackEvent('chat_input_typing', content);
    }, DEBOUNCE_TIME.chat_input_typing);
  }, [trackEvent]);

  // 保持blur处理函数的移除
  const handleBlur = useCallback((content: string) => {
    // 不再发送blur事件，直接返回
    return;
  }, []);

  const handleBeforeSend = useCallback((content: string) => {
    if (!content.trim()) return;
    trackEvent('chat_input_before_send', content);
  }, [trackEvent]);

  const handleSend = useCallback((content: string) => {
    if (!content.trim()) return;
    
    handleBeforeSend(content);
    trackEvent('chat_input_sent', content);
    
    if (DEBUG_MODE) {
      console.log('🚀 消息已发送并埋点完成:', content.substring(0, 30));
    }
  }, [trackEvent, handleBeforeSend]);

  // 添加一个用于接收消息的埋点方法
  const handleMessageReceived = useCallback((content: string, senderId: number) => {
    if (!content.trim()) return;
    
    // 这里需要特殊处理，因为需要添加sender_id
    // 检查是否为允许的事件
    const eventName = 'chat_message_received';
    if (!ALLOWED_EVENTS.includes(eventName)) {
      if (DEBUG_MODE) console.log(`🚫 不跟踪事件: ${eventName}`);
      return;
    }
    
    // 防止重复发送同一事件
    if (isDuplicateEvent(eventName, `${content}_${senderId}`)) {
      return;
    }
    
    const data = {
      ...getTrackingData(content, eventName),
      sender_id: senderId
    };
    sensors.track(eventName, data);
    logTracking(eventName, data);
  }, [getTrackingData]);

  return {
    handleTyping,
    handleBlur,
    handleBeforeSend,
    handleSend,
    handleMessageReceived
  };
}; 