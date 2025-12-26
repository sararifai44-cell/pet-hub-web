// src/features/pets/hooks/usePetFilters.js
import { useCallback, useMemo } from "react";

const pickName = (obj, isAr) => {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  if (typeof obj === "object") {
    return isAr ? obj.name_ar || obj.name : obj.name_en || obj.name;
  }
  return "";
};

function getAgeGroupFromDob(dobStr) {
  if (!dobStr) return "all";
  const dob = new Date(dobStr);
  if (Number.isNaN(dob.getTime())) return "all";
  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) years--;
  if (years < 1) return "baby";
  if (years < 3) return "young";
  return "adult";
}

export function usePetFilters({
  pets,
  isAr,
  query,
  gender,
  age,
  onlyAdoptable,
  typeId,
  breedId,
}) {
  const getName = useCallback(
    (p) => {
      const n = isAr ? p?.name_ar || p?.name : p?.name_en || p?.name;
      return n || "";
    },
    [isAr]
  );

  const getTypeName = useCallback(
    (p) => {
      return pickName(p?.pet_type, isAr) || p?.pet_type?.name || "";
    },
    [isAr]
  );

  const getBreedName = useCallback(
    (p) => {
      return pickName(p?.pet_breed, isAr) || p?.pet_breed?.name || "";
    },
    [isAr]
  );

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();

    return (pets || []).filter((p) => {
      const pGender = (p?.gender || "").toLowerCase();

      const okGender = gender === "all" ? true : pGender === gender;
      const okAge =
        age === "all" ? true : getAgeGroupFromDob(p?.date_of_birth) === age;
      const okAdoptable = onlyAdoptable ? p?.is_adoptable === true : true;

      const okType =
        typeId === "all" ? true : Number(p?.pet_type?.id) === Number(typeId);
      const okBreed =
        breedId === "all" ? true : Number(p?.pet_breed?.id) === Number(breedId);

      const hay = [getName(p), getTypeName(p), getBreedName(p)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const okQ = q ? hay.includes(q) : true;

      return okGender && okAge && okAdoptable && okType && okBreed && okQ;
    });
  }, [
    pets,
    query,
    gender,
    age,
    onlyAdoptable,
    typeId,
    breedId,
    getName,
    getTypeName,
    getBreedName,
  ]);

  return { filtered, getName, getTypeName, getBreedName };
}
