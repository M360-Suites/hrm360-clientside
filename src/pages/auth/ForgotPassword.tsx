import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, Mail, ShieldCheck, Lock, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorLocal, setErrorLocal] = useState("");
  
  const { sendCode, verifyCode, resetPassword, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal("");
    if (!email) return setErrorLocal("Email is required");
    
    const success = await sendCode(email, "reset");
    if (success) setStep(2);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal("");
    if (code.length < 4) return setErrorLocal("Enter a valid code");
    
    const success = await verifyCode(email, code, "reset");
    if (success) setStep(3);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal("");
    if (newPassword.length < 8) return setErrorLocal("Password must be at least 8 characters");
    
    const success = await resetPassword({ token: code, newPassword, email });
    if (success) navigate("/login");
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] transition-all text-sm placeholder:text-gray-400 pl-11";

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {step === 1 ? "Forgot Password?" : step === 2 ? "Check your email" : "Reset Password"}
        </h2>
        <p className="text-gray-500">
          {step === 1 ? "It happens to the best of us." : step === 2 ? `We sent a code to ${email}` : "Choose a strong new password"}
        </p>
      </div>

      {(error || errorLocal) && (
        <div className="mb-6 p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100">
          {error || errorLocal}
        </div>
      )}

      {step === 1 && (
        <form className="space-y-6" onSubmit={handleSendCode}>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ebenezer@fundit.com.ng" 
              className={inputCls}
            />
          </div>
          <button 
            disabled={isLoading}
            className="w-full py-3.5 bg-[#3B00D9] hover:bg-[#3500c0] text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="animate-spin" size={18} />}
            Send Reset Code
          </button>
        </form>
      )}

      {step === 2 && (
        <form className="space-y-6" onSubmit={handleVerifyCode}>
          <div className="relative">
            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code" 
              className={inputCls}
            />
          </div>
          <button 
            disabled={isLoading}
            className="w-full py-3.5 bg-[#3B00D9] hover:bg-[#3500c0] text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="animate-spin" size={18} />}
            Verify Code
          </button>
          <button 
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-sm text-gray-500 hover:text-gray-800 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} /> Back to email
          </button>
        </form>
      )}

      {step === 3 && (
        <form className="space-y-6" onSubmit={handleReset}>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password (Min. 8 chars)" 
              className={inputCls}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button 
            disabled={isLoading}
            className="w-full py-3.5 bg-[#3B00D9] hover:bg-[#3500c0] text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="animate-spin" size={18} />}
            Update Password
          </button>
        </form>
      )}
      
      <div className="text-center mt-8">
        <Link to="/login" className="text-sm text-gray-500 hover:text-gray-800 transition-colors flex items-center justify-center gap-2 font-medium">
          <ArrowLeft size={14} /> Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
