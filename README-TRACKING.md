## 埋点数据分析

### 埋点配置文件

埋点系统现在使用集中式配置文件 `src/utils/trackConfig.ts` 管理所有埋点相关的配置项。通过这个配置文件，可以方便地控制埋点功能的开启/关闭、调试信息的显示、埋点服务器地址等。

主要配置项包括：

```typescript
// 调试模式配置
export const DEBUG_CONFIG = {
  // 是否开启调试模式
  ENABLED: true,
  // 是否在控制台打印埋点信息
  CONSOLE_LOG: true,
  // 是否显示详细日志
  VERBOSE: true,
  // 是否在控制台显示队列内容
  SHOW_QUEUE: true,
  // 是否在控制台显示发送结果
  SHOW_SEND_RESULT: true,
};

// 埋点功能开关
export const FEATURE_CONFIG = {
  // 是否启用埋点功能
  ENABLED: true,
  // 是否启用内容包含关系检测
  CONTENT_CONTAIN_CHECK: true,
  // 是否启用内容长度检查
  CONTENT_LENGTH_CHECK: true,
  // 是否启用内容变化差异检查
  CONTENT_DIFF_CHECK: true,
  // 是否启用自动打印队列
  AUTO_DUMP_QUEUE: true,
  // 是否在发送消息时触发批量埋点
  SEND_MESSAGE_TRIGGER: true,
};

// 服务器配置
export const SERVER_CONFIG = {
  // 埋点接口地址
  TRACK_URL: "http://localhost:8080/api/track",
  // 批量埋点接口地址
  BATCH_TRACK_URL: "http://localhost:8080/api/track/batch",
  // 请求超时时间（毫秒）
  TIMEOUT_MS: 5000,
};
```

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

系统实现了完全优化的埋点规则，现在可以通过配置文件灵活控制这些规则的开启/关闭。具体如下：

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
   - 可通过配置文件中的 `CONTENT_LENGTH_CHECK` 开关控制此功能，阈值可在 `CONTENT_CHECK_CONFIG` 中调整

4. **内容变化差异要求**:
   - 系统会对比上次记录的内容和当前内容的差异
   - 只有满足以下条件之一时才会记录新的埋点：
     - 中文字符数量差异 ≥ 2
     - 英文单词数量差异 ≥ 2
     - 总字符长度差异 ≥ 5
   - 变化不够大的内容不会被重复记录，避免冗余数据
   - 可通过配置文件中的 `CONTENT_DIFF_CHECK` 开关控制此功能，差异阈值可在 `CONTENT_CHECK_CONFIG` 中调整

5. **智能内容包含关系检测**:
   - 系统会检查当前记录的数据与队列中最后一条数据的内容关系
   - 对于增加操作：如果存在包含关系，则替换队列中的最后一条数据，只保留最新的数据
   - 对于删除操作：
     - 如果新内容包含旧内容，则替换最后一条数据（这种情况很少见）
     - 如果旧内容包含新内容，则保留两条记录，因为这表示删除了部分内容
   - 这种智能判断确保了在删除操作时不会丢失重要的历史记录
   - 可通过配置文件中的 `CONTENT_CONTAIN_CHECK` 开关控制此功能

6. **消息发送触发批量埋点**:
   - 当用户点击发送消息按钮时，系统会将队列中的所有埋点数据一次性发送出去
   - 这确保埋点数据能够及时被服务器接收，并与用户的实际操作关联起来
   - 避免了频繁发送埋点数据的性能开销，同时保证数据的完整性
   - 可通过配置文件中的 `SEND_MESSAGE_TRIGGER` 开关控制此功能

7. **特殊状态记录**:
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

## 智能内容包含关系判断逻辑

系统使用以下逻辑判断内容包含关系，并针对不同操作类型采取不同策略：

```typescript
// 新增规则：检查当前记录的数据是否包含队列中最后一条数据
if (config.FEATURES.CONTENT_CONTAIN_CHECK && eventQueue.length > 0 && data.content && eventQueue[eventQueue.length - 1].content) {
  const lastEvent = eventQueue[eventQueue.length - 1];
  const newContent = data.content;
  const lastContent = lastEvent.content;
  
  // 检查操作类型
  const isDeleteOperation = data.input_action === 'delete';
  
  // 内容包含关系检测
  const newContainsLast = newContent.includes(lastContent);
  const lastContainsNew = lastContent.includes(newContent);
  
  // 处理包含关系逻辑
  if (newContainsLast || lastContainsNew) {
    // 对于删除操作，只有当新内容包含旧内容时才替换
    // 如果旧内容包含新内容，说明删除了部分内容，应该保留两条记录
    if (isDeleteOperation && !newContainsLast && lastContainsNew) {
      if (DEBUG_MODE && config.DEBUG.VERBOSE) {
        console.log(`🔄 删除操作: 旧内容(${lastContent.length}字符)包含新内容(${newContent.length}字符)，保留两条记录`);
        console.log(`🔍 旧内容: ${lastContent.substring(0, 30)}${lastContent.length > 30 ? '...' : ''}`);
        console.log(`🔍 新内容: ${newContent.substring(0, 30)}${newContent.length > 30 ? '...' : ''}`);
      }
      // 不做任何替换，保留两条记录
    } else {
      // 对于增加操作或新内容包含旧内容的删除操作，替换最后一条数据
      if (DEBUG_MODE && config.DEBUG.VERBOSE) {
        if (newContainsLast) {
          console.log(`🔄 新内容(${newContent.length}字符)包含旧内容(${lastContent.length}字符)，替换最后事件`);
        } else {
          console.log(`🔄 旧内容(${lastContent.length}字符)包含新内容(${newContent.length}字符)，替换最后事件`);
        }
        console.log(`🔍 旧内容: ${lastContent.substring(0, 30)}${lastContent.length > 30 ? '...' : ''}`);
        console.log(`🔍 新内容: ${newContent.substring(0, 30)}${newContent.length > 30 ? '...' : ''}`);
      }
      
      // 删除队列中的最后一条数据
      eventQueue.pop();
    }
  }
}

// 添加新事件到队列
eventQueue.push(data);
```

这种智能判断逻辑确保了：

1. 对于增加操作，如果新内容包含旧内容，只保留最新的完整版本
2. 对于删除操作，如果用户删除了部分内容（旧内容包含新内容），会保留两条记录，记录删除的历史
3. 只有在删除操作且新内容包含旧内容的罕见情况下才会替换旧记录

## 消息发送触发批量埋点机制

当用户点击发送消息按钮时，系统会将队列中的所有埋点数据一次性发送出去：

```typescript
// 发送消息前，将埋点队列中的所有埋点数据一次性发送出去
if (config.FEATURES.SEND_MESSAGE_TRIGGER && eventQueue && eventQueue.length > 0) {
  if (config.DEBUG.CONSOLE_LOG) console.log(`🚀 发送消息触发埋点批量发送: 队列长度 ${eventQueue.length}`);
  flushEvents(); // 调用flushEvents函数发送所有队列中的埋点数据
}
```

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

4. **内容包含关系检查**：
   - 通过 `isContentContained()` 函数检查新内容是否与队列中最后一条数据存在包含关系
   - 如果存在包含关系，则删除队列中的最后一条数据，只保留最新的数据

5. **通过时间间隔节流检查**：
   - 相同类型的事件至少间隔指定时间才能再次加入队列
   - 增加操作: 3000ms
   - 删除操作: 1000ms

6. **事件成功添加后**：
   - 更新 `lastRecordedContent.current` 为当前内容，用于后续变化比较
   - 调用 `sensors.track(eventName, data)` 将事件加入队列
   - 记录事件的时间戳和指纹，用于后续重复检测
   - 每次添加埋点时，会自动在控制台显示当前队列中的所有事件（通过添加的 `dumpQueue` 功能）
   - 立即触发队列发送，确保数据及时被服务器接收

## 埋点队列发送到后端的条件

埋点队列中的事件会在以下情况下发送到后端的 `/api/track` 接口：

1. **消息发送时批量发送**：
   - 当用户点击发送消息按钮时，系统会将队列中的所有埋点数据一次性发送出去
   ```typescript
   // 发送消息前，将埋点队列中的所有埋点数据一次性发送出去
   if (eventQueue && eventQueue.length > 0) {
     console.log(`🚀 发送消息触发埋点批量发送: 队列长度 ${eventQueue.length}`);
     flushEvents(); // 调用flushEvents函数发送所有队列中的埋点数据
   }
   ```

2. **队列达到最大容量时**：
   - 当队列中的事件数量达到 `BATCH_CONFIG.MAX_BATCH_SIZE`（10条）时自动发送
   ```tsx
   if (eventQueue.length >= BATCH_CONFIG.MAX_BATCH_SIZE) {
     if (DEBUG_MODE) {
       console.log(`📦 队列达到最大容量 ${BATCH_CONFIG.MAX_BATCH_SIZE}，准备发送批量事件`);
     }
     flushEvents();
   }
   ```

3. **定时发送机制**：
   - 即使队列未满，也会每隔 `BATCH_CONFIG.FLUSH_INTERVAL_MS`（180000毫秒，即3分钟）触发一次发送
   ```tsx
   flushTimerId = setTimeout(() => {
     if (DEBUG_MODE) {
       console.log(`⏱️ 定时器触发，准备发送批量事件，队列长度: ${eventQueue.length}`);
     }
     flushEvents();
   }, BATCH_CONFIG.FLUSH_INTERVAL_MS);
   ```

4. **页面卸载前**：
   - 当用户关闭页面或离开应用时，会尝试发送队列中的所有未发送事件
   ```tsx
   window.addEventListener('beforeunload', () => {
     if (config.FEATURES.ENABLED && eventQueue.length > 0) {
       if (DEBUG_MODE) {
         console.log(`🏁 页面即将卸载，发送剩余的 ${eventQueue.length} 个事件`);
       }
       navigator.sendBeacon(config.SERVER.BATCH_TRACK_URL, JSON.stringify(eventQueue));
     }
   });
   ```

5. **发送失败的重试机制**：
   - 如果埋点发送失败，会加入失败队列，并在一定时间后（`BATCH_CONFIG.RETRY_INTERVAL_MS`，5秒）尝试重新发送
   - 最多重试 `BATCH_CONFIG.MAX_RETRY_ATTEMPTS`（3次）次

## 配置项

埋点系统的主要配置参数现在统一放在 `src/utils/trackConfig.ts` 文件中管理：

```typescript
// 批量处理和定时上传相关配置
export const BATCH_CONFIG = {
  // 最大批量事件数量
  MAX_BATCH_SIZE: 10,
  // 强制发送间隔，3分钟 (180000ms)
  FLUSH_INTERVAL_MS: 180000,
  // 最大重试次数
  MAX_RETRY_ATTEMPTS: 3,
  // 重试间隔，5秒
  RETRY_INTERVAL_MS: 5000,
};

// 防抖时间配置
export const DEBOUNCE_CONFIG = {
  // 增加内容时等待3秒，只保留最终状态
  chat_input_typing_add: 3000,
  // 删除操作1000ms内记录
  chat_input_typing_delete: 1000,
};
```

## 调试模式

在配置文件中设置`DEBUG_CONFIG.ENABLED = true`可以在控制台看到详细的埋点日志。通过配置`DEBUG_CONFIG.CONSOLE_LOG`和`DEBUG_CONFIG.VERBOSE`可以控制日志的详细程度。

调试日志包括：

- 事件进入队列
- 批量发送
- 重试情况
- 去重过滤 
- 操作类型(增加/删除)和最大长度信息
- 内容长度检查信息
- 内容变化差异检查信息
- 内容包含关系检查信息
- 消息发送触发批量埋点信息

配置示例：
```typescript
// 调试模式配置
export const DEBUG_CONFIG = {
  // 是否开启调试模式
  ENABLED: true,
  // 是否在控制台打印埋点信息
  CONSOLE_LOG: true,
  // 是否显示详细日志
  VERBOSE: true,
  // 是否在控制台显示队列内容
  SHOW_QUEUE: true,
  // 是否在控制台显示发送结果
  SHOW_SEND_RESULT: true,
};
```


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
