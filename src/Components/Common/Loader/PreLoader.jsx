import { ClipLoader } from "react-spinners";

/**
 * Full-width block loader — used inside Table / page bodies while data fetches.
 */
const PreLoader = ({ height = "16rem", label = "Loading..." }) => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-3" style={{ height }}>
      <ClipLoader size={38} color="var(--primary)" cssOverride={{ borderColor: "var(--primary) var(--primary) transparent" }} />
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
};

export default PreLoader;
