import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Card from "../../Components/Card/Card";
import InputBox from "../../Components/Form/InputBox/InputBox";
import CustomModal from "../../Components/Modal/Modal";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import usePageReload from "../../Hooks/usePageReload";
import {
  getRazorpaySettings,
  updateRazorpayModeCredentials,
  switchRazorpayActiveMode,
} from "./razorpaySettingsService";

const MODES = ["test", "live"];

const MODE_SWITCH_WARNINGS = {
  test: "The live site will start accepting only test payments — real customers will not be charged. Continue?",
  live: "The live site will start accepting real payments. Continue?",
};

// Credentials live in the DB (IntegrationSettings, integrationKey:
// "razorpay"), same pattern as Shiprocket — now split into independent
// test/live credential sets plus an activeMode switch (see
// utils/razorpay.js). Key Secret and Webhook Secret are write-only per mode:
// the API never sends the real value back, only *Set flags, so both stay
// blank here unless the admin wants to replace them. Key ID isn't a secret,
// so it comes back as plain text and is pre-filled.
//
// "Which mode's form am I looking at" (viewMode, local-only) is deliberately
// separate from "which mode is actually live on the site" (activeMode,
// server state) — the admin can freely inspect/edit either mode's
// credentials without that alone affecting the live site. Only the
// dedicated "Make Active" action (behind a confirmation) changes activeMode.
const RazorpaySettings = () => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [viewMode, setViewMode] = useState("live");
  const [confirmMode, setConfirmMode] = useState(null); // mode pending confirmation, or null

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { keyId: "", keySecret: "", webhookSecret: "" } });

  const fetchRazorpaySettings = useCallback(() => getRazorpaySettings(setSettings, setIsLoading), []);
  usePageReload(fetchRazorpaySettings);

  useEffect(() => {
    if (settings) setViewMode(settings.activeMode);
  }, [settings]);

  useEffect(() => {
    if (!settings) return;
    const modeConfig = settings.modes?.[viewMode] || {};
    reset({ keyId: modeConfig.keyIdValue || "", keySecret: "", webhookSecret: "" });
  }, [settings, viewMode, reset]);

  const onSubmit = async (values) => {
    const config = { keyId: values.keyId };
    if (values.keySecret) config.keySecret = values.keySecret;
    if (values.webhookSecret) config.webhookSecret = values.webhookSecret;
    await updateRazorpayModeCredentials(viewMode, config, setSettings, setIsSubmitting);
  };

  const handleConfirmSwitch = async () => {
    const ok = await switchRazorpayActiveMode(confirmMode, setSettings, setIsSwitching);
    if (ok) setConfirmMode(null);
  };

  if (isLoading) return <PreLoader />;

  const activeMode = settings?.activeMode || "live";
  const modeStatus = (mode) => settings?.modes?.[mode] || {};
  const viewModeConfig = modeStatus(viewMode);

  return (
    <div>
      <Card className="max-w-2xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex overflow-hidden rounded-lg border" style={{ borderColor: "var(--border)" }}>
            {MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className="px-4 py-1.5 text-sm font-medium capitalize transition-colors"
                style={
                  viewMode === mode
                    ? { backgroundColor: "var(--primary)", color: "#fff" }
                    : { color: "var(--text)" }
                }
              >
                {mode}
              </button>
            ))}
          </div>

          <span
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{
              backgroundColor: activeMode === "live" ? "var(--danger-tp, #dc262622)" : "var(--success-tp, #16a34a22)",
              color: activeMode === "live" ? "var(--danger, #dc2626)" : "var(--success, #16a34a)",
            }}
          >
            Currently active: {activeMode === "live" ? "Live" : "Test"}
          </span>
        </div>

        {viewMode !== activeMode && (
          <button
            type="button"
            onClick={() => setConfirmMode(viewMode)}
            className="btn-outline mb-4 w-full"
            disabled={isSwitching}
          >
            {isSwitching ? <LoaderSpiner size={16} /> : `Make ${viewMode === "live" ? "Live" : "Test"} the Active Mode`}
          </button>
        )}

        <h3 className="section-title mb-4">{viewMode === "live" ? "Live" : "Test"} Credentials</h3>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <InputBox
            label="Key ID"
            name="keyId"
            type="text"
            register={register}
            rules={{ required: "Key ID is required" }}
            error={errors.keyId}
            placeholder={viewMode === "live" ? "rzp_live_xxxxxxxxxxxx" : "rzp_test_xxxxxxxxxxxx"}
            required
          />
          <InputBox
            label="Key Secret"
            name="keySecret"
            type="password"
            register={register}
            rules={{ required: viewModeConfig.keySecretSet ? false : "Key Secret is required" }}
            error={errors.keySecret}
            placeholder={viewModeConfig.keySecretSet ? "Leave blank to keep current Key Secret" : ""}
            required={!viewModeConfig.keySecretSet}
          />
          <InputBox
            label="Webhook Secret"
            name="webhookSecret"
            type="password"
            register={register}
            error={errors.webhookSecret}
            placeholder={
              viewModeConfig.webhookSecretSet
                ? "Leave blank to keep current Webhook Secret"
                : "From Razorpay Dashboard > Webhooks (used by /api/webhooks/razorpay)"
            }
          />
          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? <LoaderSpiner size={18} /> : `Save ${viewMode === "live" ? "Live" : "Test"} Settings`}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2 border-t pt-4" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Status — Both Modes</p>
          {MODES.map((mode) => {
            const status = modeStatus(mode);
            return (
              <div key={mode} className="flex flex-wrap items-center gap-2 text-xs">
                <span className="w-10 font-medium capitalize" style={{ color: "var(--text)" }}>
                  {mode}:
                </span>
                <span style={{ color: status.keyIdSet ? "var(--success, #16a34a)" : "var(--danger, #dc2626)" }}>
                  Key ID {status.keyIdSet ? "✓" : "✗"}
                </span>
                <span style={{ color: status.keySecretSet ? "var(--success, #16a34a)" : "var(--danger, #dc2626)" }}>
                  Key Secret {status.keySecretSet ? "✓" : "✗"}
                </span>
                <span style={{ color: status.webhookSecretSet ? "var(--success, #16a34a)" : "var(--danger, #dc2626)" }}>
                  Webhook {status.webhookSecretSet ? "✓" : "✗"}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <CustomModal
        open={Boolean(confirmMode)}
        onClose={() => setConfirmMode(null)}
        onConfirm={handleConfirmSwitch}
        isLoading={isSwitching}
        title={`Switch to ${confirmMode === "live" ? "Live" : "Test"} Mode?`}
        confirmLabel="Switch Mode"
        confirmVariant={confirmMode === "live" ? "danger" : "primary"}
        body={<p className="text-sm text-muted">{confirmMode && MODE_SWITCH_WARNINGS[confirmMode]}</p>}
      />
    </div>
  );
};

export default RazorpaySettings;
