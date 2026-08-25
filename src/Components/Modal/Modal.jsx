import { Modal as RsModal } from "rsuite";
import { MdClose } from "react-icons/md";
import Button from "../Button/Button";
import LoaderSpiner from "../Common/Loader/LoaderSpiner";

/**
 * Generic modal wrapping rsuite Modal, with a standard confirm/cancel footer.
 * Pass an arbitrary `body` node for the content. `backdrop="static"` means
 * clicking outside never closes it — same reasoning as Components/Drawer.
 */
const CustomModal = ({
  open,
  onClose,
  title,
  body,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "primary",
  isLoading = false,
  size = "xs",
}) => {
  return (
    <RsModal open={open} onClose={onClose} size={size} backdrop="static" closeButton={false}>
      {title && (
        <RsModal.Header>
          <div className="flex w-full items-center justify-between">
            <RsModal.Title>{title}</RsModal.Title>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="btn-icon shrink-0 hover:bg-[var(--background-light)]"
              style={{ color: "var(--text-light)" }}
            >
              <MdClose size={20} />
            </button>
          </div>
        </RsModal.Header>
      )}
      <RsModal.Body>{body}</RsModal.Body>
      {onConfirm && (
        <RsModal.Footer>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? <LoaderSpiner size={16} /> : confirmLabel}
          </Button>
        </RsModal.Footer>
      )}
    </RsModal>
  );
};

export default CustomModal;
