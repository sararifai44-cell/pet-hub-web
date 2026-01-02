import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Search, Calendar, ArrowLeft, HeartHandshake, ChevronDown } from "lucide-react";
import { useGetMyAdoptionApplicationsQuery } from "@/features/adoptionApplications/adoptionApplicationsApiSlice";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function useIsArabic() {
  const [isAr, setIsAr] = useState(false);
  useEffect(() => {
    const lang = (navigator.language || "").toLowerCase();
    setIsAr(lang.startsWith("ar"));
  }, []);
  return isAr;
}

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

const RAW_API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/";
const SERVER_ORIGIN = RAW_API_URL.replace(/\/api\/?$/i, "").replace(/\/+$/, "") || "http://127.0.0.1:8000";

const normalizeUrl = (u) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `${SERVER_ORIGIN}${u.startsWith("/") ? "" : "/"}${u}`;
};

const getPetImage = (app) => {
  const img = app?.pet?.cover_image;
  return img ? normalizeUrl(img) : "/placeholder.png";
};

function statusBadgeClass(status = "") {
  const s = String(status).toLowerCase();
  if (s.includes("approved")) return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (s.includes("rejected")) return "bg-red-50 text-red-700 border-red-100";
  return "bg-orange-50 text-orange-700 border-orange-100";
}

export default function MyAdoptionRequestsPage() {
  const isAr = useIsArabic();
  const t = (en, ar) => (isAr ? ar : en);

  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  const { data, isLoading, refetch } = useGetMyAdoptionApplicationsQuery();
  const apps = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return apps.filter((a) => {
      const status = String(a.status || "").toLowerCase();
      const petName = String(a?.pet?.name || "").toLowerCase();
      const matchesSearch = !query || petName.includes(query) || String(a.id).includes(query);
      const matchesFilter = filter === "all" ? true : status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [apps, q, filter]);

  const filterOptions = [
    { id: "all", label: t("All Status", "كل الحالات") },
    { id: "pending", label: t("Pending", "قيد الانتظار") },
    { id: "approved", label: t("Approved", "مقبول") },
    { id: "rejected", label: t("Rejected", "مرفوض") },
  ];

  const currentFilterLabel = filterOptions.find((x) => x.id === filter)?.label || t("Status", "الحالة");

  const triggerClass =
    "h-10 min-w-[150px] rounded-md border border-[#E7DCD0] bg-white px-3 " +
    "text-[12px] font-semibold text-[#2F2A24] shadow-sm flex items-center justify-between " +
    "hover:bg-[#FBF7F1] focus:outline-none transition-all";

  const contentClass = "rounded-md border border-[#E7DCD0] bg-white shadow-[0_18px_40px_rgba(0,0,0,0.10)] p-1 min-w-[150px]";

  const itemClass = "rounded-sm text-[12px] font-medium text-[#2F2A24] cursor-pointer px-3 py-2 " +
    "focus:bg-[#3C7A57]/10 focus:text-[#2F2A24] outline-none transition-colors";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB]" dir={isAr ? "rtl" : "ltr"}>
        <Navbar />
        <div className="pt-24 text-center text-[#3C7A57] font-medium animate-pulse">
          {t("Loading...", "جاري التحميل...")}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2F2A24]" dir={isAr ? "rtl" : "ltr"}>
      <Navbar />

      {/* تقليل pt-16 لرفع كل شيء للأعلى */}
      <main className="pt-16 pb-12">
        <div className="mx-auto max-w-6xl px-4">
          
          {/* Back Button - تقليل الهامش mb-2 */}
          <div className="mb-2 flex items-center">
            <Link
              to={-1}
              className="group flex items-center gap-2 text-sm font-semibold text-[#8C8276] hover:text-[#3C7A57] transition-colors"
            >
              <div className="h-7 w-7 rounded-full bg-white border border-[#E7DCD0] inline-flex items-center justify-center group-hover:border-[#3C7A57]/30 group-hover:bg-[#3C7A57]/5 shadow-sm">
                <ArrowLeft size={14} className={isAr ? "rotate-180" : ""} />
              </div>
              <span className="text-[13px]">{t("Back", "الرجوع")}</span>
            </Link>
          </div>

          {/* Header - تقليل mb-4 و p-5 */}
          <header className="mb-4 rounded-xl border border-[#E7DCD0] bg-[#F7F3F0] p-5 shadow-sm">
            <div className="flex flex-col gap-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-9 w-9 rounded-xl bg-[#3C7A57]/10 flex items-center justify-center shrink-0">
                    <HeartHandshake className="h-5 w-5 text-[#3C7A57]" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold tracking-tight text-[#2F2A24]">
                      {t("My Adoption Requests", "طلبات التبني الخاصة بي")}
                    </h1>
                    <p className="text-[12px] text-slate-500 font-medium">
                      {t("Follow up and track your submitted applications easily.", "تابعي حالة طلبات التبني الخاصة بكِ بكل سهولة.")}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={refetch}
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-md border-[#E7DCD0] bg-white px-3 text-[11px] font-bold text-[#3C7A57] hover:bg-[#FBF7F1] self-end sm:self-center shadow-sm"
                >
                  <RefreshCw size={12} className={isAr ? "ml-2" : "mr-2"} /> {t("Refresh", "تحديث")}
                </Button>
              </div>

              <div className={`flex flex-col md:flex-row gap-3 items-center ${isAr ? 'md:flex-row-reverse' : ''}`}>
                <div className="relative flex-1 w-full">
                  <Search
                    className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isAr ? "right-3" : "left-3"}`}
                    size={14}
                  />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={t("Search by pet name...", "ابحثي باسم الأليف...")}
                    className="h-9 w-full rounded-md border border-[#E7DCD0] bg-white text-[12px] font-medium text-[#2F2A24] shadow-sm outline-none focus:border-[#3C7A57]/50 focus:ring-2 focus:ring-[#3C7A57]/10 transition-all"
                    style={{ paddingLeft: isAr ? '12px' : '32px', paddingRight: isAr ? '32px' : '12px' }}
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger className={`${triggerClass} h-9`}>
                      <span className="truncate">{currentFilterLabel}</span>
                      <ChevronDown size={14} className="opacity-50" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isAr ? "right" : "left"} className={contentClass}>
                      {filterOptions.map((opt) => (
                        <DropdownMenuItem
                          key={opt.id}
                          onClick={() => setFilter(opt.id)}
                          className={`${itemClass} ${filter === opt.id ? "bg-[#3C7A57]/10" : ""}`}
                        >
                          {opt.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {(filter !== "all" || q !== "") && (
                    <Button
                      variant="ghost"
                      onClick={() => { setFilter("all"); setQ(""); }}
                      className="h-9 px-2 text-[11px] font-semibold text-[#8C8276] hover:text-[#2F2A24]"
                    >
                      {t("Reset", "مسح")}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Cards List */}
          {!filtered.length ? (
            <div className="rounded-xl border border-dashed border-[#E7DCD0] bg-white/50 py-16 text-center">
              <HeartHandshake className="mx-auto mb-3 h-10 w-10 text-slate-200" />
              <p className="text-[13px] text-slate-400 font-medium italic">
                {t("No requests found matching your criteria.", "لم يتم العثور على طلبات تطابق بحثك.")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((a) => (
                <Card
                  key={a.id}
                  className="rounded-xl bg-white shadow-sm border-none overflow-hidden"
                >
                  <CardContent className="p-4">
                    <div className={`flex gap-4 ${isAr ? "flex-row-reverse" : ""}`}>
                      <img
                        src={getPetImage(a)}
                        alt=""
                        className="h-20 w-20 rounded-xl object-cover bg-slate-50 border border-slate-100 shrink-0"
                        onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                      />

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-bold text-[#2F2A24] truncate text-base">
                              {a?.pet?.name || `#${a.pet_id}`}
                            </h3>
                            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                              <Calendar size={12} className="text-[#3C7A57]" />
                              {formatDate(a.created_at, isAr)}
                            </div>
                          </div>
                          <Badge className={`rounded-full border-none px-2 py-0.5 text-[9px] font-bold uppercase shrink-0 ${statusBadgeClass(a.status)}`}>
                            {a.status}
                          </Badge>
                        </div>

                        <div className="mt-3 flex justify-end">
                          <Button asChild size="sm" className="h-8 px-4 rounded-lg bg-[#3C7A57] hover:bg-[#336A4C] text-white font-bold text-[11px] shadow-sm">
                            <Link to={`/adoption-requests/${a.id}`}>
                              {t("View Details", "التفاصيل")}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}