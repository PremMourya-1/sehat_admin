import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
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
import usePageReload from "../../Hooks/usePageReload";
import { formatCurrency, getImageUrl } from "../../Utils/utils";
import { getProductData } from "../Product/productService";
import ComboItemsBuilder from "./ComboItemsBuilder";
import {
  createComboOffer,
  deleteComboOffer,
  getComboOfferData,
  toggleComboOfferStatus,
  updateComboOffer,
} from "./comboOfferService";

const DEFAULT_VALUES = { title: "", description: "", comboPrice: "" };

// A row of ComboOfferItem (as returned by the API, nested Product/variant
// included) into the flat, display-ready shape ComboItemsBuilder works
// with — mirrors what the builder itself produces when adding a fresh item.
// Sum of each item's own variant price × quantity — the "actual price"
// shown struck through next to the combo price on each card, so it's
// obvious at a glance what the customer would've paid buying separately.
function calculateIndividualTotal(offer) {
  return (offer.items || []).reduce((sum, item) => sum + Number(item.variant?.price || 0) * item.quantity, 0);
}

function toBuilderItem(row) {
  return {
    id: row.id,
    productId: row.productId,
    variantId: row.variantId,
    quantity: row.quantity,
    productName: row.Product?.name,
    productImage: row.Product?.image,
    weight: row.variant?.weight,
    price: Number(row.variant?.price || 0),
  };
}

const ComboOffer = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [items, setItems] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: DEFAULT_VALUES });

  const fetchComboOffers = useCallback(() => getComboOfferData(setData, setIsLoading), []);
  usePageReload(fetchComboOffers);

  // Loaded once for the product picker — same full-catalog call
  // Pages/Product/Product.jsx already uses, filtered client-side. Plain
  // effect (not usePageReload) since only one fetch per page can be wired
  // to the header's reload button, and combo offers is this page's own
  // primary content.
  useEffect(() => {
    getProductData(setProducts, () => {});
  }, []);

  const individualTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const comboPriceValue = Number(watch("comboPrice")) || 0;
  const savings = individualTotal - comboPriceValue;
  // Same math the backend uses to auto-generate discountLabel (see
  // adminComboOfferController.js) — shown here just as a live preview
  // while filling the form, never submitted as an editable field.
  const discountPercent = individualTotal > 0 ? Math.round((savings / individualTotal) * 100) : 0;

  const openAdd = () => {
    setEditing(null);
    reset(DEFAULT_VALUES);
    setItems([]);
    setDrawerOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    reset({
      title: row.title,
      description: row.description || "",
      comboPrice: row.comboPrice,
    });
    setItems((row.items || []).map(toBuilderItem));
    setDrawerOpen(true);
  };

  const onSubmit = (values) => {
    const distinctProducts = new Set(items.map((i) => i.productId));
    if (distinctProducts.size < 2) {
      toast.error("Add at least 2 distinct products to this combo");
      return;
    }

    const payload = {
      ...values,
      items: items.map((item) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    };

    if (editing) {
      updateComboOffer(editing.id, payload, setData, setIsSubmitting, () => setDrawerOpen(false));
    } else {
      createComboOffer(payload, setData, setIsSubmitting, () => setDrawerOpen(false));
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
          {data.map((offer) => {
            const individualTotal = calculateIndividualTotal(offer);
            return (
              <Card key={offer.id}>
                {offer.discountLabel && (
                  <span className="mb-2 inline-block w-fit rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: "var(--primary-tp)", color: "var(--primary)" }}>
                    {offer.discountLabel}
                  </span>
                )}
                <h3 className="section-title">{offer.title}</h3>
                <p className="mt-1 text-sm text-muted">{offer.description}</p>

                {/* Each item shown as its own labeled chip — a bare 40px
                    thumbnail wasn't enough to tell which product (or what
                    size) was actually in the combo without opening Edit. */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {(offer.items || []).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 rounded-lg border p-1.5 pr-3"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <div
                        className="h-11 w-11 shrink-0 overflow-hidden rounded-md border"
                        style={{ borderColor: "var(--border)" }}
                      >
                        {item.Product?.image ? (
                          <img
                            src={getImageUrl(item.Product.image)}
                            alt={item.Product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full" style={{ backgroundColor: "var(--background-light)" }} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium" style={{ color: "var(--text)" }}>
                          {item.Product?.name}
                        </p>
                        <p className="text-[11px] text-muted">
                          {item.variant?.weight} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-baseline gap-1.5">
                  {individualTotal > offer.comboPrice && (
                    <span className="text-xs line-through" style={{ color: "var(--text-light)" }}>
                      {formatCurrency(individualTotal)}
                    </span>
                  )}
                  <span className="font-semibold" style={{ color: "var(--primary)" }}>
                    {formatCurrency(offer.comboPrice)}
                  </span>
                </div>

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
            );
          })}
        </div>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? "Edit Combo Offer" : "Add Combo Offer"}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <div className="card">
            <h3 className="section-title mb-4">Basic Details</h3>
            <InputBox
              label="Title"
              name="title"
              register={register}
              rules={{ required: "Title is required" }}
              error={errors.title}
              placeholder="e.g. Daily Nuts Combo"
              required
              containerClassName="!mb-4"
            />
            <InputBox
              label="Description"
              name="description"
              as="textarea"
              register={register}
              placeholder="Short line explaining the offer"
              containerClassName="!mb-0"
            />
          </div>

          <div className="card">
            <h3 className="section-title mb-1">Products</h3>
            <p className="mb-4 text-sm text-muted">Add at least 2 products to bundle into this combo.</p>
            <ComboItemsBuilder items={items} onChange={setItems} products={products} />
          </div>

          <div className="card">
            <h3 className="section-title mb-4">Pricing</h3>
            <div className="formGroup !mb-0 max-w-xs">
              <label htmlFor="comboPrice" className="form-label">
                Combo Price
                <span style={{ color: "var(--danger)" }}> *</span>
              </label>
              <input
                id="comboPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`inputBox ${errors.comboPrice ? "has-error" : ""}`}
                {...register("comboPrice", {
                  required: "Combo price is required",
                  min: { value: 0, message: "Price cannot be negative" },
                })}
              />
              {errors.comboPrice && <p className="form-error">{errors.comboPrice.message}</p>}
            </div>

            {items.length > 0 && (
              <div
                className="mt-4 flex items-center justify-between rounded-lg px-4 py-3 text-sm"
                style={{ backgroundColor: "var(--background-light)" }}
              >
                <span className="text-muted">Individual total</span>
                <span className="font-semibold" style={{ color: "var(--text)" }}>
                  {formatCurrency(individualTotal)}
                  {savings > 0 && (
                    <span className="ml-2 font-medium" style={{ color: "var(--success)" }}>
                      You&apos;re saving {formatCurrency(savings)} ({discountPercent}% off) — this becomes the
                      discount label shown to customers automatically
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

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
