"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/employee/app_sidebar";
import Navbar from "@/components/employee/navbar";
import { Outlet } from "react-router";

export default function StaffDashLayout() {
  return (
    <SidebarProvider className="flex h-full w-full">
      <AppSidebar />
      <main className="flex flex-col min-h-screen w-full">
        <Navbar className="sticky top-0 left-0 right-0 z-5 bg-white border-b w-full" />
        <section className="flex pt-0 pb-8 flex-1">
          <Outlet />
        </section>
      </main>
    </SidebarProvider>
  );
}

