// src/pages/OrdersPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingBag,
  RefreshCw,
  Calendar,
  ArrowLeft,
  Filter,
  CheckCircle2,
  Clock,
  Search,
} from "lucide-react";
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
  } catch {
    return "";
  }
}

function statusBadgeClass(status = "") {
  const s = String(status).toLowerCase();
  if (s.includes("pending")) return "bg-orange-50 text-orange-600 border-orange-100";
  if (s.includes("completed") || s.includes("delivered"))
    return "bg-emerald-50 text-emerald-600 border-emerald-100";
  if (s.includes("cancel")) return "bg-red-50 text-red-600 border-red-100";
  return "bg-slate-50 text-slate-600 border-slate-100";
}

/** ✅ Images */
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

function ItemsTable({ items = [], isAr, t }) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed border-[#E7DCD0] bg-white/60 p-6 text-center text-slate-500">
        {t("No items in this order.", "لا يوجد عناصر ضمن هذا الطلب.")}
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Desktop/tablet table */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-[#E7DCD0] bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#FBF7F1] text-slate-600">
            <tr className="border-b border-[#E7DCD0]">
              <th
                className={`px-4 py-3 text-xs font-bold uppercase tracking-widest ${
                  isAr ? "text-right" : "text-left"
                }`}
              >
                {t("Product", "المنتج")}
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-center">
                {t("Qty", "الكمية")}
              </th>
              <th
                className={`px-4 py-3 text-xs font-bold uppercase tracking-widest ${
                  isAr ? "text-left" : "text-right"
                }`}
              >
                {t("Unit Price", "سعر القطعة")}
              </th>
              <th
                className={`px-4 py-3 text-xs font-bold uppercase tracking-widest ${
                  isAr ? "text-left" : "text-right"
                }`}
              >
                {t("Line Total", "الإجمالي")}
              </th>
            </tr>
          </thead>

          <tbody>
            {items.map((it, idx) => {
              const name = it?.product?.name || `#${it.product_id}`;
              return (
                <tr
                  key={it.id}
                  className={`border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 ${
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50/20"
                  }`}
                >
                  <td className="px-4 py-3">
                    <div
                      className={`flex items-center gap-3 ${
                        isAr ? "flex-row-reverse justify-end" : ""
                      }`}
                    >
                      <img
                        src={getItemImage(it)}
                        alt={name}
                        className="h-12 w-12 rounded-lg object-cover border border-slate-100 bg-slate-50"
                        loading="lazy"
                        onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-[#2F2A24] truncate">{name}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex min-w-[44px] justify-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                      {it.quantity}
                    </span>
                  </td>

                  <td
                    className={`px-4 py-3 font-bold text-slate-700 ${
                      isAr ? "text-left" : "text-right"
                    }`}
                  >
                    {money(it.unit_price)}
                  </td>

                  <td
                    className={`px-4 py-3 font-extrabold text-[#3C7A57] ${
                      isAr ? "text-left" : "text-right"
                    }`}
                  >
                    {money(it.line_total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {items.map((it) => {
          const name = it?.product?.name || `#${it.product_id}`;
          return (
            <div key={it.id} className="rounded-xl border border-[#E7DCD0] bg-white p-3">
              <div className={`flex items-center gap-3 ${isAr ? "flex-row-reverse justify-end" : ""}`}>
                <img
                  src={getItemImage(it)}
                  alt={name}
                  className="h-12 w-12 rounded-lg object-cover border border-slate-100 bg-slate-50"
                  loading="lazy"
                  onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[#2F2A24] truncate">{name}</div>
                  <div className="text-[12px] text-slate-400">
                    {t("Qty", "الكمية")}:{" "}
                    <span className="font-bold text-slate-600">{it.quantity}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-slate-50 border border-slate-100 p-2">
                  <div className="text-[11px] font-bold text-slate-500">{t("Unit Price", "سعر القطعة")}</div>
                  <div className="font-bold text-slate-700">{money(it.unit_price)}</div>
                </div>
                <div className="rounded-lg bg-[#EFFFF5] border border-emerald-100 p-2">
                  <div className="text-[11px] font-bold text-emerald-700">{t("Line Total", "الإجمالي")}</div>
                  <div className="font-extrabold text-[#3C7A57]">{money(it.line_total)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB]" dir={isAr ? "rtl" : "ltr"}>
        <Navbar />
        <div className="pt-32 text-center text-[#3C7A57] font-medium animate-pulse">
          {t("Loading...", "جاري التحميل...")}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2F2A24]" dir={isAr ? "rtl" : "ltr"}>
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-6xl px-4">
          {/* Header */}
          <header className="relative mb-8 overflow-hidden rounded-xl border border-[#E7DCD0] bg-[#F7F3F0] p-4 sm:p-6 shadow-sm">
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="h-9 w-9 rounded-full bg-white shadow-sm border border-[#E7DCD0]"
                >
                  <Link to={-1}>
                    <ArrowLeft size={18} className={isAr ? "rotate-180" : ""} />
                  </Link>
                </Button>
                <div className="flex items-center gap-3">
                  <img src="/pethub-logo (2).png" alt="Pet Hub" className="h-10 w-10 object-contain" />
                  <h1 className="text-xl font-bold tracking-tight">{t("My Orders", "طلباتي")}</h1>
                </div>
              </div>

              <Button
                onClick={refetch}
                variant="outline"
                size="sm"
                className="h-9 rounded-full border-[#E7DCD0] bg-white px-4 font-bold transition-transform active:scale-95"
              >
                <RefreshCw size={14} className={isAr ? "ml-2" : "mr-2"} /> {t("Refresh", "تحديث")}
              </Button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-6">
              <div className="sticky top-28 space-y-6">
                <div className="relative">
                  <Search
                    className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isAr ? "right-3" : "left-3"}`}
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder={t("Search Order ID...", "بحث برقم الطلب...")}
                    className={`w-full py-2.5 rounded-lg border border-[#E7DCD0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#3C7A57] ${
                      isAr ? "pr-10 pl-4" : "pl-10 pr-4"
                    }`}
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
                      { id: "all", label: t("All Orders", "كل الطلبات"), icon: <ShoppingBag size={15} /> },
                      { id: "paid", label: t("Paid", "المدفوعة"), icon: <CheckCircle2 size={15} className="text-emerald-500" /> },
                      { id: "unpaid", label: t("Unpaid", "غير المدفوعة"), icon: <Clock size={15} className="text-orange-500" /> },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setFilter(btn.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          filter === btn.id ? "bg-[#3C7A57] text-white shadow-sm" : "text-slate-600 hover:bg-[#FBF7F1]"
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

            {/* Orders List */}
            <div className="lg:col-span-3 space-y-5">
              {!filteredOrders.length ? (
                <div className="rounded-xl border border-dashed border-[#E7DCD0] bg-white/50 py-20 text-center">
                  <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-slate-200" />
                  <p className="text-slate-500 font-medium">
                    {t("No orders match your filter.", "لا توجد طلبات تطابق بحثك.")}
                  </p>
                </div>
              ) : (
                filteredOrders.map((o) => {
                  const itemsCount = (o.items || []).reduce((acc, it) => acc + Number(it.quantity || 0), 0);
                  const isPaid = String(o.payment_status || "").toLowerCase() === "paid";

                  return (
                    <Card
                      key={o.id}
                      ref={(el) => (refs.current[o.id] = el)}
                      className={`overflow-hidden rounded-xl border-[#E7DCD0]/70 bg-white shadow-sm transition-all hover:shadow-md ${
                        highlightId === o.id ? "ring-1 ring-[#3C7A57]" : ""
                      }`}
                    >
                      <CardContent className="p-0">
                        {/* Order header */}
                        <div className="border-b border-[#F1E9E0] bg-[#FBF7F1]/60 p-4 sm:px-6">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="rounded-md bg-[#2F2A24] px-2 py-0.5 text-[12px] font-bold text-white uppercase tracking-tight">
                                #{o.id}
                              </div>
                              <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
                                <Calendar size={13} /> {formatDate(o.created_at, isAr)}
                              </div>
                              <div className="text-[12px] font-bold text-slate-500">
                                {t("Items", "العناصر")}: {itemsCount}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Badge className={`rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase ${statusBadgeClass(o.status)}`}>
                                {o.status}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase ${
                                  isPaid ? "border-emerald-200 text-emerald-600" : "border-orange-200 text-orange-600"
                                }`}
                              >
                                {o.payment_status}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="p-4 sm:p-5">
                          <ItemsTable items={o.items || []} isAr={isAr} t={t} />

                          <div className="mt-5 flex justify-center">
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#E7DCD0] bg-[#FBF7F1] px-5 py-2 text-sm">
                              <span className="text-slate-500 font-medium">
                                {t("Total", "الإجمالي")}
                              </span>
                              <span className="font-medium text-[#3C7A57]">
                                {money(o.total)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
