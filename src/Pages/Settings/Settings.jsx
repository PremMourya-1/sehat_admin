import { useState } from "react";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import GeneralSettings from "./GeneralSettings";
import NotificationSettings from "./NotificationSettings";
import ShiprocketSettings from "./ShiprocketSettings";
import RazorpaySettings from "./RazorpaySettings";
import ResendSettings from "./ResendSettings";
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

      <div className="mb-5 flex overflow-hidden rounded-lg border" style={{ borderColor: "var(--border)", width: "fit-content" }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className="px-5 py-2 text-sm font-medium transition-colors"
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
          <div className="mb-4 flex gap-2">
            {INTEGRATIONS.map((integration) => (
              <button
                key={integration.key}
                type="button"
                onClick={() => setActiveIntegration(integration.key)}
                className={activeIntegration === integration.key ? "btn-primary !px-4 !py-1.5 !text-sm" : "btn-outline !px-4 !py-1.5 !text-sm"}
              >
                {integration.label}
              </button>
            ))}
          </div>

          {activeIntegration === "shiprocket" && <ShiprocketSettings />}
          {activeIntegration === "razorpay" && <RazorpaySettings />}
          {activeIntegration === "resend" && <ResendSettings />}
        </div>
      )}
    </div>
  );
};

export default Settings;
