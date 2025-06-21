import axios from "axios";
import { API_BASE_URL, API_TIMEOUT } from "../../config/apiConfig";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  withCredentials: true,
});

// 添加响应拦截器
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      window.location.pathname != "/" &&
      window.location.pathname != "" &&
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
