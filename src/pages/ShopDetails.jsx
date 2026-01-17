// src/pages/ShopDetails.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/common/Navbar";

import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  X,
  ShoppingCart,
  ShieldCheck,
  Truck,
  Home,
  Maximize2,
  Sparkles,
  PackageSearch,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { useAddItemToCartMutation } from "@/features/cart/cartApiSlice";
import { useGetProductByIdQuery } from "@/features/Products/productsApiSlice";

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
const money = (n) => `$${Number(n || 0).toFixed(2)}`;

function ProductGallery({ images = [], alt = "" }) {
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const total = images.length;

  useEffect(() => setIdx(0), [total]);

  const current = images[idx];
  const go = (dir) => {
    if (total) setIdx((p) => (p + dir + total) % total);
  };

  if (!total) {
    return (
      <div className="aspect-square rounded-2xl border-2 border-[#D1C2B4] bg-[#FBF7F1] animate-pulse" />
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="relative aspect-square w-full rounded-2xl border-2 border-[#D1C2B4] bg-white overflow-hidden group shadow-sm">
          <img
            src={current}
            alt={alt}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm border border-[#D1C2B4]/70 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Open image"
          >
            <Maximize2 className="h-4 w-4 text-[#2F2A24]" />
          </button>

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-sm border border-[#D1C2B4]/60"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-sm border border-[#D1C2B4]/60"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {total > 1 && (
          <div className="flex gap-2.5 overflow-x-auto justify-center py-1 no-scrollbar">
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                className={`h-12 w-12 shrink-0 rounded-lg border-2 transition-all overflow-hidden ${
                  i === idx
                    ? "border-[#3C7A57] scale-105 shadow-sm"
                    : "border-[#D1C2B4]/20 opacity-60 hover:opacity-100 hover:border-[#D1C2B4]/60"
                }`}
                aria-label={`Select image ${i + 1}`}
              >
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute top-6 right-6 text-white"
            aria-label="Close"
            onClick={() => setOpen(false)}
          >
            <X className="h-8 w-8" />
          </button>

          <img
            src={current}
            alt={alt}
            className="max-h-full max-w-full rounded-xl shadow-2xl"
          />
        </div>
      )}
    </>
  );
}

export default function ShopDetails() {
  // English-only UI
  const isAr = false;

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: product, isLoading, isError, error } = useGetProductByIdQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });

  const [addItemToCart, { isLoading: adding }] = useAddItemToCartMutation();

  const name = useMemo(() => {
    if (!product) return "";
    return product.name_en || product.name_ar || "";
  }, [product]);

  const desc = useMemo(() => product?.description || "", [product]);

  const images = useMemo(() => {
    const imgs = Array.isArray(product?.images) ? product.images : [];
    return imgs.length ? imgs : product?.cover_image ? [product.cover_image] : [];
  }, [product]);

  const inStock = useMemo(
    () => Number(product?.stock_quantity ?? 0) > 0,
    [product]
  );

  // ===================== AUTH DIALOG =====================
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authFrom, setAuthFrom] = useState("");

  const isAuthError = (errObj) => {
    const status = errObj?.status ?? errObj?.originalStatus;
    const msg = errObj?.data?.message ?? errObj?.data?.error ?? errObj?.error ?? "";
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
  // =======================================================

  const handleAdd = useCallback(async () => {
    if (!product?.id || !inStock) return;

    // ✅ Use site token (same as other pages)
    const token = getToken();
    if (!token) {
      openAuthDialog();
      return;
    }

    try {
      await addItemToCart({ product_id: product.id, quantity: 1 }).unwrap();
      toast.success("Added to cart");
    } catch (e) {
      if (isAuthError(e)) {
        openAuthDialog();
        return;
      }
      toast.error("Failed to add");
    }
  }, [product?.id, inStock, addItemToCart, openAuthDialog]);

  if (isLoading) {
    return (
      <div className="pt-40 text-center opacity-40 text-xs tracking-widest uppercase italic">
        PetHub Loading...
      </div>
    );
  }

  if (isError || !product) {
    const status = error?.status ?? error?.originalStatus;
    return (
      <div className="min-h-screen bg-[#FDFCFB] text-[#2F2A24]" dir="ltr">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 md:px-8 pt-6 pb-20">
          <div className="rounded-2xl border-2 border-[#D1C2B4] bg-white p-6 shadow-sm">
            <div className="text-lg font-extrabold">Couldn’t load product</div>
            <div className="mt-2 text-sm text-[#2F2A24]/70">
              {status ? `Status: ${status}` : "Please try again."}
            </div>
            <div className="mt-6 flex gap-2">
              <Button
                variant="outline"
                className="rounded-xl border-2 border-[#D1C2B4] bg-white hover:bg-[#FBF7F1]"
                onClick={() => navigate("/shop")}
              >
                Back to Shop
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2F2A24]" dir="ltr">
      <Navbar />

      {/* Auth Dialog */}
      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        {/* ✅ التعديل الوحيد: إضافة bg-white للـ DialogContent */}
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
        {/* Theme Header */}
        <header className="relative bg-[#387365] p-6 md:p-10 rounded-xl shadow-md flex flex-col md:flex-row md:items-center justify-between overflow-hidden mb-8 border-b-4 border-[#2d5c51]">
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <PackageSearch className="w-64 h-64 text-white" />
          </div>

          <div className="z-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-white/90 hover:bg-white/15 hover:text-white transition w-fit group"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Home</span>
              </button>

              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-white/90 hover:bg-white/15 hover:text-white transition w-fit group"
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                <span>Back to Shop</span>
              </Link>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Product Details{" "}
              <span className="text-white/85">• {name || "—"}</span>
            </h1>

            <p className="text-white/80 text-sm mt-1 font-medium max-w-xl">
              Carefully picked essentials for a happy, healthy pet.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-white/80">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Premium selection</span>
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Authentic</span>
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1">
                <Truck className="h-3.5 w-3.5" />
                <span>Fast delivery</span>
              </span>
            </div>
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

        {/* Content */}
        <div className="grid gap-8 lg:grid-cols-[420px_1fr] items-start">
          <section className="w-full">
            <ProductGallery images={images} alt={name} />
          </section>

          <section className="min-w-0">
            <div className="rounded-2xl border-2 border-[#D1C2B4] bg-white shadow-sm p-6">
              {product?.category ? (
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#3C7A57]">
                  {product.category.name_en || product.category.name_ar}
                </div>
              ) : null}

              <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-[#2F2A24]">
                {name}
              </h2>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#3C7A57] tracking-tight">
                  {money(product?.price)}
                </span>
                <span className="text-[10px] text-[#2F2A24]/45 font-bold uppercase tracking-widest">
                  USD
                </span>
              </div>

              <div className="my-6 h-px w-full bg-[#E7DCD0]" />

              <div className="space-y-2">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#2F2A24]/55">
                  Description
                </h3>
                <p className="text-sm text-[#2F2A24]/75 leading-relaxed">
                  {desc || "No description available."}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl border-2 border-[#D1C2B4] bg-[#FBF7F1] px-3 py-2">
                  <ShieldCheck className="h-4 w-4 text-[#387365]" />
                  <span className="text-[11px] font-bold text-[#2F2A24]/70">
                    Authentic product
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl border-2 border-[#D1C2B4] bg-[#FBF7F1] px-3 py-2">
                  <Truck className="h-4 w-4 text-[#387365]" />
                  <span className="text-[11px] font-bold text-[#2F2A24]/70">
                    Fast delivery
                  </span>
                </div>
              </div>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAdd}
                  disabled={adding || !inStock}
                  className="h-11 rounded-xl bg-[#3C7A57] hover:bg-[#2F5F43] text-white font-bold disabled:opacity-50 w-full sm:w-auto"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {adding ? "Adding..." : "Add to Cart"}
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="h-11 rounded-xl border-2 border-[#D1C2B4] bg-white hover:bg-[#FBF7F1] w-full sm:w-auto"
                >
                  <Link to="/shop">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
