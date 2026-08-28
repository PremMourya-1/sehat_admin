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

const CHANNEL_OPTIONS = [
  {
    value: "email",
    title: "Email (Resend)",
    desc: "Order-status updates go out via the existing Resend integration.",
  },
  {
    value: "whatsapp",
    title: "WhatsApp",
    desc: "Order-status updates go out via WhatsApp template messages instead.",
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
  const [isSavingChannel, setIsSavingChannel] = useState(false);

  const fetchSettings = useCallback(() => refetchSettings(), [refetchSettings]);
  usePageReload(fetchSettings);

  const toggles = settings?.notifications || {};

  const handleToggle = (key) => async (event) => {
    await updateWebSettings({ notifications: { [key]: event.target.checked } }, setSettings, setIsSubmitting);
  };

  const handleChannelChange = async (value) => {
    await updateWebSettings({ notificationChannel: value }, setSettings, setIsSavingChannel);
  };

  if (isLoading) return <PreLoader />;

  return (
    // Same 2-col-desktop / 1-col-mobile grid as GeneralSettings.jsx (see its
    // top-of-render comment for the breakpoint-direction note) — both cards
    // here are naturally compact, so they sit side by side rather than each
    // wasting the other half of the row.
    <div className="grid grid-cols-2 gap-5 md:grid-cols-1">
      <Card>
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
                    Blocked at the browser level — this admin has denied notification permission for this site.
                    Enable it from the browser&apos;s site settings (usually the padlock icon next to the address
                    bar) for push notifications to actually show.
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

      <Card>
        <h3 className="section-title mb-1">Active Notification Channel</h3>
        <p className="mb-4 text-xs text-muted">
          Determines which channel new orders use for status notifications. Existing orders keep using whichever
          channel was active when they were placed.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          {CHANNEL_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex flex-1 cursor-pointer items-start gap-3 rounded-lg border p-3"
              style={{
                borderColor:
                  (settings?.notificationChannel || "email") === option.value ? "var(--primary)" : "var(--border)",
                backgroundColor:
                  (settings?.notificationChannel || "email") === option.value ? "var(--primary-tp)" : "transparent",
              }}
            >
              <input
                type="radio"
                name="notificationChannel"
                value={option.value}
                checked={(settings?.notificationChannel || "email") === option.value}
                onChange={() => handleChannelChange(option.value)}
                disabled={isSavingChannel}
                className="mt-1 h-4 w-4"
              />
              <span>
                <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                  {option.title}
                </p>
                <p className="text-xs text-muted">{option.desc}</p>
              </span>
            </label>
          ))}
          {isSavingChannel && <LoaderSpiner size={16} />}
        </div>
      </Card>
    </div>
  );
};

export default NotificationSettings;
