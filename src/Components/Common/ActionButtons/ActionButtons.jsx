import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

/**
 * Row-level action icon buttons for table rows: view / edit / delete.
 * Pass only the handlers you want to show — omit a handler to hide that action.
 */
const ActionButtons = ({ onView, onEdit, onDelete, viewLabel = "View", editLabel = "Edit", deleteLabel = "Delete" }) => {
  return (
    <div className="flex items-center gap-2">
      {onView && (
        <Tippy content={viewLabel}>
          <button type="button" onClick={onView} className="action-icon-view" aria-label={viewLabel}>
            <FaEye />
          </button>
        </Tippy>
      )}
      {onEdit && (
        <Tippy content={editLabel}>
          <button type="button" onClick={onEdit} className="action-icon-edit" aria-label={editLabel}>
            <FaEdit />
          </button>
        </Tippy>
      )}
      {onDelete && (
        <Tippy content={deleteLabel}>
          <button type="button" onClick={onDelete} className="action-icon-delete" aria-label={deleteLabel}>
            <FaTrash />
          </button>
        </Tippy>
      )}
    </div>
  );
};

export default ActionButtons;
