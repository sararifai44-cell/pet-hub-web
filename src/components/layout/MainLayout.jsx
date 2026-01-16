import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Toaster } from "@/components/ui/sonner";

export default function MainLayout() {
  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />

      <div className="pt-16 flex-1">
        <Toaster />
        <Outlet />
      </div>

      <Footer />
    </div>
  );
}
