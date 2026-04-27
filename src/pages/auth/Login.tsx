import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

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
    else if (!emailRegex.test(email)) newErrors.email = "Please enter a valid email address.";
    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters.";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    const success = await login({ email, password });
    if (success) navigate("/dashboard");
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
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
        <p className="text-gray-500">Enter your email and password to access your account</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
            placeholder="bloomingdesigner@gmail.com" 
            className={fieldCls("email")}
          />
          {errors.email && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
              placeholder="*********************" 
              className={fieldCls("password")}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.password}</p>}
        </div>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-[#2ecc71] hover:text-[#27ae60] font-medium transition-colors">
            Forgot Password?
          </Link>
        </div>

        <button 
          disabled={isLoading}
          className="w-full py-3.5 bg-[#3B00D9] hover:bg-[#3500c0] text-white rounded-xl font-medium transition-all shadow-sm shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isLoading && <Loader2 className="animate-spin" size={18} />}
          Login
        </button>

        <button type="button" className="w-full py-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl font-medium flex items-center justify-center gap-2 transition-all">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span className="text-sm">Continue with Google</span>
        </button>
      </form>

      <p className="text-center mt-8 text-sm text-gray-500">
        Don't have an account? <Link to="/register" className="text-[#3B00D9] font-bold hover:underline">Sign up</Link>
      </p>
    </div>
  );
};

export default Login;
