import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

const Activation = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const { activateAccount, error } = useAuthStore();
  const token = searchParams.get("token");

  useEffect(() => {
    const triggerActivation = async () => {
      if (!token) {
        setStatus('error');
        return;
      }
      
      const success = await activateAccount(token);
      setStatus(success ? 'success' : 'error');
    };

    triggerActivation();
  }, [token, activateAccount]);

  return (
    <div className="w-full text-center">
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#3B00D9]" size={48} />
          <h2 className="text-2xl font-bold text-gray-800">Activating your account...</h2>
          <p className="text-gray-500">Please wait while we verify your activation link.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Account Activated!</h2>
          <p className="text-gray-500">Your account is now active. You can proceed to login.</p>
          <Link 
            to="/login" 
            className="mt-4 px-8 py-3 bg-[#3B00D9] text-white rounded-xl font-medium hover:bg-[#3500c0] transition-all"
          >
            Go to Login
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Activation Failed</h2>
          <p className="text-gray-500">{error || "The activation link is invalid or has expired."}</p>
          <Link 
            to="/register" 
            className="mt-4 px-8 py-3 bg-gray-100 text-gray-800 rounded-xl font-medium hover:bg-gray-200 transition-all"
          >
            Register again
          </Link>
        </div>
      )}
    </div>
  );
};

export default Activation;
