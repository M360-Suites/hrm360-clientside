import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

const getActivationToken = (searchParams: URLSearchParams) => {
  const queryToken =
    searchParams.get("token") ||
    searchParams.get("activationToken") ||
    searchParams.get("activation_token");

  if (queryToken) return queryToken.trim();

  const hash = window.location.hash;

  if (hash.includes("?")) {
    const hashQuery = hash.split("?")[1];
    const hashParams = new URLSearchParams(hashQuery);

    return (
      hashParams.get("token") ||
      hashParams.get("activationToken") ||
      hashParams.get("activation_token") ||
      ""
    ).trim();
  }

  return "";
};

const Activation = () => {
  const [searchParams] = useSearchParams();
  const { activateAccount, error } = useAuthStore();

  const hasActivated = useRef(false);

  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading"
  );

  useEffect(() => {
    const runActivation = async () => {
      if (hasActivated.current) return;
      hasActivated.current = true;

      const token = getActivationToken(searchParams);

      console.log("ACTIVATION TOKEN FROM URL:", token);
      console.log("FULL ACTIVATION URL:", window.location.href);

      if (!token) {
        setStatus("failed");
        return;
      }

      const success = await activateAccount(token);

      setStatus(success ? "success" : "failed");
    };

    runActivation();
  }, [searchParams, activateAccount]);

  return (
    <div className="w-full text-center">
      {status === "loading" && (
        <>
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-indigo-50 text-[#3B00D9] flex items-center justify-center">
            <Loader2 size={32} className="animate-spin" />
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Verifying account
          </h2>

          <p className="text-gray-500">
            Please wait while we verify your email.
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle size={32} />
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Account verified
          </h2>

          <p className="text-gray-500 mb-8">
            Your email has been verified successfully. You can now login and
            continue onboarding.
          </p>

          <Link
            to="/login"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#3B00D9] text-white font-medium"
          >
            Continue to Login
          </Link>
        </>
      )}

      {status === "failed" && (
        <>
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
            <XCircle size={32} />
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Verification failed
          </h2>

          <p className="text-gray-500 mb-8">
            {error || "The activation link is invalid, expired, or missing a token."}
          </p>

          <Link
            to="/register"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#3B00D9] text-white font-medium"
          >
            Create Account Again
          </Link>
        </>
      )}
    </div>
  );
};

export default Activation;