import { useNavigate } from "react-router-dom";
import ActionButtons from "../../Components/Common/ActionButtons/ActionButtons";
import { formatCurrency, getImageUrl } from "../../Utils/utils";

/**
 * Column config for the Product list table. Price now reflects the
 * lowest-to-highest weight-variant price range (variants replace the flat
 * price/mrp fields used in the reference architecture).
 */
const useProductColumns = ({ onDelete }) => {
  const navigate = useNavigate();

  const renderPrice = (row) => {
    const variants = row.variants || [];
    if (variants.length === 0) return "-";
    const prices = variants.map((v) => Number(v.price));
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) {
      const variant = variants.find((v) => Number(v.price) === min);
      return (
        <span className="flex items-center gap-2">
          <span className="font-semibold">{formatCurrency(min)}</span>
          {variant?.mrp && Number(variant.mrp) > min && (
            <span className="text-xs text-muted line-through">{formatCurrency(variant.mrp)}</span>
          )}
        </span>
      );
    }
    return (
      <span className="font-semibold">
        {formatCurrency(min)} - {formatCurrency(max)}
      </span>
    );
  };

  const columns = [
    {
      key: "image",
      label: "Image",
      render: (row) => {
        const images = row.images || [];
        const cover = row.image || images[0]?.image;
        const extra = images.length > 1 ? images.length - 1 : 0;
        return (
          <div className="relative h-12 w-12 overflow-hidden rounded-lg border" style={{ borderColor: "var(--border)" }}>
            {cover ? (
              <img src={getImageUrl(cover)} alt={row.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full" style={{ backgroundColor: "var(--background-light)" }} />
            )}
            {extra > 0 && (
              <span className="absolute bottom-0 right-0 rounded-tl-md bg-black/70 px-1 text-[10px] text-white">
                +{extra}
              </span>
            )}
          </div>
        );
      },
    },
    // Pinned on scroll (see Table.jsx's `sticky` doc comment) — this table
    // has 9 columns, wider than a phone screen, so keeping the product
    // name in view while scrolling to Price/Status/etc. matters more than
    // the thumbnail before it.
    { key: "name", label: "Name", sticky: true },
    {
      key: "category",
      label: "Category",
      // The admin API's Product<->Category include has no `as` alias, so
      // Sequelize's default association key is "Category" (capitalized,
      // matching the model name), not "category" — this was silently
      // rendering "-" for every row regardless of the product's real
      // category.
      render: (row) => row.Category?.name || "-",
    },
    { key: "variants", label: "Weights", render: (row) => (row.variants || []).map((v) => v.weight).join(", ") || "-" },
    { key: "price", label: "Price", render: renderPrice },
    {
      key: "status",
      label: "Status",
      render: (row) => (row.status ? <span className="badge-success">Active</span> : <span className="badge-danger">Inactive</span>),
    },
    {
      key: "showOnHome",
      label: "Featured",
      render: (row) => (row.showOnHome ? <span className="badge-accent">Featured</span> : <span className="badge-muted">-</span>),
    },
    {
      key: "isMixIngredient",
      label: "Mix Ingredient",
      render: (row) => (row.isMixIngredient ? <span className="badge-accent">Mix</span> : <span className="badge-muted">-</span>),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <ActionButtons
          onView={() => navigate(`/products/view/${row.id}`)}
          onEdit={() => navigate(`/products/edit/${row.id}`)}
          onDelete={() => onDelete(row)}
        />
      ),
    },
  ];

  return columns;
};

export default useProductColumns;
