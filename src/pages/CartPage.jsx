// src/pages/CartPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";

import { ShoppingBag, Trash2, Plus, Minus, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";

import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} from "@/features/cart/cartApiSlice";

import { useCreateOrderMutation } from "@/features/orders/ordersApiSlice";

function useIsArabic() {
  const [isAr, setIsAr] = useState(false);
  useEffect(() => {
    const lang = (navigator.language || "").toLowerCase();
    setIsAr(lang.startsWith("ar"));
  }, []);
  return isAr;
}

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

const API_ORIGIN =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

const normalizeUrl = (u) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `${API_ORIGIN}${u.startsWith("/") ? "" : "/"}${u}`;
};

const getItemImage = (it) => {
  const p = it?.product || {};
  const img =
    p?.cover_image || 
    p?.image ||
    p?.image_url ||
    p?.imageUrl ||
    p?.images?.[0]?.url ||
    p?.images?.[0]?.path;

  return img ? normalizeUrl(img) : "/placeholder.png";
};

const Field = ({ label, value, isAr, valueClassName = "" }) => {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
      <div
        className={`text-[10px] font-bold uppercase tracking-widest text-slate-400 ${
          isAr ? "text-right" : "text-left"
        }`}
      >
        {label}
      </div>
      <div
        className={`mt-1 text-sm font-semibold text-[#2F2A24] truncate ${
          isAr ? "text-right" : "text-left"
        } ${valueClassName}`}
        title={String(value ?? "")}
      >
        {value}
      </div>
    </div>
  );
};

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

  // ✅ dialogs
  const [confirmOrderOpen, setConfirmOrderOpen] = useState(false);

  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [pendingRemoveItem, setPendingRemoveItem] = useState(null);

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const onPlus = async (it) => {
    try {
      await updateItem({ itemId: it.id, quantity: Number(it.quantity) + 1 }).unwrap();
    } catch {
      toast.error(t("Failed", "فشل التعديل"));
    }
  };

  const onMinus = async (it) => {
    const q = Number(it.quantity);
    try {
      if (q <= 1) {
        setPendingRemoveItem(it);
        setConfirmRemoveOpen(true);
      } else {
        await updateItem({ itemId: it.id, quantity: q - 1 }).unwrap();
      }
    } catch {
      toast.error(t("Failed", "فشل التعديل"));
    }
  };

  const askRemoveAll = (it) => {
    setPendingRemoveItem(it);
    setConfirmRemoveOpen(true);
  };

  const confirmRemoveAll = async () => {
    if (!pendingRemoveItem) return;
    try {
      await removeItem({
        itemId: pendingRemoveItem.id,
        quantity: Number(pendingRemoveItem.quantity),
      }).unwrap();
      toast.success(t("Item removed", "تم حذف العنصر"));
      setConfirmRemoveOpen(false);
      setPendingRemoveItem(null);
    } catch {
      toast.error(t("Failed", "فشل الحذف"));
    }
  };

  const askClear = () => setConfirmClearOpen(true);

  const confirmClear = async () => {
    try {
      await clearCart().unwrap();
      toast.success(t("Cart cleared", "تم تفريغ السلة"));
      setConfirmClearOpen(false);
    } catch {
      toast.error(t("Failed", "فشل العملية"));
    }
  };

  const onConfirmOrder = async () => {
    try {
      const res = await createOrder().unwrap();
      const newOrderId = res?.data?.id;
      toast.success(t("Order created!", "تم إنشاء الطلب!"));
      setConfirmOrderOpen(false);
      navigate("/orders", { state: { highlightId: newOrderId } });
    } catch {
      toast.error(t("Failed to create order", "فشل إنشاء الطلب"));
    }
  };

  if (isLoading) return <div className="min-h-screen bg-[#FDFCFB]" />;

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2F2A24]" dir={isAr ? "rtl" : "ltr"}>
      <Navbar />

      <main className="pt-28 pb-20 px-4 md:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-center justify-between gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{t("Shopping Cart", "سلة التسوق")}</h1>

            {!!items.length && (
              <button
                onClick={askClear}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition"
              >
                <Trash2 className="h-4 w-4" />
                {t("Clear Cart", "تفريغ السلة")}
              </button>
            )}
          </div>

          {!items.length ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[32px]">
              <ShoppingBag className="mx-auto h-12 w-12 text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium">{t("Your cart is empty", "سلتك فارغة حالياً")}</p>
              <Button asChild className="mt-6 rounded-xl bg-[#3C7A57] px-8 text-white">
                <Link to="/shop">{t("Shop Now", "تسوق الآن")}</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-[1fr_350px]">
              {/* Items */}
              <div className="space-y-4">
                {items.map((it) => {
                  const name = it.product?.name || `#${it.product_id}`;
                  const price = money(it.product?.price);
                  const img = getItemImage(it);

                  return (
                    <div
                      key={it.id}
                      className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4"
                    >
                      <div className={`flex gap-4 ${isAr ? "flex-row-reverse" : ""}`}>
                        {/* ✅ Image field */}
                        <div className="shrink-0">
                          <div className="w-24 rounded-2xl border border-slate-100 bg-slate-50 p-2">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 text-center">
                              {t("Image", "الصورة")}
                            </div>
                            <img
                              src={img}
                              alt={name}
                              className="h-16 w-16 mx-auto rounded-xl object-cover border border-slate-100 bg-white"
                              loading="lazy"
                              onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                            />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                              <Field
                                label={t("Product Name", "اسم المنتج")}
                                value={name}
                                isAr={isAr}
                              />
                              <Field
                                label={t("Unit Price", "سعر القطعة")}
                                value={price}
                                isAr={isAr}
                                valueClassName="text-[#3C7A57]"
                              />
                            </div>

                          
                            <button
                              onClick={() => askRemoveAll(it)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                              title={t("Remove", "حذف")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Qty + total */}
                          <div className={`mt-4 flex items-center justify-between gap-3 ${isAr ? "flex-row-reverse" : ""}`}>
                            <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-xl border border-slate-100">
                              <button
                                onClick={() => onMinus(it)}
                                disabled={updating || removing}
                                className="h-8 w-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                              >
                                <Minus className="h-3 w-3" />
                              </button>

                              <span className="text-sm font-bold w-6 text-center">{it.quantity}</span>

                              <button
                                onClick={() => onPlus(it)}
                                disabled={updating || removing}
                                className="h-8 w-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#E7DCD0] bg-[#FBF7F1] px-4 py-2 text-sm">
                              <span className="text-slate-500 font-medium">{t("Item Total", "إجمالي العنصر")}</span>
                              <span className="font-medium text-[#3C7A57]">{money(it.line_total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="bg-white border border-slate-100 p-6 rounded-[24px] shadow-sm h-fit">
                <h2 className="font-bold text-lg mb-4">{t("Summary", "الملخص")}</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>{t("Subtotal", "المجموع")}</span>
                    <span className="font-bold text-slate-800">{money(total)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>{t("Shipping", "الشحن")}</span>
                    <span className="text-[#3C7A57] font-bold">{t("Free", "مجاني")}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t("Total", "الإجمالي")}</span>
                    <span className="text-[#3C7A57]">{money(total)}</span>
                  </div>
                </div>

                <Button
                  onClick={() => setConfirmOrderOpen(true)}
                  className="w-full mt-6 h-12 rounded-xl bg-[#3C7A57] hover:bg-[#336A4C] font-bold text-white shadow-lg shadow-[#3C7A57]/20 transition-all active:scale-95"
                >
                  {t("Checkout", "إتمام الطلب")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ✅ Confirm remove item (small popup) */}
      <Dialog open={confirmRemoveOpen} onOpenChange={(v) => { setConfirmRemoveOpen(v); if (!v) setPendingRemoveItem(null); }}>
        <DialogOverlay className="bg-black/30" />
        <DialogContent className="z-[220] max-w-sm rounded-2xl p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold text-[#2F2A24]">
                {t("Remove item?", "حذف العنصر؟")}
              </DialogTitle>
              <button
                onClick={() => setConfirmRemoveOpen(false)}
                className="h-9 w-9 rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 inline-flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <DialogDescription className="text-slate-500 text-sm mt-2">
              {t("This item will be removed from your cart.", "سيتم حذف هذا العنصر من السلة.")}
            </DialogDescription>

            <div className="mt-5 flex gap-2">
              <Button
                onClick={confirmRemoveAll}
                disabled={removing}
                className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                {removing ? t("Removing...", "جاري الحذف...") : t("Remove", "حذف")}
              </Button>
              <Button
                variant="outline"
                onClick={() => setConfirmRemoveOpen(false)}
                className="flex-1 h-11 rounded-xl"
              >
                {t("Cancel", "إلغاء")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      
      <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <DialogOverlay className="bg-black/30" />
        <DialogContent className="z-[220] max-w-sm rounded-2xl p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold text-[#2F2A24]">
                {t("Clear cart?", "تفريغ السلة؟")}
              </DialogTitle>
              <button
                onClick={() => setConfirmClearOpen(false)}
                className="h-9 w-9 rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 inline-flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <DialogDescription className="text-slate-500 text-sm mt-2">
              {t("All items will be removed from your cart.", "سيتم حذف جميع العناصر من السلة.")}
            </DialogDescription>

            <div className="mt-5 flex gap-2">
              <Button
                onClick={confirmClear}
                disabled={clearing}
                className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                {clearing ? t("Clearing...", "جاري التفريغ...") : t("Clear", "تفريغ")}
              </Button>
              <Button
                variant="outline"
                onClick={() => setConfirmClearOpen(false)}
                className="flex-1 h-11 rounded-xl"
              >
                {t("Cancel", "إلغاء")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ✅ Confirm order (as you had) */}
      <Dialog open={confirmOrderOpen} onOpenChange={setConfirmOrderOpen}>
        <DialogOverlay className="bg-black/30" />
        <DialogContent className="z-[200] rounded-[24px] max-w-sm p-0 overflow-hidden border-none shadow-2xl bg-white focus:outline-none">
          <div className="p-6 text-center bg-white">
            <div className="mx-auto h-12 w-12 rounded-full bg-[#3C7A57]/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-[#3C7A57]" />
            </div>
            <DialogTitle className="text-xl font-bold mb-2 text-[#2F2A24]">
              {t("Confirm Order", "تأكيد الطلب")}
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              {t(
                "Are you sure you want to place this order? Your cart will be cleared.",
                "هل أنت متأكد من إتمام الطلب؟ سيتم تفريغ السلة تلقائياً."
              )}
            </DialogDescription>
          </div>

          <div className="px-6 pb-6 space-y-3 bg-white">
            <div className="flex justify-between p-3 bg-slate-50 rounded-xl text-sm font-semibold border border-slate-100">
              <span className="text-slate-500">{t("Amount to pay", "المبلغ المطلوب")}</span>
              <span className="text-[#3C7A57] font-bold">{money(total)}</span>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={onConfirmOrder}
                disabled={ordering}
                className="h-12 rounded-xl bg-[#3C7A57] hover:bg-[#336A4C] text-white font-bold transition-all active:scale-95"
              >
                {ordering ? t("Processing...", "جاري الطلب...") : t("Confirm Order", "تأكيد الطلب")}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setConfirmOrderOpen(false)}
                className="text-slate-400 font-medium h-10 hover:bg-slate-50 rounded-xl"
              >
                {t("Cancel", "إلغاء")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
  