import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { removeCookie } from "@/utils/cookies";
export const Verifying = () => {
  const loading = true;
  const pathRef = useRef<SVGPathElement>(null);
  const navigate = useNavigate();
  const [message, setMessage] = useState(
    "We are getting your dashboard ready...",
  );

  useEffect(() => {
    const msgTimer = setTimeout(() => {
      setMessage("Dashboard ready.");
    }, 3000);

    const navTimer = setTimeout(() => {
      // clear auth/session cookies before redirecting to login
      removeCookie("token");
      removeCookie("code");
      removeCookie("refreshToken");
      removeCookie("user");
      removeCookie("orgId");
      removeCookie("resetToken");
      removeCookie("isOnboarded");
      navigate("/login");
    }, 5000);

    return () => {
      clearTimeout(msgTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);
  return (
    <div className={`flex flex-col w-full justify-center items-center`}>
      <div className="flex flex-col gap-15 items-center justify-center max-md:bg-transparent bg-[#F2F2F24D] rounded-[20px] max-md:w-full max-md:h-[80vh] w-130 h-150 shadow-[10px_10px_4px_5px_#4C0BFD29] max-md:shadow-none">
        <div>
          <svg
            viewBox="0 0 366 367"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="lg:w-[366px] h-auto md:w-[300px] w-[250px]"
          >
            <rect
              width="366"
              height="366"
              rx="183"
              fill="#3702C8"
              fillOpacity="0.1"
            />
            <path
              ref={pathRef}
              d="M366 183.323C366 284.391 284.068 366.323 183 366.323C81.9319 366.323 0 284.391 0 183.323C0 82.2548 183 282.523 244.239 268.556C345.307 268.556 366 82.2548 366 183.323Z"
              fill="#3702C8"
              fillOpacity="0.1"
              style={{
                transformOrigin: "center",
                animation: loading
                  ? "waterFlow 3s ease-in-out infinite"
                  : "none",
              }}
            />
          </svg>
        </div>
        <p className="text-xl/[100%] text-center max-md:text-base/[100%] font-normal transform-opacity-50">
          {message}
        </p>
      </div>
    </div>
  );
};
