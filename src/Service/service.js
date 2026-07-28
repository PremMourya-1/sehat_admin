import axios from "axios";
import { removeLoaleStorageItem } from "../Utils/localeStorage";
import { ADMIN_DETAILS } from "../Constant/Constant";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const COMMON_IMAGE_URL = import.meta.env.VITE_COMMON_IMAGE_URL;

const createApiForClient = (contentType) => {
  const headers = { "Cache-Control": "no-cache" };
  if (contentType === "multipart") headers["Content-Type"] = "multipart/form-data";
  else if (contentType === "json") headers["Content-Type"] = "application/json";

  const api = axios.create({
    baseURL: BASE_URL,
    timeout: 600000,
    withCredentials: true,
    headers,
  });

  api.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error),
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        removeLoaleStorageItem(ADMIN_DETAILS);
        window.location.replace("/login");
      }
      return Promise.reject(error);
    },
  );

  return api;
};

const apiMultipart = createApiForClient("multipart");
const apiJson = createApiForClient("json");

export { apiMultipart, apiJson };
