import { Link } from "react-router-dom";
import { cx } from "../../Utils/utils";

const VARIANT_CLASS = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  accent: "btn-accent",
  outline: "btn-outline",
  danger: "btn-danger",
};

const SIZE_CLASS = {
  sm: "!px-3 !py-1.5 !text-xs",
  md: "",
  lg: "!px-6 !py-3 !text-base",
};

/**
 * Generic button component. Renders a react-router <Link> when a `url` prop
 * is supplied (nav-as-link pattern), otherwise a plain <button>.
 */
const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  url,
  type = "button",
  className = "",
  disabled = false,
  onClick,
  ...rest
}) => {
  const classes = cx(VARIANT_CLASS[variant] || VARIANT_CLASS.primary, SIZE_CLASS[size], className);

  if (url) {
    return (
      <Link to={url} className={classes} {...rest}>
        {icon && <span className="text-base">{icon}</span>}
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick} {...rest}>
      {icon && <span className="text-base">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
