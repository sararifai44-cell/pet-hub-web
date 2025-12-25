// src/pages/PetDetailsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import Navbar from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { X, ChevronLeft, ChevronRight, HeartHandshake } from "lucide-react";
import { useGetPetByIdQuery } from "@/features/pets/petsApiSlice";

function useIsArabic() {
  const [isAr, setIsAr] = useState(false);
  useEffect(() => {
    const lang = (navigator.language || "").toLowerCase();
    setIsAr(lang.startsWith("ar"));
  }, []);
  return isAr;
}

function formatAgeFromDob(dobStr, isAr) {
  if (!dobStr) return "";
  const dob = new Date(dobStr);
  if (Number.isNaN(dob.getTime())) return "";
  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  if (now.getDate() < dob.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) return "";
  if (years === 0) return isAr ? `${months} شهر` : `${months} months`;
  if (months === 0) return isAr ? `${years} سنة` : `${years} years`;
  return isAr ? `${years} سنة و ${months} شهر` : `${years}y ${months}m`;
}

export default function PetDetailsPage() {
  const isAr = useIsArabic();
  const t = (en, ar) => (isAr ? ar : en);

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isModal = !!location.state?.background;

  const { data: pet, isLoading, isError, error } = useGetPetByIdQuery(id, { skip: !id });

  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [id]);

  const close = () => {
    if (isModal) navigate(-1);
    else navigate("/pets");
  };

  const images = useMemo(() => {
    const list = [];
    if (pet?.cover_image) list.push(pet.cover_image);
    if (Array.isArray(pet?.images)) {
      for (const it of pet.images) if (typeof it === "string" && it) list.push(it);
    }
    // unique
    return Array.from(new Set(list)).filter(Boolean);
  }, [pet]);

  const name = pet?.name || "";
  const typeName = pet?.pet_type?.name || "";
  const breedName = pet?.pet_breed?.name || "";
  const description = pet?.description || "";
  const gender = pet?.gender ? String(pet.gender) : "";
  const dob = pet?.date_of_birth || "";
  const ageText = formatAgeFromDob(dob, isAr);
  const adoptable = pet?.is_adoptable === true;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] text-[#2F2A24]" dir={isAr ? "rtl" : "ltr"}>
        {!isModal ? <Navbar /> : null}
        <main className={isModal ? "fixed inset-0 z-50 grid place-items-center bg-black/35 p-4" : "pt-28 p-6"}>
          <div className="w-full max-w-5xl rounded-[20px] bg-white p-6">
            <div className="h-6 w-60 rounded-xl bg-black/5 animate-pulse" />
            <div className="mt-4 h-[420px] rounded-2xl bg-black/5 animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  if (isError || !pet) {
    const status = error?.status;
    return (
      <div className="min-h-screen bg-[#FDFCFB] text-[#2F2A24]" dir={isAr ? "rtl" : "ltr"}>
        {!isModal ? <Navbar /> : null}
        <main className={isModal ? "fixed inset-0 z-50 grid place-items-center bg-black/35 p-4" : "pt-28 p-6"}>
          <div className="w-full max-w-xl rounded-[20px] border border-[#E7DCD0] bg-white p-6">
            <div className="text-xl font-extrabold">{t("Pet not found", "الحيوان غير موجود")}</div>
            <div className="mt-2 text-sm text-[#2F2A24]/70">
              {t("This pet doesn’t exist or can’t be loaded.", "هذا الحيوان غير موجود أو ما قدرنا نجيبه.")}
              {status ? ` (${status})` : null}
            </div>

            <div className="mt-5 flex gap-2">
              <Button onClick={close} className="rounded-full bg-[#3C7A57] hover:bg-[#336A4C] text-white">
                {t("Back", "رجوع")}
              </Button>

              <Button asChild variant="outline" className="rounded-full border-[#E7DCD0] bg-white hover:bg-[#F5F2F0]">
                <Link to="/pets">{t("Go to list", "العودة للقائمة")}</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2F2A24]" dir={isAr ? "rtl" : "ltr"}>
      {!isModal ? <Navbar /> : null}

      <main
        className={isModal ? "fixed inset-0 z-50 grid place-items-center bg-black/35 p-4" : "pt-28 pb-20 px-6"}
        onClick={isModal ? close : undefined}
      >
        <div
          className="w-full max-w-6xl rounded-[18px] bg-white shadow-2xl overflow-hidden"
          onClick={isModal ? (e) => e.stopPropagation() : undefined}
        >
          {/* top bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E7DCD0]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="text-sm font-extrabold truncate">{name || `#${pet?.id}`}</div>

              {typeName ? <Badge className="rounded-full bg-[#3C7A57]/10 text-[#3C7A57] border-none">{typeName}</Badge> : null}
              {breedName ? <Badge className="rounded-full bg-[#2F2A24]/5 text-[#2F2A24]/70 border-none">{breedName}</Badge> : null}

              <Badge
                className={`rounded-full border-none ${
                  adoptable ? "bg-[#3C7A57]/10 text-[#3C7A57]" : "bg-[#2F2A24]/5 text-[#2F2A24]/70"
                }`}
              >
                {adoptable ? t("Adoptable", "قابل للتبني") : t("Not adoptable", "غير قابل للتبني")}
              </Badge>
            </div>

            <button type="button" onClick={close} className="h-9 w-9 rounded-full grid place-items-center hover:bg-black/5" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* body */}
          <div className="grid lg:grid-cols-[1fr_1.2fr]">
            {/* left info */}
            <div className="p-5 lg:p-6">
              <div className="text-2xl font-extrabold">{name || `#${pet?.id}`}</div>

              {description ? (
                <div className="mt-2 text-sm text-[#2F2A24]/70 leading-relaxed">{description}</div>
              ) : (
                <div className="mt-2 text-sm text-[#2F2A24]/50">{t("No description.", "لا يوجد وصف.")}</div>
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {ageText ? (
                  <div className="rounded-2xl border border-[#E7DCD0] p-4">
                    <div className="text-xs font-bold text-[#2F2A24]/60">{t("Age", "العمر")}</div>
                    <div className="mt-1 text-sm font-extrabold">{ageText}</div>
                  </div>
                ) : null}

                {gender ? (
                  <div className="rounded-2xl border border-[#E7DCD0] p-4">
                    <div className="text-xs font-bold text-[#2F2A24]/60">{t("Gender", "الجنس")}</div>
                    <div className="mt-1 text-sm font-extrabold">{gender}</div>
                  </div>
                ) : null}

                {dob ? (
                  <div className="rounded-2xl border border-[#E7DCD0] p-4 sm:col-span-2">
                    <div className="text-xs font-bold text-[#2F2A24]/60">{t("Date of birth", "تاريخ الميلاد")}</div>
                    <div className="mt-1 text-sm font-extrabold">{String(dob)}</div>
                  </div>
                ) : null}
              </div>

              <div className="mt-6 flex gap-2">
                <Button
                  className="flex-1 h-11 rounded-full bg-[#3C7A57] text-white hover:bg-[#336A4C]"
                  disabled={!adoptable}
                  onClick={() =>
                    alert(
                      adoptable
                        ? t("Adoption request UI (later)", "واجهة طلب التبني (لاحقاً)")
                        : t("This pet is not adoptable.", "هذا الحيوان غير قابل للتبني.")
                    )
                  }
                >
                  <HeartHandshake className="h-4 w-4" />
                  <span className={isAr ? "mr-2" : "ml-2"}>{t("Submit adoption request", "تقديم طلب تبنّي")}</span>
                </Button>

                <Button variant="outline" className="h-11 rounded-full border-[#E7DCD0] bg-white hover:bg-[#F5F2F0] px-5" onClick={close}>
                  {t("Close", "إغلاق")}
                </Button>
              </div>
            </div>

            {/* right slider */}
            <div className="bg-[#FBF7F1] border-t lg:border-t-0 lg:border-l border-[#E7DCD0] p-4">
              <div className="relative rounded-[16px] overflow-hidden bg-white border border-[#E7DCD0]">
                <div className="aspect-[4/3] w-full bg-[#FBF7F1] grid place-items-center">
                  {images.length ? (
                    <img
                      src={images[Math.min(active, images.length - 1)]}
                      alt={name || `#${pet?.id}`}
                      className="h-full w-full object-cover"
                      draggable="false"
                    />
                  ) : (
                    <div className="text-sm font-extrabold text-[#2F2A24]/40">{t("No image from API", "لا يوجد صورة من الباك")}</div>
                  )}
                </div>

                {images.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setActive((i) => (i - 1 + images.length) % images.length)}
                      className={`absolute top-1/2 -translate-y-1/2 ${isAr ? "right-3" : "left-3"} h-10 w-10 rounded-full bg-white/90 border border-[#E7DCD0] grid place-items-center hover:bg-white`}
                      aria-label="prev"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActive((i) => (i + 1) % images.length)}
                      className={`absolute top-1/2 -translate-y-1/2 ${isAr ? "left-3" : "right-3"} h-10 w-10 rounded-full bg-white/90 border border-[#E7DCD0] grid place-items-center hover:bg-white`}
                      aria-label="next"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActive(idx)}
                          className={`h-2.5 w-2.5 rounded-full border border-white/70 ${idx === active ? "bg-[#3C7A57]" : "bg-black/20"}`}
                          aria-label={`go-${idx}`}
                        />
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
