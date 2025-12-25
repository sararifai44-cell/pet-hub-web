// src/pages/OrdersPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, RefreshCw, Calendar, ArrowLeft, Filter, CheckCircle2, Clock, Search } from "lucide-react";
import { useGetMyOrdersQuery } from "@/features/orders/ordersApiSlice";

function useIsArabic() {
  const [isAr, setIsAr] = useState(false);
  useEffect(() => {
    const lang = (navigator.language || "").toLowerCase();
    setIsAr(lang.startsWith("ar"));
  }, []);
  return isAr;
}

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

function formatDate(dt, isAr) {
  if (!dt) return "";
  try {
    const d = new Date(dt);
    return d.toLocaleDateString(isAr ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch { return ""; }
}

function statusBadgeClass(status = "") {
  const s = String(status).toLowerCase();
  if (s.includes("pending")) return "bg-orange-50 text-orange-600 border-orange-100 shadow-sm";
  if (s.includes("completed") || s.includes("delivered")) return "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm";
  if (s.includes("cancel")) return "bg-red-50 text-red-600 border-red-100 shadow-sm";
  return "bg-slate-50 text-slate-600 border-slate-100 shadow-sm";
}

export default function OrdersPage() {
  const isAr = useIsArabic();
  const t = (en, ar) => (isAr ? ar : en);
  const location = useLocation();
  const highlightId = location.state?.highlightId;
  const refs = useRef({});
  
  const [filter, setFilter] = useState("all"); 
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, refetch } = useGetMyOrdersQuery();

  const rawOrders = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);

  const filteredOrders = useMemo(() => {
    return rawOrders.filter((o) => {
      const matchesSearch = o.id.toString().includes(searchQuery);
      const isPaid = String(o.payment_status || "").toLowerCase() === "paid";
      
      if (!matchesSearch) return false;
      if (filter === "paid") return isPaid;
      if (filter === "unpaid") return !isPaid;
      return true;
    });
  }, [rawOrders, filter, searchQuery]);

  useEffect(() => {
    if (!highlightId) return;
    const el = refs.current[highlightId];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [highlightId, filteredOrders.length]);

  const getItemImage = (it, orderId) => {
    const p = it?.product || {};
    const real = p?.image || p?.image_url || p?.imageUrl;
    if (real) return real;
    return `https://picsum.photos/seed/${it.product_id}-${orderId}/100/100`;
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#FDFCFB]" dir={isAr ? "rtl" : "ltr"}>
      <Navbar />
      <div className="pt-32 text-center text-[#3C7A57] font-medium animate-pulse">{t("Loading...", "جاري التحميل...")}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2F2A24]" dir={isAr ? "rtl" : "ltr"}>
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-6xl px-4">
          
          {/* ✅ Header Section - Reduced Rounded */}
          <header className="relative mb-8 overflow-hidden rounded-xl border border-[#E7DCD0] bg-[#F7F3F0] p-4 sm:p-6 shadow-sm">
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-full bg-white shadow-sm border border-[#E7DCD0]">
                  <Link to={-1}><ArrowLeft size={18} className={isAr ? "rotate-180" : ""} /></Link>
                </Button>
                <div className="flex items-center gap-3">
                  <img src="/pethub-logo (2).png" alt="Pet Hub" className="h-10 w-10 object-contain" />
                  <h1 className="text-xl font-bold tracking-tight text-[#2F2A24]">{t("My Orders", "طلباتي")}</h1>
                </div>
              </div>
              <Button onClick={refetch} variant="outline" size="sm" className="h-9 rounded-full border-[#E7DCD0] bg-white px-4 font-bold transition-transform active:scale-95">
                <RefreshCw size={14} className={isAr ? "ml-2" : "mr-2"} /> {t("Refresh", "تحديث")}
              </Button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* ✅ Sidebar Filters - Reduced Rounded */}
            <aside className="lg:col-span-1 space-y-6">
              <div className="sticky top-28 space-y-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text"
                    placeholder={t("Search Order ID...", "بحث برقم الطلب...")}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E7DCD0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#3C7A57]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="rounded-xl border border-[#E7DCD0] bg-white p-1.5 shadow-sm">
                  <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Filter size={12} /> {t("Filter by Payment", "تصفية حسب الدفع")}
                  </p>
                  <div className="space-y-1">
                    {[
                      { id: "all", label: t("All Orders", "كل الطلبات"), icon: <ShoppingBag size={15}/> },
                      { id: "paid", label: t("Paid", "المدفوعة"), icon: <CheckCircle2 size={15} className="text-emerald-500"/> },
                      { id: "unpaid", label: t("Unpaid", "غير المدفوعة"), icon: <Clock size={15} className="text-orange-500"/> },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setFilter(btn.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          filter === btn.id 
                          ? "bg-[#3C7A57] text-white shadow-sm" 
                          : "text-slate-600 hover:bg-[#FBF7F1]"
                        }`}
                      >
                        {btn.icon}
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* ✅ Orders List - Reduced Rounded & Font Weight */}
            <div className="lg:col-span-3 space-y-5">
              {!filteredOrders.length ? (
                <div className="rounded-xl border border-dashed border-[#E7DCD0] bg-white/50 py-20 text-center">
                  <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-slate-200" />
                  <p className="text-slate-500 font-medium">{t("No orders match your filter.", "لا توجد طلبات تطابق بحثك.")}</p>
                </div>
              ) : (
                filteredOrders.map((o) => (
                  <Card 
                    key={o.id} 
                    ref={(el) => (refs.current[o.id] = el)}
                    className={`overflow-hidden rounded-xl border-[#E7DCD0]/70 bg-white shadow-sm transition-all hover:shadow-md ${
                      highlightId === o.id ? "ring-1 ring-[#3C7A57]" : ""
                    }`}
                  >
                    <CardContent className="p-0">
                      {/* Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1E9E0] bg-[#FBF7F1]/60 p-4 sm:px-6">
                        <div className="flex items-center gap-4">
                          <div className="rounded-md bg-[#2F2A24] px-2 py-0.5 text-[12px] font-bold text-white uppercase tracking-tight">#{o.id}</div>
                          <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
                            <Calendar size={13} /> {formatDate(o.created_at, isAr)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                            <Badge className={`rounded-full border-none px-3 py-0.5 text-[10px] font-bold uppercase ${statusBadgeClass(o.status)}`}>{o.status}</Badge>
                            <Badge variant="outline" className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase ${String(o.payment_status).toLowerCase() === 'paid' ? 'border-emerald-200 text-emerald-600' : 'border-orange-200 text-orange-600'}`}>
                                {o.payment_status}
                            </Badge>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="p-4 sm:p-5 space-y-4">
                        {(o.items || []).map((it) => (
                          <div key={it.id} className="flex items-center gap-4 group">
                            <img src={getItemImage(it, o.id)} alt="Product" className="h-14 w-14 rounded-lg object-cover bg-slate-50 border border-slate-100 transition-transform group-hover:scale-105" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm text-[#2F2A24] truncate uppercase tracking-tight">{it?.product?.name || `#${it.product_id}`}</h4>
                              <p className="text-[11px] text-slate-400 mt-0.5">{t("Qty", "الكمية")}: {it.quantity} × {money(it.unit_price)}</p>
                            </div>
                            <div className="text-sm font-bold text-[#2F2A24]">{money(it.line_total)}</div>
                          </div>
                        ))}
                      </div>

                      {/* Footer - Reduced Font Weight for Total */}
                      <div className="flex items-center justify-between border-t border-[#F1E9E0] bg-slate-50/30 px-6 py-3.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("Total Amount", "المبلغ الإجمالي")}</span>
                        <span className="text-lg font-bold text-[#3C7A57]">{money(o.total)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}