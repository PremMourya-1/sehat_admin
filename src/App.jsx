import { lazy, Suspense, useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ADMIN_DETAILS } from "./Constant/Constant";
import { getLocaleStorageItem } from "./Utils/localeStorage";
import { loginToggleAction } from "./Store/Slices/AuthSlice";
import { LoaderProvider } from "./Context/LoaderContext";
import { ThemeProvider } from "./Context/ThemeContext";
import PreLoader from "./Components/Common/Loader/PreLoader";

const RouteData = lazy(() => import("./Routes/Route"));

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const admin = getLocaleStorageItem(ADMIN_DETAILS);
    if (admin) dispatch(loginToggleAction(admin));
  }, [dispatch]);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <LoaderProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Suspense fallback={<PreLoader height="100vh" />}>
            <RouteData />
          </Suspense>
        </LoaderProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
