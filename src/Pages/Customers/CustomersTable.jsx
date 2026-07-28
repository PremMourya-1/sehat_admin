import { formatDate } from "../../Utils/utils";

const useCustomersColumns = () => [
  { key: "name", label: "Name", render: (row) => row.name || "-" },
  { key: "email", label: "Email" },
  { key: "mobile", label: "Phone" },
  { key: "orderCount", label: "Orders", render: (row) => row.orderCount ?? 0 },
  { key: "createdAt", label: "Registered On", render: (row) => formatDate(row.createdAt) },
];

export default useCustomersColumns;
