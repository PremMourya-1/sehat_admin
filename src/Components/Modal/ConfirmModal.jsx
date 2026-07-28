import { MdWarningAmber } from "react-icons/md";
import CustomModal from "./Modal";

/**
 * Delete-confirmation modal — the standard pattern used across every module
 * before a destructive action.
 */
const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  isLoading = false,
  title = "Are you sure?",
  message = "This action cannot be undone.",
}) => {
  return (
    <CustomModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
      confirmLabel="Delete"
      confirmVariant="danger"
      body={
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-3xl"
            style={{ backgroundColor: "rgba(179, 38, 30, 0.12)", color: "var(--danger)" }}
          >
            <MdWarningAmber />
          </div>
          <h3 className="text-base font-semibold" style={{ color: "var(--text)" }}>
            {title}
          </h3>
          <p className="text-sm text-muted">{message}</p>
        </div>
      }
    />
  );
};

export default ConfirmModal;
