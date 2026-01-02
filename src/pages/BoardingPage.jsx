// src/pages/BoardingPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import {
  useCreateBoardingReservationMutation,
  useGetBoardingQuoteMutation,
  useGetBoardingServicesQuery,
} from "@/features/boarding/boardingApiSlice";

import { useGetPetTypesQuery } from "@/features/petTypes/petTypesApiSlice";
import { useGetPetBreedsQuery } from "@/features/petBreeds/petBreedsApiSlice";

function useIsArabic() {
  const [isAr, setIsAr] = useState(false);
  useEffect(() => {
    const lang = (navigator.language || "").toLowerCase();
    setIsAr(lang.startsWith("ar"));
  }, []);
  return isAr;
}

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

function toInputDateTime(str) {
  if (!str) return "";
  const s = String(str).replace("T", " ").replace("Z", "");
  return s.replace(" ", "T").slice(0, 16);
}
function fromInputDateTime(v) {
  if (!v) return "";
  const s = String(v).replace("T", " ");
  return s.length === 16 ? `${s}:00` : s;
}

const Field = ({ label, children }) => (
  <div className="rounded-xl border border-[#E7DCD0] bg-white p-3">
    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
      {label}
    </div>
    {children}
  </div>
);

const serviceLabel = (s, isAr) => {
  if (isAr) return s?.name_ar || s?.name_en || s?.name || `#${s?.id}`;
  return s?.name_en || s?.name || s?.name_ar || `#${s?.id}`;
};

const typeLabel = (pt, isAr) => {
  if (isAr) return pt?.name_ar || pt?.name_en || pt?.name || `#${pt?.id}`;
  return pt?.name_en || pt?.name || pt?.name_ar || `#${pt?.id}`;
};

const breedLabel = (b, isAr) => {
  if (isAr) return b?.name_ar || b?.name_en || b?.name || `#${b?.id}`;
  return b?.name_en || b?.name || b?.name_ar || `#${b?.id}`;
};

export default function BoardingPage() {
  const isAr = useIsArabic();
  const t = (en, ar) => (isAr ? ar : en);
  const navigate = useNavigate();

  const { data: servicesRes, isLoading: loadingServices, refetch } =
    useGetBoardingServicesQuery();

  const services = useMemo(() => {
    const list = Array.isArray(servicesRes?.data) ? servicesRes.data : [];
    return list.filter((s) => s?.is_active !== false);
  }, [servicesRes]);

  const { data: petTypesRes, isLoading: loadingTypes } = useGetPetTypesQuery();
  const { data: petBreedsRes, isLoading: loadingBreeds } = useGetPetBreedsQuery();

  const petTypes = useMemo(
    () => (Array.isArray(petTypesRes?.data) ? petTypesRes.data : []),
    [petTypesRes]
  );

  const allBreeds = useMemo(
    () => (Array.isArray(petBreedsRes?.data) ? petBreedsRes.data : []),
    [petBreedsRes]
  );

  const [selectedServices, setSelectedServices] = useState({});

  const [petTypeId, setPetTypeId] = useState("");
  const [petBreedId, setPetBreedId] = useState("");

  const [ageMonths, setAgeMonths] = useState(8);
  const [startAt, setStartAt] = useState(toInputDateTime("2026-01-01 14:30:00"));
  const [endAt, setEndAt] = useState(toInputDateTime("2026-01-03 15:30:00"));

  useEffect(() => {
    if (!petTypes.length) return;
    const currentExists = petTypes.some((x) => String(x?.id) === String(petTypeId));
    if (!petTypeId || !currentExists) {
      setPetTypeId(String(petTypes[0].id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petTypes.length]);

  // ✅✅✅ FIX HERE: نفس AdoptPage تماماً
  const breeds = useMemo(() => {
    const tid = Number(petTypeId);
    if (!tid) return [];
    return allBreeds.filter((b) => Number(b?.pet_type?.id) === tid);
  }, [allBreeds, petTypeId]);

  useEffect(() => {
    if (!breeds.length) {
      setPetBreedId("");
      return;
    }

    const currentExists = breeds.some((x) => String(x?.id) === String(petBreedId));
    if (!petBreedId || !currentExists) {
      setPetBreedId(String(breeds[0].id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petTypeId, breeds.length]);

  const payload = useMemo(() => {
    const servicesArr = Object.keys(selectedServices).map((id) => ({
      id: Number(id),
      quantity: 1,
    }));

    return {
      pet_type_id: Number(petTypeId),
      pet_breed_id: Number(petBreedId),
      age_months: Number(ageMonths),
      start_at: fromInputDateTime(startAt),
      end_at: fromInputDateTime(endAt),
      services: servicesArr,
    };
  }, [petTypeId, petBreedId, ageMonths, startAt, endAt, selectedServices]);

  const [getQuote, { data: quoteData, isLoading: quoting }] = useGetBoardingQuoteMutation();
  const [createReservation, { isLoading: creating }] = useCreateBoardingReservationMutation();

  const quote = quoteData || null;

  const toggleService = (id) => {
    setSelectedServices((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  };

  const onQuote = async () => {
    try {
      await getQuote(payload).unwrap();
      toast.success(t("Quote updated", "تم حساب السعر"));
    } catch {
      toast.error(t("Failed to get quote", "فشل حساب السعر"));
    }
  };

  const onCreate = async () => {
    try {
      const res = await createReservation(payload).unwrap();
      const newId = res?.id;
      toast.success(t("Reservation created!", "تم إنشاء الحجز!"));
      navigate("/my-boarding-reservations", { state: { highlightId: newId } });
    } catch {
      toast.error(t("Failed to create reservation", "فشل إنشاء الحجز"));
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2F2A24]" dir={isAr ? "rtl" : "ltr"}>
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-6xl px-4">
          <header className="mb-7 rounded-xl border border-[#E7DCD0] bg-[#F7F3F0] p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Link
                  to={-1}
                  className="h-9 w-9 rounded-full bg-white shadow-sm border border-[#E7DCD0] inline-flex items-center justify-center"
                >
                  <ArrowLeft size={18} className={isAr ? "rotate-180" : ""} />
                </Link>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white border border-[#E7DCD0] flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-[#3C7A57]" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight">
                      {t("Temporary Boarding", "حجز مؤقت")}
                    </h1>
                    <p className="text-[12px] text-slate-500 font-medium">
                      {t("Create a temporary boarding reservation.", "أنشئ حجز مؤقت للحيوان.")}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={refetch}
                variant="outline"
                size="sm"
                className="h-9 rounded-full border-[#E7DCD0] bg-white px-4 font-bold active:scale-95"
              >
                <RefreshCw size={14} className={isAr ? "ml-2" : "mr-2"} /> {t("Refresh", "تحديث")}
              </Button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            <Card className="rounded-xl border-[#E7DCD0]/70 bg-white shadow-sm">
              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label={t("Pet Type", "نوع الحيوان")}>
                    <select
                      value={petTypeId}
                      onChange={(e) => setPetTypeId(e.target.value)}
                      disabled={loadingTypes || !petTypes.length}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3C7A57] disabled:opacity-60"
                    >
                      {!petTypes.length ? (
                        <option value="">
                          {loadingTypes ? t("Loading...", "جاري التحميل...") : t("No types", "لا يوجد أنواع")}
                        </option>
                      ) : null}

                      {petTypes.map((pt) => (
                        <option key={pt.id} value={String(pt.id)}>
                          {typeLabel(pt, isAr)}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label={t("Pet Breed", "السلالة")}>
                    <select
                      value={petBreedId}
                      onChange={(e) => setPetBreedId(e.target.value)}
                      disabled={loadingBreeds || !petTypeId || !breeds.length}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3C7A57] disabled:opacity-60"
                    >
                      {!petTypeId ? (
                        <option value="">{t("Select type first", "اختر النوع أولاً")}</option>
                      ) : !breeds.length ? (
                        <option value="">
                          {loadingBreeds
                            ? t("Loading...", "جاري التحميل...")
                            : t("No breeds for this type", "لا يوجد سلالات لهذا النوع")}
                        </option>
                      ) : null}

                      {breeds.map((b) => (
                        <option key={b.id} value={String(b.id)}>
                          {breedLabel(b, isAr)}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label={t("Age (months)", "العمر (أشهر)")}>
                    <input
                      type="number"
                      min="0"
                      value={ageMonths}
                      onChange={(e) => setAgeMonths(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3C7A57]"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label={t("Start At", "تاريخ البداية")}>
                    <input
                      type="datetime-local"
                      value={startAt}
                      onChange={(e) => setStartAt(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3C7A57]"
                    />
                  </Field>

                  <Field label={t("End At", "تاريخ النهاية")}>
                    <input
                      type="datetime-local"
                      value={endAt}
                      onChange={(e) => setEndAt(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3C7A57]"
                    />
                  </Field>
                </div>

                <Field label={t("Extra Services", "الخدمات الإضافية")}>
                  {loadingServices ? (
                    <div className="text-sm text-slate-500">{t("Loading services...", "جاري تحميل الخدمات...")}</div>
                  ) : !services.length ? (
                    <div className="text-sm text-slate-500">{t("No services available.", "لا يوجد خدمات.")}</div>
                  ) : (
                    <div className="space-y-2">
                      {services.map((s) => {
                        const id = s.id;
                        const isOn = !!selectedServices[id];
                        const name = serviceLabel(s, isAr);
                        const price = Number(s.price || 0);

                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => toggleService(id)}
                            className={[
                              "w-full flex items-center justify-between gap-3 rounded-xl border px-3 py-2 transition",
                              isOn
                                ? "border-[#3C7A57]/35 bg-[#3C7A57]/[0.06]"
                                : "border-slate-100 bg-slate-50 hover:bg-[#FBF7F1]",
                            ].join(" ")}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={[
                                  "h-4 w-4 rounded-md border",
                                  isOn ? "bg-[#3C7A57] border-[#3C7A57]" : "bg-white border-slate-200",
                                ].join(" ")}
                              />
                              <div className="min-w-0 text-left">
                                <div className="text-sm font-bold text-[#2F2A24] truncate">{name}</div>
                                <div className="text-[12px] text-slate-500 font-medium">{money(price)}</div>
                              </div>
                            </div>

                            {isOn ? (
                              <Badge className="rounded-full bg-white border border-[#3C7A57]/25 text-[#2F2A24]">
                                {t("Selected", "مُختارة")}
                              </Badge>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Field>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <Button
                    onClick={onQuote}
                    variant="outline"
                    className="h-11 rounded-xl border-[#E7DCD0] bg-white font-bold active:scale-95"
                    disabled={quoting}
                  >
                    {quoting ? t("Calculating...", "جاري الحساب...") : t("Get Quote", "احسب السعر")}
                  </Button>

                  <Button
                    onClick={onCreate}
                    className="h-11 rounded-xl bg-[#3C7A57] hover:bg-[#336A4C] text-white font-bold active:scale-95"
                    disabled={creating}
                  >
                    {creating ? t("Creating...", "جاري الإنشاء...") : t("Create Reservation", "إنشاء الحجز")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-[#E7DCD0]/70 bg-white shadow-sm h-fit">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-[#2F2A24]">{t("Summary", "الملخص")}</div>
                  <Badge className="rounded-full bg-[#3C7A57]/10 text-[#2F2A24] border border-[#3C7A57]/25">
                    {t("Boarding", "حجز")}
                  </Badge>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>{t("Billable Hours", "الساعات المحتسبة")}</span>
                    <span className="font-bold text-slate-800">{quote?.billable_hours ?? "—"}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">{t("Total", "الإجمالي")}</span>
                    <span className="text-lg font-bold text-[#3C7A57]">
                      {quote?.total != null ? money(quote.total) : "—"}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <Button asChild variant="outline" className="w-full rounded-xl border-[#E7DCD0] bg-white font-bold">
                    <Link to="/my-boarding-reservations">{t("My Reservations", "حجوزاتي")}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
