import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, HeartHandshake } from "lucide-react";
import { useGetMyAdoptionApplicationByIdQuery } from "@/features/adoptionApplications/adoptionApplicationsApiSlice";

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
const SERVER_ORIGIN =
  RAW_API_URL.replace(/\/api\/?$/i, "").replace(/\/+$/, "") || "http://127.0.0.1:8000";

const normalizeUrl = (u) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `${SERVER_ORIGIN}${u.startsWith("/") ? "" : "/"}${u}`;
};

function statusBadgeClass(status = "") {
  const s = String(status).toLowerCase();
  if (s.includes("approved")) return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (s.includes("rejected")) return "bg-red-50 text-red-700 border-red-100";
  return "bg-orange-50 text-orange-700 border-orange-100";
}

export default function AdoptionRequestDetailsPage() {
  const isAr = useIsArabic();
  const t = (en, ar) => (isAr ? ar : en);
  const { id } = useParams();

  const { data, isLoading } = useGetMyAdoptionApplicationByIdQuery(id);
  const a = data; // بسبب transformResponse -> pickSingle
  const pet = a?.pet;

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

  if (!a) {
    return (
      <div className="min-h-screen bg-[#FDFCFB]" dir={isAr ? "rtl" : "ltr"}>
        <Navbar />
        <div className="pt-32 text-center text-slate-500 font-medium">
          {t("Request not found.", "الطلب غير موجود.")}
        </div>
      </div>
    );
  }

  const img = pet?.cover_image ? normalizeUrl(pet.cover_image) : "/placeholder.png";

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2F2A24]" dir={isAr ? "rtl" : "ltr"}>
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-5xl px-4">
          {/* Header */}
          <header className="mb-7 rounded-xl border border-[#E7DCD0] bg-[#F7F3F0] p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Link
                  to={-1}
                  className="h-9 w-9 rounded-full bg-white shadow-sm border border-[#E7DCD0] inline-flex items-center justify-center"
                >
                  <ArrowLeft size={18} className={isAr ? "rotate-180" : ""} />
                </Link>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white border border-[#E7DCD0] flex items-center justify-center">
                    <HeartHandshake className="h-5 w-5 text-[#3C7A57]" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight">
                      {t("Adoption Request Details", "تفاصيل طلب التبني")}
                    </h1>
                    <p className="text-[12px] text-slate-500 font-medium">
                      {t("Request ID", "رقم الطلب")}: #{a.id}
                    </p>
                  </div>
                </div>
              </div>

              <Badge className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${statusBadgeClass(a.status)}`}>
                {a.status}
              </Badge>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pet card */}
            <Card className="rounded-xl border-[#E7DCD0]/70 bg-white shadow-sm lg:col-span-2">
              <CardContent className="p-5">
                <div className={`flex gap-4 ${isAr ? "flex-row-reverse" : ""}`}>
                  <img
                    src={img}
                    alt={pet?.name || "Pet"}
                    className="h-28 w-28 rounded-2xl object-cover border border-slate-100 bg-slate-50"
                    loading="lazy"
                    onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="text-2xl font-bold truncate">{pet?.name || "-"}</div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline" className="rounded-full text-[10px] font-bold uppercase">
                        {t("Gender", "الجنس")}: {pet?.gender || "-"}
                      </Badge>
                      <Badge variant="outline" className="rounded-full text-[10px] font-bold uppercase">
                        {t("Birth", "تاريخ الميلاد")}: {pet?.date_of_birth || "-"}
                      </Badge>
                    </div>

                    <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                      {pet?.description || "-"}
                    </p>

                    <div className="mt-5">
                      <Button asChild variant="outline" className="rounded-full border-[#E7DCD0] bg-white">
                        <Link to={`/pets/${pet?.id}`}>{t("Open Pet", "فتح صفحة الحيوان")}</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Request info */}
            <Card className="rounded-xl border-[#E7DCD0]/70 bg-white shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {t("Applied At", "تاريخ التقديم")}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Calendar size={14} />
                    {formatDate(a.created_at, isAr)}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {t("Last Update", "آخر تحديث")}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-700">
                    {formatDate(a.updated_at, isAr)}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {t("Motivation", "سبب التبني")}
                  </div>
                  <div className="mt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {a.motivation || "-"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
