// src/pages/AdoptPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import { Search, PackageSearch, Filter, PawPrint, ArrowLeft } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import AdoptFilters from "@/features/pets/components/AdoptFilters";
import PetCard from "@/features/pets/components/PetCard";
import { usePetFilters } from "@/features/pets/hooks/usePetFilters";

import { useGetPetsQuery } from "@/features/pets/petsApiSlice";
import { useGetPetTypesQuery } from "@/features/petTypes/petTypesApiSlice";
import { useGetPetBreedsQuery } from "@/features/petBreeds/petBreedsApiSlice";

import { getToken } from "@/app/apiSlice";

// Dialog (shadcn/ui)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const headerPets = ["/cat.jpg", "/bird.jpg", "/h3-cat-pet-container.jpg"];

const asArray = (res) =>
  Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

const pickName = (obj) => {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  if (typeof obj === "object") return obj.name_en || obj.name || obj.name_ar || "";
  return "";
};

export default function AdoptPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // English-only UI
  const isAr = false;

  const [page, setPage] = useState(1);

  const { data: petsRes, isLoading, isError, error, refetch } =
    useGetPetsQuery({ page });
  const pets = useMemo(() => asArray(petsRes), [petsRes]);
  const meta = petsRes?.meta;

  const { data: typesRes, isLoading: typesLoading } = useGetPetTypesQuery({
    page: 1,
  });
  const { data: breedsRes, isLoading: breedsLoading } = useGetPetBreedsQuery({
    page: 1,
  });

  const petTypes = useMemo(() => asArray(typesRes?.data ?? typesRes), [typesRes]);
  const petBreeds = useMemo(
    () => asArray(breedsRes?.data ?? breedsRes),
    [breedsRes]
  );

  const [q, setQ] = useState("");
  const [gender, setGender] = useState("all");
  const [age, setAge] = useState("all");
  const [onlyAdoptable, setOnlyAdoptable] = useState(false);

  const [typeId, setTypeId] = useState("all");
  const [breedId, setBreedId] = useState("all");

  // ✅ Adopt button loading per-card (like Add)
  const [adoptingId, setAdoptingId] = useState(null);

  // ===================== AUTH DIALOG (هنا) =====================
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authFrom, setAuthFrom] = useState("");
  const [pendingPetId, setPendingPetId] = useState(null);

  const openAuthDialog = useCallback(
    (petId) => {
      if (!petId) return;
      setPendingPetId(petId);
      // نرجّع المستخدم بعد اللوغ ان على صفحة التقديم مباشرة
      setAuthFrom(`/pets/${petId}/apply`);
      setAuthDialogOpen(true);
    },
    []
  );
  // ============================================================

  const availableBreeds = useMemo(() => {
    if (typeId === "all") return petBreeds;
    const n = Number(typeId);
    return petBreeds.filter((b) => Number(b?.pet_type?.id) === n);
  }, [petBreeds, typeId]);

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

  const handleAdopt = useCallback(
    (petId) => {
      if (!petId) return;

      const token = getToken();
      if (!token) {
        // ✅ إذا مو مسجّل: افتح دايلوغ اللوغ ان
        setAdoptingId(null);
        openAuthDialog(petId);
        return;
      }

      // ✅ إذا مسجّل: روح عصفحة التقديم
      setAdoptingId(petId);
      setTimeout(() => {
        navigate(`/pets/${petId}/apply`);
      }, 0);
    },
    [navigate, openAuthDialog]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB]">
        <Navbar />
        <div className="pt-20 text-center animate-pulse text-[#3C7A57] font-medium">
          Loading adoption...
        </div>
      </div>
    );
  }

  if (isError) {
    const status = error?.status;
    return (
      <div className="min-h-screen bg-[#FDFCFB]" dir="ltr">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 md:px-8 pt-6 pb-20">
          <div className="rounded-xl border-2 border-[#D1C2B4] bg-white p-6">
            <div className="text-lg font-semibold text-[#2F2A24]">
              Couldn’t load pets
            </div>
            <div className="mt-2 text-sm text-[#2F2A24]/70">
              {status ? `Status: ${status}` : "Please try again."}
            </div>
            <div className="mt-5 flex gap-2">
              <Button
                variant="outline"
                className="rounded-lg border-2 border-[#D1C2B4] bg-white hover:bg-[#FBF7F1]"
                onClick={refetch}
              >
                Retry
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]" dir="ltr">
      <Navbar />

      {/* ✅ Auth Dialog (Login required) */}
      <Dialog
        open={authDialogOpen}
        onOpenChange={(open) => {
          setAuthDialogOpen(open);
          if (!open) setPendingPetId(null);
        }}
      >
        <DialogContent
          className="
            sm:max-w-[420px]
            bg-white
            border border-slate-200
            rounded-2xl
            shadow-[0_20px_60px_-25px_rgba(2,6,23,0.55)]
          "
        >
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-slate-900">
              Login required
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              You need to login first to continue.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setAuthDialogOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>

            <Button
              onClick={() => {
                setAuthDialogOpen(false);
                navigate("/login", {
                  replace: true,
                  state: {
                    // رجّعه على صفحة التقديم بعد اللوغ ان
                    from: authFrom || (pendingPetId ? `/pets/${pendingPetId}/apply` : "/pets"),
                  },
                });
              }}
              className="rounded-xl bg-[#3C7A57] hover:bg-[#2F5F43] text-white"
            >
              Go to Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <main className="mx-auto max-w-7xl px-4 md:px-8 pt-6 pb-20">
        {/* ✅ Header (same theme + responsive) */}
        <header className="relative bg-[#387365] p-6 md:p-10 rounded-xl shadow-md flex flex-col md:flex-row md:items-center justify-between overflow-hidden mb-8 border-b-4 border-[#2d5c51]">
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <PawPrint className="w-64 h-64 text-white" />
          </div>

          <div className="z-10">
            {/* ✅ Back to Home button */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-white/90 font-bold hover:text-white transition-colors w-fit group text-xs mb-3
                      rounded-lg border border-white/15 bg-white/10 px-3 py-2 hover:bg-white/15"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Home</span>
            </button>

            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Adopt <span className="text-white/85">your next best friend</span>
            </h1>

            <p className="text-white/80 text-sm mt-1 font-medium max-w-xl">
              Search by type, breed, gender, and age — and find your perfect match.
            </p>
          </div>

          <div className="flex items-center gap-4 z-10 mt-5 md:mt-0">
            {/* images instead of logo */}
            <div className="hidden lg:flex -space-x-3">
              {headerPets.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  className="w-12 h-12 rounded-full border-2 border-white shadow-xl object-cover"
                  alt="pet"
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* LEFT */}
          <aside className="lg:sticky lg:top-24 h-fit space-y-6">
            {/* Type */}
            <div className="bg-white border-2 border-[#D1C2B4] rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-semibold text-[#2F2A24] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Filter size={14} className="text-[#3C7A57]" />
                Pet Type
              </h3>

              <div className="space-y-3 max-h-[240px] overflow-auto pr-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="type-all"
                    className="border-[#D1C2B4]"
                    checked={typeId === "all"}
                    onCheckedChange={() => setTypeId("all")}
                  />
                  <label
                    htmlFor="type-all"
                    className="text-sm font-medium text-[#8C8276] cursor-pointer"
                  >
                    All
                  </label>
                </div>

                {(petTypes || []).map((tp) => {
                  const id = String(tp?.id);
                  return (
                    <div key={id} className="flex items-center gap-2">
                      <Checkbox
                        id={`type-${id}`}
                        className="border-[#D1C2B4]"
                        disabled={typesLoading}
                        checked={typeId === id}
                        onCheckedChange={(v) => setTypeId(v ? id : "all")}
                      />
                      <label
                        htmlFor={`type-${id}`}
                        className="text-sm font-medium text-[#8C8276] cursor-pointer"
                      >
                        {pickName(tp) || tp?.name || `#${id}`}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Breed */}
            <div className="bg-white border-2 border-[#D1C2B4] rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-semibold text-[#2F2A24] uppercase tracking-wider mb-4">
                Breed
              </h3>

              <div className="space-y-3 max-h-[240px] overflow-auto pr-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="breed-all"
                    className="border-[#D1C2B4]"
                    checked={breedId === "all"}
                    onCheckedChange={() => setBreedId("all")}
                  />
                  <label
                    htmlFor="breed-all"
                    className="text-sm font-medium text-[#8C8276] cursor-pointer"
                  >
                    All
                  </label>
                </div>

                {(availableBreeds || []).map((br) => {
                  const id = String(br?.id);
                  return (
                    <div key={id} className="flex items-center gap-2">
                      <Checkbox
                        id={`breed-${id}`}
                        className="border-[#D1C2B4]"
                        disabled={breedsLoading}
                        checked={breedId === id}
                        onCheckedChange={(v) => setBreedId(v ? id : "all")}
                      />
                      <label
                        htmlFor={`breed-${id}`}
                        className="text-sm font-medium text-[#8C8276] cursor-pointer"
                      >
                        {pickName(br) || br?.name || `#${id}`}
                      </label>
                    </div>
                  );
                })}

                {typeId !== "all" && !availableBreeds.length ? (
                  <div className="text-xs text-[#2F2A24]/55 mt-2">
                    No breeds for selected type.
                  </div>
                ) : null}
              </div>

              <div className="mt-5 flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-lg border-2 border-[#D1C2B4] bg-white hover:bg-[#FBF7F1] flex-1"
                  onClick={() => {
                    setTypeId("all");
                    setBreedId("all");
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
          </aside>

          {/* RIGHT */}
          <section className="lg:col-span-3 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 p-3 bg-white border-2 border-[#D1C2B4] rounded-xl shadow-sm items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-[#A39C94] left-4" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search pets..."
                  className="h-10 rounded-lg border-none bg-[#FBF7F1] focus-visible:ring-1 focus-visible:ring-[#3C7A57] pl-10"
                />
              </div>

              <AdoptFilters
                gender={gender}
                setGender={setGender}
                age={age}
                setAge={setAge}
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
                      name={getName(p) || `#${p?.id}`}
                      typeName={getTypeName(p)}
                      breedName={getBreedName(p)}
                      location={location}
                      onAdopt={() => handleAdopt(p?.id)}
                      adopting={adoptingId === p?.id}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="h-9 rounded-lg border-2 border-[#D1C2B4] bg-white hover:bg-[#FBF7F1]"
                    disabled={!canPrev}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </Button>

                  <div className="text-xs text-[#8C8276] px-2">
                    Page {currentPage} / {lastPage}
                  </div>

                  <Button
                    variant="outline"
                    className="h-9 rounded-lg border-2 border-[#D1C2B4] bg-white hover:bg-[#FBF7F1]"
                    disabled={!canNext}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-[#D1C2B4] rounded-xl bg-white/50">
                <PackageSearch className="mx-auto h-10 w-10 text-[#D9D1C9] mb-3" />
                <Button
                  variant="link"
                  onClick={onReset}
                  className="text-[#3C7A57] font-semibold underline"
                >
                  Reset Search
                </Button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
