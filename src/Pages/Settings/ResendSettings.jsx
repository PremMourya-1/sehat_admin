import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Card from "../../Components/Card/Card";
import InputBox from "../../Components/Form/InputBox/InputBox";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import usePageReload from "../../Hooks/usePageReload";
import { formatDate } from "../../Utils/utils";
import { getResendSettings, updateResendSettings } from "./resendSettingsService";

// Credentials live in the DB (IntegrationSettings), not .env — same
// clone-ability reason as Shiprocket/Razorpay. apiKey is write-only: the API
// never sends the real value back, only `hasApiKey`, so it's left blank
// here unless the admin wants to replace it. fromEmail isn't a secret, so
// it comes back as plain text and is pre-filled.
const ResendSettings = () => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { apiKey: "", fromEmail: "" } });

  const fetchResendSettings = useCallback(() => getResendSettings(setSettings, setIsLoading), []);
  usePageReload(fetchResendSettings);

  useEffect(() => {
    if (settings) {
      reset({ apiKey: "", fromEmail: settings.config?.fromEmail || "" });
    }
  }, [settings, reset]);

  const hasApiKey = Boolean(settings?.config?.hasApiKey);

  const onSubmit = async (values) => {
    const config = { fromEmail: values.fromEmail };
    if (values.apiKey) config.apiKey = values.apiKey;
    await updateResendSettings(config, setSettings, setIsSubmitting);
  };

  return (
    <div>
      {isLoading ? (
        <PreLoader />
      ) : (
        <Card className="max-w-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="section-title">Resend Credentials</h3>
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: hasApiKey ? "var(--success-tp, #16a34a22)" : "var(--danger-tp, #dc262622)",
                color: hasApiKey ? "var(--success, #16a34a)" : "var(--danger, #dc2626)",
              }}
            >
              {hasApiKey ? "Configured" : "Not configured"}
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <InputBox
              label="Resend API Key"
              name="apiKey"
              type="password"
              register={register}
              rules={{ required: hasApiKey ? false : "API key is required" }}
              error={errors.apiKey}
              placeholder={hasApiKey ? "Leave blank to keep current API key" : "re_xxxxxxxxxxxx"}
              required={!hasApiKey}
            />
            <InputBox
              label="From Email"
              name="fromEmail"
              type="email"
              register={register}
              rules={{ required: "From email is required" }}
              error={errors.fromEmail}
              placeholder="orders@yourdomain.com"
              required
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

export default ResendSettings;
