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
    `w-full px-4 py-3 rounded-xl border transition-all text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
      errors[field]
        ? "border-rose-400 focus:ring-rose-200 focus:border-rose-400"
        : "border-gray-200 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9]"
    }`;

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome Back
        </h2>

        <p className="text-gray-500">
          Enter your email and password to access your account.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((prev) => ({ ...prev, email: "" }));
            }}
            placeholder="you@example.com"
            className={fieldCls("email")}
          />

          {errors.email && (
            <p className="mt-1.5 text-xs text-rose-500 font-medium">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
              placeholder="Enter your password"
              className={fieldCls("password")}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {errors.password && (
            <p className="mt-1.5 text-xs text-rose-500 font-medium">
              {errors.password}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-[#2ecc71] hover:text-[#27ae60] font-medium transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-[#3B00D9] hover:bg-[#3500c0] text-white rounded-xl font-medium transition-all shadow-sm shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isLoading && <Loader2 className="animate-spin" size={18} />}
          Login
        </button>
      </form>

      <p className="text-center mt-8 text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link
          to="/register"
          className="text-[#3B00D9] font-bold hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;