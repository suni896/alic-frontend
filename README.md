# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

## command
npm run dev
rd -r -force node_modules/.vite
stop:ctrl+c

https://112.74.92.135/swagger-ui/index.html#/group-controller

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
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

### 2. 全局CORS配置方案

也可以在配置类中添加全局CORS配置:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false);  // 不需要凭证
    }
}
```

如需使用credentials，请注意：
1. 后端`.allowCredentials(true)`必须搭配`.allowedOrigins("http://localhost:5173")`使用具体来源
2. 前端需要设置`xhr.withCredentials = true`
3. 不能同时使用`.allowedOrigins("*")`和`.allowCredentials(true)`

## distinct_id 字段说明

埋点系统中的 `distinct_id` 字段用于唯一标识用户，这是一个重要的字段，有以下几点需要注意：

### 1. 数据结构要求

应确保 `distinct_id` 同时出现在两个位置：

```json
{
  "event": "chat_input_typing",
  "distinct_id": "用户ID", // 根级别

  "properties": {
    "distinct_id": "用户ID", // properties内也需要
    "content": "用户输入的内容",
    "input_length": 10,
    "page": "/room/123",
    "timestamp": 1750256493206
  }
}
```

### 2. 后端处理逻辑

SpringBoot控制器中应该同时检查根级别和properties中的distinct_id：

```java
// 先尝试从根级别获取
String distinctId = payload.containsKey("distinct_id") 
    ? String.valueOf(payload.get("distinct_id")) 
    : null;

// 如果根级别没有，尝试从properties中获取
if (distinctId == null && payload.containsKey("properties")) {
    Map<String, Object> props = (Map<String, Object>) payload.get("properties");
    distinctId = props.containsKey("distinct_id") 
        ? String.valueOf(props.get("distinct_id")) 
        : "anonymous";
}

// 添加到properties中
properties.put("distinct_id", distinctId);
```

### 3. 用户ID获取方式

前端会尝试从以下位置按顺序获取用户ID：

1. **本地存储**：
   - `localStorage.getItem('userId')` 
   - `localStorage.getItem('user_id')`

2. **会话存储**：
   - `sessionStorage.getItem('userId')`
   - `sessionStorage.getItem('user_id')`
   - `sessionStorage.getItem('token')` (只在hooks中)

3. **JWT令牌**：
   - 从`localStorage`或`sessionStorage`中的`jwtToken`解析
   - 尝试提取token中的`userId`或`sub`字段

4. **全局变量**：
   - `window.userInfo.userId`

5. **Cookies**：
   - 解析`document.cookie`中的`userId`或`user_id`

6. **URL参数**：
   - 解析URL中的`userId`或`user_id`查询参数

7. **默认值**：
   - 如果以上所有方法都失败，使用`'anonymous'`

在`MyRoom`组件中，我们会自动将`userInfo.userId`保存到多个存储位置，以确保埋点能正确获取用户ID。

### 4. 调试方法

如果用户ID仍然是`anonymous`，可以尝试以下调试方法：

1. 控制台手动设置：
```javascript
// 方法1：直接保存到localStorage
localStorage.setItem('userId', '123456');

// 方法2：设置全局用户对象
window.userInfo = { userId: '123456' };
```

2. 检查控制台日志：
   - 查找带有`📋`图标的日志，显示用户ID的获取过程
   - 查找`🔄 埋点数据准备发送`分组，检查`distinct_id`字段值

## 埋点事件配置

### 1. 允许的埋点事件

为避免发送不必要的埋点，系统目前只允许这些事件：

```javascript
const ALLOWED_EVENTS = [
  'chat_input_typing',   // 用户正在输入
 // 'chat_input_blur',     // 输入框失去焦点 这个事件删除
  'chat_input_before_send', // 发送前处理
  'chat_input_sent',     // 消息已发送
  'chat_message_received' // 收到消息
];
```

如需添加新事件，请在 `src/hooks/useInputTracking.ts` 文件中的 `ALLOWED_EVENTS` 数组添加。

### 2. 禁用的系统事件

以下系统事件已被禁用，不会发送到后端：

- `$pageview` - 页面浏览事件
- `$WebStay` - 页面停留事件
- `$WebClick` - 页面点击事件
- `test_connection` - 测试连接事件

### 3. 如何修改埋点配置

1. **禁用/启用系统事件**：
   在 `src/utils/tracker.ts` 修改初始化参数：
   ```javascript
   sensors.init({
     // ...
     auto_track: false, // 设为 true 启用自动埋点
     // ...
   });
   ```

2. **调整事件过滤**：
   修改 `sensors.track` 函数中的过滤条件：
   ```javascript
   // 过滤掉自动生成的事件
   if (event.startsWith('$') || event === 'test_connection') {
     // ...
   }
   ```

3. **启用/禁用调试日志**：
   在 `src/utils/tracker.ts` 和 `src/hooks/useInputTracking.ts` 修改：
   ```javascript
   const DEBUG_MODE = false; // 设为false关闭所有调试日志
   ```

# 防重复发送机制

为了避免相同埋点事件在短时间内重复发送，系统实现了两级防重复机制：

## 1. 钩子级别防重复

在 `useInputTracking` 钩子中，我们实现了事件级别的防重：

```javascript
// 定义防抖时间间隔（毫秒）
const DEBOUNCE_TIME = {
  chat_input_typing: 1000,  // 输入防抖时间较长
  chat_input_blur: 500,
  chat_input_before_send: 300,
  chat_input_sent: 300,
  chat_message_received: 300
};
```

系统会检查相同事件在指定的时间间隔内是否已经发送过，如果是则不再重复发送。

## 2. 发送层级防重复

在最终发送层 `tracker.ts` 中，我们添加了全局防重复机制：

```javascript
// 防止重复发送
const eventKey = `${jsonData.event}_${JSON.stringify(jsonData).substring(0, 50)}`;
const now = Date.now();
if (sentEvents[eventKey] && now - sentEvents[eventKey] < 2000) {
  if (DEBUG_MODE) {
    console.log(`⏱️ 忽略重复事件 [${jsonData.event}]，间隔太短: ${now - sentEvents[eventKey]}ms`);
  }
  return Promise.resolve(false);
}
```

这确保了即使有多个组件触发相同事件，也只会发送一次。

## 调整防重复参数

如需调整防重复时间间隔：

1. **组件级防抖**：
   修改 `src/hooks/useInputTracking.ts` 中的 `DEBOUNCE_TIME` 对象

2. **全局防重复**：
   修改 `src/utils/tracker.ts` 中的 `sentEvents` 检查时间（当前为2000毫秒）

# 聊天室埋点配置

## 已配置的埋点事件

目前系统支持以下埋点事件:

1. `chat_input_typing` - 用户在输入框中输入内容时
2. `chat_input_before_send` - 消息即将发送时
3. `chat_input_sent` - 消息发送后
4. `chat_message_received` - 接收到新消息时

> **注意**: `chat_input_blur` 事件已移除，不再被跟踪。

## 事件格式

所有埋点事件都遵循以下格式:

```javascript
{
  event: string,         // 事件名称
  distinct_id: string,   // 用户唯一ID
  content: string,       // 消息内容
  input_length: number,  // 内容长度
  page: string,          // 页面路径
  timestamp: number,     // 时间戳
  room_id: number,       // 聊天室ID
  platform: 'web',       // 平台
  device_type: 'browser' // 设备类型
  module: 'chat'         // 模块名
}
```

特殊事件 `chat_message_received` 还包含额外的 `sender_id` 字段，表示发送者ID。

## 埋点防重复机制

为防止 `chat_input_typing` 事件频繁触发，系统实现了多层防重复机制:

1. **组件层**: 只有当内容变化超过2个字符或距离上次事件超过3秒时才触发
2. **钩子层**: 使用3秒的防抖时间，确保短时间内不会重复触发
3. **发送层**: 全局对相同内容事件进行2秒的节流处理
