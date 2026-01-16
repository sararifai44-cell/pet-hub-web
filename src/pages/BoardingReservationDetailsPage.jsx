// src/pages/BoardingReservationDetailsPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, XCircle, BedDouble } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  useCancelBoardingReservationMutation,
  useGetMyBoardingReservationQuery,
} from "@/features/boarding/boardingApiSlice";

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
    return "bg-emerald-100 text-emerald-900 border-emerald-300";
  if (s.includes("cancel")) return "bg-red-100 text-red-900 border-red-300";
  return "bg-orange-100 text-orange-900 border-orange-300";
}

const serviceLabel = (s, isAr) => {
  if (isAr) return s?.name_ar || s?.name_en || s?.name || `#${s?.id}`;
  return s?.name_en || s?.name || s?.name_ar || `#${s?.id}`;
};

export default function BoardingReservationDetailsPage() {
  const isAr = useIsArabic();
  const t = (en, ar) => (isAr ? ar : en);
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useGetMyBoardingReservationQuery(id);
  const [cancelReservation, { isLoading: canceling }] =
    useCancelBoardingReservationMutation();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const r = data || {};
  const services = Array.isArray(r?.services) ? r.services : [];
  const canCancel = !String(r?.status || "").toLowerCase().includes("cancel");

  const onCancel = async () => {
    try {
      await cancelReservation(id).unwrap();
      toast.success(t("Reservation cancelled", "تم إلغاء الحجز"));
      setConfirmOpen(false);
      refetch();
    } catch {
      toast.error(t("Failed to cancel", "فشل الإلغاء"));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F3F0]" dir={isAr ? "rtl" : "ltr"}>
        <Navbar />
        <div className="pt-32 text-center text-[#387365] font-medium animate-pulse">
          {t("Loading...", "جاري التحميل...")}
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-[#2F2A24] bg-[#F7F3F0]"
      dir={isAr ? "rtl" : "ltr"}
    >
      <Navbar />

      {/* خلفية خفيفة لتطلع أفخم */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(56,115,101,0.10),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(90,62,43,0.10),transparent_55%)]" />

      <main className="pt-8 pb-12 px-4 md:px-6">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <header className="relative bg-[#387365] p-6 md:p-9 rounded-xl shadow-md overflow-hidden mb-8 border-b-4 border-[#2d5c51]">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <BedDouble className="w-64 h-64 text-white" />
            </div>

            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
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
                  {t("Reservation Details", "تفاصيل الحجز")}
                  <span className="text-[#F2EDE7]"> — </span>
                  <span className="text-[#F2EDE7]">
                    {t("Order No.", "رقم الطلب")}: {r?.id ?? id}
                  </span>
                </h1>

                <div className="mt-2 flex items-center gap-2 text-[12px] text-[#E7DCD0] font-semibold">
                  <Calendar size={13} />
                  {formatDateTime(r?.created_at, isAr)}
                </div>
              </div>

              {/* صور الهيدر */}
              <div className="flex items-center gap-4 mt-2 sm:mt-0">
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
            </div>
          </header>

          {/* Content Card */}
          <Card className="rounded-xl bg-[#F2EDE7] border-2 border-[#D1C2B4] shadow-sm overflow-hidden">
            <CardContent className="p-5">
              {/* ✅ Status صغير ومرتب (مو عريض) */}
              <div
                className={`mb-3 flex items-center gap-2 ${
                  isAr ? "justify-start" : "justify-end"
                }`}
              >
                <span className="text-[11px] font-extrabold text-[#5A3E2B]">
                  {t("Status", "الحالة")}:
                </span>
                <Badge
                  className={`rounded-full border-2 px-3 py-1 text-[10px] font-bold uppercase shadow-sm ${statusBadgeClass(
                    r.status
                  )}`}
                >
                  {r?.status || "pending"}
                </Badge>
              </div>

              {/* Top fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border-2 border-[#D1C2B4] bg-white/60 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#7A6F66] mb-1">
                    {t("Start", "البداية")}
                  </div>
                  <div className="text-sm font-bold text-[#2F2A24]">
                    {formatDateTime(r?.start_at, isAr) || "—"}
                  </div>
                </div>

                <div className="rounded-xl border-2 border-[#D1C2B4] bg-white/60 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#7A6F66] mb-1">
                    {t("End", "النهاية")}
                  </div>
                  <div className="text-sm font-bold text-[#2F2A24]">
                    {formatDateTime(r?.end_at, isAr) || "—"}
                  </div>
                </div>

                <div className="rounded-xl border-2 border-[#D1C2B4] bg-white/60 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#7A6F66] mb-1">
                    {t("Billable Hours", "الساعات المحتسبة")}
                  </div>
                  <div className="text-sm font-bold text-[#2F2A24]">
                    {r?.billable_hours ?? "—"}
                  </div>
                </div>

                <div className="rounded-xl border-2 border-[#D1C2B4] bg-white/60 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#7A6F66] mb-1">
                    {t("Total", "الإجمالي")}
                  </div>
                  <div className="text-sm font-extrabold text-[#5A3E2B]">
                    {r?.total != null ? money(r.total) : "—"}
                  </div>
                </div>
              </div>

              <Separator className="my-5 bg-[#D1C2B4]" />

              {/* Services */}
              <div className="text-sm font-extrabold text-[#5A3E2B] mb-3 text-center">
                {t("Services", "الخدمات")}
              </div>

              {!services.length ? (
                <div className="text-sm text-[#7A6F66] text-center">
                  {t("No services.", "لا يوجد خدمات.")}
                </div>
              ) : (
                <div className="space-y-2">
                  {services.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-xl border-2 border-[#D1C2B4] bg-white/60 px-4 py-3"
                    >
                      <div className="text-sm font-bold text-[#2F2A24] truncate">
                        {serviceLabel(s, isAr)}
                      </div>
                      <div className="text-[12px] text-[#7A6F66] font-semibold mt-0.5">
                        {money(s?.price)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-end">
                {canCancel ? (
                  <Button
                    onClick={() => setConfirmOpen(true)}
                    variant="outline"
                    className="h-11 rounded-xl border-2 border-red-200 bg-white/70 text-red-700 font-bold hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {t("Cancel Reservation", "إلغاء الحجز")}
                  </Button>
                ) : null}

                <Button
                  asChild
                  className="h-11 rounded-xl bg-[#387365] hover:bg-[#2d5c51] text-white font-bold"
                >
                  <Link to="/my-boarding-reservations">
                    {t("Back to list", "رجوع للقائمة")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Confirm cancel */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="z-[200] rounded-[24px] max-w-sm p-6 overflow-hidden border-2 border-[#D1C2B4] shadow-2xl bg-[#FDFCFB]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#2F2A24]">
              {t("Confirm cancel", "تأكيد الإلغاء")}
            </DialogTitle>
            <DialogDescription className="text-[#7A6F66] text-sm">
              {t(
                "Are you sure you want to cancel this reservation?",
                "هل أنت متأكد أنك تريد إلغاء هذا الحجز؟"
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              className="h-10 rounded-xl text-[#7A6F66] hover:bg-[#F2EDE7]"
            >
              {t("Back", "رجوع")}
            </Button>
            <Button
              onClick={onCancel}
              disabled={canceling}
              className="h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              {canceling
                ? t("Canceling...", "جاري الإلغاء...")
                : t("Yes, cancel", "نعم، إلغاء")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
