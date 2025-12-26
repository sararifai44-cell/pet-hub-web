// src/pages/AdoptPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import { Search, PackageSearch, Filter } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import AdoptFilters from "@/features/pets/components/AdoptFilters";
import PetCard from "@/features/pets/components/PetCard";
import { usePetFilters } from "@/features/pets/hooks/usePetFilters";

import { useGetPetsQuery } from "@/features/pets/petsApiSlice";
import { useGetPetTypesQuery } from "@/features/petTypes/petTypesApiSlice";
import { useGetPetBreedsQuery } from "@/features/petBreeds/petBreedsApiSlice";

const asArray = (res) =>
  Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

const pickName = (obj, isAr) => {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  if (typeof obj === "object") return isAr ? obj.name_ar || obj.name : obj.name_en || obj.name;
  return "";
};

export default function AdoptPage() {
  const location = useLocation();

  const [isAr] = useState(() =>
    typeof window !== "undefined"
      ? (navigator.language || "").toLowerCase().startsWith("ar")
      : false
  );
  const t = (en, ar) => (isAr ? ar : en);

  // pagination (نفس الربط)
  const [page, setPage] = useState(1);

  // data (نفس الربط)
  const { data: petsRes, isLoading, isError, error, refetch, isFetching } =
    useGetPetsQuery({ page });
  const pets = useMemo(() => asArray(petsRes), [petsRes]);
  const meta = petsRes?.meta;

  // ✅ types + breeds from API (نفس الربط)
  const { data: typesRes, isLoading: typesLoading } = useGetPetTypesQuery({ page: 1 });
  const { data: breedsRes, isLoading: breedsLoading } = useGetPetBreedsQuery({ page: 1 });

  const petTypes = useMemo(() => asArray(typesRes?.data ?? typesRes), [typesRes]);
  const petBreeds = useMemo(() => asArray(breedsRes?.data ?? breedsRes), [breedsRes]);

  // filters (نفس المنطق)
  const [q, setQ] = useState("");
  const [gender, setGender] = useState("all");
  const [age, setAge] = useState("all");
  const [onlyAdoptable, setOnlyAdoptable] = useState(false);

  // type/breed ids (single-select)
  const [typeId, setTypeId] = useState("all");
  const [breedId, setBreedId] = useState("all");

  // breeds filtered by selected type (نفسه)
  const availableBreeds = useMemo(() => {
    if (typeId === "all") return petBreeds;
    const n = Number(typeId);
    return petBreeds.filter((b) => Number(b?.pet_type?.id) === n);
  }, [petBreeds, typeId]);

  // إذا النوع تغيّر والسلالة مو من ضمنهم -> رجّع all (نفسه)
  useEffect(() => {
    if (breedId === "all") return;
    const ok = availableBreeds.some((b) => Number(b.id) === Number(breedId));
    if (!ok) setBreedId("all");
  }, [typeId, availableBreeds, breedId]);

  const onReset = useCallback(() => {
    setQ("");
    setGender("all");
    setAge("all");
    setOnlyAdoptable(false);
    setTypeId("all");
    setBreedId("all");
    setPage(1);
  }, []);

  // hook (مثل useProductFilters)
  const { filtered, getName, getTypeName, getBreedName } = usePetFilters({
    pets,
    isAr,
    query: q,
    gender,
    age,
    onlyAdoptable,
    typeId,
    breedId,
  });

  const currentPage = meta?.current_page ?? page;
  const lastPage = meta?.last_page ?? page;
  const canPrev = currentPage > 1;
  const canNext = currentPage < lastPage;

  if (isLoading) {
    return (
      <div className="pt-20 text-center animate-pulse text-[#3C7A57] font-medium">
        {t("Loading adoption...", "جاري تحميل التبنّي...")}
      </div>
    );
  }

  if (isError) {
    const status = error?.status;
    return (
      <div className="min-h-screen bg-[#FDFCFB]" dir={isAr ? "rtl" : "ltr"}>
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 md:px-8 pt-6 pb-20">
          <div className="rounded-xl border border-[#E7DCD0] bg-white p-6">
            <div className="text-lg font-semibold text-[#2F2A24]">
              {t("Couldn’t load pets", "ما قدرنا نجيب الحيوانات")}
            </div>
            <div className="mt-2 text-sm text-[#2F2A24]/70">
              {status ? `${t("Status", "الحالة")}: ${status}` : t("Please try again.", "جرّبي مرة تانية.")}
            </div>
            <div className="mt-5 flex gap-2">
              <Button
                variant="outline"
                className="rounded-lg border-[#E7DCD0] bg-white hover:bg-[#FBF7F1]"
                onClick={refetch}
              >
                {t("Retry", "إعادة المحاولة")}
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]" dir={isAr ? "rtl" : "ltr"}>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 md:px-8 pt-6 pb-20">
        {/* ✅ Header مثل Shop */}
        <header className="mb-8 py-5 px-8 rounded-xl bg-[#F7F3F0] border border-[#E7DCD0]/50 relative flex flex-row items-center justify-between overflow-hidden">
        <div className="relative z-10 space-y-1">
<h1 className="text-xl md:text-2xl font-semibold text-[#2F2A24]">
    {t("Browse pets and adopt ", "تصفّحي الحيوانات وتبنّي")}
    <span className="text-[#3C7A57]">{t("with confidence", "بكل ثقة")}</span>
  </h1>
  <p className="text-[#8C8276] text-[11px] font-medium">
    {t("A small step for you, a big change for them.", "خطوة صغيرة منك… وتغيير كبير لهم.")}
  </p>
</div>

   <div className="hidden lg:flex items-center gap-10 border-x border-[#E7DCD0]/60 px-12">
  <div className="text-center">
    <div className="text-[#3C7A57] font-semibold text-sm">
      {t("Safe Adoption", "تبنّي آمن")}
    </div>
    <div className="text-[9px] text-[#8C8276] uppercase font-semibold tracking-tight">
      {t("Verified pets & info", "حيوانات ومعلومات موثوقة")}
    </div>
  </div>

  <div className="text-center">
    <div className="text-[#3C7A57] font-semibold text-sm">
      {t("Find Your Match", "اختاري الأنسب")}
    </div>
    <div className="text-[9px] text-[#8C8276] uppercase font-semibold tracking-tight">
      {t("Type • Breed • Age", "نوع • سلالة • عمر")}
    </div>
  </div>
</div>

          <div className="relative shrink-0">
            <img
              src="/pethub-logo (2).png"
              alt="PetHub"
              className="h-14 md:h-18 w-auto object-contain"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* LEFT */}
          <aside className="lg:sticky lg:top-24 h-fit space-y-6">
            {/* ✅ Type */}
            <div className="bg-white border border-[#E7DCD0] rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-semibold text-[#2F2A24] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Filter size={14} className="text-[#3C7A57]" />
                {t("Pet Type", "نوع الأليف")}
              </h3>

              <div className="space-y-3 max-h-[240px] overflow-auto pr-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="type-all"
                    className="border-[#E7DCD0]"
                    checked={typeId === "all"}
                    onCheckedChange={() => setTypeId("all")}
                  />
                  <label htmlFor="type-all" className="text-sm font-medium text-[#8C8276] cursor-pointer">
                    {t("All", "الكل")}
                  </label>
                </div>

                {(petTypes || []).map((tp) => {
                  const id = String(tp?.id);
                  return (
                    <div key={id} className="flex items-center gap-2">
                      <Checkbox
                        id={`type-${id}`}
                        className="border-[#E7DCD0]"
                        disabled={typesLoading}
                        checked={typeId === id}
                        onCheckedChange={(v) => setTypeId(v ? id : "all")}
                      />
                      <label htmlFor={`type-${id}`} className="text-sm font-medium text-[#8C8276] cursor-pointer">
                        {pickName(tp, isAr) || tp?.name || `#${id}`}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ✅ Breed */}
            <div className="bg-white border border-[#E7DCD0] rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-semibold text-[#2F2A24] uppercase tracking-wider mb-4">
                {t("Breed", "السلالة")}
              </h3>

              <div className="space-y-3 max-h-[240px] overflow-auto pr-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="breed-all"
                    className="border-[#E7DCD0]"
                    checked={breedId === "all"}
                    onCheckedChange={() => setBreedId("all")}
                  />
                  <label htmlFor="breed-all" className="text-sm font-medium text-[#8C8276] cursor-pointer">
                    {t("All", "الكل")}
                  </label>
                </div>

                {(availableBreeds || []).map((br) => {
                  const id = String(br?.id);
                  return (
                    <div key={id} className="flex items-center gap-2">
                      <Checkbox
                        id={`breed-${id}`}
                        className="border-[#E7DCD0]"
                        disabled={breedsLoading}
                        checked={breedId === id}
                        onCheckedChange={(v) => setBreedId(v ? id : "all")}
                      />
                      <label htmlFor={`breed-${id}`} className="text-sm font-medium text-[#8C8276] cursor-pointer">
                        {pickName(br, isAr) || br?.name || `#${id}`}
                      </label>
                    </div>
                  );
                })}

                {typeId !== "all" && !availableBreeds.length ? (
                  <div className="text-xs text-[#2F2A24]/55 mt-2">
                    {t("No breeds for selected type.", "لا يوجد سلالات لهذا النوع.")}
                  </div>
                ) : null}
              </div>

              <div className="mt-5 flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-lg border-[#E7DCD0] bg-white hover:bg-[#FBF7F1] flex-1"
                  onClick={() => {
                    setTypeId("all");
                    setBreedId("all");
                  }}
                >
                  {t("Clear", "مسح")}
                </Button>
              </div>
            </div>
          </aside>

          {/* RIGHT */}
          <section className="lg:col-span-3 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 p-3 bg-white border border-[#E7DCD0] rounded-xl shadow-sm items-center">
              <div className="relative flex-1 w-full">
                <Search
                  className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-[#A39C94] ${
                    isAr ? "right-4" : "left-4"
                  }`}
                />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("Search pets...", "ابحثي عن الحيوانات...")}
                  className={`h-10 rounded-lg border-none bg-[#FBF7F1] focus-visible:ring-1 focus-visible:ring-[#3C7A57] ${
                    isAr ? "pr-10" : "pl-10"
                  }`}
                />
              </div>

          <AdoptFilters
  gender={gender}
  setGender={setGender}
  age={age}
  setAge={setAge}
  isAr={isAr}
  onReset={onReset}
/>
            </div>

            {filtered.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filtered.map((p) => (
                    <PetCard
                      key={p.id}
                      p={p}
                      isAr={isAr}
                      name={getName(p) || `#${p?.id}`}
                      typeName={getTypeName(p)}
                      breedName={getBreedName(p)}
                      location={location}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="h-9 rounded-lg border-[#E7DCD0] bg-white hover:bg-[#FBF7F1]"
                    disabled={!canPrev}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    {t("Prev", "السابق")}
                  </Button>

                  <div className="text-xs text-[#8C8276] px-2">
                    {t("Page", "صفحة")} {currentPage} / {lastPage}
                  </div>

                  <Button
                    variant="outline"
                    className="h-9 rounded-lg border-[#E7DCD0] bg-white hover:bg-[#FBF7F1]"
                    disabled={!canNext}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    {t("Next", "التالي")}
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-20 text-center border border-dashed border-[#E7DCD0] rounded-xl bg-white/50">
                <PackageSearch className="mx-auto h-10 w-10 text-[#D9D1C9] mb-3" />
                <Button
                  variant="link"
                  onClick={onReset}
                  className="text-[#3C7A57] font-semibold underline"
                >
                  {t("Reset Search", "إعادة ضبط البحث")}
                </Button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
