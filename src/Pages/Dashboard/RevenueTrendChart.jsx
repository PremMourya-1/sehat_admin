import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import Card from "../../Components/Card/Card";
import { formatCurrency } from "../../Utils/utils";

// Abbreviates large axis values (10500 -> "10.5k") — also sidesteps a
// clipping issue where recharts' default numeric labels were wide enough
// to get cut off against the axis width (e.g. "10000" rendering as
// "0000").
function formatAxisNumber(value) {
  const num = Number(value);
  if (Math.abs(num) >= 1000) return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k`;
  return num;
}

const METRICS = [
  { key: "revenue", label: "Revenue" },
  { key: "orderCount", label: "Orders" },
  { key: "averageOrderValue", label: "Avg. Order Value" },
  { key: "cancellationRate", label: "Cancellation %" },
];

function CustomTooltip({ active, payload, label, metric }) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  const formatted =
    metric === "revenue" || metric === "averageOrderValue"
      ? formatCurrency(value)
      : metric === "cancellationRate"
        ? `${Number(value).toFixed(1)}%`
        : value;
  return (
    <div className="rounded-lg border bg-(--surface,#fff) p-2 text-xs shadow-md" style={{ borderColor: "var(--border)" }}>
      <p className="font-medium" style={{ color: "var(--text)" }}>
        {label}
      </p>
      <p className="text-muted">{formatted}</p>
    </div>
  );
}

const RevenueTrendChart = ({ trend, isLoading, days, onDaysChange }) => {
  const [activeMetric, setActiveMetric] = useState("revenue");

  const data = useMemo(
    () =>
      (trend || []).map((row) => ({
        ...row,
        label: row.date?.slice(5), // MM-DD, compact for the x-axis
      })),
    [trend],
  );

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="section-title">Trend</h3>
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 rounded-full bg-(--primary-tp,#f0ede6) p-1">
            {METRICS.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setActiveMetric(m.key)}
                className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: activeMetric === m.key ? "var(--primary)" : "transparent",
                  color: activeMetric === m.key ? "#fff" : "var(--text)",
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
          <select
            value={days}
            onChange={(e) => onDaysChange(Number(e.target.value))}
            className="inputBox !w-auto !py-1 text-xs"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="h-72 animate-pulse rounded-lg bg-(--primary-tp,#f0ede6)" />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--muted)" />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="var(--muted)"
              width={48}
              tickFormatter={formatAxisNumber}
            />
            <Tooltip content={<CustomTooltip metric={activeMetric} />} />
            {activeMetric === "revenue" && (
              <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fill="url(#revenueFill)" strokeWidth={2} />
            )}
            {activeMetric === "orderCount" && (
              <Bar dataKey="orderCount" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={28} />
            )}
            {activeMetric === "averageOrderValue" && (
              <Line type="monotone" dataKey="averageOrderValue" stroke="var(--primary)" strokeWidth={2} dot={false} />
            )}
            {activeMetric === "cancellationRate" && (
              <Line type="monotone" dataKey="cancellationRate" stroke="var(--danger)" strokeWidth={2} dot={false} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default RevenueTrendChart;
