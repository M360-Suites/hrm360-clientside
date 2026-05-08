import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { getCookie } from "../../utils/cookies";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const {
    sendCode,
    verifyCode,
    resetPassword,
    resetToken,
    isLoading,
    error,
  } = useAuthStore();

  const [step, setStep] = useState<"email" | "code" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const reason = "password-reset";

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await sendCode(email, reason);

    if (success) {
      setStep("code");
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await verifyCode(email, code, reason);

    if (success) {
      setStep("reset");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = resetToken || getCookie("resetToken");

    if (!token) {
      alert("Reset token missing. Please verify your code again.");
      setStep("code");
      return;
    }

    const success = await resetPassword({
      token,
      newPassword,
    });

    if (success) {
      navigate("/login");
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Reset Password
        </h2>

        <p className="text-gray-500">
          {step === "email" && "Enter your email to receive a verification code."}
          {step === "code" && "Enter the code sent to your email."}
          {step === "reset" && "Create a new password for your account."}
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {step === "email" && (
        <form className="space-y-5" onSubmit={handleSendCode}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 transition-all text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#3B00D9] hover:bg-[#3500c0] text-white rounded-xl font-medium transition-all shadow-sm shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading && <Loader2 className="animate-spin" size={18} />}
            Send Code
          </button>
        </form>
      )}

      {step === "code" && (
        <form className="space-y-5" onSubmit={handleVerifyCode}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Verification Code
            </label>

            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter verification code"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 transition-all text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#3B00D9] hover:bg-[#3500c0] text-white rounded-xl font-medium transition-all shadow-sm shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading && <Loader2 className="animate-spin" size={18} />}
            Verify Code
          </button>
        </form>
      )}

      {step === "reset" && (
        <form className="space-y-5" onSubmit={handleResetPassword}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              New Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 transition-all text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9]"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#3B00D9] hover:bg-[#3500c0] text-white rounded-xl font-medium transition-all shadow-sm shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading && <Loader2 className="animate-spin" size={18} />}
            Reset Password
          </button>
        </form>
      )}

      <p className="text-center mt-8 text-sm text-gray-500">
        Remembered your password?{" "}
        <Link to="/login" className="text-[#3B00D9] font-bold hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;