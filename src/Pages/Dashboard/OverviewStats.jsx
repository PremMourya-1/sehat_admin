import Card from "../../Components/Card/Card";
import { formatCurrency } from "../../Utils/utils";

const PERIODS = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

// One card per metric, each showing all three periods side by side — the
// spec wants today/week/month visible together at a glance, not toggled
// one-at-a-time (that's what the separate date-range filter below is for).
function MetricCard({ title, values, format }) {
  return (
    <Card>
      <p className="mb-3 text-sm font-medium text-muted">{title}</p>
      <div className="grid grid-cols-3 gap-2">
        {PERIODS.map((p) => (
          <div key={p.key} className="text-center">
            <p className="text-lg font-semibold" style={{ color: "var(--text)" }}>
              {format(values?.[p.key] ?? 0)}
            </p>
            <p className="mt-0.5 text-[11px] text-muted">{p.label}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

const OverviewStats = ({ overview, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4 lg:grid-cols-2 xs:grid-cols-1">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4 lg:grid-cols-2 xs:grid-cols-1">
      <MetricCard title="Revenue" values={overview?.revenue} format={formatCurrency} />
      <MetricCard title="Orders" values={overview?.orders} format={(v) => v} />
      <MetricCard title="Avg. Order Value" values={overview?.averageOrderValue} format={formatCurrency} />
      <MetricCard
        title="Cancellation Rate"
        values={overview?.cancellationRate}
        format={(v) => `${Number(v).toFixed(1)}%`}
      />
    </div>
  );
};

export default OverviewStats;
