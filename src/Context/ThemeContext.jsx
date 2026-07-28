import { createContext, useContext, useMemo, useState } from "react";

const ThemeContext = createContext(null);

// Holds the collapsed/expanded state of the admin SideBar so that SideBar,
// Header, and AdminLayout content can all react to the same source of truth.
export const ThemeProvider = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  const value = useMemo(
    () => ({ isSidebarCollapsed, setIsSidebarCollapsed, toggleSidebar }),
    [isSidebarCollapsed],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
};

export default ThemeContext;
