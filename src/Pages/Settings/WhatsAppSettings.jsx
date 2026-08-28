import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Card from "../../Components/Card/Card";
import InputBox from "../../Components/Form/InputBox/InputBox";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import usePageReload from "../../Hooks/usePageReload";
import { formatDate } from "../../Utils/utils";
import { getWhatsappSettings, updateWhatsappSettings } from "./whatsappSettingsService";

// Credentials live in the DB (IntegrationSettings, integrationKey
// "whatsapp"), same reason as every other integration here. accessToken and
// webhookVerifyToken are write-only — the API only ever sends back
// `hasAccessToken`/`hasWebhookVerifyToken`, never the real value — so both
// are left blank here unless the admin wants to replace them.
// phoneNumberId/businessAccountId aren't secrets, so they come back as plain
// text and are pre-filled. Message-sending itself isn't wired up yet — this
// page only stores the credentials the webhook endpoint (and later,
// sending) needs; see backend controllers/webhookController.js.
const WhatsAppSettings = () => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { accessToken: "", phoneNumberId: "", businessAccountId: "", webhookVerifyToken: "" },
  });

  const fetchWhatsappSettings = useCallback(() => getWhatsappSettings(setSettings, setIsLoading), []);
  usePageReload(fetchWhatsappSettings);

  useEffect(() => {
    if (settings) {
      reset({
        accessToken: "",
        phoneNumberId: settings.config?.phoneNumberId || "",
        businessAccountId: settings.config?.businessAccountId || "",
        webhookVerifyToken: "",
      });
    }
  }, [settings, reset]);

  const hasAccessToken = Boolean(settings?.config?.hasAccessToken);
  const hasWebhookVerifyToken = Boolean(settings?.config?.hasWebhookVerifyToken);

  const onSubmit = async (values) => {
    const config = { phoneNumberId: values.phoneNumberId, businessAccountId: values.businessAccountId };
    if (values.accessToken) config.accessToken = values.accessToken;
    if (values.webhookVerifyToken) config.webhookVerifyToken = values.webhookVerifyToken;
    await updateWhatsappSettings(config, setSettings, setIsSubmitting);
  };

  return (
    <div>
      {isLoading ? (
        <PreLoader />
      ) : (
        <Card className="max-w-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="section-title">WhatsApp Credentials</h3>
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: hasAccessToken ? "var(--success-tp, #16a34a22)" : "var(--danger-tp, #dc262622)",
                color: hasAccessToken ? "var(--success, #16a34a)" : "var(--danger, #dc2626)",
              }}
            >
              {hasAccessToken ? "Configured" : "Not configured"}
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <InputBox
              label="Access Token"
              name="accessToken"
              type="password"
              register={register}
              rules={{ required: hasAccessToken ? false : "Access token is required" }}
              error={errors.accessToken}
              placeholder={hasAccessToken ? "Leave blank to keep current access token" : "Permanent token from Meta App Dashboard > WhatsApp > API Setup"}
              required={!hasAccessToken}
            />
            <InputBox
              label="Phone Number ID"
              name="phoneNumberId"
              type="text"
              register={register}
              rules={{ required: "Phone Number ID is required" }}
              error={errors.phoneNumberId}
              placeholder="From Meta App Dashboard > WhatsApp > API Setup"
              required
            />
            <InputBox
              label="WhatsApp Business Account ID"
              name="businessAccountId"
              type="text"
              register={register}
              error={errors.businessAccountId}
              placeholder="Optional — WABA ID from Meta Business Settings"
            />
            <InputBox
              label="Webhook Verify Token"
              name="webhookVerifyToken"
              type="password"
              register={register}
              rules={{ required: hasWebhookVerifyToken ? false : "Webhook verify token is required" }}
              error={errors.webhookVerifyToken}
              placeholder={hasWebhookVerifyToken ? "Leave blank to keep current verify token" : "Any string you choose — enter the same value in Meta's webhook config"}
              required={!hasWebhookVerifyToken}
            />
            <p className="mb-4 -mt-2 text-xs text-muted">
              Used to verify Meta&apos;s webhook setup request. Register <code>/api/webhooks/whatsapp</code> as the Callback URL
              in Meta App Dashboard &gt; WhatsApp &gt; Configuration, with this same token as the Verify Token.
            </p>
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

export default WhatsAppSettings;
