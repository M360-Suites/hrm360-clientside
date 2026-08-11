import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { getCookie } from "../../utils/cookies";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password.trim()) newErrors.password = "Password is required.";
    else if (password.trim().length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    const success = await login({ email, password });
    if (!success) return;
    const orgId = getCookie("orgId");
    if (orgId) {
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/onboarding", { replace: true });
    }
  };

  const fieldCls = (field: string) =>
    `w-full px-4 py-3 bg-white/10 rounded-xl border text-sm text-white placeholder:text-white/40 transition-all outline-none focus:ring-2 ${
      errors[field]
        ? "border-rose-400/80 focus:ring-rose-400/20"
        : "border-white/20 focus:ring-white/20 focus:border-white/40"
    }`;

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-black/40 backdrop-blur-md p-8 shadow-xl">
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-white mb-1.5">Sign in</h2>
        <p className="text-sm text-white/50">
          Enter your credentials to continue.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="p-3 text-xs text-rose-300 bg-rose-500/10 rounded-xl border border-rose-400/20">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((prev) => ({ ...prev, email: "" }));
            }}
            placeholder="name@company.com"
            className={fieldCls("email")}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-rose-400">{errors.email}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-white/60">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-white/40 hover:text-white transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
              placeholder="••••••••"
              className={fieldCls("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-rose-400">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isLoading && <Loader2 className="animate-spin" size={16} />}
          Sign in
        </button>
      </form>

      <p className="text-center mt-6 text-xs text-white/40">
        Don&apos;t have an account?{" "}
        <Link
          to="/register"
          className="text-white/70 font-semibold hover:text-white transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;