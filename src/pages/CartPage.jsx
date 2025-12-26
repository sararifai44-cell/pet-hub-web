// src/pages/CartPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";

import { ShoppingBag, Trash2, Plus, Minus, CreditCard, ShoppingCart, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay, // تم التأكد من استيراد الـ Overlay
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

export default function CartPage() {
  const isAr = useIsArabic();
  const t = (en, ar) => (isAr ? ar : en);
  const navigate = useNavigate();

  const { data: cartRes, isLoading, isError, error, refetch } = useGetCartQuery();
  const [updateItem, { isLoading: updating }] = useUpdateCartItemMutation();
  const [removeItem, { isLoading: removing }] = useRemoveCartItemMutation();
  const [clearCart, { isLoading: clearing }] = useClearCartMutation();
  const [createOrder, { isLoading: ordering }] = useCreateOrderMutation();

  const cart = useMemo(() => cartRes?.data ?? null, [cartRes]);
  const items = useMemo(() => cart?.items ?? [], [cart]);
  const total = useMemo(() => Number(cart?.total ?? 0), [cart]);

  const [confirmOpen, setConfirmOpen] = useState(false);

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
        await removeItem({ itemId: it.id, quantity: 1 }).unwrap();
      } else {
        await updateItem({ itemId: it.id, quantity: q - 1 }).unwrap();
      }
    } catch {
      toast.error(t("Failed", "فشل التعديل"));
    }
  };

  const onRemoveAll = async (it) => {
    try {
      await removeItem({ itemId: it.id, quantity: Number(it.quantity) }).unwrap();
    } catch {
      toast.error(t("Failed", "فشل الحذف"));
    }
  };

  const onClear = async () => {
    try {
      await clearCart().unwrap();
      toast.success(t("Cart cleared", "تم تفريغ السلة"));
    } catch {
      toast.error(t("Failed", "فشل العملية"));
    }
  };

  const onConfirmOrder = async () => {
    try {
      const res = await createOrder().unwrap();
      const newOrderId = res?.data?.id;
      toast.success(t("Order created!", "تم إنشاء الطلب!"));
      setConfirmOpen(false);
      navigate("/orders", { state: { highlightId: newOrderId } });
    } catch (e) {
      toast.error(t("Failed to create order", "فشل إنشاء الطلب"));
    }
  };

  if (isLoading) return <div className="min-h-screen bg-[#FDFCFB]" />;

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2F2A24]" dir={isAr ? "rtl" : "ltr"}>
      <Navbar />

      <main className="pt-28 pb-20 px-4 md:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">{t("Shopping Cart", "سلة التسوق")}</h1>
            {!!items.length && (
              <Button variant="ghost" onClick={onClear} className="text-red-500 font-medium hover:bg-red-50 rounded-xl">
                <Trash2 className="h-4 w-4 mr-2" /> {t("Clear", "تفريغ")}
              </Button>
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
              <div className="space-y-4">
                {items.map((it) => (
                  <div key={it.id} className="flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg leading-tight uppercase">{it.product?.name}</h3>
                      <p className="text-[#3C7A57] font-semibold text-sm mt-1">{money(it.product?.price)}</p>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-xl">
                          <button onClick={() => onMinus(it)} className="h-7 w-7 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-slate-50 transition-colors"><Minus className="h-3 w-3"/></button>
                          <span className="text-sm font-bold w-4 text-center">{it.quantity}</span>
                          <button onClick={() => onPlus(it)} className="h-7 w-7 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-slate-50 transition-colors"><Plus className="h-3 w-3"/></button>
                        </div>
                        <p className="font-bold text-slate-700">{money(it.line_total)}</p>
                      </div>
                    </div>
                    <button onClick={() => onRemoveAll(it)} className="text-slate-300 hover:text-red-500 transition-colors p-1"><Trash2 className="h-4 w-4"/></button>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-slate-100 p-6 rounded-[24px] shadow-sm h-fit">
                <h2 className="font-bold text-lg mb-4">{t("Summary", "الملخص")}</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-500"><span>{t("Subtotal", "المجموع")}</span><span className="font-bold text-slate-800">{money(total)}</span></div>
                  <div className="flex justify-between text-slate-500"><span>{t("Shipping", "الشحن")}</span><span className="text-[#3C7A57] font-bold">{t("Free", "مجاني")}</span></div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-lg font-bold"><span>{t("Total", "الإجمالي")}</span><span className="text-[#3C7A57]">{money(total)}</span></div>
                </div>
                <Button onClick={() => setConfirmOpen(true)} className="w-full mt-6 h-12 rounded-xl bg-[#3C7A57] hover:bg-[#336A4C] font-bold text-white shadow-lg shadow-[#3C7A57]/20 transition-all active:scale-95">
                  {t("Checkout", "إتمام الطلب")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* الدايلوغ المصحح لعدم الشفافية */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="z-[200] rounded-[24px] max-w-sm p-0 overflow-hidden border-none shadow-2xl bg-white focus:outline-none">
          <div className="p-6 text-center bg-white">
            <div className="mx-auto h-12 w-12 rounded-full bg-[#3C7A57]/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-[#3C7A57]" />
            </div>
            <DialogTitle className="text-xl font-bold mb-2 text-[#2F2A24]">{t("Confirm Order", "تأكيد الطلب")}</DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              {t("Are you sure you want to place this order? Your cart will be cleared.", "هل أنت متأكد من إتمام الطلب؟ سيتم تفريغ السلة تلقائياً.")}
            </DialogDescription>
          </div>

          <div className="px-6 pb-6 space-y-3 bg-white">
             <div className="flex justify-between p-3 bg-slate-50 rounded-xl text-sm font-semibold border border-slate-100">
                <span className="text-slate-500">{t("Amount to pay", "المبلغ المطلوب")}</span>
                <span className="text-[#3C7A57] font-bold">{money(total)}</span>
             </div>
             
             <div className="flex flex-col gap-2 pt-2">
                <Button onClick={onConfirmOrder} disabled={ordering} className="h-12 rounded-xl bg-[#3C7A57] hover:bg-[#336A4C] text-white font-bold transition-all active:scale-95">
                  {ordering ? t("Processing...", "جاري الطلب...") : t("Confirm Order", "تأكيد الطلب")}
                </Button>
                <Button variant="ghost" onClick={() => setConfirmOpen(false)} className="text-slate-400 font-medium h-10 hover:bg-slate-50 rounded-xl">
                  {t("Cancel", "إلغاء")}
                </Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}