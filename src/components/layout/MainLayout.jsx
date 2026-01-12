import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import { Toaster } from "@/components/ui/sonner";


export default function MainLayout() {
  return (
    <div className="min-h-dvh">
      <Navbar />
      <div className="pt-16">
        <Toaster />
        <Outlet />
      </div>
    </div>
  );
}
