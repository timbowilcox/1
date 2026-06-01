import axios from "axios";
import { env } from "./env";

const api = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const ignore401 = error.config?.ignore401;

      if (
        error.response?.status === 401 && 
        typeof window !== "undefined" && 
        !ignore401
      ) {
        window.location.href = "/login";
      }
    } catch {}
    
    return Promise.reject(error);
  },
);

export default api;