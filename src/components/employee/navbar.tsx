import { MagnifyingGlassIcon, BellIcon } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";

export default function Navbar({ className }: { className?: string }) {
  return (
    <nav
      className={`flex justify-between items-center h-16 bg-white shadow-2xs w-full px-8 ${className}`}
    >
      <div className="flex items-center gap-2">
        Welcome,{" "}
        {/* <span className="h-6 w-6 bg-white border-[0.75px] border-foundation-gray-1 drop-shadow-xs rounded-full"></span>{" "} */}
        <span className="font-medium">companyName</span>
      </div>
      <div className="flex items-center gap-6 py-3">
        <div className="border border-foundation-gray-1 bg-[#F7F7F7] w-90 px-3.5 rounded-full flex items-center gap-3 shadow-2xs">
          <MagnifyingGlassIcon size={20} className="text-foundation-gray-6 " />
          <Input
            type="text"
            placeholder="Search for trips, drivers, etc."
            className="border-none shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="flex items-center gap-4">
          <BellIcon size={20} />
          <div className="flex items-center gap-1">
            <div className="h-8 w-8 bg-white border-[0.75px] border-foundation-gray-1 rounded-full overflow-hidden">
              <img
                src={"/images/default-profile.png"}
                alt="Profile Picture"
                width={32}
                height={32}
                className="rounded-full object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
