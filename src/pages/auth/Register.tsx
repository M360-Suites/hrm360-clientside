import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getPasswordStrength = (pw: string) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColor = ["", "bg-rose-400", "bg-amber-400", "bg-blue-400", "bg-emerald-500"];

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", companyName: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signup, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const strength = getPasswordStrength(formData.password);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = "Full name is required.";
    else if (formData.name.trim().length < 2) e.name = "Name must be at least 2 characters.";
    if (!formData.email.trim()) e.email = "Email is required.";
    else if (!emailRegex.test(formData.email)) e.email = "Please enter a valid email address.";
    if (!formData.companyName.trim()) e.companyName = "Company name is required.";
    if (!formData.password.trim()) e.password = "Password is required.";
    else if (formData.password.trim().length < 8) e.password = "Password must be at least 8 characters.";
    else if (strength < 2) e.password = "Password is too weak. Add uppercase letters or numbers.";
    if (!agreed) e.terms = "You must agree to the Terms of Service.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    const success = await signup(formData);
    if (success) navigate("/login");
  };

  const set = (field: string, val: string) => {
    setFormData(p => ({ ...p, [field]: val }));
    setErrors(p => ({ ...p, [field]: "" }));
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
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
        <p className="text-gray-500">Get started with HRM360 today</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Ebenezer Johnson"
            className={fieldCls("name")}
          />
          {errors.name && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="ebenezer@fundit.com.ng"
            className={fieldCls("email")}
          />
          {errors.email && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.email}</p>}
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
          <input
            type="text"
            value={(formData as any).companyName || ""}
            onChange={(e) => set("companyName", e.target.value)}
            placeholder="e.g. BTech 360 Solutions"
            className={fieldCls("companyName")}
          />
          {errors.companyName && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.companyName}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="Min. 8 characters"
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

          {/* Strength meter */}
          {formData.password.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      strength >= i ? strengthColor[strength] : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs font-semibold ${
                strength <= 1 ? "text-rose-500" : strength === 2 ? "text-amber-500" : strength === 3 ? "text-blue-500" : "text-emerald-600"
              }`}>
                {strengthLabel[strength]} password
              </p>
            </div>
          )}

          {errors.password && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.password}</p>}

          {/* Password requirements */}
          <div className="mt-2 grid grid-cols-2 gap-1">
            {[
              { label: "8+ characters", ok: formData.password.length >= 8 },
              { label: "Uppercase letter", ok: /[A-Z]/.test(formData.password) },
              { label: "Number", ok: /[0-9]/.test(formData.password) },
              { label: "Special character", ok: /[^A-Za-z0-9]/.test(formData.password) },
            ].map(req => (
              <div key={req.label} className={`flex items-center gap-1 text-xs ${req.ok ? "text-emerald-600" : "text-gray-400"}`}>
                <CheckCircle size={11} className={req.ok ? "opacity-100" : "opacity-30"} />
                {req.label}
              </div>
            ))}
          </div>
        </div>

        {/* Terms */}
        <div>
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => { setAgreed(e.target.checked); setErrors(p => ({ ...p, terms: "" })); }}
              className="mt-0.5 rounded border-gray-300 text-[#3B00D9] focus:ring-[#3B00D9]"
            />
            <span>
              I agree to the{" "}
              <Link to="#" className="text-[#3B00D9] font-medium hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link to="#" className="text-[#3B00D9] font-medium hover:underline">Privacy Policy</Link>
            </span>
          </div>
          {errors.terms && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.terms}</p>}
        </div>

        <button
          disabled={isLoading}
          className="w-full py-3.5 bg-[#3B00D9] hover:bg-[#3500c0] text-white rounded-xl font-medium transition-all shadow-sm shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isLoading && <Loader2 className="animate-spin" size={18} />}
          Sign up
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <button 
          type="button" 
          onClick={() => useAuthStore.getState().initiateGoogleLogin()}
          className="w-full py-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span className="text-sm">Sign up with Google</span>
        </button>

      </form>

      <p className="text-center mt-8 text-sm text-gray-500">
        Already have an account?{" "}
        <Link to="/login" className="text-[#3B00D9] font-bold hover:underline">Login</Link>
      </p>
    </div>
  );
};

export default Register;
