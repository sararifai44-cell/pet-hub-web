import React from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  MessageCircle,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[#E7DCD0] bg-[#F8F3ED]">
      <div className="mx-auto max-w-7xl px-6 py-6"> {/* تم تعديل الـ py ليعطي مساحة تنفس بسيطة */}
        
        <div className="grid gap-8 md:grid-cols-3 items-start">
          
          {/* 1. اللوجو على اليسار */}
          <div className="flex justify-start">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <img
                src="/pethub-logo (2).png"
                alt="Pet Hub Logo"
                className="h-20 w-20 object-contain group-hover:scale-110 transition-transform duration-300"
              />
              <div className="leading-tight text-[#2F2A24]">
                <div className="text-xl font-black tracking-tight">
                  Pet Hub
                </div>
                <div className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#3C7A57]">
                  Damascus
                </div>
              </div>
            </Link>
          </div>

          {/* 2. الجملة في المنتصف (تم إنزالها قليلاً عبر mt-10) */}
          <div className="flex items-center justify-center text-center md:mt-10">
            <p className="text-sm text-[#2F2A24]/70 leading-relaxed max-w-[280px]">
              Your pet's favorite digital home. We simplify adoption, 
              provide premium boarding, and offer the best supplies.
            </p>
          </div>

          {/* 3. التواصل على اليمين (تم رفعها قليلاً عبر تقليل المسافات) */}
          <div className="md:justify-self-end text-right">
            <ul className="flex flex-col gap-2 mb-4"> {/* تقليل الـ gap والـ margin */}
              <li className="flex items-center justify-end gap-3 text-sm text-[#2F2A24]/80">
                <span className="font-medium">Damascus, Syria</span>
                <MapPin size={16} className="text-[#3C7A57]" />
              </li>
              <li className="flex items-center justify-end gap-3 text-sm text-[#2F2A24]/80">
                <span className="font-medium">+963 11 123 4567</span>
                <Phone size={16} className="text-[#3C7A57]" />
              </li>
              <li className="flex items-center justify-end gap-3 text-sm text-[#2F2A24]/80">
                <span className="font-medium">support@pethub.com</span>
                <Mail size={16} className="text-[#3C7A57]" />
              </li>
            </ul>

            {/* أيقونات السوشيال ميديا */}
            <div className="flex items-center justify-end gap-3">
              <a href="#" className="h-8 w-8 rounded-lg bg-white/50 border border-[#E7DCD0] flex items-center justify-center text-[#2F2A24]/60 hover:bg-[#3C7A57] hover:text-white transition-all shadow-sm">
                <Facebook size={15} />
              </a>
              <a href="#" className="h-8 w-8 rounded-lg bg-white/50 border border-[#E7DCD0] flex items-center justify-center text-[#2F2A24]/60 hover:bg-[#3C7A57] hover:text-white transition-all shadow-sm">
                <Instagram size={15} />
              </a>
              <a href="#" className="h-8 w-8 rounded-lg bg-white/50 border border-[#E7DCD0] flex items-center justify-center text-[#2F2A24]/60 hover:bg-[#3C7A57] hover:text-white transition-all shadow-sm">
                <MessageCircle size={15} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}