import { logo } from "@/assets/index";
import {
  HouseIcon,
  UsersThreeIcon,
  ClockIcon,
  CalendarDotsIcon,
  MoneyWavyIcon,
  GraduationCapIcon,
  ChartPieSliceIcon,
  CoinsIcon,
  SpeakerLowIcon,
  FileTextIcon,
  GearSixIcon,
} from "@phosphor-icons/react";
// import { IoMdHelpCircleOutline } from "react-icons/io";
import { useState } from "react";
// import LogoutModal from "../modals/logoutModal";
// import SupportModal from "../modals/supportModal";
import { Link } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
const items = [
  {
    title: "Dashboard",
    tag: "Dashboard",
    url: "/dashboard",
    icon: HouseIcon,
  },
  {
    title: "Teams",
    tag: "Teams",
    url: "/",
    icon: UsersThreeIcon,
  },
  {
    title: "Attendance",
    tag: "Attendance",
    url: "/",
    icon: ClockIcon,
  },
  {
    title: "Leave",
    tag: "Leave",
    url: "/",
    icon: CalendarDotsIcon,
  },
  {
    title: "Payroll",
    tag: "Payroll",
    url: "/",
    icon: MoneyWavyIcon,
  },
  {
    title: "Performance Tracker",
    tag: "Performance Tracker",
    url: "/",
    icon: GraduationCapIcon,
  },
  {
    title: "Task Management",
    tag: "Task Management",
    url: "/",
    icon: ChartPieSliceIcon,
  },
  {
    title: "Loan",
    tag: "Loan",
    url: "/",
    icon: CoinsIcon,
  },
  {
    title: "Announcements",
    tag: "Announcements",
    url: "/",
    icon: SpeakerLowIcon,
  },
  {
    title: "Documents",
    tag: "Documents",
    url: "/",
    icon: FileTextIcon,
  },
  {
    title: "Setting",
    tag: "Setting",
    url: "/",
    icon: GearSixIcon,
  },
];

export function AppSidebar() {
  // const currentRoute = pathname.pathname;
  // const [logoutModal, setLogoutModal] = useState(false);
  // const [supportModal, setSupportModal] = useState(false);
  // const getActiveItem = () => {
  //   const exactMatch = items.find((item) => item.url === pathname);
  //   if (exactMatch) return exactMatch.title;

  //   const routeMatch = items.find((item) => {
  //     const itemRoute = item.url.split("/")[1];
  //     return itemRoute === currentRoute;
  //   });
  //   return routeMatch ? routeMatch.title : "Dashboard";
  // };

  const [activeItem, setActiveItem] = useState("");

  return (
    <Sidebar className="">
      {/*{logoutModal && <LogoutModal setLogoutModal={setLogoutModal} />}*/}
      {/*{supportModal && <SupportModal setSupportModal={setSupportModal} />}*/}
      <SidebarHeader className="flex items-center justify-between pt-8">
        <div className="w-18.5 h-[38.8px]">
          {/*<DashLogo className="w-full h-full" />*/}
          <img src={logo} alt="hrm logo" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col items-start w-full">
              {items.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className="px-4 w-full flex flex-col gap-3 py-2"
                >
                  <SidebarMenuButton className=" text-foundation-gray-6 hover:bg-transparent">
                    <Link
                      to={item.url}
                      className={`flex items-center gap-2 w-full font-medium hover:bg-foundation-gray-1 px-3 py-2 rounded-[6px] ${
                        activeItem === item.title &&
                        "bg-foundation-gray-1 text-foundation-gray-10"
                      }`}
                      onClick={() => setActiveItem(item.title)}
                    >
                      <item.icon size={20} />
                      <span className="text-base font-medium">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="h-52">
        <SidebarMenu className="h-full w-full">
          <SidebarMenuItem className="w-full h-full pt-6 flex flex-col gap-3 px-4">
            {/*{footerItems.map((item) => (
              <button
                key={item.title}
                className="flex items-center gap-2 w-full font-medium px-0 bg-transparent text-foundation-gray-10 cursor-pointer"
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  }
                }}
              >
                <item.icon size={item.title === "Support" ? 16.67 : 20} />
                <span className="text-base font-medium">{item.title}</span>
              </button>
            ))}*/}
          </SidebarMenuItem>
          <SidebarMenuItem className="border-t border-t-gray-200 w-full h-full hover:bg-transparent px-3">
            <SidebarMenuButton className="pt-6 flex flex-row gap-4 w-full h-full hover:bg-transparent">
              <div className="flex items-center justify-center h-10 w-10 bg-white border-[0.75px] border-foundation-gray-1 rounded-full overflow-hidden shrink-0">
                <img
                  src={"/images/default-profile.png"}
                  alt="Profile Picture"
                  width={32}
                  height={32}
                  className="rounded-full object-contain w-full h-full min-w-0 min-h-0"
                  style={{ aspectRatio: "1 / 1", objectFit: "cover" }}
                />
              </div>
              <div className="flex flex-col gap-0.5 w-full">
                <span className="text-sm text-foundation-gray-8">
                  ownerName
                </span>
                <span className="text-xs text-foundation-gray-6">email</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
