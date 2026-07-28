import { Drawer as RsDrawer } from "rsuite";

/**
 * Generic rsuite Drawer wrapper used for module add/edit forms
 * (Category, Coupon, HeroBanner, Testimonial, Cms).
 */
const DrawerComponent = ({ open, onClose, title, children, size = "sm" }) => {
  return (
    <RsDrawer open={open} onClose={onClose} size={size} placement="right">
      <RsDrawer.Header>
        <RsDrawer.Title>{title}</RsDrawer.Title>
      </RsDrawer.Header>
      <RsDrawer.Body>{children}</RsDrawer.Body>
    </RsDrawer>
  );
};

export default DrawerComponent;
