import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import Card from "../../Components/Card/Card";
import { formatCurrency } from "../../Utils/utils";
import { CUSTOMER_STATUS_LABELS } from "../../Constant/Constant";

// Fixed, intuitive colors for the statuses that carry real meaning;
// everything else cycles through a neutral brand palette so a chart never
// runs out of distinct colors regardless of how many statuses appear.
const STATUS_COLORS = {
  cancelled: "var(--danger)",
  rto: "var(--warning)",
  delivered: "var(--success)",
};
const PALETTE = ["var(--primary)", "var(--accent)", "#5C4033", "#6B1F2A", "#3b6ea5", "#9c9184"];
function colorForStatus(status, index) {
  return STATUS_COLORS[status] || PALETTE[index % PALETTE.length];
}

const RANGE_OPTIONS = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "custom", label: "Custom" },
];

const BreakdownSection = ({ range, onRangeChange, breakdown, isLoading }) => {
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const applyCustom = () => {
    if (!customFrom) return;
    onRangeChange({ range: "custom", from: customFrom, to: customTo || undefined });
  };

  const statusData = (breakdown?.statusBreakdown || []).map((s) => ({
    name: CUSTOMER_STATUS_LABELS[s.status] || s.status,
    status: s.status,
    value: s.count,
  }));

  const codVsPrepaid = breakdown?.codVsPrepaid || { cod: { count: 0, revenue: 0 }, prepaid: { count: 0, revenue: 0 } };
  const paymentData = [
    { name: "COD", count: codVsPrepaid.cod.count, revenue: codVsPrepaid.cod.revenue, fill: "var(--accent)" },
    { name: "Prepaid", count: codVsPrepaid.prepaid.count, revenue: codVsPrepaid.prepaid.revenue, fill: "var(--primary)" },
  ];

  const newVsReturning = breakdown?.newVsReturning || { new: 0, returning: 0 };
  const totalCustomers = newVsReturning.new + newVsReturning.returning;

  const topLocations = breakdown?.topLocations || [];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="section-title">Breakdown</h3>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-full bg-(--primary-tp,#f0ede6) p-1">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => opt.key !== "custom" && onRangeChange({ range: opt.key })}
                className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: range.range === opt.key ? "var(--primary)" : "transparent",
                  color: range.range === opt.key ? "#fff" : "var(--text)",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {range.range === "custom" && (
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="inputBox !w-auto !py-1 text-xs"
              />
              <span className="text-xs text-muted">to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="inputBox !w-auto !py-1 text-xs"
              />
              <button type="button" onClick={applyCustom} className="btn-outline !px-3 !py-1 text-xs">
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className={isLoading ? "animate-pulse" : ""}>
          <h4 className="mb-2 text-sm font-medium text-muted">Order Status</h4>
          {statusData.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted">No orders in this range</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={35} outerRadius={65} paddingAngle={2}>
                  {statusData.map((entry, i) => (
                    <Cell key={entry.status} fill={colorForStatus(entry.status, i)} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
            {statusData.map((s, i) => (
              <span key={s.status} className="flex items-center gap-1 text-[11px] text-muted">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colorForStatus(s.status, i) }} />
                {s.name} ({s.value})
              </span>
            ))}
          </div>
        </Card>

        <Card className={isLoading ? "animate-pulse" : ""}>
          <h4 className="mb-2 text-sm font-medium text-muted">COD vs Prepaid</h4>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={paymentData} dataKey="count" nameKey="name" innerRadius={35} outerRadius={65} paddingAngle={2}>
                {paymentData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value, n, { payload }) => [`${value} orders (${formatCurrency(payload.revenue)})`, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
            {paymentData.map((p) => (
              <span key={p.name} className="flex items-center gap-1 text-[11px] text-muted">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.fill }} />
                {p.name} ({p.count})
              </span>
            ))}
          </div>
        </Card>

        <Card className={isLoading ? "animate-pulse" : ""}>
          <h4 className="mb-2 text-sm font-medium text-muted">New vs Returning</h4>
          <div className="flex h-[180px] flex-col items-center justify-center gap-3">
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
                  {newVsReturning.new}
                </p>
                <p className="text-[11px] text-muted">New</p>
              </div>
              <div>
                <p className="text-2xl font-semibold" style={{ color: "var(--accent)" }}>
                  {newVsReturning.returning}
                </p>
                <p className="text-[11px] text-muted">Returning</p>
              </div>
            </div>
            <p className="text-[11px] text-muted">
              {totalCustomers ? Math.round((newVsReturning.returning / totalCustomers) * 100) : 0}% returning
            </p>
          </div>
        </Card>

        <Card className={isLoading ? "animate-pulse" : ""}>
          <h4 className="mb-2 text-sm font-medium text-muted">Top Delivery Locations</h4>
          {topLocations.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted">No location data</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topLocations} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--muted)" allowDecimals={false} />
                <YAxis type="category" dataKey="state" tick={{ fontSize: 10 }} stroke="var(--muted)" width={70} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BreakdownSection;
