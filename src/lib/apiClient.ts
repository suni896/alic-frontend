import axios from "axios";
import { API_BASE_URL } from "../../config";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// 添加响应拦截器
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 公开页面列表（不需要登录的页面）
    const publicPaths = ["/", "/register", "/reset-password", "/verify-register"];
    const currentPath = window.location.pathname;
    
    if (
      !publicPaths.includes(currentPath) &&
      error.response?.status === 401
    ) {
      localStorage.clear();
      document.cookie =
        "jwtToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=None";
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
