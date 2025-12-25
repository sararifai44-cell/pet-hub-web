// src/components/common/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, ShoppingBag, ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/pets", label: "Adopt" },
  { to: "/shop", label: "Shop" },
  { to: "/orders", label: "Orders" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerClass = [
    "fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-colors",
    scrolled
      ? "bg-[#F8F3ED]/95 border-[#E7DCD0]"
      : "bg-[#F8F3ED]/90 border-[#E7DCD0]",
  ].join(" ");

  const linkBase =
    "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors";
  const linkInactive =
    "text-[#2F2A24]/70 hover:text-[#2F2A24] hover:bg-[#2F2A24]/[0.03]";
  const linkActive = "text-[#2F2A24] bg-[#2F2A24]/[0.04]";
  const underlineClass = "bg-[#3C7A57]";

  const noGlow =
    "shadow-none hover:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0";

  // ✅ Auth buttons (rounded أقل + هوفر أحلى)
  const loginBtnClass = [
    "h-10 rounded-lg font-semibold transition-all",
    "border-[#E7DCD0] bg-white text-[#2F2A24]",
    "hover:bg-[#FBF7F1] hover:border-[#D8CBBE] hover:-translate-y-[1px] hover:shadow-sm",
    "active:translate-y-0",
    noGlow,
  ].join(" ");

  const registerBtnClass = [
    "h-10 rounded-lg font-semibold transition-all",
    "bg-[#3C7A57] text-white",
    "hover:bg-[#2F5F43] hover:-translate-y-[1px] hover:shadow-sm",
    "active:translate-y-0",
    noGlow,
  ].join(" ");

  // ✅ Icon buttons (rounded أقل + Active state)
  const iconBtnBase = [
    "h-10 w-10 rounded-lg px-0 transition-all",
    "border border-[#E7DCD0] bg-white/75 text-[#2F2A24]",
    "hover:bg-[#FBF7F1] hover:border-[#D8CBBE] hover:-translate-y-[1px] hover:shadow-sm",
    "active:translate-y-0",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C7A57]/25",
    noGlow,
  ].join(" ");

  const iconBtnActive =
    "bg-[#3C7A57]/10 border-[#3C7A57]/30 text-[#2F2A24]";

  const isCart = location.pathname.startsWith("/cart");
  const isOrders = location.pathname.startsWith("/orders");

  return (
    <header className={headerClass}>
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* ✅ Brand (NO CHANGE) */}
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-2xl">
              <img
                src="/pethub-logo (2).png"
                alt="Pet Hub Logo"
                className="h-8 w-8 object-contain"
                draggable="false"
              />
            </span>

            <div className="leading-tight">
              <div className="text-lg font-bold text-[#2F2A24]">Pet Hub</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((it) => (
              <NavLink key={it.to} to={it.to} end={it.to === "/"}>
                {({ isActive }) => (
                  <span
                    className={[
                      linkBase,
                      isActive ? linkActive : linkInactive,
                    ].join(" ")}
                  >
                    {it.label}
                    {isActive ? (
                      <span
                        className={[
                          "absolute inset-x-3 -bottom-[7px] h-[2px] rounded-[2px]",
                          underlineClass,
                        ].join(" ")}
                      />
                    ) : null}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 md:flex">
            {/* ✅ Orders icon (new icon) */}
            <Button
              asChild
              variant="outline"
              className={[iconBtnBase, isOrders ? iconBtnActive : ""].join(" ")}
            >
              <Link to="/orders" aria-label="Orders" title="Orders">
                <ClipboardList className="h-[18px] w-[18px]" />
              </Link>
            </Button>

            {/* ✅ Cart icon (new icon) */}
            <Button
              asChild
              variant="outline"
              className={[iconBtnBase, isCart ? iconBtnActive : ""].join(" ")}
            >
              <Link to="/cart" aria-label="Cart" title="Cart">
                <ShoppingBag className="h-[18px] w-[18px]" />
              </Link>
            </Button>

            <Button asChild variant="outline" className={loginBtnClass}>
              <Link to="/login">Login</Link>
            </Button>

            <Button asChild className={registerBtnClass}>
              <Link to="/register">Register</Link>
            </Button>
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-2 md:hidden">
            {/* ✅ Orders mobile */}
            <Button
              asChild
              variant="outline"
              className={[iconBtnBase, isOrders ? iconBtnActive : ""].join(" ")}
            >
              <Link to="/orders" aria-label="Orders" title="Orders">
                <ClipboardList className="h-[18px] w-[18px]" />
              </Link>
            </Button>

            {/* ✅ Cart mobile */}
            <Button
              asChild
              variant="outline"
              className={[iconBtnBase, isCart ? iconBtnActive : ""].join(" ")}
            >
              <Link to="/cart" aria-label="Cart" title="Cart">
                <ShoppingBag className="h-[18px] w-[18px]" />
              </Link>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className={[
                    "h-10 w-10 rounded-lg px-0 transition-all",
                    "border border-[#E7DCD0] bg-white/75 text-[#2F2A24]",
                    "hover:bg-[#FBF7F1] hover:border-[#D8CBBE] hover:-translate-y-[1px] hover:shadow-sm",
                    "active:translate-y-0",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C7A57]/25",
                    noGlow,
                  ].join(" ")}
                >
                  <Menu className="h-[18px] w-[18px]" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-[320px] bg-[#FBF7F1]">
                <div className="flex items-center gap-2">
                  {/* ✅ logo inside sheet: نفس لوغو بس بدون تغيير الاسم */}
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#3C7A57] ring-1 ring-[#3C7A57]/35">
                    <img
                      src="/pethub-logo (2).png"
                      alt="Pet Hub Logo"
                      className="h-8 w-8 object-contain"
                      draggable="false"
                    />
                  </span>
                  <div>
                    <div className="font-semibold text-[#2F2A24]">Pet Hub</div>
                  </div>
                </div>

                <Separator className="my-4 bg-[#E7DCD0]" />

                <nav className="grid gap-1">
                  {navItems.map((it) => (
                    <NavLink
                      key={it.to}
                      to={it.to}
                      end={it.to === "/"}
                      className={({ isActive }) =>
                        [
                          "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-[#2F2A24]/[0.04] text-[#2F2A24]"
                            : "text-[#2F2A24]/70 hover:bg-[#2F2A24]/[0.03] hover:text-[#2F2A24]",
                        ].join(" ")
                      }
                    >
                      {it.label}
                    </NavLink>
                  ))}

                  <Separator className="my-3 bg-[#E7DCD0]" />

                  {/* ✅ Cart */}
                  <NavLink
                    to="/cart"
                    className={({ isActive }) =>
                      [
                        "rounded-lg px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2",
                        isActive
                          ? "bg-[#3C7A57]/10 border border-[#3C7A57]/25 text-[#2F2A24]"
                          : "text-[#2F2A24]/70 hover:bg-[#2F2A24]/[0.03] hover:text-[#2F2A24]",
                      ].join(" ")
                    }
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Cart
                  </NavLink>

                  {/* ✅ Orders */}
                  <NavLink
                    to="/orders"
                    className={({ isActive }) =>
                      [
                        "rounded-lg px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2",
                        isActive
                          ? "bg-[#3C7A57]/10 border border-[#3C7A57]/25 text-[#2F2A24]"
                          : "text-[#2F2A24]/70 hover:bg-[#2F2A24]/[0.03] hover:text-[#2F2A24]",
                      ].join(" ")
                    }
                  >
                    <ClipboardList className="h-4 w-4" />
                    Orders
                  </NavLink>
                </nav>

                <Separator className="my-4 bg-[#E7DCD0]" />

                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" className={loginBtnClass}>
                    <Link to="/login">Login</Link>
                  </Button>

                  <Button asChild className={registerBtnClass}>
                    <Link to="/register">Register</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
