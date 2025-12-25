// src/features/Products/hooks/useProductFilters.js
import { useCallback, useMemo } from "react";

export function useProductFilters({
  products,
  isAr,
  query,
  availability,
  sort,
}) {
  const getName = useCallback(
    (p) => (isAr ? p?.name_ar || p?.name || "" : p?.name_en || p?.name || ""),
    [isAr]
  );

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();

    let list = (products || []).filter((p) => {
      const name = getName(p);
      const desc = p?.description || "";
      const hay = `${name} ${desc}`.toLowerCase();

      const matchQ = q ? hay.includes(q) : true;

      // ✅ المعتمد: stock_quantity
      const stockQty = Number(p?.stock_quantity ?? 0);

      if (availability === "in_stock") return matchQ && stockQty > 0;
      if (availability === "out_of_stock") return matchQ && stockQty <= 0;

      return matchQ;
    });

    const priceNum = (x) => Number(x?.price ?? 0);

    if (sort === "newest")
      list = [...list].sort((a, b) => Number(b.id) - Number(a.id));
    if (sort === "price_asc")
      list = [...list].sort((a, b) => priceNum(a) - priceNum(b));
    if (sort === "price_desc")
      list = [...list].sort((a, b) => priceNum(b) - priceNum(a));

    return list;
  }, [products, query, availability, sort, getName]);

  return { filtered, getName };
}
