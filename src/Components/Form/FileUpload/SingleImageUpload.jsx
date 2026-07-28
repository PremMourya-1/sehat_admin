import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { MdCloudUpload, MdClose } from "react-icons/md";
import { getImageUrl } from "../../../Utils/utils";

/**
 * Single-image dropzone. Shows either the existing server image, a freshly
 * picked local file preview, or an empty drop target. `rounded` renders an
 * avatar-style circular preview (used by Category).
 */
const SingleImageUpload = ({
  label = "Image",
  existingImage,
  onRemoveExisting,
  file,
  onFileChange,
  rounded = false,
  aspect = "aspect-square",
}) => {
  const onDrop = useCallback(
    (accepted) => {
      if (accepted?.[0]) onFileChange?.(accepted[0]);
    },
    [onFileChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const previewSrc = file ? URL.createObjectURL(file) : existingImage ? getImageUrl(existingImage) : null;

  return (
    <div className="formGroup">
      {label && <label className="form-label">{label}</label>}

      {previewSrc ? (
        <div
          className={`group relative ${aspect} ${rounded ? "h-28 w-28 rounded-full" : "w-full max-w-xs rounded-lg"} overflow-hidden border`}
          style={{ borderColor: "var(--border)" }}
        >
          <img src={previewSrc} alt="preview" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => {
              if (file) onFileChange?.(null);
              else onRemoveExisting?.();
            }}
            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
            aria-label="Remove image"
          >
            <MdClose size={14} />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed px-4 py-8 text-center transition-colors ${
            rounded ? "h-28 w-28 rounded-full" : "w-full max-w-xs rounded-lg"
          }`}
          style={{
            borderColor: isDragActive ? "var(--primary)" : "var(--border)",
            backgroundColor: isDragActive ? "var(--primary-tp)" : "var(--background-light)",
          }}
        >
          <input {...getInputProps()} />
          <MdCloudUpload className="text-2xl" style={{ color: "var(--primary)" }} />
          {!rounded && <p className="text-xs text-muted">Click or drag to upload</p>}
        </div>
      )}
    </div>
  );
};

export default SingleImageUpload;
