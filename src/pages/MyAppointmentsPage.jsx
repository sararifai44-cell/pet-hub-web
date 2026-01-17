import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Clock,
  ChevronDown,
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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PAGE_SIZE = 12;
const headerPets = ["/cat.jpg", "/bird.jpg", "/h3-cat-pet-container.jpg"];

function useIsArabic() {
  const [isAr, setIsAr] = useState(false);
  useEffect(() => {
    const lang = (navigator.language || "").toLowerCase();
    setIsAr(lang.startsWith("ar"));
  }, []);
  return isAr;
}

export default function MyAppointmentsPage() {
  const isAr = useIsArabic();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: "", status: "all" });

  const { data: res, isLoading, refetch } = useGetMyAppointmentsQuery(
    { page, per_page: PAGE_SIZE },
    { refetchOnMountOrArgChange: true }
  );

  const [cancelAppointment, { isLoading: isCancelling }] =
    useCancelMyAppointmentMutation();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const appointments = useMemo(() => res?.data || [], [res]);

  const filtered = useMemo(() => {
    const s = filters.search.trim().toLowerCase();

    return appointments.filter((a) => {
      const status = String(a.status || "").toLowerCase();
      const matchesStatus =
        filters.status === "all" ? true : status === filters.status;

      const matchesSearch =
        !s ||
        a.category?.name?.toLowerCase().includes(s) ||
        String(a.id).includes(s);

      return matchesStatus && matchesSearch;
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

  const statusOptions = [
    { id: "all", label: isAr ? "كل الحالات" : "All Status" },
    { id: "pending", label: isAr ? "قيد الانتظار" : "Pending" },
    { id: "approved", label: isAr ? "مقبول" : "Approved" },
    { id: "completed", label: isAr ? "مكتمل" : "Completed" },
  ];

  const currentStatusLabel =
    statusOptions.find((x) => x.id === filters.status)?.label ||
    (isAr ? "الحالة" : "Status");

  const triggerClass =
    "h-10 min-w-[160px] w-full md:w-auto rounded-lg border-2 border-[#D1C2B4] bg-white px-3 " +
    "text-[12px] font-semibold text-[#2F2A24] shadow-sm flex items-center justify-between " +
    "hover:bg-[#FBF7F1] focus:outline-none transition-all";

  return (
    <div
      className="min-h-screen bg-[#FDFCFB] text-[#2F2A24]"
      dir={isAr ? "rtl" : "ltr"}
    >
      <Navbar />

      <main className="pt-8 pb-12 px-4 md:px-6">
        <div className="mx-auto max-w-6xl">
          {/* ✅ Header (same theme as Adoption Requests) */}
          <header className="relative bg-[#387365] p-6 md:p-10 rounded-xl shadow-md flex flex-col md:flex-row md:items-center justify-between overflow-hidden mb-8 border-b-4 border-[#2d5c51]">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <Calendar className="w-64 h-64 text-white" />
            </div>

            <div className="z-10">
              <button
                onClick={() => navigate("/medical-care")}
                className="flex items-center gap-2 text-[#a8d5cb] font-semibold hover:text-white transition-colors w-fit group text-xs mb-3"
              >
                <ArrowLeft
                  className={`w-3.5 h-3.5 transition-transform ${
                    isAr
                      ? "rotate-180 group-hover:translate-x-1"
                      : "group-hover:-translate-x-1"
                  }`}
                />
                <span>{isAr ? "العودة للرعاية الطبية" : "Back to Medical Care"}</span>
              </button>

              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {isAr ? "مواعيدي" : "My Appointments"}
              </h1>
              <p className="text-[#a8d5cb] text-sm mt-1 font-medium">
                {appointments.length > 0
                  ? isAr
                    ? `تابعي وحكّمي بمواعيدك (${appointments.length})`
                    : `Manage and track your appointments (${appointments.length})`
                  : isAr
                  ? "لا توجد مواعيد بعد"
                  : "No appointments yet"}
              </p>
            </div>

            <div className="flex items-center gap-4 z-10 mt-4 md:mt-0">
              <Button
                onClick={() => navigate("/medical-care")}
                variant="outline"
                size="sm"
                className="h-10 rounded-lg border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white font-bold transition-all"
              >
                <Plus size={14} className={isAr ? "ml-2" : "mr-2"} />
                {isAr ? "موعد جديد" : "New Appointment"}
              </Button>

              <div className="hidden lg:flex -space-x-3">
                {headerPets.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-xl object-cover"
                    alt="pet"
                  />
                ))}
              </div>
            </div>
          </header>

          {/* ✅ Search + Filter (same style) */}
          <div className="mb-6 flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search
                className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                  isAr ? "right-3" : "left-3"
                }`}
                size={16}
              />
              <input
                value={filters.search}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, search: e.target.value }))
                }
                placeholder={
                  isAr ? "ابحثي بالخدمة أو رقم الموعد..." : "Search by service or ID..."
                }
                className={`h-10 w-full rounded-lg border-2 border-[#D1C2B4] bg-white text-sm font-medium text-[#2F2A24] shadow-sm outline-none focus:border-[#387365] focus:ring-2 focus:ring-[#387365]/10 transition-all ${
                  isAr ? "pr-10 pl-4" : "pl-10 pr-4"
                }`}
              />
            </div>

            <div className="w-full md:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger className={triggerClass}>
                  <span className="truncate">{currentStatusLabel}</span>
                  <ChevronDown size={14} className="opacity-50" />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align={isAr ? "right" : "left"}
                  className="rounded-lg border-2 border-[#D1C2B4] bg-white shadow-xl p-1 min-w-[160px]"
                >
                  {statusOptions.map((opt) => (
                    <DropdownMenuItem
                      key={opt.id}
                      onClick={() =>
                        setFilters((p) => ({ ...p, status: opt.id }))
                      }
                      className={`rounded-md text-sm font-medium text-[#2F2A24] cursor-pointer px-3 py-2 focus:bg-[#387365]/10 outline-none ${
                        filters.status === opt.id ? "bg-[#387365]/10" : ""
                      }`}
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* ✅ Content */}
          {isLoading ? (
            <div className="pt-24 text-center text-[#387365] font-medium animate-pulse">
              {isAr ? "جاري التحميل..." : "Loading..."}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-[#D1C2B4] bg-white/50 py-20 text-center">
              <Calendar className="mx-auto mb-3 h-12 w-12 text-slate-200" />
              <p className="text-sm text-slate-400 font-medium italic">
                {isAr
                  ? "لا يوجد مواعيد مطابقة للبحث."
                  : "No appointments found matching your criteria."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((a) => (
                <div
                  key={a.id}
                  className="
                    rounded-xl overflow-hidden
                    bg-[#fffde7]  /* ✅ keep yellow */
                    shadow-sm border-2 border-[#D1C2B4]
                    hover:border-[#387365] hover:shadow-md hover:-translate-y-1
                    transition-all duration-300 group
                    p-5
                  "
                >
                  {/* Status badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-[#2F2A24] truncate text-lg group-hover:text-[#387365] transition-colors">
                        {a?.category?.name || `#${a.id}`}
                      </h3>

                      <div className="mt-1 flex items-center gap-2 text-xs text-[#5C554E] font-bold">
                        <Clock size={13} className="text-[#387365]" />
                        <span>{a?.appointment_date}</span>
                      </div>

                      <div className="mt-2 inline-flex text-[10px] font-bold text-[#fffde7] bg-[#8d6e63] w-fit px-2 py-0.5 rounded-md shadow-sm">
                        {a?.pet_type?.name}
                      </div>
                    </div>

                    <span
                      className={`rounded-full border-2 px-3 py-1 text-[10px] font-bold uppercase shadow-sm
                        ${
                          a.status === "pending"
                            ? "bg-orange-100 text-orange-800 border-orange-300"
                            : a.status === "approved"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-slate-100 text-slate-700 border-slate-300"
                        }`}
                    >
                      {a.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex items-center justify-between">
                    {/* ✅ Details button same style as Adoption Requests */}
                    <Button
                      asChild
                      size="sm"
                      className="h-9 px-5 rounded-lg bg-[#387365] hover:bg-[#2d5c51] text-white font-bold text-xs shadow-md transition-all active:scale-95"
                    >
                      <Link to={`/my-appointments/${a.id}`}>
                        <Eye size={14} className={isAr ? "ml-2" : "mr-2"} />
                        {isAr ? "التفاصيل" : "View Details"}
                      </Link>
                    </Button>

                    {(a.status === "pending" || a.status === "approved") && (
                      <button
                        onClick={() => {
                          setSelectedId(a.id);
                          setCancelDialogOpen(true);
                        }}
                        className="p-2 rounded-md border border-transparent text-[#37474f]/40 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all"
                        aria-label="Cancel appointment"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {res?.meta?.last_page > 1 && (
            <div className="flex justify-center mt-12 gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="text-[11px] h-9 rounded-lg border-2 border-[#D1C2B4] bg-white hover:bg-[#FBF7F1] font-bold"
              >
                {isAr ? "السابق" : "Prev"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === res?.meta?.last_page}
                onClick={() => setPage((p) => p + 1)}
                className="text-[11px] h-9 rounded-lg border-2 border-[#D1C2B4] bg-white hover:bg-[#FBF7F1] font-bold"
              >
                {isAr ? "التالي" : "Next"}
              </Button>
            </div>
          )}

          {/* Cancel Confirmation Dialog */}
          <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
            <DialogContent className="max-w-[320px] rounded-lg p-6 bg-white border-none shadow-2xl overflow-hidden">
              <DialogHeader className="text-left">
                <DialogTitle className="text-base font-bold text-[#37474f]">
                  {isAr ? "تأكيد الإلغاء" : "Confirm Cancellation"}
                </DialogTitle>
                <DialogDescription className="text-[11px] pt-2 text-slate-500 font-medium leading-relaxed">
                  {isAr ? (
                    <>
                      هل أنتِ متأكدة من إلغاء الموعد{" "}
                      <span className="font-bold text-slate-800">
                        #{selectedId}
                      </span>
                      ؟
                    </>
                  ) : (
                    <>
                      Are you sure you want to cancel appointment{" "}
                      <span className="font-bold text-slate-800">
                        #{selectedId}
                      </span>
                      ?
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 mt-6">
                <Button
                  variant="ghost"
                  className="flex-1 rounded-md text-[11px] h-9 font-bold"
                  onClick={() => setCancelDialogOpen(false)}
                >
                  {isAr ? "رجوع" : "Go Back"}
                </Button>
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-[11px] h-9 font-bold transition-all shadow-sm"
                  onClick={async () => {
                    try {
                      await cancelAppointment(selectedId).unwrap();
                      toast.success(isAr ? "تم إلغاء الموعد" : "Appointment cancelled");
                      setCancelDialogOpen(false);
                      refetch();
                    } catch {
                      toast.error(isAr ? "فشل الإلغاء" : "Failed to cancel");
                    }
                  }}
                  disabled={isCancelling}
                >
                  {isCancelling ? "..." : isAr ? "إلغاء" : "Cancel"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
