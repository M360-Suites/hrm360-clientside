import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboardingStore } from "@/store/staff/onboarding_store";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { getCookie } from "@/utils/cookies";

const ChangePassword = () => {
  const navigate = useNavigate();
  const {isChanging, passwordChange, error} = useOnboardingStore()
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const code = getCookie("code") || "";


  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await passwordChange({
      oldPassword: code,
      newPassword,
    });

    if (success) {
      navigate("/employee/verified");
    }
  };

  return (
    <div className="w-full relative max-md:pt-10">
      <div className="text-center mb-8 max-md:gap-2">
        <h2 className="text-3xl max-md:text-xl text-start font-bold text-gray-800 mb-2 max-md:mb-0">
          Set a Password
        </h2>

        <p className="text-gray-500 max-md:text-sm text-start">
          Create a new password for your account.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100">
          {error}
        </div>
      )}


        <form className="space-y-5 w-[547px] max-md:w-full" onSubmit={handleResetPassword}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter password"
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 transition-all text-sm placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9]"
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

        <div className="max-md:fixed max-md:bottom-5  max-md:left-0 max-md:right-0 max-md:px-4 max-md:py-3">
            <button
                    type="submit"
                    disabled={isChanging}
                    className="w-full py-3.5 bg-[#3B00D9] hover:bg-[#3500c0] text-white rounded-xl font-medium transition-all shadow-xs shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {isChanging && <Loader2 className="animate-spin" size={18} />}
                    Set Password
            </button>
        </div>
          
        </form>
    </div>
  );
};

export default ChangePassword;
