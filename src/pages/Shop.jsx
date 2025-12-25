// src/pages/ShopPage.jsx
import React, { useMemo, useState, useCallback } from "react";
import Navbar from "@/components/common/Navbar";
import { Search, PackageSearch, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

import ShopFilters from "@/features/Products/components/ShopFilters";
import ProductCard from "@/features/Products/components/ProductCard";
import { useAddItemToCartMutation } from "@/features/cart/cartApiSlice";
import { useGetProductsQuery } from "@/features/Products/productsApiSlice";
import { useProductFilters } from "@/features/Products/hooks/useProductFilters";

const uniq = (arr) => Array.from(new Set(arr));
const sameArray = (a = [], b = []) => {
  const A = uniq(a).slice().sort().join("|");
  const B = uniq(b).slice().sort().join("|");
  return A === B;
};

export default function ShopPage() {
  const [isAr] = useState(() =>
    typeof window !== "undefined"
      ? (navigator.language || "").toLowerCase().startsWith("ar")
      : false
  );

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState("all");
  const [sort, setSort] = useState("newest");

  // ✅ Draft (يتغير مع التشيك بوكس بس ما يفلتر مباشرة)
  const [animalsDraft, setAnimalsDraft] = useState([]);
  const [categoriesDraft, setCategoriesDraft] = useState([]);

  // ✅ Applied (هو اللي يفلتر فعلياً بعد Apply)
  const [animalsApplied, setAnimalsApplied] = useState([]);
  const [categoriesApplied, setCategoriesApplied] = useState([]);

  const { data: productsRes, isLoading } = useGetProductsQuery({ page });
  const [addItemToCart, { isLoading: adding }] = useAddItemToCartMutation();

  const products = useMemo(
    () => (Array.isArray(productsRes?.data) ? productsRes.data : []),
    [productsRes]
  );

  // ✅ فلترة عامة (بحث + توفر + ترتيب) من hook
  const { filtered: baseFiltered, getName } = useProductFilters({
    products,
    isAr,
    query,
    availability,
    sort,
  });

  // ✅ فلترة اليسار (Types + Categories) - من React فقط + Apply
  const filtered = useMemo(() => {
    const textOf = (p) => {
      const name = (isAr ? p?.name_ar : p?.name_en) || p?.name || "";
      const desc = p?.description || "";
      return `${name} ${desc}`.toLowerCase();
    };

    const petTypeOf = (p) =>
      (p?.pet_type?.key ||
        p?.petType ||
        p?.pet_type ||
        p?.animal_type ||
        "")
        .toString()
        .toLowerCase();

    const categoryOf = (p) =>
      (p?.category?.key || p?.category || p?.product_category || "")
        .toString()
        .toLowerCase();

    const animalKeywords = {
      cat: ["cat", "kitten", "قط", "قطط"],
      dog: ["dog", "puppy", "كلب", "كلاب"],
      bird: ["bird", "parrot", "طير", "طيور"],
    };

    const categoryKeywords = {
      food: ["food", "feed", "طعام", "اكل", "أكل"],
      toys: ["toy", "toys", "لعبة", "ألعاب", "لعب"],
      grooming: ["groom", "grooming", "care", "عناية", "تنظيف"],
    };

    const matchAny = (haystack, words = []) =>
      words.some((w) => haystack.includes(w));

    return baseFiltered.filter((p) => {
      const txt = textOf(p);

      // ✅ Types
      const okAnimal = (() => {
        if (!animalsApplied.length) return true;

        const pt = petTypeOf(p);
        if (pt) return animalsApplied.includes(pt);

        return animalsApplied.some((a) =>
          matchAny(txt, animalKeywords[a] || [])
        );
      })();
      if (!okAnimal) return false;

      // ✅ Categories
      const okCategory = (() => {
        if (!categoriesApplied.length) return true;

        const cat = categoryOf(p);
        if (cat) return categoriesApplied.includes(cat);

        return categoriesApplied.some((c) =>
          matchAny(txt, categoryKeywords[c] || [])
        );
      })();

      return okCategory;
    });
  }, [baseFiltered, animalsApplied, categoriesApplied, isAr]);

  const toggle = (arr, id) =>
    arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];

  const hasPendingLeftChanges = useMemo(() => {
    return (
      !sameArray(animalsDraft, animalsApplied) ||
      !sameArray(categoriesDraft, categoriesApplied)
    );
  }, [animalsDraft, animalsApplied, categoriesDraft, categoriesApplied]);

  // ✅ APPLY: بدون توستر — بس طبّق الفلاتر
  const applyLeftFilters = useCallback(() => {
    setAnimalsApplied(animalsDraft);
    setCategoriesApplied(categoriesDraft);
  }, [animalsDraft, categoriesDraft]);

  // ✅ CLEAR: بدون توستر — بس صفّر
  const clearLeftFilters = useCallback(() => {
    setAnimalsDraft([]);
    setCategoriesDraft([]);
    setAnimalsApplied([]);
    setCategoriesApplied([]);
  }, []);

  // ✅ التوستر بيضل بس للـ Add to cart
  const handleAdd = useCallback(
    async (p) => {
      try {
        await addItemToCart({ product_id: p.id, quantity: 1 }).unwrap();
        toast.success(isAr ? "تمت الإضافة للسلة" : "Added to cart", {
          description: getName(p),
          duration: 2500,
        });
      } catch (e) {
        const status = e?.status;
        toast.error(
          status === 401
            ? isAr
              ? "لازم تسجّلي دخول أولاً"
              : "Please login first"
            : isAr
            ? "فشل في الإضافة للسلة"
            : "Failed to add item",
          { duration: 2500 }
        );
      }
    },
    [addItemToCart, getName, isAr]
  );

  const onReset = useCallback(() => {
    setQuery("");
    setAvailability("all");
    setSort("newest");
    clearLeftFilters();
  }, [clearLeftFilters]);

  if (isLoading) {
    return (
      <div className="pt-20 text-center animate-pulse text-[#3C7A57] font-medium">
        {isAr ? "جاري تحميل المتجر..." : "Loading store..."}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]" dir={isAr ? "rtl" : "ltr"}>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 md:px-8 pt-6 pb-20">
        {/* ✅ الهيدر: لا تغيير */}
        <header className="mb-8 py-5 px-8 rounded-xl bg-[#F7F3F0] border border-[#E7DCD0]/50 relative flex flex-row items-center justify-between overflow-hidden">
          <div className="relative z-10 space-y-1">
            <h1 className="text-xl md:text-2xl font-semibold text-[#2F2A24]">
              {isAr ? "عالم من " : "A world of "}
              <span className="text-[#3C7A57]">
                {isAr ? "السعادة والراحة" : "Happiness"}
              </span>
            </h1>
            <p className="text-[#8C8276] text-[11px] font-medium">
              {isAr
                ? "منتجات مختارة بعناية لصحة حيوانك"
                : "Carefully selected for your pet's health"}
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-10 border-x border-[#E7DCD0]/60 px-12">
            <div className="text-center">
              <div className="text-[#3C7A57] font-semibold text-sm">+500</div>
              <div className="text-[9px] text-[#8C8276] uppercase font-semibold tracking-tight">
                {isAr ? "عميل سعيد" : "Happy Client"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[#3C7A57] font-semibold text-sm">100%</div>
              <div className="text-[9px] text-[#8C8276] uppercase font-semibold tracking-tight">
                {isAr ? "أصلي" : "Original"}
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
            {/* ✅ Types */}
            <div className="bg-white border border-[#E7DCD0] rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-semibold text-[#2F2A24] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Filter size={14} className="text-[#3C7A57]" />
                {isAr ? "نوع الأليف" : "Animal Type"}
              </h3>

              <div className="space-y-3">
                {[
                  { id: "dog", label: isAr ? "كلاب" : "Dogs" },
                  { id: "cat", label: isAr ? "قطط" : "Cats" },
                  { id: "bird", label: isAr ? "طيور" : "Birds" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`a-${item.id}`}
                      className="border-[#E7DCD0]"
                      checked={animalsDraft.includes(item.id)}
                      onCheckedChange={() =>
                        setAnimalsDraft((prev) => toggle(prev, item.id))
                      }
                    />
                    <label
                      htmlFor={`a-${item.id}`}
                      className="text-sm font-medium text-[#8C8276] cursor-pointer"
                    >
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* ✅ Categories + Apply */}
            <div className="bg-white border border-[#E7DCD0] rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-semibold text-[#2F2A24] uppercase tracking-wider mb-4">
                {isAr ? "التصنيفات" : "Categories"}
              </h3>

              <div className="space-y-3">
                {[
                  { id: "food", label: isAr ? "الأغذية" : "Food" },
                  { id: "toys", label: isAr ? "الألعاب" : "Toys" },
                  { id: "grooming", label: isAr ? "العناية" : "Grooming" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`c-${item.id}`}
                      className="border-[#E7DCD0]"
                      checked={categoriesDraft.includes(item.id)}
                      onCheckedChange={() =>
                        setCategoriesDraft((prev) => toggle(prev, item.id))
                      }
                    />
                    <label
                      htmlFor={`c-${item.id}`}
                      className="text-sm font-medium text-[#8C8276] cursor-pointer"
                    >
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-2">
                <Button
                  type="button"
                  className="h-9 rounded-lg bg-[#3C7A57] text-white hover:bg-[#2F5F43] flex-1"
                  onClick={applyLeftFilters}
                  disabled={!hasPendingLeftChanges}
                >
                  {isAr ? "تطبيق الفلاتر" : "Apply filters"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-lg border-[#E7DCD0] bg-white hover:bg-[#FBF7F1]"
                  onClick={clearLeftFilters}
                >
                  {isAr ? "مسح" : "Clear"}
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
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    isAr ? "ابحثي عن مستلزمات..." : "Search for supplies..."
                  }
                  className={`h-10 rounded-lg border-none bg-[#FBF7F1] focus-visible:ring-1 focus-visible:ring-[#3C7A57] ${
                    isAr ? "pr-10" : "pl-10"
                  }`}
                />
              </div>

              <ShopFilters
                availability={availability}
                setAvailability={setAvailability}
                sort={sort}
                setSort={setSort}
                isAr={isAr}
                onReset={onReset}
              />
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {filtered.map((p) => (
                  <ProductCard
                    key={p.id}
                    p={p}
                    isAr={isAr}
                    name={getName(p)}
                    onAdd={handleAdd}
                    adding={adding}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center border border-dashed border-[#E7DCD0] rounded-xl bg-white/50">
                <PackageSearch className="mx-auto h-10 w-10 text-[#D9D1C9] mb-3" />
                <Button
                  variant="link"
                  onClick={onReset}
                  className="text-[#3C7A57] font-semibold underline"
                >
                  {isAr ? "إعادة ضبط البحث" : "Reset Search"}
                </Button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
