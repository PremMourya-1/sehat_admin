import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import Card from "../../Components/Card/Card";
import InputBox from "../../Components/Form/InputBox/InputBox";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import { formatDate } from "../../Utils/utils";
import { getShiprocketSettings, updateShiprocketSettings } from "./shiprocketSettingsService";

// Credentials (and non-secret config like pickup location) live in the DB
// (IntegrationSettings), not .env — this codebase gets cloned per client, so
// a new clone gets set up from here instead of a code/.env change. The
// password field is write-only: the API never sends the real value back,
// only `hasPassword`, so it's left blank here unless the admin wants to
// replace it. pickupLocation isn't a secret, so it comes back as plain text
// and is pre-filled like email.
const ShiprocketSettings = () => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { email: "", password: "", pickupLocation: "" } });

  useEffect(() => {
    getShiprocketSettings(setSettings, setIsLoading);
  }, []);

  useEffect(() => {
    if (settings) {
      reset({
        email: settings.config?.email || "",
        password: "",
        pickupLocation: settings.config?.pickupLocation || "",
      });
    }
  }, [settings, reset]);

  const hasPassword = Boolean(settings?.config?.hasPassword);

  const onSubmit = async (values) => {
    const config = { email: values.email, pickupLocation: values.pickupLocation };
    if (values.password) config.password = values.password;
    await updateShiprocketSettings(config, setSettings, setIsSubmitting);
  };

  return (
    <div>
      <BreadCrumb title="Shiprocket Settings" items={[{ label: "Integrations" }, { label: "Shiprocket" }]} />

      {isLoading ? (
        <PreLoader />
      ) : (
        <Card className="max-w-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="section-title">Shiprocket Credentials</h3>
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: hasPassword ? "var(--success-tp, #16a34a22)" : "var(--danger-tp, #dc262622)",
                color: hasPassword ? "var(--success, #16a34a)" : "var(--danger, #dc2626)",
              }}
            >
              {hasPassword ? "Configured" : "Not configured"}
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <InputBox
              label="Shiprocket Email"
              name="email"
              type="email"
              register={register}
              rules={{ required: "Email is required" }}
              error={errors.email}
              required
            />
            <InputBox
              label="Shiprocket Password"
              name="password"
              type="password"
              register={register}
              rules={{ required: hasPassword ? false : "Password is required" }}
              error={errors.password}
              placeholder={hasPassword ? "Leave blank to keep current password" : ""}
              required={!hasPassword}
            />
            <InputBox
              label="Pickup Location"
              name="pickupLocation"
              type="text"
              register={register}
              rules={{ required: "Pickup location is required" }}
              error={errors.pickupLocation}
              placeholder="Pickup address nickname from your Shiprocket dashboard"
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

export default ShiprocketSettings;
