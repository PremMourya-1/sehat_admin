import { useState } from "react";
import { MdAdd, MdDeleteOutline, MdInventory2, MdSearch } from "react-icons/md";
import UseFilter from "../../Hooks/UseFilter";
import { formatCurrency, getImageUrl } from "../../Utils/utils";

// Product photo + name + weight, read straight off the Product/ProductVariant
// records — never re-entered manually. Same thumbnail convention as
// Product/ProductTable.jsx (h-12 w-12 rounded-lg border).
const ItemThumb = ({ image, name, size = "h-12 w-12" }) => (
  <div className={`${size} shrink-0 overflow-hidden rounded-lg border`} style={{ borderColor: "var(--border)" }}>
    {image ? (
      <img src={getImageUrl(image)} alt={name} className="h-full w-full object-cover" />
    ) : (
      <div className="h-full w-full" style={{ backgroundColor: "var(--background-light)" }} />
    )}
  </div>
);

// Search-and-add picker for the combo builder, plus the running list of
// added products with editable quantity + remove. `products` is the same
// full catalog Pages/Product/Product.jsx already loads once via
// adminApi.getProducts() — no new search endpoint, filtered client-side
// with the existing UseFilter hook.
const ComboItemsBuilder = ({ items, onChange, products }) => {
  const { search, setSearch, filteredData: matches } = UseFilter(products, ["name"]);
  const [pickedProduct, setPickedProduct] = useState(null);
  const [pickedVariantId, setPickedVariantId] = useState("");
  const [pickedQty, setPickedQty] = useState(1);

  const selectProduct = (product) => {
    setPickedProduct(product);
    setPickedVariantId(product.variants?.[0]?.id || "");
    setPickedQty(1);
    setSearch("");
  };

  const addItem = () => {
    if (!pickedProduct || !pickedVariantId) return;
    const variant = pickedProduct.variants.find((v) => v.id === pickedVariantId);
    if (!variant) return;

    const qty = Math.max(1, Number(pickedQty) || 1);
    const existingIndex = items.findIndex(
      (i) => i.productId === pickedProduct.id && i.variantId === pickedVariantId,
    );

    if (existingIndex >= 0) {
      const next = [...items];
      next[existingIndex] = { ...next[existingIndex], quantity: next[existingIndex].quantity + qty };
      onChange(next);
    } else {
      onChange([
        ...items,
        {
          productId: pickedProduct.id,
          variantId: pickedVariantId,
          quantity: qty,
          productName: pickedProduct.name,
          productImage: pickedProduct.image || pickedProduct.images?.[0]?.image,
          weight: variant.weight,
          price: Number(variant.price),
        },
      ]);
    }

    setPickedProduct(null);
    setPickedVariantId("");
    setPickedQty(1);
  };

  const updateQuantity = (index, quantity) => {
    const next = [...items];
    next[index] = { ...next[index], quantity: Math.max(1, Number(quantity) || 1) };
    onChange(next);
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="relative">
        <MdSearch
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--text-light)" }}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products to add..."
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
                  <ItemThumb image={product.image || product.images?.[0]?.image} name={product.name} />
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
            <ItemThumb image={pickedProduct.image || pickedProduct.images?.[0]?.image} name={pickedProduct.name} />
            <span className="min-w-0 flex-1 truncate text-sm font-medium" style={{ color: "var(--text)" }}>
              {pickedProduct.name}
            </span>
          </div>

          {pickedProduct.variants?.length > 0 ? (
            <div className="mt-3 grid grid-cols-[1fr_auto_auto] items-end gap-2 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Weight</label>
                <select
                  value={pickedVariantId}
                  onChange={(e) => setPickedVariantId(e.target.value)}
                  className="inputBox"
                >
                  {pickedProduct.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.weight} — {formatCurrency(v.price)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Qty</label>
                <input
                  type="number"
                  min="1"
                  value={pickedQty}
                  onChange={(e) => setPickedQty(e.target.value)}
                  className="inputBox w-20"
                  aria-label="Quantity"
                />
              </div>
              <button type="button" className="btn-primary sm:col-span-2" onClick={addItem}>
                <MdAdd size={18} />
                Add to Combo
              </button>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">This product has no weight variants to add.</p>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div
          className="mt-4 flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center"
          style={{ borderColor: "var(--border)" }}
        >
          <MdInventory2 size={28} style={{ color: "var(--text-light)" }} />
          <p className="text-sm text-muted">No products added yet. Search above to add the first one.</p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {items.map((item, index) => (
            <div
              key={`${item.productId}-${item.variantId}`}
              className="flex flex-wrap items-center gap-3 rounded-lg border p-2.5 sm:gap-2"
              style={{ borderColor: "var(--border)" }}
            >
              <ItemThumb image={item.productImage} name={item.productName} size="h-11 w-11" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" style={{ color: "var(--text)" }}>
                  {item.productName}
                </p>
                <p className="text-xs text-muted">
                  {item.weight} · {formatCurrency(item.price)} each
                </p>
              </div>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateQuantity(index, e.target.value)}
                className="inputBox w-16 text-center"
                aria-label={`Quantity for ${item.productName}`}
              />
              <span className="w-20 shrink-0 text-right text-sm font-semibold" style={{ color: "var(--text)" }}>
                {formatCurrency(item.price * item.quantity)}
              </span>
              <button
                type="button"
                className="action-icon-delete"
                onClick={() => removeItem(index)}
                aria-label={`Remove ${item.productName}`}
              >
                <MdDeleteOutline size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComboItemsBuilder;
