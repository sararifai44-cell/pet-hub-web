import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { HeartHandshake, ArrowLeft, Calendar, VenusAndMars } from "lucide-react";

import { useGetPetByIdQuery } from "@/features/pets/petsApiSlice";
import { useCreateAdoptionApplicationMutation } from "@/features/adoptionApplications/adoptionApplicationsApiSlice";

function useIsArabic() {
  const lang = typeof window !== "undefined" ? (navigator.language || "").toLowerCase() : "en";
  return lang.startsWith("ar");
}

export default function AdoptionApplicationPage() {
  const isAr = useIsArabic();
  const t = (en, ar) => (isAr ? ar : en);

  const { id } = useParams(); // pet id
  const petId = Number(id);
  const navigate = useNavigate();

  const { data: pet, isLoading, isError } = useGetPetByIdQuery(petId, { skip: !petId });
  const [createApp, { isLoading: submitting }] = useCreateAdoptionApplicationMutation();

  const [motivation, setMotivation] = useState("");

  const imgSrc = useMemo(() => {
    const first =
      (Array.isArray(pet?.images) && pet.images.length && pet.images[0]) ||
      pet?.cover_image ||
      pet?.image ||
      pet?.image_url ||
      pet?.imageUrl ||
      null;
    return typeof first === "string" ? first : first?.url || null;
  }, [pet]);

  const canSubmit = motivation.trim().length >= 10 && !!petId;

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!canSubmit) {
      toast.error(isAr ? "اكتبي سبب التبنّي (على الأقل 10 أحرف)" : "Please write your motivation (min 10 chars)");
      return;
    }

    try {
      await createApp({ pet_id: petId, motivation: motivation.trim() }).unwrap();
      toast.success(isAr ? "تم إرسال طلب التبنّي" : "Application submitted", { duration: 2500 });
      navigate("/pets");
    } catch (err) {
      const status = err?.status;

      if (status === 401) {
        toast.error(isAr ? "لازم تسجّلي دخول أولاً" : "Please login first");
        navigate("/login");
        return;
      }

      if (status === 422) {
        const msg =
          err?.data?.message ||
          (isAr ? "في خطأ بالبيانات، تأكدي من الحقول." : "Validation error. Please check the fields.");
        toast.error(msg);
        return;
      }

      toast.error(isAr ? "صار خطأ بالسيرفر" : "Server error");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB]" dir={isAr ? "rtl" : "ltr"}>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 md:px-8 pt-6 pb-20">
        {/* Header نفس الثيم */}
        <header className="mb-8 py-5 px-8 rounded-xl bg-[#F7F3F0] border border-[#E7DCD0]/50 relative flex flex-row items-center justify-between overflow-hidden">
          <div className="relative z-10 space-y-1">
            <h1 className="text-xl md:text-2xl font-semibold text-[#2F2A24]">
              {t("Adoption Application", "طلب تبنّي")}
              <span className="text-[#3C7A57]">{t(" • simple & quick", " • سريع وبسيط")}</span>
            </h1>
            <p className="text-[#8C8276] text-[11px] font-medium">
              {t("Tell us why you’d like to adopt, and we’ll review your request.", "اكتبي سبب التبنّي وسنقوم بمراجعة الطلب.")}
            </p>
          </div>

          <div className="relative shrink-0">
            <img src="/pethub-logo (2).png" alt="PetHub" className="h-14 md:h-18 w-auto object-contain" />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Pet preview */}
          <aside className="lg:col-span-2 space-y-4">
            <Card className="rounded-2xl border border-[#E7DCD0] bg-white shadow-sm overflow-hidden">
              <div className="w-full bg-[#FBF7F1]">
                <div className="aspect-[4/3] w-full overflow-hidden">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={pet?.name || "Pet"}
                      className="h-full w-full object-contain bg-[#FBF7F1]"
                      draggable="false"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-[#2F2A24]/40 font-semibold">
                      {t("No image", "لا يوجد صورة")}
                    </div>
                  )}
                </div>
              </div>

              <CardContent className="p-5">
                {isLoading ? (
                  <div className="text-[#3C7A57] font-medium animate-pulse">
                    {t("Loading pet…", "جاري تحميل الحيوان…")}
                  </div>
                ) : isError || !pet ? (
                  <div className="text-[#2F2A24]/70">
                    {t("Pet not found.", "الحيوان غير موجود.")}
                  </div>
                ) : (
                  <>
                    <div className="text-lg font-extrabold text-[#2F2A24] truncate">{pet.name}</div>

                    <div className="mt-2 space-y-2 text-[12px] text-[#2F2A24]/70">
                      {pet.gender ? (
                        <div className="flex items-center gap-2">
                          <VenusAndMars className="h-4 w-4 text-[#3C7A57]" />
                          <span className="font-semibold">{t("Gender:", "الجنس:")}</span>
                          <span>{String(pet.gender)}</span>
                        </div>
                      ) : null}

                      {pet.date_of_birth ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#3C7A57]" />
                          <span className="font-semibold">{t("Date of birth:", "تاريخ الميلاد:")}</span>
                          <span>{String(pet.date_of_birth)}</span>
                        </div>
                      ) : null}
                    </div>

                    {pet.description ? (
                      <p className="mt-3 text-[12px] text-[#2F2A24]/65 leading-relaxed">
                        {pet.description}
                      </p>
                    ) : null}
                  </>
                )}
              </CardContent>
            </Card>

            <Button
              asChild
              variant="outline"
              className="w-full rounded-xl border-[#E7DCD0] bg-white hover:bg-[#FBF7F1]"
            >
              <Link to="/pets" className="flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t("Back to list", "رجوع للقائمة")}
              </Link>
            </Button>
          </aside>

          {/* Form */}
          <section className="lg:col-span-3">
            <Card className="rounded-2xl border border-[#E7DCD0] bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#2F2A24] text-lg font-extrabold">
                  {t("Your Request", "معلومات الطلب")}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 pt-3">
                <form onSubmit={onSubmit} className="space-y-5">
                  {/* Motivation */}
                  <div>
                    <label className="text-[12px] font-bold text-[#2F2A24]/70">
                      {t("Motivation", "سبب التبنّي")}
                    </label>
                    <textarea
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                      rows={6}
                      placeholder={t(
                        "Write a short message (why you want to adopt, your experience, home environment...)",
                        "اكتبي رسالة قصيرة (ليش بدك تتبنّي، خبرتك، وبيئة البيت...)"
                      )}
                      className="mt-2 w-full rounded-2xl border border-[#E7DCD0] bg-[#FBF7F1] p-4 text-sm text-[#2F2A24] outline-none focus:ring-2 focus:ring-[#3C7A57]/15"
                    />
                    <div className="mt-2 text-[11px] text-[#8C8276]">
                      {t("Minimum 10 characters.", "الحد الأدنى 10 أحرف.")}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="submit"
                      disabled={!canSubmit || submitting || isLoading || isError}
                      className="h-11 rounded-xl bg-[#3C7A57] hover:bg-[#2F5F43] text-white flex-1 disabled:opacity-60"
                    >
                      <HeartHandshake className="h-4 w-4" />
                      <span className={isAr ? "mr-2" : "ml-2"}>
                        {submitting ? t("Submitting…", "جارٍ الإرسال…") : t("Submit application", "إرسال الطلب")}
                      </span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 rounded-xl border-[#E7DCD0] bg-white hover:bg-[#FBF7F1]"
                      onClick={() => navigate("/pets")}
                    >
                      {t("Cancel", "إلغاء")}
                    </Button>
                  </div>

                  {/* Note */}
                  <div className="rounded-xl border border-[#E7DCD0] bg-white p-4 text-[12px] text-[#2F2A24]/70">
                    {t(
                      "After submitting, your request will be marked as pending for review.",
                      "بعد الإرسال، طلبك رح يكون بحالة pending للمراجعة."
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
