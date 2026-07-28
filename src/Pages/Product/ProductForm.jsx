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
import { PRODUCT_TAGS, VARIANT_WEIGHTS } from "../../Constant/Constant";

const emptyVariant = () => ({ weight: "250g", mrp: "", price: "", stock: "" });
const emptyCompositionRow = () => ({ ingredient: "", percentage: "" });
const emptyNutrition = () => ({ calories: "", protein: "", fat: "", carbs: "", fiber: "" });

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

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      categoryId: "",
      shortDescription: "",
      longDescription: "",
      tags: [],
      status: true,
      showOnHome: false,
      isTrending: false,
      variants: [emptyVariant()],
      nutrition: emptyNutrition(),
      composition: [],
    },
  });

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
    if (initialData) {
      reset({
        name: initialData.name || "",
        categoryId: initialData.categoryId || "",
        shortDescription: initialData.shortDescription || "",
        longDescription: initialData.longDescription || "",
        tags: initialData.tags || [],
        status: initialData.status ?? true,
        showOnHome: initialData.showOnHome ?? false,
        isTrending: initialData.isTrending ?? false,
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
  }, [initialData, reset]);

  const submitHandler = (data) => {
    if (!data.variants || data.variants.length === 0) {
      toast.error("Add at least one weight variant");
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("categoryId", data.categoryId);
    formData.append("shortDescription", data.shortDescription || "");
    formData.append("longDescription", data.longDescription || "");
    formData.append("tags", JSON.stringify(data.tags || []));
    formData.append("status", data.status ? "1" : "0");
    formData.append("showOnHome", data.showOnHome ? "1" : "0");
    formData.append("isTrending", data.isTrending ? "1" : "0");
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
            <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
              <input type="checkbox" {...register("isTrending")} className="h-4 w-4" />
              Trending (show in New Arrivals / Trending Now)
            </label>
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
