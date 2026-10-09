"use client";

import {
  CalendarDays,
  Coffee,
  Users,
  Search,
  Filter,
  ChevronDown,
  Timer,
  RefreshCw,
  X,
  Activity,
  ShieldCheck,
  Clock3,
  Utensils,
  Moon,
  Bath,
  Plus,
  Pencil,
  Trash2,
  Save,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eraser,
  Download,
  BadgeCheck,
} from "lucide-react";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";

import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

// =============================================================
// CONFIG
// =============================================================

const CALIFORNIA_TIMEZONE = "America/Los_Angeles";

const BREAK_TYPES = ["Namaz", "Lunch", "Short Break", "Washroom", "Other"];

const API_BREAK_TYPES = {
  Namaz: "Namaz Break",
  Lunch: "Lunch Break",
  "Short Break": "Short Break",
  Washroom: "Washroom Break",
  Other: "Other",
};

// Roles (value is compared case-insensitively)
const ROLE_OPTIONS = [
  { value: "agent", label: "Agent" },
  { value: "staff", label: "Staff" },
  { value: "admin", label: "Admin" },
  { value: "hr", label: "HR" },
  { value: "supervisor", label: "Supervisor" },
  { value: "management", label: "Management" },
  { value: "team lead", label: "Team Lead" },
  { value: "smm", label: "SMM" },
  { value: "developer", label: "Developer" },
  { value: "designer", label: "Designer" },
];

// =============================================================
// ROLE HELPERS
// =============================================================

function roleKey(role) {
  return String(role || "").trim().toLowerCase();
}

function getRoleLabel(role) {
  const key = roleKey(role);

  if (!key) return "—";

  const found = ROLE_OPTIONS.find((item) => item.value === key);

  return found ? found.label : String(role).trim();
}

function isAdminUser(user) {
  return roleKey(user?.role) === "admin";
}

function getRoleStyles(role) {
  const key = roleKey(role);

  if (key === "admin") {
    return "border-rose-100 bg-rose-50 text-rose-700";
  }

  if (key === "hr") {
    return "border-purple-100 bg-purple-50 text-purple-700";
  }

  if (["supervisor", "management", "team lead"].includes(key)) {
    return "border-indigo-100 bg-indigo-50 text-indigo-700";
  }

  if (["developer", "designer", "smm"].includes(key)) {
    return "border-sky-100 bg-sky-50 text-sky-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

// =============================================================
// CALIFORNIA DATE
// =============================================================

function getCaliforniaDateString(dateValue = new Date()) {
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CALIFORNIA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// =============================================================
// CALIFORNIA OFFSET
// =============================================================

function getCaliforniaOffsetMinutes(date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: CALIFORNIA_TIMEZONE,
    timeZoneName: "longOffset",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);
  const timezonePart = parts.find((part) => part.type === "timeZoneName");

  if (!timezonePart?.value) return -480;

  const match = timezonePart.value.match(/GMT([+-])(\d{2}):?(\d{2})/);

  if (!match) return -480;

  const sign = match[1] === "+" ? 1 : -1;
  const hours = Number(match[2]);
  const minutes = Number(match[3]);

  return sign * (hours * 60 + minutes);
}

// =============================================================
// PARSE MYSQL DATETIME AS CALIFORNIA
// =============================================================

function parseCaliforniaMySQLDateTime(value) {
  if (!value) return null;

  const raw = String(value).trim();

  const match = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d+))?$/
  );

  if (!match) return null;

  const wallClockUTC = Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    Number(match[6] || 0)
  );

  const offsetMinutes = getCaliforniaOffsetMinutes(new Date(wallClockUTC));

  let utcTimestamp = wallClockUTC - offsetMinutes * 60 * 1000;
  let result = new Date(utcTimestamp);

  const correctedOffset = getCaliforniaOffsetMinutes(result);

  if (correctedOffset !== offsetMinutes) {
    utcTimestamp = wallClockUTC - correctedOffset * 60 * 1000;
    result = new Date(utcTimestamp);
  }

  return Number.isNaN(result.getTime()) ? null : result;
}

// =============================================================
// PARSE DATE
// =============================================================

function parseDateTime(value) {
  if (!value) return null;

  const raw = String(value).trim();

  if (!raw) return null;

  if (raw.includes("T") && (raw.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(raw))) {
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const mysqlDate = parseCaliforniaMySQLDateTime(raw);

  if (mysqlDate) return mysqlDate;

  const date = new Date(raw);

  return Number.isNaN(date.getTime()) ? null : date;
}

// =============================================================
// FORMAT DATE TIME
// =============================================================

function formatDateTime(value) {
  if (!value) return "—";

  const date = parseDateTime(value);

  if (!date) return "—";

  return new Intl.DateTimeFormat("en-US", {
    timeZone: CALIFORNIA_TIMEZONE,
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

// =============================================================
// FORMAT DATE ONLY
// =============================================================

function formatDateOnly(value) {
  if (!value) return "—";

  const raw = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split("-");

    const date = new Date(
      Date.UTC(Number(year), Number(month) - 1, Number(day), 12, 0, 0)
    );

    return new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(date);
  }

  const date = parseDateTime(raw);

  if (!date) return "—";

  return new Intl.DateTimeFormat("en-US", {
    timeZone: CALIFORNIA_TIMEZONE,
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

// =============================================================
// FORMAT DURATION
// =============================================================

function formatDuration(seconds) {
  const totalSeconds = Number(seconds || 0);

  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "0m";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;

  return `${secs}s`;
}

// =============================================================
// BREAK TYPE NORMALIZER
// =============================================================

function normalizeBreakType(item) {
  const value = String(
    item?.break_type || item?.type || item?.status || "Other"
  ).trim();

  const lower = value.toLowerCase();

  if (lower.includes("namaz") || lower.includes("prayer")) return "Namaz";
  if (lower.includes("lunch") || lower.includes("meal")) return "Lunch";
  if (lower.includes("short break") || lower.includes("shortbreak")) {
    return "Short Break";
  }
  if (lower.includes("washroom") || lower.includes("bathroom")) {
    return "Washroom";
  }

  return "Other";
}

// =============================================================
// ACTIVE BREAK
// =============================================================

function isActiveBreak(item) {
  if (item?.is_active === true) return true;
  return !item?.ended_at;
}

// =============================================================
// LIVE DURATION
// =============================================================

function getLiveDuration(item) {
  const maxLimits = {
    Namaz: 15 * 60,
    Lunch: 30 * 60,
    "Short Break": 10 * 60,
    Washroom: 60 * 60,
    Other: 60 * 60,
  };

  const breakType = normalizeBreakType(item);
  const maxSeconds = maxLimits[breakType] || maxLimits.Other;

  if (!isActiveBreak(item)) {
    const stored = Number(item?.duration_seconds || 0);
    return Math.min(Math.max(0, Math.floor(stored)), maxSeconds);
  }

  const started = parseDateTime(item?.started_at);

  if (!started) return 0;

  const elapsed = Math.floor((Date.now() - started.getTime()) / 1000);

  return Math.min(Math.max(0, elapsed), maxSeconds);
}

// =============================================================
// DATETIME LOCAL VALUE
// NO new Date(), NO toISOString(), NO timezone conversion.
// 2026-10-07 10:30  ->  2026-10-07T10:30
// =============================================================

function toDateTimeLocalValue(value) {
  if (!value) return "";

  const raw = String(value).trim();

  const match = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/
  );

  if (!match) return "";

  const [, year, month, day, hour, minute] = match;

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

// =============================================================
// CURRENT CALIFORNIA DATETIME LOCAL
// =============================================================

function getCurrentCaliforniaDateTimeLocal() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CALIFORNIA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const get = (type) => parts.find((part) => part.type === type)?.value || "";

  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get(
    "minute"
  )}`;
}

// =============================================================
// TYPE ICON
// =============================================================

function getTypeIcon(type) {
  const value = String(type || "").toLowerCase();

  if (value.includes("namaz") || value.includes("prayer")) return Moon;
  if (value.includes("lunch") || value.includes("meal")) return Utensils;
  if (value.includes("short break") || value.includes("shortbreak")) {
    return Clock3;
  }
  if (value.includes("washroom") || value.includes("bathroom")) return Bath;

  return Coffee;
}

// =============================================================
// TYPE STYLES
// =============================================================

function getTypeStyles(type) {
  const value = String(type || "").toLowerCase();

  if (value.includes("namaz") || value.includes("prayer")) {
    return {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-100",
    };
  }

  if (value.includes("lunch") || value.includes("meal")) {
    return {
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-100",
    };
  }

  if (value.includes("short break") || value.includes("shortbreak")) {
    return {
      bg: "bg-teal-50",
      text: "text-teal-700",
      border: "border-teal-100",
    };
  }

  if (value.includes("washroom") || value.includes("bathroom")) {
    return {
      bg: "bg-cyan-50",
      text: "text-cyan-700",
      border: "border-cyan-100",
    };
  }

  return {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-100",
  };
}

// =============================================================
// USAGE TEXT  (Short 2/3 • Lunch 0/1 • Namaz 0/1)
// =============================================================

function formatUsageText(usage) {
  if (!usage || typeof usage !== "object") return "";

  return (
    `Short ${Number(usage["Short Break"] || 0)}/3 • ` +
    `Lunch ${Number(usage["Lunch Break"] || 0)}/1 • ` +
    `Namaz ${Number(usage["Namaz Break"] || 0)}/1`
  );
}

// =============================================================
// CSV DOWNLOAD
// =============================================================

function csvCell(value) {
  let text = String(value ?? "");

  // stop spreadsheet formula injection
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;

  return `"${text.replace(/"/g, '""')}"`;
}

function downloadBreaksCsv(items, fileDate) {
  const header = [
    "Employee",
    "Email",
    "Role",
    "Team",
    "Break Type",
    "Started (California)",
    "Ended (California)",
    "Duration (seconds)",
    "Duration",
    "Status",
  ];

  const lines = [header.map(csvCell).join(",")];

  for (const item of items) {
    const active = isActiveBreak(item);
    const seconds = getLiveDuration(item);

    lines.push(
      [
        item?.name || item?.employee_name || item?.user_name || "",
        item?.email || item?.employee_email || item?.user_email || "",
        getRoleLabel(item?.role),
        item?.team || item?.department || item?.team_name || "",
        normalizeBreakType(item),
        formatDateTime(item?.started_at),
        active ? "" : formatDateTime(item?.ended_at),
        seconds,
        formatDuration(seconds),
        active ? "Active" : "Completed",
      ]
        .map(csvCell)
        .join(",")
    );
  }

  // BOM so Excel opens it correctly
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `break-history-${fileDate || "export"}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// =============================================================
// NOTIFY EMPLOYEE (best effort)
// The employee's top bar shows it and refreshes the break counters.
// =============================================================

async function notifyEmployee(userId, title, message) {
  const id = Number(userId);

  if (!Number.isInteger(id) || id <= 0) return;

  for (const type of ["break", "general"]) {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ user_id: id, title, message, type }),
      });

      if (response.ok) return;
    } catch {
      // ignore, try next type
    }
  }
}

// =============================================================
// PAGE
// =============================================================

export default function BreaksPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [breakHistory, setBreakHistory] = useState([]);

  const [breakStats, setBreakStats] = useState({
    total: 0,
    namaz: 0,
    lunch: 0,
    shortBreak: 0,
    washroom: 0,
    other: 0,
  });

  // usage per user in the current 8 AM window (after admin resets)
  const [usageByUser, setUsageByUser] = useState({});
  const [breakWindow, setBreakWindow] = useState(null);

  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [now, setNow] = useState(new Date());

  // PAGE NOTICE + NEW ROW HIGHLIGHT
  const [pageNotice, setPageNotice] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const noticeTimerRef = useRef(null);
  const highlightTimerRef = useRef(null);

  // ADD / EDIT MODAL
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedBreak, setSelectedBreak] = useState(null);

  const [staffUsers, setStaffUsers] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);

  const [savingBreak, setSavingBreak] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [breakForm, setBreakForm] = useState({
    user_id: "",
    status: "Lunch Break",
    started_at: "",
    ended_at: "",
  });

  // RESET LIMIT MODAL
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearUserId, setClearUserId] = useState("all");
  const [clearing, setClearing] = useState(false);
  const [clearError, setClearError] = useState("");
  const [clearSuccess, setClearSuccess] = useState("");

  const isAdmin = isAdminUser(currentUser);

  // ===========================================================
  // TODAY
  // ===========================================================

  const todayCalifornia = useMemo(() => getCaliforniaDateString(now), [now]);

  const windowLabel = useMemo(() => {
    if (!breakWindow?.start || !breakWindow?.end) {
      return "current break window";
    }

    return `${formatDateTime(breakWindow.start)} → ${formatDateTime(
      breakWindow.end
    )}`;
  }, [breakWindow]);

  // ===========================================================
  // PAGE NOTICE
  // ===========================================================

  const showNotice = useCallback((type, text) => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);

    setPageNotice({ type, text });

    noticeTimerRef.current = setTimeout(() => setPageNotice(null), 9000);
  }, []);

  const highlightRow = useCallback((id) => {
    if (!id) return;

    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);

    setHighlightId(String(id));

    highlightTimerRef.current = setTimeout(() => setHighlightId(null), 9000);
  }, []);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, []);

  // ===========================================================
  // CURRENT USER
  // ===========================================================

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const data = await response.json();

      if (data?.user) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error("Current user fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // ===========================================================
  // STAFF (all active users, any role)
  // ===========================================================

  const fetchStaffUsers = useCallback(async () => {
    setStaffLoading(true);

    try {
      const response = await fetch("/api/new-users", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });

      if (!response.ok) return;

      const data = await response.json();

      let users = [];

      if (Array.isArray(data)) users = data;
      else if (Array.isArray(data?.users)) users = data.users;
      else if (Array.isArray(data?.data)) users = data.data;

      users = users.filter((user) => {
        const status = String(user?.status || "").toLowerCase();
        const activeStatus = String(user?.availability_status || "").toLowerCase();

        const isInactive =
          status === "inactive" ||
          activeStatus === "inactive" ||
          user?.active === false;

        return !isInactive;
      });

      setStaffUsers(users);
    } catch (error) {
      console.error("Staff fetch error:", error);
    } finally {
      setStaffLoading(false);
    }
  }, []);

  // ===========================================================
  // HISTORY
  // ===========================================================

  const fetchBreakHistory = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setHistoryLoading(true);

        const response = await fetch(
          `/api/admin/break-history?_live=${Date.now()}`,
          {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        );

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        // Don't erase existing records on a failed refresh
        if (response.status === 403) return;

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data?.success) {
          if (Array.isArray(data.breaks)) {
            setBreakHistory(data.breaks);
          }

          setBreakStats({
            total: Number(data?.stats?.total || 0),
            namaz: Number(data?.stats?.namaz || 0),
            lunch: Number(data?.stats?.lunch || 0),
            shortBreak: Number(data?.stats?.shortBreak || 0),
            washroom: Number(data?.stats?.washroom || 0),
            other: Number(data?.stats?.other || 0),
          });

          if (data?.usage_by_user && typeof data.usage_by_user === "object") {
            setUsageByUser(data.usage_by_user);
          }

          if (data?.break_window) {
            setBreakWindow(data.break_window);
          }
        }
      } catch (error) {
        console.error("Break history fetch error:", error);
        // Never set breakHistory([]) when refresh fails
      } finally {
        setHistoryLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );

  // INITIAL LOAD
  useEffect(() => {
    fetchCurrentUser();
    fetchBreakHistory();
    fetchStaffUsers();
  }, [fetchCurrentUser, fetchBreakHistory, fetchStaffUsers]);

  // AUTO REFRESH
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBreakHistory(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchBreakHistory]);

  // LIVE CLOCK
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ===========================================================
  // FILTER
  // ===========================================================

  const filteredBreakHistory = useMemo(() => {
    let result = [...breakHistory];

    if (search.trim()) {
      const searchValue = search.trim().toLowerCase();

      result = result.filter((item) => {
        const employeeName = String(
          item?.employee_name || item?.user_name || item?.name || ""
        ).toLowerCase();

        const email = String(
          item?.employee_email || item?.user_email || item?.email || ""
        ).toLowerCase();

        const team = String(
          item?.team || item?.department || item?.team_name || ""
        ).toLowerCase();

        const role = getRoleLabel(item?.role).toLowerCase();

        const type = normalizeBreakType(item).toLowerCase();

        return (
          employeeName.includes(searchValue) ||
          email.includes(searchValue) ||
          team.includes(searchValue) ||
          role.includes(searchValue) ||
          type.includes(searchValue)
        );
      });
    }

    if (typeFilter !== "All") {
      result = result.filter((item) => normalizeBreakType(item) === typeFilter);
    }

    if (roleFilter !== "All") {
      result = result.filter((item) => roleKey(item?.role) === roleFilter);
    }

    if (startDate || endDate) {
      result = result.filter((item) => {
        const parsed = parseDateTime(item?.started_at);

        if (!parsed) return false;

        const itemDate = getCaliforniaDateString(parsed);

        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;

        return true;
      });
    }

    return result;
  }, [breakHistory, search, typeFilter, roleFilter, startDate, endDate]);

  // TOTAL FILTERED
  const totalFilteredSeconds = useMemo(() => {
    return filteredBreakHistory.reduce(
      (total, item) => total + getLiveDuration(item),
      0
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredBreakHistory, now]);

  const totalFilteredHours = useMemo(
    () => formatDuration(totalFilteredSeconds),
    [totalFilteredSeconds]
  );

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("All");
    setRoleFilter("All");
    setStartDate("");
    setEndDate("");
  };

  const hasFilters = Boolean(
    search.trim() ||
      typeFilter !== "All" ||
      roleFilter !== "All" ||
      startDate ||
      endDate
  );

  const dateRangeText = useMemo(() => {
    if (startDate && endDate) {
      return `${formatDateOnly(startDate)} → ${formatDateOnly(endDate)}`;
    }
    if (startDate) return `From ${formatDateOnly(startDate)}`;
    if (endDate) return `Until ${formatDateOnly(endDate)}`;
    return "All dates";
  }, [startDate, endDate]);

  // ===========================================================
  // DOWNLOAD
  // ===========================================================

  const handleDownload = () => {
    if (!filteredBreakHistory.length) return;

    downloadBreaksCsv(filteredBreakHistory, todayCalifornia);
  };

  // ===========================================================
  // OPEN ADD
  // ===========================================================

  const openAddModal = () => {
    setModalMode("add");
    setSelectedBreak(null);
    setFormError("");
    setFormSuccess("");

    setBreakForm({
      user_id: staffUsers.length === 1 ? String(staffUsers[0].id) : "",
      status: "Lunch Break",
      started_at: getCurrentCaliforniaDateTimeLocal(),
      ended_at: "",
    });

    setShowBreakModal(true);
  };

  // ===========================================================
  // OPEN EDIT
  // ===========================================================

  const openEditModal = (item) => {
    const breakId = item?.id ?? item?.break_id;

    if (!breakId) {
      alert("Break ID is missing.");
      return;
    }

    setModalMode("edit");
    setSelectedBreak({ ...item, id: breakId });
    setFormError("");
    setFormSuccess("");

    // an active break has no real end time
    const active = isActiveBreak(item);

    setBreakForm({
      user_id: String(item?.user_id ?? item?.id_user ?? ""),
      status:
        item?.status ||
        API_BREAK_TYPES[normalizeBreakType(item)] ||
        "Other",
      started_at: toDateTimeLocalValue(item?.started_at_ca || item?.started_at),
      ended_at:
        !active && item?.ended_at
          ? toDateTimeLocalValue(item?.ended_at_ca || item?.ended_at)
          : "",
    });

    setShowBreakModal(true);
  };

  const closeBreakModal = () => {
    if (savingBreak) return;

    setShowBreakModal(false);
    setSelectedBreak(null);
    setFormError("");
    setFormSuccess("");
  };

  const updateBreakForm = (field, value) => {
    setBreakForm((previous) => ({ ...previous, [field]: value }));
    setFormError("");
  };

  // ===========================================================
  // SAVE BREAK
  // ===========================================================

  const saveBreak = async (event) => {
    event.preventDefault();

    setFormError("");
    setFormSuccess("");

    if (modalMode === "add" && !breakForm.user_id) {
      setFormError("Please select an employee.");
      return;
    }

    if (modalMode === "edit" && !breakForm.user_id) {
      setFormError("Employee information is missing.");
      return;
    }

    if (!breakForm.started_at) {
      setFormError("Please select start date and time.");
      return;
    }

    if (breakForm.ended_at && breakForm.ended_at < breakForm.started_at) {
      setFormError("End time cannot be earlier than start time.");
      return;
    }

    setSavingBreak(true);

    try {
      // datetime-local value is sent EXACTLY as entered (California wall-clock)
      const payload = {
        status: breakForm.status,
        started_at: breakForm.started_at,
        ended_at: breakForm.ended_at || null,
      };

      let url = "/api/admin/break-history";
      let method = "POST";

      if (modalMode === "add") {
        const userId = Number(breakForm.user_id);

        if (!Number.isInteger(userId) || userId <= 0) {
          throw new Error("Please select a valid employee.");
        }

        payload.user_id = userId;
      } else {
        const id = selectedBreak?.id ?? selectedBreak?.break_id;

        if (!id) throw new Error("Break ID is missing.");

        url = `/api/admin/break-history/${id}`;
        method = "PUT";
        payload.user_id = Number(breakForm.user_id);
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(payload),
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            `Failed to ${modalMode === "add" ? "add" : "update"} break.`
        );
      }

      // WHO / WHAT / USAGE for the success message
      const target =
        staffUsers.find((user) => String(user?.id) === String(breakForm.user_id)) ||
        null;

      const employeeName =
        target?.name ||
        selectedBreak?.name ||
        selectedBreak?.employee_name ||
        "the employee";

      const employeeRole = getRoleLabel(target?.role || selectedBreak?.role);

      const usageText = formatUsageText(data?.break_usage);

      const summary =
        modalMode === "add"
          ? `${breakForm.status} added for ${employeeName} (${employeeRole}) by ${
              currentUser?.name || "Admin"
            }.`
          : `${breakForm.status} updated for ${employeeName} (${employeeRole}).`;

      setFormSuccess(
        modalMode === "add"
          ? "Break added successfully."
          : "Break updated successfully."
      );

      showNotice(
        "success",
        usageText ? `${summary} Usage now: ${usageText}.` : summary
      );

      if (modalMode === "add") {
        highlightRow(data?.id || data?.break?.id);

        // tell the employee (their top bar also refreshes the counters)
        notifyEmployee(
          breakForm.user_id,
          "Break added by admin",
          `${currentUser?.name || "Admin"} added a ${breakForm.status} for you ` +
            `(${breakForm.started_at.replace("T", " ")} California time).` +
            (usageText ? ` Usage now: ${usageText}.` : "")
        );
      } else {
        highlightRow(selectedBreak?.id);
      }

      await fetchBreakHistory(true);

      setTimeout(() => {
        setShowBreakModal(false);
        setSelectedBreak(null);
        setFormSuccess("");
      }, 500);
    } catch (error) {
      console.error("Save break error:", error);
      setFormError(error?.message || "Failed to save break.");
    } finally {
      setSavingBreak(false);
    }
  };

  // ===========================================================
  // DELETE ONE
  // ===========================================================

  const deleteBreak = async (item) => {
    const id = item?.id ?? item?.break_id;

    if (!id) {
      alert("Break ID is missing.");
      return;
    }

    const employeeName =
      item?.employee_name || item?.user_name || item?.name || "this employee";

    const confirmed = window.confirm(
      `Are you sure you want to delete this break record for ${employeeName}?`
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      const response = await fetch(`/api/admin/break-history/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data?.error || data?.message || "Failed to delete break."
        );
      }

      const usageText = formatUsageText(data?.break_usage);

      showNotice(
        "success",
        `Break deleted for ${employeeName}.` +
          (usageText ? ` Usage now: ${usageText}.` : "")
      );

      await fetchBreakHistory(true);
    } catch (error) {
      console.error("Delete break error:", error);
      alert(error?.message || "Failed to delete break.");
    } finally {
      setDeletingId(null);
    }
  };

  // ===========================================================
  // RESET BREAK LIMIT (history is NOT deleted)
  // ===========================================================

  // Breaks counted for the selected employee(s) in the current window,
  // after any earlier reset. Comes from the backend.
  const usedInWindow = useMemo(() => {
    if (clearUserId === "all") {
      return Object.values(usageByUser).reduce(
        (sum, usage) => sum + Number(usage?.total || 0),
        0
      );
    }

    return Number(usageByUser[String(clearUserId)]?.total || 0);
  }, [usageByUser, clearUserId]);

  const openClearModal = () => {
    setClearUserId("all");
    setClearError("");
    setClearSuccess("");
    setShowClearModal(true);
  };

  const closeClearModal = () => {
    if (clearing) return;

    setShowClearModal(false);
    setClearError("");
    setClearSuccess("");
  };

  const handleResetLimit = async () => {
    setClearError("");
    setClearSuccess("");
    setClearing(true);

    try {
      const response = await fetch("/api/admin/break-limit-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(
          clearUserId === "all"
            ? { all: true }
            : { user_id: Number(clearUserId) }
        ),
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.error || data?.message || "Failed to reset break limit."
        );
      }

      const target =
        clearUserId === "all"
          ? null
          : staffUsers.find((user) => String(user?.id) === String(clearUserId));

      const successText =
        clearUserId === "all"
          ? "Break limit reset for all employees. Their break count starts again from 0."
          : `Break limit reset for ${
              target?.name || "the employee"
            }. Their break count starts again from 0.`;

      setClearSuccess(successText);
      showNotice("success", successText);

      // tell the employee(s)
      const message = `${
        currentUser?.name || "Admin"
      } reset your break limit. You can take Namaz 1, Lunch 1 and Short 3 breaks again.`;

      if (clearUserId === "all") {
        Promise.allSettled(
          staffUsers.map((user) =>
            notifyEmployee(user.id, "Break limit reset", message)
          )
        );
      } else {
        notifyEmployee(clearUserId, "Break limit reset", message);
      }

      await fetchBreakHistory(true);

      setTimeout(() => {
        setShowClearModal(false);
        setClearSuccess("");
      }, 1400);
    } catch (error) {
      console.error("Reset break limit error:", error);
      setClearError(error?.message || "Failed to reset break limit.");
    } finally {
      setClearing(false);
    }
  };

  // ===========================================================
  // RENDER
  // ===========================================================

  return (
    <div className="flex min-h-screen bg-[#F7F8FA]">
      <Sidebar />

      <main className="min-h-screen w-full lg:pl-[270px]">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* HEADER */}

          <div className="mb-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5">
                    <CalendarDays className="h-4 w-4 text-[#741C29]" />
                    <span className="text-xs font-semibold text-[#741C29]">
                      Attendance
                    </span>
                  </div>

                  {isAdmin && (
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5">
                      <ShieldCheck className="h-4 w-4 text-indigo-600" />
                      <span className="text-xs font-semibold text-indigo-700">
                        Admin View
                      </span>
                    </div>
                  )}

                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                    <Clock3 className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-600">
                      California Time
                    </span>
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  Break History
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  View and monitor employee break activity
                </p>

                <p className="mt-2 text-xs font-medium text-slate-400">
                  Today: {formatDateOnly(todayCalifornia)}
                  {" • "}
                  Namaz 1 • Lunch 1 • Short 3 • Total 5
                </p>
              </div>

              {/* ACTION BUTTONS */}

              <div className="flex flex-wrap gap-2">
                {isAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={openAddModal}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#741C29] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#5f1722]"
                    >
                      <Plus className="h-4 w-4" />
                      Add Break
                    </button>

                    <button
                      type="button"
                      onClick={openClearModal}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-100"
                    >
                      <Eraser className="h-4 w-4" />
                      Reset Limit
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!filteredBreakHistory.length}
                  title="Download the records shown in the table (CSV)"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>

                <button
                  type="button"
                  onClick={() => fetchBreakHistory(true)}
                  disabled={refreshing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>
          </div>

          {/* NOTICE */}

          {pageNotice && (
            <div
              className={`mb-6 flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm ${
                pageNotice.type === "success"
                  ? "border-emerald-100 bg-emerald-50 text-emerald-800"
                  : "border-red-100 bg-red-50 text-red-700"
              }`}
            >
              <div className="flex items-start gap-2">
                {pageNotice.type === "success" ? (
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                )}

                <span className="font-medium">{pageNotice.text}</span>
              </div>

              <button
                type="button"
                onClick={() => setPageNotice(null)}
                className="shrink-0 rounded-lg p-1 transition hover:bg-black/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* POLICY */}

          <div className="mb-6 overflow-hidden rounded-2xl border border-[#741C29]/10 bg-white shadow-sm">
            <div className="flex flex-col gap-5 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50">
                  <Timer className="h-5 w-5 text-[#741C29]" />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Daily Break Policy
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Limits reset every day at 8:00 AM California time, or when
                    an admin resets them.
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <PolicyBadge
                      icon={Moon}
                      text="Namaz: 1"
                      className="border-indigo-100 bg-indigo-50 text-indigo-700"
                    />
                    <PolicyBadge
                      icon={Utensils}
                      text="Lunch: 1"
                      className="border-orange-100 bg-orange-50 text-orange-700"
                    />
                    <PolicyBadge
                      icon={Clock3}
                      text="Short Break: 3"
                      className="border-teal-100 bg-teal-50 text-teal-700"
                    />
                    <PolicyBadge
                      icon={Activity}
                      text="Total: 5"
                      className="border-slate-200 bg-slate-50 text-slate-700"
                    />
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                  <CalendarDays className="h-4 w-4 text-slate-400" />

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      California Date
                    </p>
                    <p className="text-xs font-bold text-slate-700">
                      {formatDateOnly(todayCalifornia)}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2">
                  <Timer className="h-4 w-4 text-indigo-600" />

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      Current Break Window
                    </p>
                    <p className="text-xs font-bold text-indigo-700">
                      {windowLabel}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2">
                  <Clock3 className="h-4 w-4 text-emerald-600" />

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                      Timezone
                    </p>
                    <p className="text-xs font-bold text-emerald-700">
                      America/Los_Angeles
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STATS */}

          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard
              title="Total Breaks"
              value={breakStats.total}
              icon={Activity}
              description="All break records"
              iconClass="bg-rose-50 text-rose-600"
            />
            <StatCard
              title="Namaz"
              value={breakStats.namaz}
              icon={Moon}
              description="Prayer breaks"
              iconClass="bg-indigo-50 text-indigo-600"
            />
            <StatCard
              title="Lunch"
              value={breakStats.lunch}
              icon={Utensils}
              description="Lunch breaks"
              iconClass="bg-orange-50 text-orange-600"
            />
            <StatCard
              title="Short Break"
              value={breakStats.shortBreak}
              icon={Clock3}
              description="Short breaks"
              iconClass="bg-teal-50 text-teal-600"
            />
            <StatCard
              title="Washroom"
              value={breakStats.washroom}
              icon={Bath}
              description="Washroom breaks"
              iconClass="bg-cyan-50 text-cyan-600"
            />
            <StatCard
              title="Other"
              value={breakStats.other}
              icon={Coffee}
              description="Other breaks"
              iconClass="bg-amber-50 text-amber-600"
            />
          </div>

          {/* FILTER */}

          <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="p-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search employee, team, role or break type..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#741C29] focus:bg-white focus:ring-2 focus:ring-[#741C29]/10"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowFilters((prev) => !prev)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 xl:hidden"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      showFilters ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`${
                    showFilters ? "flex" : "hidden"
                  } flex-col gap-3 xl:flex xl:flex-row xl:items-center`}
                >
                  {/* ROLE */}

                  <div className="relative">
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full min-w-[150px] appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-[#741C29] focus:bg-white focus:ring-2 focus:ring-[#741C29]/10"
                    >
                      <option value="All">All Roles</option>

                      {ROLE_OPTIONS.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>

                  {/* BREAK TYPE */}

                  <div className="relative">
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full min-w-[160px] appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-[#741C29] focus:bg-white focus:ring-2 focus:ring-[#741C29]/10"
                    >
                      <option value="All">All Break Types</option>

                      {BREAK_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>

                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full min-w-[165px] rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#741C29] focus:bg-white focus:ring-2 focus:ring-[#741C29]/10"
                    />
                  </div>

                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type="date"
                      value={endDate}
                      min={startDate || undefined}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full min-w-[165px] rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#741C29] focus:bg-white focus:ring-2 focus:ring-[#741C29]/10"
                    />
                  </div>

                  {hasFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <X className="h-4 w-4" />
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {(startDate || endDate) && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                  <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>Date Range: {dateRangeText}</span>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    <Clock3 className="h-3.5 w-3.5" />
                    <span>Total Time: {totalFilteredHours}</span>
                  </div>

                  <div className="text-xs text-slate-400">
                    {filteredBreakHistory.length} record
                    {filteredBreakHistory.length !== 1 ? "s" : ""} found
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* TABLE */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Break Records
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  {filteredBreakHistory.length} record
                  {filteredBreakHistory.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="hidden items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 sm:flex">
                <Users className="h-4 w-4 text-slate-400" />

                <span className="text-xs font-semibold text-slate-600">
                  {filteredBreakHistory.length} Records
                </span>
              </div>
            </div>

            {historyLoading && !breakHistory.length ? (
              <div className="flex h-[420px] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-[#741C29]" />
                  <p className="text-sm text-slate-500">
                    Loading break history...
                  </p>
                </div>
              </div>
            ) : filteredBreakHistory.length === 0 ? (
              <div className="flex h-[420px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                  <Coffee className="h-7 w-7 text-slate-400" />
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  No break records found
                </h3>

                <p className="mt-1 max-w-md text-sm text-slate-500">
                  {hasFilters
                    ? "Try changing your filters or search criteria."
                    : "There are no break records available yet."}
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#741C29] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5f1722]"
                  >
                    <X className="h-4 w-4" />
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* DESKTOP */}

                <div className="hidden max-h-[520px] overflow-auto md:block">
                  <table className="w-full min-w-[1240px]">
                    <thead className="sticky top-0 z-10">
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <TableHeading>Employee</TableHeading>
                        <TableHeading>Role</TableHeading>
                        <TableHeading>Team</TableHeading>
                        <TableHeading>Break Type</TableHeading>
                        <TableHeading>Started</TableHeading>
                        <TableHeading>Ended</TableHeading>
                        <TableHeading align="right">Duration</TableHeading>

                        {isAdmin && (
                          <TableHeading align="right">Actions</TableHeading>
                        )}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredBreakHistory.map((item, index) => (
                        <BreakTableRow
                          key={
                            item?.id ??
                            item?.break_id ??
                            `${item?.started_at}-${index}`
                          }
                          item={item}
                          isAdmin={isAdmin}
                          highlighted={
                            highlightId !== null &&
                            String(item?.id ?? item?.break_id) === highlightId
                          }
                          onEdit={openEditModal}
                          onDelete={deleteBreak}
                          deletingId={deletingId}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE */}

                <div className="max-h-[520px] overflow-y-auto md:hidden">
                  <div className="divide-y divide-slate-100">
                    {filteredBreakHistory.map((item, index) => (
                      <BreakMobileCard
                        key={
                          item?.id ??
                          item?.break_id ??
                          `${item?.started_at}-${index}`
                        }
                        item={item}
                        isAdmin={isAdmin}
                        highlighted={
                          highlightId !== null &&
                          String(item?.id ?? item?.break_id) === highlightId
                        }
                        onEdit={openEditModal}
                        onDelete={deleteBreak}
                        deletingId={deletingId}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* FOOTER */}

          <div className="mt-4 flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>Data automatically refreshes every 5 seconds.</span>

            <span>
              Showing {filteredBreakHistory.length} of {breakHistory.length}{" "}
              records
            </span>
          </div>
        </div>
      </main>

      {/* ADD / EDIT MODAL */}

      {showBreakModal && (
        <BreakModal
          mode={modalMode}
          form={breakForm}
          staffUsers={staffUsers}
          staffLoading={staffLoading}
          saving={savingBreak}
          error={formError}
          success={formSuccess}
          onChange={updateBreakForm}
          onClose={closeBreakModal}
          onSubmit={saveBreak}
        />
      )}

      {/* RESET LIMIT MODAL */}

      {showClearModal && (
        <ClearLogsModal
          staffUsers={staffUsers}
          staffLoading={staffLoading}
          userId={clearUserId}
          usedInWindow={usedInWindow}
          clearing={clearing}
          error={clearError}
          success={clearSuccess}
          windowLabel={windowLabel}
          onUserChange={setClearUserId}
          onClose={closeClearModal}
          onConfirm={handleResetLimit}
        />
      )}
    </div>
  );
}

// =============================================================
// POLICY BADGE
// =============================================================

function PolicyBadge({ icon: Icon, text, className }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold ${className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {text}
    </span>
  );
}

// =============================================================
// ROLE BADGE
// =============================================================

function RoleBadge({ role }) {
  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2 py-1 text-[11px] font-bold ${getRoleStyles(
        role
      )}`}
    >
      {getRoleLabel(role)}
    </span>
  );
}

// =============================================================
// STAT CARD
// =============================================================

function StatCard({ title, value, icon: Icon, description, iconClass }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {title}
          </p>

          <p className="mt-2 truncate text-xl font-bold text-slate-900 sm:text-2xl">
            {value}
          </p>

          <p className="mt-1 truncate text-[11px] text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

// =============================================================
// TABLE HEADING
// =============================================================

function TableHeading({ children, align = "left" }) {
  return (
    <th
      className={`whitespace-nowrap px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

// =============================================================
// DESKTOP ROW
// =============================================================

function BreakTableRow({
  item,
  isAdmin,
  highlighted,
  onEdit,
  onDelete,
  deletingId,
}) {
  const employeeName =
    item?.employee_name || item?.user_name || item?.name || "Unknown Employee";

  const employeeEmail =
    item?.employee_email || item?.user_email || item?.email || "";

  const team = item?.team || item?.department || item?.team_name || "—";

  const breakType = normalizeBreakType(item);
  const TypeIcon = getTypeIcon(breakType);
  const styles = getTypeStyles(breakType);
  const active = isActiveBreak(item);
  const duration = getLiveDuration(item);
  const id = item?.id ?? item?.break_id;

  return (
    <tr
      className={`group transition ${
        highlighted ? "bg-emerald-50/80" : "hover:bg-slate-50/70"
      }`}
    >
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-bold text-slate-600">
            {employeeName.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-800">
              {employeeName}
            </p>

            {employeeEmail && (
              <p className="mt-0.5 truncate text-xs text-slate-400">
                {employeeEmail}
              </p>
            )}
          </div>
        </div>
      </td>

      <td className="whitespace-nowrap px-5 py-4">
        <RoleBadge role={item?.role} />
      </td>

      <td className="px-5 py-4">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          {team}
        </span>
      </td>

      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-bold ${styles.bg} ${styles.text} ${styles.border}`}
        >
          <TypeIcon className="h-3.5 w-3.5" />
          {breakType}
        </span>
      </td>

      <td className="whitespace-nowrap px-5 py-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock3 className="h-4 w-4 shrink-0 text-slate-400" />
          {formatDateTime(item?.started_at)}
        </div>
      </td>

      <td className="whitespace-nowrap px-5 py-4">
        {active ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Active
          </span>
        ) : (
          <span className="text-sm text-slate-600">
            {formatDateTime(item?.ended_at)}
          </span>
        )}
      </td>

      <td className="whitespace-nowrap px-5 py-4 text-right">
        <span
          className={`text-sm font-bold ${
            active ? "text-emerald-600" : "text-slate-800"
          }`}
        >
          {formatDuration(duration)}
        </span>
      </td>

      {isAdmin && (
        <td className="whitespace-nowrap px-5 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
              title="Edit break"
            >
              <Pencil className="h-4 w-4" />
            </button>

            <button
              type="button"
              disabled={deletingId === id}
              onClick={() => onDelete(item)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              title="Delete break"
            >
              {deletingId === id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}

// =============================================================
// MOBILE CARD
// =============================================================

function BreakMobileCard({
  item,
  isAdmin,
  highlighted,
  onEdit,
  onDelete,
  deletingId,
}) {
  const employeeName =
    item?.employee_name || item?.user_name || item?.name || "Unknown Employee";

  const employeeEmail =
    item?.employee_email || item?.user_email || item?.email || "";

  const team = item?.team || item?.department || item?.team_name || "—";

  const breakType = normalizeBreakType(item);
  const TypeIcon = getTypeIcon(breakType);
  const styles = getTypeStyles(breakType);
  const active = isActiveBreak(item);
  const duration = getLiveDuration(item);
  const id = item?.id ?? item?.break_id;

  return (
    <div className={`p-4 ${highlighted ? "bg-emerald-50/80" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-bold text-slate-600">
            {employeeName.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-800">
              {employeeName}
            </p>

            {employeeEmail && (
              <p className="truncate text-xs text-slate-400">
                {employeeEmail}
              </p>
            )}
          </div>
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-bold ${styles.bg} ${styles.text} ${styles.border}`}
        >
          <TypeIcon className="h-3 w-3" />
          {breakType}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <RoleBadge role={item?.role} />

        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          {team}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
        <span>{formatDateOnly(item?.started_at)}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Started
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-700">
            {formatDateTime(item?.started_at)}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Ended
          </p>

          {active ? (
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Active
            </p>
          ) : (
            <p className="mt-1 text-xs font-semibold text-slate-700">
              {formatDateTime(item?.ended_at)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-3">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-slate-400" />

          <span className="text-xs font-semibold text-slate-500">
            Duration
          </span>
        </div>

        <span
          className={`text-sm font-bold ${
            active ? "text-emerald-600" : "text-slate-800"
          }`}
        >
          {formatDuration(duration)}
        </span>
      </div>

      {isAdmin && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>

          <button
            type="button"
            disabled={deletingId === id}
            onClick={() => onDelete(item)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
          >
            {deletingId === id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// =============================================================
// ROLE FILTER SELECT (used inside the modals)
// =============================================================

function RoleFilterSelect({ value, onChange, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-[#741C29] focus:bg-white focus:ring-2 focus:ring-[#741C29]/10 disabled:opacity-60"
      >
        <option value="All">All Roles</option>

        {ROLE_OPTIONS.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function filterStaffByRole(users, role) {
  if (role === "All") return users;

  return users.filter((user) => roleKey(user?.role) === role);
}

function staffOptionLabel(user) {
  const role = user?.role ? ` (${getRoleLabel(user.role)})` : "";
  const team = user?.team ? ` — ${user.team}` : "";

  return `${user?.name || "Unnamed"}${role}${team}`;
}

// =============================================================
// ADD / EDIT BREAK MODAL
// =============================================================

function BreakModal({
  mode,
  form,
  staffUsers,
  staffLoading,
  saving,
  error,
  success,
  onChange,
  onClose,
  onSubmit,
}) {
  const [roleFilter, setRoleFilter] = useState("All");

  const visibleStaff = useMemo(
    () => filterStaffByRole(staffUsers, roleFilter),
    [staffUsers, roleFilter]
  );

  const editUser = staffUsers.find(
    (user) => String(user?.id) === String(form.user_id)
  );

  const handleRoleChange = (value) => {
    setRoleFilter(value);

    // drop the chosen employee if they are not in the new role list
    const stillThere = filterStaffByRole(staffUsers, value).some(
      (user) => String(user?.id) === String(form.user_id)
    );

    if (!stillThere) onChange("user_id", "");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
              {mode === "add" ? (
                <Plus className="h-5 w-5 text-[#741C29]" />
              ) : (
                <Pencil className="h-5 w-5 text-[#741C29]" />
              )}
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                {mode === "add" ? "Add Break" : "Edit Break"}
              </h2>

              <p className="text-xs text-slate-400">California timezone</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY */}

        <form onSubmit={onSubmit} className="p-5">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* USER */}

          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Employee
            </label>

            {mode === "edit" ? (
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <User className="h-4 w-4 text-slate-400" />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {editUser?.name || "Current Employee"}
                  </p>

                  <p className="text-[11px] text-slate-400">
                    Employee cannot be changed while editing
                  </p>
                </div>

                {editUser?.role && <RoleBadge role={editUser.role} />}
              </div>
            ) : (
              <div className="space-y-2">
                <RoleFilterSelect
                  value={roleFilter}
                  onChange={handleRoleChange}
                  disabled={staffLoading || saving}
                />

                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <select
                    value={form.user_id}
                    onChange={(e) => onChange("user_id", e.target.value)}
                    disabled={staffLoading || saving}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pl-10 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-[#741C29] focus:ring-2 focus:ring-[#741C29]/10 disabled:bg-slate-50"
                  >
                    <option value="">
                      {staffLoading
                        ? "Loading employees..."
                        : visibleStaff.length === 0
                        ? "No employees for this role"
                        : "Select employee"}
                    </option>

                    {visibleStaff.map((user) => (
                      <option key={user.id} value={user.id}>
                        {staffOptionLabel(user)}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            )}
          </div>

          {/* BREAK TYPE */}

          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Break Type
            </label>

            <div className="relative">
              <select
                value={form.status}
                onChange={(e) => onChange("status", e.target.value)}
                disabled={saving}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-[#741C29] focus:ring-2 focus:ring-[#741C29]/10 disabled:bg-slate-50"
              >
                <option value="Namaz Break">Namaz</option>
                <option value="Lunch Break">Lunch</option>
                <option value="Short Break">Short Break</option>
                <option value="Washroom Break">Washroom</option>
                <option value="Other">Other</option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* START */}

          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Start Date & Time
            </label>

            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="datetime-local"
                value={form.started_at}
                onChange={(e) => onChange("started_at", e.target.value)}
                disabled={saving}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-10 text-sm font-medium text-slate-700 outline-none transition focus:border-[#741C29] focus:ring-2 focus:ring-[#741C29]/10 disabled:bg-slate-50"
              />
            </div>

            <p className="mt-1 text-[10px] text-slate-400">
              Enter California local time.
            </p>
          </div>

          {/* END */}

          <div className="mb-5">
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                End Date & Time
              </label>

              <span className="text-[10px] font-medium text-slate-400">
                Optional
              </span>
            </div>

            <div className="relative">
              <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="datetime-local"
                value={form.ended_at}
                min={form.started_at || undefined}
                onChange={(e) => onChange("ended_at", e.target.value)}
                disabled={saving}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-10 text-sm font-medium text-slate-700 outline-none transition focus:border-[#741C29] focus:ring-2 focus:ring-[#741C29]/10 disabled:bg-slate-50"
              />
            </div>

            <p className="mt-1 text-[10px] text-slate-400">
              Leave empty to keep the break active.
            </p>
          </div>

          {/* INFO */}

          <div className="mb-5 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-3">
            <div className="flex items-start gap-2">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />

              <div>
                <p className="text-xs font-bold text-indigo-800">
                  California Time
                </p>

                <p className="mt-0.5 text-[11px] leading-5 text-indigo-600">
                  Selected date and time are saved exactly as entered using
                  America/Los_Angeles. The employee is notified and their
                  break counter updates automatically.
                </p>
              </div>
            </div>
          </div>

          {/* BUTTONS */}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#741C29] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#5f1722] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {mode === "add" ? "Add Break" : "Save Changes"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =============================================================
// RESET BREAK LIMIT MODAL
// History is kept. The count for the current 8 AM window restarts.
// =============================================================

function ClearLogsModal({
  staffUsers,
  staffLoading,
  userId,
  usedInWindow,
  clearing,
  error,
  success,
  windowLabel,
  onUserChange,
  onClose,
  onConfirm,
}) {
  const [roleFilter, setRoleFilter] = useState("All");

  const visibleStaff = useMemo(
    () => filterStaffByRole(staffUsers, roleFilter),
    [staffUsers, roleFilter]
  );

  const handleRoleChange = (value) => {
    setRoleFilter(value);

    if (userId !== "all") {
      const stillThere = filterStaffByRole(staffUsers, value).some(
        (user) => String(user?.id) === String(userId)
      );

      if (!stillThere) onUserChange("all");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
              <Eraser className="h-5 w-5 text-[#741C29]" />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Reset Break Limit
              </h2>

              <p className="text-xs text-slate-400">
                Restart the break count for the current 8 AM window
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={clearing}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY */}

        <div className="p-5">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* EMPLOYEE */}

          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Employee
            </label>

            <div className="space-y-2">
              <RoleFilterSelect
                value={roleFilter}
                onChange={handleRoleChange}
                disabled={staffLoading || clearing}
              />

              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <select
                  value={userId}
                  onChange={(e) => onUserChange(e.target.value)}
                  disabled={staffLoading || clearing}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pl-10 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-[#741C29] focus:ring-2 focus:ring-[#741C29]/10 disabled:bg-slate-50"
                >
                  <option value="all">All Employees</option>

                  {visibleStaff.map((user) => (
                    <option key={user.id} value={user.id}>
                      {staffOptionLabel(user)}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          {/* INFO */}

          <div className="mb-3 flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-3">
            <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />

            <div>
              <p className="text-sm font-bold text-indigo-800">
                {usedInWindow} break{usedInWindow !== 1 ? "s" : ""} counted in
                the current break window
              </p>

              <p className="mt-0.5 text-[11px] leading-5 text-indigo-600">
                Window: {windowLabel}. After reset the count starts again from
                0. The employee can take Namaz 1, Lunch 1 and Short 3 breaks.
              </p>
            </div>
          </div>

          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

            <p className="text-[11px] leading-5 text-emerald-700">
              Break history is <span className="font-bold">not deleted</span>.
              All old records stay in the table.
            </p>
          </div>

          {/* BUTTONS */}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={clearing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={clearing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#741C29] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#5f1722] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {clearing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <Eraser className="h-4 w-4" />
                  Reset Break Limit
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
