import { Link } from "react-router-dom";
import { BRAND_NAME } from "../../Constant/Constant";

const Error = () => {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center"
      style={{ backgroundColor: "var(--background)" }}
    >
      <span className="text-5xl">🌰</span>
      <h1 className="brand-logo text-3xl">{BRAND_NAME}</h1>
      <h2 className="text-6xl font-bold" style={{ color: "var(--primary)" }}>
        404
      </h2>
      <p className="text-muted">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-2">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default Error;
