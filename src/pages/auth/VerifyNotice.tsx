import { Link, useLocation } from "react-router-dom";
import { MailCheck } from "lucide-react";

const VerifyNotice = () => {
  const location = useLocation();
  const email = location.state?.email;

  return (
    <div className="w-full text-center">
      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-indigo-50 text-[#3B00D9] flex items-center justify-center">
        <MailCheck size={32} />
      </div>

      <h2 className="text-3xl font-bold text-gray-800 mb-3">
        Verify your email
      </h2>

      <p className="text-gray-500 leading-relaxed mb-8">
        We sent a verification link to{" "}
        <span className="font-semibold text-gray-700">
          {email || "your email"}
        </span>
        . Please open your email and click the verification link to activate
        your account.
      </p>

      <p className="text-sm text-gray-500">
        Already verified?{" "}
        <Link to="/login" className="text-[#3B00D9] font-bold hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default VerifyNotice;