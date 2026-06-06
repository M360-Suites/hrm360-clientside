import HalfSide from "@/components/employee/halfside";
import BottomSvg from "../../assets/staff/bottom.svg";
import Vector from "@/assets/staff/auth.png";
import { useLocation } from "react-router";
import { logo } from "../../assets/index";
import { Outlet } from "react-router";

export const StaffOnboardingLayout = () => {
  const location = useLocation();
  const isFinalVerification = location.pathname === "/employee/verified";
  return (
    <div className="flex flex-row items-center min-h-screen w-full bg-white">
      <div
        className={`flex-1 h-screen flex flex-col px-8 w-full max-md:px-5 bg-[#F2F2F24D] relative ${isFinalVerification ? "pt-0 max-md:pt-6 items-center max-md:justify-start justify-center" : "pt-38 max-md:pt-6 items-start justify-start"}`}
      >
        <div className="absolute top-0 left-0 max-md:hidden">
          <img src={Vector} alt="Vector" className="object-cover" />
        </div>
        <div className="lg:hidden w-full">
          <img src={logo} alt="Side" className="object-cover w-31.75 h-8.25" />
        </div>
        <div className="w-full">
          <Outlet />
        </div>
        {isFinalVerification && (
          <div className="max-md:hidden">
            <img
              src={BottomSvg}
              alt="Bottom"
              className="absolute bottom-0 right-0 w-50 h-50"
            />
          </div>
        )}
      </div>
      {!isFinalVerification && <HalfSide />}
    </div>
  );
};
