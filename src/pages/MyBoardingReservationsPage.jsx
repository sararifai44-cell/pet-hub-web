// src/pages/MyBoardingReservationsPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Navbar from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { Search, Calendar, ArrowLeft, ChevronDown, BedDouble } from "lucide-react";

import { useGetMyBoardingReservationsQuery } from "@/features/boarding/boardingApiSlice";

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

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

function formatDateTime(dt, isAr) {
  if (!dt) return "";
  try {
    const d = new Date(dt);
    return d.toLocaleString(isAr ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(dt);
  }
}

function statusBadgeClass(status = "") {
  const s = String(status).toLowerCase();
  if (s.includes("approved") || s.includes("confirmed"))
    return "bg-emerald-100 text-emerald-800 border-emerald-300";
  if (s.includes("cancel")) return "bg-red-100 text-red-800 border-red-300";
  return "bg-orange-100 text-orange-800 border-orange-300";
}

const normalizeStatusBucket = (status = "") => {
  const s = String(status).toLowerCase();
  if (s.includes("approved") || s.includes("confirmed")) return "confirmed";
  if (s.includes("cancel")) return "cancelled";
  if (s.includes("pending") || !s) return "pending";
  return "other";
};

// دعم البحث بأرقام عربية (١٢٣) + إنجليزية (123)
const normalizeDigits = (str = "") =>
  String(str).replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));

export default function MyBoardingReservationsPage() {
  const isAr = useIsArabic();
  const t = (en, ar) => (isAr ? ar : en);

  const navigate = useNavigate();
  const location = useLocation();
  const highlightId = location.state?.highlightId;

  const refs = useRef({});
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  const { data, isLoading } = useGetMyBoardingReservationsQuery();

  const rows = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);

  const filtered = useMemo(() => {
    const query = normalizeDigits(q.trim().toLowerCase());

    return rows.filter((r) => {
      const st = String(r.status || "").toLowerCase();
      const bucket = normalizeStatusBucket(st);

      const orderNo = normalizeDigits(String(r.id || "")).toLowerCase();

      const matchesSearch =
        !query || orderNo.includes(query) || st.includes(query);

      const matchesFilter = filter === "all" ? true : bucket === filter;

      return matchesSearch && matchesFilter;
    });
  }, [rows, q, filter]);

  useEffect(() => {
    if (highlightId == null) return;
    const el = refs.current[String(highlightId)];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [highlightId, filtered.length]);

  const filterOptions = [
    { id: "all", label: t("All Status", "كل الحالات") },
    { id: "pending", label: t("Pending", "قيد الانتظار") },
    { id: "confirmed", label: t("Confirmed", "مؤكد") },
    { id: "cancelled", label: t("Cancelled", "ملغي") },
  ];

  const currentFilterLabel =
    filterOptions.find((x) => x.id === filter)?.label || t("Status", "الحالة");

  const triggerClass =
    "h-10 min-w-[150px] rounded-lg border-2 border-[#D1C2B4] bg-white px-3 " +
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
    <div
      className="min-h-screen bg-[#FDFCFB] text-[#2F2A24]"
      dir={isAr ? "rtl" : "ltr"}
    >
      <Navbar />

      <main className="pt-8 pb-12 px-4 md:px-6">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <header className="relative bg-[#387365] p-6 md:p-10 rounded-xl shadow-md flex flex-col md:flex-row md:items-center justify-between overflow-hidden mb-8 border-b-4 border-[#2d5c51]">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <BedDouble className="w-64 h-64 text-white" />
            </div>

            <div className="z-10">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[#a8d5cb] font-semibold hover:text-white transition-colors w-fit group text-xs mb-3"
              >
                <ArrowLeft
                  className={`w-3.5 h-3.5 transition-transform ${
                    isAr
                      ? "rotate-180 group-hover:translate-x-1"
                      : "group-hover:-translate-x-1"
                  }`}
                />
                <span>{t("Back", "الرجوع")}</span>
              </button>

              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {t("Boarding Reservations", "حجوزات الإيواء")}
              </h1>

              <p className="text-[#a8d5cb] text-sm mt-1 font-medium">
                {rows.length > 0
                  ? t(
                      `Track and manage your ${rows.length} reservations`,
                      `تابع وتحكم في حجوزاتك وعددها ${rows.length}`
                    )
                  : t("No reservations yet", "لا يوجد حجوزات بعد")}
              </p>
            </div>

            {/* شلنا زر الريفرش */}
            <div className="flex items-center gap-4 z-10 mt-4 md:mt-0">
              <div className="hidden lg:flex -space-x-3">
                {headerPets.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-xl object-cover"
                    alt="pet"
                  />
                ))}
              </div>
            </div>
          </header>

          {/* Search + Filter */}
          <div className="mb-6 flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search
                className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                  isAr ? "right-3" : "left-3"
                }`}
                size={16}
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t(
                  "Search by order number or status...",
                  "ابحث برقم الطلب أو الحالة..."
                )}
                className={`h-10 w-full rounded-lg border-2 border-[#D1C2B4] bg-white text-sm font-medium text-[#2F2A24] shadow-sm outline-none focus:border-[#387365] focus:ring-2 focus:ring-[#387365]/10 transition-all ${
                  isAr ? "pr-10 pl-4" : "pl-10 pr-4"
                }`}
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger className={triggerClass}>
                  <span className="truncate">{currentFilterLabel}</span>
                  <ChevronDown size={14} className="opacity-50" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align={isAr ? "right" : "left"}
                  className="rounded-lg border-2 border-[#D1C2B4] bg-white shadow-xl p-1 min-w-[150px]"
                >
                  {filterOptions.map((opt) => (
                    <DropdownMenuItem
                      key={opt.id}
                      onClick={() => setFilter(opt.id)}
                      className={`rounded-md text-sm font-medium text-[#2F2A24] cursor-pointer px-3 py-2 focus:bg-[#387365]/10 outline-none ${
                        filter === opt.id ? "bg-[#387365]/10" : ""
                      }`}
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Empty / Cards */}
          {!filtered.length ? (
            <div className="rounded-xl border-2 border-dashed border-[#D1C2B4] bg-white/50 py-20 text-center">
              <BedDouble className="mx-auto mb-3 h-12 w-12 text-slate-200" />
              <p className="text-sm text-slate-400 font-medium italic">
                {t(
                  "No reservations found matching your criteria.",
                  "لم يتم العثور على حجوزات تطابق بحثك."
                )}
              </p>

              <Button
                asChild
                className="mt-6 h-10 px-6 rounded-lg bg-[#387365] hover:bg-[#2d5c51] text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <Link to="/boarding">{t("Create Reservation", "إنشاء حجز")}</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((r) => {
                const isHighlighted =
                  highlightId != null && String(highlightId) === String(r.id);

                return (
                  <Card
                    key={r.id}
                    ref={(el) => (refs.current[String(r.id)] = el)}
                    className={`rounded-xl bg-[#F2EDE7] shadow-sm border-2 border-[#D1C2B4] overflow-hidden hover:border-[#387365] hover:shadow-md hover:-translate-y-1 transition-all duration-300 group ${
                      isHighlighted ? "ring-2 ring-[#387365]/40" : ""
                    }`}
                  >
                    <CardContent className="p-5">
                      <div
                        className={`flex flex-col gap-4 ${
                          isAr ? "text-right" : "text-left"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            {/* بدل #id صار رقم الطلب */}
                            <div className="font-bold text-[#2F2A24] truncate text-lg group-hover:text-[#387365] transition-colors">
                              {t("Order No.", "رقم الطلب")}: {r.id}
                            </div>

                            <div className="mt-1 flex items-center gap-1.5 text-xs text-[#5C554E] font-bold">
                              <Calendar size={13} className="text-[#387365]" />
                              <span className="truncate">
                                {formatDateTime(r.start_at, isAr)} —{" "}
                                {formatDateTime(r.end_at, isAr)}
                              </span>
                            </div>
                          </div>

                          <Badge
                            className={`rounded-full border-2 px-3 py-1 text-[10px] font-bold uppercase shrink-0 shadow-sm ${statusBadgeClass(
                              r.status
                            )}`}
                          >
                            {r.status || "pending"}
                          </Badge>
                        </div>

                        {/* شلنا بادج الخدمات */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="rounded-full border-2 border-[#387365]/25 bg-[#387365]/10 text-[#2F2A24] text-[11px] font-bold">
                            {t("Total", "الإجمالي")}: {money(r.total)}
                          </Badge>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            asChild
                            size="sm"
                            className="h-9 px-5 rounded-lg bg-[#387365] hover:bg-[#2d5c51] text-white font-bold text-xs shadow-md transition-all active:scale-95"
                          >
                            <Link to={`/my-boarding-reservations/${r.id}`}>
                              {t("View Details", "التفاصيل")}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
