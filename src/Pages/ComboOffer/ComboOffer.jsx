import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MdAdd, MdDeleteOutline, MdEdit } from "react-icons/md";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import Button from "../../Components/Button/Button";
import Card from "../../Components/Card/Card";
import Drawer from "../../Components/Drawer/Drawer";
import ConfirmModal from "../../Components/Modal/ConfirmModal";
import InputBox from "../../Components/Form/InputBox/InputBox";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import NoRecords from "../../Components/NoRecords/NoRecords";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import {
  createComboOffer,
  deleteComboOffer,
  getComboOfferData,
  toggleComboOfferStatus,
  updateComboOffer,
} from "./comboOfferService";

const DEFAULT_VALUES = { title: "", description: "", discountLabel: "", ctaLabel: "Shop Now", ctaLink: "/products" };

const ComboOffer = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    getComboOfferData(setData, setIsLoading);
  }, []);

  const openAdd = () => {
    setEditing(null);
    reset(DEFAULT_VALUES);
    setDrawerOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    reset({
      title: row.title,
      description: row.description || "",
      discountLabel: row.discountLabel || "",
      ctaLabel: row.ctaLabel || "Shop Now",
      ctaLink: row.ctaLink || "/products",
    });
    setDrawerOpen(true);
  };

  const onSubmit = (values) => {
    if (editing) {
      updateComboOffer(editing.id, values, setData, setIsSubmitting, () => setDrawerOpen(false));
    } else {
      createComboOffer(values, setData, setIsSubmitting, () => setDrawerOpen(false));
    }
  };

  const handleConfirmDelete = () => {
    deleteComboOffer(toDelete.id, setData, setIsDeleting, () => setToDelete(null));
  };

  return (
    <div>
      <BreadCrumb title="Combo & Bundle Offers" items={[{ label: "Combo Offers" }]} />

      <div className="mb-4 flex justify-end">
        <Button icon={<MdAdd />} onClick={openAdd}>
          Add Offer
        </Button>
      </div>

      {isLoading ? (
        <PreLoader />
      ) : data.length === 0 ? (
        <NoRecords message="No combo offers found" />
      ) : (
        <div className="grid grid-cols-3 gap-4 lg:grid-cols-2 xs:grid-cols-1">
          {data.map((offer) => (
            <Card key={offer.id}>
              {offer.discountLabel && (
                <span className="mb-2 inline-block w-fit rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: "var(--primary-tp)", color: "var(--primary)" }}>
                  {offer.discountLabel}
                </span>
              )}
              <h3 className="section-title">{offer.title}</h3>
              <p className="mt-1 text-sm text-muted">{offer.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
                  <input
                    type="checkbox"
                    checked={!!offer.status}
                    onChange={(e) => toggleComboOfferStatus(offer.id, e.target.checked, setData)}
                    className="h-4 w-4"
                  />
                  {offer.status ? "Active" : "Inactive"}
                </label>
                <div className="flex items-center gap-2">
                  <button type="button" className="action-icon-edit" onClick={() => openEdit(offer)} aria-label="Edit offer">
                    <MdEdit />
                  </button>
                  <button type="button" className="action-icon-delete" onClick={() => setToDelete(offer)} aria-label="Delete offer">
                    <MdDeleteOutline />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Edit Combo Offer" : "Add Combo Offer"}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <InputBox
            label="Title"
            name="title"
            register={register}
            rules={{ required: "Title is required" }}
            error={errors.title}
            placeholder="e.g. Buy 2 Get 10% Off"
            required
          />
          <InputBox
            label="Description"
            name="description"
            as="textarea"
            register={register}
            placeholder="Short line explaining the offer"
          />
          <InputBox
            label="Discount Label"
            name="discountLabel"
            register={register}
            placeholder="e.g. 10% OFF"
          />
          <InputBox label="CTA Label" name="ctaLabel" register={register} placeholder="Shop Now" />
          <InputBox label="CTA Link" name="ctaLink" register={register} placeholder="/products" />
          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? <LoaderSpiner size={18} /> : editing ? "Update Offer" : "Create Offer"}
          </button>
        </form>
      </Drawer>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete this offer?"
        message={`"${toDelete?.title}" will be permanently removed.`}
      />
    </div>
  );
};

export default ComboOffer;
