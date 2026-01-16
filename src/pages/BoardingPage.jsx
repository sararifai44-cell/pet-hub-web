import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import { toast } from "sonner";
import { Dialog, DialogContent, CircularProgress } from "@mui/material";
import { 
  Heart, ShieldCheck, CheckCircle2, X, ArrowLeft, Sparkles, ScrollText, Clock, Info, CalendarDays 
} from "lucide-react";
import ShieldMoonIcon from '@mui/icons-material/ShieldMoon';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import CancelScheduleSendIcon from '@mui/icons-material/CancelScheduleSend';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import LocalActivityIcon from '@mui/icons-material/LocalActivity'; // تأكد من وجود هذا السطر
import PaymentsIcon from '@mui/icons-material/Payments';
import {
  useCreateBoardingReservationMutation,
  useGetBoardingQuoteMutation,
  useGetBoardingServicesQuery,
} from "@/features/boarding/boardingApiSlice";
import { useGetPetTypesQuery } from "@/features/petTypes/petTypesApiSlice";
import { useGetPetBreedsQuery } from "@/features/petBreeds/petBreedsApiSlice";
import { getToken } from "@/app/apiSlice";

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

const serviceLabel = (s) => s?.name_en || s?.name || "#" + s.id;
const typeLabel = (pt) => pt?.name_en || pt?.name || "#" + pt.id;
const breedLabel = (b) => b?.name_en || b?.name || "#" + b.id;

export default function BoardingPage() {
  const navigate = useNavigate();
  const token = getToken();
  const formRef = useRef(null);

  const [activeStep, setActiveStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState({});
  const [petTypeId, setPetTypeId] = useState("");
  const [petBreedId, setPetBreedId] = useState("");
  const [ageMonths, setAgeMonths] = useState(8);
  const [startAt, setStartAt] = useState(toInputDateTime("2026-01-15 14:00:00"));
  const [endAt, setEndAt] = useState(toInputDateTime("2026-01-17 14:00:00"));
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const { data: servicesRes } = useGetBoardingServicesQuery();
  const services = useMemo(() =>
    Array.isArray(servicesRes?.data) ? servicesRes.data.filter((s) => s.is_active !== false) : [],
    [servicesRes]
  );

  const { data: petTypesRes } = useGetPetTypesQuery();
  const { data: petBreedsRes } = useGetPetBreedsQuery();
  const petTypes = useMemo(() => (Array.isArray(petTypesRes?.data) ? petTypesRes.data : []), [petTypesRes]);
  const allBreeds = useMemo(() => (Array.isArray(petBreedsRes?.data) ? petBreedsRes.data : []), [petBreedsRes]);

  const sliderImages = useMemo(() => [
    { src: "/photo_2026-01-08_18-09-29.jpg", label: "Luxury Suites" },
    { src: "/photo_2026-01-08_18-09-32.jpg", label: "Play Zones" },
    { src: "/photo_2026-01-08_18-09-34.jpg", label: "Medical Hub" },
  ], []);

  useEffect(() => {
    const timer = setInterval(() => { setActiveStep((prev) => (prev + 1) % sliderImages.length); }, 5000);
    return () => clearInterval(timer);
  }, [sliderImages.length]);

  const breeds = useMemo(() => {
    const tid = Number(petTypeId);
    return allBreeds.filter((b) => Number(b?.pet_type?.id) === tid);
  }, [allBreeds, petTypeId]);

  const [getQuote, { data: quoteData, isLoading: quoting }] = useGetBoardingQuoteMutation();
  const [createReservation, { isLoading: creating }] = useCreateBoardingReservationMutation();

  const payload = useMemo(() => ({
    pet_type_id: Number(petTypeId),
    pet_breed_id: Number(petBreedId),
    age_months: Number(ageMonths),
    start_at: fromInputDateTime(startAt),
    end_at: fromInputDateTime(endAt),
    services: Object.keys(selectedServices).map((id) => ({ id: Number(id), quantity: 1 })),
  }), [petTypeId, petBreedId, ageMonths, startAt, endAt, selectedServices]);

  const handleBookingClick = async () => {
    if (!token) { setAuthDialogOpen(true); return; }
    try {
      await getQuote(payload).unwrap();
      setConfirmDialogOpen(true);
    } catch (err) {
      toast.error("Please fill all details correctly");
    }
  };

  const onFinalConfirm = async () => {
    try {
      await createReservation(payload).unwrap();
      toast.success("Reservation successful!");
      navigate("/my-boarding-reservations");
    } catch (err) {
      toast.error("Booking failed");
    }
  };

  const toggleService = (id) => {
    setSelectedServices((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id]; else next[id] = true;
      return next;
    });
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] font-sans">
      <Navbar />

      <main className="pb-20">
        {/* --- Header Section --- */}
        <div className="relative w-full bg-[#345e54]">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 items-center min-h-[600px]">
            <div className="p-8 md:p-16 z-10 space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                  Premium Boarding <br/> & Professional Care
                </h1>
                <div className="space-y-4 max-w-lg">
                  <p className="text-[#e2f3f0] text-sm md:text-base leading-relaxed opacity-90 font-medium">
                    Our policy ensures a safe, medical-grade environment for your pets. We provide 24/7 supervision and regular health check-ups.
                  </p>
                  <ul className="space-y-4">
                    {[
                      { text: 'Daily medical screening', icon: <ShieldCheck className="h-4 w-4 text-emerald-400" />, desc: 'Professional vet check-up every morning.' },
                      { text: 'Climate-controlled suites', icon: <Sparkles className="h-4 w-4 text-amber-300" />, desc: 'Perfect temperature for deep rest.' },
                      { text: 'Supervised social playtime', icon: <Heart className="h-4 w-4 text-pink-400" />, desc: 'Safe interaction under expert eyes.' }
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 group">
                        <div className="mt-1 p-1.5 rounded-lg bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">{item.icon}</div>
                        <div>
                          <p className="text-white text-sm font-bold leading-none">{item.text}</p>
                          <p className="text-white/50 text-[10px] mt-1 font-medium">{item.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-wrap gap-4 pt-4">
                  <button onClick={scrollToForm} className="px-8 py-4 rounded-xl bg-[#a8d5cb] text-[#345e54] text-sm font-black hover:bg-white transition-all shadow-lg flex items-center gap-2">
                    Book Now <ArrowLeft className="rotate-[270deg] w-4 h-4" />
                  </button>
                  <button onClick={() => navigate("/")} className="px-8 py-4 rounded-xl bg-transparent border-2 border-white/20 text-white text-sm font-bold hover:bg-white/10 transition-all">
                    Home Page
                  </button>
                </div>
              </div>
            </div>
            <div className="relative h-[400px] md:h-full w-full overflow-hidden">
              {sliderImages.map((img, idx) => (
                <img key={idx} src={img.src} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${idx === activeStep ? "opacity-100" : "opacity-0"}`} alt="Slider" />
              ))}
              <div className="absolute inset-0 bg-black/10" />
            </div>
          </div>
        </div>
        <hr className="border-t border-[#6d4c41]/40 my-8" />

        {/* --- Booking Section --- */}
        <div ref={formRef} className="max-w-7xl mx-auto px-6 mt-20 relative z-20">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            
            <div className="lg:col-span-2 bg-[#fcfaf7] rounded-2xl shadow-xl border border-[#d6ccbd] overflow-hidden">
              <div className="p-8 md:p-12">
                <div className="flex items-center gap-5 mb-10 pb-6 border-b border-[#e8dfd1]">
                  {/* الدائرة المطلوبة للصورة */}
                  <div className="h-14 w-14 bg-[#6d4c41]/10 rounded-full flex items-center justify-center overflow-hidden border border-[#6d4c41]/20">
<img 
    src="/VET2.PNG" 
    alt="Vet Icon" 
    className="w-14 h-14 rounded-full object-cover shadow-sm border border-[#6d4c41]/10" 
  />                  </div>
                 <div>
    <h2 className="text-2xl font-bold text-[#6d4c41] tracking-tight">Reservation Details</h2>
    <p className="text-[10px] text-[#6d4c41]/50 font-bold uppercase tracking-widest mt-1">Complete the information below</p>
  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-[11px] font-bold text-[#6d4c41] uppercase tracking-[0.2em] flex items-center gap-2"><ScrollText className="w-4 h-4 opacity-50" /> Pet Info</h3>
                    <div className="grid gap-5">
                      <div className="relative">
                        <label className="text-[9px] font-bold text-[#6d4c41] uppercase absolute -top-2 left-4 bg-[#fcfaf7] px-2 z-10">Pet Type</label>
                        <select value={petTypeId} onChange={(e) => {setPetTypeId(e.target.value); setPetBreedId("");}} className="w-full border border-[#d6ccbd] rounded-xl px-5 py-4 text-sm font-medium text-[#6d4c41] focus:border-[#6d4c41] outline-none bg-white transition-all">
                          <option value="">Select Type</option>
                          {petTypes.map((pt) => <option key={pt.id} value={pt.id}>{typeLabel(pt)}</option>)}
                        </select>
                      </div>
                      <div className="relative">
                        <label className="text-[9px] font-bold text-[#6d4c41] uppercase absolute -top-2 left-4 bg-[#fcfaf7] px-2 z-10">Breed</label>
                        <select value={petBreedId} onChange={(e) => setPetBreedId(e.target.value)} disabled={!petTypeId} className="w-full border border-[#d6ccbd] rounded-xl px-5 py-4 text-sm font-medium text-[#6d4c41] focus:border-[#6d4c41] outline-none bg-white disabled:opacity-50 transition-all">
                          <option value="">Select Breed</option>
                          {breeds.map((b) => <option key={b.id} value={b.id}>{breedLabel(b)}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-[11px] font-bold text-[#6d4c41] uppercase tracking-[0.2em] flex items-center gap-2"><Clock className="w-4 h-4 opacity-50" /> Schedule</h3>
                    <div className="grid gap-5">
                      <div className="relative">
                        <label className="text-[9px] font-bold text-[#6d4c41] uppercase absolute -top-2 left-4 bg-[#fcfaf7] px-2 z-10">Check-in</label>
                        <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className="w-full border border-[#d6ccbd] rounded-xl px-5 py-4 text-sm font-medium text-[#6d4c41] focus:border-[#6d4c41] outline-none bg-white transition-all" />
                      </div>
                      <div className="relative">
                        <label className="text-[9px] font-bold text-[#6d4c41] uppercase absolute -top-2 left-4 bg-[#fcfaf7] px-2 z-10">Check-out</label>
                        <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} className="w-full border border-[#d6ccbd] rounded-xl px-5 py-4 text-sm font-medium text-[#6d4c41] focus:border-[#6d4c41] outline-none bg-white transition-all" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 space-y-6">
                  <h3 className="text-[11px] font-bold text-[#6d4c41] uppercase tracking-[0.2em]">Extra Care Services</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {services.map((s) => {
                      const active = !!selectedServices[s.id];
                      return (
                        <button key={s.id} onClick={() => toggleService(s.id)} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${active ? "bg-[#6d4c41] border-[#6d4c41] text-white shadow-md" : "bg-white border-[#d6ccbd] text-[#6d4c41]"}`}>
                          <div className="text-left">
                            <p className="text-xs font-bold leading-tight">{serviceLabel(s)}</p>
                            <p className={`text-[10px] mt-1 ${active ? "text-white/70" : "text-[#6d4c41]/50"}`}>{money(s.price)}</p>
                          </div>
                          {active ? <CheckCircle2 className="h-5 w-5" /> : <div className="h-5 w-5 rounded-full border border-[#d6ccbd]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-[#e8dfd1]">
                  <button onClick={handleBookingClick} disabled={quoting} className="w-full py-5 rounded-xl bg-[#6d4c41] text-white text-base font-bold hover:bg-[#543b32] transition-all shadow-lg flex items-center justify-center gap-3">
                    {quoting ? <CircularProgress size={22} color="inherit" /> : "Calculate My Pet's Stay"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side: Policy & Navigation */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="bg-[#6d4c41] text-white p-7 rounded-lg shadow-xl border border-white/10">
                <div className="flex items-center gap-3 mb-8 border-b border-white/20 pb-4">
                  <ShieldMoonIcon sx={{ fontSize: 24, color: 'white' }} />
                  <h4 className="text-xl font-medium tracking-tight uppercase">Booking Policy</h4>
                </div>
                
                <ul className="space-y-7">
                  {[
                    { title: 'Health Records', text: 'Up-to-date vaccination records are mandatory upon check-in.', icon: <VerifiedUserIcon sx={{ fontSize: 16 }} /> },
                    { title: 'Check-in Window', text: 'Arrival is required 15 minutes before your slot.', icon: <AccessTimeFilledIcon sx={{ fontSize: 16 }} /> },
                    { title: 'Cancellation', text: 'Cancel for free up to 24 hours before your pet’s stay.', icon: <CancelScheduleSendIcon sx={{ fontSize: 16 }} /> },
                    { title: 'Emergency', text: 'Please provide an active emergency number.', icon: <ContactPhoneIcon sx={{ fontSize: 16 }} /> }
                  ].map((item, i) => (
                    <li key={i}>
                      <p className="text-[11px] font-bold uppercase text-white/90 tracking-widest mb-2 flex items-center gap-2">
                        {item.icon} {item.title}
                      </p>
                      <p className="text-sm text-white/80 leading-relaxed font-normal pl-6">
                        {item.text}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="mt-10 pt-6 border-t border-white/10 text-center">
                  <p className="text-[10px] text-white/40 font-medium uppercase italic">
                    * Terms & conditions apply to all bookings
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="py-1 px-4">
                <hr className="border-t-2 border-[#6d4c41]/10 w-full" />
              </div>

              {/* الزر المطلوب تعديله */}
              <button 
                onClick={() => navigate("/my-boarding-reservations")}
                className="w-full bg-white border border-[#6d4c41]/30 text-[#6d4c41] py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-[#6d4c41] hover:text-white transition-all duration-300 shadow-sm group"
              >
                <CalendarMonthIcon sx={{ fontSize: 20 }} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold uppercase tracking-tighter">View My Reservations</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* --- Summary Dialog --- */}
 <Dialog 
  open={confirmDialogOpen} 
  onClose={() => setConfirmDialogOpen(false)} 
  PaperProps={{ sx: { borderRadius: '1.5rem', maxWidth: '550px', width: '100%' } }}
>
  <DialogContent className="p-12">
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#6d4c41]/10 rounded-lg text-[#6d4c41]">
          <Info size={24} />
        </div>
        <h3 className="text-2xl font-bold text-[#6d4c41]">Stay Summary</h3>
      </div>
      <button onClick={() => setConfirmDialogOpen(false)} className="text-stone-400 hover:text-red-500 transition-colors">
        <X size={28} />
      </button>
    </div>

    <div className="space-y-6 bg-[#f5f0e8] rounded-2xl p-8 mb-10 border border-[#d6ccbd]">
      {/* قسم الساعات */}
      <div className="flex justify-between items-center text-base border-b border-[#d6ccbd]/50 pb-5">
        <div className="flex items-center gap-2 text-[#6d4c41]/60">
          <Clock size={18} />
          <span className="font-medium">Billable Hours</span>
        </div>
        <span className="font-bold text-[#6d4c41] text-lg">{quoteData?.billable_hours || 0} hrs</span>
      </div>

      {/* قسم الخدمات المختارة */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <LocalActivityIcon sx={{ fontSize: 18, color: '#6d4c41', opacity: 0.5 }} />
          <p className="text-[11px] font-bold text-[#6d4c41]/50 uppercase tracking-wider">Selected Extra Services</p>
        </div>

        {services.filter(s => !!selectedServices[s.id]).length > 0 ? (
          <div className="space-y-2">
            {services.filter(s => !!selectedServices[s.id]).map((service) => (
              <div key={service.id} className="flex justify-between items-center bg-white/60 p-4 rounded-xl border border-[#d6ccbd]/30 hover:bg-white transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#345e54]/40" />
                  <span className="text-sm font-bold text-[#6d4c41]">{serviceLabel(service)}</span>
                </div>
                <span className="text-sm font-black text-[#345e54]">{money(service.price)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center border-2 border-dashed border-[#d6ccbd]/40 rounded-xl">
             <p className="text-xs italic text-[#6d4c41]/40">No extra services selected</p>
          </div>
        )}
      </div>

      {/* المجموع النهائي */}
      <div className="pt-6 border-t border-[#d6ccbd] flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PaymentsIcon sx={{ fontSize: 16, color: '#345e54', opacity: 0.6 }} />
            <p className="text-[11px] font-bold text-[#6d4c41]/50 uppercase tracking-wider">Total Amount</p>
          </div>
          <span className="text-4xl font-black text-[#345e54]">
            {money(quoteData?.total || quoteData?.data?.total_price)}
          </span>
        </div>
      </div>
    </div>

    <button 
      onClick={onFinalConfirm} 
      disabled={creating} 
      className="w-full py-5 rounded-2xl bg-[#345e54] text-white text-lg font-bold hover:bg-[#2a4d44] transition-all shadow-xl flex items-center justify-center gap-3 group"
    >
      {creating ? (
        <CircularProgress size={24} color="inherit" />
      ) : (
        <>
          <span>Confirm Reservation</span>
          <CheckCircle2 size={22} className="group-hover:scale-110 transition-transform" />
        </>
      )}
    </button>
  </DialogContent>
</Dialog>
      <hr className="border-t border-[#6d4c41]/20 my-6" />
    </div>
  );
}