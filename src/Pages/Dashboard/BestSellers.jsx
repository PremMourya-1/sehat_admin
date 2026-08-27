import Card from "../../Components/Card/Card";
import { formatCurrency } from "../../Utils/utils";

const PERIODS = [
  { key: "today", label: "Today" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "all", label: "All Time" },
];

const BestSellers = ({ period, onPeriodChange, by, onByChange, products, isLoading }) => {
  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="section-title">Best-Selling Products</h3>
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 rounded-full bg-(--primary-tp,#f0ede6) p-1">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => onPeriodChange(p.key)}
                className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: period === p.key ? "var(--primary)" : "transparent",
                  color: period === p.key ? "#fff" : "var(--text)",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1 rounded-full bg-(--primary-tp,#f0ede6) p-1">
            {[
              { key: "units", label: "By Units" },
              { key: "revenue", label: "By Revenue" },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => onByChange(opt.key)}
                className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: by === opt.key ? "var(--accent)" : "transparent",
                  color: by === opt.key ? "#fff" : "var(--text)",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-(--primary-tp,#f0ede6)" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">No sales in this period</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted" style={{ borderColor: "var(--border)" }}>
                <th className="pb-2 pr-2">#</th>
                <th className="pb-2 pr-2">Product</th>
                <th className="pb-2 pr-2 text-right">Units Sold</th>
                <th className="pb-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.productId} className="border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                  <td className="py-2 pr-2 text-muted">{i + 1}</td>
                  <td className="py-2 pr-2 font-medium" style={{ color: "var(--text)" }}>
                    {p.name}
                  </td>
                  <td className="py-2 pr-2 text-right">{p.unitsSold}</td>
                  <td className="py-2 text-right font-medium" style={{ color: "var(--text)" }}>
                    {formatCurrency(p.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default BestSellers;
