// API 配置文件
interface ApiConfig {
  baseURL: string;
  wsBaseURL: string;
  timeout: number;
}

// 从环境变量获取配置，如果没有则使用默认值
const config: ApiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://chat.alic-dev.xyz",
  wsBaseURL: import.meta.env.VITE_WS_BASE_URL || "https://chat.alic-dev.xyz",
  timeout: 10000, // 10秒超时
};

// 导出配置
export default config;

// 导出具体的URL配置
export const API_BASE_URL = config.baseURL;
export const WS_BASE_URL = config.wsBaseURL;
export const API_TIMEOUT = config.timeout;

// WebSocket完整URL
export const WS_URL = `${WS_BASE_URL}/ws`;

// 常用的API端点
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
  },
  USER: {
    GET_INFO: "/v1/user/get_user_info",
  },
  GROUP: {
    GET_INFO: "/v1/group/get_group_info",
    GET_MEMBERS: "/v1/group/get_group_member_list",
    ADD_MEMBER: "/v1/group/add_group_member",
    GET_ROLE: "/v1/group/get_role_in_group",
  },
  TAG: {
    GET_LIST: "/v1/tag/get_tag_list",
    GET_INFO: "/v1/tag/get_tag_info",
    ADD_GROUP: "/v1/tag/add_group",
  },
} as const; 