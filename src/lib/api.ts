import axios from "axios";
import { API_URL } from "../config";

// Keep token key in one place (must match AuthContext)
const LS_TOKEN = "tapsoran_admin_token";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Always attach the latest token. This fixes the "first request 401" race
// where queries fire before React state effects run after login.
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem(LS_TOKEN);
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
