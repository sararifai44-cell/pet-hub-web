// src/pages/HomePage.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  HeartHandshake,
  ShoppingBag,
  Hotel,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Camera,
} from "lucide-react";
import { PawPrint, CalendarCheck2 } from "lucide-react";
import Navbar from "@/components/common/Navbar";
import SplitText from "@/components/common/SplitText";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// ✅ medical services hook (appointment categories)
import { useGetAppointmentCategoriesQuery } from "@/features/appointments/appointmentsApiSlice";

function CenterGallerySlider({ images = [] }) {
  const [idx, setIdx] = useState(0);
  const total = images.length;

  const go = (dir) => {
    if (!total) return;
    setIdx((p) => (p + dir + total) % total);
  };

  if (!total) return null;

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-[#E7DCD0]/70 bg-white/60"
      role="region"
      aria-roledescription="carousel"
      aria-label="Center gallery"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(-1);
        if (e.key === "ArrowRight") go(1);
      }}
    >
      {/* track */}
      <div
        className="flex will-change-transform transition-transform duration-200 ease-out"
        style={{ transform: `translateX(-${idx * 100}%)` }}
      >
        {images.map((src, i) => (
          <div key={src + i} className="w-full flex-none">
            {/* ✅ responsive فقط: على الموبايل نخليها نسبة أقرب للمربع لتجنب طول زائد */}
            <div className="aspect-[14/15] sm:aspect-[14/15] w-full">
              <img
                src={src}
                alt={`Center photo ${i + 1}`}
                className="h-full w-full object-cover"
                draggable="false"
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        ))}
      </div>

      {/* arrows */}
      <button
        type="button"
        onClick={() => go(-1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-[#E7DCD0] bg-white/80 text-[#2F2A24] shadow-none hover:bg-white
        max-sm:h-9 max-sm:w-9 max-sm:left-2"
        aria-label="Previous"
      >
        <ChevronLeft className="h-5 w-5 max-sm:h-4 max-sm:w-4" />
      </button>

      <button
        type="button"
        onClick={() => go(1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-[#E7DCD0] bg-white/80 text-[#2F2A24] shadow-none hover:bg-white
        max-sm:h-9 max-sm:w-9 max-sm:right-2"
        aria-label="Next"
      >
        <ChevronRight className="h-5 w-5 max-sm:h-4 max-sm:w-4" />
      </button>

      {/* dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-white/30 bg-black/20 px-3 py-1.5 backdrop-blur-md
      max-sm:bottom-2 max-sm:px-2.5 max-sm:py-1 max-sm:gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            className={[
              "h-2 w-2 rounded-full transition",
              i === idx ? "bg-[#3C7A57]" : "bg-white/70 hover:bg-white",
            ].join(" ")}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ✅ NEW: Medical Services Slider */
function MedicalServicesSlider({ items = [] }) {
  const trackRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = () => {
    const el = trackRef.current;
    if (!el) return;

    const left = el.scrollLeft;
    const max = el.scrollWidth - el.clientWidth;

    setCanLeft(left > 2);
    setCanRight(max - left > 2);
  };

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;

    const onScroll = () => updateArrows();
    el.addEventListener("scroll", onScroll, { passive: true });

    const onResize = () => updateArrows();
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [items?.length]);

  const slideBy = (dir) => {
    const el = trackRef.current;
    if (!el) return;

    const amount = Math.max(260, Math.floor(el.clientWidth * 0.85));
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* arrows */}
      <button
        type="button"
        onClick={() => slideBy(-1)}
        disabled={!canLeft}
        className="
          absolute -left-2 top-1/2 -translate-y-1/2 z-10
          grid h-10 w-10 place-items-center rounded-full
          border border-[#E7DCD0] bg-white/85 text-[#2F2A24]
          hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed
          shadow-sm
          max-sm:-left-1 max-sm:h-9 max-sm:w-9
        "
        aria-label="Previous services"
      >
        <ChevronLeft className="h-5 w-5 max-sm:h-4 max-sm:w-4" />
      </button>

      <button
        type="button"
        onClick={() => slideBy(1)}
        disabled={!canRight}
        className="
          absolute -right-2 top-1/2 -translate-y-1/2 z-10
          grid h-10 w-10 place-items-center rounded-full
          border border-[#E7DCD0] bg-white/85 text-[#2F2A24]
          hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed
          shadow-sm
          max-sm:-right-1 max-sm:h-9 max-sm:w-9
        "
        aria-label="Next services"
      >
        <ChevronRight className="h-5 w-5 max-sm:h-4 max-sm:w-4" />
      </button>

      {/* track */}
      <div
        ref={trackRef}
        className="
          flex gap-6 overflow-x-auto scroll-smooth
          snap-x snap-mandatory
          px-2
          [scrollbar-width:none] [-ms-overflow-style:none]
          hide-scrollbar
        "
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <style>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
        `}</style>

        {items.map((c) => (
          <Link
            key={c.id}
            to="/my-appointments"
            className="snap-start shrink-0 w-[280px] max-sm:w-[85vw]"
            aria-label={`Book ${c?.name ?? "service"}`}
          >
            <Card
              className="
                group overflow-hidden
                rounded-3xl bg-white
                border border-[#E7DCD0]/70
                transition-all duration-500 ease-out
                md:hover:-translate-y-2 md:hover:shadow-2xl md:hover:shadow-black/10
              "
            >
              <CardHeader className="p-6 pb-3 max-sm:p-5 max-sm:pb-3">
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-2xl bg-green-800/10 border border-green-800/15 flex items-center justify-center">
                    <Stethoscope className="h-5 w-5 text-green-800" />
                  </div>

                  <div className="min-w-0">
                    <CardTitle className="text-xl font-bold text-[#2F2A24] max-sm:text-lg truncate">
                      {c?.name ?? `#${c.id}`}
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm text-[#2F2A24]/65 leading-relaxed line-clamp-2">
                      Tap to book this service from your appointments page.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0 max-sm:p-5 max-sm:pt-0">
                <div className="flex items-center justify-between gap-3">
                 

                  <span
                    className="
                      inline-flex items-center gap-2
                      text-[12px] font-black uppercase tracking-[0.15em]
                      text-green-800
                    "
                  >
                    Book
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 md:group-hover:translate-x-1.5" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const services = [
    {
      title: "Adopt",
      desc: "Find a loving companion and give them a forever home.",
      accent: "#FF705A",
      to: "/pets",
      img: "/h3-cat-pet-container.jpg",
    },
    {
      title: "Shop",
      desc: "Food, toys, and essentials picked with care.",
      accent: "#2DD4BF",
      to: "/shop",
      img: "/shop.jpg",
    },
    {
      title: "Hotel",
      desc: "Safe and cozy stay while you’re away.",
      accent: "#60A5FA",
      to: "/hotel",
      img: "/hotel.jpg",
    },
    {
      title: "Vet Care",
      desc: "Guidance, checkups, and trusted clinics.",
      accent: "#FB7185",
      to: "/vet",
      img: "/vet.jpg",
    },
  ];

  const centerGallery = [
    "/woman-holding-cute-little-dog-pet-shop.jpg",
    "/cute-brown-dog-pet-shop.jpg",
    "/cute-little-dog-pet-shop-with-owner.jpg",
    "/cute-dog-with-owner-pet-shop.jpg",
  ];

  // ✅ fetch medical services (appointment categories)
  const {
    data: catsRes,
    isLoading: loadingCats,
    isError: catsError,
  } = useGetAppointmentCategoriesQuery();

  const medicalServices = Array.isArray(catsRes?.data)
    ? catsRes.data.filter((c) => c?.is_active !== false)
    : [];

  return (
    <div className="min-h-screen bg-[#FBF7F1] text-[#2F2A24]">
      <Navbar />

      <main className="pt-0">
        {/* HERO */}
        <section
          id="hero"
          className="relative isolate overflow-hidden"
          style={{
            minHeight: "92vh",
            backgroundImage: "url('/pets3.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "50% 50%",
          }}
        >
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-[#e4e1dba9]" />

          {/* ✅ responsive فقط: px + grid gap + padding */}
          <div className="relative mx-auto max-w-6xl px-4 md:px-6">
            <div className="grid min-h-[92vh] items-center gap-10 py-14 md:grid-cols-2 max-sm:gap-8 max-sm:py-10">
              <div className="text-white">
                <SplitText
                  text="Everything your pet needs, in one happy place."
                  splitType="words"
                  className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]
                  max-sm:text-3xl"
                  delay={70}
                  duration={0.6}
                  from={{ opacity: 0, y: 22 }}
                  to={{ opacity: 1, y: 0 }}
                  textAlign="left"
                />

                <p className="mt-4 max-w-xl text-base md:text-lg text-white/85 max-sm:text-[15px]">
                  Adopt, shop, book stays, and get care — all in one smooth,
                  friendly experience
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3 max-sm:gap-2.5">
                  <Button
                    asChild
                    className="h-11 rounded-full bg-[#FFFD82] text-[#2F2A24] hover:bg-[#FFF86A] font-semibold
                    max-sm:h-10"
                  >
                    <Link to="/pets" className="inline-flex items-center gap-2">
                      Start Adopting <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-full border-white/30 bg-white/10 text-white hover:bg-white/15 font-semibold
                    max-sm:h-10"
                  >
                    <Link to="/shop">Visit Shop</Link>
                  </Button>
                </div>
              </div>

              <div className="md:justify-self-end"></div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        {/* ✅ responsive فقط: py */}
        <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 max-sm:py-12">
          <Separator className="mb-15 max-w-6xl bg-[#E7DCD0]" />

          <div className="mb-10 flex flex-col items-center text-center gap-3 max-sm:mb-8">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#2F2A24] max-sm:text-2xl">
              What you can do on <span className="text-green-800">Pet Hub</span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <Card
                key={s.title}
                className="
                  group overflow-hidden
                  rounded-3xl bg-white
                  border border-[#E7DCD0]/70
                  transition-all duration-500 ease-out
                  md:hover:-translate-y-3 md:hover:scale-[1.04]
                  md:hover:shadow-2xl md:hover:shadow-black/10
                "
              >
                <div className="relative h-44 overflow-hidden max-sm:h-40">
                  {s.img ? (
                    <img
                      src={s.img}
                      alt={s.title}
                      className="
                        h-full w-full object-cover
                        transition-transform duration-700 ease-out
                        md:group-hover:scale-110
                      "
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="h-full w-full grid place-items-center bg-[#FBF7F1]">
                      <span className="text-xs font-black tracking-[0.25em] text-[#2F2A24]/40">
                        IMAGE
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
                </div>

                <CardHeader className="p-6 pb-3 max-sm:p-5 max-sm:pb-3">
                  <CardTitle className="text-xl font-bold text-[#2F2A24] max-sm:text-lg">
                    {s.title}
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm text-[#2F2A24]/65 leading-relaxed line-clamp-2">
                    {s.desc}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 pt-0 max-sm:p-5 max-sm:pt-0">
                  <Link
                    to={s.to}
                    className="
                      inline-flex items-center gap-2
                      text-[12px] font-black uppercase tracking-[0.15em]
                      text-green-800
                      transition-all duration-300
                    "
                  >
                    <span className="relative">
                      Explore
                      <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-green-800 transition-all duration-300 md:group-hover:w-full" />
                    </span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 md:group-hover:translate-x-1.5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="mx-auto max-w-6xl bg-[#E7DCD0]" />

        {/* ✅ MEDICAL SERVICES (Slider) */}
        <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 max-sm:py-12">
          <div className="mb-10 flex flex-col items-center text-center gap-3 max-sm:mb-8">
         

            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#2F2A24] max-sm:text-2xl">
              Book trusted care for your pet
            </h2>

            <p className="max-w-2xl text-sm md:text-base text-[#2F2A24]/70">
              Quick appointment requests for our center’s medical services — simple, fast, and friendly.
            </p>

           
          </div>

          {loadingCats ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-[#E7DCD0]/70 bg-white/70 p-6 animate-pulse"
                >
                  <div className="h-10 w-10 rounded-2xl bg-[#E7DCD0]/60" />
                  <div className="mt-4 h-4 w-2/3 rounded bg-[#E7DCD0]/60" />
                  <div className="mt-2 h-3 w-full rounded bg-[#E7DCD0]/40" />
                  <div className="mt-2 h-3 w-5/6 rounded bg-[#E7DCD0]/40" />
                </div>
              ))}
            </div>
          ) : catsError ? (
            <div className="text-center text-sm text-red-700 bg-red-50 border border-red-100 rounded-2xl p-5">
              Failed to load medical services.
            </div>
          ) : medicalServices.length === 0 ? (
            <div className="text-center text-sm text-[#2F2A24]/70 bg-white/60 border border-[#E7DCD0]/70 rounded-2xl p-6">
              No active medical services right now.
            </div>
          ) : (
            <MedicalServicesSlider items={medicalServices} />
          )}
        </section>

        <Separator className="mx-auto max-w-6xl bg-[#E7DCD0]" />

        {/* ABOUT US */}
        <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 max-sm:py-10">
          <div className="mb-12 flex flex-col items-center text-center space-y-4 max-sm:mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100"></div>

            <h2
              className="text-4xl md:text-6xl font-black tracking-tighter text-[#2F2A24] leading-[1.1] max-w-4xl mx-auto
            max-sm:text-3xl"
            >
              Not just a shelter, <br className="hidden md:block" />
              but a <span className="text-green-800">home</span> until they find{" "}
              <span className="text-green-800 relative">
                yours.
                <svg
                  className="absolute -bottom-2 left-0 w-full h-2 text-green-800/20"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 5 Q 25 0 50 5 T 100 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                </svg>
              </span>
            </h2>
          </div>

          <div className="grid items-start gap-12 lg:grid-cols-2 max-sm:gap-10">
            {/* الجهة اليسرى: السلايدر */}
            <div className="order-2 lg:order-1">
              <div className="relative overflow-hidden rounded-[2.5rem] border border-stone-100 shadow-sm transition-transform duration-500 hover:shadow-md">
                <CenterGallerySlider images={centerGallery} />
              </div>

              <div className="mt-6 flex items-center justify-center lg:justify-start gap-3 text-stone-400 max-sm:mt-4">
                <div className="h-px w-8 bg-stone-200" />
                <Camera className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.2em] font-medium">
                  Actual Glimpses from our center
                </span>
              </div>
            </div>

            {/* الجهة اليمنى: الفقرات المرقمة */}
            <div className="order-1 lg:order-2 space-y-6">
              <div className="space-y-4">
                {[
                  {
                    num: "01",
                    title: "Safe Boarding & Sanctuary",
                    text:
                      "Whether you're away or need a temporary home for a pet, we provide a secure, high-standard sanctuary where animals are cared for with professional supervision and love.",
                  },
                  {
                    num: "02",
                    title: "Premium Pet Essentials",
                    text:
                      "We offer a carefully selected range of high-quality food, accessories, and health supplies, ensuring you have everything needed to keep your pet happy and thriving.",
                  },
                  {
                    num: "03",
                    title: "Adoption & Lifelong Care",
                    text:
                      "We dedicate ourselves to rescuing and rehabilitating pets, guiding them through a seamless adoption process to find their perfect match and a loving forever home.",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="
                      group relative p-6 rounded-3xl border border-transparent bg-white
                      transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                      md:hover:scale-[1.05] md:hover:border-stone-100 md:hover:shadow-xl md:hover:shadow-green-900/5
                      cursor-default
                      max-sm:p-5
                    "
                  >
                    <div className="flex gap-5 max-sm:gap-4">
                      <span className="text-2xl font-black text-green-800/20 group-hover:text-green-800 transition-colors duration-500">
                        {item.num}
                      </span>
                      <div className="space-y-1">
                        <h4 className="text-lg font-bold text-[#2F2A24] max-sm:text-base">
                          {item.title}
                        </h4>
                        <p className="text-[#2F2A24]/70 leading-relaxed text-sm md:text-base">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* الأزرار */}
              <div className="pt-4 flex flex-wrap items-center gap-6 justify-center lg:justify-start max-sm:gap-4">
                <Button
                  asChild
                  className="h-14 px-10 rounded-full bg-green-800 hover:bg-green-900 text-white shadow-lg transition-all hover:-translate-y-1 active:scale-95 font-bold
                  max-sm:h-12 max-sm:px-8"
                >
                  <Link to="/about">Our Story</Link>
                </Button>

                <Link
                  to="/pets"
                  className="group/link flex items-center gap-2 font-bold text-green-800 text-sm uppercase tracking-widest transition-all hover:gap-4"
                >
                  Explore Adoption
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
