import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import { toast } from "sonner";

// ✅ Material UI Imports
import { MobileStepper } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import { 
  CalendarDays, 
  Stethoscope, 
  ShieldCheck, 
  HeartPulse, 
  ChevronRight, 
  Info, 
  ChevronLeft,
  ArrowLeft,
  PawPrint,
  Stethoscope as ServiceIcon,
  Calendar as DateIcon,
  MessageSquare,
  ChevronDown 
} from "lucide-react";

import { getToken } from "@/app/apiSlice";
import {
  useCreateMyAppointmentMutation,
  useGetAppointmentCategoriesQuery,
} from "@/features/appointments/appointmentsApiSlice";
import { useGetPetTypesQuery } from "@/features/petTypes/petTypesApiSlice";
import { useGetPetBreedsQuery } from "@/features/petBreeds/petBreedsApiSlice";

// ✅ UI Components (Shadcn)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const sliderImages = [
  {
    label: "Professional Medical Care",
    description: "Our clinic is equipped with the latest technology for your pet's safety.",
    imgPath: "/vet.jpg",
  },
  {
    label: "Expert Veterinarians",
    description: "A team of specialists dedicated to providing compassionate treatment.",
    imgPath: "/VET2.PNG",
  },
  {
    label: "Emergency Services",
    description: "We are here for you and your pet whenever you need urgent care.",
    imgPath: "/DOG.PNG",
  },
];

const headerPets = [
  "/cat.jpg",
  "/bird.jpg",
  "/h3-cat-pet-container.jpg",
];

export default function MedicalCarePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = getToken();

  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = sliderImages.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % maxSteps);
    }, 5000);
    return () => clearInterval(timer);
  }, [maxSteps]);

  const { data: catsRes, isLoading: loadingCats } = useGetAppointmentCategoriesQuery();
  const { data: typesRes } = useGetPetTypesQuery();
  const { data: breedsRes } = useGetPetBreedsQuery();

  const categories = useMemo(() => {
    const raw = Array.isArray(catsRes?.data) ? catsRes.data : [];
    return raw.filter((c) => c?.is_active !== false);
  }, [catsRes]);

  const petTypes = useMemo(() => (Array.isArray(typesRes?.data) ? typesRes.data : []), [typesRes]);
  const petBreeds = useMemo(() => (Array.isArray(breedsRes?.data) ? breedsRes.data : []), [breedsRes]);

  const [createAppointment, { isLoading: isCreating }] = useCreateMyAppointmentMutation();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authFrom, setAuthFrom] = useState("");

  const [form, setForm] = useState({
    pet_type_id: "",
    pet_breed_id: "",  // breed is now optional
    appointment_category_id: "",
    appointment_date: "",
    notes: "",
  });

  const breedsForType = useMemo(() => {
    const tid = Number(form.pet_type_id || 0);
    return tid ? petBreeds.filter((b) => Number(b?.pet_type?.id) === tid) : [];
  }, [petBreeds, form.pet_type_id]);

  const openBooking = (categoryId = "") => {
    if (!token) {
      setAuthFrom(location?.pathname + (location?.search || ""));
      setAuthOpen(true);
      return;
    }
    if (categoryId) {
      setForm(prev => ({ ...prev, appointment_category_id: categoryId }));
    }
    setBookingOpen(true);
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    try {
      await createAppointment({
        ...form,
        pet_type_id: Number(form.pet_type_id),
        pet_breed_id: form.pet_breed_id ? Number(form.pet_breed_id) : null,  // Send breed only if it's selected
        appointment_category_id: Number(form.appointment_category_id),
      }).unwrap();
      toast.success("Appointment booked successfully!");
      setBookingOpen(false);
      navigate("/my-appointments", { replace: true });
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create appointment.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f6f5] text-slate-900 font-sans selection:bg-[#387365]/20">
      <Navbar />

      {/* pb-16 تعطي مسافة فاصلة متوازنة (64px) بين آخر محتوى والفوتر */}
      <main className="pt-6 pb-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="relative bg-[#387365] p-6 md:p-8 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between overflow-hidden min-h-[140px]">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <Stethoscope className="w-64 h-64 text-white" />
            </div>

            <div className="z-10">
              <button 
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-[#a8d5cb] font-semibold hover:text-white transition-colors w-fit group text-xs mb-3"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Home</span>
              </button>
              <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight">Medical Care</h1>
              <p className="text-[#cce3de] text-xs md:text-sm mt-1 max-w-md opacity-90">
                Professional healthcare services for your beloved pets.
              </p>
            </div>

            <div className="hidden md:flex -space-x-4 z-10">
              {headerPets.map((url, i) => (
                <img 
                  key={i} 
                  src={url} 
                  className="w-16 h-16 rounded-full border-4 border-[#387365] shadow-xl object-cover" 
                  alt="pet" 
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-stretch">
            <div className="lg:w-1/3 flex flex-col bg-white border border-stone-200 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                 <img 
                    src="/vet.jpg" 
                    alt="Service Pet" 
                    className="w-12 h-12 rounded-xl object-cover shadow-sm"
                 />
                 <div>
                    <h2 className="text-lg font-bold text-[#6d4c41]">Specialized Services</h2>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Expertise you can trust</p>
                 </div>
              </div>

              <div className="space-y-3 flex-grow overflow-y-auto max-h-[320px] pr-2 custom-scrollbar mb-6 px-1">
                {loadingCats ? (
                  [1, 2, 3].map(i => <div key={i} className="h-16 bg-stone-50 animate-pulse rounded-xl" />)
                ) : (
                  categories.map((c) => (
                    <div 
                      key={c.id} 
                      onClick={() => openBooking(c.id)}
                      className="group p-4 bg-white border border-stone-200 rounded-xl hover:bg-[#387365] hover:border-[#387365] transition-all duration-300 cursor-pointer flex items-center justify-between shadow-sm active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center shadow-sm group-hover:bg-white/20">
                            <AddCircleOutlineIcon className="!w-5 !h-5 text-[#6d4c41] group-hover:text-white transition-colors" />
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="font-bold text-[#6d4c41] group-hover:text-white transition-colors text-sm truncate whitespace-nowrap">
                            {c.name}
                          </h3>
                        </div>
                      </div>
                      <ChevronRight className="flex-shrink-0 w-4 h-4 text-stone-300 group-hover:text-white" />
                    </div>
                  ))
                )}
              </div>

              <Button 
                onClick={() => openBooking()}
                className="w-full h-14 bg-[#387365] hover:bg-[#2d5c51] text-white rounded-xl font-bold text-base shadow-lg shadow-[#387365]/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span className="text-white">Book an Appointment</span>
                <CalendarDays className="w-5 h-5 text-white" />
              </Button>
            </div>

            <div className="lg:w-2/3 relative rounded-2xl overflow-hidden shadow-xl bg-stone-200 group h-[400px] md:h-[500px]">
              <div className="absolute inset-0">
                {sliderImages.map((step, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${index === activeStep ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
                  >
                    <img src={step.imgPath} alt={step.label} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8 md:p-12 text-white">
                      <h3 className="font-bold text-2xl md:text-3xl mb-2 tracking-tight">{step.label}</h3>
                      <p className="text-stone-200 text-sm md:text-base max-w-md opacity-90 leading-relaxed font-medium">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                <MobileStepper
                  variant="dots"
                  steps={maxSteps}
                  position="static"
                  activeStep={activeStep}
                  sx={{ 
                    bgcolor: 'transparent',
                    '& .MuiMobileStepper-dot': { bgcolor: 'rgba(255,255,255,0.3)', width: 8, height: 8 },
                    '& .MuiMobileStepper-dotActive': { bgcolor: '#fff', width: 24, borderRadius: '4px' }
                  }}
                  nextButton={null}
                  backButton={null}
                />
              </div>

              <button 
                onClick={() => setActiveStep((p) => (p - 1 + maxSteps) % maxSteps)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setActiveStep((p) => (p + 1) % maxSteps)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, label: "Expert Vets", sub: "Fully Certified team" },
              { icon: HeartPulse, label: "Care 24/7", sub: "Emergency Support" },
              { icon: Info, label: "Live Updates", sub: "Track your pet's trip" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-white p-5 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all group">
                <div className="bg-stone-50 p-3 rounded-lg group-hover:bg-[#387365] transition-all duration-300">
                  <item.icon className="text-[#387365] group-hover:text-white w-5 h-5 transition-colors" />
                </div>
                <div>
                  <h4 className="font-bold text-[#6d4c41] text-sm md:text-base">{item.label}</h4>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- Dialogs --- */}
        <Dialog open={authOpen} onOpenChange={setAuthOpen}>
          <DialogContent className="sm:max-w-[400px] rounded-3xl bg-white p-6 border-none shadow-2xl">
            <DialogHeader className="items-center text-center">
              <div className="w-16 h-16 bg-[#387365]/10 rounded-full flex items-center justify-center mb-2">
                <ShieldCheck className="w-8 h-8 text-[#387365]" />
              </div>
              <DialogTitle className="text-2xl font-bold text-[#6d4c41]">Login Required</DialogTitle>
              <DialogDescription className="text-stone-500 font-medium">
                Please login to your account to schedule a medical appointment for your pet.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={() => setAuthOpen(false)} className="w-full sm:flex-1 rounded-2xl font-bold h-12 border-stone-200 hover:bg-stone-50">Cancel</Button>
              <Button 
                onClick={() => navigate("/login", { state: { from: authFrom }, replace: true })}
                className="w-full sm:flex-1 bg-[#387365] hover:bg-[#2d5c51] text-white rounded-2xl font-bold h-12 shadow-lg shadow-[#387365]/20 active:scale-95 transition-all"
              >
                Login Now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
          <DialogContent className="w-[95vw] sm:max-w-[480px] rounded-2xl sm:rounded-3xl p-0 bg-white overflow-hidden border-none shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="bg-[#387365] p-4 sm:p-5 text-white flex items-center gap-3 sticky top-0 z-10">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md flex-shrink-0">
                <CalendarDays className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold">New Appointment</h3>
                <p className="text-[#a8d5cb] text-[10px] font-medium opacity-90">Quickly schedule your visit</p>
              </div>
            </div>

            <form onSubmit={submitBooking} className="p-4 sm:p-6 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-stone-400 flex items-center gap-2 px-1">
                    <PawPrint className="w-3 h-3" /> Pet Type
                  </label>
                  <div className="relative group">
                    <select 
                      className="w-full h-10 bg-stone-50 border border-stone-100 rounded-xl px-3 text-[11px] font-semibold outline-none focus:ring-2 focus:ring-[#387365]/10 focus:border-[#387365] transition-all appearance-none cursor-pointer"
                      value={form.pet_type_id}
                      onChange={(e) => setForm({...form, pet_type_id: e.target.value})}
                      required
                    >
                      <option value="">Select Type</option>
                      {petTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-stone-400 flex items-center gap-2 px-1">
                    <Info className="w-3 h-3" /> Breed (Optional)
                  </label>
                  <div className="relative group">
                    <select 
                      className="w-full h-10 bg-stone-50 border border-stone-100 rounded-xl px-3 text-[11px] font-semibold outline-none focus:ring-2 focus:ring-[#387365]/10 focus:border-[#387365] disabled:opacity-50 transition-all appearance-none cursor-pointer"
                      value={form.pet_breed_id}
                      onChange={(e) => setForm({...form, pet_breed_id: e.target.value})}
                      disabled={!form.pet_type_id}
                    >
                      <option value="">Select Breed</option>
                      {breedsForType.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-stone-400 flex items-center gap-2 px-1">
                    <ServiceIcon className="w-3 h-3" /> Service
                  </label>
                  <div className="relative group">
                    <select 
                      className="w-full h-10 bg-stone-50 border border-stone-100 rounded-xl px-3 text-[11px] font-semibold outline-none focus:ring-2 focus:ring-[#387365]/10 focus:border-[#387365] transition-all appearance-none cursor-pointer"
                      value={form.appointment_category_id}
                      onChange={(e) => setForm({...form, appointment_category_id: e.target.value})}
                      required
                    >
                      <option value="">Select Service</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-stone-400 flex items-center gap-2 px-1">
                    <DateIcon className="w-3 h-3" /> Date
                  </label>
                  <input 
                    type="date"
                    className="w-full h-10 bg-stone-50 border border-stone-100 rounded-xl px-3 text-[11px] font-semibold outline-none focus:ring-2 focus:ring-[#387365]/10 focus:border-[#387365] transition-all cursor-pointer"
                    value={form.appointment_date}
                    onChange={(e) => setForm({...form, appointment_date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-stone-400 flex items-center gap-2 px-1">
                  <MessageSquare className="w-3 h-3" /> Notes
                </label>
                <textarea 
                  className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl text-[11px] font-semibold outline-none focus:ring-2 focus:ring-[#387365]/10 focus:border-[#387365] resize-none transition-all"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({...form, notes: e.target.value})}
                  placeholder="Notes..."
                />
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row gap-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setBookingOpen(false)} 
                  className="w-full sm:flex-1 rounded-xl font-bold h-10 text-stone-500 hover:bg-stone-50 transition-colors text-xs"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isCreating}
                  className="w-full sm:flex-1 bg-[#387365] hover:bg-[#2d5c51] text-white rounded-xl font-bold h-10 shadow-md shadow-[#387365]/10 active:scale-[0.97] transition-all disabled:opacity-70 text-xs"
                >
                  {isCreating ? "Booking..." : "Confirm"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
