// src/pages/HomePage.jsx
import React, { useState } from "react";
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
            <div className="aspect-[14/15] w-full">
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
        className="absolute left-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-[#E7DCD0] bg-white/80 text-[#2F2A24] shadow-none hover:bg-white"
        aria-label="Previous"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => go(1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-[#E7DCD0] bg-white/80 text-[#2F2A24] shadow-none hover:bg-white"
        aria-label="Next"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-white/30 bg-black/20 px-3 py-1.5 backdrop-blur-md">
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

          <div className="relative mx-auto max-w-6xl px-4 md:px-6">
            <div className="grid min-h-[92vh] items-center gap-10 py-14 md:grid-cols-2">
              <div className="text-white">
                <SplitText
                  text="Everything your pet needs, in one happy place."
                  splitType="words"
                  className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]"
                  delay={70}
                  duration={0.6}
                  from={{ opacity: 0, y: 22 }}
                  to={{ opacity: 1, y: 0 }}
                  textAlign="left"
                />

                <p className="mt-4 max-w-xl text-base md:text-lg text-white/85">
                  Adopt, shop, book stays, and get care — all in one smooth,
                  friendly experience
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Button
                    asChild
                    className="h-11 rounded-full bg-[#FFFD82] text-[#2F2A24] hover:bg-[#FFF86A] font-semibold"
                  >
                    <Link to="/pets" className="inline-flex items-center gap-2">
                      Start Adopting <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-full border-white/30 bg-white/10 text-white hover:bg-white/15 font-semibold"
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
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">

  <Separator className="mb-15 max-w-6xl bg-[#E7DCD0]" />

  <div className="mb-10 flex flex-col items-center text-center gap-3">
    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#2F2A24]">
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
          hover:-translate-y-3 hover:scale-[1.04]
          hover:shadow-2xl hover:shadow-black/10
        "
      >
        {/* ===== IMAGE TOP (HALF CARD) ===== */}
        <div className="relative h-44 overflow-hidden">
          {s.img ? (
            <img
              src={s.img}
              alt={s.title}
              className="
                h-full w-full object-cover
                transition-transform duration-700 ease-out
                group-hover:scale-110
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

          {/* overlay خفيف */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
        </div>

        {/* ===== CONTENT ===== */}
        <CardHeader className="p-6 pb-3">
          <CardTitle className="text-xl font-bold text-[#2F2A24]">
            {s.title}
          </CardTitle>
          <CardDescription className="mt-2 text-sm text-[#2F2A24]/65 leading-relaxed line-clamp-2">
            {s.desc}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 pt-0">
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
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-green-800 transition-all duration-300 group-hover:w-full" />
            </span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
        </CardContent>
      </Card>
    ))}
  </div>
</section>

<Separator className="mx-auto max-w-6xl bg-[#E7DCD0]" />

        {/* ABOUT US */}
        <section className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <div className="mb-12 flex flex-col items-center text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100"></div>

            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-[#2F2A24] leading-[1.1] max-w-4xl mx-auto">
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

          <div className="grid items-start gap-12 lg:grid-cols-2">
            {/* الجهة اليسرى: السلايدر */}
            <div className="order-2 lg:order-1">
              <div className="relative overflow-hidden rounded-[2.5rem] border border-stone-100 shadow-sm transition-transform duration-500 hover:shadow-md">
                <CenterGallerySlider images={centerGallery} />
              </div>

              <div className="mt-6 flex items-center justify-center lg:justify-start gap-3 text-stone-400">
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
                      hover:scale-[1.05] hover:border-stone-100 hover:shadow-xl hover:shadow-green-900/5
                      cursor-default
                    "
                  >
                    <div className="flex gap-5">
                      <span className="text-2xl font-black text-green-800/20 group-hover:text-green-800 transition-colors duration-500">
                        {item.num}
                      </span>
                      <div className="space-y-1">
                        <h4 className="text-lg font-bold text-[#2F2A24]">
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
              <div className="pt-4 flex flex-wrap items-center gap-6 justify-center lg:justify-start">
                <Button
                  asChild
                  className="h-14 px-10 rounded-full bg-green-800 hover:bg-green-900 text-white shadow-lg transition-all hover:-translate-y-1 active:scale-95 font-bold"
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
