import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { BRAND_NAME } from "../../Constant/Constant";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import { cx } from "../../Utils/utils";
import { EXPENSE_USERS } from "./expensesConstants";
import { expensesLogin } from "./expensesAuthService";

const ExpensesLogin = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name) {
      setError("Select who's logging in");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    await expensesLogin({ name, password }, setIsLoading, navigate).catch(() => {});
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-4xl">💰</span>
          <h1 className="brand-logo mt-2 text-3xl">{BRAND_NAME}</h1>
          <p className="brand-tagline mt-1 text-sm">Expenses Tracker</p>
        </div>

        <div className="card">
          <h2 className="section-title mb-1">Expenses Login</h2>
          <p className="mb-5 text-sm text-muted">Sign in to track purchases</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="formGroup">
              <label className="form-label">
                Who&apos;s logging in?<span style={{ color: "var(--danger)" }}> *</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {EXPENSE_USERS.map((user) => (
                  <button
                    key={user.value}
                    type="button"
                    onClick={() => setName(user.value)}
                    className={cx(
                      "rounded-lg border py-3 text-sm font-medium transition-colors duration-150",
                      name === user.value ? "text-white" : "bg-white",
                    )}
                    style={
                      name === user.value
                        ? { backgroundColor: "var(--primary)", borderColor: "var(--primary)" }
                        : { borderColor: "var(--border)", color: "var(--text)" }
                    }
                  >
                    {user.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="formGroup">
              <label htmlFor="expenses-password" className="form-label">
                Password
                <span style={{ color: "var(--danger)" }}> *</span>
              </label>
              <div className="relative">
                <input
                  id="expenses-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="inputBox pr-10"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {error && <p className="form-error">{error}</p>}
            </div>

            <button type="submit" className="btn-primary mt-2 w-full" disabled={isLoading}>
              {isLoading ? <LoaderSpiner size={18} /> : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpensesLogin;
