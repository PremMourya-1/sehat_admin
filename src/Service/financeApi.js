import axios from "axios";
import { BASE_URL } from "./service";

// Deliberately its own axios instance, not the shared apiJson/apiMultipart
// from ./service.js — those are scoped to VITE_API_BASE_URL
// (".../api/admin") and their interceptor injects the ADMIN token. The
// Finance mini-app (Expenses + Sales, see FINANCE.md) is a totally
// separate system: sibling backend routes (/api/expenses, /api/sales —
// not nested under /api/admin), own token (localStorage "financeToken",
// never ADMIN_DETAILS), own auth — so it needs its own client end to end.
// Both resources share one login (POST /api/expenses/login — there's no
// /api/sales/login), so baseURL is the API root, not either resource.
const API_ROOT = BASE_URL.replace(/\/admin$/, "");

const FINANCE_TOKEN_KEY = "financeToken";

const financeClient = axios.create({
  baseURL: API_ROOT,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

financeClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(FINANCE_TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

const financeUrl = {
  login: "/expenses/login",
  expenses: "/expenses",
  expenseById: (id) => `/expenses/${id}`,
  sales: "/sales",
  saleById: (id) => `/sales/${id}`,
};

const financeApi = {
  login: (data) => financeClient.post(financeUrl.login, data),

  getExpenses: (params) => financeClient.get(financeUrl.expenses, { params }),
  createExpense: (data) => financeClient.post(financeUrl.expenses, data),
  updateExpense: (id, data) => financeClient.patch(financeUrl.expenseById(id), data),
  deleteExpense: (id) => financeClient.delete(financeUrl.expenseById(id)),

  getSales: (params) => financeClient.get(financeUrl.sales, { params }),
  createSale: (data) => financeClient.post(financeUrl.sales, data),
  updateSale: (id, data) => financeClient.patch(financeUrl.saleById(id), data),
  deleteSale: (id) => financeClient.delete(financeUrl.saleById(id)),
};

export { FINANCE_TOKEN_KEY };
export default financeApi;
