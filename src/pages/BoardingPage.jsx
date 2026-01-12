import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import { toast } from "sonner";

import {
  useCreateBoardingReservationMutation,
  useGetBoardingQuoteMutation,
  useGetBoardingServicesQuery,
} from "@/features/boarding/boardingApiSlice";

import { useGetPetTypesQuery } from "@/features/petTypes/petTypesApiSlice";
import { useGetPetBreedsQuery } from "@/features/petBreeds/petBreedsApiSlice";

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

const serviceLabel = (s) => s?.name_en || s?.name || "#" + s?.id;
const typeLabel = (pt) => pt?.name_en || pt?.name || "#" + pt?.id;
const breedLabel = (b) => b?.name_en || b?.name || "#" + b?.id;

export default function BoardingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const centerGallery = useMemo(
    () => [
      { src: "/photo_2026-01-08_18-09-29.jpg", title: "Luxury Suites", desc: "Spacious and climate-controlled rooms." },
      { src: "/photo_2026-01-08_18-09-32.jpg", title: "Active Play Zone", desc: "Daily supervised exercise and socialization."},
      { src: "/photo_2026-01-08_18-09-34.jpg", title: "Medical Hub", desc: "24/7 veterinary supervision for peace of mind." },
      { src: "/photo_2026-01-08_18-09-35.jpg", title: "Premium Dining", desc: "Customized nutrition plans for every pet." },
      { src: "/photo_2026-01-08_18-09-37.jpg", title: "Outdoor Gardens", desc: "Secure outdoor spaces for fresh air." },
      { src: "/photo_2026-01-08_18-09-41.jpg", title: "Grooming Spa", desc: "Professional grooming and pampering services." },
    ], []
  );

  const galleryRef = useRef(null);
  
  const scrollGallery = (dir) => {
    const el = galleryRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  const { data: servicesRes } = useGetBoardingServicesQuery();
  const services = useMemo(() => (Array.isArray(servicesRes?.data) ? servicesRes.data.filter(s => s.is_active !== false) : []), [servicesRes]);
  const { data: petTypesRes, isLoading: loadingTypes } = useGetPetTypesQuery();
  const { data: petBreedsRes, isLoading: loadingBreeds } = useGetPetBreedsQuery();
  const petTypes = useMemo(() => (Array.isArray(petTypesRes?.data) ? petTypesRes.data : []), [petTypesRes]);
  const allBreeds = useMemo(() => (Array.isArray(petBreedsRes?.data) ? petBreedsRes.data : []), [petBreedsRes]);

  const [selectedServices, setSelectedServices] = useState({});
  const [petTypeId, setPetTypeId] = useState("");
  const [petBreedId, setPetBreedId] = useState("");
  const [ageMonths, setAgeMonths] = useState(8);
  const [startAt, setStartAt] = useState(toInputDateTime("2026-01-10 14:30:00"));
  const [endAt, setEndAt] = useState(toInputDateTime("2026-01-12 15:30:00"));
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  useEffect(() => {
    if (petTypes.length && !petTypeId) setPetTypeId(String(petTypes[0].id));
  }, [petTypes, petTypeId]);

  const breeds = useMemo(() => {
    const tid = Number(petTypeId);
    return allBreeds.filter((b) => Number(b?.pet_type?.id) === tid);
  }, [allBreeds, petTypeId]);

  useEffect(() => {
    if (breeds.length > 0) setPetBreedId(String(breeds[0].id));
    else setPetBreedId("");
  }, [breeds]);

  const [getQuote, { data: quoteData, isLoading: quoting }] = useGetBoardingQuoteMutation();
  const [createReservation, { isLoading: creating }] = useCreateBoardingReservationMutation();

  const payload = useMemo(() => ({
    pet_type_id: Number(petTypeId),
    pet_breed_id: Number(petBreedId),
    age_months: Number(ageMonths),
    start_at: fromInputDateTime(startAt),
    end_at: fromInputDateTime(endAt),
    services: Object.keys(selectedServices).map(id => ({ id: Number(id), quantity: 1 })),
  }), [petTypeId, petBreedId, ageMonths, startAt, endAt, selectedServices]);

  const onQuote = async () => {
    try {
      await getQuote(payload).unwrap();
      toast.success("Price updated");
    } catch (err) {
      if (err.status === 401) setAuthDialogOpen(true);
      else toast.error("Update failed");
    }
  };

  const onCreate = async () => {
    try {
      await createReservation(payload).unwrap();
      toast.success("Reservation successful!");
      navigate("/my-boarding-reservations");
    } catch (err) {
      if (err.status === 401) setAuthDialogOpen(true);
      else toast.error("Booking failed");
    }
  };

  const toggleService = (id) => {
    setSelectedServices(prev => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-emerald-100">
      <Navbar />

      {/* Auth Dialog */}
      {authDialogOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 shadow-2xl border border-white">
             <div className="text-center">
                <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                   <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-6a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Sign In Required</h3>
                <p className="text-slate-500 mt-2">Please log in to your account to complete your booking.</p>
                <div className="flex flex-col gap-3 mt-8">
                  <button onClick={() => navigate("/login")} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">Login Now</button>
                  <button onClick={() => setAuthDialogOpen(false)} className="w-full py-3 text-slate-400 font-medium hover:text-slate-600 transition-colors">Maybe Later</button>
                </div>
             </div>
          </div>
        </div>
      )}

      <main className="pb-20 pt-8">
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Explore Our Guest Suites & Book a Stay</h1>
        </div>

        {/* Gallery */}
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="relative bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden group">
            <button onClick={() => scrollGallery(-1)} className="absolute left-6 top-1/2 -translate-y-1/2 z-20 h-11 w-11 bg-white/90 border border-slate-200 rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-emerald-600 hover:text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => scrollGallery(1)} className="absolute right-6 top-1/2 -translate-y-1/2 z-20 h-11 w-11 bg-white/90 border border-slate-200 rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-emerald-600 hover:text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>

            <div ref={galleryRef} className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar gap-4 p-2">
              {centerGallery.map((item, index) => (
                <div key={index} className="min-w-full md:min-w-[70%] snap-center relative aspect-[21/9] rounded-2xl overflow-hidden group/item">
                  <img src={item.src} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-105" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex flex-col justify-end p-8">
                    <h3 className="text-2xl font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-slate-200 text-sm max-w-md">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
  <div className="grid lg:grid-cols-12 gap-10">
    {/* Form Side */}
    <div className="lg:col-span-8 space-y-12">
      
      {/* Pet Info */}
      <section>
        <div className="flex items-center gap-4 mb-6">
           <div className="h-10 w-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center shadow-md">
             <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
           </div>
           <div>
             <h2 className="text-xl font-bold text-slate-800 tracking-tight">Pet Information</h2>
             <p className="text-xs text-slate-500 font-medium">Basic details about your pet</p>
           </div>
           {/* ديفايدر أغمق */}
           <div className="h-px flex-1 bg-slate-300 ml-2"></div>
        </div>
        
        <div className="bg-white p-8 rounded-xl border border-slate-300 shadow-sm grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">Pet Type</label>
            <select value={petTypeId} onChange={(e) => setPetTypeId(e.target.value)} disabled={loadingTypes} className="w-full bg-white border border-slate-400 rounded-lg h-12 px-4 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all outline-none appearance-none">
              {petTypes.map(pt => <option key={pt.id} value={pt.id}>{typeLabel(pt)}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">Breed</label>
            <select value={petBreedId} onChange={(e) => setPetBreedId(e.target.value)} disabled={loadingBreeds} className="w-full bg-white border border-slate-400 rounded-lg h-12 px-4 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all outline-none appearance-none">
              {breeds.map(b => <option key={b.id} value={b.id}>{breedLabel(b)}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">Age (Months)</label>
            <input type="number" value={ageMonths} onChange={(e) => setAgeMonths(e.target.value)} className="w-full bg-white border border-slate-400 rounded-lg h-12 px-4 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all outline-none" />
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section>
        <div className="flex items-center gap-4 mb-6">
           <div className="h-10 w-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center shadow-md">
             <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
           </div>
           <div>
             <h2 className="text-xl font-bold text-slate-800 tracking-tight">Stay Schedule</h2>
             <p className="text-xs text-slate-500 font-medium">Select check-in and check-out</p>
           </div>
           {/* ديفايدر أغمق */}
           <div className="h-px flex-1 bg-slate-300 ml-2"></div>
        </div>
        
        <div className="bg-white p-8 rounded-xl border border-slate-300 shadow-sm grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">Check-in Date</label>
            <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className="w-full bg-white border border-slate-400 rounded-lg h-12 px-4 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">Check-out Date</label>
            <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} className="w-full bg-white border border-slate-400 rounded-lg h-12 px-4 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all outline-none" />
          </div>
        </div>
      </section>

      {/* Extra Care */}
      <section>
        <div className="flex items-center gap-4 mb-6">
           <div className="h-10 w-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center shadow-md">
             <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
           </div>
           <div>
             <h2 className="text-xl font-bold text-slate-800 tracking-tight">Extra Care</h2>
             <p className="text-xs text-slate-500 font-medium">Optional premium services</p>
           </div>
           <div className="h-px flex-1 bg-slate-300 ml-2"></div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {services.map((service) => {
            const active = !!selectedServices[service.id];
            return (
              <button key={service.id} onClick={() => toggleService(service.id)} className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all text-left ${active ? 'bg-emerald-50 border-emerald-600' : 'bg-white border-slate-200 hover:border-slate-400'}`}>
                <div className="flex items-center gap-4">
                   <div className={`h-6 w-6 rounded flex items-center justify-center transition-colors ${active ? 'bg-emerald-600' : 'bg-slate-200'}`}>
                      {active && <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
                   </div>
                   <span className={`text-xs font-bold uppercase tracking-tight ${active ? 'text-emerald-900' : 'text-slate-600'}`}>{serviceLabel(service)}</span>
                </div>
                <span className={`font-bold text-sm ${active ? 'text-emerald-700' : 'text-slate-500'}`}>{money(service.price)}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>

    {/* Sticky Sidebar (Summary) */}
    <div className="lg:col-span-4">
      <div className="sticky top-10">
        {/* تم تعديل لون الـ Summary ليكون أخف (Slate-800) مع حواف أقل انحناءً */}
        <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col min-h-[550px]">
           <div className="bg-slate-700 p-8 text-center border-b border-white/5">
              <h2 className="text-white text-lg font-bold uppercase tracking-widest">Booking Summary</h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Please review your stay</p>
           </div>
           
           <div className="p-8 flex-1 flex flex-col justify-between space-y-8">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Duration</p>
                      <div className="flex items-baseline gap-1">
                         <span className="text-3xl font-bold text-white">{quoteData?.billable_hours || "0"}</span>
                         <span className="text-slate-400 text-xs font-bold uppercase">Hours</span>
                      </div>
                   </div>
                   <div className="h-12 w-12 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                      <svg className="h-6 w-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   </div>
                </div>

                <div className="h-px bg-white/10"></div>

                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Amount</p>
                   <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-emerald-400 tracking-tighter">
                         {quoteData?.total ? money(quoteData.total) : "$0.00"}
                      </span>
                   </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                 <button onClick={onQuote} disabled={quoting} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all border border-white/10">
                    {quoting ? "Recalculating..." : "Recalculate Price"}
                 </button>
                 <button onClick={onCreate} disabled={creating || !quoteData} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-20">
                    Confirm Reservation
                 </button>
              </div>

              <div className="text-center pt-2">
                <Link to="/my-boarding-reservations" className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">
                    View Booking History
                </Link>
              </div>
           </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3 py-4 px-6 bg-white rounded-xl border border-slate-300">
           <svg className="h-4 w-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secure Checkout</span>
        </div>
      </div>
    </div>
  </div>
</div>
      </main>

      {/* Footer Section */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <h2 className="text-2xl font-black text-slate-900 mb-4">Pet Boarding <span className="text-emerald-600">Suites</span></h2>
              <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
                Providing the highest standard of luxury boarding, medical care, and grooming services for your beloved pets since 2018.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-6">Contact Us</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li className="flex items-center gap-3">
                  <svg className="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  +1 (555) 123-4567
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  hello@pethotel.com
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-6">Location</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                123 Pet Avenue, Suite 500<br />
                Luxury District, CA 90210
              </p>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col md:row justify-between items-center gap-4">
            <p className="text-slate-400 text-xs">© 2026 PetBoarding. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="#" className="text-slate-400 hover:text-emerald-600 transition-colors text-xs font-bold uppercase tracking-widest">Privacy Policy</Link>
              <Link to="#" className="text-slate-400 hover:text-emerald-600 transition-colors text-xs font-bold uppercase tracking-widest">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}