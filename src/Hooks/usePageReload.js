import { useEffect } from "react";
import { usePageData } from "../Context/PageDataContext";

// Runs `fetchFn` once on mount (same as every page's existing
// `useEffect(() => { getXData(...) }, [])`) and registers it with
// PageDataContext so the header's reload button can re-run it later.
// `fetchFn` should be stable (wrap it in useCallback with an empty dep
// array in the page) since it's the effect's own dependency.
const usePageReload = (fetchFn) => {
  const { registerPageReload } = usePageData();

  useEffect(() => {
    fetchFn();
    registerPageReload(fetchFn);
    return () => registerPageReload(null);
  }, [fetchFn, registerPageReload]);
};

export default usePageReload;
