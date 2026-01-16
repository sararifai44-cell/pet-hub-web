import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import { toast } from "sonner";
import { 
  Calendar, 
  Plus, 
  Search, 
  Loader2, 
  X, 
  Eye,
  ArrowLeft,
  Clock
} from "lucide-react";

import {
  useGetMyAppointmentsQuery,
  useCancelMyAppointmentMutation,
} from "@/features/appointments/appointmentsApiSlice";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 12;

export default function MyAppointmentsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: "", status: "" });

  const { data: res, isLoading, isFetching, refetch } = useGetMyAppointmentsQuery(
    { page, per_page: PAGE_SIZE },
    { refetchOnMountOrArgChange: true }
  );

  const [cancelAppointment, { isLoading: isCancelling }] = useCancelMyAppointmentMutation();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const appointments = useMemo(() => res?.data || [], [res]);

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const s = filters.search.toLowerCase();
      if (filters.status && a.status !== filters.status) return false;
      return !s || a.category?.name?.toLowerCase().includes(s) || a.id.toString().includes(s);
    });
  }, [appointments, filters]);

  const confirmCancel = async () => {
    try {
      await cancelAppointment(selectedId).unwrap();
      toast.success("Appointment cancelled");
      setCancelDialogOpen(false);
      refetch();
    } catch {
      toast.error("Failed to cancel");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-700 font-sans">
      <Navbar />

      {/* Header Section - Raised and Optimized */}
      <div className="pt-10 -mt-4 relative z-10"> 
        <div className="bg-[#387365] text-white py-8 px-4 shadow-md border-b border-white/5">
          <div className="max-w-6xl mx-auto flex flex-row justify-between items-center">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate("/medical-care")}
                className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-lg md:text-xl font-bold leading-none tracking-tight">My Appointments</h1>
                <p className="text-[10px] text-stone-200 opacity-70 mt-1.5 uppercase tracking-widest font-medium">Healthcare Schedule</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate("/medical-care")}
              className="bg-white text-[#387365] hover:bg-stone-50 rounded-md h-9 px-4 text-[11px] font-bold shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> New Appointment
            </Button>
          </div>
        </div>
      </div>

      <main className="pb-10 px-4 max-w-6xl mx-auto mt-8">
        
        {/* Filter Bar */}
        <div className="flex flex-row gap-2 mb-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-[#387365] transition-colors" />
            <input
              placeholder="Search appointments..."
              value={filters.search}
              onChange={(e) => setFilters(p => ({ ...p, search: e.target.value }))}
              className="w-full h-9 bg-white border border-stone-200 rounded-md pl-9 pr-4 text-[11px] focus:outline-none focus:border-[#387365]"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))}
            className="h-9 bg-white border border-stone-200 rounded-md px-3 text-[11px] focus:outline-none cursor-pointer min-w-[100px]"
          >
            <option value="">Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Appointments Grid with Brown Border & Zoom Effect */}
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-[#387365]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((a) => (
              <div 
                key={a.id}
                className="bg-[#fffde7] border-2 border-[#8d6e63]/20 rounded-xl p-4 transition-all duration-300 transform hover:scale-[1.03] hover:shadow-xl hover:border-[#8d6e63]/50 group relative flex flex-col justify-between min-h-[155px]"
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase border shadow-sm
                    ${a.status === 'pending' ? 'bg-amber-100/50 text-amber-700 border-amber-200' : 
                      a.status === 'approved' ? 'bg-emerald-100/50 text-emerald-700 border-emerald-200' : 
                      'bg-slate-100/50 text-slate-600 border-slate-200'}`}>
                    {a.status}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    {/* Darker Icon Box for Contrast */}
                    <div className="w-8 h-8 rounded-lg bg-[#37474f] flex items-center justify-center text-[#fffde7] transition-transform group-hover:-rotate-3">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <h3 className="text-[13px] font-bold text-[#37474f] truncate pr-14 leading-tight">
                      {a?.category?.name}
                    </h3>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center text-[11px] font-semibold text-[#37474f]/70">
                      <Clock className="w-3.5 h-3.5 mr-2 opacity-60" />
                      {a?.appointment_date}
                    </div>
                    <div className="text-[10px] font-bold text-[#fffde7] bg-[#8d6e63] w-fit px-2 py-0.5 rounded-md shadow-sm">
                      {a?.pet_type?.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#37474f]/10">
                   <button 
                    onClick={() => navigate(`/my-appointments/${a.id}`)}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-[#37474f] hover:text-[#8d6e63] transition-all"
                  >
                    <Eye className="w-4 h-4 text-[#37474f]" /> Details
                  </button>

                  {(a.status === 'pending' || a.status === 'approved') && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedId(a.id); setCancelDialogOpen(true); }}
                      className="p-1.5 text-[#37474f]/30 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {res?.meta?.last_page > 1 && (
          <div className="flex justify-center mt-12 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="text-[11px] h-8 border-stone-200"
            >
              Prev
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === res?.meta?.last_page} 
              onClick={() => setPage(p => p + 1)}
              className="text-[11px] h-8 border-stone-200"
            >
              Next
            </Button>
          </div>
        )}

        {/* Cancel Confirmation Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent className="max-w-[320px] rounded-lg p-6 bg-white border-none shadow-2xl overflow-hidden">
            <DialogHeader className="text-left">
              <DialogTitle className="text-base font-bold text-[#37474f]">Confirm Cancellation</DialogTitle>
              <DialogDescription className="text-[11px] pt-2 text-slate-500 font-medium leading-relaxed">
                Are you sure you want to cancel appointment <span className="font-bold text-slate-800">#{selectedId}</span>?
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 mt-6">
              <Button 
                variant="ghost" 
                className="flex-1 rounded-md text-[11px] h-9 font-bold" 
                onClick={() => setCancelDialogOpen(false)}
              >
                Go Back
              </Button>
              <Button 
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-[11px] h-9 font-bold transition-all shadow-sm" 
                onClick={confirmCancel} 
                disabled={isCancelling}
              >
                {isCancelling ? "..." : "Cancel"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}