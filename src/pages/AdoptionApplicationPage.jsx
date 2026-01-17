import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HeartHandshake,
  ArrowLeft,
  Calendar,
  VenusAndMars,
  PawPrint,
} from "lucide-react";

import { useGetPetByIdQuery } from "@/features/pets/petsApiSlice";
import { useCreateAdoptionApplicationMutation } from "@/features/adoptionApplications/adoptionApplicationsApiSlice";

import { getToken } from "@/app/apiSlice";

const headerPets = ["/cat.jpg", "/bird.jpg", "/h3-cat-pet-container.jpg"];

function formatDate(dt) {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return "—";
  }
}

function calcAgeYears(dateOfBirth) {
  if (!dateOfBirth) return "—";
  try {
    const dob = new Date(dateOfBirth);
    const now = new Date();
    let years = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) years -= 1;
    if (years < 0) years = 0;
    return `${years} years`;
  } catch {
    return "—";
  }
}

export default function AdoptionApplicationPage() {
  // English-only UI
  const isAr = false;

  const { id } = useParams();
  const petId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();

  const hasSubmittedAuto = useRef(false);

  const { data: pet, isLoading } = useGetPetByIdQuery(petId, { skip: !petId });
  const [createApp, { isLoading: submitting }] =
    useCreateAdoptionApplicationMutation();

  const [motivation, setMotivation] = useState("");

  const canSubmit = motivation.trim().length >= 10 && !!petId;

  const isAuthError = (err) => {
    const status = err?.status ?? err?.originalStatus;
    const msg = err?.data?.message ?? err?.data?.error ?? err?.error ?? "";
    return (
      status === 401 ||
      status === 403 ||
      /unauthenticated|unauthorized|login/i.test(String(msg))
    );
  };

  const redirectToLogin = useCallback(
    (motText) => {
      const from = location?.pathname + (location?.search || "");
      navigate("/login", {
        replace: true,
        state: {
          from,
          pendingAdoption: {
            pet_id: petId,
            motivation: (motText ?? motivation).trim(),
          },
          shouldAutoSubmit: true,
        },
      });
    },
    [navigate, location?.pathname, location?.search, petId, motivation]
  );

  useEffect(() => {
    if (
      location.state?.shouldAutoSubmit &&
      location.state?.pendingAdoption &&
      !hasSubmittedAuto.current
    ) {
      const savedMotivation = location.state.pendingAdoption.motivation;
      setMotivation(savedMotivation);

      hasSubmittedAuto.current = true;

      const token = getToken();
      if (!token) {
        redirectToLogin(savedMotivation);
        window.history.replaceState({}, document.title);
        return;
      }

      handleFinalSubmit(savedMotivation);
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const handleFinalSubmit = async (motivationText) => {
    try {
      const result = await createApp({
        pet_id: petId,
        motivation: motivationText.trim(),
      }).unwrap();

      toast.success("Application submitted successfully!");
      navigate(`/adoption-requests/${result.id || result.data?.id}`);
    } catch (err) {
      const serverMessage = err?.data?.message || err?.data?.error;

      if (isAuthError(err)) {
        redirectToLogin(motivationText);
        return;
      }

      if (serverMessage) toast.error(serverMessage);
      else toast.error("Internal Server Error");
    }
  };

  const onSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!canSubmit) {
      toast.error("Please write your motivation (min 10 characters).");
      return;
    }

    const token = getToken();
    if (!token) {
      redirectToLogin(motivation);
      return;
    }

    await handleFinalSubmit(motivation);
  };

  const imgSrc = useMemo(() => {
    const first =
      (Array.isArray(pet?.images) && pet.images.length && pet.images[0]) ||
      pet?.cover_image ||
      pet?.image ||
      pet?.image_url ||
      null;

    return typeof first === "string" ? first : first?.url || null;
  }, [pet]);

  const genderLabel = String(pet?.gender || "—");
  const dobLabel = formatDate(pet?.date_of_birth);
  const ageLabel = calcAgeYears(pet?.date_of_birth);

  return (
    <div className="min-h-screen bg-[#FDFCFB]" dir={isAr ? "rtl" : "ltr"}>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 md:px-8 pt-6 pb-20">
        {/* Header (theme-matched + responsive) */}
        <header className="relative bg-[#387365] p-6 md:p-10 rounded-xl shadow-md flex flex-col md:flex-row md:items-center justify-between overflow-hidden mb-8 border-b-4 border-[#2d5c51]">
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <HeartHandshake className="w-64 h-64 text-white" />
          </div>

          <div className="z-10">
            <button
              onClick={() => navigate("/pets")}
              className="
              flex items-center gap-2 text-white/90 font-bold hover:text-white transition-colors w-fit group text-xs mb-3
                      rounded-lg border border-white/15 bg-white/10 px-3 py-2 hover:bg-white/15
              "
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Pets</span>
            </button>

            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Adoption Application{" "}
              <span className="text-white/85">• simple & quick</span>
            </h1>

            <p className="text-white/80 text-sm mt-1 font-medium max-w-xl">
              Tell us why you’d like to adopt, and we’ll review your request.
            </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Pet summary */}
          <aside className="lg:col-span-2 space-y-4">
            <Card className="rounded-2xl border-2 border-[#D1C2B4] bg-white shadow-sm overflow-hidden">
              <div className="aspect-[4/3] w-full bg-[#FBF7F1] relative">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={pet?.name || "pet"}
                    className="h-full w-full object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center text-[#2F2A24]/35 font-semibold">
                    <div className="flex flex-col items-center gap-2">
                      <PawPrint className="h-8 w-8" />
                      <span>No image</span>
                    </div>
                  </div>
                )}
              </div>

              <CardContent className="p-5">
                {isLoading ? (
                  <div className="animate-pulse text-[#3C7A57] font-semibold">
                    Loading...
                  </div>
                ) : (
                  <>
                    <div className="text-lg font-extrabold text-[#2F2A24] truncate">
                      {pet?.name || "Pet"}
                    </div>

                    <div className="mt-3 space-y-2 text-[12px] text-[#2F2A24]/70">
                      <div className="flex items-center gap-2">
                        <VenusAndMars className="h-4 w-4 text-[#387365]" />
                        <span className="font-bold text-[#2F2A24]/80">
                          Gender:
                        </span>
                        <span className="capitalize">{genderLabel}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#387365]" />
                        <span className="font-bold text-[#2F2A24]/80">
                          DOB:
                        </span>
                        <span>{dobLabel}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#387365]/15 text-[#387365] text-[10px] font-extrabold">
                          Y
                        </span>
                        <span className="font-bold text-[#2F2A24]/80">
                          Age:
                        </span>
                        <span>{ageLabel}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Button
              asChild
              variant="outline"
              className="w-full rounded-xl border-2 border-[#D1C2B4] bg-white hover:bg-[#FBF7F1]"
            >
              <Link to="/pets">
                <ArrowLeft className="h-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
          </aside>

          {/* Right: Form */}
          <section className="lg:col-span-3">
            <Card className="rounded-2xl border-2 border-[#D1C2B4] bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#2F2A24] text-lg font-extrabold">
                  Your Motivation
                </CardTitle>
                <p className="text-xs text-[#2F2A24]/60 mt-1">
                  Minimum 10 characters. Be honest and clear.
                </p>
              </CardHeader>

              <CardContent className="p-6 pt-4">
                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <textarea
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                      rows={7}
                      placeholder="Why do you want to adopt this pet?"
                      className="
                        w-full rounded-2xl border-2 border-[#D1C2B4]
                        bg-[#FBF7F1] p-4 text-sm text-[#2F2A24]
                        outline-none transition-all
                        focus:ring-2 focus:ring-[#3C7A57]/20
                        focus:border-[#3C7A57]/40
                      "
                    />

                    <div className="flex items-center justify-between text-[11px]">
                      <span
                        className={
                          motivation.trim().length >= 10
                            ? "text-emerald-700 font-semibold"
                            : "text-[#2F2A24]/55"
                        }
                      >
                        {motivation.trim().length >= 10
                          ? "Looks good."
                          : "Write at least 10 characters."}
                      </span>

                      <span className="text-[#2F2A24]/45">
                        {motivation.trim().length} / 10+
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={!canSubmit || submitting}
                    className="
                      h-11 w-full rounded-xl
                      bg-[#3C7A57] hover:bg-[#2F5F43] text-white
                      font-bold disabled:opacity-50
                    "
                  >
                    <HeartHandshake className="h-4 w-4 mr-2" />
                    {submitting ? "Sending..." : "Submit Application"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
