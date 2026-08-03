import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import adminApi from "../Service/api";

const SettingsContext = createContext(null);

// Web settings (COD toggle, notification delivery-channel toggles) fetched
// once at app-level and cached here — every new-order socket event checks
// these current values instead of each doing its own fetch. The Settings
// page's General/Notifications tabs both read and write through here so
// every consumer (Settings UI, NotificationContext's delivery logic) stays
// in sync the moment a toggle is saved.
export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getWebSettings();
      if (res.data.action) setSettings(res.data.data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const value = useMemo(
    () => ({ settings, isLoading, setSettings, refetchSettings: fetchSettings }),
    [settings, isLoading, fetchSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
};

export default SettingsContext;
