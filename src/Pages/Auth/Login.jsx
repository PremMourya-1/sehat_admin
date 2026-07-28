import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import InputBox from "../../Components/Form/InputBox/InputBox";
import LoaderSpiner from "../../Components/Common/Loader/LoaderSpiner";
import { BRAND_NAME, BRAND_TAGLINE } from "../../Constant/Constant";
import login from "./authService";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = (data) => {
    login(data, dispatch, setIsLoading, navigate);
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-4xl">🌰</span>
          <h1 className="brand-logo mt-2 text-3xl">{BRAND_NAME}</h1>
          <p className="brand-tagline mt-1 text-sm">{BRAND_TAGLINE}</p>
        </div>

        <div className="card">
          <h2 className="section-title mb-1">Admin Login</h2>
          <p className="mb-5 text-sm text-muted">Sign in to manage your store</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <InputBox
              label="Email or Mobile"
              name="userName"
              register={register}
              rules={{ required: "Email or mobile is required" }}
              error={errors.userName}
              placeholder="admin@sehatpotli.com"
              required
            />

            <div className="formGroup">
              <label htmlFor="password" className="form-label">
                Password
                <span style={{ color: "var(--danger)" }}> *</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`inputBox pr-10 ${errors.password ? "has-error" : ""}`}
                  {...register("password", { required: "Password is required" })}
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
              {errors.password && <p className="form-error">{errors.password.message}</p>}
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

export default Login;
