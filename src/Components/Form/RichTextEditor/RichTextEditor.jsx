import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

/**
 * Controlled rich text editor for long-description / CMS content fields.
 * Use with react-hook-form's <Controller /> — pass `value` + `onChange`.
 */
const RichTextEditor = ({ label, value, onChange, error, placeholder = "Write something..." }) => {
  return (
    <div className="formGroup">
      {label && <label className="form-label">{label}</label>}
      <div className={error ? "rounded-lg" : ""} style={error ? { border: "1px solid var(--danger)" } : {}}>
        <ReactQuill theme="snow" value={value || ""} onChange={onChange} modules={modules} placeholder={placeholder} />
      </div>
      {error && <p className="form-error">{error.message}</p>}
    </div>
  );
};

export default RichTextEditor;
