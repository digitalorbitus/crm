"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, X } from "lucide-react";

export default function BreakTimerModal() {
  const [users, setUsers] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateNow = () => setNow(Date.now());
    updateNow();
    const timer = setInterval(updateNow, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchBreakUsers = async () => {
      try {
        const res = await fetch("/api/new-users", {
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = await res.json();
        const list = data.users || data.data || [];
        setUsers(list);
      } catch (error) {
        console.error("BREAK TIMER FETCH ERROR:", error);
      }
    };

    fetchBreakUsers();
    const interval = setInterval(fetchBreakUsers, 15000);
    return () => clearInterval(interval);
  }, []);

  const activeBreakUsers = useMemo(() => {
    const active = [];

    for (const user of users) {
      if (!user.break_start) continue;

      const start = new Date(user.break_start);
      if (Number.isNaN(start.getTime())) continue;

      const end = user.break_end ? new Date(user.break_end) : null;

      if (end && end <= now) continue;
      if (start > now) continue;

      active.push({
        ...user,
        remainingMs: end ? Math.max(end.getTime() - now, 0) : null,
      });
    }

    return active;
  }, [users, now]);

  useEffect(() => {
    setVisible(activeBreakUsers.length > 0);
  }, [activeBreakUsers]);

  const formatCountdown = (ms) => {
    if (ms === null || ms === undefined) {
      return "No end time";
    }

    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }

    return `${minutes}m ${seconds}s`;
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-[60] flex justify-center px-4 pointer-events-none">
      <div className="w-full max-w-lg rounded-2xl border border-amber-200 bg-amber-50/95 shadow-2xl backdrop-blur-sm pointer-events-auto">
        <div className="flex items-center justify-between border-b border-amber-200 px-4 py-3">
          <div className="flex items-center gap-2 text-amber-700">
            <Clock size={18} className="fill-amber-500" />
            <span className="text-sm font-bold uppercase tracking-wide">Break Active</span>
          </div>

          <button
            type="button"
            onClick={() => setVisible(false)}
            className="rounded-full p-1 text-amber-700 hover:bg-amber-100"
            aria-label="Close break modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3 p-4">
          {activeBreakUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white/80 px-3 py-2"
            >
              <div>
                <p className="text-sm font-bold text-slate-800">{user.name}</p>
                <p className="text-[11px] text-slate-500">Break started at {new Date(user.break_start).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}</p>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-600">Timer</p>
                <p className="text-base font-bold text-amber-700">
                  {formatCountdown(user.remainingMs)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
