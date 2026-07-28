import toast from "react-hot-toast";
import adminApi from "../../Service/api";
import { removeLoaleStorageItem, setLocaleStorageItem } from "../../Utils/localeStorage";
import { loginToggleAction } from "../../Store/Slices/AuthSlice";
import { ADMIN_DETAILS } from "../../Constant/Constant";

async function login(data, dispatch, setIsLoading, navigate) {
  try {
    setIsLoading(true);
    const res = await adminApi.adminLogin(data);
    if (res.data.action) {
      setLocaleStorageItem(ADMIN_DETAILS, res.data.data);
      toast.success(res.data.message);
      dispatch(loginToggleAction(res.data.data));
      navigate("/");
    } else {
      toast.error(res.data.message);
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Login failed");
  } finally {
    setIsLoading(false);
  }
}

async function logout(setIsLoading) {
  try {
    setIsLoading?.(true);
    await adminApi.adminLogout();
  } catch (e) {
    console.log(e);
  } finally {
    setIsLoading?.(false);
    removeLoaleStorageItem(ADMIN_DETAILS);
    window.location.replace("/login");
  }
}

export { logout };
export default login;
