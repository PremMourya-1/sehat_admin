import { useCallback, useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import Card from "../../Components/Card/Card";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import usePageReload from "../../Hooks/usePageReload";
import { useSettings } from "../../Context/SettingsContext";
import { useNotifications } from "../../Context/NotificationContext";
import { updateWebSettings } from "./webSettingsService";
import { sendTestWhatsappMessage } from "./whatsappSettingsService";

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

// The 4 order-status events that have an admin-configurable WhatsApp
// template (see WhatsAppSettings.jsx) — same keys the backend's
// TEST_PARAMS_BY_EVENT (utils/whatsapp.js) has dummy data for.
const TEST_EVENT_OPTIONS = [
  { value: "orderConfirmed", label: "Order Placed / Confirmed" },
  { value: "orderDispatched", label: "Order Dispatched" },
  { value: "orderOutForDelivery", label: "Out for Delivery" },
  { value: "orderDelivered", label: "Delivered" },
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
  const [testPhone, setTestPhone] = useState("");
  const [testEvent, setTestEvent] = useState(TEST_EVENT_OPTIONS[0].value);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [lastTestResult, setLastTestResult] = useState(null);

  const fetchSettings = useCallback(() => refetchSettings(), [refetchSettings]);
  usePageReload(fetchSettings);

  const toggles = settings?.notifications || {};

  const handleToggle = (key) => async (event) => {
    await updateWebSettings({ notifications: { [key]: event.target.checked } }, setSettings, setIsSubmitting);
  };

  const handleChannelChange = async (value) => {
    await updateWebSettings({ notificationChannel: value }, setSettings, setIsSavingChannel);
  };

  const handleSendTest = async () => {
    const digits = testPhone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setLastTestResult({ message: "Enter a valid 10-digit mobile number.", isError: true });
      return;
    }
    const result = await sendTestWhatsappMessage(digits, testEvent, setIsSendingTest);
    setLastTestResult({
      message: result.success ? result.message : `Send FAILED: ${result.error}`,
      isError: !result.success,
    });
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

      {/* For testing only — sends one of the 4 order-status WhatsApp
          templates, with dummy placeholder data, straight to any number.
          Doesn't touch a real order or require one to exist. The whole
          point is showing the real Meta error (unapproved template, bad
          credentials, missing send permission) right here instead of it
          only ever being logged server-side — see
          memory/whatsapp_integration_architecture.md's round 1-3 for the
          kinds of issues this is meant to surface quickly. */}
      <div
        className="card"
        style={{ border: "1px dashed var(--warning, #d97706)", background: "var(--warning-tp, #d9770611)" }}
      >
        <h3 className="section-title mb-1 flex items-center gap-1.5" style={{ color: "var(--warning, #d97706)" }}>
          <FiAlertTriangle size={15} /> Send Test WhatsApp Message
        </h3>
        <p className="mb-4 text-xs text-muted">
          Sends the selected event&apos;s approved template, with dummy order data, to any WhatsApp number — use this
          to confirm templates are actually delivering before relying on real orders.
        </p>

        <div className="flex flex-col gap-2">
          <input
            type="tel"
            className="inputBox"
            placeholder="10-digit mobile number"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            disabled={isSendingTest}
            maxLength={10}
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={testEvent}
              onChange={(e) => setTestEvent(e.target.value)}
              className="inputBox flex-1"
              disabled={isSendingTest}
            >
              {TEST_EVENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-primary !px-4 !py-1.5 !text-sm"
              onClick={handleSendTest}
              disabled={isSendingTest}
            >
              {isSendingTest ? <LoaderSpiner size={16} /> : "Send Test Message"}
            </button>
          </div>
        </div>

        {lastTestResult && (
          <p
            className="mt-3 text-xs"
            style={lastTestResult.isError ? { color: "var(--danger, #dc2626)" } : { color: "var(--muted)" }}
          >
            {lastTestResult.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default NotificationSettings;
