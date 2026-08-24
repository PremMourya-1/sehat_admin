import { useEffect } from "react";
import { useForm } from "react-hook-form";
import CustomModal from "../../Components/Modal/Modal";
import InputBox from "../../Components/Form/InputBox/InputBox";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";

function todayDateOnly() {
  return new Date().toISOString().slice(0, 10);
}

const SaleModal = ({ open, onClose, onSubmit, editing, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { itemName: "", salePrice: "", saleDate: todayDateOnly(), notes: "" },
  });

  // Re-seed the form every time the modal opens for a different target
  // (add vs a specific edit row) — saleDate defaults to today for a fresh
  // add, but shows the real stored date when editing.
  useEffect(() => {
    if (!open) return;
    if (editing) {
      reset({
        itemName: editing.itemName,
        salePrice: editing.salePrice,
        saleDate: editing.saleDate,
        notes: editing.notes || "",
      });
    } else {
      reset({ itemName: "", salePrice: "", saleDate: todayDateOnly(), notes: "" });
    }
  }, [open, editing, reset]);

  const submit = handleSubmit((values) => {
    onSubmit({
      itemName: values.itemName,
      salePrice: Number(values.salePrice),
      // Sale date is optional per the offline-sale workflow — an empty
      // string means "let the backend default it to today"
      // (models/Sale.js: saleDate defaultValue DataTypes.NOW), unlike
      // Expense's purchaseDate which is always required.
      saleDate: values.saleDate || undefined,
      notes: values.notes || null,
    });
  });

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title={editing ? "Edit Sale" : "Add Sale"}
      size="sm"
      body={
        <form onSubmit={submit} noValidate>
          <InputBox
            label="Item Name"
            name="itemName"
            register={register}
            rules={{ required: "Item name is required" }}
            error={errors.itemName}
            placeholder="e.g. Mix Seeds (pumpkin, sunflower, flax)"
            required
          />
          <div className="formGroup">
            <label htmlFor="salePrice" className="form-label">
              Sale Price
              <span style={{ color: "var(--danger)" }}> *</span>
            </label>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: "var(--text-light)" }}
              >
                ₹
              </span>
              <input
                id="salePrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`inputBox pl-7 ${errors.salePrice ? "has-error" : ""}`}
                {...register("salePrice", {
                  required: "Sale price is required",
                  min: { value: 0, message: "Price cannot be negative" },
                })}
              />
            </div>
            {errors.salePrice && <p className="form-error">{errors.salePrice.message}</p>}
          </div>
          <InputBox
            label="Sale Date"
            name="saleDate"
            type="date"
            register={register}
            error={errors.saleDate}
          />
          <InputBox
            label="Notes"
            name="notes"
            as="textarea"
            register={register}
            placeholder="Optional — e.g. what all was in the mix"
          />

          <div className="mt-5 flex gap-3 border-t pt-4" style={{ borderColor: "var(--border)" }}>
            <button type="button" className="btn-outline flex-1" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={isSubmitting}>
              {isSubmitting ? <LoaderSpiner size={18} /> : editing ? "Save" : "Add Sale"}
            </button>
          </div>
        </form>
      }
    />
  );
};

export default SaleModal;
