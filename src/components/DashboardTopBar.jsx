
"use client";

import {
  Bell,
  MessageCircle,
  Calendar,
  ChevronDown,
  Clock3,
  CircleOff,
  Menu,
  Moon,
  Phone,
  Utensils,
  User,
  Users,
  Check,
  MoreHorizontal,
  BriefcaseBusiness,
  Coffee,
  X,
  Timer,
  ShieldCheck,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

const TIMEZONE = "America/Los_Angeles";
const POLL_INTERVAL = 5000;
const MAX_BREAKS = 5;

const BREAK_LIMITS = {
  "Short Break": { minutes: 10, maxUses: 3 },
  "Lunch Break": { minutes: 30, maxUses: 1 },
  "Namaz Break": { minutes: 15, maxUses: 1 },
};

const EMPTY_USAGE = {
  "Short Break": 0,
  "Lunch Break": 0,
  "Namaz Break": 0,
};

const STATUS_OPTIONS = [
  {
    value: "Active",
    icon: Check,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    value: "Namaz Break",
    icon: Moon,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    value: "Lunch Break",
    icon: Utensils,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    value: "Short Break",
    icon: Clock3,
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
  {
    value: "Inactive",
    icon: CircleOff,
    color: "text-red-600",
    bg: "bg-red-50",
    adminOnly: true,
  },
  {
    value: "On Call",
    icon: Phone,
    color: "text-blue-600",
    bg: "bg-blue-50",
    adminOnly: true,
  },
  {
    value: "Meeting",
    icon: Users,
    color: "text-purple-600",
    bg: "bg-purple-50",
    adminOnly: true,
  },
  {
    value: "Washroom Break",
    icon: Coffee,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    adminOnly: true,
  },
  {
    value: "Other",
    icon: MoreHorizontal,
    color: "text-gray-600",
    bg: "bg-gray-100",
    adminOnly: true,
  },
];

function normalizeUsage(usage) {
  const read = (name, alternate) => {
    const value = Number(usage?.[name] ?? usage?.[alternate] ?? 0);

    return Math.min(
      Math.max(Number.isFinite(value) ? value : 0, 0),
      BREAK_LIMITS[name].maxUses
    );
  };

  return {
    "Short Break": read("Short Break", "short_break"),
    "Lunch Break": read("Lunch Break", "lunch_break"),
    "Namaz Break": read("Namaz Break", "namaz_break"),
  };
}

function formatTimer(value) {
  const seconds = Math.max(0, Math.floor(Number(value) || 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return [hours, minutes, remainingSeconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

function parseDate(value) {
  if (!value) return null;

  const text = String(value).trim();

  // ISO timestamps with timezone information.
  if (
    text.includes("T") ||
    text.endsWith("Z") ||
    /[+-]\d{2}:\d{2}$/.test(text)
  ) {
    const date = new Date(text);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  // Treat SQL DATETIME as California local time.
  const match = text.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/
  );

  if (!match) {
    const date = new Date(text);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const [, year, month, day, hour, minute, second] = match;

  const desired = {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    second: Number(second),
  };

  // Find the UTC instant corresponding to the California wall-clock time.
  const desiredUtc = Date.UTC(
    desired.year,
    desired.month - 1,
    desired.day,
    desired.hour,
    desired.minute,
    desired.second
  );

  let candidate = desiredUtc;

  for (let index = 0; index < 3; index++) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(candidate));

    const part = (type) =>
      Number(parts.find((item) => item.type === type)?.value || 0);

    const displayedUtc = Date.UTC(
      part("year"),
      part("month") - 1,
      part("day"),
      part("hour"),
      part("minute"),
      part("second")
    );

    candidate += desiredUtc - displayedUtc;
  }

  return new Date(candidate);
}

function elapsedSeconds(startedAt) {
  const date = parseDate(startedAt);

  if (!date) return 0;

  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
}

export default function DashboardTopBar({
  onMenuClick,
  onLogout,
}) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const [status, setStatus] = useState("Active");
  const [statusStartedAt, setStatusStartedAt] = useState(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const [breakUsage, setBreakUsage] = useState(EMPTY_USAGE);

  const [timerOpen, setTimerOpen] = useState(false);
  const [timerStatus, setTimerStatus] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isNewTimer, setIsNewTimer] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [loginDetails, setLoginDetails] = useState({
    day: "",
    date: "",
    time: "",
  });

  const [officeClosingWarning, setOfficeClosingWarning] = useState(false);
  const [officeClosed, setOfficeClosed] = useState(false);

  const notificationRef = useRef(null);
  const previousUnreadCountRef = useRef(null);
  const notificationSoundRef = useRef(null);
  const officeClosingNotificationSent = useRef({});
  const busyRef = useRef(false);
  const autoEndingBreakRef = useRef(false);
  const newBreakStartedAtRef = useRef(null);

  const isAdmin =
    String(currentUser?.role || "").toLowerCase() === "admin";

  const statusOptions = useMemo(
    () => STATUS_OPTIONS.filter((item) => isAdmin || !item.adminOnly),
    [isAdmin]
  );

  const userName =
    currentUser?.name ||
    currentUser?.full_name ||
    currentUser?.username ||
    "User";

  const userRole = currentUser?.role || "Agent";
  const userId = currentUser?.id || null;

  const profileImage =
    currentUser?.avatar ||
    currentUser?.image ||
    currentUser?.profilePic ||
    currentUser?.avatarUrl ||
    currentUser?.profile_picture ||
    null;

  const currentStatusInfo =
    STATUS_OPTIONS.find((item) => item.value === status) ||
    STATUS_OPTIONS[0];

  const CurrentStatusIcon = currentStatusInfo.icon;

  const currentBreakLimit = timerStatus
    ? BREAK_LIMITS[timerStatus]
    : null;

  const currentBreakUsed = timerStatus
    ? Number(breakUsage[timerStatus] || 0)
    : 0;

  const totalBreakUsage = Object.values(breakUsage).reduce(
    (total, value) => total + Number(value || 0),
    0
  );

  const unreadCount = notifications.filter(
    (item) => Number(item?.is_read || 0) === 0
  ).length;

  const applyUsage = useCallback((data) => {
    const usage =
      data?.break_usage ||
      data?.breakUsage ||
      data?.usage;

    if (usage && typeof usage === "object") {
      setBreakUsage(normalizeUsage(usage));
    }
  }, []);

  const resetTimerState = useCallback(() => {
    setTimerOpen(false);
    setTimerStatus(null);
    setStatusStartedAt(null);
    setTimerSeconds(0);
    setIsNewTimer(false);

    newBreakStartedAtRef.current = null;
    autoEndingBreakRef.current = false;
  }, []);

  const playNotificationSound = useCallback(() => {
    try {
      const AudioCtor =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioCtor) return;

      if (!notificationSoundRef.current) {
        notificationSoundRef.current = new AudioCtor();
      }

      const context = notificationSoundRef.current;

      if (context.state === "suspended") {
        context.resume();
      }

      const start = context.currentTime + 0.02;

      [640, 860, 1180].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const at = start + index * 0.12;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, at);

        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(0.12, at + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start(at);
        oscillator.stop(at + 0.24);
      });
    } catch (error) {
      console.error("Notification sound error:", error);
    }
  }, []);

  // California clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      setLoginDetails({
        day: now.toLocaleDateString("en-US", {
          weekday: "long",
          timeZone: TIMEZONE,
        }),
        date: now.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: TIMEZONE,
        }),
        time: now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZone: TIMEZONE,
        }),
      });
    };

    updateClock();

    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Current user
  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (!cancelled) {
          setCurrentUser(data?.user || data || null);
        }
      } catch (error) {
        console.error("Current user error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, []);

  // Sync status and timer from the backend.
  // The GET endpoint must return the logged-in employee's status.
  const refreshStatus = useCallback(async () => {
    if (busyRef.current) return;

    try {
      const response = await fetch("/api/users/status", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });

      if (!response.ok || busyRef.current) return;

      const data = await response.json();

      applyUsage(data);

      const serverStatus = String(data?.status || "Active");
      const startedAt =
        data?.status_started_at ||
        data?.statusStartedAt ||
        null;

      if (data?.autoExpired) {
        setStatus("Active");
        resetTimerState();
        return;
      }

      setStatus(serverStatus);

      if (!BREAK_LIMITS[serverStatus]) {
        resetTimerState();
        return;
      }

      const sameBreak =
        timerStatus === serverStatus &&
        String(statusStartedAt || "") === String(startedAt || "") &&
        timerOpen;

      if (sameBreak) return;

      const configuredLimit = BREAK_LIMITS[serverStatus].minutes * 60;

      const apiElapsed = Number(
        data?.timer?.elapsedSeconds ??
          data?.timer?.elapsed_seconds ??
          data?.elapsedSeconds ??
          NaN
      );

      const elapsed = Number.isFinite(apiElapsed)
        ? apiElapsed
        : elapsedSeconds(startedAt);

      setTimerStatus(serverStatus);
      setStatusStartedAt(startedAt);
      setTimerSeconds(
        Math.min(Math.max(0, Math.floor(elapsed)), configuredLimit)
      );

      setIsNewTimer(false);
      newBreakStartedAtRef.current = null;
      autoEndingBreakRef.current = false;

      // Opens automatically when the backend reports a newly active break.
      setTimerOpen(true);
    } catch (error) {
      console.error("Status sync error:", error);
    }
  }, [
    applyUsage,
    resetTimerState,
    timerStatus,
    statusStartedAt,
    timerOpen,
  ]);

  useEffect(() => {
    refreshStatus();

    const interval = setInterval(refreshStatus, POLL_INTERVAL);

    const onFocus = () => refreshStatus();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refreshStatus();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refreshStatus]);

  // Live timer

useEffect(() => {
  if (!timerOpen || !timerStatus) return;

  const limit = BREAK_LIMITS[timerStatus];

  const update = () => {
    const elapsed =
      isNewTimer && newBreakStartedAtRef.current
        ? Math.floor(
            (Date.now() - newBreakStartedAtRef.current) / 1000
          )
        : elapsedSeconds(statusStartedAt);

    if (limit) {
      setTimerSeconds(
        Math.min(Math.max(0, elapsed), limit.minutes * 60)
      );
    } else {
      // Admin statuses without a break limit:
      // timer keeps running without a limit.
      setTimerSeconds(Math.max(0, elapsed));
    }
  };

  update();

  const interval = setInterval(update, 1000);

  return () => clearInterval(interval);
}, [timerOpen, timerStatus, statusStartedAt, isNewTimer]);
  // End break when the limit is reached.
  useEffect(() => {
    if (!timerOpen || !timerStatus) return;

    const limit = BREAK_LIMITS[timerStatus];
    if (!limit || timerSeconds < limit.minutes * 60) return;
    if (autoEndingBreakRef.current) return;

    autoEndingBreakRef.current = true;

    const finish = async () => {
      try {
        busyRef.current = true;

        const response = await fetch("/api/users/status", {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Active" }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          autoEndingBreakRef.current = false;
          console.error("Auto-end failed:", data);
          return;
        }

        setStatus("Active");
        applyUsage(data);
        resetTimerState();
      } catch (error) {
        autoEndingBreakRef.current = false;
        console.error("Auto-end error:", error);
      } finally {
        busyRef.current = false;
      }
    };

    finish();
  }, [
    timerOpen,
    timerStatus,
    timerSeconds,
    applyUsage,
    resetTimerState,
  ]);

  const getCaliforniaHour = () => {
    const hour = new Intl.DateTimeFormat("en-US", {
      timeZone: TIMEZONE,
      hour: "2-digit",
      hourCycle: "h23",
    }).format(new Date());

    return Number(hour);
  };

  const handleStatusChange = async (newStatus) => {
    if (loading || busyRef.current) return;

    if (newStatus === status) {
      setStatusDropdownOpen(false);
      return;
    }

    const limit = BREAK_LIMITS[newStatus];

    if (limit) {
      if (getCaliforniaHour() === 8) {
        alert("Breaks cannot be started between 8 AM and 9 AM California time.");
        setStatusDropdownOpen(false);
        return;
      }

      if (Number(breakUsage[newStatus] || 0) >= limit.maxUses) {
        alert(`${newStatus} limit reached.`);
        setStatusDropdownOpen(false);
        return;
      }
    }

    try {
      busyRef.current = true;
      setLoading(true);

      const response = await fetch("/api/users/status", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        applyUsage(data);
        alert(data?.message || "Failed to update status.");
        return;
      }

      setStatus(newStatus);
      applyUsage(data);
      setStatusDropdownOpen(false);

      if (newStatus === "Active" || !BREAK_LIMITS[newStatus]) {
        resetTimerState();
        return;
      }


const startedAt =
  data?.status_started_at ||
  data?.statusStartedAt ||
  new Date().toISOString();

newBreakStartedAtRef.current = Date.now();
autoEndingBreakRef.current = false;

setTimerStatus(newStatus);
setStatusStartedAt(startedAt);

// Timer zero se start hoga
setTimerSeconds(0);
setIsNewTimer(true);

// Timer modal open hoga
setTimerOpen(true);
} catch (error) {
  console.error("Status change error:", error);
  alert("Something went wrong while changing status.");
} finally {
  busyRef.current = false;
  setLoading(false);
}
};

const endStatusTimer = async () => {
  if (loading || busyRef.current) return;

  try {
    busyRef.current = true;
    setLoading(true);

    const response = await fetch("/api/users/status", {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "Active",
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      alert(data?.message || "Unable to end status timer.");
      return;
    }

    setStatus("Active");
    applyUsage(data);
    resetTimerState();
  } catch (error) {
    console.error("End timer error:", error);
    alert("Something went wrong.");
  } finally {
    busyRef.current = false;
    setLoading(false);
  }
};



  // Notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(
        "/api/notifications?unread=true&limit=100",
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!response.ok) return;

      const data = await response.json();
      if (!data?.success) return;

      setNotifications(
        Array.isArray(data.notifications)
          ? data.notifications.map((item) => ({
              ...item,
              is_read: Number(item?.is_read || 0),
            }))
          : []
      );
    } catch (error) {
      console.error("Notifications error:", error);
    }
  }, []);

  const markNotificationRead = async (id) => {
    if (!id) return;

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.success) return;

      setNotifications((previous) =>
        previous.map((item) =>
          Number(item.id) === Number(id)
            ? { ...item, is_read: 1 }
            : item
        )
      );
    } catch (error) {
      console.error("Mark read error:", error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.success) return;

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, is_read: 1 }))
      );
    } catch (error) {
      console.error("Mark all read error:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const unread = notifications.filter(
      (item) => Number(item.is_read || 0) === 0
    ).length;

    if (
      previousUnreadCountRef.current !== null &&
      unread > previousUnreadCountRef.current
    ) {
      playNotificationSound();
    }

    previousUnreadCountRef.current = unread;
  }, [notifications, playNotificationSound]);

  useEffect(() => {
    const outside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  const formatNotificationTime = (value) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString("en-US", {
      timeZone: TIMEZONE,
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const notificationIcon = (item) => {
    const type = String(item?.type || "").toLowerCase();

    if (type === "message") return <MessageCircle size={17} />;
    if (type === "call") return <Phone size={17} />;
    if (type === "task") return <BriefcaseBusiness size={17} />;
    if (type === "break") return <Coffee size={17} />;

    return <Bell size={17} />;
  };

  // Office closing warning: weekdays at 4:55 PM California time.
  useEffect(() => {
    if (!currentUser?.id) return;

    const checkClosing = async () => {
      try {
        const parts = new Intl.DateTimeFormat("en-US", {
          timeZone: TIMEZONE,
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).formatToParts(new Date());

        const get = (type) =>
          parts.find((part) => part.type === type)?.value;

        const weekday = get("weekday");
        const hour = Number(get("hour"));
        const minute = Number(get("minute"));
        const date = `${get("year")}-${get("month")}-${get("day")}`;

        if (weekday === "Sat" || weekday === "Sun") {
          setOfficeClosingWarning(false);
          setOfficeClosed(false);
          return;
        }

        const now = hour * 60 + minute;
        const warningAt = 16 * 60 + 55;
        const closingAt = 17 * 60;

        if (now >= warningAt && now < closingAt) {
          setOfficeClosingWarning(true);
          setOfficeClosed(false);

          const key = `office-closing-${currentUser.id}-${date}`;

          if (officeClosingNotificationSent.current[key]) return;

          const storageKey = "crm_office_closing_notifications";
          let sent = {};

          try {
            sent = JSON.parse(localStorage.getItem(storageKey)) || {};
          } catch {
            sent = {};
          }

          if (sent[key]) {
            officeClosingNotificationSent.current[key] = true;
            return;
          }

          const response = await fetch("/api/notifications", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: Number(currentUser.id),
              title: "Office Closing Soon",
              message:
                "Office closing time is in 5 minutes. Please complete and save your pending work.",
              type: "general",
            }),
          });

          const data = await response.json().catch(() => ({}));

          if (response.ok && data?.success) {
            officeClosingNotificationSent.current[key] = true;
            sent[key] = true;
            localStorage.setItem(storageKey, JSON.stringify(sent));
            await fetchNotifications();
          }
        } else if (now >= closingAt) {
          setOfficeClosingWarning(false);
          setOfficeClosed(true);
        } else {
          setOfficeClosingWarning(false);
          setOfficeClosed(false);
        }
      } catch (error) {
        console.error("Office closing check error:", error);
      }
    };

    checkClosing();

    const interval = setInterval(checkClosing, 10000);
    return () => clearInterval(interval);
  }, [currentUser?.id, fetchNotifications]);

  const isBreakStartBlocked = getCaliforniaHour() === 8;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur-xl">
        <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {onMenuClick && (
              <button
                type="button"
                onClick={onMenuClick}
                aria-label="Open navigation"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 lg:hidden"
              >
                <Menu size={20} />
              </button>
            )}

            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">
                Dashboard
              </h1>
              <p className="hidden text-sm text-gray-500 sm:block">
                Call Activity &amp; Performance Analytics
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 lg:flex">
              <Calendar size={17} className="text-gray-500" />
              <div className="leading-tight">
                <div className="text-xs font-semibold text-gray-700">
                  {loginDetails.day}
                </div>
                <div className="text-[11px] text-gray-500">
                  {loginDetails.date}
                </div>
              </div>
              <div className="border-l border-gray-300 pl-3 text-xs font-semibold text-gray-700">
                {loginDetails.time}
              </div>
            </div>

            {/* Notifications */}
            <div ref={notificationRef} className="relative">
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => setNotificationOpen((value) => !value)}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 top-12 z-50 w-[350px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        Notifications
                      </h3>
                      <p className="text-xs text-gray-500">
                        {unreadCount} unread
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="text-xs font-semibold text-red-500 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[380px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-5 py-10 text-center">
                        <Bell className="mx-auto mb-2 text-gray-300" size={28} />
                        <p className="text-sm text-gray-500">
                          No notifications
                        </p>
                      </div>
                    ) : (
                      notifications.map((item) => {
                        const unread = Number(item.is_read || 0) === 0;

                        return (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() =>
                              unread && markNotificationRead(item.id)
                            }
                            className={`flex w-full gap-3 border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50 ${
                              unread ? "bg-red-50/40" : ""
                            }`}
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                              {notificationIcon(item)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-800">
                                {item.title || "Notification"}
                              </p>
                              <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                                {item.message || ""}
                              </p>
                              <p className="mt-1 text-[10px] text-gray-400">
                                {formatNotificationTime(
                                  item.created_at || item.createdAt
                                )}
                              </p>
                            </div>
                            {unread && (
                              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile and status */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setStatusDropdownOpen((value) => !value)}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-2 py-1.5 hover:bg-gray-50 sm:px-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                  {profileImage && !imageError ? (
                    <img
                      src={profileImage}
                      alt={userName}
                      className="h-full w-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <User size={18} className="text-gray-500" />
                  )}
                </div>

                <div className="hidden min-w-0 text-left sm:block">
                  <div className="max-w-[120px] truncate text-xs font-bold text-gray-800">
                    {userName}
                  </div>
                  <div className="text-[10px] capitalize text-gray-500">
                    {userRole}
                  </div>
                  <div className="text-[9px] text-gray-400">
                    ID: {userId || "—"}
                  </div>
                </div>

                <ChevronDown
                  size={16}
                  className={`hidden text-gray-400 transition sm:block ${
                    statusDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {statusDropdownOpen && (
                <div className="absolute right-0 top-12 z-50 w-[290px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                        {profileImage && !imageError ? (
                          <img
                            src={profileImage}
                            alt={userName}
                            className="h-full w-full rounded-full object-cover"
                            onError={() => setImageError(true)}
                          />
                        ) : (
                          <User size={19} className="text-gray-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-900">
                          {userName}
                        </p>
                        <p className="text-xs capitalize text-gray-500">
                          {userRole}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-2 pt-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Availability Status
                    </p>
                  </div>

                  <div className="max-h-[350px] overflow-y-auto px-2 pb-2">
                    {statusOptions.map((item) => {
                      const Icon = item.icon;
                      const selected = status === item.value;
                      const limit = BREAK_LIMITS[item.value];
                      const usage = limit
                        ? Number(breakUsage[item.value] || 0)
                        : 0;
                      const reached = Boolean(
                        limit && usage >= limit.maxUses
                      );
                      const blocked = Boolean(limit && isBreakStartBlocked);

                      const disabled =
                        loading ||
                        (limit && !selected && (reached || blocked));

                      return (
                        <button
                          type="button"
                          key={item.value}
                          disabled={disabled}
                          onClick={() => handleStatusChange(item.value)}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                            selected ? "bg-gray-100" : "hover:bg-gray-50"
                          } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                        >
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.bg} ${item.color}`}
                          >
                            <Icon size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-gray-700">
                              {item.value}
                            </span>
                            {limit && (
                              <span className="block text-[10px] text-gray-400">
                                {limit.minutes} min • {usage}/{limit.maxUses} used
                              </span>
                            )}
                            {limit && blocked && (
                              <span className="block text-[10px] text-red-500">
                                Unavailable 8–9 AM California
                              </span>
                            )}
                          </div>
                          {selected && (
                            <Check size={16} className="text-green-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {!isAdmin && (
                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Breaks — Reset 8 AM CA
                        </span>
                        <span className="text-[10px] font-semibold text-gray-500">
                          {totalBreakUsage}/{MAX_BREAKS}
                        </span>
                      </div>

                      {Object.entries(BREAK_LIMITS).map(([name, limit]) => (
                        <div
                          key={name}
                          className="flex items-center justify-between py-1 text-[10px]"
                        >
                          <span className="text-gray-500">{name}</span>
                          <span className="font-semibold text-gray-600">
                            {breakUsage[name]}/{limit.maxUses}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Office closing banners */}
      {officeClosingWarning && (
        <div className="fixed right-4 top-24 z-40 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 shadow-lg">
          Office closes in 5 minutes.
        </div>
      )}

      {officeClosed && (
        <div className="fixed right-4 top-24 z-40 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-lg">
          Office closing time has passed.
        </div>
      )}

      {/* Break timer modal */}
      {timerOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="break-timer-title"
              className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Current Status
                  </p>
                  <h2
                    id="break-timer-title"
                    className="mt-1 text-xl font-bold text-gray-900"
                  >
                    {timerStatus}
                  </h2>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    currentStatusInfo.bg
                  } ${currentStatusInfo.color}`}
                >
                  <CurrentStatusIcon size={22} />
                </div>
              </div>

              <div className="px-6 py-9 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                  <Timer size={32} />
                </div>

                <p className="text-sm font-medium text-gray-500">
                  Time Elapsed
                </p>

                <div className="mt-3 font-mono text-5xl font-bold tracking-wider text-gray-900 sm:text-6xl">
                  {formatTimer(timerSeconds)}
                </div>

                {currentBreakLimit && (
                  <>
                    <div className="mx-auto mt-6 max-w-xs">
                      <div className="mb-2 flex justify-between text-xs text-gray-500">
                        <span>Break progress</span>
                        <span>
                          {Math.min(
                            100,
                            Math.round(
                              (timerSeconds /
                                (currentBreakLimit.minutes * 60)) *
                                100
                            )
                          )}
                          %
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-red-500 transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              100,
                              (timerSeconds /
                                (currentBreakLimit.minutes * 60)) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <p className="mt-4 text-xs font-medium text-gray-500">
                      Limit: {currentBreakLimit.minutes} minutes
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Used today: {currentBreakUsed}/
                      {currentBreakLimit.maxUses}
                    </p>
                  </>
                )}

                {isNewTimer && (
                  <p className="mt-3 text-xs font-semibold text-emerald-600">
                    Break started
                  </p>
                )}

                {!isNewTimer && statusStartedAt && (
                  <p className="mt-3 text-xs text-gray-400">
                    Restored from your current status
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 bg-gray-50 px-6 py-5">
                <button
                  type="button"
                  disabled={loading}
                  onClick={endStatusTimer}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Check size={17} />
                  {loading ? "Updating..." : "End Break"}
                </button>

                <p className="mt-3 text-center text-xs text-gray-400">
                  The timer continues while this break is active.
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

