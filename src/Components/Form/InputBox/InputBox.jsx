import { cx } from "../../../Utils/utils";

/**
 * Generic react-hook-form-aware input. Pass the `register` function itself
 * (not register(name)) plus `name` + `rules`, so this component controls how
 * registration happens. Supports text/number/date/textarea/select via `as`.
 */
const InputBox = ({
  label,
  name,
  register,
  rules = {},
  error,
  type = "text",
  as = "input",
  options = [],
  placeholder,
  required = false,
  className = "",
  containerClassName = "",
  disabled = false,
  ...rest
}) => {
  const registerProps = register ? register(name, rules) : {};

  return (
    <div className={cx("formGroup", containerClassName)}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span style={{ color: "var(--danger)" }}> *</span>}
        </label>
      )}

      {as === "textarea" ? (
        <textarea
          id={name}
          placeholder={placeholder}
          disabled={disabled}
          className={cx("inputBox", error && "has-error", className)}
          rows={4}
          {...registerProps}
          {...rest}
        />
      ) : as === "select" ? (
        <select
          id={name}
          disabled={disabled}
          className={cx("inputBox", error && "has-error", className)}
          {...registerProps}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={cx("inputBox", error && "has-error", className)}
          {...registerProps}
          {...rest}
        />
      )}

      {error && <p className="form-error">{error.message}</p>}
    </div>
  );
};

export default InputBox;
