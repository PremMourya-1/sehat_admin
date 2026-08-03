import { useCallback, useState } from "react";
import Card from "../../Components/Card/Card";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import usePageReload from "../../Hooks/usePageReload";
import { useSettings } from "../../Context/SettingsContext";
import { useNotifications } from "../../Context/NotificationContext";
import { updateWebSettings } from "./webSettingsService";

const TOGGLES = [
  {
    key: "chromePushEnabled",
    label: "Browser (Chrome) Push Notifications",
    description: "Shows a native browser notification for new orders, even if the admin panel tab isn't focused.",
  },
  {
    key: "toastPopupEnabled",
    label: "Toast Popup",
    description: "Shows an in-app toast in the top-right corner when a new order comes in.",
  },
  {
    key: "soundEnabled",
    label: "Notification Sound",
    description: "Plays a short sound when a new order comes in.",
  },
];

// These three only gate the *extra* delivery channels layered on top of the
// bell/drawer notification (Part 2) — that one is always on regardless.
// Reads/writes through the same SettingsContext row as the General tab
// (WebSetting's "notifications" key — see utils/webSettings.js).
const NotificationSettings = () => {
  const { settings, isLoading, refetchSettings, setSettings } = useSettings();
  const { browserPermission } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSettings = useCallback(() => refetchSettings(), [refetchSettings]);
  usePageReload(fetchSettings);

  const toggles = settings?.notifications || {};

  const handleToggle = (key) => async (event) => {
    await updateWebSettings({ notifications: { [key]: event.target.checked } }, setSettings, setIsSubmitting);
  };

  if (isLoading) return <PreLoader />;

  return (
    <Card className="max-w-xl">
      <h3 className="section-title mb-4">Order Notification Delivery</h3>
      <p className="mb-4 text-xs text-muted">
        The bell icon and notification drawer always show new orders — these toggles control extra ways to get
        alerted on top of that.
      </p>

      <div className="flex flex-col gap-3">
        {TOGGLES.map((toggle) => (
          <label
            key={toggle.key}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border py-3"
            style={{ borderColor: "var(--border)" }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                {toggle.label}
              </p>
              <p className="text-xs text-muted">{toggle.description}</p>
              {toggle.key === "chromePushEnabled" && toggles.chromePushEnabled && browserPermission === "denied" && (
                <p className="mt-1 text-xs font-medium" style={{ color: "var(--danger, #dc2626)" }}>
                  Blocked at the browser level — this admin has denied notification permission for this site. Enable
                  it from the browser&apos;s site settings (usually the padlock icon next to the address bar) for
                  push notifications to actually show.
                </p>
              )}
              {toggle.key === "chromePushEnabled" && browserPermission === "unsupported" && (
                <p className="mt-1 text-xs text-muted">This browser doesn&apos;t support push notifications.</p>
              )}
            </div>
            <span className="flex flex-shrink-0 items-center gap-2">
              {isSubmitting && <LoaderSpiner size={16} />}
              <input
                type="checkbox"
                checked={Boolean(toggles[toggle.key])}
                onChange={handleToggle(toggle.key)}
                disabled={isSubmitting}
                className="h-4 w-4"
              />
            </span>
          </label>
        ))}
      </div>
    </Card>
  );
};

export default NotificationSettings;
