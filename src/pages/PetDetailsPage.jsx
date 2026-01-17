import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import Navbar from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getToken } from "@/app/apiSlice";

import {
  X,
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
  CalendarDays,
  VenusAndMars,
  PawPrint,
  Sparkles,
  Info
} from "lucide-react";

import { useGetPetByIdQuery } from "@/features/pets/petsApiSlice";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogOverlay,
} from "@/components/ui/dialog";

function useIsArabic() {
  const [isAr, setIsAr] = useState(false);
  useEffect(() => {
    const lang = (navigator.language || "").toLowerCase();
    setIsAr(lang.startsWith("ar"));
  }, []);
  return isAr;
}

function formatDob(dobStr, isAr) {
  if (!dobStr) return "";
  const d = new Date(dobStr);
  if (Number.isNaN(d.getTime())) return String(dobStr);
  return d.toLocaleDateString(isAr ? "ar" : "en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function PetDetailsPage() {
  const isAr = useIsArabic();
  const t = (en, ar) => (isAr ? ar : en);

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isModal = !!location.state?.background;

  const { data: pet, isLoading, isError, error } = useGetPetByIdQuery(id, {
    skip: !id,
  });

  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [id]);

  const close = () => {
    if (isModal) navigate(-1);
    else navigate("/pets");
  };

  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authFrom, setAuthFrom] = useState("");

  const openAuthDialog = useCallback(() => {
    setAuthFrom(`/pets/${id}/apply`);
    setAuthDialogOpen(true);
  }, [id]);

  const images = useMemo(() => {
    const list = [];
    if (pet?.cover_image) list.push(pet.cover_image);
    if (Array.isArray(pet?.images)) {
      pet.images.forEach(it => {
        const u = typeof it === "string" ? it : (it?.url || it?.path || it?.image || it?.image_url);
        if (u) list.push(u);
      });
    }
    return Array.from(new Set(list)).filter(Boolean);
  }, [pet]);

  const name = pet?.name || "";
  const typeName = pet?.pet_type?.name || "";
  const breedName = pet?.pet_breed?.name || "";
  const description = pet?.description || "";
  const gender = pet?.gender ? String(pet.gender) : "";
  const dob = pet?.date_of_birth || "";
  const dobText = formatDob(dob, isAr);
  const adoptable = pet?.is_adoptable === true;

  const canSlide = images.length > 1;
  const goPrev = (e) => { e.stopPropagation(); setActive((i) => (i - 1 + images.length) % images.length); };
  const goNext = (e) => { e.stopPropagation(); setActive((i) => (i + 1) % images.length); };

  const onAdoptClick = () => {
    if (!adoptable) return;
    const token = getToken();
    if (!token) { openAuthDialog(); return; }
    navigate(`/pets/${id}/apply`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB]" dir={isAr ? "rtl" : "ltr"}>
        {!isModal && <Navbar />}
        <main className="fixed inset-0 z-50 grid place-items-center bg-black/10 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl h-[70vh] rounded-[32px] bg-white animate-pulse" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2F2A24]" dir={isAr ? "rtl" : "ltr"}>
      {!isModal && <Navbar />}

      {/* ✅ Auth Dialog Updated */}
      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogOverlay className="bg-black/40 backdrop-blur-[2px]" />

        {/* ✅ التعديل الوحيد: إضافة bg-white حتى ما يطلع شفاف */}
        <DialogContent className="sm:max-w-[400px] rounded-[24px] border-none p-8 bg-white">
          <div className="flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-full bg-[#3C7A57]/10 flex items-center justify-center mb-4">
              <Info className="h-7 w-7 text-[#3C7A57]" />
            </div>
            <DialogTitle className="text-xl font-bold text-[#2F2A24]">
              {t("Sign in Required", "مطلوب تسجيل الدخول")}
            </DialogTitle>
            <DialogDescription className="mt-2 text-[#5C554E] font-medium leading-relaxed">
              {t(
                "To start the adoption process for this pet, please sign in to your account.",
                "لبدء عملية التبني، يرجى تسجيل الدخول إلى حسابك أولاً."
              )}
            </DialogDescription>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Button
              onClick={() => {
                setAuthDialogOpen(false);
                navigate("/login", { state: { from: authFrom } });
              }}
              className="h-12 w-full rounded-xl bg-[#3C7A57] hover:bg-[#336A4C] text-white font-bold text-sm shadow-lg shadow-[#3C7A57]/20"
            >
              {t("Continue to Login", "المتابعة لتسجيل الدخول")}
            </Button>

            <Button
              variant="ghost"
              onClick={() => setAuthDialogOpen(false)}
              className="h-12 w-full rounded-xl text-[#5C554E] font-bold"
            >
              {t("Maybe Later", "ليس الآن")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <main
        className={
          isModal
            ? "fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4 sm:p-6"
            : "pt-28 pb-20 px-6"
        }
        onClick={isModal ? close : undefined}
      >
        <div
          className={
            isModal
              ? "w-full max-w-5xl h-[90vh] lg:h-[85vh] rounded-[32px] bg-white shadow-2xl overflow-hidden flex flex-col relative"
              : "w-full max-w-6xl rounded-[32px] bg-white shadow-2xl overflow-hidden mx-auto flex flex-col lg:flex-row lg:h-[700px]"
          }
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button Mobile/Modal */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-black/5 flex items-center justify-center hover:bg-white transition-all"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col lg:flex-row h-full">
            {/* Right: Images Section (Slider) */}
            <div className="w-full lg:w-[55%] h-[45%] lg:h-full bg-[#FBF7F1] relative group border-b lg:border-b-0 lg:border-r border-[#E7DCD0]">
              {images.length > 0 ? (
                <div className="relative h-full w-full overflow-hidden">
                  <img
                    src={images[active]}
                    alt={name}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out"
                  />

                  {canSlide && (
                    <>
                      <button
                        onClick={goPrev}
                        className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-4' : 'left-4'} h-11 w-11 rounded-full bg-white/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white`}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={goNext}
                        className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'left-4' : 'right-4'} h-11 w-11 rounded-full bg-white/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white`}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>

                      {/* Indicators */}
                      <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2">
                        {images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActive(idx)}
                            className={`h-1.5 transition-all duration-300 rounded-full ${idx === active ? "w-8 bg-[#3C7A57]" : "w-2 bg-white/60 hover:bg-white"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="h-full grid place-items-center text-[#2F2A24]/30 font-bold">
                  {t("No Images", "لا توجد صور")}
                </div>
              )}
            </div>

            {/* Left: Info Section */}
            <div className="w-full lg:w-[45%] h-[55%] lg:h-full p-6 lg:p-10 flex flex-col overflow-y-auto">
              <div className="flex flex-wrap gap-2 mb-4">
                {typeName && (
                  <Badge
                    variant="outline"
                    className="rounded-full border-[#3C7A57]/20 bg-[#3C7A57]/5 text-[#3C7A57] font-bold px-3 py-1"
                  >
                    <PawPrint className="h-3 w-3 mr-1.5 inline" /> {typeName}
                  </Badge>
                )}
                {breedName && (
                  <Badge
                    variant="outline"
                    className="rounded-full border-[#E7DCD0] bg-[#FBF7F1] text-[#5C554E] font-bold px-3 py-1"
                  >
                    <Sparkles className="h-3 w-3 mr-1.5 inline" /> {breedName}
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-[#2F2A24] tracking-tight">
                {name || "Unnamed"}
              </h1>

              <div className="mt-4 flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${adoptable ? "bg-emerald-500" : "bg-gray-300"}`} />
                <span className="text-sm font-bold text-[#5C554E]">
                  {adoptable ? t("Ready for Adoption", "جاهز للتبني") : t("Currently Unavailable", "غير متاح حالياً")}
                </span>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-[#FBF7F1] rounded-2xl p-4 border border-[#E7DCD0]/50">
                  <div className="flex items-center gap-2 text-[#5C554E] mb-1">
                    <VenusAndMars className="h-4 w-4 text-[#3C7A57]" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      {t("Gender", "الجنس")}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-[#2F2A24]">{gender || "—"}</div>
                </div>

                <div className="bg-[#FBF7F1] rounded-2xl p-4 border border-[#E7DCD0]/50">
                  <div className="flex items-center gap-2 text-[#5C554E] mb-1">
                    <CalendarDays className="h-4 w-4 text-[#3C7A57]" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      {t("Birthday", "تاريخ الميلاد")}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-[#2F2A24]">{dobText || "—"}</div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#5C554E]/60 mb-3">
                  {t("About Me", "نبذة عني")}
                </h3>
                <p className="text-[#5C554E] text-sm leading-relaxed font-medium">
                  {description || t("No description available for this pet.", "لا يوجد وصف متاح لهذا الحيوان.")}
                </p>
              </div>

              <div className="mt-auto pt-10 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={onAdoptClick}
                  disabled={!adoptable}
                  className="flex-1 h-14 rounded-2xl bg-[#3C7A57] text-white hover:bg-[#336A4C] font-bold shadow-lg shadow-[#3C7A57]/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                >
                  <HeartHandshake className="h-5 w-5 mr-2" />
                  {t("Adopt Me", "تبنّي الآن")}
                </Button>

                {!isModal && (
                  <Button
                    asChild
                    variant="outline"
                    className="h-14 px-8 rounded-2xl border-[#E7DCD0] font-bold text-[#5C554E]"
                  >
                    <Link to="/pets">{t("Back to Gallery", "العودة للمعرض")}</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
  