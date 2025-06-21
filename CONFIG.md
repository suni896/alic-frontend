# 配置说明

## 环境变量配置

本项目使用环境变量来管理后端API和WebSocket连接的配置，这样可以轻松地在不同环境（开发、测试、生产）之间切换。

### 设置步骤

1. **复制示例配置文件**
   ```bash
   cp .env.example .env
   ```

2. **编辑 `.env` 文件**
   根据您的环境需求修改配置：
   ```env
   # API 服务器配置
   VITE_API_BASE_URL=https://112.74.92.135:443
   VITE_WS_BASE_URL=https://112.74.92.135
   ```

### 可用的环境变量

| 变量名 | 描述 | 默认值 | 示例 |
|--------|------|---------|------|
| `VITE_API_BASE_URL` | API服务器的基础URL | `https://112.74.92.135:443` | `http://localhost:8080` |
| `VITE_WS_BASE_URL` | WebSocket服务器的基础URL | `https://112.74.92.135` | `http://localhost:8080` |

### 不同环境的配置示例

#### 开发环境
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_BASE_URL=http://localhost:8080
```

#### 测试环境
```env
VITE_API_BASE_URL=https://test-api.example.com
VITE_WS_BASE_URL=https://test-api.example.com
```

#### 生产环境
```env
VITE_API_BASE_URL=https://112.74.92.135:443
VITE_WS_BASE_URL=https://112.74.92.135
```

### 配置文件结构

配置系统由以下文件组成：

- `src/config/apiConfig.ts` - 主配置文件，导出所有配置常量
- `.env` - 环境变量文件（本地配置，不会被git跟踪）
- `.env.example` - 示例配置文件，用于参考

### 使用配置

在代码中使用配置：

```typescript
import { API_BASE_URL, WS_URL, API_ENDPOINTS } from '../../config/apiConfig';

// 使用API基础URL
const response = await apiClient.get('/some-endpoint');

// 使用WebSocket URL
const socket = new SockJS(WS_URL);

// 使用预定义的API端点
const userInfo = await apiClient.get(API_ENDPOINTS.USER.GET_INFO);
```

### 注意事项

1. **环境变量必须以 `VITE_` 开头**才能在Vite构建的前端应用中使用
2. **不要将 `.env` 文件提交到版本控制**（已在 `.gitignore` 中配置）
3. **修改配置后需要重启开发服务器**才能生效
4. **生产部署时需要设置正确的环境变量**

### 故障排除

如果遇到连接问题，请检查：
1. `.env` 文件是否存在且配置正确
2. API服务器是否正在运行
3. 网络连接是否正常
4. 防火墙是否阻止了连接 