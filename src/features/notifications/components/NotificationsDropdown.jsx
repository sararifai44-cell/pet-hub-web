import React, { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, ShoppingCart, HeartHandshake, Hotel } from "lucide-react";
// استيراد الأيقونة المطلوبة
import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications';
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

import {
  useGetUnreadCountQuery,
  useLazyGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "@/features/notifications/notificationsApiSlice";

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const getTypeUI = (type) => {
  if (type === "order_placed") {
    return { Icon: ShoppingCart, accent: "text-amber-700", bgUnread: "bg-amber-50 border-amber-200" };
  }
  if (type?.includes("adoption")) {
    return { Icon: HeartHandshake, accent: "text-pink-700", bgUnread: "bg-pink-50 border-pink-200" };
  }
  if (type?.includes("boarding")) {
    return { Icon: Hotel, accent: "text-indigo-700", bgUnread: "bg-indigo-50 border-indigo-200" };
  }
  return { Icon: Bell, accent: "text-slate-700", bgUnread: "bg-slate-50 border-slate-200" };
};

export default function NotificationsDropdown({ customClass }) {
  const navigate = useNavigate();

  const { data: unreadRes } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 15000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const unreadCount = Number(unreadRes?.unread_count ?? 0);

  const [open, setOpen] = useState(false);

  const [triggerGetNotifs, notifsState] = useLazyGetNotificationsQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [lastPage, setLastPage] = useState(null);
  const [isLoadingNextPage, setIsLoadingNextPage] = useState(false);

  const hasMore = useMemo(() => {
    if (!lastPage) return true;
    return page < lastPage;
  }, [page, lastPage]);

  const mergeUniqueById = (prev, next) => {
    const seen = new Set(prev.map((x) => x.id));
    const merged = [...prev];
    for (const n of next) if (!seen.has(n.id)) merged.push(n);
    return merged;
  };

  const prependUniqueById = (prev, next) => {
    const seen = new Set(prev.map((x) => x.id));
    const newOnes = [];
    for (const n of next) if (!seen.has(n.id)) newOnes.push(n);
    return [...newOnes, ...prev];
  };

  const fetchPage = async (p) => {
    const res = await triggerGetNotifs({ page: p, per_page: 10 }, false).unwrap();
    const list = Array.isArray(res?.data) ? res.data : [];
    const lp = Number(res?.meta?.last_page ?? 1);
    setLastPage(lp);
    return { list, lp };
  };

  const loadPage = async (p) => {
    const { list } = await fetchPage(p);
    setItems((prev) => mergeUniqueById(prev, list));
    setPage(p);
  };

  const refreshFirstPage = async () => {
    const { list } = await fetchPage(1);
    setItems((prev) => prependUniqueById(prev, list));
  };

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const safe = async (fn) => {
      try { await fn(); } catch (e) { if (!cancelled) console.error(e); }
    };
    safe(async () => {
      if (items.length === 0) await loadPage(1);
      else await refreshFirstPage();
    });
    const interval = setInterval(() => { safe(refreshFirstPage); }, 7000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [open]);

  const onScroll = async (e) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 60;
    if (!nearBottom || notifsState.isFetching || !hasMore) return;
    try {
      setIsLoadingNextPage(true);
      await loadPage(page + 1);
    } catch (err) {
      toast.error("Failed to load more notifications.");
    } finally {
      setIsLoadingNextPage(false);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead().unwrap();
      setItems((prev) => prev.map((x) => (x.read_at ? x : { ...x, read_at: new Date().toISOString() })));
      toast.success("All notifications marked as read.");
    } catch (e) { toast.error("Mark all as read failed."); }
  };

  const handleOpenNotification = async (n) => {
    try {
      if (!n?.read_at) {
        await markAsRead(n.id).unwrap();
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)));
      }
      if (n?.type === "order_placed") navigate("/orders");
      else if (n?.type?.includes("adoption")) navigate("/adoption-requests");
      else if (n?.type?.includes("boarding")) navigate("/boarding");
    } catch (e) { toast.error("Failed to open notification."); }
    finally { setOpen(false); }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={customClass}>
          <div className="relative flex items-center justify-center">
            {/* الأيقونة الجديدة بستايل MUI */}
            <CircleNotificationsIcon className="!w-7 !h-7" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 text-white text-[9px] font-bold items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              </span>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-96 p-3 rounded-2xl bg-white/98 backdrop-blur-md border-[#E7DCD0] shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between px-1">
          <div className="leading-tight">
            <div className="text-[13px] font-bold tracking-tight text-[#2F2A24]">
              Notifications
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Updates for you</div>
          </div>
          <button onClick={handleMarkAll} disabled={items.length === 0} className="text-[11px] font-bold text-[#3C7A57] hover:underline disabled:opacity-40">
            Mark all read
          </button>
        </div>

        <div className="my-2.5 h-px w-full bg-slate-100" />

        {notifsState.isFetching && items.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400 font-medium">Loading...</div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400 font-medium">No new notifications</div>
        ) : (
          <div onScroll={onScroll} className="max-h-[350px] overflow-auto pr-1 scrollbar-hide">
            <div className="space-y-1.5">
              {items.map((n) => {
                const unread = !n?.read_at;
                const ui = getTypeUI(n?.type);
                const ItemIcon = ui.Icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleOpenNotification(n)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 border border-transparent ${
                      unread ? "bg-stone-50/80 border-stone-100" : "hover:bg-stone-50/50"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${unread ? "bg-white shadow-sm" : "bg-transparent"}`}>
                        <ItemIcon className={`w-4 h-4 ${ui.accent}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] text-slate-400 font-medium">{formatDate(n?.created_at)}</span>
                          {unread && <div className="h-1.5 w-1.5 rounded-full bg-red-500" />}
                        </div>
                        <p className={`text-[13px] leading-tight mb-1 truncate ${unread ? "font-bold text-stone-900" : "font-medium text-stone-600"}`}>
                          {n?.title}
                        </p>
                        <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed italic">{n?.body}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}