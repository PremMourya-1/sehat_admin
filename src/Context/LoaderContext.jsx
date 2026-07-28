import { createContext, useContext, useMemo, useState } from "react";

const LoaderContext = createContext(null);

export const LoaderProvider = ({ children }) => {
  const [isPageLoading, setIsPageLoading] = useState(false);

  const value = useMemo(() => ({ isPageLoading, setIsPageLoading }), [isPageLoading]);

  return <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>;
};

export const useLoader = () => {
  const ctx = useContext(LoaderContext);
  if (!ctx) throw new Error("useLoader must be used within a LoaderProvider");
  return ctx;
};

export default LoaderContext;
