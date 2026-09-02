import { useState } from "react";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import GeneralSettings from "./GeneralSettings";
import NotificationSettings from "./NotificationSettings";
import ShiprocketSettings from "./ShiprocketSettings";
import RazorpaySettings from "./RazorpaySettings";
import ResendSettings from "./ResendSettings";
import WhatsAppSettings from "./WhatsAppSettings";
import ShippingZones from "./ShippingZones";

const TABS = [
  { key: "general", label: "General" },
  { key: "notifications", label: "Notifications" },
  { key: "shipping", label: "Shipping Zones" },
  { key: "integrations", label: "Integrations" },
];

const INTEGRATIONS = [
  { key: "shiprocket", label: "Shiprocket" },
  { key: "razorpay", label: "Razorpay" },
  { key: "resend", label: "Resend" },
  { key: "whatsapp", label: "WhatsApp" },
];

// Single umbrella page for every admin setting — General (site-wide
// toggles), Notifications (delivery-channel toggles), Integrations
// (Shiprocket/Razorpay credentials). New settings sections get added as
// another entry in TABS, never a new sidebar item or route.
const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [activeIntegration, setActiveIntegration] = useState("shiprocket");

  return (
    <div>
      <BreadCrumb title="Settings" items={[{ label: "Settings" }]} />

      {/* `overflow-x: auto` + `flex-shrink-0` buttons: on a narrow phone
          these 4 labels (esp. "Shipping Zones") don't fit in fit-content's
          natural width — rather than let that blow out the whole page's
          scrollWidth (a real horizontal-scroll-the-page bug this used to
          have), the tab strip itself scrolls horizontally, same "pill row"
          look intact on desktop where it already fits. */}
      <div
        className="mb-5 flex overflow-x-auto rounded-lg border"
        style={{ borderColor: "var(--border)", width: "fit-content", maxWidth: "100%" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className="flex-shrink-0 whitespace-nowrap px-5 py-2 text-sm font-medium transition-colors"
            style={
              activeTab === tab.key
                ? { backgroundColor: "var(--primary)", color: "#fff" }
                : { color: "var(--text)" }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && <GeneralSettings />}
      {activeTab === "notifications" && <NotificationSettings />}
      {activeTab === "shipping" && <ShippingZones />}

      {activeTab === "integrations" && (
        <div>
          {/* Same overflow-x-auto containment as the main Settings tab
              strip above — 4 buttons this wide don't fit a phone screen
              without either wrapping (breaks the row's look) or scrolling
              the page itself (the bug this fixes). */}
          <div className="mb-4 flex gap-2 overflow-x-auto">
            {INTEGRATIONS.map((integration) => (
              <button
                key={integration.key}
                type="button"
                onClick={() => setActiveIntegration(integration.key)}
                className={`flex-shrink-0 whitespace-nowrap ${activeIntegration === integration.key ? "btn-primary !px-4 !py-1.5 !text-sm" : "btn-outline !px-4 !py-1.5 !text-sm"}`}
              >
                {integration.label}
              </button>
            ))}
          </div>

          {activeIntegration === "shiprocket" && <ShiprocketSettings />}
          {activeIntegration === "razorpay" && <RazorpaySettings />}
          {activeIntegration === "resend" && <ResendSettings />}
          {activeIntegration === "whatsapp" && <WhatsAppSettings />}
        </div>
      )}
    </div>
  );
};

export default Settings;
