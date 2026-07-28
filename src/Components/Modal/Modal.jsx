import { Modal as RsModal } from "rsuite";
import Button from "../Button/Button";
import LoaderSpiner from "../Common/Loader/LoaderSpiner";

/**
 * Generic modal wrapping rsuite Modal, with a standard confirm/cancel footer.
 * Pass an arbitrary `body` node for the content.
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
    <RsModal open={open} onClose={onClose} size={size}>
      {title && (
        <RsModal.Header>
          <RsModal.Title>{title}</RsModal.Title>
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
