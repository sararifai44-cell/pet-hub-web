// src/pages/MyBoardingReservationsPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Search, Calendar, ArrowLeft } from "lucide-react";
import { useGetMyBoardingReservationsQuery } from "@/features/boarding/boardingApiSlice";

function useIsArabic() {
  const [isAr, setIsAr] = useState(false);
  React.useEffect(() => {
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
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (s.includes("cancel")) return "bg-red-50 text-red-700 border-red-100";
  return "bg-orange-50 text-orange-700 border-orange-100";
}

export default function MyBoardingReservationsPage() {
  const isAr = useIsArabic();
  const t = (en, ar) => (isAr ? ar : en);
  const location = useLocation();
  const highlightId = location.state?.highlightId;
  const refs = useRef({});

  const [q, setQ] = useState("");
  const { data, isLoading, refetch } = useGetMyBoardingReservationsQuery();

  const rows = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (!query) return true;
      return (
        String(r.id).includes(query) ||
        String(r.status || "").toLowerCase().includes(query)
      );
    });
  }, [rows, q]);

  useEffect(() => {
    if (!highlightId) return;
    const el = refs.current[highlightId];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [highlightId, filtered.length]);

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
          <header className="mb-7 rounded-xl border border-[#E7DCD0] bg-[#F7F3F0] p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Link
                  to={-1}
                  className="h-9 w-9 rounded-full bg-white shadow-sm border border-[#E7DCD0] inline-flex items-center justify-center"
                >
                  <ArrowLeft size={18} className={isAr ? "rotate-180" : ""} />
                </Link>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">
                    {t("My Boarding Reservations", "حجوزاتي المؤقتة")}
                  </h1>
                  <p className="text-[12px] text-slate-500 font-medium">
                    {t("Track your boarding bookings.", "تابع حجوزاتك.")}
                  </p>
                </div>
              </div>

              <Button
                onClick={refetch}
                variant="outline"
                size="sm"
                className="h-9 rounded-full border-[#E7DCD0] bg-white px-4 font-bold active:scale-95"
              >
                <RefreshCw size={14} className={isAr ? "ml-2" : "mr-2"} />{" "}
                {t("Refresh", "تحديث")}
              </Button>
            </div>

            <div className="mt-5 relative">
              <Search
                className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                  isAr ? "right-3" : "left-3"
                }`}
                size={16}
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("Search by id or status...", "ابحث برقم الحجز أو الحالة...")}
                className={`w-full py-2.5 rounded-lg border border-[#E7DCD0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#3C7A57] ${
                  isAr ? "pr-10 pl-4" : "pl-10 pr-4"
                }`}
              />
            </div>
          </header>

          {!filtered.length ? (
            <div className="rounded-xl border border-dashed border-[#E7DCD0] bg-white/50 py-20 text-center">
              <p className="text-slate-500 font-medium">
                {t("No reservations found.", "لا يوجد حجوزات.")}
              </p>
              <Button asChild className="mt-6 rounded-xl bg-[#3C7A57] text-white font-bold">
                <Link to="/boarding">{t("Create Reservation", "إنشاء حجز")}</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map((r) => {
                const servicesCount = Array.isArray(r?.services) ? r.services.length : 0;

                return (
                  <Card
                    key={r.id}
                    ref={(el) => (refs.current[r.id] = el)}
                    className={`rounded-xl border-[#E7DCD0]/70 bg-white shadow-sm hover:shadow-md transition ${
                      highlightId === r.id ? "ring-1 ring-[#3C7A57]" : ""
                    }`}
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-bold text-[#2F2A24] truncate text-lg">#{r.id}</div>
                          <div className="mt-1 flex items-center gap-2 text-[12px] text-slate-500 font-medium">
                            <Calendar size={13} />
                            {formatDateTime(r.start_at, isAr)} — {formatDateTime(r.end_at, isAr)}
                          </div>
                        </div>

                        <Badge
                          className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${statusBadgeClass(
                            r.status
                          )}`}
                        >
                          {r.status || "pending"}
                        </Badge>
                      </div>

                      {/* ✅ mini info row */}
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Badge className="rounded-full border border-[#E7DCD0] bg-white text-[#2F2A24]">
                          {t("Services", "الخدمات")}: {servicesCount}
                        </Badge>

                        <Badge className="rounded-full bg-[#3C7A57]/10 text-[#2F2A24] border border-[#3C7A57]/25">
                          {t("Total", "الإجمالي")}: {money(r.total)}
                        </Badge>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Button
                          asChild
                          className="h-9 rounded-full bg-[#3C7A57] hover:bg-[#336A4C] text-white font-bold"
                        >
                          <Link to={`/my-boarding-reservations/${r.id}`}>
                            {t("View Details", "عرض التفاصيل")}
                          </Link>
                        </Button>
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
