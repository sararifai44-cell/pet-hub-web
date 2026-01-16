// src/pages/MyAppointmentDetailsPage.jsx
import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  CalendarDays,
  XCircle,
  RefreshCcw,
} from "lucide-react";

import {
  useGetMyAppointmentByIdQuery,
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

const pretty = (v) => String(v ?? "-").replaceAll("_", " ");
const normalize = (v) => String(v ?? "").trim().toLowerCase();

function badgeClass(status) {
  const s = normalize(status);
  if (s === "pending") return "bg-amber-50 text-amber-700 border-amber-200";
  if (s === "approved") return "bg-sky-50 text-sky-700 border-sky-200";
  if (s === "completed")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s === "rejected") return "bg-red-50 text-red-700 border-red-200";
  if (s === "cancelled") return "bg-slate-100 text-slate-700 border-slate-200";
  if (s === "missed") return "bg-purple-50 text-purple-700 border-purple-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

function canCancel(status) {
  const s = normalize(status);
  return s === "pending" || s === "approved";
}

function Row({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className="text-slate-900 font-semibold text-sm break-words">
        {value}
      </span>
    </div>
  );
}

export default function MyAppointmentDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading, isError, isFetching, refetch } =
    useGetMyAppointmentByIdQuery(id, {
      refetchOnMountOrArgChange: true,
    });

  const [cancelAppointment, { isLoading: isCancelling }] =
    useCancelMyAppointmentMutation();

  const a = useMemo(() => data?.data ?? null, [data]);

  // ✅ Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);

  const openCancelDialog = () => {
    if (!a?.id) return;

    if (!canCancel(a.status)) {
      toast.info("This appointment can’t be cancelled in its current status.");
      return;
    }

    setConfirmOpen(true);
  };

  const closeCancelDialog = () => {
    if (isCancelling) return;
    setConfirmOpen(false);
  };

  const confirmCancel = async () => {
    if (!a?.id) return;

    try {
      await cancelAppointment(a.id).unwrap();
      toast.success("Appointment cancelled.");
      setConfirmOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
      const msg =
        err?.data?.message ||
        (err?.data?.errors ? Object.values(err.data.errors)?.[0]?.[0] : null) ||
        "Cancel failed.";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-6">
          {/* Top actions */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => navigate(-1)}
              className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60 inline-flex items-center gap-2"
            >
              {isFetching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCcw className="w-4 h-4" />
                  Refresh
                </>
              )}
            </button>
          </div>

          {/* Loading / Error */}
          {isLoading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="text-slate-600 inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading appointment...
              </div>
            </div>
          ) : isError || !a ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="text-red-600 font-semibold">
                Failed to load appointment.
              </div>
              <button
                onClick={() => refetch()}
                className="mt-4 h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              {/* Details card */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                      <CalendarDays className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-900">
                        Appointment #{a.id}
                      </div>
                      <div className="text-sm text-slate-500">
                        Track your appointment status.
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center px-3 py-1 text-xs rounded-full border ${badgeClass(
                      a.status
                    )}`}
                  >
                    {pretty(a.status)}
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <Row label="Pet Type" value={a?.pet_type?.name ?? "-"} />
                  <Row label="Breed" value={a?.pet_breed?.name ?? "-"} />
                  <Row label="Category" value={a?.category?.name ?? "-"} />
                  <Row
                    label="Appointment Date"
                    value={a?.appointment_date ?? "-"}
                  />
                  <Row label="Created At" value={a?.created_at ?? "-"} />
                  <Row label="Notes" value={a?.notes ?? "-"} />

                  {normalize(a.status) === "rejected" && a?.rejection_reason ? (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                      <div className="text-sm font-bold text-red-700">
                        Rejection Reason
                      </div>
                      <div className="text-sm text-red-700/90 mt-1">
                        {a.rejection_reason}
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Actions */}
                <div className="p-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
                  <button
                    onClick={openCancelDialog}
                    disabled={!canCancel(a.status) || isCancelling}
                    className={
                      "h-10 px-4 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 " +
                      (!canCancel(a.status) || isCancelling
                        ? "border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                        : "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100")
                    }
                    title={
                      canCancel(a.status)
                        ? "Cancel appointment"
                        : "You can only cancel Pending/Approved appointments"
                    }
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Cancel Appointment
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Small hint card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="text-sm text-slate-700 font-semibold">
                  Status meanings
                </div>
                <ul className="mt-2 text-sm text-slate-600 space-y-1 list-disc pl-5">
                  <li>
                    <b>Pending</b>: waiting for review.
                  </li>
                  <li>
                    <b>Approved</b>: confirmed by the center.
                  </li>
                  <li>
                    <b>Rejected</b>: not accepted (reason shown above).
                  </li>
                  <li>
                    <b>Completed</b>: appointment done.
                  </li>
                  <li>
                    <b>Missed</b>: you did not attend.
                  </li>
                  <li>
                    <b>Cancelled</b>: cancelled by you.
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </main>

      {/* ✅ Confirm cancel dialog (same style) */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="z-[200] rounded-[24px] max-w-sm p-6 overflow-hidden border border-slate-200 shadow-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Confirm cancel
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Are you sure you want to cancel appointment{" "}
              <span className="font-semibold text-slate-700">
                #{a?.id ?? id}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={closeCancelDialog}
              className="h-10 rounded-xl text-slate-500 hover:bg-slate-50"
              disabled={isCancelling}
            >
              Back
            </Button>
            <Button
              onClick={confirmCancel}
              disabled={isCancelling}
              className="h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              {isCancelling ? "Canceling..." : "Yes, cancel"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
