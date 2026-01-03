import axios from "axios";
import { API_URL } from "../config";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

export function withAuth(token: string | null) {
  api.interceptors.request.clear?.(); // if supported
  api.interceptors.request.use((cfg) => {
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  });
}
