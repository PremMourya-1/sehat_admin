import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Thin top-of-page progress bar that pulses briefly on every route change,
 * giving a sense of navigation feedback (mounted once near the app root).
 */
const TpLoader = () => {
  const location = useLocation();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const timer = setTimeout(() => setActive(false), 400);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!active) return null;

  return (
    <div className="fixed left-0 top-0 z-[100] h-1 w-full overflow-hidden bg-transparent">
      <div
        className="h-full animate-[shimmer_0.6s_ease-in-out_infinite]"
        style={{ backgroundColor: "var(--accent)", width: "40%" }}
      />
    </div>
  );
};

export default TpLoader;
