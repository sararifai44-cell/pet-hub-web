// src/pages/AdoptPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "@/components/common/Navbar";

import { Search, Heart, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { useGetPetsQuery } from "@/features/pets/petsApiSlice";
import { useGetPetTypesQuery } from "@/features/petTypes/petTypesApiSlice";
import { useGetPetBreedsQuery } from "@/features/petBreeds/petBreedsApiSlice";

function useIsArabic() {
  const [isAr, setIsAr] = useState(false);
  useEffect(() => {
    const lang = (navigator.language || "").toLowerCase();
    setIsAr(lang.startsWith("ar"));
  }, []);
  return isAr;
}

const asArray = (res) => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []);
const pickName = (obj, isAr) => {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  if (typeof obj === "object") return isAr ? (obj.name_ar || obj.name) : (obj.name_en || obj.name);
  return "";
};

function getAgeGroupFromDob(dobStr) {
  if (!dobStr) return "all";
  const dob = new Date(dobStr);
  if (Number.isNaN(dob.getTime())) return "all";
  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) years--;
  if (years < 1) return "baby";
  if (years < 3) return "young";
  return "adult";
}

export default function AdoptPage() {
  const isAr = useIsArabic();
  const t = (en, ar) => (isAr ? ar : en);
  const location = useLocation();

  // pagination
  const [page, setPage] = useState(1);

  // data
  const { data: petsRes, isLoading, isError, error, refetch, isFetching } = useGetPetsQuery({ page });
  const pets = useMemo(() => asArray(petsRes), [petsRes]);
  const meta = petsRes?.meta;

  // ✅ types + breeds from API
  const { data: typesRes, isLoading: typesLoading } = useGetPetTypesQuery({ page: 1 });
  const { data: breedsRes, isLoading: breedsLoading } = useGetPetBreedsQuery({ page: 1 });

  const petTypes = useMemo(() => asArray(typesRes?.data ?? typesRes), [typesRes]);
  const petBreeds = useMemo(() => asArray(breedsRes?.data ?? breedsRes), [breedsRes]);

  // filters
  const [q, setQ] = useState("");
  const [gender, setGender] = useState("all");
  const [age, setAge] = useState("all");
  const [onlyAdoptable, setOnlyAdoptable] = useState(false);

  // ✅ NEW: type/breed filters (ids)
  const [typeId, setTypeId] = useState("all");   // "all" | number as string
  const [breedId, setBreedId] = useState("all"); // "all" | number as string

  // breeds filtered by selected type
  const availableBreeds = useMemo(() => {
    if (typeId === "all") return petBreeds;
    const n = Number(typeId);
    return petBreeds.filter((b) => Number(b?.pet_type?.id) === n);
  }, [petBreeds, typeId]);

  // reset
  const resetFilters = () => {
    setQ("");
    setGender("all");
    setAge("all");
    setOnlyAdoptable(false);
    setTypeId("all");
    setBreedId("all");
  };

  // if type changes and current breed is not in available list -> reset breed
  useEffect(() => {
    if (breedId === "all") return;
    const ok = availableBreeds.some((b) => Number(b.id) === Number(breedId));
    if (!ok) setBreedId("all");
  }, [typeId, availableBreeds, breedId]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return pets.filter((p) => {
      const pGender = (p?.gender || "").toLowerCase();

      const okGender = gender === "all" ? true : pGender === gender;
      const okAge = age === "all" ? true : getAgeGroupFromDob(p?.date_of_birth) === age;
      const okAdoptable = onlyAdoptable ? p?.is_adoptable === true : true;

      const okType = typeId === "all" ? true : Number(p?.pet_type?.id) === Number(typeId);
      const okBreed = breedId === "all" ? true : Number(p?.pet_breed?.id) === Number(breedId);

      // search only in index-safe fields (no extra)
      const hay = [p?.name, p?.pet_type?.name, p?.pet_breed?.name].filter(Boolean).join(" ").toLowerCase();
      const okQ = query ? hay.includes(query) : true;

      return okGender && okAge && okAdoptable && okType && okBreed && okQ;
    });
  }, [pets, q, gender, age, onlyAdoptable, typeId, breedId]);

  // states
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] text-[#3D3730]" dir={isAr ? "rtl" : "ltr"}>
        <Navbar />
        <main className="pt-28 pb-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="h-10 w-64 rounded-2xl bg-black/5 animate-pulse" />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[360px] rounded-[32px] bg-black/5 animate-pulse" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isError) {
    const status = error?.status;
    return (
      <div className="min-h-screen bg-[#FDFCFB] text-[#3D3730]" dir={isAr ? "rtl" : "ltr"}>
        <Navbar />
        <main className="pt-28 pb-20">
          <div className="mx-auto max-w-3xl px-6">
            <div className="rounded-[22px] border border-[#E7DCD0] bg-white p-6">
              <div className="text-lg font-extrabold">{t("Couldn’t load pets", "ما قدرنا نجيب الحيوانات")}</div>
              <div className="mt-2 text-sm text-[#2F2A24]/70">
                {status ? `${t("Status", "الحالة")}: ${status}` : t("Please try again.", "جرّبي مرة تانية.")}
              </div>

              <div className="mt-5 flex gap-2">
                <Button
                  variant="outline"
                  className="rounded-full border-[#E7DCD0] bg-white hover:bg-[#F5F2F0]"
                  onClick={refetch}
                >
                  {t("Retry", "إعادة المحاولة")}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const currentPage = meta?.current_page ?? page;
  const lastPage = meta?.last_page ?? page;
  const canPrev = currentPage > 1;
  const canNext = currentPage < lastPage;

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#3D3730]" dir={isAr ? "rtl" : "ltr"}>
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-6">
          {/* Header */}
          <div className="mb-10 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="mt-0 text-3xl md:text-4xl font-extrabold tracking-tight text-[#2F2A24]">
                {t("Adopt your new friend", "تبنّى رفيقك الجديد")}
              </h1>
              <p className="mt-2 text-[#2F2A24]/60 font-medium max-w-xl">
                {t("Give a soul a second chance at happiness.", "امنح كائناً لطيفاً فرصة ثانية ليكون سعيداً.")}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-[#2F2A24]/60">
              <span>
                {t("Page", "صفحة")} {currentPage} / {lastPage}
              </span>
              {isFetching ? <span className="text-xs">{t("Loading…", "جارٍ التحميل…")}</span> : null}
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
            {/* Sidebar */}
            <aside className="space-y-6 lg:sticky lg:top-28 h-fit">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[11px] font-extrabold tracking-[0.15em] text-[#2F2A24]/40 uppercase">
                  {t("Filters", "الفلاتر")}
                </h2>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-7 text-[10px] font-bold text-[#3C7A57] hover:bg-[#3C7A57]/5"
                >
                  <RotateCcw className="h-3 w-3 mr-1 ml-1" /> {t("RESET", "إعادة")}
                </Button>
              </div>

              {/* Search */}
              <div className="relative group">
                <Search
                  className={`absolute ${isAr ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 h-4 w-4 text-[#2F2A24]/20 group-focus-within:text-[#3C7A57] transition-colors`}
                />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("Search…", "ابحث…")}
                  className={`h-12 border-none bg-white shadow-sm rounded-2xl text-sm ${
                    isAr ? "pr-11" : "pl-11"
                  } focus-visible:ring-2 focus-visible:ring-[#3C7A57]/10`}
                />
              </div>

              <Accordion type="multiple" defaultValue={["type", "breed", "gender", "age"]} className="space-y-3">
                {/* ✅ Type from API */}
                <AccordionItem value="type" className="border-none bg-white shadow-sm rounded-2xl px-4">
                  <AccordionTrigger className="text-[13px] font-extrabold text-[#2F2A24] hover:no-underline py-4 uppercase tracking-wide">
                    {t("Type", "النوع")}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5">
                    <ToggleGroup
                      type="single"
                      value={typeId}
                      onValueChange={(v) => setTypeId(v || "all")}
                      className="flex flex-wrap gap-2 justify-start"
                    >
                      <ToggleGroupItem
                        value="all"
                        className="h-9 px-4 rounded-xl border-none bg-[#F5F2F0] text-[11px] font-bold data-[state=on]:bg-[#3C7A57] data-[state=on]:text-white"
                      >
                        {t("All", "الكل")}
                      </ToggleGroupItem>

                      {(petTypes || []).map((tp) => (
                        <ToggleGroupItem
                          key={tp.id}
                          value={String(tp.id)}
                          disabled={typesLoading}
                          className="h-9 px-4 rounded-xl border-none bg-[#F5F2F0] text-[11px] font-bold data-[state=on]:bg-[#3C7A57] data-[state=on]:text-white"
                        >
                          {pickName(tp, isAr) || tp.name}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </AccordionContent>
                </AccordionItem>

                {/* ✅ Breed from API (filtered by type) */}
                <AccordionItem value="breed" className="border-none bg-white shadow-sm rounded-2xl px-4">
                  <AccordionTrigger className="text-[13px] font-extrabold text-[#2F2A24] hover:no-underline py-4 uppercase tracking-wide">
                    {t("Breed", "السلالة")}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5">
                    <ToggleGroup
                      type="single"
                      value={breedId}
                      onValueChange={(v) => setBreedId(v || "all")}
                      className="flex flex-wrap gap-2 justify-start"
                    >
                      <ToggleGroupItem
                        value="all"
                        className="h-9 px-4 rounded-xl border-none bg-[#F5F2F0] text-[11px] font-bold data-[state=on]:bg-[#3C7A57] data-[state=on]:text-white"
                      >
                        {t("All", "الكل")}
                      </ToggleGroupItem>

                      {(availableBreeds || []).map((br) => (
                        <ToggleGroupItem
                          key={br.id}
                          value={String(br.id)}
                          disabled={breedsLoading}
                          className="h-9 px-4 rounded-xl border-none bg-[#F5F2F0] text-[11px] font-bold data-[state=on]:bg-[#3C7A57] data-[state=on]:text-white"
                        >
                          {pickName(br, isAr) || br.name}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>

                    {typeId !== "all" && !availableBreeds.length ? (
                      <div className="mt-3 text-xs text-[#2F2A24]/55">
                        {t("No breeds for selected type.", "لا يوجد سلالات لهذا النوع.")}
                      </div>
                    ) : null}
                  </AccordionContent>
                </AccordionItem>

                {/* Gender */}
                <AccordionItem value="gender" className="border-none bg-white shadow-sm rounded-2xl px-4">
                  <AccordionTrigger className="text-[13px] font-extrabold text-[#2F2A24] hover:no-underline py-4 uppercase tracking-wide">
                    {t("Gender", "الجنس")}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5">
                    <ToggleGroup
                      type="single"
                      value={gender}
                      onValueChange={(v) => setGender(v || "all")}
                      className="flex flex-wrap gap-2 justify-start"
                    >
                      {[
                        { key: "all", en: "All", ar: "الكل" },
                        { key: "male", en: "Male", ar: "ذكر" },
                        { key: "female", en: "Female", ar: "أنثى" },
                      ].map((o) => (
                        <ToggleGroupItem
                          key={o.key}
                          value={o.key}
                          className="h-9 px-4 rounded-xl border-none bg-[#F5F2F0] text-[11px] font-bold data-[state=on]:bg-[#3C7A57] data-[state=on]:text-white"
                        >
                          {t(o.en, o.ar)}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </AccordionContent>
                </AccordionItem>

                {/* Age */}
                <AccordionItem value="age" className="border-none bg-white shadow-sm rounded-2xl px-4">
                  <AccordionTrigger className="text-[13px] font-extrabold text-[#2F2A24] hover:no-underline py-4 uppercase tracking-wide">
                    {t("Age Range", "العمر")}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5">
                    <ToggleGroup
                      type="single"
                      value={age}
                      onValueChange={(v) => setAge(v || "all")}
                      className="flex flex-wrap gap-2 justify-start"
                    >
                      {[
                        { key: "all", en: "Any", ar: "الكل" },
                        { key: "baby", en: "Baby", ar: "صغير" },
                        { key: "young", en: "Young", ar: "يافع" },
                        { key: "adult", en: "Adult", ar: "بالغ" },
                      ].map((o) => (
                        <ToggleGroupItem
                          key={o.key}
                          value={o.key}
                          className="h-9 px-4 rounded-xl border-none bg-[#F5F2F0] text-[11px] font-bold data-[state=on]:bg-[#3C7A57] data-[state=on]:text-white"
                        >
                          {t(o.en, o.ar)}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Adoptable */}
              <div className="flex items-center justify-between p-4 rounded-[20px] bg-white shadow-sm">
                <span className="text-[11px] font-extrabold text-[#2F2A24] uppercase tracking-wider">
                  {t("Adoptable only", "القابلين للتبنّي فقط")}
                </span>
                <Switch checked={onlyAdoptable} onCheckedChange={setOnlyAdoptable} className="data-[state=checked]:bg-[#3C7A57]" />
              </div>

              {/* Pagination controls */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-2xl border-[#E7DCD0] bg-white hover:bg-[#F5F2F0]"
                  disabled={!canPrev}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className={isAr ? "mr-2" : "ml-2"}>{t("Prev", "السابق")}</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex-1 rounded-2xl border-[#E7DCD0] bg-white hover:bg-[#F5F2F0]"
                  disabled={!canNext}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <span className={isAr ? "mr-2" : "ml-2"}>{t("Next", "التالي")}</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </aside>

            {/* Grid */}
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => {
                  const name = p?.name || `#${p?.id}`;
                  const typeName = p?.pet_type?.name || "";
                  const breedName = p?.pet_breed?.name || "";
                  const cover = p?.cover_image || null;

                  return (
                    <div
                      key={p.id}
                      className="group bg-white rounded-[32px] overflow-hidden border border-[#E7DCD0]/20 hover:shadow-2xl hover:shadow-[#3C7A57]/5 transition-all duration-500"
                    >
                      {/* ✅ الصورة من الباك فقط */}
                      <div className="relative aspect-[1.1/1] m-2.5 overflow-hidden rounded-[24px] bg-[#FBF7F1]">
                        {cover ? (
                          <img src={cover} alt={name} className="h-full w-full object-cover" draggable="false" />
                        ) : (
                          <div className="h-full w-full grid place-items-center text-[#2F2A24]/40 font-extrabold text-sm">
                            {t("No image", "لا يوجد صورة")}
                          </div>
                        )}

                        <button
                          type="button"
                          className={`absolute top-3 ${isAr ? "left-3" : "right-3"} h-9 w-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-sm text-[#E84855] active:scale-90 hover:bg-white`}
                          aria-label="favorite"
                        >
                          <Heart className="h-4 w-4" />
                        </button>
                      </div>

                      {/* ✅ عرض فقط: الاسم + النوع + السلالة */}
                      <div className="p-5 pt-1">
                        <h3 className="text-xl font-extrabold text-[#2F2A24] tracking-tight truncate">{name}</h3>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {typeName ? (
                            <Badge className="bg-[#3C7A57]/10 text-[#3C7A57] border-none font-bold text-[11px] px-3 py-1 rounded-full">
                              {typeName}
                            </Badge>
                          ) : null}

                          {breedName ? (
                            <Badge className="bg-[#2F2A24]/5 text-[#2F2A24]/70 border-none font-bold text-[11px] px-3 py-1 rounded-full">
                              {breedName}
                            </Badge>
                          ) : null}
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Button
                            asChild
                            variant="outline"
                            className="flex-1 rounded-xl border-[#E7DCD0] text-[#2F2A24]/70 text-[11px] font-extrabold h-10 hover:bg-[#F5F2F0]"
                          >
                            <Link to={`/pets/${p.id}`} state={{ background: location }}>
                              {t("DETAILS", "تفاصيل")}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!filtered.length ? (
                <div className="rounded-[22px] border border-[#E7DCD0] bg-white p-6">
                  <div className="font-extrabold">{t("No results", "لا يوجد نتائج")}</div>
                  <div className="mt-1 text-sm text-[#2F2A24]/70">
                    {t("Try changing filters or page.", "جرّبي تغيّري الفلاتر أو الصفحة.")}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
