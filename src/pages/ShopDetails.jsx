import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/common/Navbar";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

import { useAddItemToCartMutation } from "@/features/cart/cartApiSlice";
import { useGetProductByIdQuery } from "@/features/Products/productsApiSlice";

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

function useIsArabic() {
  const [isAr, setIsAr] = useState(false);
  useEffect(() => {
    const lang = (navigator.language || "").toLowerCase();
    setIsAr(lang.startsWith("ar"));
  }, []);
  return isAr;
}

/** ✅ Fast slider */
function ProductImageSlider({ images = [], alt = "" }) {
  const [idx, setIdx] = useState(0);
  const total = images.length;

  useEffect(() => setIdx(0), [total]);

  const go = (dir) => {
    if (!total) return;
    setIdx((p) => (p + dir + total) % total);
  };

  if (!total) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#E7DCD0] bg-white">
      <div
        className="flex will-change-transform transition-transform duration-200 ease-out"
        style={{ transform: `translateX(-${idx * 100}%)` }}
      >
        {images.map((src, i) => (
          <div key={`${i}-${src}`} className="w-full flex-none">
            <div className="aspect-[4/3] w-full bg-[#FBF7F1]">
              <img
                src={src}
                alt={`${alt} ${i + 1}`}
                className="h-full w-full object-cover"
                draggable="false"
                loading="eager"
                decoding="async"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
          </div>
        ))}
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-[#E7DCD0] bg-white/90 text-[#2F2A24] hover:bg-white"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-[#E7DCD0] bg-white/90 text-[#2F2A24] hover:bg-white"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-white/40 bg-black/20 px-3 py-1.5 backdrop-blur-md">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                className={[
                  "h-2 w-2 rounded-full transition",
                  i === idx ? "bg-[#3C7A57]" : "bg-white/70 hover:bg-white",
                ].join(" ")}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ShopDetails() {
  const isAr = useIsArabic();
  const { id } = useParams();
  const dir = isAr ? "rtl" : "ltr";
  const align = isAr ? "text-right" : "text-left";

  const { data: product, isLoading, isError } = useGetProductByIdQuery(id, { skip: !id });
  const [addItemToCart, { isLoading: adding }] = useAddItemToCartMutation();

  const name = useMemo(() => {
    if (!product) return "";
    return (isAr ? product.name_ar : product.name_en) || product.name_en || product.name_ar || "";
  }, [product, isAr]);

  const desc = useMemo(() => (product?.description ? product.description : ""), [product]);

  const images = useMemo(() => {
    const imgs = product?.images;
    return Array.isArray(imgs) && imgs.length ? imgs : [];
  }, [product]);

  // ✅ المعتمد: stock_quantity
  const stockNum = useMemo(() => Number(product?.stock_quantity ?? 0), [product?.stock_quantity]);
  const inStock = stockNum > 0;

  const handleAdd = async () => {
    if (!inStock) {
      toast.error(isAr ? "المنتج غير متوفر حالياً" : "Out of stock");
      return;
    }

    try {
      await addItemToCart({ product_id: product.id, quantity: 1 }).unwrap();
      toast.success(isAr ? "تمت الإضافة للسلة" : "Added to cart", {
        description: name,
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
          ? "فشل إضافة المنتج للسلة"
          : "Failed to add item"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FBF7F1] text-[#2F2A24]" dir={dir}>
        <Navbar />
        <main className="pt-24">
          <div className="mx-auto max-w-3xl px-4 md:px-6">
            <Card className="rounded-3xl border-[#E7DCD0] bg-white/80">
              <CardHeader>
                <CardTitle>{isAr ? "جاري التحميل..." : "Loading..."}</CardTitle>
                <CardDescription>{isAr ? "عم نجيب بيانات المنتج" : "Fetching product details"}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-[#FBF7F1] text-[#2F2A24]" dir={dir}>
        <Navbar />
        <main className="pt-24">
          <div className="mx-auto max-w-3xl px-4 md:px-6">
            <Card className="rounded-3xl border-[#E7DCD0] bg-white/80">
              <CardHeader>
                <CardTitle>{isAr ? "المنتج غير موجود" : "Product not found"}</CardTitle>
                <CardDescription>
                  {isAr ? "تأكدي من الرابط أو ارجعي للمتجر." : "Check the URL or go back to shop."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="rounded-full bg-[#3C7A57] hover:bg-[#336A4C] text-white">
                  <Link to="/shop">{isAr ? "العودة للمتجر" : "Back to Shop"}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7F1] text-[#2F2A24]" dir={dir}>
      <Navbar />

      <main className="pt-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className={`mb-4 flex items-center gap-2 text-sm text-[#2F2A24]/70 ${align}`}>
            <Link to="/shop" className="hover:text-[#2F2A24]">
              {isAr ? "المتجر" : "Shop"}
            </Link>
            <span>•</span>
            <span className="text-[#2F2A24] font-semibold">{name}</span>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <ProductImageSlider images={images} alt={name} />
            </div>

            <div className="md:pt-1">
              <Card className="rounded-3xl border border-[#E7DCD0] bg-white/75 backdrop-blur-md">
                <CardHeader className="pb-3">
                  <div className={`flex flex-wrap items-center gap-2 ${isAr ? "justify-end" : "justify-start"}`}>
                    {/* ✅ Stock badge */}
                    <Badge
                      className={[
                        "rounded-full",
                        inStock ? "bg-[#3C7A57]/10 text-[#2F2A24]" : "bg-red-100 text-red-700",
                      ].join(" ")}
                    >
                      {inStock
                        ? isAr
                          ? `متوفر (${stockNum})`
                          : `In stock (${stockNum})`
                        : isAr
                        ? "غير متوفر"
                        : "Out of stock"}
                    </Badge>

                    {/* Category badge */}
                    {(product.category?.name_en || product.category?.name_ar) && (
                      <Badge className="rounded-full bg-[#FFFD82] text-[#2F2A24] hover:bg-[#FFF86A]">
                        {isAr ? product.category?.name_ar ?? product.category?.name_en : product.category?.name_en ?? product.category?.name_ar}
                      </Badge>
                    )}
                  </div>

                  <CardTitle className={`mt-3 text-3xl md:text-4xl font-extrabold tracking-tight ${align}`}>
                    {name}
                  </CardTitle>

                  <div className={`mt-4 ${align}`}>
                    <div className="text-sm font-semibold text-[#2F2A24]/70">{isAr ? "السعر" : "Price"}</div>
                    <div className="mt-1 text-xl font-extrabold text-[#3C7A57]">{money(product.price)}</div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <Separator className="my-4 bg-[#E7DCD0]" />

                  <div className={align}>
                    <div className="text-sm font-semibold text-[#2F2A24]">{isAr ? "الوصف" : "Description"}</div>
                    <p className="mt-2 text-[#2F2A24]/75 leading-relaxed">
                      {desc || (isAr ? "لا يوجد وصف لهذا المنتج." : "No description for this product.")}
                    </p>
                  </div>

                  <div className={`mt-6 flex flex-wrap gap-3 ${isAr ? "justify-end" : ""}`}>
                    <Button
                      onClick={handleAdd}
                      disabled={adding || !inStock}
                      className="h-11 rounded-full bg-[#3C7A57] hover:bg-[#336A4C] text-white px-6 disabled:opacity-60"
                    >
                      {isAr ? "إضافة إلى السلة" : "Add to cart"}
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      className="h-11 rounded-full border-[#3C7A57]/25 bg-white/70 hover:bg-[#3C7A57]/10"
                    >
                      <Link to="/shop">{isAr ? "رجوع" : "Back"}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className={`mt-3 text-xs text-[#2F2A24]/60 ${align}`}>
                {isAr ? product.name_en : product.name_ar}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
