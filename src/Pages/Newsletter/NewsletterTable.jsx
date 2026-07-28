import ActionButtons from "../../Components/Common/ActionButtons/ActionButtons";
import { formatDate } from "../../Utils/utils";

const useNewsletterColumns = ({ onDelete }) => [
  { key: "email", label: "Email" },
  { key: "createdAt", label: "Subscribed On", render: (row) => formatDate(row.createdAt) },
  {
    key: "actions",
    label: "Actions",
    render: (row) => <ActionButtons onDelete={() => onDelete(row)} />,
  },
];

export default useNewsletterColumns;
