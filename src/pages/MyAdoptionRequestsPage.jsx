import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const headerPets = ["/cat.jpg", "/bird.jpg", "/h3-cat-pet-container.jpg"];

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
  if (s.includes("approved")) return "bg-emerald-100 text-emerald-800 border-emerald-300";
  if (s.includes("rejected")) return "bg-red-100 text-red-800 border-red-300";
  return "bg-orange-100 text-orange-800 border-orange-300";
}

export default function MyAdoptionRequestsPage() {
  const isAr = useIsArabic();
  const navigate = useNavigate();
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
    "h-10 min-w-[150px] rounded-lg border border-[#D1C2B4] bg-white px-3 " +
    "text-[12px] font-semibold text-[#2F2A24] shadow-sm flex items-center justify-between " +
    "hover:bg-[#FBF7F1] focus:outline-none transition-all";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB]" dir={isAr ? "rtl" : "ltr"}>
        <Navbar />
        <div className="pt-32 text-center text-[#387365] font-medium animate-pulse">
          {t("Loading...", "جاري التحميل...")}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2F2A24]" dir={isAr ? "rtl" : "ltr"}>
      <Navbar />

      <main className="pt-8 pb-12 px-4 md:px-6">
        <div className="mx-auto max-w-6xl">
          
          {/* Header Section */}
          <header className="relative bg-[#387365] p-6 md:p-10 rounded-xl shadow-md flex flex-col md:flex-row md:items-center justify-between overflow-hidden mb-8 border-b-4 border-[#2d5c51]">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <HeartHandshake className="w-64 h-64 text-white" />
            </div>
            
            <div className="z-10">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#a8d5cb] font-semibold hover:text-white transition-colors w-fit group text-xs mb-3">
                <ArrowLeft className={`w-3.5 h-3.5 transition-transform ${isAr ? "rotate-180 group-hover:translate-x-1" : "group-hover:-translate-x-1"}`} />
                <span>{t("Back", "الرجوع")}</span>
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{t("Adoption Requests", "طلبات التبني")}</h1>
              <p className="text-[#a8d5cb] text-sm mt-1 font-medium">
                {apps.length > 0 
                  ? t(`Manage and track your ${apps.length} adoption applications`, `تابعي وتحكمي في طلبات التبني الـ ${apps.length} الخاصة بكِ`)
                  : t("No adoption requests yet", "لا توجد طلبات تبني بعد")
                }
              </p>
            </div>

            <div className="flex items-center gap-4 z-10 mt-4 md:mt-0">
               <Button onClick={refetch} variant="outline" size="sm" className="h-10 rounded-lg border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white font-bold transition-all">
                <RefreshCw size={14} className={isAr ? "ml-2" : "mr-2"} /> {t("Refresh", "تحديث")}
              </Button>
              <div className="hidden lg:flex -space-x-3">
                {headerPets.map((url, i) => (
                  <img key={i} src={url} className="w-12 h-12 rounded-full border-2 border-white shadow-xl object-cover" alt="pet" />
                ))}
              </div>
            </div>
          </header>

          {/* Search and Filters */}
          <div className="mb-6 flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isAr ? "right-3" : "left-3"}`} size={16} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("Search by pet name...", "ابحثي باسم الأليف...")}
                className={`h-10 w-full rounded-lg border-2 border-[#D1C2B4] bg-white text-sm font-medium text-[#2F2A24] shadow-sm outline-none focus:border-[#387365] focus:ring-2 focus:ring-[#387365]/10 transition-all ${isAr ? "pr-10 pl-4" : "pl-10 pr-4"}`}
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger className={triggerClass}>
                  <span className="truncate">{currentFilterLabel}</span>
                  <ChevronDown size={14} className="opacity-50" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isAr ? "right" : "left"} className="rounded-lg border-2 border-[#D1C2B4] bg-white shadow-xl p-1 min-w-[150px]">
                  {filterOptions.map((opt) => (
                    <DropdownMenuItem
                      key={opt.id}
                      onClick={() => setFilter(opt.id)}
                      className={`rounded-md text-sm font-medium text-[#2F2A24] cursor-pointer px-3 py-2 focus:bg-[#387365]/10 outline-none ${filter === opt.id ? "bg-[#387365]/10" : ""}`}
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* ✅ The Final Card Design: Darker Border & Defined Background */}
          {!filtered.length ? (
            <div className="rounded-xl border-2 border-dashed border-[#D1C2B4] bg-white/50 py-20 text-center">
              <HeartHandshake className="mx-auto mb-3 h-12 w-12 text-slate-200" />
              <p className="text-sm text-slate-400 font-medium italic">
                {t("No requests found matching your criteria.", "لم يتم العثور على طلبات تطابق بحثك.")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((a) => (
                <Card 
                  key={a.id} 
                  className="rounded-xl bg-[#F2EDE7] shadow-sm border-2 border-[#D1C2B4] overflow-hidden hover:border-[#387365] hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
                >
                  <CardContent className="p-5">
                    <div className={`flex gap-5 ${isAr ? "flex-row-reverse text-right" : "text-left"}`}>
                      <img
                        src={getPetImage(a)}
                        alt=""
                        className="h-24 w-24 rounded-xl object-cover bg-white border-2 border-[#D1C2B4]/30 shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                      />

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-bold text-[#2F2A24] truncate text-lg group-hover:text-[#387365] transition-colors">
                              {a?.pet?.name || `#${a.pet_id}`}
                            </h3>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-[#5C554E] font-bold">
                              <Calendar size={13} className="text-[#387365]" />
                              {formatDate(a.created_at, isAr)}
                            </div>
                          </div>
                          <Badge className={`rounded-full border-2 px-3 py-1 text-[10px] font-bold uppercase shrink-0 shadow-sm ${statusBadgeClass(a.status)}`}>
                            {a.status}
                          </Badge>
                        </div>

                        <div className="mt-4 flex justify-end">
                          <Button asChild size="sm" className="h-9 px-5 rounded-lg bg-[#387365] hover:bg-[#2d5c51] text-white font-bold text-xs shadow-md transition-all active:scale-95">
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