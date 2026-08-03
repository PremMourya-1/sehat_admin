import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const PageDataContext = createContext(null);

// Exactly one admin page is ever mounted at a time (react-router), so this
// just needs to remember whichever page's fetch function registered most
// recently — the header's reload button calls that, no full page refresh.
// Kept in a ref (not state) since registering shouldn't itself re-render.
export const PageDataProvider = ({ children }) => {
  const reloadFnRef = useRef(null);
  const [isReloading, setIsReloading] = useState(false);

  const registerPageReload = useCallback((fn) => {
    reloadFnRef.current = fn;
  }, []);

  const reloadCurrentPage = useCallback(async () => {
    if (!reloadFnRef.current) return;
    setIsReloading(true);
    try {
      await reloadFnRef.current();
    } finally {
      setIsReloading(false);
    }
  }, []);

  const value = useMemo(
    () => ({ registerPageReload, reloadCurrentPage, isReloading }),
    [registerPageReload, reloadCurrentPage, isReloading],
  );

  return <PageDataContext.Provider value={value}>{children}</PageDataContext.Provider>;
};

export const usePageData = () => {
  const ctx = useContext(PageDataContext);
  if (!ctx) throw new Error("usePageData must be used within a PageDataProvider");
  return ctx;
};

export default PageDataContext;
