import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://192.168.3.6:8080/",
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  const isLoginRequest = config.url?.includes("/api/auth/login");

  if (token && !isLoginRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export { api };