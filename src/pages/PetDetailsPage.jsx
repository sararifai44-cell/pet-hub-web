// src/pages/PetDetailsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import Navbar from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  X,
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
  CalendarDays,
  VenusAndMars,
  PawPrint,
  Sparkles,
} from "lucide-react";

import { useGetPetByIdQuery } from "@/features/pets/petsApiSlice";

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

  const images = useMemo(() => {
    const list = [];
    if (pet?.cover_image) list.push(pet.cover_image);

    if (Array.isArray(pet?.images)) {
      for (const it of pet.images) {
        if (typeof it === "string" && it) list.push(it);
        else if (it && typeof it === "object") {
          const u = it.url || it.path || it.image || it.image_url;
          if (u) list.push(u);
        }
      }
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

  const currentImg = images.length ? images[Math.min(active, images.length - 1)] : null;
  const canSlide = images.length > 1;

  const goPrev = () => setActive((i) => (i - 1 + images.length) % images.length);
  const goNext = () => setActive((i) => (i + 1) % images.length);

  const shellClass = isModal
    ? "fixed inset-0 z-50 grid place-items-center bg-black/35 backdrop-blur-md p-3 sm:p-5"
    : "pt-28 pb-20 px-6";

  const cardClass = isModal
    ? "w-full max-w-5xl h-[86vh] rounded-[26px] bg-white shadow-2xl overflow-hidden"
    : "w-full max-w-6xl rounded-[26px] bg-white shadow-2xl overflow-hidden mx-auto";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] text-[#2F2A24]" dir={isAr ? "rtl" : "ltr"}>
        {!isModal ? <Navbar /> : null}
        <main className={shellClass}>
          <div className="w-full max-w-5xl rounded-[26px] bg-white p-6">
            <div className="h-6 w-60 rounded-xl bg-black/5 animate-pulse" />
            <div className="mt-4 h-[380px] rounded-2xl bg-black/5 animate-pulse" />
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
        <main className={shellClass}>
          <div className="w-full max-w-xl rounded-[26px] border border-[#E7DCD0] bg-white p-6">
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

      <main className={shellClass} onClick={isModal ? close : undefined}>
        <div className={cardClass} onClick={isModal ? (e) => e.stopPropagation() : undefined}>
          {/* top bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E7DCD0] bg-white">
            <div className="flex items-center gap-2 min-w-0">
              <div className="text-sm font-extrabold truncate">{name || `#${pet?.id}`}</div>

              {typeName ? (
                <Badge className="rounded-full bg-[#3C7A57]/10 text-[#3C7A57] border-none">
                  <span className="inline-flex items-center gap-1">
                    <PawPrint className="h-3.5 w-3.5" />
                    {typeName}
                  </span>
                </Badge>
              ) : null}

              {breedName ? (
                <Badge className="rounded-full bg-[#2F2A24]/5 text-[#2F2A24]/70 border-none">
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    {breedName}
                  </span>
                </Badge>
              ) : null}
            </div>

            <button
              type="button"
              onClick={close}
              className="h-9 w-9 rounded-full grid place-items-center hover:bg-black/5"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* body */}
          <div className="grid lg:grid-cols-[1fr_1.1fr] h-[calc(86vh-52px)]">
            {/* left info */}
            <div className="p-5 lg:p-6 overflow-y-auto">
              <div className="text-2xl font-extrabold text-center">{name || `#${pet?.id}`}</div>

              <div className="mt-2 flex flex-wrap gap-2 justify-center">
                {adoptable ? (
                  <Badge className="rounded-full bg-[#3C7A57]/10 text-[#3C7A57] border-none">
                    {t("Available for adoption", "متاح للتبني")}
                  </Badge>
                ) : (
                  <Badge className="rounded-full bg-[#2F2A24]/5 text-[#2F2A24]/70 border-none">
                    {t("Not available for adoption", "غير متاح للتبني")}
                  </Badge>
                )}
              </div>

              {description ? (
                <div className="mt-3 text-sm text-[#2F2A24]/70 leading-relaxed text-center">
                  {description}
                </div>
              ) : (
                <div className="mt-3 text-sm text-[#2F2A24]/50 text-center">
                  {t("No description.", "لا يوجد وصف.")}
                </div>
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {gender ? (
                  <div className="rounded-2xl border border-[#E7DCD0] p-4 bg-white">
                    <div className="text-xs font-bold text-[#2F2A24]/60 flex items-center gap-2">
                      <VenusAndMars className="h-4 w-4 text-[#3C7A57]" />
                      {t("Gender", "الجنس")}
                    </div>
                    <div className="mt-1 text-sm font-extrabold">{gender}</div>
                  </div>
                ) : null}

                {dob ? (
                  <div className="rounded-2xl border border-[#E7DCD0] p-4 bg-white">
                    <div className="text-xs font-bold text-[#2F2A24]/60 flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-[#3C7A57]" />
                      {t("Date of birth", "تاريخ الميلاد")}
                    </div>
                    <div className="mt-1 text-sm font-extrabold">{dobText}</div>
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
                  <span className={isAr ? "mr-2" : "ml-2"}>{t("Adopt", "تبنّي")}</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-11 rounded-full border-[#E7DCD0] bg-white hover:bg-[#F5F2F0] px-5"
                  onClick={close}
                >
                  {t("Close", "إغلاق")}
                </Button>
              </div>
            </div>

            {/* right slider */}
            <div className="bg-[#FBF7F1] border-t lg:border-t-0 lg:border-l border-[#E7DCD0] p-4 lg:p-5 overflow-y-auto">
              <div className="flex flex-col gap-3">
                {/* ✅ FIXED HEIGHT IMAGE BOX (no more thumbnails being cut) */}
                <div className="relative rounded-[20px] overflow-hidden bg-white border border-[#E7DCD0]">
                  <div className="relative w-full h-[260px] sm:h-[320px] md:h-[360px] lg:h-[420px] bg-[#FBF7F1] overflow-hidden">
                    {currentImg ? (
                      <>
                        {/* background blur */}
                        <img
                          src={currentImg}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover scale-110 blur-2xl opacity-35"
                          draggable="false"
                          aria-hidden="true"
                        />
                        {/* foreground (NO CROP) */}
                        <img
                          src={currentImg}
                          alt={name || `#${pet?.id}`}
                          className="absolute inset-0 h-full w-full object-contain"
                          draggable="false"
                          loading="eager"
                          decoding="async"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      </>
                    ) : (
                      <div className="h-full w-full grid place-items-center text-sm font-extrabold text-[#2F2A24]/40">
                        {t("No image from API", "لا يوجد صورة من الباك")}
                      </div>
                    )}
                  </div>

                  {canSlide ? (
                    <>
                      <button
                        type="button"
                        onClick={goPrev}
                        className={`absolute top-1/2 -translate-y-1/2 ${
                          isAr ? "right-3" : "left-3"
                        } h-10 w-10 rounded-full bg-white/90 border border-[#E7DCD0] grid place-items-center hover:bg-white`}
                        aria-label="prev"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      <button
                        type="button"
                        onClick={goNext}
                        className={`absolute top-1/2 -translate-y-1/2 ${
                          isAr ? "left-3" : "right-3"
                        } h-10 w-10 rounded-full bg-white/90 border border-[#E7DCD0] grid place-items-center hover:bg-white`}
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
                            className={`h-2.5 w-2.5 rounded-full border border-white/70 ${
                              idx === active ? "bg-[#3C7A57]" : "bg-black/20"
                            }`}
                            aria-label={`go-${idx}`}
                          />
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>

                {/* thumbnails */}
                {images.length > 1 ? (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((src, i) => (
                      <button
                        key={`${src}-${i}`}
                        type="button"
                        onClick={() => setActive(i)}
                        className={[
                          "h-16 w-20 shrink-0 overflow-hidden rounded-2xl border bg-white",
                          i === active
                            ? "border-[#3C7A57] ring-2 ring-[#3C7A57]/15"
                            : "border-[#E7DCD0] hover:border-[#3C7A57]/40",
                        ].join(" ")}
                        aria-label={`thumb-${i}`}
                      >
                        <img
                          src={src}
                          alt=""
                          className="h-full w-full object-cover"
                          draggable="false"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
