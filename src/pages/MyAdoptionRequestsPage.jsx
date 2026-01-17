import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Calendar, 
  ArrowLeft, 
  HeartHandshake, 
  ChevronDown, 
  XCircle, 
  Trash2 
} from "lucide-react";
import { 
  useGetMyAdoptionApplicationsQuery,
  useCancelAdoptionApplicationMutation 
} from "@/features/adoptionApplications/adoptionApplicationsApiSlice";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
} from "@/components/ui/dialog";

const headerPets = ["/cat.jpg", "/bird.jpg", "/h3-cat-pet-container.jpg"];

function formatDate(dt) {
  if (!dt) return "";
  try {
    const d = new Date(dt);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
  } catch { return ""; }
}

const RAW_API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/";
const SERVER_ORIGIN = RAW_API_URL.replace(/\/api\/?$/i, "").replace(/\/+$/, "") || "http://127.0.0.1:8000";

const normalizeUrl = (u) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `${SERVER_ORIGIN}${u.startsWith("/") ? "" : "/"}${u}`;
};

const getPetImage = (app) => {
  const img = app?.pet?.cover_image;
  return img ? normalizeUrl(img) : "/placeholder.png";
};

function statusBadgeClass(status = "") {
  const s = String(status).toLowerCase();
  if (s.includes("approved")) return "bg-emerald-100 text-emerald-800 border-emerald-300";
  if (s.includes("rejected")) return "bg-red-100 text-red-800 border-red-300";
  if (s.includes("cancel")) return "bg-slate-100 text-slate-600 border-slate-300";
  return "bg-orange-100 text-orange-800 border-orange-300";
}

export default function MyAdoptionRequestsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const { data, isLoading } = useGetMyAdoptionApplicationsQuery();
  const [cancelApp, { isLoading: isCancelling }] = useCancelAdoptionApplicationMutation();

  const apps = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return apps.filter((a) => {
      const status = String(a.status || "").toLowerCase();
      const petName = String(a?.pet?.name || "").toLowerCase();
      const matchesSearch = !query || petName.includes(query) || String(a.id).includes(query);
      const matchesFilter = filter === "all" ? true : status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [apps, q, filter]);

  const openCancelDialog = (e, id) => {
    e.preventDefault(); e.stopPropagation();
    setSelectedRequestId(id);
    setConfirmCancelOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedRequestId) return;
    try {
      await cancelApp(selectedRequestId).unwrap();
      setConfirmCancelOpen(false);
      setSelectedRequestId(null);
    } catch (err) { console.error("Failed to cancel:", err); }
  };

  if (isLoading) return <div className="min-h-screen bg-[#FDFCFB]"><Navbar /><div className="pt-32 text-center text-[#387365] font-medium animate-pulse">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2F2A24]">
      <Navbar />
      <main className="pt-8 pb-12 px-4 md:px-6">
        <div className="mx-auto max-w-6xl">
          <header className="relative bg-[#387365] p-6 md:p-10 rounded-xl shadow-md flex flex-col md:flex-row md:items-center justify-between overflow-hidden mb-8 border-b-4 border-[#2d5c51]">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none"><HeartHandshake className="w-64 h-64 text-white" /></div>
            <div className="z-10">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#a8d5cb] font-semibold hover:text-white transition-colors w-fit group text-xs mb-3">
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                <span>Back</span>
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Adoption Requests</h1>
              <p className="text-[#a8d5cb] text-sm mt-1 font-medium italic">Manage and track your applications</p>
            </div>
            <div className="hidden lg:flex -space-x-3 z-10">
              {headerPets.map((url, i) => (<img key={i} src={url} className="w-12 h-12 rounded-full border-2 border-white shadow-xl object-cover" alt="pet" />))}
            </div>
          </header>

          <div className="mb-6 flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute top-1/2 -translate-y-1/2 text-slate-400 left-3" size={16} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by pet name..." className="h-10 w-full rounded-lg border-2 border-[#D1C2B4] bg-white text-sm font-medium outline-none focus:border-[#387365] transition-all pl-10 pr-4" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="h-10 min-w-[150px] rounded-lg border border-[#D1C2B4] bg-white px-3 text-[12px] font-semibold flex items-center justify-between hover:bg-[#FBF7F1] outline-none">
                <span className="truncate">{filter === "all" ? "All Status" : filter.toUpperCase()}</span>
                <ChevronDown size={14} className="opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="left" className="bg-white border-2 border-[#D1C2B4] rounded-lg shadow-xl">
                {["all", "pending", "approved", "rejected", "canceled"].map((opt) => (
                  <DropdownMenuItem key={opt} onClick={() => setFilter(opt)} className="text-sm font-medium cursor-pointer hover:bg-slate-50 px-3 py-2 uppercase">{opt}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {!filtered.length ? (
            <div className="rounded-xl border-2 border-dashed border-[#D1C2B4] py-20 text-center"><p className="text-slate-400 italic">No requests found.</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((a) => (
                <Card key={a.id} className="rounded-xl bg-[#F2EDE7] shadow-sm border-2 border-[#D1C2B4] overflow-hidden group">
                  <CardContent className="p-5">
                    <div className="flex gap-5">
                      <img src={getPetImage(a)} className="h-24 w-24 rounded-xl object-cover bg-white border-2 border-[#D1C2B4]/30 shrink-0" onError={(e) => (e.currentTarget.src = "/placeholder.png")} />
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <h3 className="font-bold text-[#2F2A24] truncate text-lg">{a?.pet?.name || `#${a.pet_id}`}</h3>
                            <div className="flex items-center gap-1.5 text-xs text-[#5C554E] font-bold"><Calendar size={13} className="text-[#387365]" /> {formatDate(a.created_at)}</div>
                          </div>
                          <Badge className={`rounded-full border-2 px-3 py-1 text-[10px] font-bold uppercase ${statusBadgeClass(a.status)}`}>{a.status}</Badge>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                          {String(a.status).toLowerCase() === "pending" && (
                            <Button 
                              size="sm" 
                              onClick={(e) => openCancelDialog(e, a.id)} 
                              className="h-9 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-sm"
                            >
                              <XCircle size={14} className="mr-1.5" /> Cancel
                            </Button>
                          )}
                          <Button asChild size="sm" className="h-9 px-5 rounded-lg bg-[#387365] hover:bg-[#2d5c51] text-white font-bold text-xs shadow-md">
                            <Link to={`/adoption-requests/${a.id}`}>Details</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <DialogOverlay className="bg-black/40 backdrop-blur-[2px]" />
        <DialogContent className="z-[200] rounded-xl max-w-sm p-6 border border-slate-300 shadow-2xl bg-white text-center outline-none">
          <div className="mx-auto h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-lg font-bold mb-2 text-[#2F2A24]">Confirm Cancellation</DialogTitle>
          <DialogDescription className="text-slate-500 text-sm mb-6">Are you sure you want to cancel this request? This action cannot be undone.</DialogDescription>
          <div className="flex flex-col gap-2">
            <Button onClick={handleConfirmCancel} disabled={isCancelling} className="w-full h-11 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold">{isCancelling ? "Processing..." : "Confirm & Cancel"}</Button>
            <Button variant="ghost" onClick={() => setConfirmCancelOpen(false)} className="w-full h-10 text-slate-400 font-medium">Go Back</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}