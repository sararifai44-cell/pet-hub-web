// src/features/Products/components/ShopFilters.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function ShopFilters({
  availability,
  setAvailability,
  sort,
  setSort,
  isAr,
  onReset,
}) {
  const t = (en, ar) => (isAr ? ar : en);

  const triggerClass =
    "h-10 min-w-[160px] rounded-md border border-[#E7DCD0] bg-white px-3 " +
    "text-[12px] font-medium text-[#2F2A24] shadow-sm " +
    "hover:bg-[#FBF7F1] " +
    "focus:outline-none focus:ring-2 focus:ring-[#3C7A57]/20 focus:border-[#3C7A57]/50 " +
    "data-[state=open]:ring-2 data-[state=open]:ring-[#3C7A57]/20 data-[state=open]:border-[#3C7A57]/50";

  const contentClass =
    "rounded-md border border-[#E7DCD0] bg-white shadow-[0_18px_40px_rgba(0,0,0,0.10)]";

  const itemClass =
    "rounded-sm text-[12px] font-medium text-[#2F2A24] " +
    "data-[highlighted]:bg-[#3C7A57]/10 data-[highlighted]:text-[#2F2A24] " +
    "data-[state=checked]:bg-[#3C7A57]/15 data-[state=checked]:text-[#2F2A24]";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={availability} onValueChange={setAvailability}>
        <SelectTrigger className={triggerClass}>
          <SelectValue placeholder={t("Availability", "التوفر")} />
        </SelectTrigger>

        <SelectContent className={contentClass}>
          <SelectItem value="all" className={itemClass}>
            {t("All", "الكل")}
          </SelectItem>
          <SelectItem value="in_stock" className={itemClass}>
            {t("In Stock", "متوفر")}
          </SelectItem>
          <SelectItem value="out_of_stock" className={itemClass}>
            {t("Out of Stock", "غير متوفر")}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select value={sort} onValueChange={setSort}>
        <SelectTrigger className={triggerClass}>
          <SelectValue placeholder={t("Sort", "الترتيب")} />
        </SelectTrigger>

        <SelectContent className={contentClass}>
          <SelectItem value="newest" className={itemClass}>
            {t("Newest", "الأحدث")}
          </SelectItem>
          <SelectItem value="price_asc" className={itemClass}>
            {t("Price: Low → High", "السعر: من الأقل")}
          </SelectItem>
          <SelectItem value="price_desc" className={itemClass}>
            {t("Price: High → Low", "السعر: من الأعلى")}
          </SelectItem>
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant="ghost"
        onClick={onReset}
        className="h-10 rounded-md px-3 text-[12px] font-medium text-[#8C8276] hover:text-[#2F2A24] hover:bg-[#FBF7F1]"
      >
        {t("Reset", "مسح")}
      </Button>
    </div>
  );
}
