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

## 最新埋点规则 (2023年11月更新)

系统实现了完全优化的埋点规则，具体如下：

1. **内容增加操作**:
   - 当用户持续增加输入内容时，系统会记录但不立即发送埋点数据
   - 只在以下情况发送埋点数据:
     - 用户停止输入一段时间后(3秒)
     - 用户发送消息前
     - 用户关闭网页前

2. **内容删除操作**:
   - 当用户删除内容时，系统会立即记录删除操作
   - 删除操作会包含当前内容和最大长度信息，便于分析用户输入行为
   - 无需达到任何删除量阈值，任何长度的删除操作都会被记录
   - 删除操作使用1000ms的时间间隔控制，避免过于频繁的记录

3. **内容长度要求**:
   - 系统只记录有意义的输入内容，必须满足以下条件之一：
     - 超过2个中文字符
     - 超过2个英文单词
     - 总字符数超过10个
   - 不满足条件的短内容不会被记录，减少无效数据

4. **内容变化差异要求**:
   - 系统会对比上次记录的内容和当前内容的差异
   - 只有满足以下条件之一时才会记录新的埋点：
     - 中文字符数量差异 ≥ 2
     - 英文单词数量差异 ≥ 2
     - 总字符长度差异 ≥ 5
   - 变化不够大的内容不会被重复记录，避免冗余数据

5. **特殊状态记录**:
   - 系统会记录用户输入过程中的最大内容长度(`max_length`)
   - 使用`input_action`字段区分增加操作(`add`)和删除操作(`delete`)

## 内容长度判断逻辑

系统使用以下逻辑判断内容是否满足记录条件：

```typescript
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
```

## 内容变化差异判断逻辑

系统使用以下逻辑判断内容变化是否足够大：

```typescript
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
```

## 埋点触发详情

1. **输入框输入文字时**：
   - 在 `MyRoom.tsx` 中，当用户在消息输入框中输入文字时，会调用 `handleTyping()` 函数
   - 对于增加操作，系统会等待用户停止输入后再记录
   - 对于删除操作，系统会立即记录任何删除行为，无需阈值条件
   - 所有操作都必须满足内容长度要求和变化差异要求

2. **发送消息前记录最终状态**：
   ```tsx
   const handleSend = useCallback((content: string) => {
     if (!content.trim()) return;
     
     // 发送前记录最终输入状态
     if (lastInputContent.current.trim().length > 0) {
       const finalData = getTrackingData(
         lastInputContent.current,
         'chat_input_typing',
         'add'
       );
       
       // 添加最大长度信息
       finalData.max_length = maxInputLength.current;
       
       sensors.track('chat_input_typing', finalData);
     }
     
     // 重置状态...
   }, [getTrackingData]);
   ```

3. **重复检测**：
   - 系统有多层重复检测机制，确保相同内容的埋点不会在短时间内重复发送
   - 包括全局级重复检测和事件级重复检测
   - 增加了内容变化差异检测，确保只有变化足够大的内容才会被记录

## 埋点加入队列的条件

当埋点事件通过上述触发条件后，会加入埋点队列，具体条件包括：

1. **事件类型必须在允许列表中**：
   - 只有 `chat_input_typing` 事件在 `ALLOWED_EVENTS` 列表中
   - 其他事件类型会被自动忽略

2. **内容必须满足长度要求**：
   - 通过 `isContentEligible()` 函数验证内容是否有效
   - 内容太短会被忽略，控制台会显示相应日志

3. **内容变化必须足够大**：
   - 通过 `isChangeSufficient()` 函数验证与上次记录的内容相比，变化是否足够大
   - 变化不够大的内容会被忽略，控制台会显示相应日志

4. **通过时间间隔节流检查**：
   - 相同类型的事件至少间隔指定时间才能再次加入队列
   - 增加操作: 3000ms
   - 删除操作: 1000ms

5. **事件成功添加后**：
   - 更新 `lastRecordedContent.current` 为当前内容，用于后续变化比较
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
  chat_input_typing_add: 3000,     // 增加内容时等待3秒，只保留最终状态
  chat_input_typing_delete: 1000,  // 删除操作1000ms内记录
};
```

## 调试模式

设置`DEBUG_MODE = true`可以在控制台看到详细的埋点日志，包括：

- 事件进入队列
- 批量发送
- 重试情况
- 去重过滤 
- 操作类型(增加/删除)和最大长度信息
- 内容长度检查信息
- 内容变化差异检查信息


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
```
