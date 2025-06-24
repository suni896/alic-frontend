import sensors from 'sa-sdk-javascript';

// 声明扩展接口
interface SensorsDebug {
  logEvents: () => void;
  testTrack: (eventName: string, data: Record<string, any>) => void;
  dumpQueue: () => number;
  clearQueue: () => number;
}

// 扩展sensors类型
declare module 'sa-sdk-javascript' {
  interface SensorsAnalyticsType {
    debug?: SensorsDebug;
    getPreLoginInfo?: () => any;
  }
}

// 是否开启调试模式
const DEBUG_MODE = true;

// 增强从各种来源获取用户ID的函数
const detectUserId = (): string => {
  try {
    // 1. 从localStorage尝试获取
    const localId = localStorage.getItem('userId') || localStorage.getItem('user_id');
    if (localId) {
      console.log('📋 从localStorage获取userId:', localId);
      return localId;
    }
    
    // 2. 从sessionStorage尝试获取
    const sessionId = sessionStorage.getItem('userId') || sessionStorage.getItem('user_id');
    if (sessionId) {
      console.log('📋 从sessionStorage获取userId:', sessionId);
      return sessionId;
    }
    
    // 3. 从jwtToken获取
    const jwtToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
    if (jwtToken) {
      console.log('📋 尝试从JWT获取userId');
      try {
        const base64Url = jwtToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        const id = payload.userId || payload.sub;
        if (id) {
          console.log('📋 从JWT成功解析userId:', id);
          return id;
        }
      } catch (e) {
        console.warn('无法解析JWT', e);
      }
    }
    
    // 4. 从全局变量获取
    if ((window as any).userInfo?.userId) {
      const id = (window as any).userInfo.userId;
      console.log('📋 从window.userInfo获取userId:', id);
      return id;
    }
    
    console.warn('⚠️ 无法获取有效的userId，使用anonymous');
    return 'anonymous';
  } catch (e) {
    console.error('获取userId时出错:', e);
    return 'anonymous';
  }
};

// 更强力的防重复机制
const sentEventsWithContent = new Map();
let lastSendTime = 0;

// 限制每个事件在特定时间窗口内只能发送一次
const EVENT_THROTTLE_MS = {
  'chat_input_typing': 2000,  // 输入事件节流2秒
  // 以下事件均已移除
  // 'chat_input_blur': 1000,
  // 'chat_input_before_send': 1000,
  // 'chat_input_sent': 1000,
  // 'chat_message_received': 1000
};

// 批量处理和定时上传相关配置
const BATCH_CONFIG = {
  MAX_BATCH_SIZE: 10,       // 最大批量事件数量
  FLUSH_INTERVAL_MS: 180000, // 强制发送间隔，3分钟
  MAX_RETRY_ATTEMPTS: 3,    // 最大重试次数
  RETRY_INTERVAL_MS: 5000,  // 重试间隔，5秒
};

// 事件队列和状态
const eventQueue: any[] = [];
let flushTimerId: ReturnType<typeof setTimeout> | null = null;
let isProcessingBatch = false;
const failedBatches: Array<{ data: any[], attempts: number, lastAttempt: number }> = [];

// 增强的重复检测 - 使用事件内容的哈希值进行比较
const getEventFingerprint = (data: any): string => {
  try {
    const { event, content, _track_time, timestamp } = data;
    // 提取关键字段生成指纹
    const keyFields = {
      event,
      content: content?.substring(0, 30) || '',
      roomId: data.room_id || data.roomId || data.properties?.room_id || 0
    };
    return `${event}_${JSON.stringify(keyFields)}`;
  } catch (e) {
    return `${data.event || 'unknown'}_${Date.now()}`;
  }
};

// 检查队列中是否已存在相同事件
const isDuplicateInQueue = (data: any): boolean => {
  const fingerprint = getEventFingerprint(data);
  
  // 检查队列中是否有相同指纹的事件
  const hasDuplicate = eventQueue.some(item => getEventFingerprint(item) === fingerprint);
  
  if (hasDuplicate && DEBUG_MODE) {
    console.warn(`🔍 检测到重复事件 [${data.event}]，已在队列中存在，不再添加`);
    console.log(`🔍 事件指纹: ${fingerprint}`);
  }
  
  return hasDuplicate;
};

// 添加事件到队列
const queueEvent = (data: any) => {
  // 增强的重复检测
  if (isDuplicateInQueue(data)) {
    return;
  }
  
  eventQueue.push(data);
  
  if (DEBUG_MODE) {
    console.log(`📦 事件已加入队列: ${data.event}，队列长度: ${eventQueue.length}`);
  }
  
  // 如果队列达到最大批量大小，立即触发发送
  if (eventQueue.length >= BATCH_CONFIG.MAX_BATCH_SIZE) {
    if (DEBUG_MODE) {
      console.log(`📦 队列达到最大容量 ${BATCH_CONFIG.MAX_BATCH_SIZE}，准备发送批量事件`);
    }
    flushEvents();
  }
  
  // 如果定时器未启动，启动定时器
  if (!flushTimerId) {
    startFlushTimer();
  }
};

// 启动定时发送计时器
const startFlushTimer = () => {
  if (flushTimerId) {
    clearTimeout(flushTimerId);
  }
  
  flushTimerId = setTimeout(() => {
    if (DEBUG_MODE) {
      console.log(`⏱️ 定时器触发，准备发送批量事件，队列长度: ${eventQueue.length}`);
    }
    flushEvents();
  }, BATCH_CONFIG.FLUSH_INTERVAL_MS);
  
  if (DEBUG_MODE) {
    console.log(`⏱️ 定时器已启动，${BATCH_CONFIG.FLUSH_INTERVAL_MS / 1000}秒后自动发送`);
  }
};

// 处理重试失败的批次
const processFailedBatches = () => {
  if (failedBatches.length === 0 || isProcessingBatch) return;
  
  const now = Date.now();
  const batchToRetry = failedBatches.find(batch => 
    now - batch.lastAttempt >= BATCH_CONFIG.RETRY_INTERVAL_MS && 
    batch.attempts < BATCH_CONFIG.MAX_RETRY_ATTEMPTS
  );
  
  if (batchToRetry) {
    batchToRetry.attempts++;
    batchToRetry.lastAttempt = now;
    
    if (DEBUG_MODE) {
      console.log(`🔄 重试发送批量事件, 第${batchToRetry.attempts}次尝试，事件数: ${batchToRetry.data.length}`);
    }
    
    sendBatchToServer(batchToRetry.data, true)
      .then(success => {
        if (success) {
          // 从失败列表中移除
          const index = failedBatches.indexOf(batchToRetry);
          if (index !== -1) {
            failedBatches.splice(index, 1);
            
            if (DEBUG_MODE) {
              console.log(`✅ 批量事件重试成功，从失败列表移除`);
            }
          }
        } else if (batchToRetry.attempts >= BATCH_CONFIG.MAX_RETRY_ATTEMPTS) {
          // 达到最大重试次数，放弃这批数据
          const index = failedBatches.indexOf(batchToRetry);
          if (index !== -1) {
            failedBatches.splice(index, 1);
            
            console.error(`❌ 批量事件达到最大重试次数 ${BATCH_CONFIG.MAX_RETRY_ATTEMPTS}，放弃发送`);
            console.error('❌ 放弃的数据:', batchToRetry.data);
          }
        }
        
        // 检查处理下一个失败的批次
        setTimeout(processFailedBatches, 100);
      });
  }
};

// 启动处理失败批次的定时任务
setInterval(processFailedBatches, BATCH_CONFIG.RETRY_INTERVAL_MS / 2);

// 立即发送所有队列中的事件
const flushEvents = () => {
  if (eventQueue.length === 0 || isProcessingBatch) return;
  
  if (flushTimerId) {
    clearTimeout(flushTimerId);
    flushTimerId = null;
  }
  
  const eventsToSend = [...eventQueue];
  eventQueue.length = 0; // 清空队列
  
  if (DEBUG_MODE) {
    console.log(`📤 准备发送批量事件，数量: ${eventsToSend.length}`);
  }
  
  sendBatchToServer(eventsToSend);
  
  // 重新启动定时器处理新事件
  startFlushTimer();
};

// 向服务器发送批量事件
const sendBatchToServer = (events: any[], isRetry = false): Promise<boolean> => {
  if (events.length === 0) return Promise.resolve(true);
  
  isProcessingBatch = true;
  
  // 如果只有一个事件，使用原来的发送方式
  if (events.length === 1) {
    return sendSingleEvent(events[0])
      .finally(() => {
        isProcessingBatch = false;
      });
  }
  
  // 处理批量事件
  // 确保每个事件都有正确的格式和用户ID
  const batchData = events.map(event => {
    const userId = event.distinct_id || detectUserId();
    const adaptedEvent: {
      event: string;
      properties: Record<string, any>;
      distinct_id: string;
    } = {
      event: event.event || 'unknown_event',
      properties: {},
      distinct_id: userId
    };
    
    // 将所有其他属性移到properties中
    for (const key in event) {
      if (key !== 'event' && key !== 'distinct_id') {
        adaptedEvent.properties[key] = event[key];
      }
    }
    
    // 确保properties中也有distinct_id
    adaptedEvent.properties.distinct_id = userId;
    return adaptedEvent;
  });
  
  if (DEBUG_MODE) {
    console.group(isRetry ? '🔄 重试发送批量事件' : '📤 发送批量事件');
    console.log(`批量大小: ${batchData.length} 个事件`);
    console.log('第一个事件:', batchData[0]);
    console.log('最后一个事件:', batchData[batchData.length - 1]);
    console.groupEnd();
  }
  
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:8080/api/track/batch', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');
    
    xhr.onload = function() {
      isProcessingBatch = false;
      
      if (xhr.status >= 200 && xhr.status < 300) {
        if (DEBUG_MODE) {
          console.log(`✅ 批量事件发送成功: ${batchData.length}个事件`);
        }
        resolve(true);
      } else {
        console.error(`❌ 批量事件发送失败, 状态码: ${xhr.status}`);
        
        // 将失败的批次加入重试队列
        if (!isRetry) {
          failedBatches.push({
            data: events,
            attempts: 1,
            lastAttempt: Date.now()
          });
          
          if (DEBUG_MODE) {
            console.log(`🔄 已将批量事件添加到失败队列，将在${BATCH_CONFIG.RETRY_INTERVAL_MS/1000}秒后重试`);
          }
        }
        
        resolve(false);
      }
    };
    
    xhr.onerror = function() {
      isProcessingBatch = false;
      console.error('❌ 批量埋点网络错误');
      
      // 将失败的批次加入重试队列
      if (!isRetry) {
        failedBatches.push({
          data: events,
          attempts: 1,
          lastAttempt: Date.now()
        });
        
        if (DEBUG_MODE) {
          console.log(`🔄 网络错误，已将批量事件添加到失败队列，将在${BATCH_CONFIG.RETRY_INTERVAL_MS/1000}秒后重试`);
        }
      }
      
      resolve(false);
    };
    
    try {
      xhr.send(JSON.stringify(batchData));
    } catch (error) {
      isProcessingBatch = false;
      console.error('❌ 发送批量埋点数据错误:', error);
      
      // 将失败的批次加入重试队列
      if (!isRetry) {
        failedBatches.push({
          data: events,
          attempts: 1,
          lastAttempt: Date.now()
        });
      }
      
      resolve(false);
    }
  });
};

// 发送单个事件的函数 (作为备选方案)
const sendSingleEvent = (data: any): Promise<boolean> => {
  try {
    const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
    
    // 再次尝试获取用户ID
    const userId = jsonData.distinct_id || detectUserId();
    
    // 严格的重复事件检测
    const now = Date.now();
    const eventName = jsonData.event;
    const content = jsonData.content || '';
    
    // 生成事件唯一键，包含事件名和内容摘要
    const eventKey = `${eventName}-${content.substring(0, 20)}-${userId}`;
    
    // 检查全局节流 - 所有事件至少间隔100ms
    if (now - lastSendTime < 100) {
      if (DEBUG_MODE) {
        console.log(`⏱️ 全局节流：埋点事件过于频繁，忽略本次事件 ${eventName}`);
      }
      return Promise.resolve(false);
    }
    
    // 检查特定事件类型的节流
    const throttleTime = EVENT_THROTTLE_MS[eventName as keyof typeof EVENT_THROTTLE_MS] || 1000;
    const lastSentEvent = sentEventsWithContent.get(eventKey);
    
    if (lastSentEvent && now - lastSentEvent < throttleTime) {
      if (DEBUG_MODE) {
        console.log(`🔄 忽略重复事件: ${eventName}，内容: ${content.substring(0, 10)}...，间隔: ${now - lastSentEvent}ms`);
      }
      return Promise.resolve(false);
    }
    
    // 更新事件发送记录
    sentEventsWithContent.set(eventKey, now);
    lastSendTime = now;
    
    // 清理过期的事件记录，避免内存泄漏
    if (sentEventsWithContent.size > 100) {
      const keysToDelete: string[] = [];
      sentEventsWithContent.forEach((timestamp, key) => {
        if (now - timestamp > 60000) { // 删除1分钟前的记录
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => sentEventsWithContent.delete(key));
    }
    
    // 适配SpringBoot接口格式
    const adaptedData: {
      event: string;
      properties: Record<string, any>;
      distinct_id: string; // 必须有这个字段
    } = {
      event: jsonData.event || 'unknown_event',
      properties: {},
      distinct_id: userId
    };
    
    // 将所有其他属性移到properties中
    for (const key in jsonData) {
      if (key !== 'event' && key !== 'distinct_id') { // 不要将distinct_id放入properties中
        adaptedData.properties[key] = jsonData[key];
      }
    }
    
    // 确保properties中也有distinct_id副本
    adaptedData.properties.distinct_id = userId;
    
    if (DEBUG_MODE) {
      console.group('🔄 单个埋点数据准备发送');
      console.log('事件名称:', adaptedData.event);
      console.log('用户ID:', adaptedData.distinct_id);
      console.log('完整数据:', adaptedData);
      console.groupEnd();
    }
    
    // 使用XMLHttpRequest代替fetch，避免复杂的CORS问题
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:8080/api/track', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (DEBUG_MODE) {
            console.log('✅ 单个埋点数据发送成功:', xhr.responseText);
          }
          resolve(true);
        } else {
          console.error('❌ 单个埋点请求失败, 状态码:', xhr.status);
          resolve(false);
        }
      };
      
      xhr.onerror = function() {
        console.error('❌ 单个埋点网络错误');
        resolve(false);
      };
      
      try {
        xhr.send(JSON.stringify(adaptedData));
      } catch (error) {
        console.error('❌ 发送单个埋点数据错误:', error);
        resolve(false);
      }
    });
  } catch (e) {
    console.error('埋点数据处理错误:', e);
    return Promise.resolve(false);
  }
};

// 定义自定义传输适配器
const customSendData = (data: any) => {
  try {
    // 将事件加入队列，而不是立即发送
    queueEvent(data);
    return Promise.resolve(true);
  } catch (e) {
    console.error('埋点数据处理错误:', e);
    return Promise.resolve(false);
  }
};

// 初始化埋点SDK
console.log('🔧 正在初始化埋点SDK...');

try {
  sensors.init({
    server_url: 'http://localhost:8080/api/track',
    show_log: DEBUG_MODE,     // 开发阶段打印日志
    heatmap: {},              // 可选，点击/页面热图
    is_track_single_page: true, // 单页应用模式
    use_client_time: true,    // 使用客户端时间

    // 完全自定义发送方式，以解决Content-Type问题
    send_type: 'none',        // 禁用默认发送
    callback_timeout: 5000,
    debug_mode: DEBUG_MODE ? 2 : 0, // 设置为2可以在控制台看到更多信息
    
    // 禁用所有自动埋点，只保留手动埋点
    // 这样可以避免生成$pageview, $WebClick, $WebStay等事件
    auto_track: false,
    heatmap_url: ''  // 禁用热图
  });

  // 重写埋点发送函数
  const originalTrack = sensors.track;
  sensors.track = function(event: string, properties?: Record<string, any>) {
    // 过滤掉自动生成的事件
    if (event.startsWith('$') || event === 'test_connection') {
      if (DEBUG_MODE) {
        console.log(`🚫 忽略系统事件: ${event}`);
      }
      return; // 不处理以$开头的系统事件和测试事件
    }
    
    if (DEBUG_MODE) {
      console.group('📊 埋点事件:', event);
      console.log('属性:', properties);
      console.groupEnd();
    }
    
    // 调用原始track，但不会发送
    originalTrack.call(sensors, event, properties);
    
    // 使用自定义方法发送
    const data = {
      event,
      ...properties,
      _track_time: Date.now()
    };
    
    customSendData(data);
  };

  // 设置自定义属性
  sensors.registerPage({
    environment: process.env.NODE_ENV || 'development',
    app_version: '1.0.0',
    page_type: 'chat'
  });

  // 不再自动跟踪页面浏览
  // sensors.quick('autoTrack');
  
  if (DEBUG_MODE) {
    console.log('✅ 埋点SDK初始化成功');
    
    // 埋点SDK自定义扩展方法
    (sensors as any).debug = {
      // 输出所有事件
      logEvents: () => {
        console.log('🔍 所有已发送事件:', (sensors as any).getPreLoginInfo?.() || '无事件');
      },
      // 测试埋点方法
      testTrack: (eventName: string, data: Record<string, any>) => {
        console.log(`🧪 测试埋点: ${eventName}`, data);
        sensors.track(eventName, data);
      },
      // 新增：打印当前队列内容
      dumpQueue: () => {
        console.group('🔍 当前埋点队列内容');
        console.log(`队列长度: ${eventQueue.length}`);
        
        if (eventQueue.length > 0) {
          console.table(eventQueue.map(item => ({
            event: item.event,
            content: item.content?.substring(0, 20) || '无内容',
            timestamp: new Date(item._track_time || item.timestamp || Date.now()).toLocaleTimeString(),
            fingerprint: getEventFingerprint(item)
          })));
        } else {
          console.log('队列为空');
        }
        
        if (failedBatches.length > 0) {
          console.log(`失败批次: ${failedBatches.length}`);
          failedBatches.forEach((batch, index) => {
            console.log(`批次 #${index+1}: ${batch.data.length}个事件, 尝试次数: ${batch.attempts}`);
          });
        }
        
        console.groupEnd();
        return eventQueue.length;
      },
      // 新增：清空当前队列
      clearQueue: () => {
        const count = eventQueue.length;
        eventQueue.length = 0;
        console.log(`🧹 已清空埋点队列，共移除${count}个事件`);
        return count;
      }
    };
    
    // 移除自动测试连接代码
    // setTimeout(() => {
    //   sensors.track('test_connection', {
    //     message: 'Testing connection to SpringBoot endpoint',
    //     timestamp: Date.now()
    //   });
    // }, 2000);
  }
  
  // 页面卸载前尝试发送所有队列中的事件
  window.addEventListener('beforeunload', () => {
    if (eventQueue.length > 0) {
      if (DEBUG_MODE) {
        console.log(`🏁 页面即将卸载，发送剩余的 ${eventQueue.length} 个事件`);
      }
      // 同步发送，不使用异步
      navigator.sendBeacon('http://localhost:8080/api/track/batch', JSON.stringify(eventQueue));
    }
  });
} catch (error) {
  console.error('❌ 埋点SDK初始化失败:', error);
}

export default sensors;
export { flushEvents, eventQueue };  // 导出队列和刷新函数，可以在特定时刻手动触发发送 