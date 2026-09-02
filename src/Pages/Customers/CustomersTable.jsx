import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { FiLogIn } from "react-icons/fi";
import { formatDate } from "../../Utils/utils";

const useCustomersColumns = ({ onImpersonate }) => [
  { key: "name", label: "Name", sticky: true, render: (row) => row.name || "-" },
  { key: "email", label: "Email" },
  { key: "mobileNumber", label: "Phone" },
  { key: "orderCount", label: "Orders", render: (row) => row.orderCount ?? 0 },
  { key: "createdAt", label: "Registered On", render: (row) => formatDate(row.createdAt) },
  {
    key: "actions",
    label: "Actions",
    render: (row) => (
      <Tippy content="Login as this customer">
        <button
          type="button"
          onClick={() => onImpersonate(row.id)}
          className="action-icon-view"
          aria-label={`Login as ${row.name || "customer"}`}
        >
          <FiLogIn />
        </button>
      </Tippy>
    ),
  },
];

export default useCustomersColumns;
