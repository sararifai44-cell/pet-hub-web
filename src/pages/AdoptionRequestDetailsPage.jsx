import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import {
  ArrowLeft,
  Calendar,
  Info,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Heart,
} from "lucide-react";

import { useGetMyAdoptionApplicationByIdQuery } from "@/features/adoptionApplications/adoptionApplicationsApiSlice";

// ✅ نفس توكن الموقع (pethub_web_token)
import { getToken } from "@/app/apiSlice";

// ✅ Dialog (shadcn/ui)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function useIsArabic() {
  const lang =
    typeof window !== "undefined" ? (navigator.language || "").toLowerCase() : "en";
  return lang.startsWith("ar");
}

export default function AdoptionRequestDetailsPage() {
  const isAr = useIsArabic();
  const t = (en, ar) => (isAr ? ar : en);

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ اقرأ التوكن بالطريقة الصحيحة مثل apiSlice
  const token = getToken();

  // ===================== ✅ AUTH DIALOG (مثل الشوب) =====================
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authFrom, setAuthFrom] = useState("");

  const isAuthError = (err) => {
    const status = err?.status ?? err?.originalStatus;
    const msg = err?.data?.message ?? err?.data?.error ?? err?.error ?? "";
    return (
      status === 401 ||
      status === 403 ||
      /unauthenticated|unauthorized|login/i.test(String(msg))
    );
  };

  const openAuthDialog = useCallback(() => {
    const from = location?.pathname + (location?.search || "");
    setAuthFrom(from);
    setAuthDialogOpen(true);
  }, [location?.pathname, location?.search]);
  // =====================================================================

  const {
    data: application,
    isLoading,
    isError,
    error,
  } = useGetMyAdoptionApplicationByIdQuery(id, {
    skip: !id || !token, // ✅ لا نضرب API إذا ما في توكن
    refetchOnMountOrArgChange: true,
  });

  // ✅ إذا ما في توكن -> افتح الدايلوغ (مرة)
  useEffect(() => {
    if (!token) openAuthDialog();
  }, [token, openAuthDialog]);

  // ✅ إذا رجعت 401/403 -> افتح الدايلوغ مثل الشوب
  useEffect(() => {
    if (isAuthError(error)) openAuthDialog();
  }, [error, openAuthDialog]);

  // ===== Loading =====
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB]">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-pulse text-[#3C7A57] font-medium">
            {t("Loading request details...", "جاري تحميل تفاصيل الطلب...")}
          </div>
        </div>

        {/* ✅ Dialog */}
        <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle className="text-base font-extrabold">
                {t("Login required", "تسجيل الدخول مطلوب")}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {t("You need to login first to continue.", "لازم تسجل دخول أولاً لتكمل.")}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => setAuthDialogOpen(false)}
                className="rounded-xl"
              >
                {t("Cancel", "إلغاء")}
              </Button>

              <Button
                onClick={() => {
                  setAuthDialogOpen(false);
                  navigate("/login", { state: { from: authFrom }, replace: true });
                }}
                className="rounded-xl bg-[#3C7A57] hover:bg-[#336A4C] text-white"
              >
                {t("Go to Login", "تسجيل الدخول")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ===== Not logged in =====
  if (!token) {
    return (
      <div className="min-h-screen bg-[#FDFCFB]" dir={isAr ? "rtl" : "ltr"}>
        <Navbar />

        <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle className="text-base font-extrabold">
                {t("Login required", "تسجيل الدخول مطلوب")}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {t(
                  "You need to login first to view this request.",
                  "لازم تسجل دخول أولاً لتعرض هذا الطلب."
                )}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => setAuthDialogOpen(false)}
                className="rounded-xl"
              >
                {t("Cancel", "إلغاء")}
              </Button>

              <Button
                onClick={() => {
                  setAuthDialogOpen(false);
                  navigate("/login", { state: { from: authFrom }, replace: true });
                }}
                className="rounded-xl bg-[#3C7A57] hover:bg-[#336A4C] text-white"
              >
                {t("Go to Login", "تسجيل الدخول")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex flex-col items-center justify-center h-[60vh] gap-3 px-4">
          <AlertCircle size={44} className="text-amber-400" />
          <h2 className="text-lg font-extrabold text-[#2F2A24]">
            {t("Login required", "تسجيل الدخول مطلوب")}
          </h2>
          <p className="text-[#2F2A24]/70 text-sm text-center max-w-md">
            {t("Please login to continue.", "رجاءً سجّل دخول لتكمل.")}
          </p>
        </div>
      </div>
    );
  }

  // ===== Error / Not found =====
  if (isError || !application) {
    return (
      <div className="min-h-screen bg-[#FDFCFB]" dir={isAr ? "rtl" : "ltr"}>
        <Navbar />

        {/* ✅ Dialog فقط إذا Auth error */}
        <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle className="text-base font-extrabold">
                {t("Login required", "تسجيل الدخول مطلوب")}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {t(
                  "Your session ended. Please login again.",
                  "انتهت الجلسة. رجاءً سجّل دخول من جديد."
                )}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => setAuthDialogOpen(false)}
                className="rounded-xl"
              >
                {t("Cancel", "إلغاء")}
              </Button>

              <Button
                onClick={() => {
                  setAuthDialogOpen(false);
                  navigate("/login", { state: { from: authFrom }, replace: true });
                }}
                className="rounded-xl bg-[#3C7A57] hover:bg-[#336A4C] text-white"
              >
                {t("Go to Login", "تسجيل الدخول")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <AlertCircle size={48} className="text-red-400" />
          <h2 className="text-xl font-bold text-[#2F2A24]">
            {isAuthError(error)
              ? t("Unauthorized", "غير مصرح بالدخول")
              : t("Error", "حدث خطأ")}
          </h2>
          <p className="text-[#2F2A24]/70 text-center px-4">
            {isAuthError(error)
              ? t("Please login to see this request.", "يرجى تسجيل الدخول لعرض هذا الطلب.")
              : t("We couldn't find the request you're looking for.", "لم نتمكن من العثور على الطلب.")}
          </p>
          <Link
            to="/adoption-requests"
            className="px-6 py-2 bg-[#3C7A57] text-white rounded-xl font-bold"
          >
            {t("Go to My Requests", "الذهاب لطلباتي")}
          </Link>
        </div>
      </div>
    );
  }

  const appData = application;
  const pet = appData?.pet;
  const status = String(appData?.status || "").toLowerCase();

  const getStatusInfo = (st) => {
    switch (st) {
      case "approved":
        return {
          icon: <CheckCircle2 className="text-green-500" size={18} />,
          bg: "bg-green-50",
          text: "text-green-700",
          label: t("Approved", "مقبول"),
        };
      case "rejected":
        return {
          icon: <AlertCircle className="text-red-500" size={18} />,
          bg: "bg-red-50",
          text: "text-red-700",
          label: t("Rejected", "مرفوض"),
        };
      default:
        return {
          icon: <Clock className="text-amber-500" size={18} />,
          bg: "bg-amber-50",
          text: "text-amber-700",
          label: t("Pending", "قيد الانتظار"),
        };
    }
  };

  const statusInfo = getStatusInfo(status);

  return (
    <div className="min-h-screen bg-[#FDFCFB]" dir={isAr ? "rtl" : "ltr"}>
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 md:px-8 pt-6 pb-20">
        <header className="mb-7 rounded-xl border border-[#E7DCD0] bg-[#F7F3F0] p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                to="/adoption-requests"
                className="h-9 w-9 rounded-full bg-white shadow-sm border border-[#E7DCD0] inline-flex items-center justify-center transition-colors hover:bg-white/80"
              >
                <ArrowLeft size={18} className={isAr ? "rotate-180" : ""} />
              </Link>
              <div>
                <h1 className="text-lg font-extrabold text-[#2F2A24]">
                  {t("Request Details", "تفاصيل الطلب")}
                </h1>
                <p className="text-[11px] font-medium text-[#8C8276]">
                  ID: #{id} •{" "}
                  {appData.created_at
                    ? new Date(appData.created_at).toLocaleDateString(isAr ? "ar-EG" : "en-US")
                    : ""}
                </p>
              </div>
            </div>

            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-current/10 ${statusInfo.bg} ${statusInfo.text}`}
            >
              {statusInfo.icon}
              <span className="text-xs font-bold">{statusInfo.label}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl border border-[#E7DCD0] bg-white shadow-sm overflow-hidden">
              <div className="aspect-square bg-[#FBF7F1] relative">
                {pet?.cover_image || pet?.image_url ? (
                  <img
                    src={pet?.cover_image || pet?.image_url}
                    alt={pet?.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[#E7DCD0]">
                    <Heart size={48} />
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-black text-[#2F2A24] mb-3">
                  {pet?.name || t("Pet Name", "اسم الحيوان")}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[#2F2A24]/70">
                    <Info size={14} className="text-[#3C7A57]" />
                    <span className="font-bold">{t("Breed:", "السلالة:")}</span>
                    <span>{pet?.breed || t("Not specified", "غير محدد")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#2F2A24]/70">
                    <Calendar size={14} className="text-[#3C7A57]" />
                    <span className="font-bold">{t("Age:", "العمر:")}</span>
                    <span>{pet?.age || t("Not specified", "غير محدد")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-[#E7DCD0] bg-white shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="text-[#3C7A57]" size={20} />
                <h2 className="font-extrabold text-[#2F2A24]">{t("Your Motivation", "سبب التبنّي")}</h2>
              </div>
              <div className="bg-[#FBF7F1] border border-[#E7DCD0]/40 rounded-xl p-4">
                <p className="text-sm leading-relaxed text-[#2F2A24]/80 whitespace-pre-wrap">
                  {appData?.motivation || t("No message provided.", "لا يوجد رسالة مرفقة.")}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E7DCD0] bg-white shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="text-[#3C7A57]" size={20} />
                <h2 className="font-extrabold text-[#2F2A24]">{t("Update History", "تاريخ التحديث")}</h2>
              </div>

              <div className="relative border-l-2 border-[#E7DCD0] ml-3 pr-4 space-y-6 py-2">
                <div className="relative">
                  <div className="absolute -left-[25px] h-3 w-3 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
                  <p className="text-[11px] font-bold text-[#3C7A57]">
                    {t("Application Submitted", "تم إرسال الطلب")}
                  </p>
                  <p className="text-[10px] text-[#8C8276]">
                    {appData.created_at
                      ? new Date(appData.created_at).toLocaleString(isAr ? "ar-EG" : "en-US")
                      : ""}
                  </p>
                </div>

                {status !== "pending" && (
                  <div className="relative">
                    <div
                      className={`absolute -left-[25px] h-3 w-3 rounded-full border-2 border-white shadow-sm ${
                        status === "approved" ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <p className="text-[11px] font-bold text-[#2F2A24]">
                      {status === "approved"
                        ? t("Request Approved", "تمت الموافقة على الطلب")
                        : t("Request Rejected", "تم رفض الطلب")}
                    </p>
                    <p className="text-[10px] text-[#8C8276]">
                      {appData.updated_at
                        ? new Date(appData.updated_at).toLocaleString(isAr ? "ar-EG" : "en-US")
                        : ""}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
