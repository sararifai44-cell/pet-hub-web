// src/features/pets/components/AdoptFilters.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function AdoptFilters({
  gender,
  setGender,
  age,
  setAge,
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

  // ✅ إذا القيمة all نخليها "" ليظهر placeholder بدل All
  const genderValue = gender === "all" ? "" : gender;
  const ageValue = age === "all" ? "" : age;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Gender */}
      <Select value={genderValue} onValueChange={(v) => setGender(v || "all")}>
        <SelectTrigger className={triggerClass}>
          <SelectValue placeholder={t("Gender", "الجنس")} />
        </SelectTrigger>

        <SelectContent className={contentClass}>
          <SelectItem value="all" className={itemClass}>
            {t("All", "الكل")}
          </SelectItem>
          <SelectItem value="male" className={itemClass}>
            {t("Male", "ذكر")}
          </SelectItem>
          <SelectItem value="female" className={itemClass}>
            {t("Female", "أنثى")}
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Age */}
      <Select value={ageValue} onValueChange={(v) => setAge(v || "all")}>
        <SelectTrigger className={triggerClass}>
          <SelectValue placeholder={t("Age", "العمر")} />
        </SelectTrigger>

        <SelectContent className={contentClass}>
          <SelectItem value="all" className={itemClass}>
            {t("All", "الكل")}
          </SelectItem>
          <SelectItem value="baby" className={itemClass}>
            {t("Baby", "صغير")}
          </SelectItem>
          <SelectItem value="young" className={itemClass}>
            {t("Young", "يافع")}
          </SelectItem>
          <SelectItem value="adult" className={itemClass}>
            {t("Adult", "بالغ")}
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
