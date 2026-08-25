import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { MdAdd, MdDeleteOutline, MdEdit, MdSearch } from "react-icons/md";
import BreadCrumb from "../../Components/Common/BreadCrumb/BreadCrumb";
import Button from "../../Components/Button/Button";
import Card from "../../Components/Card/Card";
import Drawer from "../../Components/Drawer/Drawer";
import ConfirmModal from "../../Components/Modal/ConfirmModal";
import InputBox from "../../Components/Form/InputBox/InputBox";
import PreLoader from "../../Components/Common/Loader/PreLoader";
import NoRecords from "../../Components/NoRecords/NoRecords";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import UseFilter from "../../Hooks/UseFilter";
import usePageReload from "../../Hooks/usePageReload";
import { formatCurrency, getImageUrl } from "../../Utils/utils";
import { getProductData } from "../Product/productService";
import {
  createCartReward,
  deleteCartReward,
  getCartRewardData,
  toggleCartRewardStatus,
  updateCartReward,
} from "./cartRewardService";

const DEFAULT_VALUES = { minCartAmount: "", giftQuantity: 1, label: "" };

const GiftThumb = ({ image, name }) => (
  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border" style={{ borderColor: "var(--border)" }}>
    {image ? (
      <img src={getImageUrl(image)} alt={name} className="h-full w-full object-cover" />
    ) : (
      <div className="h-full w-full" style={{ backgroundColor: "var(--background-light)" }} />
    )}
  </div>
);

const CartReward = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const [pickedProduct, setPickedProduct] = useState(null);
  const [pickedVariantId, setPickedVariantId] = useState("");
  const { search, setSearch, filteredData: matches } = UseFilter(products, ["name"]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: DEFAULT_VALUES });

  const fetchCartRewards = useCallback(() => getCartRewardData(setData, setIsLoading), []);
  usePageReload(fetchCartRewards);

  // Plain effect (not usePageReload) — same reasoning as the Combo Offer
  // builder's own product-catalog fetch: only one fetch per page can drive
  // the header's reload button, and this page's own list is this page's.
  useEffect(() => {
    getProductData(setProducts, () => {});
  }, []);

  const selectProduct = (product) => {
    setPickedProduct(product);
    setPickedVariantId(product.variants?.[0]?.id || "");
    setSearch("");
  };

  const openAdd = () => {
    setEditing(null);
    reset(DEFAULT_VALUES);
    setPickedProduct(null);
    setPickedVariantId("");
    setDrawerOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    reset({
      minCartAmount: row.minCartAmount,
      giftQuantity: row.giftQuantity,
      label: row.label || "",
    });
    setPickedProduct(
      row.giftProduct
        ? { ...row.giftProduct, variants: row.giftVariant ? [row.giftVariant] : [] }
        : null,
    );
    setPickedVariantId(row.giftVariant?.id || "");
    setDrawerOpen(true);
  };

  const onSubmit = (values) => {
    if (!pickedProduct || !pickedVariantId) {
      toast.error("Pick the free gift product and weight variant");
      return;
    }

    const payload = {
      ...values,
      giftProductId: pickedProduct.id,
      giftVariantId: pickedVariantId,
    };

    if (editing) {
      updateCartReward(editing.id, payload, setData, setIsSubmitting, () => setDrawerOpen(false));
    } else {
      createCartReward(payload, setData, setIsSubmitting, () => setDrawerOpen(false));
    }
  };

  const handleConfirmDelete = () => {
    deleteCartReward(toDelete.id, setData, setIsDeleting, () => setToDelete(null));
  };

  const pickedVariant = pickedProduct?.variants?.find((v) => v.id === pickedVariantId);

  return (
    <div>
      <BreadCrumb title="Cart Reward Tiers" items={[{ label: "Cart Rewards" }]} />
      <p className="mb-4 max-w-2xl text-sm text-muted">
        &quot;Spend ₹X, get a free gift&quot; tiers that power the storefront&apos;s cart fill progress
        bar. A qualifying gift is added to the order automatically at checkout — the customer never
        selects it. Whether a cart clearing several tiers gets only the best gift or all of them
        stacked is controlled from Settings → General.
      </p>

      <div className="mb-4 flex justify-end">
        <Button icon={<MdAdd />} onClick={openAdd}>
          Add Tier
        </Button>
      </div>

      {isLoading ? (
        <PreLoader />
      ) : data.length === 0 ? (
        <NoRecords message="No cart reward tiers found" />
      ) : (
        <div className="grid grid-cols-3 gap-4 lg:grid-cols-2 xs:grid-cols-1">
          {data.map((tier) => (
            <Card key={tier.id}>
              <div className="flex items-center gap-3">
                <GiftThumb image={tier.giftProduct?.image} name={tier.giftProduct?.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" style={{ color: "var(--text)" }}>
                    {tier.giftProduct?.name || "Gift product deleted"}
                  </p>
                  <p className="text-xs text-muted">
                    {tier.giftVariant?.weight} × {tier.giftQuantity}
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "var(--background-light)" }}>
                Cart ≥ <span className="font-semibold" style={{ color: "var(--primary)" }}>{formatCurrency(tier.minCartAmount)}</span>
                {tier.label && <span className="ml-2 text-muted">— {tier.label}</span>}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
                  <input
                    type="checkbox"
                    checked={!!tier.status}
                    onChange={(e) => toggleCartRewardStatus(tier.id, e.target.checked, setData)}
                    className="h-4 w-4"
                  />
                  {tier.status ? "Active" : "Inactive"}
                </label>
                <div className="flex items-center gap-2">
                  <button type="button" className="action-icon-edit" onClick={() => openEdit(tier)} aria-label="Edit tier">
                    <MdEdit />
                  </button>
                  <button type="button" className="action-icon-delete" onClick={() => setToDelete(tier)} aria-label="Delete tier">
                    <MdDeleteOutline />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? "Edit Cart Reward Tier" : "Add Cart Reward Tier"}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <div className="card">
            <h3 className="section-title mb-4">Threshold</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
              <div className="formGroup !mb-0">
                <label htmlFor="minCartAmount" className="form-label">
                  Minimum Cart Amount
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
                    id="minCartAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="1000"
                    className={`inputBox pl-7 ${errors.minCartAmount ? "has-error" : ""}`}
                    {...register("minCartAmount", {
                      required: "Minimum cart amount is required",
                      min: { value: 0.01, message: "Must be greater than 0" },
                    })}
                  />
                </div>
                {errors.minCartAmount && <p className="form-error">{errors.minCartAmount.message}</p>}
              </div>

              <InputBox
                label="Celebration Label"
                name="label"
                register={register}
                placeholder="e.g. Free Mix Seeds 250g!"
                containerClassName="!mb-0"
              />
            </div>
          </div>

          <div className="card">
            <h3 className="section-title mb-1">Free Gift</h3>
            <p className="mb-4 text-sm text-muted">
              The product + weight variant given free when this tier is reached.
            </p>

            <div className="relative">
              <MdSearch
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-light)" }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="inputBox pl-9"
              />
              {search && (
                <div
                  className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border bg-white shadow-md"
                  style={{ borderColor: "var(--border)" }}
                >
                  {matches.length === 0 ? (
                    <p className="p-3 text-sm text-muted">No products found</p>
                  ) : (
                    matches.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => selectProduct(product)}
                        className="flex w-full items-center gap-3 p-2 text-left transition-colors hover:bg-[var(--background-light)]"
                      >
                        <GiftThumb image={product.image || product.images?.[0]?.image} name={product.name} />
                        <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                          {product.name}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {pickedProduct && (
              <div
                className="mt-3 rounded-lg border-2 border-dashed p-3"
                style={{ borderColor: "var(--primary)", backgroundColor: "var(--primary-tp)" }}
              >
                <div className="flex items-center gap-3">
                  <GiftThumb image={pickedProduct.image || pickedProduct.images?.[0]?.image} name={pickedProduct.name} />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium" style={{ color: "var(--text)" }}>
                    {pickedProduct.name}
                  </span>
                </div>

                {pickedProduct.variants?.length > 0 ? (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-muted">Weight</label>
                      <select
                        value={pickedVariantId}
                        onChange={(e) => setPickedVariantId(e.target.value)}
                        className="inputBox"
                      >
                        {pickedProduct.variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.weight} {v.price !== undefined ? `— ${formatCurrency(v.price)}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-muted">Gift Quantity</label>
                      <input
                        type="number"
                        min="1"
                        className="inputBox"
                        {...register("giftQuantity", {
                          required: true,
                          min: 1,
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted">This product has no weight variants.</p>
                )}

                {pickedVariant && pickedVariant.stock !== undefined && (
                  <p className="mt-2 text-xs text-muted">In stock: {pickedVariant.stock}</p>
                )}
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? <LoaderSpiner size={18} /> : editing ? "Update Tier" : "Create Tier"}
          </button>
        </form>
      </Drawer>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete this tier?"
        message={`Cart reward tier at ${formatCurrency(toDelete?.minCartAmount || 0)} will be permanently removed.`}
      />
    </div>
  );
};

export default CartReward;
