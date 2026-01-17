// src/features/Products/components/ProductCard.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

export default function ProductCard({ p, isAr, name, onAdd, adding }) {
  const stockNum = useMemo(
    () => Number(p?.stock_quantity ?? 0),
    [p?.stock_quantity]
  );
  const outOfStock = stockNum <= 0;

  const imgSrc = useMemo(() => {
    const first =
      Array.isArray(p?.images) && p.images.length ? p.images[0] : null;
    return first || p?.cover_image || null;
  }, [p]);

  const [imgError, setImgError] = useState(false);

  return (
    <Card
      className="
        group overflow-hidden rounded-2xl bg-white shadow-sm
        border-2 border-[#D1C2B4]
        transition-all duration-300
        hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.02]
      "
    >
      <div className="relative">
        <div className="aspect-[16/10] w-full bg-[#FBF7F1] overflow-hidden">
          {imgSrc && !imgError ? (
            <img
              src={imgSrc}
              alt={name}
              className={`h-full w-full object-cover transition-transform duration-500 ${
                outOfStock ? "grayscale" : "group-hover:scale-[1.06]"
              }`}
              draggable="false"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-[#2F2A24]/40 font-semibold text-sm">
              No image
            </div>
          )}
        </div>

        {outOfStock ? (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] grid place-items-center">
            <Badge className="rounded-md bg-[#2F2A24] text-white border-none text-[10px] px-2 py-1 shadow-sm font-medium">
              SOLD OUT
            </Badge>
          </div>
        ) : null}
      </div>

      <CardContent className="p-4">
        <div className="min-w-0">
          <CardTitle className="text-[13px] font-semibold text-[#2F2A24] truncate leading-tight">
            {name}
          </CardTitle>

          <p className="mt-1 text-[11px] font-normal text-[#2F2A24]/60 line-clamp-2">
            {p?.description || "No description"}
          </p>
        </div>

        <div className="my-3 h-px w-full bg-[#D1C2B4]/70" />

        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold text-[#2F2A24]/55 uppercase tracking-wide">
              Price
            </div>
            <div className="text-[15px] font-extrabold text-[#3C7A57] tabular-nums">
              {money(p?.price)}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              asChild
              variant="outline"
              className="h-8 rounded-md border-2 border-[#D1C2B4] bg-white hover:bg-[#FBF7F1] px-3 text-[11px] font-semibold"
            >
              <Link to={`/shop/${p.id}`}>Details</Link>
            </Button>

            <Button
              size="sm"
              className="h-8 rounded-md bg-[#3C7A57] text-white hover:bg-[#2F5F43] px-3 text-[11px] font-semibold disabled:opacity-50"
              onClick={() => onAdd(p)}
              disabled={adding || outOfStock}
            >
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
