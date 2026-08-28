import { useRef, useState } from "react";
import { createPortal } from "react-dom";

const MARGIN = 8;

/**
 * Generic hover-to-reveal popover. Renders its content via a portal into
 * `document.body` at a fixed (viewport-relative) position computed from the
 * trigger's own bounding rect — not a plain `position: absolute` child —
 * because most of this admin's tables sit inside an `overflow-x: auto`
 * wrapper (see Components/Table/Table.jsx), which also clips overflow-y;
 * an absolutely-positioned child would get silently cut off there.
 *
 * Keyboard-focusable (opens on focus too, not just mouse hover) so it's not
 * mouse-only.
 */
const HoverCard = ({ trigger, children, width = 260 }) => {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState(null);
  const triggerRef = useRef(null);

  const show = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Clamp horizontally so the card never runs off the right edge of the
    // viewport for a trigger sitting near it; flip above the trigger if
    // there isn't room below.
    const left = Math.min(rect.left, window.innerWidth - width - MARGIN);
    const spaceBelow = window.innerHeight - rect.bottom;
    const openAbove = spaceBelow < 160 && rect.top > spaceBelow;

    setStyle({
      position: "fixed",
      left: Math.max(left, MARGIN),
      top: openAbove ? undefined : rect.bottom + 6,
      bottom: openAbove ? window.innerHeight - rect.top + 6 : undefined,
      width,
      zIndex: 1000,
    });
    setOpen(true);
  };

  const hide = () => setOpen(false);

  return (
    <span
      ref={triggerRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      // Deliberately focusable (not just hoverable) so the popover is
      // reachable via keyboard too, matching the WAI-ARIA tooltip pattern
      // for a trigger that isn't already a native interactive element.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      className="inline-block"
    >
      {trigger}
      {open &&
        style &&
        createPortal(
          <div
            role="tooltip"
            style={{
              ...style,
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-lg)",
              borderRadius: "0.75rem",
            }}
            className="p-3"
            onMouseEnter={show}
            onMouseLeave={hide}
          >
            {children}
          </div>,
          document.body,
        )}
    </span>
  );
};

export default HoverCard;
