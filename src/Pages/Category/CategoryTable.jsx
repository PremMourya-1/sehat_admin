import ActionButtons from "../../Components/Common/ActionButtons/ActionButtons";
import { getImageUrl } from "../../Utils/utils";

const useCategoryColumns = ({ onEdit, onDelete }) => [
  {
    key: "image",
    label: "Image",
    render: (row) =>
      row.image ? (
        <img
          src={getImageUrl(row.image)}
          alt={row.name}
          className="h-11 w-11 rounded-full border object-cover"
          style={{ borderColor: "var(--border)" }}
        />
      ) : (
        <div className="h-11 w-11 rounded-full" style={{ backgroundColor: "var(--background-light)" }} />
      ),
  },
  { key: "name", label: "Name" },
  {
    key: "status",
    label: "Status",
    render: (row) => (row.status ? <span className="badge-success">Active</span> : <span className="badge-danger">Inactive</span>),
  },
  {
    key: "actions",
    label: "Actions",
    render: (row) => <ActionButtons onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} />,
  },
];

export default useCategoryColumns;
