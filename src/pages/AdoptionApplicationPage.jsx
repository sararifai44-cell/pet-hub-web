import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartHandshake, ArrowLeft, Calendar, VenusAndMars } from "lucide-react";

import { useGetPetByIdQuery } from "@/features/pets/petsApiSlice";
import { useCreateAdoptionApplicationMutation } from "@/features/adoptionApplications/adoptionApplicationsApiSlice";

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

function useIsArabic() {
  const lang =
    typeof window !== "undefined" ? (navigator.language || "").toLowerCase() : "en";
  return lang.startsWith("ar");
}

export default function AdoptionApplicationPage() {
  const isAr = useIsArabic();
  const t = (en, ar) => (isAr ? ar : en);

  const { id } = useParams();
  const petId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();

  const hasSubmittedAuto = useRef(false);

  const { data: pet, isLoading } = useGetPetByIdQuery(petId, { skip: !petId });
  const [createApp, { isLoading: submitting }] = useCreateAdoptionApplicationMutation();
  const [motivation, setMotivation] = useState("");

  const canSubmit = motivation.trim().length >= 10 && !!petId;

  // ===================== ✅ AUTH DIALOG =====================
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authFrom, setAuthFrom] = useState("");
  const [pendingAdoption, setPendingAdoption] = useState(null);

  const isAuthError = (err) => {
    const status = err?.status ?? err?.originalStatus;
    const msg = err?.data?.message ?? err?.data?.error ?? err?.error ?? "";
    return status === 401 || status === 403 || /unauthenticated|unauthorized|login/i.test(String(msg));
  };

  const openAuthDialog = useCallback(
    (motText) => {
      const from = location?.pathname + (location?.search || "");
      setAuthFrom(from);
      setPendingAdoption({
        pet_id: petId,
        motivation: (motText ?? motivation).trim(),
      });
      setAuthDialogOpen(true);
    },
    [location?.pathname, location?.search, petId, motivation]
  );
  // ==========================================================

  useEffect(() => {
    if (
      location.state?.shouldAutoSubmit &&
      location.state?.pendingAdoption &&
      !hasSubmittedAuto.current
    ) {
      const savedMotivation = location.state.pendingAdoption.motivation;
      setMotivation(savedMotivation);

      hasSubmittedAuto.current = true;

      // ✅ بدل Cookies.get("token") -> getToken()
      const token = getToken();
      if (!token) {
        openAuthDialog(savedMotivation);
        window.history.replaceState({}, document.title);
        return;
      }

      handleFinalSubmit(savedMotivation);
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const handleFinalSubmit = async (motivationText) => {
    try {
      const result = await createApp({
        pet_id: petId,
        motivation: motivationText.trim(),
      }).unwrap();

      toast.success(isAr ? "تم إرسال طلب التبنّي بنجاح" : "Application submitted successfully!");
      navigate(`/adoption-requests/${result.id || result.data?.id}`);
    } catch (err) {
      const serverMessage = err?.data?.message || err?.data?.error;

      if (isAuthError(err)) {
        openAuthDialog(motivationText);
        return;
      }

      if (serverMessage) toast.error(serverMessage);
      else toast.error(isAr ? "حدث خطأ في السيرفر" : "Internal Server Error");
    }
  };

  const onSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!canSubmit) {
      toast.error(isAr ? "اكتب سبب التبنّي (على الأقل 10 أحرف)" : "Please write your motivation");
      return;
    }

    // ✅ بدل Cookies.get("token") -> getToken()
    const token = getToken();
    if (!token) {
      openAuthDialog(motivation);
      return;
    }

    await handleFinalSubmit(motivation);
  };

  const imgSrc = useMemo(() => {
    const first =
      (Array.isArray(pet?.images) && pet.images.length && pet.images[0]) ||
      pet?.cover_image ||
      pet?.image ||
      pet?.image_url ||
      null;
    return typeof first === "string" ? first : first?.url || null;
  }, [pet]);

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
              {t("You need to login first to continue.", "لازم تسجل دخول أولاً لتكمل.")}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setAuthDialogOpen(false)} className="rounded-xl">
              {t("Cancel", "إلغاء")}
            </Button>

            <Button
              onClick={() => {
                setAuthDialogOpen(false);
                navigate("/login", {
                  replace: true,
                  state: {
                    from: authFrom,
                    pendingAdoption: pendingAdoption || { pet_id: petId, motivation: motivation.trim() },
                  },
                });
              }}
              className="rounded-xl bg-[#3C7A57] hover:bg-[#2F5F43] text-white"
            >
              {t("Go to Login", "تسجيل الدخول")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <main className="mx-auto max-w-7xl px-4 md:px-8 pt-6 pb-20">
        <header className="mb-8 py-5 px-8 rounded-xl bg-[#F7F3F0] border border-[#E7DCD0]/50 relative flex flex-row items-center justify-between overflow-hidden">
          <div className="relative z-10 space-y-1">
            <h1 className="text-xl md:text-2xl font-semibold text-[#2F2A24]">
              {t("Adoption Application", "طلب تبنّي")}
              <span className="text-[#3C7A57]">{t(" • simple & quick", " • سريع وبسيط")}</span>
            </h1>
            <p className="text-[#8C8276] text-[11px] font-medium">
              {t("Tell us why you’d like to adopt, and we’ll review your request.", "اكتبي سبب التبنّي وسنقوم بمراجعة الطلب.")}
            </p>
          </div>
          <div className="shrink-0">
            <img src="/pethub-logo (2).png" alt="PetHub" className="h-14 md:h-18 w-auto object-contain" />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <aside className="lg:col-span-2 space-y-4">
            <Card className="rounded-2xl border border-[#E7DCD0] bg-white shadow-sm overflow-hidden">
              <div className="aspect-[4/3] w-full bg-[#FBF7F1]">
                {imgSrc ? (
                  <img src={imgSrc} alt={pet?.name} className="h-full w-full object-contain" />
                ) : (
                  <div className="h-full w-full grid place-items-center text-[#E7DCD0] font-semibold">
                    {t("No image", "لا يوجد صورة")}
                  </div>
                )}
              </div>
              <CardContent className="p-5">
                {isLoading ? (
                  <div className="animate-pulse text-[#3C7A57]">{t("Loading...", "جاري التحميل...")}</div>
                ) : (
                  <>
                    <div className="text-lg font-extrabold text-[#2F2A24]">{pet?.name}</div>
                    <div className="mt-2 space-y-2 text-[12px] text-[#2F2A24]/70">
                      <div className="flex items-center gap-2">
                        <VenusAndMars className="h-4 w-4" />
                        <span>{pet?.gender}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{pet?.age}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Button asChild variant="outline" className="w-full rounded-xl">
              <Link to="/pets">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("Back", "رجوع")}
              </Link>
            </Button>
          </aside>

          <section className="lg:col-span-3">
            <Card className="rounded-2xl border border-[#E7DCD0] bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#2F2A24] text-lg font-extrabold">{t("Your Motivation", "رسالتك")}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-3">
                <form onSubmit={onSubmit} className="space-y-5">
                  <textarea
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    rows={6}
                    placeholder={t("Why do you want to adopt?", "لماذا تريد التبني؟")}
                    className="w-full rounded-2xl border border-[#E7DCD0] bg-[#FBF7F1] p-4 text-sm outline-none focus:ring-2 focus:ring-[#3C7A57]/20 transition-all"
                  />
                  <Button
                    type="submit"
                    disabled={!canSubmit || submitting}
                    className="h-11 rounded-xl bg-[#3C7A57] hover:bg-[#2F5F43] text-white w-full"
                  >
                    <HeartHandshake className="h-4 w-4 mr-2" />
                    {submitting ? t("Sending...", "جارٍ الإرسال...") : t("Submit", "إرسال الطلب")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
