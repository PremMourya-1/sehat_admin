import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { MdCloudUpload, MdClose } from "react-icons/md";
import { getImageUrl } from "../../../Utils/utils";

/**
 * Multi-image dropzone with support for a mix of already-uploaded server
 * images (shown with a remove button that marks them for deletion via
 * `removeImageIds`) and newly-added local files (previewed via object URLs).
 *
 * Props:
 * - existingImages: [{ id, image }]  — images already on the server
 * - removedIds: string[]             — ids of existingImages marked for removal
 * - onRemoveExisting(id)             — toggles an existing image into removedIds
 * - files: File[]                    — newly added local files (parent-controlled state)
 * - onFilesChange(files)             — replace the files array
 * - maxFiles
 */
const MultiImageUpload = ({
  label = "Product Images",
  existingImages = [],
  removedIds = [],
  onRemoveExisting,
  files = [],
  onFilesChange,
  maxFiles = 6,
}) => {
  const onDrop = useCallback(
    (accepted) => {
      const remainingSlots = maxFiles - (existingImages.length - removedIds.length) - files.length;
      const next = accepted.slice(0, Math.max(remainingSlots, 0));
      onFilesChange?.([...files, ...next]);
    },
    [files, onFilesChange, maxFiles, existingImages.length, removedIds.length],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const removeNewFile = (index) => {
    const next = [...files];
    next.splice(index, 1);
    onFilesChange?.(next);
  };

  const visibleExisting = existingImages.filter((img) => !removedIds.includes(img.id));

  return (
    <div className="formGroup">
      {label && <label className="form-label">{label}</label>}

      <div
        {...getRootProps()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors"
        style={{
          borderColor: isDragActive ? "var(--primary)" : "var(--border)",
          backgroundColor: isDragActive ? "var(--primary-tp)" : "var(--background-light)",
        }}
      >
        <input {...getInputProps()} />
        <MdCloudUpload className="text-3xl" style={{ color: "var(--primary)" }} />
        <p className="text-sm text-muted">
          Drag & drop images here, or click to select (up to {maxFiles})
        </p>
      </div>

      {(visibleExisting.length > 0 || files.length > 0) && (
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-2">
          {visibleExisting.map((img) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border" style={{ borderColor: "var(--border)" }}>
              <img src={getImageUrl(img.image)} alt="product" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onRemoveExisting?.(img.id)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                aria-label="Remove image"
              >
                <MdClose size={14} />
              </button>
            </div>
          ))}
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="group relative aspect-square overflow-hidden rounded-lg border" style={{ borderColor: "var(--border)" }}>
              <img src={URL.createObjectURL(file)} alt={file.name} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeNewFile(index)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                aria-label="Remove image"
              >
                <MdClose size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiImageUpload;
