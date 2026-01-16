import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import {
  ShoppingBag,
  Sparkles, // الأيقونة الصفراء الجديدة
  ArrowLeft,
  Filter,
  CheckCircle2,
  Clock,
  Package,
  XCircle,
  Info,
  Receipt 
} from "lucide-react";
import { useGetMyOrdersQuery } from "@/features/orders/ordersApiSlice";

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
  if (s.includes("pending")) return "bg-orange-50 text-orange-600 border-orange-200";
  if (s.includes("completed") || s.includes("delivered"))
    return "bg-emerald-50 text-emerald-600 border-emerald-200";
  if (s.includes("cancel")) return "bg-red-50 text-red-600 border-red-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const normalizeUrl = (u) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `${API_ORIGIN}${u.startsWith("/") ? "" : "/"}${u}`;
};

const getItemImage = (it) => {
  const p = it?.product || {};
  const img = p?.cover_image || p?.image || p?.images?.[0]?.url;
  return img ? normalizeUrl(img) : "/placeholder.png";
};

function ItemsTable({ items = [], isAr, t }) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed border-[#6d4c41]/20 bg-white/60 p-6 text-center text-slate-500">
        {t("No items in this order.", "لا يوجد عناصر ضمن هذا الطلب.")}
      </div>
    );
  }
  return (
    <div className="mt-4">
      <div className="hidden sm:block overflow-x-auto rounded-lg border border-[#6d4c41]/30 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#FBF7F1] text-[#6d4c41]">
            <tr className="border-b border-[#6d4c41]/20">
              <th className={`px-4 py-3 text-xs font-bold uppercase tracking-widest ${isAr ? "text-right" : "text-left"}`}>{t("Product", "المنتج")}</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-center">{t("Qty", "الكمية")}</th>
              <th className={`px-4 py-3 text-xs font-bold uppercase tracking-widest ${isAr ? "text-left" : "text-right"}`}>{t("Unit Price", "السعر")}</th>
              <th className={`px-4 py-3 text-xs font-bold uppercase tracking-widest ${isAr ? "text-left" : "text-right"}`}>{t("Total", "الإجمالي")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={it.id} className={`border-b border-slate-100 last:border-b-0 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/20"}`}>
                <td className="px-4 py-3">
                  <div className={`flex items-center gap-3 ${isAr ? "flex-row-reverse justify-end" : ""}`}>
                    <img src={getItemImage(it)} className="h-10 w-10 rounded object-cover border border-slate-100" />
                    <span className="font-bold text-[#6d4c41]">{it?.product?.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center font-bold text-slate-700">{it.quantity}</td>
                <td className={`px-4 py-3 text-slate-600 ${isAr ? "text-left" : "text-right"}`}>{money(it.unit_price)}</td>
                <td className={`px-4 py-3 font-extrabold text-[#387365] ${isAr ? "text-left" : "text-right"}`}>{money(it.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const isAr = useIsArabic();
  const t = (en, ar) => (isAr ? ar : en);
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const { data, isLoading } = useGetMyOrdersQuery();
  const rawOrders = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);

  const filteredOrders = useMemo(() => {
    return rawOrders.filter((o) => {
      const isPaid = String(o.payment_status || "").toLowerCase() === "paid";
      if (filter === "paid") return isPaid;
      if (filter === "unpaid") return !isPaid;
      return true;
    });
  }, [rawOrders, filter]);

  if (isLoading) return <div className="min-h-screen bg-[#FDFCFB]" />;

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#6d4c41]" dir={isAr ? "rtl" : "ltr"}>
      <Navbar />
      <main className="pt-8 pb-20 px-4 md:px-6">
        <div className="mx-auto max-w-6xl">
          <header className="relative bg-[#387365] p-6 md:p-10 rounded-xl shadow-md flex flex-col md:flex-row md:items-center justify-between overflow-hidden mb-8 border-b-4 border-[#2d5c51]">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <Package className="w-64 h-64 text-white" />
            </div>
            <div className="z-10">
              <button onClick={() => navigate("/shop")} className="flex items-center gap-2 text-[#a8d5cb] font-semibold hover:text-white transition-colors w-fit text-xs mb-3">
                <ArrowLeft className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
                <span>{t("Back to Shop", "العودة للمتجر")}</span>
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{t("Order History", "سجل الطلبات")}</h1>
              <p className="text-[#a8d5cb] text-sm mt-2 max-w-md font-medium opacity-90">
                {t("Review your past purchases, track active shipments, and manage your order details in one place.", 
                   "راجع مشترياتك السابقة، تتبع شحناتك الحالية، وقم بإدارة تفاصيل طلباتك في مكان واحد.")}
              </p>
            </div>
            <div className="hidden lg:flex -space-x-3 z-10">
              {headerPets.map((url, i) => (
                <img key={i} src={url} className="w-12 h-12 rounded-full border-2 border-white shadow-xl object-cover" />
              ))}
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1 space-y-6">
              <div className="sticky top-28 space-y-4">
                {/* تم تعديل البوردر هنا ليطابق الكارد الرئيسي */}
                <div className="rounded-lg border-2 border-[#6d4c41]/40 bg-white p-2 shadow-sm">
                  <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6d4c41]/50 flex items-center gap-2">
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
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${filter === btn.id ? "bg-[#387365] text-white shadow-sm" : "text-[#6d4c41] hover:bg-[#FBF7F1]"}`}
                      >
                        {btn.icon}
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* تم تعديل البوردر هنا أيضاً */}
                <div className="rounded-lg border-2 border-[#6d4c41]/40 bg-white p-4 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#6d4c41]/50 flex items-center gap-2 mb-3">
                    <Info size={12} /> {t("Status Guide", "تعرفة الحالات")}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-orange-500" />
                      <span className="text-xs font-bold text-[#6d4c41]">{t("Pending: Processing", "قيد الانتظار: يتم التجهيز")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span className="text-xs font-bold text-[#6d4c41]">{t("Completed: Delivered", "مكتمل: تم التسليم")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle size={14} className="text-red-500" />
                      <span className="text-xs font-bold text-[#6d4c41]">{t("Canceled: Voided", "ملغي: تم الإلغاء")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <div className="lg:col-span-3 space-y-8">
              {filteredOrders.map((o) => (
                <Card key={o.id} className="overflow-hidden rounded-xl border-2 border-[#6d4c41]/40 bg-white shadow-md hover:border-[#6d4c41]/70 transition-all">
                  <CardContent className="p-0">
                    <div className="border-b-2 border-white/10 bg-[#6d4c41] p-4 sm:px-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                         
                          <div className="flex items-center gap-1.5 text-[12px] font-bold text-white">
                            {/* تم حذف الأيقونات السابقة وإضافة الأيقونة الصفراء الهادئة */}
<ShoppingCartIcon sx={{ fontSize: 14, color: '#EAB308', opacity: 0.8, mr: 0.5 }} />                            {formatDate(o.created_at, isAr)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={`rounded-full border-2 px-3 py-1 text-[10px] font-bold uppercase shadow-sm ${statusBadgeClass(o.status)}`}>{o.status}</Badge>
                          <Badge variant="outline" className={`rounded-full border-2 px-3 py-1 text-[10px] font-bold uppercase shadow-sm ${o.payment_status === 'paid' ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-orange-200 bg-orange-50 text-orange-700"}`}>{o.payment_status}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5">
                      <ItemsTable items={o.items || []} isAr={isAr} t={t} />
                      <div className="mt-6 flex justify-center">
                        <div className="inline-flex items-center gap-3 rounded-full border-2 border-[#6d4c41]/20 bg-[#FBF9F6] px-6 py-2 text-sm shadow-sm transition-transform hover:scale-105">
                          <span className="text-[#6d4c41]/60 font-bold text-[11px] uppercase tracking-wider">{t("Total", "الإجمالي")}</span>
                          <span className="font-extrabold text-[#387365] text-lg leading-none">{money(o.total)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}