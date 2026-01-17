import React, { useMemo, useState, useCallback } from "react";
import Navbar from "@/components/common/Navbar";
import { Search, PackageSearch, Filter, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate, useLocation } from "react-router-dom";

import { getToken } from "@/app/apiSlice";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import ShopFilters from "@/features/Products/components/ShopFilters";
import ProductCard from "@/features/Products/components/ProductCard";
import { useAddItemToCartMutation } from "@/features/cart/cartApiSlice";
import { useGetProductsQuery } from "@/features/Products/productsApiSlice";
import { useProductFilters } from "@/features/Products/hooks/useProductFilters";

import { useGetPetTypesQuery } from "@/features/petTypes/petTypesApiSlice";
import { useGetProductCategoriesQuery } from "@/features/productCategories/productCategoriesApiSlice";

const headerPets = ["/cat.jpg", "/bird.jpg", "/h3-cat-pet-container.jpg"];

const uniq = (arr) => Array.from(new Set(arr));
const sameArray = (a = [], b = []) => {
  const A = uniq(a).slice().sort().join("|");
  const B = uniq(b).slice().sort().join("|");
  return A === B;
};

export default function ShopPage() {
  // English-only UI
  const isAr = false;

  const navigate = useNavigate();
  const location = useLocation();

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");

  const [animalsDraft, setAnimalsDraft] = useState([]);
  const [categoriesDraft, setCategoriesDraft] = useState([]);

  const [animalsApplied, setAnimalsApplied] = useState([]);
  const [categoriesApplied, setCategoriesApplied] = useState([]);

  const { data: productsRes, isLoading } = useGetProductsQuery({ page });

  const [addItemToCart, { isLoading: adding }] = useAddItemToCartMutation();
  const [addingId, setAddingId] = useState(null); // ✅ per-product loading

  const { data: typesRes } = useGetPetTypesQuery({ page: 1 });
  const { data: catRes } = useGetProductCategoriesQuery({ page: 1 });

  const petTypes = useMemo(
    () =>
      Array.isArray(typesRes?.data)
        ? typesRes.data
        : Array.isArray(typesRes)
        ? typesRes
        : [],
    [typesRes]
  );

  const productCategories = useMemo(
    () =>
      Array.isArray(catRes?.data)
        ? catRes.data
        : Array.isArray(catRes)
        ? catRes
        : [],
    [catRes]
  );

  const products = useMemo(
    () => (Array.isArray(productsRes?.data) ? productsRes.data : []),
    [productsRes]
  );

  const { filtered: baseFiltered, getName } = useProductFilters({
    products,
    isAr,
    query,
    sort,
  });

  const filtered = useMemo(() => {
    return baseFiltered.filter((p) => {
      const typeId = p?.pet_type?.id != null ? String(p.pet_type.id) : null;
      const catId = p?.category?.id != null ? String(p.category.id) : null;

      const okType =
        !animalsApplied.length || (typeId && animalsApplied.includes(typeId));
      const okCategory =
        !categoriesApplied.length ||
        (catId && categoriesApplied.includes(catId));

      return okType && okCategory;
    });
  }, [baseFiltered, animalsApplied, categoriesApplied]);

  const toggle = (arr, id) =>
    arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];

  const hasPendingLeftChanges = useMemo(() => {
    return (
      !sameArray(animalsDraft, animalsApplied) ||
      !sameArray(categoriesDraft, categoriesApplied)
    );
  }, [animalsDraft, animalsApplied, categoriesDraft, categoriesApplied]);

  const applyLeftFilters = useCallback(() => {
    setAnimalsApplied(animalsDraft);
    setCategoriesApplied(categoriesDraft);
  }, [animalsDraft, categoriesDraft]);

  const clearLeftFilters = useCallback(() => {
    setAnimalsDraft([]);
    setCategoriesDraft([]);
    setAnimalsApplied([]);
    setCategoriesApplied([]);
  }, []);

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

  const handleAdd = useCallback(
    async (p) => {
      const token = getToken();
      if (!token) {
        openAuthDialog();
        return;
      }

      setAddingId(p?.id ?? null);

      try {
        await addItemToCart({ product_id: p.id, quantity: 1 }).unwrap();
        toast.success("Added to cart", {
          description: getName(p),
          duration: 2500,
        });
      } catch (e) {
        if (isAuthError(e)) {
          openAuthDialog();
          return;
        }
        toast.error("Failed to add item", { duration: 2500 });
      } finally {
        setAddingId(null);
      }
    },
    [addItemToCart, getName, openAuthDialog]
  );

  const onReset = useCallback(() => {
    setQuery("");
    setSort("newest");
    clearLeftFilters();
  }, [clearLeftFilters]);

  if (isLoading) {
    return (
      <div className="pt-20 text-center animate-pulse text-[#3C7A57] font-medium">
        Loading store...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]" dir="ltr">
      <Navbar />

      {/* Auth Dialog */}
      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        {/* التعديل هنا: إضافة bg-white للـ DialogContent */}
        <DialogContent className="sm:max-w-[420px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold">
              Login required
            </DialogTitle>
            <DialogDescription className="text-sm">
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
                navigate("/login", { state: { from: authFrom }, replace: true });
              }}
              className="rounded-xl bg-[#3C7A57] hover:bg-[#336A4C] text-white"
            >
              Go to Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <main className="mx-auto max-w-7xl px-4 md:px-8 pt-6 pb-20">
        {/* Header */}
        <header className="relative bg-[#387365] p-6 md:p-10 rounded-xl shadow-md flex flex-col md:flex-row md:items-center justify-between overflow-hidden mb-8 border-b-4 border-[#2d5c51]">
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <PackageSearch className="w-64 h-64 text-white" />
          </div>

          <div className="z-10">
            {/* ✅ Home button */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-white/90 font-bold hover:text-white transition-colors w-fit group text-xs mb-3
              rounded-lg border border-white/15 bg-white/10 px-3 py-2 hover:bg-white/15"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Home</span>
            </button>

            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Shop <span className="text-white/85">for your pet</span>
            </h1>

            <p className="text-white/80 text-sm mt-1 font-medium max-w-xl">
              Carefully selected essentials, food, and accessories — all in one
              place.
            </p>

        
          </div>

          <div className="flex items-center gap-4 z-10 mt-5 md:mt-0">
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
            <div className="bg-white border-2 border-[#D1C2B4] rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-semibold text-[#2F2A24] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Filter size={14} className="text-[#3C7A57]" />
                Animal Type
              </h3>

              <div className="space-y-3">
                {petTypes.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`a-${item.id}`}
                      className="border-[#D1C2B4]"
                      checked={animalsDraft.includes(String(item.id))}
                      onCheckedChange={() =>
                        setAnimalsDraft((prev) => toggle(prev, String(item.id)))
                      }
                    />
                    <label
                      htmlFor={`a-${item.id}`}
                      className="text-sm font-medium text-[#8C8276] cursor-pointer"
                    >
                      {item.name_en ?? item.name_ar}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white border-2 border-[#D1C2B4] rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-semibold text-[#2F2A24] uppercase tracking-wider mb-4">
                Categories
              </h3>

              <div className="space-y-3">
                {productCategories.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`c-${item.id}`}
                      className="border-[#D1C2B4]"
                      checked={categoriesDraft.includes(String(item.id))}
                      onCheckedChange={() =>
                        setCategoriesDraft((prev) =>
                          toggle(prev, String(item.id))
                        )
                      }
                    />
                    <label
                      htmlFor={`c-${item.id}`}
                      className="text-sm font-medium text-[#8C8276] cursor-pointer"
                    >
                      {item.name_en ?? item.name_ar}
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
                  Apply filters
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-lg border-[#D1C2B4] bg-white hover:bg-[#FBF7F1]"
                  onClick={clearLeftFilters}
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
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for supplies..."
                  className="h-10 rounded-lg border-none bg-[#FBF7F1] focus-visible:ring-1 focus-visible:ring-[#3C7A57] pl-10"
                />
              </div>

              <ShopFilters sort={sort} setSort={setSort} onReset={onReset} />
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
                    adding={adding && addingId === p.id}
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
