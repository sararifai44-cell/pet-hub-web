// src/pages/CartPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";

import { ShoppingBag, Trash2, Plus, Minus, CreditCard } from "lucide-react";
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
      toast.error(t("Failed to update quantity", "فشل تعديل الكمية"));
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
      toast.error(t("Failed to update quantity", "فشل تعديل الكمية"));
    }
  };

  const onRemoveAll = async (it) => {
    try {
      await removeItem({ itemId: it.id, quantity: Number(it.quantity) }).unwrap();
    } catch {
      toast.error(t("Failed to remove item", "فشل حذف العنصر"));
    }
  };

  const onClear = async () => {
    try {
      await clearCart().unwrap();
      toast.success(t("Cart cleared", "تم تفريغ السلة"));
    } catch {
      toast.error(t("Failed to clear cart", "فشل تفريغ السلة"));
    }
  };

  const onConfirmOrder = async () => {
    try {
      const res = await createOrder().unwrap();
      const newOrderId = res?.data?.id;

      toast.success(t("Order created!", "تم إنشاء الطلب!"), {
        description: newOrderId ? `#${newOrderId}` : undefined,
        duration: 2500,
      });

      setConfirmOpen(false);
      navigate("/orders", { state: { highlightId: newOrderId } });
    } catch (e) {
      const status = e?.status;
      toast.error(
        status === 401
          ? t("Please login first", "لازم تسجّل دخول أولاً")
          : t("Failed to create order", "فشل إنشاء الطلب")
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FBF7F1] text-[#2F2A24]" dir={isAr ? "rtl" : "ltr"}>
        <Navbar />
        <main className="pt-24">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="h-10 w-56 rounded-lg bg-black/5 animate-pulse" />
            <div className="mt-6 h-40 rounded-xl bg-black/5 animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  if (isError) {
    const status = error?.status;
    return (
      <div className="min-h-screen bg-[#FBF7F1] text-[#2F2A24]" dir={isAr ? "rtl" : "ltr"}>
        <Navbar />
        <main className="pt-24">
          <div className="mx-auto max-w-4xl px-4 md:px-6">
            <Card className="rounded-xl border-[#E7DCD0]/70 bg-white/70">
              <CardHeader>
                <CardTitle>{t("Couldn’t load cart", "ما قدرنا نجيب السلة")}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {status === 401 ? (
                  <Button asChild className="rounded-full bg-[#3C7A57] hover:bg-[#336A4C] text-white">
                    <Link to="/login">{t("Login", "تسجيل الدخول")}</Link>
                  </Button>
                ) : null}

                <Button
                  variant="outline"
                  onClick={refetch}
                  className="rounded-full border-[#E7DCD0] bg-white/70 hover:bg-white"
                >
                  {t("Retry", "إعادة المحاولة")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7F1] text-[#2F2A24]" dir={isAr ? "rtl" : "ltr"}>
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h1 className="mt-0 text-3xl md:text-4xl font-extrabold tracking-tight text-[#2F2A24]">
              {t("Shopping Cart", "سلة التسوق")}
            </h1>

            {!!items.length && (
              <Button
                variant="outline"
                onClick={onClear}
                disabled={clearing}
                className="rounded-full border-[#E7DCD0] bg-white/70 hover:bg-white"
              >
                <Trash2 className="h-4 w-4" />
                <span className={isAr ? "mr-2" : "ml-2"}>{t("Clear", "تفريغ")}</span>
              </Button>
            )}
          </div>

          <Separator className="my-6 bg-[#E7DCD0]" />

          {!items.length ? (
            <Card className="rounded-xl border-[#E7DCD0]/70 bg-white/70 backdrop-blur-md">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-lg bg-[#3C7A57]/10 border border-[#3C7A57]/20">
                    <ShoppingBag className="h-6 w-6 text-[#3C7A57]" />
                  </span>
                  <div>
                    <CardTitle className="text-xl">{t("Your cart is empty", "السلة فارغة")}</CardTitle>
                    <div className="text-sm text-[#2F2A24]/70 mt-1">
                      {t("Go back to the shop and add something.", "ارجع للمتجر وأضف منتجات.")}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button asChild className="h-11 rounded-full bg-[#3C7A57] text-white hover:bg-[#336A4C]">
                    <Link to="/shop">{t("Go to shop", "اذهب للتسوق")}</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-full border-[#E7DCD0] bg-white/70 hover:bg-white"
                  >
                    <Link to="/">{t("Back home", "الصفحة الرئيسية")}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              {/* items */}
              <div className="space-y-3">
                {items.map((it) => {
                  const p = it.product || {};
                  const name = p.name || `#${it.product_id}`;
                  const price = Number(p.price ?? 0);
                  const qty = Number(it.quantity ?? 0);
                  const lineTotal = Number(it.line_total ?? price * qty);

                  return (
                    <Card key={it.id} className="rounded-xl border-[#E7DCD0]/70 bg-white/75">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-lg font-extrabold truncate uppercase tracking-tight">{name}</div>
                            {p.description ? (
                              <div className="mt-1 text-xs text-[#2F2A24]/60 line-clamp-1">{p.description}</div>
                            ) : null}
                            <div className="mt-2 text-sm font-bold text-[#3C7A57]">
                              {money(price)} <span className="text-[#2F2A24]/30 font-normal mx-1">/</span>{" "}
                              <span className="text-[#2F2A24]/70 text-xs">{t("unit", "قطعة")}</span>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onRemoveAll(it)}
                            disabled={removing}
                            className="h-9 w-9 rounded-full border-[#E7DCD0] bg-white/70 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 rounded-lg border border-[#E7DCD0] bg-white px-2 py-1 shadow-sm">
                            <button
                              type="button"
                              onClick={() => onMinus(it)}
                              disabled={updating || removing}
                              className="h-7 w-7 grid place-items-center rounded-md hover:bg-black/5 transition-colors disabled:opacity-30"
                              aria-label="minus"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>

                            <div className="min-w-[24px] text-center font-extrabold text-sm">{qty}</div>

                            <button
                              type="button"
                              onClick={() => onPlus(it)}
                              disabled={updating}
                              className="h-7 w-7 grid place-items-center rounded-md hover:bg-black/5 transition-colors disabled:opacity-30"
                              aria-label="plus"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("Line total", "مجموع العنصر")}</div>
                            <div className="text-lg font-bold text-[#2F2A24]">{money(lineTotal)}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* summary */}
              <Card className="rounded-xl border-[#E7DCD0]/70 bg-white/75 h-fit lg:sticky lg:top-28">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{t("Order summary", "ملخص الطلب")}</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#2F2A24]/70">{t("Items", "العناصر")}</span>
                    <span className="font-bold">{items.length}</span>
                  </div>

                  <Separator className="my-4 bg-[#E7DCD0]/60" />

                  <div className="flex items-center justify-between">
                    <span className="text-[#2F2A24]/70 font-semibold">{t("Total", "الإجمالي")}</span>
                    <span className="text-xl font-bold text-[#3C7A57]">{money(total)}</span>
                  </div>

                  <Button
                    onClick={() => setConfirmOpen(true)}
                    className="mt-5 w-full h-11 rounded-full bg-[#3C7A57] hover:bg-[#336A4C] text-white shadow-sm"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span className={isAr ? "mr-2" : "ml-2"}>{t("Order now", "اطلب الآن")}</span>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="mt-2 w-full h-11 rounded-full border-[#E7DCD0] bg-white/70 hover:bg-white"
                  >
                    <Link to="/shop">{t("Continue shopping", "متابعة التسوق")}</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="rounded-xl max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("Confirm order", "تأكيد الطلب")}</DialogTitle>
            <DialogDescription className="text-xs">
              {t(
                "We’ll create an order from your cart and then clear the cart.",
                "رح ننشئ طلب من السلة وبعدها رح تنفضى السلة."
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-[#E7DCD0] bg-[#FBF7F1] p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#2F2A24]/70">{t("Items", "العناصر")}</span>
              <span className="font-bold">{items.length}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[#2F2A24]/70">{t("Total", "الإجمالي")}</span>
              <span className="font-bold text-[#3C7A57]">{money(total)}</span>
            </div>
          </div>

          <DialogFooter className={`flex flex-col-reverse sm:flex-row gap-2 ${isAr ? "sm:justify-start" : "sm:justify-end"}`}>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              className="rounded-full border-[#E7DCD0] bg-white/70 hover:bg-white flex-1 sm:flex-none"
            >
              {t("Cancel", "إلغاء")}
            </Button>

            <Button
              onClick={onConfirmOrder}
              disabled={ordering}
              className="rounded-full bg-[#3C7A57] hover:bg-[#336A4C] text-white flex-1 sm:flex-none"
            >
              {t("Confirm", "تأكيد")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}