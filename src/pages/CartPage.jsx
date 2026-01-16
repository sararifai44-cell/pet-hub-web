import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";

import { ShoppingBag, Trash2, Plus, Minus, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogOverlay,
  DialogHeader,
} from "@/components/ui/dialog";

import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} from "@/features/cart/cartApiSlice";

import { useCreateOrderMutation } from "@/features/orders/ordersApiSlice";

const headerPets = ["/cat.jpg", "/bird.jpg", "/h3-cat-pet-container.jpg"];

function useIsArabic() {
  const [isAr, setIsAr] = useState(false);
  useEffect(() => {
    const lang = (navigator.language || "").toLowerCase();
    setIsAr(lang.startsWith("ar"));
  }, []);
  return isAr;
}

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const normalizeUrl = (u) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `${API_ORIGIN}${u.startsWith("/") ? "" : "/"}${u}`;
};

const getItemImage = (it) => {
  const p = it?.product || {};
  const img = p?.cover_image || p?.image || p?.image_url || p?.images?.[0]?.url;
  return img ? normalizeUrl(img) : "/placeholder.png";
};

const Field = ({ label, value, isAr, valueClassName = "" }) => (
  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
    <div className={`text-[10px] font-bold uppercase tracking-widest text-slate-500 ${isAr ? "text-right" : "text-left"}`}>
      {label}
    </div>
    <div className={`mt-0.5 text-sm font-bold text-[#2F2A24] truncate ${isAr ? "text-right" : "text-left"} ${valueClassName}`} title={String(value ?? "")}>
      {value}
    </div>
  </div>
);

export default function CartPage() {
  const isAr = useIsArabic();
  const t = (en, ar) => (isAr ? ar : en);
  const navigate = useNavigate();

  const { data: cartRes, isLoading } = useGetCartQuery();
  const [updateItem, { isLoading: updating }] = useUpdateCartItemMutation();
  const [removeItem, { isLoading: removing }] = useRemoveCartItemMutation();
  const [clearCart, { isLoading: clearing }] = useClearCartMutation();
  const [createOrder, { isLoading: ordering }] = useCreateOrderMutation();

  const cart = useMemo(() => cartRes?.data ?? null, [cartRes]);
  const items = useMemo(() => cart?.items ?? [], [cart]);
  const total = useMemo(() => Number(cart?.total ?? 0), [cart]);

  const [confirmOrderOpen, setConfirmOrderOpen] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [pendingRemoveItem, setPendingRemoveItem] = useState(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const onPlus = async (it) => {
    try { await updateItem({ itemId: it.id, quantity: Number(it.quantity) + 1 }).unwrap(); }
    catch { toast.error(t("Failed", "فشل التعديل")); }
  };

  const onMinus = async (it) => {
    const q = Number(it.quantity);
    try {
      if (q <= 1) { setPendingRemoveItem(it); setConfirmRemoveOpen(true); }
      else { await updateItem({ itemId: it.id, quantity: q - 1 }).unwrap(); }
    } catch { toast.error(t("Failed", "فشل التعديل")); }
  };

  const askRemoveAll = (it) => { setPendingRemoveItem(it); setConfirmRemoveOpen(true); };
  const confirmRemoveAll = async () => {
    if (!pendingRemoveItem) return;
    try {
      await removeItem({ itemId: pendingRemoveItem.id, quantity: Number(pendingRemoveItem.quantity) }).unwrap();
      toast.success(t("Item removed", "تم حذف العنصر"));
      setConfirmRemoveOpen(false);
    } catch { toast.error(t("Failed", "فشل الحذف")); }
  };

  const askClear = () => setConfirmClearOpen(true);
  const confirmClear = async () => {
    try { await clearCart().unwrap(); toast.success(t("Cart cleared", "تم تفريغ السلة")); setConfirmClearOpen(false); }
    catch { toast.error(t("Failed", "فشل العملية")); }
  };

  const onConfirmOrder = async () => {
    try {
      const res = await createOrder().unwrap();
      toast.success(t("Order created!", "تم إنشاء الطلب!"));
      setConfirmOrderOpen(false);
      navigate("/orders", { state: { highlightId: res?.data?.id } });
    } catch { toast.error(t("Failed to create order", "فشل إنشاء الطلب")); }
  };

  if (isLoading) return <div className="min-h-screen bg-[#FDFCFB]" />;

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2F2A24]" dir={isAr ? "rtl" : "ltr"}>
      <Navbar />

      <main className="pt-8 pb-20 px-4 md:px-6">
        <div className="mx-auto max-w-5xl">
          
          <header className="relative bg-[#387365] p-6 md:p-10 rounded-xl shadow-md flex flex-col md:flex-row md:items-center justify-between overflow-hidden mb-6 border-b-4 border-[#2d5c51]">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <ShoppingBag className="w-64 h-64 text-white" />
            </div>
            <div className="z-10">
              <button onClick={() => navigate("/shop")} className="flex items-center gap-2 text-[#a8d5cb] font-semibold hover:text-white transition-colors w-fit group text-xs mb-3">
                <ArrowLeft className={`w-3.5 h-3.5 transition-transform ${isAr ? "rotate-180 group-hover:translate-x-1" : "group-hover:-translate-x-1"}`} />
                <span>{t("Back to Shop", "العودة للمتجر")}</span>
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{t("My Shopping Cart", "سلة المشتريات")}</h1>
              <p className="text-[#a8d5cb] text-sm mt-1 font-medium">
                {items.length > 0 
                  ? t(`You have ${items.length} items in your cart`, `لديك ${items.length} عناصر في سلتك الآن`)
                  : t("Review your items before checkout", "راجع منتجاتك قبل إتمام عملية الدفع")
                }
              </p>
            </div>
            <div className="hidden lg:flex -space-x-3 z-10">
              {headerPets.map((url, i) => (
                <img key={i} src={url} className="w-12 h-12 rounded-full border-2 border-white shadow-xl object-cover" alt="pet" />
              ))}
            </div>
          </header>

          {!!items.length && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={askClear}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t("Clear Cart", "تفريغ السلة بالكامل")}
              </button>
            </div>
          )}

          {!items.length ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-300 rounded-xl bg-white">
              <ShoppingBag className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">{t("Your cart is empty", "سلتك فارغة حالياً")}</p>
              <Button asChild className="mt-6 rounded-lg bg-[#387365] px-8 text-white hover:bg-[#2d5c51]">
                <Link to="/shop">{t("Shop Now", "تسوق الآن")}</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1fr_350px] p-4 md:p-6 bg-white border border-slate-300 rounded-xl shadow-sm">
              <div className="space-y-4">
                {items.map((it) => {
                  const name = it.product?.name || `#${it.product_id}`;
                  const img = getItemImage(it);

                  return (
                    <div key={it.id} className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-400 transition-all">
                      <div className={`flex flex-col sm:flex-row gap-4 ${isAr ? "sm:flex-row-reverse" : ""}`}>
                        <div className="shrink-0 flex justify-center">
                          <div className="w-20 h-20 rounded-lg border border-slate-200 bg-slate-50 p-1 flex items-center justify-center">
                            <img src={img} alt={name} className="max-h-full max-w-full rounded-md object-cover" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                              <Field label={t("Product", "المنتج")} value={name} isAr={isAr} />
                              <Field label={t("Price", "السعر")} value={money(it.product?.price)} isAr={isAr} valueClassName="text-[#387365]" />
                            </div>
                            <button
                              onClick={() => askRemoveAll(it)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className={`mt-3 flex items-center justify-between gap-3 ${isAr ? "flex-row-reverse" : ""}`}>
                            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
                              <button onClick={() => onMinus(it)} disabled={updating || removing} className="h-7 w-7 flex items-center justify-center bg-white rounded-md border border-slate-200 hover:bg-slate-50 shadow-sm"><Minus className="h-3 w-3" /></button>
                              <span className="text-sm font-bold w-6 text-center">{it.quantity}</span>
                              <button onClick={() => onPlus(it)} disabled={updating || removing} className="h-7 w-7 flex items-center justify-center bg-white rounded-md border border-slate-200 hover:bg-slate-50 shadow-sm"><Plus className="h-3 w-3" /></button>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm">
                              <span className="text-slate-500 font-medium text-xs">{t("Subtotal", "الإجمالي")}</span>
                              <span className="font-bold text-[#387365]">{money(it.line_total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-[#F8FAFC] border border-slate-300 p-6 rounded-xl h-fit lg:sticky lg:top-24">
                <h2 className="font-bold text-lg mb-4 text-[#2F2A24] border-b border-slate-200 pb-2">{t("Order Summary", "ملخص الطلب")}</h2>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t("Items", "العناصر")}</span>
                    <span className="font-bold">{money(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t("Shipping", "الشحن")}</span>
                    <span className="text-[#387365] font-bold">{t("Free", "مجاني")}</span>
                  </div>
                  <Separator className="bg-slate-300" />
                  <div className="flex justify-between text-lg font-black uppercase">
                    <span>{t("Total", "الإجمالي")}</span>
                    <span className="text-[#387365]">{money(total)}</span>
                  </div>
                </div>
                <Button onClick={() => setConfirmOrderOpen(true)} className="w-full mt-6 h-12 rounded-lg bg-[#387365] hover:bg-[#2d5c51] font-bold text-white shadow-md transition-all active:scale-95">
                  {t("Checkout", "إتمام الطلب الآن")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ديايلوغ الحذف (مطابق للنمط المطلوب) */}
      <Dialog open={confirmRemoveOpen} onOpenChange={(v) => { setConfirmRemoveOpen(v); if (!v) setPendingRemoveItem(null); }}>
        <DialogOverlay className="bg-black/40 backdrop-blur-sm" />
        <DialogContent className="z-[220] max-w-sm rounded-xl p-6 overflow-hidden border border-slate-300 shadow-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#2F2A24]">
              {t("Remove item?", "حذف العنصر؟")}
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              {t("Are you sure you want to remove this item from your cart?", "هل أنت متأكد أنك تريد حذف هذا المنتج من السلة؟")}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={() => setConfirmRemoveOpen(false)}
              className="h-10 rounded-lg text-slate-500 hover:bg-slate-50"
            >
              {t("Back", "رجوع")}
            </Button>
            <Button
              onClick={confirmRemoveAll}
              className="h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              {t("Yes, remove", "نعم، حذف")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ديايلوغ تفريغ السلة */}
      <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <DialogOverlay className="bg-black/40 backdrop-blur-sm" />
        <DialogContent className="z-[220] max-w-sm rounded-xl p-6 overflow-hidden border border-slate-300 shadow-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#2F2A24]">
              {t("Clear cart?", "تفريغ السلة؟")}
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              {t("This will remove all items from your shopping cart.", "سيؤدي هذا إلى حذف جميع المنتجات الموجودة في سلتك.")}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setConfirmClearOpen(false)} className="h-10 rounded-lg text-slate-500">
              {t("Back", "رجوع")}
            </Button>
            <Button onClick={confirmClear} className="h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold">
              {t("Yes, clear all", "نعم، تفريغ الكل")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ديايلوغ تأكيد الطلب */}
      <Dialog open={confirmOrderOpen} onOpenChange={setConfirmOrderOpen}>
        <DialogOverlay className="bg-black/40 backdrop-blur-sm" />
        <DialogContent className="z-[200] rounded-xl max-w-sm p-6 border border-slate-300 shadow-2xl bg-white text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-[#387365]/10 flex items-center justify-center mb-4 border border-[#387365]/20">
            <CheckCircle2 className="h-6 w-6 text-[#387365]" />
          </div>
          <DialogTitle className="text-lg font-bold mb-2 text-[#2F2A24]">{t("Confirm Order", "تأكيد الطلب")}</DialogTitle>
          <DialogDescription className="text-slate-500 text-sm mb-6">
            {t("Ready to place your order? Your cart will be cleared once confirmed.", "هل أنت مستعد لإرسال الطلب؟ سيتم إفراغ السلة فور التأكيد.")}
          </DialogDescription>
          <div className="flex flex-col gap-2">
            <Button onClick={onConfirmOrder} disabled={ordering} className="w-full h-11 rounded-lg bg-[#387365] hover:bg-[#2d5c51] text-white font-bold">
              {ordering ? t("Processing...", "جاري المعالجة...") : t("Confirm & Order", "تأكيد وإتمام الطلب")}
            </Button>
            <Button variant="ghost" onClick={() => setConfirmOrderOpen(false)} className="w-full h-10 text-slate-400">
              {t("Review more", "مراجعة المزيد")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}