import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ActionButtons from "../../Components/Common/ActionButtons/ActionButtons";
import { MIX_CATEGORIES } from "../../Constant/Constant";
import { formatCurrency, getImageUrl } from "../../Utils/utils";
import { updateProductMixSettings } from "./productService";

function renderPrice(row) {
  const variants = row.variants || [];
  if (variants.length === 0) return "-";
  const prices = variants.map((v) => Number(v.price));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatCurrency(min) : `${formatCurrency(min)} - ${formatCurrency(max)}`;
}

// One card — the "Build Your Own Mix" checkbox + category select save
// immediately on change (same PUT used by the full edit form, but scoped
// to just these two fields — see productService.updateProductMixSettings),
// so this is a genuine quick-edit, not a shortcut into the full form.
const ProductGridCard = ({ product, setData, onView, onEdit, onDelete }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMixIngredient = !!product.isMixIngredient;
  const mixCategory = product.mixCategory || "";

  const handleToggleMix = async (event) => {
    const checked = event.target.checked;
    await updateProductMixSettings(
      product.id,
      { isMixIngredient: checked, mixCategory },
      setData,
      setIsSubmitting,
    );
  };

  const handleCategoryChange = async (event) => {
    await updateProductMixSettings(
      product.id,
      { isMixIngredient: true, mixCategory: event.target.value },
      setData,
      setIsSubmitting,
    );
  };

  const images = product.images || [];
  const cover = product.image || images[0]?.image;

  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="relative aspect-square w-full overflow-hidden" style={{ backgroundColor: "var(--background-light)" }}>
        {cover ? (
          <img src={getImageUrl(cover)} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full" />
        )}
        {!product.status && (
          <span className="badge-danger absolute left-2 top-2 text-[10px]">Inactive</span>
        )}
        {product.showOnHome && (
          <span className="badge-accent absolute right-2 top-2 text-[10px]">Featured</span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="truncate text-sm font-semibold" style={{ color: "var(--text)" }} title={product.name}>
          {product.name}
        </p>
        <p className="text-xs text-muted">{product.Category?.name || "No category"}</p>
        <p className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
          {renderPrice(product)}
        </p>

        <div className="mt-1 flex flex-col gap-1.5 border-t pt-2" style={{ borderColor: "var(--border)" }}>
          <label className="flex items-center gap-2 text-xs" style={{ color: "var(--text)" }}>
            <input
              type="checkbox"
              checked={isMixIngredient}
              onChange={handleToggleMix}
              disabled={isSubmitting}
              className="h-3.5 w-3.5"
            />
            Mix Ingredient
          </label>
          {isMixIngredient && (
            <select
              value={mixCategory}
              onChange={handleCategoryChange}
              disabled={isSubmitting}
              className="inputBox !mb-0 py-1 text-xs"
            >
              <option value="">Select category</option>
              {MIX_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="mt-auto flex items-center justify-end pt-2">
          <ActionButtons onView={onView} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
};

const ProductGridView = ({ products, setData, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-4 gap-4 lg:grid-cols-3 md:grid-cols-2 xs:grid-cols-1">
      {products.map((product) => (
        <ProductGridCard
          key={product.id}
          product={product}
          setData={setData}
          onView={() => navigate(`/products/view/${product.id}`)}
          onEdit={() => navigate(`/products/edit/${product.id}`)}
          onDelete={() => onDelete(product)}
        />
      ))}
    </div>
  );
};

export default ProductGridView;
