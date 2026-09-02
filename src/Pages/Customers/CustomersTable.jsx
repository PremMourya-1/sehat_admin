import { formatDate } from "../../Utils/utils";

const useCustomersColumns = () => [
  { key: "name", label: "Name", sticky: true, render: (row) => row.name || "-" },
  { key: "email", label: "Email" },
  { key: "mobileNumber", label: "Phone" },
  { key: "orderCount", label: "Orders", render: (row) => row.orderCount ?? 0 },
  { key: "createdAt", label: "Registered On", render: (row) => formatDate(row.createdAt) },
];

export default useCustomersColumns;
