import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { getToken } from "@/app/apiSlice";
import { useLogoutMutation } from "@/features/auth/authApiSlice";
import NotificationsDropdown from "@/features/notifications/components/NotificationsDropdown";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/pets", label: "Adopt" },
  { to: "/shop", label: "Shop" },
  { to: "/boarding", label: "Boarding" },
  // بتضل بالمنيو الرئيسية
  { to: "/medical-care", label: "Medical Care" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState(() => !!getToken());

  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsAuthed(!!getToken());
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      setIsAuthed(false);
      toast.success("Logged out successfully");
      navigate("/");
    } catch (err) {
      setIsAuthed(false);
      navigate("/login");
    }
  };

  const headerClass = `fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-all duration-300 ${
    scrolled
      ? "bg-white/80 border-[#E7DCD0] shadow-sm"
      : "bg-[#F8F3ED]/40 border-transparent"
  }`;

  const iconWrapperBase =
    "relative flex items-center justify-center h-12 w-12 rounded-full transition-all duration-300 border-none shadow-none bg-transparent hover:bg-transparent focus:ring-0 focus-visible:ring-0 group";

  // ✅ dropdown paths (بدون medical-care)
  const isMyMenu = [
    "/cart",
    "/orders",
    "/adoption-requests",
    "/my-boarding-reservations",
    "/my-appointments",
  ].some((path) => location.pathname.startsWith(path));

  return (
    <header className={headerClass}>
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* 1. Logo Section */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="transition-transform duration-500 group-hover:rotate-6">
              <img
                src="/pethub-logo (2).png"
                alt="Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
            <span className="text-lg font-black text-[#2F2A24] tracking-tighter">
              Pet Hub
            </span>
          </Link>

          {/* 2. Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((it) => (
              <NavLink key={it.to} to={it.to} end={it.to === "/"}>
                {({ isActive }) => (
                  <span
                    className={`relative rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 uppercase tracking-tight ${
                      isActive
                        ? "text-[#3C7A57]"
                        : "text-[#2F2A24]/60 hover:text-[#3C7A57]"
                    }`}
                  >
                    {it.label}
                    {isActive && (
                      <span className="absolute inset-x-4 -bottom-[2px] h-[2.5px] rounded-full bg-[#3C7A57]" />
                    )}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* 3. Action Icons */}
          <div className="flex items-center gap-0.5">
            {isAuthed ? (
              <>
                <div className="hover:scale-110 transition-transform duration-300">
                  <NotificationsDropdown
                    customClass={`${iconWrapperBase} text-amber-500/80 hover:text-amber-500`}
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="hover:scale-110 transition-transform duration-300 cursor-pointer">
                      <Button variant="ghost" className={`${iconWrapperBase} p-0`}>
                        <AccountCircleIcon
                          className={`!w-[30px] !h-[30px] transition-colors duration-300 ${
                            isMyMenu
                              ? "text-[#3C7A57]"
                              : "text-[#3C7A57]/70 group-hover:text-[#3C7A57]"
                          }`}
                        />
                      </Button>
                    </div>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="w-56 p-1.5 rounded-2xl border-[#E7DCD0] shadow-2xl bg-white/98 animate-in fade-in zoom-in-95 duration-200"
                  >
                    <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold uppercase text-stone-400 tracking-widest">
                      Personal Space
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-stone-100" />

                    <DropdownMenuItem
                      asChild
                      className="rounded-xl cursor-pointer py-2.5 focus:bg-red-50 focus:text-red-600 transition-colors"
                    >
                      <Link
                        to="/cart"
                        className="w-full px-2 font-medium text-sm text-stone-600"
                      >
                        My Cart
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      asChild
                      className="rounded-xl cursor-pointer py-2.5 focus:bg-emerald-50 focus:text-emerald-700 transition-colors"
                    >
                      <Link
                        to="/orders"
                        className="w-full px-2 font-medium text-sm text-stone-600"
                      >
                        My Orders
                      </Link>
                    </DropdownMenuItem>

                    {/* ✅ بدل Medical Care صار My Appointments */}
                    <DropdownMenuItem
                      asChild
                      className="rounded-xl cursor-pointer py-2.5 focus:bg-indigo-50 focus:text-indigo-700 transition-colors"
                    >
                      <Link
                        to="/my-appointments"
                        className="w-full px-2 font-medium text-sm text-stone-600"
                      >
                        My Appointments
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      asChild
                      className="rounded-xl cursor-pointer py-2.5 focus:bg-rose-50 focus:text-rose-700 transition-colors"
                    >
                      <Link
                        to="/adoption-requests"
                        className="w-full px-2 font-medium text-sm text-stone-600"
                      >
                        My Adoptions
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      asChild
                      className="rounded-xl cursor-pointer py-2.5 focus:bg-amber-50 focus:text-amber-700 transition-colors"
                    >
                      <Link
                        to="/my-boarding-reservations"
                        className="w-full px-2 font-medium text-sm text-stone-600"
                      >
                        My Boarding
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-stone-100" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="rounded-xl cursor-pointer py-2.5 text-red-500 focus:bg-red-50 focus:text-red-600 font-medium text-sm"
                    >
                      <span className="px-2">
                        {isLoggingOut ? "Processing..." : "Sign Out"}
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex gap-2">
                <Button
                  asChild
                  variant="ghost"
                  className="text-[13px] font-medium text-stone-600 rounded-xl px-4"
                >
                  <Link to="/login">Login</Link>
                </Button>
                <Button
                  asChild
                  className="bg-[#3C7A57] hover:bg-[#2d5d42] text-white text-[13px] font-bold rounded-xl px-6 transition-all active:scale-95 shadow-lg shadow-[#3C7A57]/20"
                >
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            )}

            {/* Mobile Toggle */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 w-10 p-0 md:hidden flex items-center justify-center hover:bg-stone-100/50 rounded-xl"
                >
                  <Menu className="h-6 w-6 text-[#2F2A24]" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="bg-[#FDFCFB] border-l-[#E7DCD0] w-72">
                <div className="flex items-center gap-2 mt-4 mb-10">
                  <img src="/pethub-logo (2).png" alt="Logo" className="h-9 w-auto" />
                  <span className="font-black text-xl tracking-tighter">Pet Hub</span>
                </div>

                <nav className="flex flex-col gap-2">
                  {navItems.map((it) => (
                    <NavLink
                      key={it.to}
                      to={it.to}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                          isActive
                            ? "bg-[#3C7A57] text-white shadow-md shadow-[#3C7A57]/20"
                            : "text-stone-600 hover:bg-stone-100"
                        }`
                      }
                    >
                      {it.label}
                    </NavLink>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
