import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://112.74.92.135:443",
  withCredentials: true,
});

export default apiClient;
