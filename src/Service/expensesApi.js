import axios from "axios";
import { BASE_URL } from "./service";

// Deliberately its own axios instance, not the shared apiJson/apiMultipart
// from ./service.js — those are scoped to VITE_API_BASE_URL
// (".../api/admin") and their interceptor injects the ADMIN token. The
// Expenses Tracker is a totally separate mini-app (see EXPENSES.md): own
// backend route prefix (/api/expenses, a sibling of /api/admin, not nested
// under it), own token (localStorage "expensesToken", never ADMIN_DETAILS),
// own auth — so it needs its own client end to end.
const EXPENSES_BASE_URL = BASE_URL.replace(/\/admin$/, "/expenses");

const EXPENSES_TOKEN_KEY = "expensesToken";

const expensesClient = axios.create({
  baseURL: EXPENSES_BASE_URL,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

expensesClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(EXPENSES_TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

const expensesUrl = {
  login: "/login",
  base: "/",
  byId: (id) => `/${id}`,
};

const expensesApi = {
  login: (data) => expensesClient.post(expensesUrl.login, data),
  getExpenses: (params) => expensesClient.get(expensesUrl.base, { params }),
  createExpense: (data) => expensesClient.post(expensesUrl.base, data),
  updateExpense: (id, data) => expensesClient.patch(expensesUrl.byId(id), data),
  deleteExpense: (id) => expensesClient.delete(expensesUrl.byId(id)),
};

export { EXPENSES_TOKEN_KEY };
export default expensesApi;
