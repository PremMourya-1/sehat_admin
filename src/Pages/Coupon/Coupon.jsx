import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { MdAdd } from "react-icons/md";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import Button from "../../Components/Button/Button";
import Table from "../../Components/Table/Table";
import Drawer from "../../Components/Drawer/Drawer";
import ConfirmModal from "../../Components/Modal/ConfirmModal";
import InputBox from "../../Components/Form/InputBox/InputBox";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import UseFilter from "../../Hooks/UseFilter";
import usePageReload from "../../Hooks/usePageReload";
import useCouponColumns from "./CouponTable";
import { createCoupon, deleteCoupon, getCouponData, updateCoupon } from "./couponService";

const Coupon = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const { search, setSearch, filteredData } = UseFilter(data, ["code"]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      code: "",
      discountPercent: "",
      minOrderAmount: "",
      maxDiscountAmount: "",
      usageLimit: "",
      expiresAt: "",
      isActive: true,
    },
  });

  const fetchCoupons = useCallback(() => getCouponData(setData, setIsLoading), []);
  usePageReload(fetchCoupons);

  const openAdd = () => {
    setEditing(null);
    reset({
      code: "",
      discountPercent: "",
      minOrderAmount: "",
      maxDiscountAmount: "",
      usageLimit: "",
      expiresAt: "",
      isActive: true,
    });
    setDrawerOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    reset({
      code: row.code,
      discountPercent: row.discountPercent,
      minOrderAmount: row.minOrderAmount,
      maxDiscountAmount: row.maxDiscountAmount || "",
      usageLimit: row.usageLimit || "",
      expiresAt: row.expiresAt ? row.expiresAt.slice(0, 10) : "",
      isActive: row.isActive,
    });
    setDrawerOpen(true);
  };

  const columns = useCouponColumns({ onEdit: openEdit, onDelete: (row) => setToDelete(row) });

  const onSubmit = (values) => {
    const payload = {
      code: values.code.toUpperCase(),
      discountPercent: Number(values.discountPercent),
      minOrderAmount: values.minOrderAmount ? Number(values.minOrderAmount) : 0,
      maxDiscountAmount: values.maxDiscountAmount ? Number(values.maxDiscountAmount) : null,
      usageLimit: values.usageLimit ? Number(values.usageLimit) : null,
      expiresAt: values.expiresAt || null,
      isActive: !!values.isActive,
    };

    if (editing) {
      updateCoupon(editing.id, payload, setData, setIsSubmitting, () => setDrawerOpen(false));
    } else {
      createCoupon(payload, setData, setIsSubmitting, () => setDrawerOpen(false));
    }
  };

  const handleConfirmDelete = () => {
    deleteCoupon(toDelete.id, setData, setIsDeleting, () => setToDelete(null));
  };

  return (
    <div>
      <BreadCrumb title="Coupons" items={[{ label: "Coupons" }]} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by coupon code..."
          className="inputBox max-w-xs"
        />
        <Button icon={<MdAdd />} onClick={openAdd}>
          Add Coupon
        </Button>
      </div>

      <Table columns={columns} data={filteredData} isLoading={isLoading} emptyMessage="No coupons found" />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Edit Coupon" : "Add Coupon"}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <InputBox
            label="Coupon Code"
            name="code"
            register={register}
            rules={{ required: "Coupon code is required" }}
            error={errors.code}
            placeholder="e.g. SEHAT10"
            required
          />
          <InputBox
            label="Discount Percent"
            name="discountPercent"
            type="number"
            step="0.01"
            register={register}
            rules={{ required: "Discount percent is required" }}
            error={errors.discountPercent}
            placeholder="e.g. 10"
            required
          />
          <InputBox
            label="Minimum Order Amount"
            name="minOrderAmount"
            type="number"
            step="0.01"
            register={register}
            placeholder="0"
          />
          <InputBox
            label="Maximum Discount Amount"
            name="maxDiscountAmount"
            type="number"
            step="0.01"
            register={register}
            placeholder="No cap"
          />
          <InputBox label="Usage Limit" name="usageLimit" type="number" register={register} placeholder="Unlimited" />
          <InputBox label="Expires On" name="expiresAt" type="date" register={register} />

          <label className="mb-4 flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
            <input type="checkbox" {...register("isActive")} className="h-4 w-4" />
            Active
          </label>

          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? <LoaderSpiner size={18} /> : editing ? "Update Coupon" : "Create Coupon"}
          </button>
        </form>
      </Drawer>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete this coupon?"
        message={`"${toDelete?.code}" will be permanently removed.`}
      />
    </div>
  );
};

export default Coupon;
