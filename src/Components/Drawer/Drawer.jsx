import { Drawer as RsDrawer } from "rsuite";
import { MdClose } from "react-icons/md";

/**
 * Generic rsuite Drawer wrapper used for module add/edit forms
 * (Category, Coupon, HeroBanner, Testimonial, Cms). `backdrop="static"`
 * means clicking outside never closes it — admins were losing in-progress
 * form data (especially the Combo Offer builder) to stray outside clicks;
 * the header's own close button (top right, title left) is now the only
 * way to dismiss it besides submitting.
 */
const DrawerComponent = ({ open, onClose, title, children, size = "sm" }) => {
  return (
    <RsDrawer open={open} onClose={onClose} size={size} placement="right" backdrop="static" closeButton={false}>
      <RsDrawer.Header>
        <div className="flex w-full items-center justify-between">
          <RsDrawer.Title>{title}</RsDrawer.Title>
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
      </RsDrawer.Header>
      <RsDrawer.Body>{children}</RsDrawer.Body>
    </RsDrawer>
  );
};

export default DrawerComponent;
