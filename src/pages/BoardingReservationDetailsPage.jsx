// src/pages/BoardingReservationDetailsPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, XCircle } from "lucide-react";
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
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (s.includes("cancel")) return "bg-red-50 text-red-700 border-red-100";
  return "bg-orange-50 text-orange-700 border-orange-100";
}

const serviceLabel = (s, isAr) => {
  if (isAr) return s?.name_ar || s?.name_en || s?.name || `#${s?.id}`;
  return s?.name_en || s?.name || s?.name_ar || `#${s?.id}`;
};

export default function BoardingReservationDetailsPage() {
  const isAr = useIsArabic();
  const t = (en, ar) => (isAr ? ar : en);
  const { id } = useParams();

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
      <div className="min-h-screen bg-[#FDFCFB]" dir={isAr ? "rtl" : "ltr"}>
        <Navbar />
        <div className="pt-32 text-center text-[#3C7A57] font-medium animate-pulse">
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

      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-4">
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

                <div>
                  <h1 className="text-xl font-bold tracking-tight">
                    {t("Reservation Details", "تفاصيل الحجز")} #{r?.id ?? id}
                  </h1>
                  <div className="mt-1 flex items-center gap-2 text-[12px] text-slate-500 font-medium">
                    <Calendar size={13} />
                    {formatDateTime(r?.created_at, isAr)}
                  </div>
                </div>
              </div>

              <Badge
                className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${statusBadgeClass(
                  r.status
                )}`}
              >
                {r?.status || "pending"}
              </Badge>
            </div>
          </header>

          {/* Content */}
          <Card className="rounded-xl border-[#E7DCD0]/70 bg-white shadow-sm">
            <CardContent className="p-4 sm:p-5">
              {/* Top fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                    {t("Start", "البداية")}
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    {formatDateTime(r?.start_at, isAr) || "—"}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                    {t("End", "النهاية")}
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    {formatDateTime(r?.end_at, isAr) || "—"}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                    {t("Billable Hours", "الساعات المحتسبة")}
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    {r?.billable_hours ?? "—"}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                    {t("Total", "الإجمالي")}
                  </div>
                  <div className="text-sm font-bold text-[#3C7A57]">
                    {r?.total != null ? money(r.total) : "—"}
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

             {/* Services */}
<div className="text-sm font-bold text-[#2F2A24] mb-2 text-center">
  {t("Services", "الخدمات")}
</div>

{!services.length ? (
  <div className="text-sm text-slate-500 text-center">
    {t("No services.", "لا يوجد خدمات.")}
  </div>
) : (
  <div className="space-y-2 text-left">
    {services.map((s) => (
      <div
        key={s.id}
        className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-left"
      >
        <div className="text-sm font-bold text-slate-800 truncate">
          {serviceLabel(s, isAr)}
        </div>
        <div className="text-[12px] text-slate-500 font-medium mt-0.5">
          {money(s?.price)}
        </div>
      </div>
    ))}
  </div>
)}

              {/* Actions */}
              <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-end">
                {canCancel ? (
                  <Button
                    onClick={() => setConfirmOpen(true)}
                    variant="outline"
                    className="h-11 rounded-xl border-red-200 bg-white text-red-600 font-bold hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {t("Cancel Reservation", "إلغاء الحجز")}
                  </Button>
                ) : null}

                <Button
                  asChild
                  className="h-11 rounded-xl bg-[#3C7A57] hover:bg-[#336A4C] text-white font-bold"
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
        <DialogContent className="z-[200] rounded-[24px] max-w-sm p-6 overflow-hidden border border-[#E7DCD0] shadow-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#2F2A24]">
              {t("Confirm cancel", "تأكيد الإلغاء")}
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
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
              className="h-10 rounded-xl text-slate-500 hover:bg-slate-50"
            >
              {t("Back", "رجوع")}
            </Button>
            <Button
              onClick={onCancel}
              disabled={canceling}
              className="h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              {canceling ? t("Canceling...", "جاري الإلغاء...") : t("Yes, cancel", "نعم، إلغاء")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
