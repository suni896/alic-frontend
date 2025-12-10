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
      "input_action": "add", // 新增字段，标记是增加还是删除操作（基于与队列最新记录的比较）
      "max_length": 50 // 新增字段，记录会话中的最大长度
   }}
```

### timestamp	行为发生时间	比如点击、浏览、曝光等事件实际发生的时刻
### track_time	埋点/事件被触发时打点的时间	比如 SDK 在将事件打包准备发送时打的时间

## input_action 判断逻辑

`input_action` 字段用于标记用户输入是增加还是删除操作，判断规则如下：

- **当前句子长度 ≥ 队列最新记录的长度** → `input_action = "add"`
- **当前句子长度 < 队列最新记录的长度** → `input_action = "delete"`

注意：这里比较的是**当前输入内容**与**埋点队列中最新记录的内容长度**，而不是与上一次输入的长度比较。这样可以更准确地反映用户的实际操作意图。

### 示例

假设队列中最新记录的内容长度为 20：
- 用户输入内容长度为 25 → `input_action = "add"` （增加了内容）
- 用户输入内容长度为 15 → `input_action = "delete"` （删除了内容）
- 用户输入内容长度为 20 → `input_action = "add"` （长度相等，视为增加）

# 埋点转折点规则说明

## 概述

埋点系统采用**实时记录 + 队列转折点过滤**的策略，在减少数据延迟的同时保证数据质量。

### 核心策略

1. **实时记录：** 只要文字发生变化就立即记录埋点（无防抖延迟）
2. **队列过滤：** 在队列中实时过滤，只保留转折点数据
3. **减少延迟：** 移除了防抖延迟和内容检查，让变化能够立即被记录

**转折点过滤时机：** 在每次添加事件到队列时**实时过滤**（`queueEvent` 函数中），队列中始终只保留转折点。

**配置开关：** 可通过 `trackConfig.ts` 中的 `FEATURES.TURNING_POINT_FILTER` 控制是否启用（默认启用）。

**特殊规则：** 
- 如果队列 <= 2条数据，将不进行转折点过滤
- **第一个事件（起点）总是保留**
- **最后一个事件（当前状态）总是保留**
- 中间只保留转折点（减→增、增→减）

### 性能优化

- ✅ **无防抖延迟**：文字变化立即记录
- ✅ **无内容长度检查**：所有变化都能被记录
- ✅ **无内容差异检查**：不限制最小变化量
- ✅ **队列自动过滤**：只保留关键转折点，减少数据量
- ✅ **极短时间去重**：仅防止50ms内的意外重复触发
- ✅ **拼音输入过滤**：使用 `compositionstart/compositionend` 事件过滤拼音中间状态

## 拼音输入过滤方案

### 问题描述

在使用中文输入法时，会产生大量拼音中间状态：
```
用户输入 "今天" 的过程：
j → ji → jin → jint → jinti → jintin → jintian → 今天
```

这些拼音中间状态不应该被记录为埋点。

### 解决方案：Composition Events ⭐

使用浏览器原生的 `compositionstart` 和 `compositionend` 事件来检测输入法状态。

#### 工作原理

1. **compositionstart**：输入法组合开始（用户开始输入拼音）
   - 设置 `isComposing = true`
   - 暂停埋点记录

2. **input**：用户输入过程中
   - 如果 `isComposing = true`，跳过埋点记录
   - 拼音中间状态被自动过滤

3. **compositionend**：输入法组合结束（拼音转换为中文）
   - 设置 `isComposing = false`
   - 立即记录转换后的中文内容

#### 代码实现

```typescript
// Hook 中
const isComposing = useRef<boolean>(false);

const handleCompositionStart = () => {
  isComposing.current = true;
};

const handleCompositionEnd = (content: string) => {
  isComposing.current = false;
  // 组合结束后立即处理内容
  handleTypingInternal(content);
};

const handleTyping = (content: string) => {
  // 如果正在输入法组合中，跳过埋点记录
  if (isComposing.current) {
    return;
  }
  handleTypingInternal(content);
};
```

```tsx
// 组件中
<MessageInput
  value={inputMessage}
  onChange={(e) => {
    setInputMessage(e.target.value);
    handleTyping(e.target.value);
  }}
  onCompositionStart={() => handleCompositionStart()}
  onCompositionEnd={(e) => handleCompositionEnd(e.target.value)}
/>
```

### 优势

- ✅ **准确识别**：精确识别输入法状态，不会误判
- ✅ **零延迟**：不需要防抖，组合结束立即记录
- ✅ **兼容英文**：不影响英文输入的实时记录
- ✅ **浏览器原生**：使用标准 API，兼容性好
- ✅ **用户体验好**：只记录最终的中文字符，数据更准确

### 效果对比

**未使用 Composition Events：**
```
记录: "j" → "ji" → "jin" → "jint" → "今天"
结果: 5条埋点，4条是无用的拼音
```

**使用 Composition Events：**
```
记录: "今天"
结果: 1条埋点，只记录最终的中文
```

## 核心概念

### 变化定义

- **prevLength**: 前一版本内容长度
- **currentLength**: 当前版本内容长度
- **nextLength**: 下一版本内容长度
- **prevChange**: `currentLength - prevLength` (前一次变化量)
- **nextChange**: `nextLength - currentLength` (后一次变化量)
- **CHANGE_THRESHOLD**: 2 (变化小于 2 个字符视为无效)

### 转折点规则

系统会自动检测并保留以下关键点：

#### 5.1 减 → 增 转折点

**条件：**
- `prevChange < 0` (前一变化为减少)
- `nextChange > 0` (后一变化为增加)
- `|prevChange| >= 2` 或 `|nextChange| >= 2`

**保留逻辑：**
保留当前版本作为减 → 增的转折点。

**示例：**
```
版本1: 长度 100 (初始)
版本2: 长度 95  (减少 5) ← prevChange = -5
版本3: 长度 98  (增加 3) ← 当前版本，nextChange = +3
版本4: 长度 102 (增加 4)

结果：版本3 被识别为"减→增"转折点并保留
```

#### 5.2 增 → 减 转折点

**条件：**
- `prevChange > 0` (前一变化为增加)
- `nextChange < 0` (后一变化为减少)
- `|prevChange| >= 2` 或 `|nextChange| >= 2`

**保留逻辑：**
保留当前版本作为增 → 减的转折点。

**示例：**
```
版本1: 长度 50  (初始)
版本2: 长度 55  (增加 5) ← prevChange = +5
版本3: 长度 52  (减少 3) ← 当前版本，nextChange = -3
版本4: 长度 48  (减少 4)

结果：版本3 被识别为"增→减"转折点并保留
```

## 保留规则

系统在发送埋点数据到服务器前会自动应用以下过滤规则：

**只保留所有转折点** - 记录用户输入行为的关键变化（减→增、增→减）

### 实现细节

- **过滤位置：** `tracker.ts` 的 `flushEvents()` 函数中
- **过滤函数：** `filterTurningPoints(events)`
- **配置开关：** `FEATURES.TURNING_POINT_FILTER`（默认 `true`）
- **阈值设置：** `CHANGE_THRESHOLD = 2`（变化小于2个字符视为无效）

### 完整示例

假设用户输入过程：

```
用户输入: "今天去麦理浩径"
记录1: 长度 7  "今天去麦理浩径" (初始输入) ✅ 保留（起点）

用户删除: "今天去麦"
记录2: 长度 4  "今天去麦" (减少 3)

用户继续删除: "今天去"
记录3: 长度 3  "今天去" (减少 1) ✅ 保留（增→减转折点）

用户输入: "今天去迪士尼"
记录4: 长度 6  "今天去迪士尼" (增加 3) ✅ 保留（当前状态/减→增转折点）
```

**队列中实时保留的记录：**

```
✅ 记录1: 长度 7  "今天去麦理浩径" (起点)
✅ 记录3: 长度 3  "今天去" (增→减转折点)
✅ 记录4: 长度 6  "今天去迪士尼" (减→增转折点 + 当前状态)
```

**结果：** 实时记录所有变化，但队列中只保留3个关键点，数据量减少25%，同时保留了完整的变化趋势信息。

### 实际应用场景

```
场景：用户输入 "今天去麦理浩径" → 删除到 "今天去" → 改为 "今天去迪士尼"

实时记录（无延迟）：
- 每次按键都立即记录
- 不等待用户停止输入
- 不检查内容长度或变化量

队列过滤（自动）：
- 保留 "今天去麦理浩径"（最长的增加点 = 增→减转折点）
- 保留 "今天去"（最短的删除点 = 减→增转折点）
- 保留 "今天去迪士尼"（当前状态）

发送到服务器：
- 只发送这3个关键点
- 完整反映了用户的输入意图变化
```