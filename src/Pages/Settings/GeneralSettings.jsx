import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdAdd, MdClose, MdDeleteSweep } from "react-icons/md";
import Card from "../../Components/Card/Card";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import ConfirmModal from "../../Components/Modal/ConfirmModal";
import usePageReload from "../../Hooks/usePageReload";
import { useSettings } from "../../Context/SettingsContext";
import { updateWebSettings } from "./webSettingsService";
import adminApi from "../../Service/api";

// datetime-local inputs want "YYYY-MM-DDTHH:mm" in the browser's own local
// time — new Date(iso) + these getters already resolve to local time, no
// timezone math needed since admin and storefront both run on IST.
function toDatetimeLocalValue(isoString) {
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const DEFAULT_COUNTDOWN_FORM = {
  enabled: false,
  title: "",
  description: "",
  endText: "",
  targetDate: "",
  position: "below-header",
};

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
    await updateWebSettings(
      { codEnabled: event.target.checked },
      setSettings,
      setIsSubmitting,
    );
  };

  const handleToggleMobileVerification = async (event) => {
    await updateWebSettings(
      { mobileVerificationRequired: event.target.checked },
      setSettings,
      setIsSubmitting,
    );
  };

  const [isSavingRewardMode, setIsSavingRewardMode] = useState(false);
  const handleCartRewardMode = async (mode) => {
    await updateWebSettings(
      { cartRewardMode: mode },
      setSettings,
      setIsSavingRewardMode,
    );
  };

  const [confirmCleanupOpen, setConfirmCleanupOpen] = useState(false);
  const [isCleaningCarts, setIsCleaningCarts] = useState(false);
  const handleCleanupAbandonedCarts = async () => {
    try {
      setIsCleaningCarts(true);
      const res = await adminApi.cleanupAbandonedCarts();
      if (res.data.action) {
        toast.success(res.data.message || "Cleanup complete");
      } else {
        toast.error(res.data.message);
      }
    } catch (e) {
      toast.error(
        e?.response?.data?.message || "Failed to clean up abandoned carts",
      );
    } finally {
      setIsCleaningCarts(false);
      setConfirmCleanupOpen(false);
    }
  };

  // Local draft buffer — text/date fields save on an explicit "Save
  // changes" click, not per keystroke like the plain toggles above. Seeded
  // once from settings the first time launchCountdown arrives.
  const [countdownForm, setCountdownForm] = useState(DEFAULT_COUNTDOWN_FORM);
  const [countdownLoaded, setCountdownLoaded] = useState(false);
  const [isSavingCountdown, setIsSavingCountdown] = useState(false);

  useEffect(() => {
    if (countdownLoaded || !settings?.launchCountdown) return;
    const lc = settings.launchCountdown;
    setCountdownForm({
      enabled: Boolean(lc.enabled),
      title: lc.title || "",
      description: lc.description || "",
      endText: lc.endText || "",
      targetDate: lc.targetDate ? toDatetimeLocalValue(lc.targetDate) : "",
      position: lc.position || "below-header",
    });
    setCountdownLoaded(true);
  }, [settings, countdownLoaded]);

  const handleSaveCountdown = async () => {
    if (countdownForm.enabled && !countdownForm.targetDate) {
      toast.error("Set a target date before enabling the countdown");
      return;
    }
    await updateWebSettings(
      {
        launchCountdown: {
          enabled: countdownForm.enabled,
          title: countdownForm.title,
          description: countdownForm.description,
          endText: countdownForm.endText,
          targetDate: countdownForm.targetDate
            ? new Date(countdownForm.targetDate).toISOString()
            : null,
          position: countdownForm.position,
        },
      },
      setSettings,
      setIsSavingCountdown,
    );
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
    const ok = await updateWebSettings(
      { mixWeightIncrementsGrams: next },
      setSettings,
      setIsSavingIncrements,
    );
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
      {/* 2-col desktop / 1-col mobile-tablet (see tailwind.config.js — this
          project's breakpoints are max-width/desktop-first, so `md:` here
          means "collapse at tablet-and-below", not "expand at tablet-and-
          up"). Naturally-compact cards (a toggle pair, two radio options)
          sit two-up; longer ones (a chip list, a full form) declare
          col-span-2 to take the full row instead of being squeezed. Plain
          CSS grid auto-flow (no `dense`) — a short card added later just
          slots in next to Cart Housekeeping below without any of this
          needing to change. */}
      <div className="grid grid-cols-2 gap-5 md:grid-cols-1">
      <Card>
        <h3 className="section-title mb-4">Payments &amp; Fulfillment</h3>

        <label
          className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border py-3"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
              Enable Cash on Delivery site-wide
            </p>
            <p className="text-xs text-muted">
              When off, COD is never offered at checkout, regardless of any
              product&apos;s own COD setting.
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
              Off by default until a real SMS provider is configured
              (OTP_PROVIDER in the backend&apos;s .env). While off, customers
              skip straight to entering shipping details — a plain phone number
              field there is still required per order, just not OTP-verified.
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

      <Card>
        <h3 className="section-title mb-1">Cart Reward Tiers</h3>
        <p className="mb-4 text-sm text-muted">
          When a cart clears several reward thresholds at once (see the Cart
          Rewards page), choose whether the customer gets only the single
          best-qualifying gift, or every qualifying tier&apos;s gift stacked
          together.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          {[
            {
              value: "highest",
              title: "Only the highest tier",
              desc: "One free gift — the best one they qualify for.",
            },
            {
              value: "all",
              title: "Stack all qualifying tiers",
              desc: "A free gift for every threshold cleared.",
            },
          ].map((option) => (
            <label
              key={option.value}
              className="flex flex-1 cursor-pointer items-start gap-3 rounded-lg border p-3"
              style={{
                borderColor:
                  (settings?.cartRewardMode || "highest") === option.value
                    ? "var(--primary)"
                    : "var(--border)",
                backgroundColor:
                  (settings?.cartRewardMode || "highest") === option.value
                    ? "var(--primary-tp)"
                    : "transparent",
              }}
            >
              <input
                type="radio"
                name="cartRewardMode"
                value={option.value}
                checked={
                  (settings?.cartRewardMode || "highest") === option.value
                }
                onChange={() => handleCartRewardMode(option.value)}
                disabled={isSavingRewardMode}
                className="mt-1 h-4 w-4"
              />
              <span>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text)" }}
                >
                  {option.title}
                </p>
                <p className="text-xs text-muted">{option.desc}</p>
              </span>
            </label>
          ))}
          {isSavingRewardMode && <LoaderSpiner size={16} />}
        </div>
      </Card>

      <Card className="col-span-2">
        <h3 className="section-title mb-1">Build Your Own Mix</h3>
        <p className="mb-4 text-sm text-muted">
          Weight increments customers can add per ingredient on the mix builder
          — a customer never free-types a gram amount, only picks from this
          list.
        </p>

        <div className="mb-3 flex flex-wrap gap-2">
          {increments.map((grams) => (
            <span
              key={grams}
              className="flex items-center gap-1.5 rounded-full py-1.5 pl-3 pr-2 text-sm font-medium"
              style={{
                backgroundColor: "var(--primary-tp)",
                color: "var(--primary)",
              }}
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
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), addIncrement())
            }
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

      <Card className="col-span-2">
        <h3 className="section-title mb-1">Launch / Sale Countdown</h3>
        <p className="mb-4 text-sm text-muted">
          A dismissible countdown banner shown on the storefront, ticking down
          to a date you set here. Reusable for any future campaign, not just the
          initial launch — just edit these fields again and re-enable whenever
          the next sale needs one. It also stops showing itself automatically
          the moment the target date/time passes, so there&apos;s nothing to
          remember to switch off.
        </p>

        <label
          className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-3"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
              Show countdown on the website
            </p>
            <p className="text-xs text-muted">
              Needs a target date set below before it can be enabled.
            </p>
          </div>
          <input
            type="checkbox"
            checked={countdownForm.enabled}
            onChange={(e) =>
              setCountdownForm((f) => ({ ...f, enabled: e.target.checked }))
            }
            className="h-4 w-4"
          />
        </label>

        <div className="mt-4 grid gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Heading
            </label>
            <input
              type="text"
              value={countdownForm.title}
              onChange={(e) =>
                setCountdownForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Sehat Potli is launching soon."
              maxLength={120}
              className="inputBox w-full"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Description
            </label>
            <textarea
              value={countdownForm.description}
              onChange={(e) =>
                setCountdownForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Get ready to shop goodness for every home."
              maxLength={280}
              rows={2}
              className="inputBox w-full"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Text after countdown ends
            </label>
            <input
              type="text"
              value={countdownForm.endText}
              onChange={(e) =>
                setCountdownForm((f) => ({ ...f, endText: e.target.value }))
              }
              placeholder="Website launched. Welcome to Sehat Potli!"
              maxLength={280}
              className="inputBox w-full"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Target date &amp; time
              </label>
              <input
                type="datetime-local"
                value={countdownForm.targetDate}
                onChange={(e) =>
                  setCountdownForm((f) => ({
                    ...f,
                    targetDate: e.target.value,
                  }))
                }
                className="inputBox w-full"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Where to show it
              </label>
              <select
                value={countdownForm.position}
                onChange={(e) =>
                  setCountdownForm((f) => ({ ...f, position: e.target.value }))
                }
                className="inputBox w-full"
              >
                <option value="below-header">
                  Bar below the header (scrolls with the page)
                </option>
                <option value="fixed-center">
                  Floating card, centered (fixed while scrolling)
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            className="btn-primary"
            onClick={handleSaveCountdown}
            disabled={isSavingCountdown}
          >
            Save changes
          </button>
          {isSavingCountdown && <LoaderSpiner size={16} />}
        </div>
      </Card>

      <Card>
        <h3 className="section-title mb-1">Cart Housekeeping</h3>
        <p className="mb-4 text-sm text-muted">
          Removes customer Cart rows (and their items) that haven&apos;t been
          touched in 60+ days — pure database hygiene, has no effect on any
          customer&apos;s current shopping session. Not automatic yet (no
          scheduler is set up for this project) — run it manually now and then.
        </p>
        <button
          type="button"
          className="btn-outline"
          onClick={() => setConfirmCleanupOpen(true)}
        >
          <MdDeleteSweep size={16} />
          Clean up abandoned carts
        </button>
      </Card>
      </div>

      <ConfirmModal
        open={confirmCleanupOpen}
        onClose={() => setConfirmCleanupOpen(false)}
        onConfirm={handleCleanupAbandonedCarts}
        isLoading={isCleaningCarts}
        title="Clean up abandoned carts?"
        message="Permanently deletes any customer cart untouched for 60+ days. This cannot be undone, though a customer's cart is simply recreated empty the next time they add something."
      />
    </>
  );
};

export default GeneralSettings;
