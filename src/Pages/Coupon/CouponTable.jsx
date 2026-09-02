import ActionButtons from "../../Components/Common/ActionButtons/ActionButtons";
import { formatCurrency, formatDate } from "../../Utils/utils";

const useCouponColumns = ({ onEdit, onDelete }) => [
  { key: "code", label: "Code", sticky: true, render: (row) => <span className="badge-accent">{row.code}</span> },
  { key: "discountPercent", label: "Discount", render: (row) => `${row.discountPercent}%` },
  { key: "minOrderAmount", label: "Min Order", render: (row) => formatCurrency(row.minOrderAmount) },
  { key: "maxDiscountAmount", label: "Max Discount", render: (row) => (row.maxDiscountAmount ? formatCurrency(row.maxDiscountAmount) : "-") },
  { key: "usage", label: "Usage", render: (row) => `${row.usedCount ?? 0}${row.usageLimit ? ` / ${row.usageLimit}` : ""}` },
  { key: "expiresAt", label: "Expires On", render: (row) => (row.expiresAt ? formatDate(row.expiresAt) : "Never") },
  {
    key: "isActive",
    label: "Status",
    render: (row) => (row.isActive ? <span className="badge-success">Active</span> : <span className="badge-danger">Inactive</span>),
  },
  {
    key: "actions",
    label: "Actions",
    render: (row) => <ActionButtons onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} />,
  },
];

export default useCouponColumns;
