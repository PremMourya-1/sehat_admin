import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MdAdd, MdDeleteOutline } from "react-icons/md";
import InputBox from "../../Components/Form/InputBox/InputBox";
import RichTextEditor from "../../Components/Form/RichTextEditor/RichTextEditor";
import MultiImageUpload from "../../Components/Form/FileUpload/MultiImageUpload";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import Button from "../../Components/Button/Button";
import adminApi from "../../Service/api";
import { MIX_CATEGORIES, PRODUCT_TAGS, VARIANT_WEIGHTS } from "../../Constant/Constant";

const emptyVariant = () => ({ weight: "250g", mrp: "", price: "", stock: "" });
const emptyCompositionRow = () => ({ ingredient: "", percentage: "" });
const emptyNutrition = () => ({ calories: "", protein: "", fat: "", carbs: "", fiber: "" });

// Lightweight preview only — mirrors backend utils/generateSlug.js's
// slugify() closely enough for a live "here's what it'll look like" hint
// as the admin types, but the REAL value (normalized + made unique against
// every other product) is always computed server-side on save. Never
// blocks/validates against this preview.
const slugifyPreview = (text) =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Shared add/edit form for products. Sehat Potli's key domain difference vs
 * the reference architecture: price/mrp/stock live on a dynamic list of
 * weight-based variant rows (not flat fields on the product), and tags are
 * a fixed 4-value checkbox group instead of free text.
 */
const ProductForm = ({ initialData, onSubmit, isSubmitting, submitLabel = "Save Product" }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [files, setFiles] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);

  const [quickAdjust, setQuickAdjust] = useState({ direction: "increase", type: "percentage", value: "" });
  const [isQuickAdjusting, setIsQuickAdjusting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      slug: "",
      categoryId: "",
      shortDescription: "",
      longDescription: "",
      tags: [],
      status: true,
      showOnHome: false,
      isTrending: false,
      codAvailable: true,
      isMixIngredient: false,
      mixCategory: "",
      variants: [emptyVariant()],
      nutrition: emptyNutrition(),
      composition: [],
    },
  });

  const isMixIngredient = watch("isMixIngredient");
  const nameValue = watch("name");

  // Slug auto-syncs with the name field live (WordPress/Shopify-style)
  // until the admin edits the slug directly, at which point it "detaches"
  // and stops following name changes — so fixing a typo in the name later
  // never silently rewrites a slug that's already live somewhere. A brand-
  // new product (initialData undefined) starts attached, since there's
  // nothing to protect yet; the reset() effect below re-syncs this to
  // "detached" the moment an existing product's real initialData.slug
  // arrives (async — not yet known on this component's first render).
  const [slugTouched, setSlugTouched] = useState(Boolean(initialData?.slug));

  useEffect(() => {
    if (!slugTouched) setValue("slug", slugifyPreview(nameValue));
  }, [nameValue, slugTouched, setValue]);

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });
  const {
    fields: compositionFields,
    append: appendComposition,
    remove: removeComposition,
  } = useFieldArray({ control, name: "composition" });

  useEffect(() => {
    adminApi
      .getCategories()
      .then((res) => {
        if (res.data.action) setCategories(res.data.data);
      })
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  useEffect(() => {
    // Waits on categories too, not just initialData: the "Category" field
    // is a plain uncontrolled <select> (see Components/Form/InputBox), so
    // setting its value via reset() before the matching <option> exists in
    // the DOM (categories loads async, separately, in the effect above)
    // gets silently ignored by the browser — the select then shows the
    // placeholder forever even though the correct categoryId is sitting in
    // form state the whole time. Once both are ready, the <option> list is
    // already committed before this effect runs, so the value takes.
    if (initialData && categories.length > 0) {
      // initialData itself only arrives after this component's first
      // render (fetched async by the caller — see ProductEdit.jsx), so the
      // slugTouched state's own initial value (set from `Boolean(initial
      // Data?.slug)` at mount, when initialData was still undefined) needs
      // re-syncing here once the real value is actually known.
      setSlugTouched(Boolean(initialData.slug));
      reset({
        name: initialData.name || "",
        slug: initialData.slug || slugifyPreview(initialData.name),
        categoryId: initialData.categoryId || "",
        shortDescription: initialData.shortDescription || "",
        longDescription: initialData.longDescription || "",
        tags: initialData.tags || [],
        status: initialData.status ?? true,
        showOnHome: initialData.showOnHome ?? false,
        isTrending: initialData.isTrending ?? false,
        codAvailable: initialData.codAvailable ?? true,
        isMixIngredient: initialData.isMixIngredient ?? false,
        mixCategory: initialData.mixCategory || "",
        variants:
          initialData.variants && initialData.variants.length > 0
            ? initialData.variants.map((v) => ({
                id: v.id,
                weight: v.weight,
                mrp: v.mrp ?? "",
                price: v.price ?? "",
                stock: v.stock ?? 0,
              }))
            : [emptyVariant()],
        nutrition: initialData.nutrition
          ? {
              calories: initialData.nutrition.calories ?? "",
              protein: initialData.nutrition.protein ?? "",
              fat: initialData.nutrition.fat ?? "",
              carbs: initialData.nutrition.carbs ?? "",
              fiber: initialData.nutrition.fiber ?? "",
            }
          : emptyNutrition(),
        composition:
          initialData.composition && initialData.composition.length > 0
            ? initialData.composition.map((row) => ({
                ingredient: row.ingredient || "",
                percentage: row.percentage ?? "",
              }))
            : [],
      });
    }
  }, [initialData, categories, reset]);

  const submitHandler = (data) => {
    if (!data.variants || data.variants.length === 0) {
      toast.error("Add at least one weight variant");
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("slug", data.slug || "");
    formData.append("categoryId", data.categoryId);
    formData.append("shortDescription", data.shortDescription || "");
    formData.append("longDescription", data.longDescription || "");
    formData.append("tags", JSON.stringify(data.tags || []));
    formData.append("status", data.status ? "1" : "0");
    formData.append("showOnHome", data.showOnHome ? "1" : "0");
    formData.append("isTrending", data.isTrending ? "1" : "0");
    formData.append("codAvailable", data.codAvailable ? "1" : "0");
    formData.append("isMixIngredient", data.isMixIngredient ? "1" : "0");
    formData.append("mixCategory", data.isMixIngredient ? data.mixCategory || "" : "");
    formData.append("variants", JSON.stringify(data.variants));
    formData.append("nutrition", JSON.stringify(data.nutrition || {}));
    formData.append(
      "composition",
      JSON.stringify((data.composition || []).filter((row) => row.ingredient?.trim())),
    );

    files.forEach((file) => formData.append("images", file));
    if (initialData && removedImageIds.length > 0) {
      formData.append("removeImageIds", JSON.stringify(removedImageIds));
    }

    onSubmit(formData);
  };

  // Quick single-product price adjustment — applies to every variant of
  // this product in one go (same "whole product, not per-variant" rule as
  // the bulk "Manage Product Pricing" tool, see utils/pricingCalculator.js
  // on the backend). Calls the exact same bulk-update endpoint with a
  // one-item productIds array; no separate endpoint for the single case.
  const handleQuickAdjust = async () => {
    const numValue = Number(quickAdjust.value);
    if (!Number.isFinite(numValue) || numValue <= 0) {
      toast.error("Enter a valid positive value");
      return;
    }
    setIsQuickAdjusting(true);
    try {
      const res = await adminApi.bulkUpdatePricing({
        productIds: [initialData.id],
        direction: quickAdjust.direction,
        type: quickAdjust.type,
        value: numValue,
      });
      if (res.data.action) {
        const item = res.data.data.items.find((i) => i.productId === initialData.id);
        if (item?.excluded) {
          toast.error(item.exclusionReason || "This adjustment would result in an invalid price");
        } else if (item) {
          // Reflect the new prices straight into the open form — matched
          // by variant id, not index, since row order in the form may not
          // match the backend's.
          getValues("variants").forEach((v, index) => {
            const updated = item.variants.find((nv) => nv.variantId === v.id);
            if (updated) setValue(`variants.${index}.price`, updated.newPrice);
          });
          toast.success("Price updated");
          setQuickAdjust((prev) => ({ ...prev, value: "" }));
        }
      } else {
        toast.error(res.data.message);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to adjust price");
    } finally {
      setIsQuickAdjusting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} noValidate>
      <div className="grid grid-cols-3 gap-5 lg:grid-cols-1">
        <div className="col-span-2 lg:col-span-1">
          <div className="card mb-5">
            <h3 className="section-title mb-4">Basic Details</h3>

            <InputBox
              label="Product Name"
              name="name"
              register={register}
              rules={{ required: "Product name is required" }}
              error={errors.name}
              placeholder="e.g. Premium California Almonds"
              required
            />

            <InputBox
              label="URL Slug"
              name="slug"
              register={register}
              rules={{ onChange: () => setSlugTouched(true) }}
              error={errors.slug}
              placeholder="Auto-generated from the product name — edit to customize"
            />
            <p className="-mt-3 mb-4 text-xs text-muted">
              The product&apos;s URL will be sehatpotli.in/products/<strong>{watch("slug") || "..."}</strong>. Auto-fills from the
              name until you edit it directly.
            </p>

            <InputBox
              label="Category"
              name="categoryId"
              as="select"
              register={register}
              rules={{ required: "Category is required" }}
              error={errors.categoryId}
              placeholder="Select a category"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              required
            />

            <InputBox
              label="Short Description"
              name="shortDescription"
              as="textarea"
              register={register}
              rules={{ maxLength: { value: 300, message: "Max 300 characters" } }}
              error={errors.shortDescription}
              placeholder="A short one-liner shown on the product card"
            />

            <Controller
              control={control}
              name="longDescription"
              render={({ field }) => (
                <RichTextEditor
                  label="Long Description"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Full product description..."
                />
              )}
            />
          </div>

          <div className="card mb-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="section-title">Weight Variants</h3>
              <Button type="button" variant="outline" size="sm" icon={<MdAdd />} onClick={() => append(emptyVariant())}>
                Add Variant
              </Button>
            </div>

            {initialData?.id && (
              <div
                className="mb-4 flex flex-wrap items-end gap-2 rounded-lg border p-3"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--background-light)" }}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted">Quick Adjust (all variants)</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className="inputBox !mb-0 w-auto"
                      value={quickAdjust.direction}
                      onChange={(e) => setQuickAdjust((prev) => ({ ...prev, direction: e.target.value }))}
                    >
                      <option value="increase">Increase</option>
                      <option value="decrease">Decrease</option>
                    </select>
                    <select
                      className="inputBox !mb-0 w-auto"
                      value={quickAdjust.type}
                      onChange={(e) => setQuickAdjust((prev) => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">₹</option>
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Value"
                      className="inputBox !mb-0 w-24"
                      value={quickAdjust.value}
                      onChange={(e) => setQuickAdjust((prev) => ({ ...prev, value: e.target.value }))}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleQuickAdjust}
                      disabled={isQuickAdjusting}
                    >
                      {isQuickAdjusting ? <LoaderSpiner size={14} /> : "Apply"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-start gap-3 sm:grid-cols-2">
                  <InputBox
                    label={index === 0 ? "Weight" : undefined}
                    name={`variants.${index}.weight`}
                    as="select"
                    register={register}
                    rules={{ required: true }}
                    options={VARIANT_WEIGHTS.map((w) => ({ value: w, label: w }))}
                    containerClassName="!mb-0"
                  />
                  <InputBox
                    label={index === 0 ? "MRP" : undefined}
                    name={`variants.${index}.mrp`}
                    type="number"
                    step="0.01"
                    register={register}
                    placeholder="MRP"
                    containerClassName="!mb-0"
                  />
                  <InputBox
                    label={index === 0 ? "Selling Price" : undefined}
                    name={`variants.${index}.price`}
                    type="number"
                    step="0.01"
                    register={register}
                    rules={{ required: "Required" }}
                    error={errors.variants?.[index]?.price}
                    placeholder="Price"
                    containerClassName="!mb-0"
                  />
                  <InputBox
                    label={index === 0 ? "Stock" : undefined}
                    name={`variants.${index}.stock`}
                    type="number"
                    register={register}
                    placeholder="Stock"
                    containerClassName="!mb-0"
                  />
                  <button
                    type="button"
                    onClick={() => fields.length > 1 && remove(index)}
                    className="action-icon-delete mt-0"
                    style={{ marginTop: index === 0 ? "1.6rem" : 0 }}
                    aria-label="Remove variant"
                    disabled={fields.length <= 1}
                  >
                    <MdDeleteOutline />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card mb-5">
            <h3 className="section-title mb-1">Nutrition (per 100g)</h3>
            <p className="mb-4 text-xs text-muted">
              Optional — leave blank to hide the nutrition table on the product page.
            </p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-2">
              <InputBox label="Calories (kcal)" name="nutrition.calories" type="number" step="0.1" register={register} containerClassName="!mb-0" />
              <InputBox label="Protein (g)" name="nutrition.protein" type="number" step="0.1" register={register} containerClassName="!mb-0" />
              <InputBox label="Fat (g)" name="nutrition.fat" type="number" step="0.1" register={register} containerClassName="!mb-0" />
              <InputBox label="Carbohydrates (g)" name="nutrition.carbs" type="number" step="0.1" register={register} containerClassName="!mb-0" />
              <InputBox label="Fiber (g)" name="nutrition.fiber" type="number" step="0.1" register={register} containerClassName="!mb-0" />
            </div>
          </div>

          <div className="card mb-5">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="section-title">Composition</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<MdAdd />}
                onClick={() => appendComposition(emptyCompositionRow())}
              >
                Add Ingredient
              </Button>
            </div>
            <p className="mb-4 text-xs text-muted">
              Optional — for mixes/combos. Leave empty for single-ingredient products.
            </p>

            {compositionFields.length > 0 && (
              <div className="flex flex-col gap-3">
                {compositionFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-[2fr_1fr_auto] items-start gap-3">
                    <InputBox
                      label={index === 0 ? "Ingredient" : undefined}
                      name={`composition.${index}.ingredient`}
                      register={register}
                      placeholder="e.g. Almonds"
                      containerClassName="!mb-0"
                    />
                    <InputBox
                      label={index === 0 ? "% Share" : undefined}
                      name={`composition.${index}.percentage`}
                      type="number"
                      step="1"
                      register={register}
                      placeholder="%"
                      containerClassName="!mb-0"
                    />
                    <button
                      type="button"
                      onClick={() => removeComposition(index)}
                      className="action-icon-delete mt-0"
                      style={{ marginTop: index === 0 ? "1.6rem" : 0 }}
                      aria-label="Remove ingredient"
                    >
                      <MdDeleteOutline />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card mb-5">
            <h3 className="section-title mb-4">Images</h3>
            <MultiImageUpload
              existingImages={initialData?.images || []}
              removedIds={removedImageIds}
              onRemoveExisting={(id) =>
                setRemovedImageIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
              }
              files={files}
              onFilesChange={setFiles}
            />
          </div>

          <div className="card mb-5">
            <h3 className="section-title mb-4">Badges / Tags</h3>
            <div className="flex flex-col gap-2">
              {PRODUCT_TAGS.map((tag) => (
                <label key={tag} className="flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
                  <input type="checkbox" value={tag} {...register("tags")} className="h-4 w-4" />
                  {tag}
                </label>
              ))}
            </div>
          </div>

          <div className="card mb-5">
            <h3 className="section-title mb-4">Visibility</h3>
            <label className="mb-3 flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
              <input type="checkbox" {...register("status")} className="h-4 w-4" />
              Active (visible on storefront)
            </label>
            <label className="mb-3 flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
              <input type="checkbox" {...register("showOnHome")} className="h-4 w-4" />
              Featured (show on homepage)
            </label>
            <label className="mb-3 flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
              <input type="checkbox" {...register("isTrending")} className="h-4 w-4" />
              Trending (show in New Arrivals / Trending Now)
            </label>
            <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
              <input type="checkbox" {...register("codAvailable")} className="h-4 w-4" />
              COD Available (Cash on Delivery allowed for this product)
            </label>
          </div>

          <div className="card mb-5">
            <h3 className="section-title mb-1">Build Your Own Mix</h3>
            <p className="mb-4 text-sm text-muted">
              Only products flagged here are selectable as ingredients on the storefront&apos;s mix builder.
              Pricing is derived from this product&apos;s smallest weight variant.
            </p>
            <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
              <input type="checkbox" {...register("isMixIngredient")} className="h-4 w-4" />
              Available as a mix ingredient
            </label>

            {isMixIngredient && (
              <InputBox
                label="Base Category"
                name="mixCategory"
                as="select"
                register={register}
                rules={{ required: "Choose a base category for this ingredient" }}
                error={errors.mixCategory}
                placeholder="Select a category"
                options={MIX_CATEGORIES}
                containerClassName="mt-3 !mb-0"
                required
              />
            )}
          </div>

          <div className="flex gap-3">
            <Button type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? <LoaderSpiner size={18} /> : submitLabel}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/products")}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ProductForm;
