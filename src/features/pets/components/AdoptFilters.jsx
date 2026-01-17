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

export default function AdoptFilters({ gender, setGender, age, setAge, onReset }) {
  const triggerClass =
    "h-10 min-w-[160px] rounded-md border-2 border-[#D1C2B4] bg-white px-3 " +
    "text-[12px] font-medium text-[#2F2A24] shadow-sm " +
    "hover:bg-[#FBF7F1] hover:border-[#A67C52] " +
    "focus:outline-none focus:ring-2 focus:ring-[#3C7A57]/20 focus:border-[#3C7A57]/50 " +
    "data-[state=open]:ring-2 data-[state=open]:ring-[#3C7A57]/20 data-[state=open]:border-[#3C7A57]/50";

  const contentClass =
    "rounded-md border-2 border-[#D1C2B4] bg-white shadow-[0_18px_40px_rgba(0,0,0,0.10)]";

  const itemClass =
    "rounded-sm text-[12px] font-medium text-[#2F2A24] " +
    "data-[highlighted]:bg-[#3C7A57]/10 data-[highlighted]:text-[#2F2A24] " +
    "data-[state=checked]:bg-[#A67C52]/15 data-[state=checked]:text-[#2F2A24]";

  // show placeholder when all
  const genderValue = gender === "all" ? "" : gender;
  const ageValue = age === "all" ? "" : age;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={genderValue} onValueChange={(v) => setGender(v || "all")}>
        <SelectTrigger className={triggerClass}>
          <SelectValue placeholder="Gender" />
        </SelectTrigger>

        <SelectContent className={contentClass}>
          <SelectItem value="all" className={itemClass}>
            All
          </SelectItem>
          <SelectItem value="male" className={itemClass}>
            Male
          </SelectItem>
          <SelectItem value="female" className={itemClass}>
            Female
          </SelectItem>
        </SelectContent>
      </Select>

      <Select value={ageValue} onValueChange={(v) => setAge(v || "all")}>
        <SelectTrigger className={triggerClass}>
          <SelectValue placeholder="Age" />
        </SelectTrigger>

        <SelectContent className={contentClass}>
          <SelectItem value="all" className={itemClass}>
            All
          </SelectItem>
          <SelectItem value="baby" className={itemClass}>
            Baby
          </SelectItem>
          <SelectItem value="young" className={itemClass}>
            Young
          </SelectItem>
          <SelectItem value="adult" className={itemClass}>
            Adult
          </SelectItem>
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant="ghost"
        onClick={onReset}
        className="h-10 rounded-md px-3 text-[12px] font-medium text-[#8C8276] hover:text-[#A67C52] hover:bg-[#FBF7F1]"
      >
        Reset
      </Button>
    </div>
  );
}
