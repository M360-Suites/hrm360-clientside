import SideImage from "../../assets/staff/side_img.png";
import BottomSvg from "../../assets/staff/bottom.svg";
import { logo } from "../../assets/index";

export default function HalfSide() {
  return (
    <div className="w-1/2 h-screen max-lg:hidden flex flex-col items-center justify-start py-20 px-8 relative">
      <div className="w-full flex flex-col items-center gap-9">
        <div className="flex self-end">
          <img src={logo} alt="Side" className="object-cover w-31.75 h-8.25" />
        </div>
        <div className="w-full flex justify-center items-center">
          <img
            src={SideImage}
            alt="Side"
            className="object-cover w-125 h-125"
          />
        </div>
      </div>
      <div>
        <img
          src={BottomSvg}
          alt="Bottom"
          className="absolute bottom-0 right-0 w-50 h-50"
        />
      </div>
    </div>
  );
}
