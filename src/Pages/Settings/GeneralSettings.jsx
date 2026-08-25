import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { MdAdd, MdClose } from "react-icons/md";
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
  const [isSavingIncrements, setIsSavingIncrements] = useState(false);
  const [newIncrement, setNewIncrement] = useState("");

  const fetchSettings = useCallback(() => refetchSettings(), [refetchSettings]);
  usePageReload(fetchSettings);

  const handleToggleCod = async (event) => {
    await updateWebSettings({ codEnabled: event.target.checked }, setSettings, setIsSubmitting);
  };

  const handleToggleMobileVerification = async (event) => {
    await updateWebSettings({ mobileVerificationRequired: event.target.checked }, setSettings, setIsSubmitting);
  };

  const increments = settings?.mixWeightIncrementsGrams || [];

  const addIncrement = async () => {
    const grams = Number(newIncrement);
    if (!Number.isInteger(grams) || grams <= 0) {
      toast.error("Enter a positive whole number of grams");
      return;
    }
    if (increments.includes(grams)) {
      toast.error(`${grams}g is already in the list`);
      return;
    }
    const next = [...increments, grams].sort((a, b) => a - b);
    const ok = await updateWebSettings({ mixWeightIncrementsGrams: next }, setSettings, setIsSavingIncrements);
    if (ok) setNewIncrement("");
  };

  const removeIncrement = async (grams) => {
    if (increments.length <= 1) {
      toast.error("At least one weight increment is required");
      return;
    }
    await updateWebSettings(
      { mixWeightIncrementsGrams: increments.filter((g) => g !== grams) },
      setSettings,
      setIsSavingIncrements,
    );
  };

  if (isLoading) return <PreLoader />;

  return (
    <>
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

    <Card className="mt-5 max-w-xl">
      <h3 className="section-title mb-1">Build Your Own Mix</h3>
      <p className="mb-4 text-sm text-muted">
        Weight increments customers can add per ingredient on the mix builder — a customer never
        free-types a gram amount, only picks from this list.
      </p>

      <div className="mb-3 flex flex-wrap gap-2">
        {increments.map((grams) => (
          <span
            key={grams}
            className="flex items-center gap-1.5 rounded-full py-1.5 pl-3 pr-2 text-sm font-medium"
            style={{ backgroundColor: "var(--primary-tp)", color: "var(--primary)" }}
          >
            {grams}g
            <button
              type="button"
              onClick={() => removeIncrement(grams)}
              disabled={isSavingIncrements}
              aria-label={`Remove ${grams}g`}
              className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-black/10"
            >
              <MdClose size={12} />
            </button>
          </span>
        ))}
        {isSavingIncrements && <LoaderSpiner size={16} />}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          min="1"
          value={newIncrement}
          onChange={(e) => setNewIncrement(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addIncrement())}
          placeholder="e.g. 200"
          className="inputBox w-32"
          disabled={isSavingIncrements}
        />
        <button
          type="button"
          onClick={addIncrement}
          disabled={isSavingIncrements || !newIncrement}
          className="btn-outline"
        >
          <MdAdd size={16} />
          Add
        </button>
      </div>
    </Card>
    </>
  );
};

export default GeneralSettings;
