import { useEffect, useState } from "react";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import Card from "../../Components/Card/Card";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import { getWebSettings, updateWebSettings } from "./webSettingsService";

// Site-wide business settings, stored as one row in the backend's
// WebSettings table (see utils/webSettings.js) — starts with just the COD
// toggle; more settings (maintenanceMode, minOrderValue, ...) get added
// here later as more rows in this same page, not a new table/page each time.
const WebSettings = () => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getWebSettings(setSettings, setIsLoading);
  }, []);

  const handleToggleCod = async (event) => {
    await updateWebSettings({ codEnabled: event.target.checked }, setSettings, setIsSubmitting);
  };

  return (
    <div>
      <BreadCrumb title="Web Settings" items={[{ label: "Web Settings" }]} />

      {isLoading ? (
        <PreLoader />
      ) : (
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
        </Card>
      )}
    </div>
  );
};

export default WebSettings;
