import React from "react";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { AuthProvider } from "@/components/AuthProvider";
import { AuthGate } from "@/components/AuthGate";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthGate>
        <SidebarProvider>
          <div className="flex min-h-screen bg-[#f8f9fa] font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-0 min-w-0">
              <Navbar />
              <main className="flex-1 overflow-x-hidden p-4 sm:p-6 md:p-8">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </AuthGate>
    </AuthProvider>
  );
}
