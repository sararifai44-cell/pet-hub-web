import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom"; // أضفنا useNavigate
import { Menu, ShoppingBag, ClipboardList, User, HeartHandshake, Calendar, LogOut } from "lucide-react"; // أضفنا LogOut icon
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
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

const navItems = [
  { to: "/", label: "Home" },
  { to: "/pets", label: "Adopt" },
  { to: "/shop", label: "Shop" },
  { to: "/boarding", label: "Boarding" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState(() => !!getToken());
  
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation(); // هوك تسجيل الخروج

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
      toast.success("Logged out", { description: "You have been signed out successfully." });
      navigate("/");
    } catch (err) {
      setIsAuthed(false);
      navigate("/login");
    }
  };

  const headerClass = [
    "fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-colors",
    scrolled ? "bg-[#F8F3ED]/95 border-[#E7DCD0]" : "bg-[#F8F3ED]/90 border-[#E7DCD0]",
  ].join(" ");

  const linkBase = "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors";
  const linkInactive = "text-[#2F2A24]/70 hover:text-[#2F2A24] hover:bg-[#2F2A24]/[0.03]";
  const linkActive = "text-[#2F2A24] bg-[#2F2A24]/[0.04]";
  const underlineClass = "bg-[#3C7A57]";
  const noGlow = "shadow-none hover:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0";

  const loginBtnClass = "h-10 rounded-lg font-semibold transition-all border-[#E7DCD0] bg-white text-[#2F2A24] hover:bg-[#FBF7F1] " + noGlow;
  const registerBtnClass = "h-10 rounded-lg font-semibold transition-all bg-[#3C7A57] text-white hover:bg-[#2F5F43] " + noGlow;
  const iconBtnBase = "h-10 w-10 rounded-lg px-0 transition-all border border-[#E7DCD0] bg-white/75 text-[#2F2A24] " + noGlow;
  const iconBtnActive = "bg-[#3C7A57]/10 border-[#3C7A57]/30 text-[#2F2A24]";

  const isMyMenu = location.pathname.startsWith("/cart") || location.pathname.startsWith("/orders");

  return (
    <header className={headerClass}>
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex h-16 items-center justify-between gap-3">
          
          <Link to="/" className="flex items-center gap-2">
            <img src="/pethub-logo (2).png" alt="Pet Hub Logo" className="h-8 w-8" />
            <span className="text-lg font-bold text-[#2F2A24]">Pet Hub</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((it) => (
              <NavLink key={it.to} to={it.to} end={it.to === "/"}>
                {({ isActive }) => (
                  <span className={[linkBase, isActive ? linkActive : linkInactive].join(" ")}>
                    {it.label}
                    {isActive && <span className={["absolute inset-x-3 -bottom-[7px] h-[2px] rounded-[2px]", underlineClass].join(" ")} />}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {isAuthed ? (
              <>
                <Button asChild variant="outline" className={[iconBtnBase, location.pathname === "/cart" ? iconBtnActive : ""].join(" ")}>
                  <Link to="/cart"><ShoppingBag className="h-[18px] w-[18px]" /></Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className={[iconBtnBase, isMyMenu ? iconBtnActive : ""].join(" ")}>
                      <User className="h-[18px] w-[18px]" />
                    </Button>
                  </DropdownMenuTrigger>
<DropdownMenuContent
  align="end"
  className="w-48 p-2 rounded-xl bg-white text-[#2F2A24] border border-[#E7DCD0] shadow-xl opacity-100"
>                    <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase">My Stuff</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to="/orders" className="flex items-center gap-2 py-2 text-sm"><ClipboardList className="h-4 w-4" /> Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to="/adoption-requests" className="flex items-center gap-2 py-2 text-sm"><HeartHandshake className="h-4 w-4" /> Adoptions</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout} 
                      disabled={isLoggingOut}
                      className="rounded-lg cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 font-medium"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex gap-2">
                <Button asChild variant="outline" className={loginBtnClass}><Link to="/login">Login</Link></Button>
                <Button asChild className={registerBtnClass}><Link to="/register">Register</Link></Button>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center gap-2 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className={iconBtnBase}><Menu className="h-[18px] w-[18px]" /></Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#FBF7F1]">
                <div className="flex items-center gap-2 mt-4">
                   <img src="/pethub-logo (2).png" alt="Logo" className="h-8 w-8" />
                   <span className="font-bold">Pet Hub</span>
                </div>
                <Separator className="my-4" />
                <nav className="grid gap-1">
                  {navItems.map((it) => (
                    <NavLink key={it.to} to={it.to} className={({ isActive }) => [linkBase, isActive ? linkActive : linkInactive].join(" ")}>
                      {it.label}
                    </NavLink>
                  ))}
                  {isAuthed && (
                    <>
                      <div className="text-[10px] font-bold text-slate-400 px-3 mt-4 mb-1 uppercase">Account</div>
                      <NavLink to="/cart" className={linkInactive + " flex items-center gap-2"}><ShoppingBag className="h-4 w-4" /> Cart</NavLink>
                      <NavLink to="/orders" className={linkInactive + " flex items-center gap-2"}><ClipboardList className="h-4 w-4" /> Orders</NavLink>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 w-full text-left"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </>
                  )}
                </nav>
                {!isAuthed && (
                  <div className="grid grid-cols-2 gap-2 mt-6">
                    <Button asChild variant="outline" className={loginBtnClass}><Link to="/login">Login</Link></Button>
                    <Button asChild className={registerBtnClass}><Link to="/register">Register</Link></Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}