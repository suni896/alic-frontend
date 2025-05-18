import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://112.74.92.135:443",
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
