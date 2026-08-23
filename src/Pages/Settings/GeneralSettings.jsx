import { useCallback, useState } from "react";
import Card from "../../Components/Card/Card";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import usePageReload from "../../Hooks/usePageReload";
import { useSettings } from "../../Context/SettingsContext";
import { updateWebSettings } from "./webSettingsService";

// Site-wide business settings — starts with just the COD toggle; more
// settings (maintenanceMode, minOrderValue, ...) get added here later as
// more rows in this same tab, not a new table/page each time. Reads/writes
// through SettingsContext (fetched once at AdminLayout level) rather than
// its own GET, so General and Notifications tabs always agree.
const GeneralSettings = () => {
  const { settings, isLoading, refetchSettings, setSettings } = useSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSettings = useCallback(() => refetchSettings(), [refetchSettings]);
  usePageReload(fetchSettings);

  const handleToggleCod = async (event) => {
    await updateWebSettings({ codEnabled: event.target.checked }, setSettings, setIsSubmitting);
  };

  const handleToggleMobileVerification = async (event) => {
    await updateWebSettings({ mobileVerificationRequired: event.target.checked }, setSettings, setIsSubmitting);
  };

  if (isLoading) return <PreLoader />;

  return (
    <Card className="max-w-xl">
      <h3 className="section-title mb-4">Payments &amp; Fulfillment</h3>

      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border py-3" style={{ borderColor: "var(--border)" }}>
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
            Enable Cash on Delivery site-wide
          </p>
          <p className="text-xs text-muted">
            When off, COD is never offered at checkout, regardless of any product&apos;s own COD setting.
          </p>
        </div>
        <span className="flex items-center gap-2">
          {isSubmitting && <LoaderSpiner size={16} />}
          <input
            type="checkbox"
            checked={Boolean(settings?.codEnabled)}
            onChange={handleToggleCod}
            disabled={isSubmitting}
            className="h-4 w-4"
          />
        </span>
      </label>

      <label
        className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-lg border py-3"
        style={{ borderColor: "var(--border)" }}
      >
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
            Require mobile OTP verification at checkout
          </p>
          <p className="text-xs text-muted">
            Off by default until a real SMS provider is configured (OTP_PROVIDER in the backend&apos;s
            .env). While off, customers skip straight to entering shipping details — a plain phone
            number field there is still required per order, just not OTP-verified.
          </p>
        </div>
        <span className="flex items-center gap-2">
          {isSubmitting && <LoaderSpiner size={16} />}
          <input
            type="checkbox"
            checked={Boolean(settings?.mobileVerificationRequired)}
            onChange={handleToggleMobileVerification}
            disabled={isSubmitting}
            className="h-4 w-4"
          />
        </span>
      </label>
    </Card>
  );
};

export default GeneralSettings;
