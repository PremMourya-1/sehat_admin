import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

const COLOR_THEME_STORAGE_KEY = "SEHAT_POTLI_ADMIN_COLOR_THEME";

function getInitialColorTheme() {
  try {
    const stored = localStorage.getItem(COLOR_THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage unavailable (private mode, etc.) — fall through to default
  }
  return "light";
}

// Holds the collapsed/expanded state of the admin SideBar, and the
// light/dark color theme, so that SideBar, Header, and AdminLayout content
// can all react to the same source of truth.
export const ThemeProvider = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [colorTheme, setColorTheme] = useState(getInitialColorTheme);
  // Separate from isSidebarCollapsed (which only matters on desktop, where
  // the sidebar is always visible at 260px/80px) — this is the off-canvas
  // open/closed state used at tablet width and below, where the sidebar is
  // hidden by default and slides in over the content instead. Header's
  // hamburger button toggles both together; each only has a visible effect
  // at its own breakpoint (see Styles/Sidebar.css).
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen((prev) => !prev);
  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);
  const toggleColorTheme = () => setColorTheme((prev) => (prev === "dark" ? "light" : "dark"));

  // Every dark/light override in Styles/App.css keys off this attribute on
  // <html> — see :root[data-theme="dark"] there.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", colorTheme);
    try {
      localStorage.setItem(COLOR_THEME_STORAGE_KEY, colorTheme);
    } catch {
      // ignore write failures — theme just won't persist across reloads
    }
  }, [colorTheme]);

  const value = useMemo(
    () => ({
      isSidebarCollapsed,
      setIsSidebarCollapsed,
      toggleSidebar,
      isMobileSidebarOpen,
      toggleMobileSidebar,
      closeMobileSidebar,
      colorTheme,
      toggleColorTheme,
    }),
    [isSidebarCollapsed, isMobileSidebarOpen, colorTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
};

export default ThemeContext;
