import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import Card from "../../Components/Card/Card";
import InputBox from "../../Components/Form/InputBox/InputBox";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import { formatDate } from "../../Utils/utils";
import { getRazorpaySettings, updateRazorpaySettings } from "./razorpaySettingsService";

// Credentials live in the DB (IntegrationSettings, integrationKey:
// "razorpay"), same pattern as Shiprocket. Key ID is plain and comes back
// as-is; Key Secret and Webhook Secret are write-only — the API never sends
// the real value back, only `hasKeySecret`/`hasWebhookSecret`, so both stay
// blank here unless the admin wants to replace them. The webhook secret is
// set independently in Razorpay's own dashboard when you register the
// webhook URL (POST /api/webhooks/razorpay) — paste that same value here so
// signature verification matches.
const RazorpaySettings = () => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { keyId: "", keySecret: "", webhookSecret: "" } });

  useEffect(() => {
    getRazorpaySettings(setSettings, setIsLoading);
  }, []);

  useEffect(() => {
    if (settings) {
      reset({
        keyId: settings.config?.keyId || "",
        keySecret: "",
        webhookSecret: "",
      });
    }
  }, [settings, reset]);

  const hasKeySecret = Boolean(settings?.config?.hasKeySecret);
  const hasWebhookSecret = Boolean(settings?.config?.hasWebhookSecret);

  const onSubmit = async (values) => {
    const config = { keyId: values.keyId };
    if (values.keySecret) config.keySecret = values.keySecret;
    if (values.webhookSecret) config.webhookSecret = values.webhookSecret;
    await updateRazorpaySettings(config, setSettings, setIsSubmitting);
  };

  return (
    <div>
      <BreadCrumb title="Razorpay Settings" items={[{ label: "Integrations" }, { label: "Razorpay" }]} />

      {isLoading ? (
        <PreLoader />
      ) : (
        <Card className="max-w-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="section-title">Razorpay Credentials</h3>
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: hasKeySecret ? "var(--success-tp, #16a34a22)" : "var(--danger-tp, #dc262622)",
                color: hasKeySecret ? "var(--success, #16a34a)" : "var(--danger, #dc2626)",
              }}
            >
              {hasKeySecret ? "Configured" : "Not configured"}
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <InputBox
              label="Key ID"
              name="keyId"
              type="text"
              register={register}
              rules={{ required: "Key ID is required" }}
              error={errors.keyId}
              placeholder="rzp_live_xxxxxxxxxxxx"
              required
            />
            <InputBox
              label="Key Secret"
              name="keySecret"
              type="password"
              register={register}
              rules={{ required: hasKeySecret ? false : "Key Secret is required" }}
              error={errors.keySecret}
              placeholder={hasKeySecret ? "Leave blank to keep current Key Secret" : ""}
              required={!hasKeySecret}
            />
            <InputBox
              label="Webhook Secret"
              name="webhookSecret"
              type="password"
              register={register}
              error={errors.webhookSecret}
              placeholder={
                hasWebhookSecret
                  ? "Leave blank to keep current Webhook Secret"
                  : "From Razorpay Dashboard > Webhooks (used by /api/webhooks/razorpay)"
              }
            />
            <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? <LoaderSpiner size={18} /> : "Save Settings"}
            </button>
          </form>

          {settings?.updatedAt && (
            <p className="mt-3 text-xs text-muted">Last updated {formatDate(settings.updatedAt, "DD MMM YYYY, hh:mm A")}</p>
          )}
        </Card>
      )}
    </div>
  );
};

export default RazorpaySettings;
