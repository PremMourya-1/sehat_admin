import toast from "react-hot-toast";
import expensesApi from "../../Service/expensesApi";
import { EXPENSES_TOKEN_KEY, EXPENSES_USER_KEY } from "./expensesConstants";

export async function expensesLogin(data, setIsLoading, navigate) {
  try {
    setIsLoading(true);
    const res = await expensesApi.login(data);
    if (res.data.action) {
      localStorage.setItem(EXPENSES_TOKEN_KEY, res.data.data.token);
      localStorage.setItem(EXPENSES_USER_KEY, res.data.data.name);
      toast.success(res.data.message || "Login successful");
      navigate("/expenses");
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Login failed");
  } finally {
    setIsLoading(false);
  }
}

export function expensesLogout(navigate) {
  localStorage.removeItem(EXPENSES_TOKEN_KEY);
  localStorage.removeItem(EXPENSES_USER_KEY);
  navigate("/expenses/login");
}
