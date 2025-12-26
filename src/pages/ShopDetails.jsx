// src/pages/ShopDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/common/Navbar";

import { ChevronLeft, ChevronRight, ArrowLeft, X, ShoppingCart, ShieldCheck, Truck, Home, Maximize2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { useAddItemToCartMutation } from "@/features/cart/cartApiSlice";
import { useGetProductByIdQuery } from "@/features/Products/productsApiSlice";

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

function useIsArabic() {
  const [isAr, setIsAr] = useState(false);
  useEffect(() => {
    const lang = (navigator.language || "").toLowerCase();
    setIsAr(lang.startsWith("ar"));
  }, []);
  return isAr;
}

function ProductGallery({ images = [], alt = "", isAr }) {
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const total = images.length;

  useEffect(() => setIdx(0), [total]);

  const current = images[idx];
  const go = (dir) => { if (total) setIdx((p) => (p + dir + total) % total); };

  if (!total) return <div className="aspect-square rounded-2xl bg-slate-100 animate-pulse" />;

  return (
    <>
      <div className="space-y-4">
        <div className="relative aspect-square w-full rounded-2xl border border-[#E7DCD0]/60 bg-white overflow-hidden group shadow-sm">
          <img src={current} alt={alt} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          
          <button 
            onClick={() => setOpen(true)}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm border border-[#E7DCD0]/50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Maximize2 className="h-4 w-4 text-[#2F2A24]" />
          </button>

          {total > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); go(-1); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); go(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {total > 1 && (
          <div className="flex gap-2.5 overflow-x-auto justify-center py-1 no-scrollbar">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-12 w-12 shrink-0 rounded-lg border-2 transition-all overflow-hidden ${
                  i === idx ? "border-[#3C7A57] scale-105 shadow-sm" : "border-transparent opacity-40 hover:opacity-100"
                }`}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setOpen(false)}>
           <button className="absolute top-6 right-6 text-white">
             <X className="h-8 w-8" />
           </button>
           <img src={current} alt={alt} className="max-h-full max-w-full rounded-xl shadow-2xl" />
        </div>
      )}
    </>
  );
}

export default function ShopDetails() {
  const isAr = useIsArabic();
  const { id } = useParams();
  const dir = isAr ? "rtl" : "ltr";
  const align = isAr ? "text-right" : "text-left";

  const { data: product, isLoading } = useGetProductByIdQuery(id, { skip: !id });
  const [addItemToCart, { isLoading: adding }] = useAddItemToCartMutation();

  const name = useMemo(() => product ? (isAr ? product.name_ar : product.name_en) || product.name_en : "", [product, isAr]);
  const desc = useMemo(() => product?.description || "", [product]);
  const images = useMemo(() => {
    const imgs = Array.isArray(product?.images) ? product.images : [];
    return imgs.length ? imgs : (product?.cover_image ? [product.cover_image] : []);
  }, [product]);
  const inStock = useMemo(() => Number(product?.stock_quantity ?? 0) > 0, [product]);

  const handleAdd = async () => {
    if (!inStock) return;
    try {
      await addItemToCart({ product_id: product.id, quantity: 1 }).unwrap();
      toast.success(isAr ? "تمت الإضافة للسلة" : "Added to cart");
    } catch {
      toast.error(isAr ? "حدث خطأ ما" : "Failed to add");
    }
  };

  if (isLoading) return <div className="pt-40 text-center opacity-30 text-xs tracking-widest uppercase italic">{isAr ? "جاري التحميل..." : "PetHub Loading..."}</div>;

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2F2A24]" dir={dir}>
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 pt-24 pb-20">
        
        {/* Modern Compact Header */}
        <nav className="mb-10 flex items-center justify-between border-b border-[#E7DCD0]/40 pb-5">
           <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5">
                <Link to="/shop" className="flex items-center gap-1 text-[10px] font-bold text-[#3C7A57] uppercase tracking-wider hover:opacity-70">
                  <ArrowLeft className={`h-3 w-3 ${isAr ? "rotate-180" : ""}`} />
                  {isAr ? "المتجر" : "Shop"}
                </Link>
                <span className="text-slate-200 text-xs">/</span>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Home className="h-2.5 w-2.5" />
                  <span className="truncate max-w-[100px]">{isAr ? "تفاصيل" : "Details"}</span>
                </div>
              </div>
              <h1 className="text-xs font-black text-[#2F2A24] uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-[#3C7A57]" />
                {name}
              </h1>
           </div>

           <div className="hidden sm:flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">{isAr ? "توصيل آمن" : "Secure Delivery"}</span>
                <span className="text-[10px] font-bold text-[#3C7A57]">{isAr ? "لكل المناطق" : "Worldwide"}</span>
              </div>
              <div className="p-1.5 rounded-full bg-[#F7F3F0]">
                <Truck className="h-3.5 w-3.5 text-[#2F2A24]" />
              </div>
           </div>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[380px_1fr] items-start">
          
          <section className="w-full">
             <ProductGallery images={images} alt={name} isAr={isAr} />
          </section>

          <section className={`flex flex-col max-w-[480px] pt-1 ${align}`}>
            <div className="space-y-3">
              {product?.category && (
                <span className="text-[9px] text-[#3C7A57] font-black uppercase tracking-[0.3em] block">
                  {isAr ? product.category.name_ar : product.category.name_en}
                </span>
              )}
              <h2 className="text-3xl font-extrabold tracking-tight text-[#2F2A24] leading-tight">
                {name}
              </h2>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl font-black text-[#3C7A57] tracking-tight">{money(product?.price)}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{isAr ? "دولار" : "USD"}</span>
              </div>
            </div>

            <div className="my-6 h-[1.5px] w-6 bg-[#3C7A57]/40" />

            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">{isAr ? "الوصف" : "Description"}</h3>
              <p className="text-[14px] text-[#2F2A24]/70 leading-relaxed font-medium">
                {desc || (isAr ? "لا يوجد وصف متوفر." : "No description available.")}
              </p>
            </div>

            <div className="mt-8 flex gap-6 border-y border-[#E7DCD0]/30 py-5">
               <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-[#3C7A57]" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{isAr ? "منتج أصلي" : "Authentic"}</span>
               </div>
               <div className="flex items-center gap-2.5">
                  <Truck className="h-4 w-4 text-[#3C7A57]" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{isAr ? "توصيل سريع" : "Fast Delivery"}</span>
               </div>
            </div>

            {/* Compact Actions - الأزرار صغيرة ومتناسقة هنا */}
            <div className="mt-8">
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleAdd}
                  disabled={adding || !inStock}
                  className="h-11 px-6 rounded-lg bg-[#3C7A57] hover:bg-[#2d5d42] text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-[#3C7A57]/10 transition-all active:scale-95 flex items-center"
                >
                  <ShoppingCart className={`h-3.5 w-3.5 ${isAr ? "ml-2" : "mr-2"}`} />
                  {isAr ? "أضف للسلة" : "Add to Cart"}
                </Button>

                <Button
                  asChild
                  variant="ghost"
                  className="h-11 px-5 rounded-lg text-slate-400 hover:text-[#2F2A24] hover:bg-slate-100 text-xs font-bold uppercase transition-all"
                >
                  <Link to="/shop">
                    <ArrowLeft className={`h-3.5 w-3.5 ${isAr ? "ml-1.5 rotate-180" : "mr-1.5"}`} />
                    {isAr ? "رجوع" : "Back"}
                  </Link>
                </Button>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}