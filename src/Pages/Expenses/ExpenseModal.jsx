import { useEffect } from "react";
import { useForm } from "react-hook-form";
import CustomModal from "../../Components/Modal/Modal";
import InputBox from "../../Components/Form/InputBox/InputBox";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";

function todayDateOnly() {
  return new Date().toISOString().slice(0, 10);
}

const ExpenseModal = ({ open, onClose, onSubmit, editing, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { itemName: "", purchasePrice: "", purchaseDate: todayDateOnly(), notes: "" },
  });

  // Re-seed the form every time the modal opens for a different target
  // (add vs a specific edit row) — purchaseDate defaults to today for a
  // fresh add, but shows the real stored date when editing.
  useEffect(() => {
    if (!open) return;
    if (editing) {
      reset({
        itemName: editing.itemName,
        purchasePrice: editing.purchasePrice,
        purchaseDate: editing.purchaseDate,
        notes: editing.notes || "",
      });
    } else {
      reset({ itemName: "", purchasePrice: "", purchaseDate: todayDateOnly(), notes: "" });
    }
  }, [open, editing, reset]);

  const submit = handleSubmit((values) => {
    onSubmit({
      itemName: values.itemName,
      purchasePrice: Number(values.purchasePrice),
      purchaseDate: values.purchaseDate,
      notes: values.notes || null,
    });
  });

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title={editing ? "Edit Expense" : "Add Expense"}
      size="xs"
      body={
        <form onSubmit={submit} noValidate>
          <InputBox
            label="Item Name"
            name="itemName"
            register={register}
            rules={{ required: "Item name is required" }}
            error={errors.itemName}
            placeholder="e.g. Almonds bulk pack"
            required
          />
          <InputBox
            label="Purchase Price (₹)"
            name="purchasePrice"
            type="number"
            step="0.01"
            min="0"
            register={register}
            rules={{
              required: "Purchase price is required",
              min: { value: 0, message: "Price cannot be negative" },
            }}
            error={errors.purchasePrice}
            placeholder="0.00"
            required
          />
          <InputBox
            label="Purchase Date"
            name="purchaseDate"
            type="date"
            register={register}
            rules={{ required: "Purchase date is required" }}
            error={errors.purchaseDate}
            required
          />
          <InputBox
            label="Notes"
            name="notes"
            as="textarea"
            register={register}
            placeholder="Optional"
          />

          <div className="mt-2 flex gap-3">
            <button type="button" className="btn-outline flex-1" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={isSubmitting}>
              {isSubmitting ? <LoaderSpiner size={18} /> : editing ? "Save" : "Add Expense"}
            </button>
          </div>
        </form>
      }
    />
  );
};

export default ExpenseModal;
