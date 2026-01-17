import React, { useEffect, useState, useCallback } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MessageSquare,
  HeartHandshake,
  UserRound,
  CheckCircle2,
  XCircle,
  Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  useGetMyAdoptionApplicationByIdQuery,
  useCancelAdoptionApplicationMutation 
} from "@/features/adoptionApplications/adoptionApplicationsApiSlice";
import { getToken } from "@/app/apiSlice";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function formatDate(dt, withTime = false) {
  if (!dt) return "";
  try {
    const d = new Date(dt);
    return d.toLocaleString("en-US", withTime ? { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" } : { year: "numeric", month: "short", day: "2-digit" });
  } catch { return ""; }
}

function calcAgeYears(dateOfBirth) {
  if (!dateOfBirth) return "Not specified";
  try {
    const dob = new Date(dateOfBirth);
    const now = new Date();
    let years = now.getFullYear() - dob.getFullYear();
    if (now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())) years--;
    return `${Math.max(0, years)} years`;
  } catch { return "Not specified"; }
}

export default function AdoptionRequestDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = getToken();

  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const { data: application, isLoading } = useGetMyAdoptionApplicationByIdQuery(id, { skip: !id || !token });
  const [cancelRequest, { isLoading: isCancelling }] = useCancelAdoptionApplicationMutation();

  useEffect(() => { if (!token) setAuthDialogOpen(true); }, [token]);

  const appData = application?.data || application;
  const pet = appData?.pet || {};
  const status = String(appData?.status || "").toLowerCase();

  const handleCancelAction = async () => {
    try {
      await cancelRequest(id).unwrap();
      setCancelDialogOpen(false);
    } catch (err) { console.error("Cancel failed", err); }
  };

  const statusMeta = (() => {
    if (status === "approved") return { label: "Approved", short: "Your request has been approved.", icon: <CheckCircle2 size={18} className="text-emerald-600" />, pill: "bg-emerald-100 text-emerald-800 border-emerald-300", panel: "border-emerald-200 bg-emerald-50/60" };
    if (status === "rejected") return { label: "Rejected", short: "Your request has been rejected.", icon: <XCircle size={18} className="text-red-600" />, pill: "bg-red-100 text-red-800 border-red-300", panel: "border-red-200 bg-red-50/60" };
    if (status === "canceled" || status === "cancelled") return { label: "Canceled", short: "You have canceled this request.", icon: <Trash2 size={18} className="text-slate-600" />, pill: "bg-slate-100 text-slate-600 border-slate-300", panel: "border-slate-200 bg-slate-50/60" };
    return { label: "Pending", short: "Your request is being reviewed.", icon: <Clock size={18} className="text-amber-600" />, pill: "bg-orange-100 text-orange-800 border-orange-300", panel: "border-amber-200 bg-amber-50/60" };
  })();

  if (isLoading) return <div className="min-h-screen bg-[#FDFCFB]"><Navbar /><div className="flex items-center justify-center h-[60vh] animate-pulse text-[#387365]">Loading details...</div></div>;

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />
      <main className="pt-8 pb-12 px-4 md:px-6">
        <div className="mx-auto max-w-6xl">
          <header className="relative bg-[#387365] p-6 md:p-10 rounded-xl shadow-md flex flex-col justify-between overflow-hidden mb-8 border-b-4 border-[#2d5c51]">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none"><HeartHandshake className="w-64 h-64 text-white" /></div>
            <div className="z-10">
              <button onClick={() => navigate("/adoption-requests")} className="flex items-center gap-2 text-white/90 font-bold hover:text-white transition-colors text-xs mb-3 rounded-lg border border-white/15 bg-white/10 px-3 py-2">
                <ArrowLeft className="w-3.5 h-3.5" /> <span>Back to Requests</span>
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Request Details</h1>
              <p className="text-white/80 text-sm mt-1 font-medium italic">#{id} • {formatDate(appData?.created_at, true)}</p>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="rounded-2xl border-2 border-[#D1C2B4] bg-white shadow-sm overflow-hidden">
                <img src={pet?.cover_image || "/placeholder.png"} className="aspect-square w-full object-cover bg-[#FBF7F1]" />
                <div className="p-5">
                  <h3 className="text-lg font-black text-[#2F2A24]">{pet?.name || "Pet"}</h3>
                  <div className="mt-3 space-y-2 text-xs font-bold text-[#2F2A24]/75">
                    <div className="flex items-center gap-2"><UserRound size={14} className="text-[#387365]" /> Gender: {pet?.gender}</div>
                    <div className="flex items-center gap-2"><Calendar size={14} className="text-[#387365]" /> Age: {calcAgeYears(pet?.date_of_birth)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border-2 border-[#D1C2B4] bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2"><Clock className="text-[#387365]" size={20} /><h2 className="font-extrabold text-[#2F2A24]">Status Tracking</h2></div>
                  <Badge className={`rounded-full border-2 px-4 py-1.5 text-[11px] font-extrabold uppercase ${statusMeta.pill}`}>{statusMeta.label}</Badge>
                </div>
                
                <div className={`rounded-xl border-2 p-4 ${statusMeta.panel} mb-6 flex items-start gap-3`}>
                  {statusMeta.icon}
                  <div><p className="text-[11px] font-extrabold uppercase tracking-widest text-[#2F2A24]/50">Notification</p><p className="text-sm font-bold">{statusMeta.short}</p></div>
                </div>

                {status === "pending" && (
                  <Button onClick={() => setCancelDialogOpen(true)} className="w-full h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold gap-2 shadow-md transition-all">
                    <XCircle size={18} /> Cancel Adoption Request
                  </Button>
                )}
              </div>

              <div className="rounded-2xl border-2 border-[#D1C2B4] bg-white p-6">
                <div className="flex items-center gap-2 mb-4"><MessageSquare className="text-[#387365]" size={20} /><h2 className="font-extrabold text-[#2F2A24]">Your Motivation</h2></div>
                <p className="text-sm bg-[#FBF7F1] p-4 rounded-xl border border-[#D1C2B4]/60 whitespace-pre-wrap">{appData?.motivation || "No motivation provided."}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Dialog (Same style as homepage) */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogOverlay className="bg-black/40 backdrop-blur-[2px]" />
        <DialogContent className="z-[200] rounded-xl max-w-sm p-6 border border-slate-300 shadow-2xl bg-white text-center outline-none">
          <div className="mx-auto h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-lg font-bold mb-2 text-[#2F2A24]">Confirm Cancellation</DialogTitle>
          <DialogDescription className="text-slate-500 text-sm mb-6">Are you sure you want to cancel this adoption request? This action cannot be undone.</DialogDescription>
          <div className="flex flex-col gap-2">
            <Button onClick={handleCancelAction} disabled={isCancelling} className="w-full h-11 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold">
              {isCancelling ? "Processing..." : "Confirm & Cancel"}
            </Button>
            <Button variant="ghost" onClick={() => setCancelDialogOpen(false)} className="w-full h-10 text-slate-400 font-medium">Go Back</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}