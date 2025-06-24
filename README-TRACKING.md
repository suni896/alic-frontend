## 埋点数据分析

### 埋点系统中的 `distinct_id` 字段用于唯一标识用户，这是一个重要的字段，有以下几点需要注意：

### 1. 数据结构要求
```json
{"event": "chat_input_typing",
   "distinct_id": "用户ID", // 根级别

   "properties": {
      "distinct_id": "用户ID", // properties内也需要
      "content": "用户输入的内容",
      "input_length": 10,
      "page": "/room/123",
      "timestamp": 1750256493206,
      "input_action": "add", // 新增字段，标记是增加还是删除操作
      "max_length": 50 // 新增字段，记录会话中的最大长度
   }}
```

### timestamp	行为发生时间	比如点击、浏览、曝光等事件实际发生的时刻
### track_time	埋点/事件被触发时打点的时间	比如 SDK 在将事件打包准备发送时打的时间


## 埋点触发条件

目前系统中只保留了一个埋点事件：`chat_input_typing`，这个事件的触发条件如下：
## 允许的埋点事件

系统目前配置了以下允许的埋点事件： 尝试过多种事件 都会产生数据重复 目前只保留一个

```typescript
const ALLOWED_EVENTS = [
'chat_input_typing', // 用户正在输入
// 'chat_input_blur', // 输入框失去焦点 (已删除)
//'chat_input_before_send', // 发送前处理
//'chat_input_sent', // 消息已发送
//'chat_message_received' // 接收到新消息
];
```

3. **重复检测**：
   - 系统有多层重复检测机制，确保相同内容的埋点不会在短时间内重复发送
   - 包括全局级重复检测和事件级重复检测

## 埋点加入队列的条件

当埋点事件通过上述触发条件后，会加入埋点队列，具体条件包括：

1. **事件类型必须在允许列表中**：
   - 只有 `chat_input_typing` 事件在 `ALLOWED_EVENTS` 列表中
   - 其他事件类型会被自动忽略

2. **通过时间间隔节流检查**：
   - 相同类型的事件至少间隔 2 秒才能再次加入队列
   - 代码：
   ```tsx
   const now = Date.now();
   const lastTime = lastEventTime.current[eventName] || 0;
   const minInterval = eventName === 'chat_input_typing' ? 2000 : 500;
   
   if (now - lastTime < minInterval) {
     if (DEBUG_MODE) console.log(`⏱️ 组件级节流: ${eventName} 事件间隔过短...`);
     return;
   }
   ```

3. **通过重复事件检查**：
   - 使用事件内容和房间ID等生成唯一指纹，避免重复事件
   - 防止相同内容在短时间内多次发送

4. **事件成功添加后**：
   - 调用 `sensors.track(eventName, data)` 将事件加入队列
   - 记录事件的时间戳和指纹，用于后续重复检测
   - 每次添加埋点时，会自动在控制台显示当前队列中的所有事件（通过添加的 `dumpQueue` 功能）

## 埋点队列发送到后端的条件

埋点队列中的事件会在以下情况下发送到后端的 `/api/track` 接口：

1. **队列达到最大容量时**：
   - 当队列中的事件数量达到 `BATCH_CONFIG.MAX_BATCH_SIZE`（10条）时自动发送
   ```tsx
   if (eventQueue.length >= BATCH_CONFIG.MAX_BATCH_SIZE) {
     if (DEBUG_MODE) {
       console.log(`📦 队列达到最大容量 ${BATCH_CONFIG.MAX_BATCH_SIZE}，准备发送批量事件`);
     }
     flushEvents();
   }
   ```

2. **定时发送机制**：
   - 即使队列未满，也会每隔 `BATCH_CONFIG.FLUSH_INTERVAL_MS`（180000毫秒，即3分钟）触发一次发送
   ```tsx
   flushTimerId = setTimeout(() => {
     if (DEBUG_MODE) {
       console.log(`⏱️ 定时器触发，准备发送批量事件，队列长度: ${eventQueue.length}`);
     }
     flushEvents();
   }, BATCH_CONFIG.FLUSH_INTERVAL_MS);
   ```

3. **页面卸载前**：
   - 当用户关闭页面或离开应用时，会尝试发送队列中的所有未发送事件
   ```tsx
   window.addEventListener('beforeunload', () => {
     if (eventQueue.length > 0) {
       if (DEBUG_MODE) {
         console.log(`🏁 页面即将卸载，发送剩余的 ${eventQueue.length} 个事件`);
       }
       navigator.sendBeacon('http://localhost:8080/api/track/batch', JSON.stringify(eventQueue));
     }
   });
   ```

4. **发送失败的重试机制**：
   - 如果埋点发送失败，会加入失败队列，并在一定时间后（`BATCH_CONFIG.RETRY_INTERVAL_MS`，5秒）尝试重新发送
   - 最多重试 `BATCH_CONFIG.MAX_RETRY_ATTEMPTS`（3次）次

## 配置项

埋点系统的主要配置参数：

```typescript
const BATCH_CONFIG = {
   MAX_BATCH_SIZE: 10, // 最大批量事件数量
   FLUSH_INTERVAL_MS: 180000, // 强制发送间隔，3分钟
   MAX_RETRY_ATTEMPTS: 3, // 最大重试次数
   RETRY_INTERVAL_MS: 5000, // 重试间隔，5秒
};

// 增加和删除操作使用不同的防抖时间
const DEBOUNCE_TIME = {
  chat_input_typing_add: 3000,     // 增加内容时等待更长时间，只保留最终状态
  chat_input_typing_delete: 1000,  // 删除操作更快记录
};
```

## 调试模式

设置`DEBUG_MODE = true`可以在控制台看到详细的埋点日志，包括：

- 事件进入队列
- 批量发送
- 重试情况
- 去重过滤 
- 操作类型(增加/删除)和最大长度信息


## 埋点接口CORS配置指南

当前项目需要与后端埋点服务通信。如果出现CORS错误，请在SpringBoot后端做以下修改：

### 1. 修改TrackingController的CORS配置

将：
```java
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*") 
```

改为：
```java
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "false")
```

或者，如果需要使用credentials:

```java
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
