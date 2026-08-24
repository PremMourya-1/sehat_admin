import toast from "react-hot-toast";
import financeApi from "../../Service/financeApi";
import { FINANCE_TOKEN_KEY, FINANCE_USER_KEY } from "./financeConstants";

export async function financeLogin(data, setIsLoading, navigate) {
  try {
    setIsLoading(true);
    const res = await financeApi.login(data);
    if (res.data.action) {
      localStorage.setItem(FINANCE_TOKEN_KEY, res.data.data.token);
      localStorage.setItem(FINANCE_USER_KEY, res.data.data.name);
      toast.success(res.data.message || "Login successful");
      navigate("/finance/expenses");
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Login failed");
  } finally {
    setIsLoading(false);
  }
}

export function financeLogout(navigate) {
  localStorage.removeItem(FINANCE_TOKEN_KEY);
  localStorage.removeItem(FINANCE_USER_KEY);
  navigate("/finance/login");
}
