import sensors from 'sa-sdk-javascript';

// 声明扩展接口
interface SensorsDebug {
  logEvents: () => void;
  testTrack: (eventName: string, data: Record<string, any>) => void;
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
  // 'chat_input_blur': 1000,  // 已不再需要
  'chat_input_before_send': 1000,
  'chat_input_sent': 1000,
  'chat_message_received': 1000
};

// 定义自定义传输适配器
const customSendData = (data: any) => {
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
      console.group('🔄 埋点数据准备发送');
      console.log('事件名称:', adaptedData.event);
      console.log('用户ID:', adaptedData.distinct_id);
      console.log('完整数据:', adaptedData);
      console.groupEnd();
    }
    
    // 使用XMLHttpRequest代替fetch，避免复杂的CORS问题
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:8080/api/track', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      
      // 不设置withCredentials以避免CORS问题
      // xhr.withCredentials = true;
      
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (DEBUG_MODE) {
            console.log('✅ 埋点数据发送成功:', xhr.responseText);
          }
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } catch (e) {
            resolve({ status: 'success' });
          }
        } else {
          console.error('❌ 埋点请求失败, 状态码:', xhr.status);
          reject(new Error('XHR请求失败: ' + xhr.status));
        }
      };
      
      xhr.onerror = function() {
        console.error('❌ 埋点网络错误');
        reject(new Error('网络请求错误'));
      };
      
      try {
        xhr.send(JSON.stringify(adaptedData));
      } catch (error) {
        console.error('❌ 发送埋点数据错误:', error);
        reject(error);
      }
    }).catch(error => {
      console.error('❌ 埋点数据发送失败:', error);
      console.error('❌ 失败的数据:', adaptedData);
      return false;
    });
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
    sensors.debug = {
      // 输出所有事件
      logEvents: () => {
        console.log('🔍 所有已发送事件:', sensors.getPreLoginInfo?.() || '无事件');
      },
      // 测试埋点方法
      testTrack: (eventName: string, data: Record<string, any>) => {
        console.log(`🧪 测试埋点: ${eventName}`, data);
        sensors.track(eventName, data);
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
} catch (error) {
  console.error('❌ 埋点SDK初始化失败:', error);
}

export default sensors; 