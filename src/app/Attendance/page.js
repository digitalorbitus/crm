"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  Search,
  Download,
  Users,
  UserCheck,
  Clock3,
  AlertCircle,
  ChevronDown,
  RefreshCw,
  FileText,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  AlertTriangle,
  Eye,
  EyeOff,
  Settings2,
  Wallet,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";

/* =========================================================
   CONSTANTS
========================================================= */

const CALIFORNIA_TIMEZONE = "America/Los_Angeles";

const HIDDEN_ATTENDANCE_STORAGE_KEY = "crm_hidden_attendance_records";

const INPUT_CLASS =
  "w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:bg-white focus:border-[#741C29] focus:ring-4 focus:ring-[#741C29]/10";

const TH_CLASS =
  "px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500";

/* =========================================================
   DATE / TIME HELPERS
========================================================= */

function getCaliforniaDateInput() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CALIFORNIA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = {};

  parts.forEach((part) => {
    if (part.type !== "literal") values[part.type] = part.value;
  });

  return `${values.year}-${values.month}-${values.day}`;
}

function getCaliforniaMonthStart() {
  return `${getCaliforniaDateInput().slice(0, 8)}01`;
}

function normalizeDateOnly(value) {
  if (!value) return "";

  const match = String(value).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) return "";

  return `${match[1]}-${match[2]}-${match[3]}`;
}

function parseDbDateTime(value) {
  const text = String(value ?? "").trim();

  const match = text.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/
  );

  if (!match) return null;

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4] || 0),
    minute: Number(match[5] || 0),
    second: Number(match[6] || 0),
  };
}

function formatCaliforniaDate(value) {
  if (!value) return "-";

  const dateOnly = normalizeDateOnly(value);

  if (dateOnly) {
    const [year, month, day] = dateOnly.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }).format(date);
    }
  }

  const p = parseDbDateTime(value);

  if (!p) return "-";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(p.year, p.month - 1, p.day));
}

function getDayName(value) {
  const dateOnly = normalizeDateOnly(value);

  if (!dateOnly) return "-";

  const [year, month, day] = dateOnly.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
}

function formatCaliforniaTime(value) {
  const p = parseDbDateTime(value);

  if (!p) return "-";

  const suffix = p.hour >= 12 ? "PM" : "AM";
  const hour12 = p.hour % 12 || 12;

  return `${hour12}:${String(p.minute).padStart(2, "0")}:${String(
    p.second
  ).padStart(2, "0")} ${suffix}`;
}

function toDateTimeLocal(value) {
  const p = parseDbDateTime(value);

  if (!p) return "";

  return [
    String(p.year).padStart(4, "0"),
    "-",
    String(p.month).padStart(2, "0"),
    "-",
    String(p.day).padStart(2, "0"),
    "T",
    String(p.hour).padStart(2, "0"),
    ":",
    String(p.minute).padStart(2, "0"),
    ":",
    String(p.second).padStart(2, "0"),
  ].join("");
}

function formatDuration(seconds) {
  if (
    seconds === null ||
    seconds === undefined ||
    Number.isNaN(Number(seconds))
  ) {
    return "-";
  }

  const total = Math.max(0, Number(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;

  return `${secs}s`;
}

/* =========================================================
   STATUS
========================================================= */

function getStatus(row) {
  const raw = String(row?.attendance_status || row?.status || "")
    .trim()
    .toLowerCase();

  if (raw === "off" || raw === "weekend off" || raw === "weekend") {
    return "OFF";
  }

  if (raw === "absent" || raw.includes("absent")) return "Absent";

  if (raw === "late" || raw.includes("late")) return "Late";

  return "Present";
}

/* =========================================================
   MONEY
========================================================= */

function money(value) {
  if (value === null || value === undefined || value === "") return "-";

  const number = Number(String(value).replace(/,/g, ""));

  if (!Number.isNaN(number)) return number.toLocaleString("en-US");

  return String(value);
}

/* =========================================================
   FORM DEFAULTS
========================================================= */

function getDefaultForm() {
  return {
    user_id: "",
    login_time: `${getCaliforniaDateInput()}T08:00:00`,
    logout_time: "",
    ip_address: "",
    user_agent: "",
  };
}

function getDefaultSalaryForm() {
  return {
    user_id: "",
    basic_salary: "",
    attendance_allowance: "",
  };
}

/* =========================================================
   COMPONENT
========================================================= */

export default function AttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [weekendOffDays, setWeekendOffDays] = useState([]);

  const [attendanceCounts, setAttendanceCounts] = useState({
    total: 0,
    on_time: 0,
    late: 0,
    absent: 0,
    off: 0,
  });

  const [attendanceUsers, setAttendanceUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [staff, setStaff] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ---------- filters ---------- */

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [teamFilter, setTeamFilter] = useState("All Teams");
  const [userFilter, setUserFilter] = useState("All Users");

  const [fromDate, setFromDate] = useState(getCaliforniaMonthStart());
  const [toDate, setToDate] = useState(getCaliforniaDateInput());

  /* ---------- hidden rows ---------- */

  const [hiddenAttendanceIds, setHiddenAttendanceIds] = useState([]);
  const [showHiddenMenu, setShowHiddenMenu] = useState(false);

  /* ---------- attendance modal ---------- */

  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState(getDefaultForm());
  const [saving, setSaving] = useState(false);

  /* ---------- delete modal ---------- */

  const [deleteRecord, setDeleteRecord] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ---------- salary modal ---------- */

  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [salaryForm, setSalaryForm] = useState(getDefaultSalaryForm());
  const [savingSalary, setSavingSalary] = useState(false);
  const [salaryError, setSalaryError] = useState("");

  /* ---------- admin ---------- */

  const isAdmin = String(currentUser?.role || "").toLowerCase() === "admin";

  /* =======================================================
     HIDDEN ROWS (localStorage)
  ======================================================= */

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HIDDEN_ATTENDANCE_STORAGE_KEY);

      if (!saved) {
        setHiddenAttendanceIds([]);
        return;
      }

      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setHiddenAttendanceIds(
          parsed.map((id) => String(id)).filter(Boolean)
        );
      }
    } catch (err) {
      console.error("HIDDEN ATTENDANCE LOAD ERROR:", err);
      setHiddenAttendanceIds([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        HIDDEN_ATTENDANCE_STORAGE_KEY,
        JSON.stringify(hiddenAttendanceIds)
      );
    } catch (err) {
      console.error("HIDDEN ATTENDANCE SAVE ERROR:", err);
    }
  }, [hiddenAttendanceIds]);

  function hideAttendanceRecord(row) {
    if (!row?.id || row?.row_type === "weekend_off") return;

    const id = String(row.id);

    setHiddenAttendanceIds((prev) =>
      prev.includes(id) ? prev : [...prev, id]
    );

    setSuccess(`${row.name || "Attendance record"} hidden from the table.`);
    setShowHiddenMenu(false);
  }

  function unhideAttendanceRecord(id) {
    const recordId = String(id);

    setHiddenAttendanceIds((prev) =>
      prev.filter((item) => String(item) !== recordId)
    );

    setSuccess("Attendance record shown again.");
  }

  function unhideAllAttendance() {
    setHiddenAttendanceIds([]);
    setSuccess("All hidden attendance records are visible again.");
  }

  /* =======================================================
     LOAD CURRENT USER
  ======================================================= */

  const loadCurrentUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data?.user) {
        window.location.href = "/login";
        return null;
      }

      setCurrentUser(data.user);

      return data.user;
    } catch (err) {
      console.error(err);
      window.location.href = "/login";
      return null;
    }
  }, []);

  /* =======================================================
     LOAD STAFF
  ======================================================= */

  const loadStaff = useCallback(async () => {
    try {
      const response = await fetch("/api/staffes/list", {
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) return;

      const data = await response.json();

      const list = Array.isArray(data?.staffes)
        ? data.staffes
        : Array.isArray(data?.staff)
        ? data.staff
        : Array.isArray(data?.users)
        ? data.users
        : Array.isArray(data?.data)
        ? data.data
        : [];

      const normalized = list
        .map((item) => ({
          id: item.id,
          name: item.name || item.full_name || item.fullName || "Unknown",
          email: item.email || "",
          team: item.team || "",
          role: item.role || "",
        }))
        .filter((item) => item.id);

      setStaff(normalized);
    } catch (err) {
      console.error("STAFF LOAD ERROR:", err);
    }
  }, []);

  /* =======================================================
     USER OPTIONS
  ======================================================= */

  const userOptions = useMemo(() => {
    const map = new Map();

    if (Array.isArray(attendanceUsers)) {
      attendanceUsers.forEach((user) => {
        if (!user) return;

        if (typeof user === "number" || typeof user === "string") {
          const id = String(user);
          const employee = staff.find((item) => String(item.id) === id);

          if (employee) map.set(id, employee);

          return;
        }

        if (user.id) {
          map.set(String(user.id), {
            id: user.id,
            name: user.name || user.full_name || "Unknown",
            email: user.email || "",
            team: user.team || "",
            role: user.role || "",
          });
        }
      });
    }

    staff.forEach((employee) => {
      if (!employee?.id) return;

      const id = String(employee.id);

      if (!map.has(id)) map.set(id, employee);
    });

    return Array.from(map.values()).sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || ""))
    );
  }, [attendanceUsers, staff]);

  /* =======================================================
     LOAD ATTENDANCE
  ======================================================= */

  const loadAttendance = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) setLoading(true);
        else setRefreshing(true);

        setError("");

        if (fromDate && toDate && fromDate > toDate) {
          throw new Error("From date cannot be after To date.");
        }

        const params = new URLSearchParams();

        if (fromDate) params.set("from", fromDate);
        if (toDate) params.set("to", toDate);

        if (isAdmin && userFilter !== "All Users") {
          const selectedId = Number(userFilter);

          if (Number.isInteger(selectedId) && selectedId > 0) {
            params.set("user_id", String(selectedId));
          }
        }

        params.set("_", String(Date.now()));

        const response = await fetch(
          `/api/login-history?${params.toString()}`,
          {
            credentials: "include",
            cache: "no-store",
            headers: { "Cache-Control": "no-cache" },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load attendance");
        }

        const history = Array.isArray(data?.history) ? data.history : [];
        const offDays = Array.isArray(data?.off_days) ? data.off_days : [];
        const users = Array.isArray(data?.attendance_users)
          ? data.attendance_users
          : [];

        setAttendance(history);
        setWeekendOffDays(offDays);
        setAttendanceUsers(users);

        setAttendanceCounts({
          total: Number(data?.counts?.total || 0),
          on_time: Number(data?.counts?.on_time || 0),
          late: Number(data?.counts?.late || 0),
          absent: Number(data?.counts?.absent || 0),
          off: Number(data?.counts?.off ?? offDays.length ?? 0),
        });
      } catch (err) {
        console.error("ATTENDANCE LOAD ERROR:", err);

        setError(err?.message || "Failed to load attendance");
        setAttendance([]);
        setWeekendOffDays([]);

        setAttendanceCounts({
          total: 0,
          on_time: 0,
          late: 0,
          absent: 0,
          off: 0,
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fromDate, toDate, isAdmin, userFilter]
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function init() {
      const user = await loadCurrentUser();

      if (!mounted || !user) return;

      if (String(user.role || "").toLowerCase() === "admin") {
        await loadStaff();
      }

      if (!mounted) return;

      await loadAttendance(true);
    }

    init();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadCurrentUser, loadStaff]);

  useEffect(() => {
    if (!currentUser) return;

    loadAttendance(false);
  }, [currentUser, fromDate, toDate, userFilter, loadAttendance]);

  /* =======================================================
     WEEKEND OFF EMPLOYEES
  ======================================================= */

  const weekendEmployees = useMemo(() => {
    let employees = [];

    if (isAdmin) {
      employees = staff
        .filter((employee) => {
          if (userFilter !== "All Users") {
            return String(employee.id) === String(userFilter);
          }

          if (attendanceUsers.length === 0) return true;

          return attendanceUsers.some((item) => {
            const id = typeof item === "object" ? item?.id : item;

            return String(id) === String(employee.id);
          });
        })
        .map((employee) => ({
          id: employee.id,
          name: employee.name || "Unknown Employee",
          email: employee.email || "",
          team: employee.team || "",
          role: employee.role || "",
        }));
    }

    if (!isAdmin && currentUser?.id) {
      employees = [
        {
          id: currentUser.id,
          name: currentUser.name || currentUser.full_name || "Current User",
          email: currentUser.email || "",
          team: currentUser.team || "",
          role: currentUser.role || "",
        },
      ];
    }

    if (employees.length === 0) {
      const employeeMap = new Map();

      attendance.forEach((row) => {
        if (!row.user_id) return;

        const key = String(row.user_id);

        if (!employeeMap.has(key)) {
          employeeMap.set(key, {
            id: row.user_id,
            name: row.name || "Unknown Employee",
            email: row.email || "",
            team: row.team || "",
            role: row.role || "",
          });
        }
      });

      employees = Array.from(employeeMap.values());
    }

    return employees;
  }, [isAdmin, staff, attendanceUsers, currentUser, attendance, userFilter]);

  /* =======================================================
     WEEKEND OFF ROWS
  ======================================================= */

  const weekendRows = useMemo(() => {
    if (!Array.isArray(weekendOffDays)) return [];

    const rows = [];

    weekendOffDays.forEach((offDay) => {
      const date = normalizeDateOnly(offDay?.date);

      if (!date) return;

      weekendEmployees.forEach((employee) => {
        rows.push({
          id: null,
          row_type: "weekend_off",
          user_id: employee.id,
          name: employee.name,
          email: employee.email,
          team: employee.team,
          role: employee.role,
          attendance_date: date,
          day_name: offDay?.day || getDayName(date),
          login_time: null,
          logout_time: null,
          duration_seconds: null,
          attendance_status: "OFF",
          status: "OFF",
        });
      });
    });

    return rows;
  }, [weekendOffDays, weekendEmployees]);

  /* =======================================================
     COMBINED / TEAMS / FILTERED / VISIBLE
  ======================================================= */

  const combinedAttendance = useMemo(() => {
    const rows = [...attendance, ...weekendRows];

    return rows.sort((a, b) => {
      const dateA = normalizeDateOnly(a.attendance_date || a.login_time);
      const dateB = normalizeDateOnly(b.attendance_date || b.login_time);

      if (dateA !== dateB) return dateB.localeCompare(dateA);

      return Number(a.user_id || 0) - Number(b.user_id || 0);
    });
  }, [attendance, weekendRows]);

  const teams = useMemo(() => {
    const uniqueTeams = new Set();

    combinedAttendance.forEach((row) => {
      const team = String(row.team || "").trim();

      if (team) uniqueTeams.add(team);
    });

    return Array.from(uniqueTeams).sort((a, b) => a.localeCompare(b));
  }, [combinedAttendance]);

  const filteredAttendance = useMemo(() => {
    const term = search.trim().toLowerCase();

    return combinedAttendance.filter((row) => {
      const status = getStatus(row);
      const rowTeam = String(row.team || "").trim();

      const matchesSearch =
        !term ||
        String(row.name || "").toLowerCase().includes(term) ||
        String(row.email || "").toLowerCase().includes(term) ||
        String(row.team || "").toLowerCase().includes(term) ||
        String(row.day_name || "").toLowerCase().includes(term) ||
        String(row.attendance_status || "").toLowerCase().includes(term);

      const matchesStatus = statusFilter === "All" || status === statusFilter;

      const matchesTeam = teamFilter === "All Teams" || rowTeam === teamFilter;

      return matchesSearch && matchesStatus && matchesTeam;
    });
  }, [combinedAttendance, search, statusFilter, teamFilter]);

  const visibleAttendance = useMemo(() => {
    return filteredAttendance.filter((row) => {
      if (row.row_type === "weekend_off") return true;

      /* Absent rows have id = null and must stay visible */
      if (!row.id) return true;

      return !hiddenAttendanceIds.includes(String(row.id));
    });
  }, [filteredAttendance, hiddenAttendanceIds]);

  const hiddenRecords = useMemo(() => {
    return attendance.filter(
      (row) => row.id && hiddenAttendanceIds.includes(String(row.id))
    );
  }, [attendance, hiddenAttendanceIds]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    let totalSeconds = 0;

    attendance.forEach((row) => {
      if (
        row.duration_seconds !== null &&
        row.duration_seconds !== undefined
      ) {
        totalSeconds += Number(row.duration_seconds) || 0;
      }
    });

    return {
      total: Number(attendanceCounts.total || attendance.length),
      present: Number(attendanceCounts.on_time || 0),
      late: Number(attendanceCounts.late || 0),
      absent: Number(attendanceCounts.absent || 0),
      off: Number(attendanceCounts.off ?? weekendOffDays.length ?? 0),
      totalHours: Math.round((totalSeconds / 3600) * 10) / 10,
    };
  }, [attendance, attendanceCounts, weekendOffDays]);

  /* =======================================================
     ATTENDANCE MODAL
  ======================================================= */

  function openAddModal() {
    if (!isAdmin) return;

    setEditingRecord(null);

    setForm({
      ...getDefaultForm(),
      user_id:
        userFilter !== "All Users"
          ? String(userFilter)
          : staff.length > 0
          ? String(staff[0].id)
          : "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function openEditModal(row) {
    if (!isAdmin || row?.row_type === "weekend_off") return;

    const employeeId = String(row.user_id || "");

    /* make sure the employee exists in the staff dropdown */
    if (employeeId) {
      setStaff((prev) => {
        const alreadyExists = prev.some(
          (employee) => String(employee.id) === employeeId
        );

        if (alreadyExists) return prev;

        return [
          {
            id: row.user_id,
            name: row.name || "Current Employee",
            email: row.email || "",
            team: row.team || "",
            role: row.role || "",
          },
          ...prev,
        ];
      });
    }

    /* Absent row: login_time is null -> default 08:00 on the SAME date */
    const attendanceDate = normalizeDateOnly(row.attendance_date);

    const defaultLogin = attendanceDate ? `${attendanceDate}T08:00:00` : "";

    setEditingRecord(row);

    setForm({
      user_id: employeeId,
      login_time: row.login_time
        ? toDateTimeLocal(row.login_time)
        : defaultLogin,
      logout_time: row.logout_time ? toDateTimeLocal(row.logout_time) : "",
      ip_address: row.ip_address || "",
      user_agent: row.user_agent || "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingRecord(null);
    setForm(getDefaultForm());
  }

  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();

    if (!isAdmin) return;

    if (!form.user_id) {
      setError("Please select employee.");
      return;
    }

    if (!form.login_time) {
      setError("Please select login time.");
      return;
    }

    if (form.logout_time && form.logout_time < form.login_time) {
      setError("Logout time cannot be before login time.");
      return;
    }

    /* Absent row keeps its own date; normal record derives it from login */
    const attendanceDate = editingRecord?.attendance_date
      ? normalizeDateOnly(editingRecord.attendance_date)
      : normalizeDateOnly(form.login_time);

    if (!attendanceDate) {
      setError("Invalid attendance date.");
      return;
    }

    const loginDate = normalizeDateOnly(form.login_time);

    if (loginDate && loginDate !== attendanceDate) {
      setError(`Login date must be ${attendanceDate}.`);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        user_id: Number(form.user_id),
        attendance_date: attendanceDate,
        login_time: form.login_time ? form.login_time.replace("T", " ") : null,
        logout_time: form.logout_time
          ? form.logout_time.replace("T", " ")
          : null,
        ip_address: form.ip_address || null,
        user_agent: form.user_agent || null,
      };

      let response;

      if (editingRecord) {
        /* Absent generated row has id = null (do NOT use Number(null) = 0) */
        response = await fetch("/api/login-history", {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            id: editingRecord?.id ? Number(editingRecord.id) : null,
          }),
        });
      } else {
        response = await fetch("/api/login-history", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to save attendance");
      }

      setSuccess(
        editingRecord
          ? "Attendance updated successfully."
          : "Attendance added successfully."
      );

      setShowModal(false);
      setEditingRecord(null);
      setForm(getDefaultForm());

      await loadAttendance(false);
    } catch (err) {
      console.error("SAVE ATTENDANCE ERROR:", err);
      setError(err?.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     DELETE
  ======================================================= */

  function openDeleteConfirm(row) {
    if (!isAdmin || row?.row_type === "weekend_off") return;

    /* Absent row has no DB id, nothing to delete */
    if (!row?.id) {
      setError(
        "This Absent row has no attendance record to delete. You can edit it instead."
      );
      return;
    }

    setError("");
    setSuccess("");
    setDeleteRecord(row);
  }

  function closeDeleteConfirm() {
    if (deleting) return;

    setDeleteRecord(null);
  }

  async function handleDelete() {
    if (!isAdmin || !deleteRecord?.id) return;

    const attendanceId = Number(deleteRecord.id);

    if (!Number.isInteger(attendanceId) || attendanceId <= 0) {
      setError("Invalid attendance record ID.");
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/login-history?id=${encodeURIComponent(attendanceId)}`,
        {
          method: "DELETE",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete attendance");
      }

      setHiddenAttendanceIds((prev) =>
        prev.filter((id) => String(id) !== String(attendanceId))
      );

      setDeleteRecord(null);
      setSuccess("Attendance deleted permanently.");

      await loadAttendance(false);
    } catch (err) {
      console.error("DELETE ATTENDANCE ERROR:", err);
      setError(err?.message || "Failed to delete attendance");
    } finally {
      setDeleting(false);
    }
  }

  /* =======================================================
     SALARY SETUP (Basic Salary + Attendance Allowance)
  ======================================================= */

  function getEmployeeSalary(userId) {
    const id = String(userId);

    /* attendance_users always has every employee, even without rows */
    const fromUsers = attendanceUsers.find(
      (item) => item && typeof item === "object" && String(item.id) === id
    );

    const fromRows = attendance.find((row) => String(row.user_id) === id);

    const source = fromUsers || fromRows || {};

    return {
      basic_salary: Number(source.basic_salary || 0),
      attendance_allowance: Number(source.attendance_allowance || 0),
    };
  }

  function fillSalaryForm(userId) {
    const salary = getEmployeeSalary(userId);

    setSalaryForm({
      user_id: String(userId || ""),
      basic_salary: String(salary.basic_salary),
      attendance_allowance: String(salary.attendance_allowance),
    });
  }

  function openSalaryModal() {
    if (!isAdmin) return;

    const firstId =
      userFilter !== "All Users"
        ? String(userFilter)
        : String(userOptions[0]?.id || "");

    fillSalaryForm(firstId);

    setSalaryError("");
    setError("");
    setSuccess("");
    setShowSalaryModal(true);
  }

  function closeSalaryModal() {
    if (savingSalary) return;

    setShowSalaryModal(false);
    setSalaryError("");
  }

  async function handleSaveSalary(e) {
    e.preventDefault();

    if (!isAdmin) return;

    if (!salaryForm.user_id) {
      setSalaryError("Please select employee.");
      return;
    }

    const basic = Number(salaryForm.basic_salary || 0);
    const allowance = Number(salaryForm.attendance_allowance || 0);

    if (
      !Number.isFinite(basic) ||
      basic < 0 ||
      !Number.isFinite(allowance) ||
      allowance < 0
    ) {
      setSalaryError("Salary values must be 0 or more.");
      return;
    }

    try {
      setSavingSalary(true);
      setSalaryError("");

      const response = await fetch("/api/employee-salary", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Number(salaryForm.user_id),
          basic_salary: basic,
          attendance_allowance: allowance,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to save salary");
      }

      setShowSalaryModal(false);
      setSuccess("Salary saved successfully.");

      await loadAttendance(false);
    } catch (err) {
      console.error("SAVE SALARY ERROR:", err);
      setSalaryError(err?.message || "Failed to save salary");
    } finally {
      setSavingSalary(false);
    }
  }

  /* =======================================================
     PDF EXPORT
  ======================================================= */

  async function exportPDF() {
    try {
      setError("");

      const jsPDFModule = await import("jspdf");
      const autoTableModule = await import("jspdf-autotable");

      const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
      const autoTable = autoTableModule.default || autoTableModule.autoTable;

      if (typeof jsPDF !== "function" || typeof autoTable !== "function") {
        throw new Error("PDF libraries are not available.");
      }

      const rows = visibleAttendance || [];

      if (rows.length === 0) {
        setError("There are no attendance records to export.");
        return;
      }

      /* salary slip is for ONE employee, so it must not mix people */
      const employeeIdsInRows = new Set(
        rows
          .filter((row) => row.row_type !== "weekend_off")
          .map((row) => String(row.user_id))
      );

      if (employeeIdsInRows.size > 1) {
        setError(
          "Please select one employee (User filter) before exporting the salary slip."
        );
        return;
      }

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      /* ---------- colors ---------- */

      const RED = [204, 0, 0];
      const WHITE = [255, 255, 255];
      const BLACK = [0, 0, 0];
      const GREEN = [0, 128, 0];
      const BORDER = [190, 190, 190];
      const LIGHT_GRAY = [245, 245, 245];

      /* ---------- employee ---------- */

      const firstEmployee =
        rows.find((row) => row.row_type !== "weekend_off") || rows[0] || {};

      const employeeId =
        firstEmployee.user_id ||
        firstEmployee.employee_id ||
        firstEmployee.emp_id ||
        "-";

      const employeeName = firstEmployee.name || "-";

      const payroll = firstEmployee.payroll || `${fromDate} to ${toDate}`;

      const campaign = firstEmployee.campaign || firstEmployee.team || "DO";

      const agentWD = firstEmployee.agent_wd || firstEmployee.agentWD || "M WD";

      const getRowStatus = (row) =>
        row.row_type === "weekend_off" ? "OFF" : getStatus(row);

      /* ---------- stats ---------- */

      const presentCount = Number(stats?.present ?? 0);
      const lateCount = Number(stats?.late ?? 0);
      const absentCount = Number(stats?.absent ?? 0);
      const weekendCount = Number(stats?.off ?? 0);
      const totalHours = stats?.totalHours ?? 0;

      const workingDays = presentCount + lateCount + absentCount;
      const unpaidDays = absentCount;
      const paidDays = Math.max(0, workingDays - unpaidDays);

      /* ---------- salary (from DB, per employee) ---------- */

      const basicNum = Number(firstEmployee.basic_salary || 0);
      const allowanceNum = Number(firstEmployee.attendance_allowance || 0);

      const payPerDay =
        firstEmployee.pay_per_day ??
        firstEmployee.payPerDay ??
        (workingDays > 0 ? Math.round(basicNum / workingDays) : "-");

      const incomeTax = Number(
        firstEmployee.income_tax ?? firstEmployee.incomeTax ?? 0
      );

      const eobi = Number(firstEmployee.eobi ?? 0);

      const advanceSalary = Number(
        firstEmployee.advance_salary ?? firstEmployee.advanceSalary ?? 0
      );

      const grossSalary = basicNum + allowanceNum;

      const netSalary = grossSalary - incomeTax - eobi - advanceSalary;

      /* ---------- shared table helper ---------- */

      let currentY = 15;

      const baseStyles = {
        font: "helvetica",
        fontSize: 7,
        cellPadding: 2,
        halign: "center",
        valign: "middle",
        lineColor: BORDER,
        lineWidth: 0.2,
      };

      const drawTable = (head, body, options = {}) => {
        const { headFontSize = 6.5, gap = 3, ...extra } = options;

        autoTable(doc, {
          startY: currentY,
          margin: { left: 8, right: 8 },
          theme: "grid",
          head: [head],
          body: [body],
          styles: baseStyles,
          headStyles: {
            fillColor: RED,
            textColor: WHITE,
            fontStyle: "normal",
            fontSize: headFontSize,
            halign: "center",
            valign: "middle",
            lineColor: WHITE,
            lineWidth: 0.2,
          },
          bodyStyles: {
            fontStyle: "bold",
            textColor: BLACK,
            fillColor: WHITE,
          },
          ...extra,
        });

        currentY = doc.lastAutoTable.finalY + gap;
      };

      /* ---------- page header ---------- */

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...BLACK);

      doc.text("Dear", 8, 10);

      doc.setDrawColor(...GREEN);
      doc.setLineWidth(0.4);
      doc.rect(20, 6, 55, 6);

      doc.text(String(employeeName), 22, 10);

      doc.text("Net Salary PKR", 82, 10);
      doc.text(money(netSalary), 115, 10);

      doc.text(`Payroll: ${fromDate} to ${toDate}`, 160, 10);

      /* ---------- employee info ---------- */

      drawTable(
        [
          "EMP ID",
          "Employee Name",
          "Payroll",
          "Campaign",
          "Basic",
          "Agent WD",
          "Pay Per Day",
        ],
        [
          employeeId,
          employeeName,
          payroll,
          campaign,
          money(basicNum),
          agentWD,
          money(payPerDay),
        ],
        { headFontSize: 7, gap: 4 }
      );

      /* ---------- attendance calendar (7 columns) ---------- */

      const calendarData = rows.map((row) => {
        const rawDate = row.attendance_date || row.login_time;

        return {
          date: rawDate ? formatCaliforniaDate(rawDate) : "-",
          status: getRowStatus(row),
        };
      });

      const weeks = [];

      for (let i = 0; i < calendarData.length; i += 7) {
        weeks.push(calendarData.slice(i, i + 7));
      }

      weeks.forEach((week) => {
        if (currentY > 185) {
          doc.addPage();
          currentY = 12;
        }

        const dateHeaders = week.map((item) => item.date);
        const statusValues = week.map((item) => item.status);

        while (dateHeaders.length < 7) {
          dateHeaders.push("");
          statusValues.push("");
        }

        drawTable(dateHeaders, statusValues, {
          gap: 2,
          headFontSize: 6,
          styles: { ...baseStyles, fontSize: 6.5, textColor: BLACK },
          didParseCell: (hookData) => {
            if (hookData.section !== "body") return;

            const value = String(hookData.cell.raw || "").toLowerCase();

            if (value === "usl" || value === "ncns" || value === "ucl") {
              hookData.cell.styles.fillColor = RED;
              hookData.cell.styles.textColor = WHITE;
              hookData.cell.styles.fontStyle = "bold";
            }

            if (value === "absent") {
              hookData.cell.styles.textColor = RED;
              hookData.cell.styles.fontStyle = "bold";
            }

            if (value === "off" || value === "weekend off") {
              hookData.cell.styles.fillColor = LIGHT_GRAY;
              hookData.cell.styles.textColor = [90, 90, 90];
              hookData.cell.styles.fontStyle = "bold";
            }

            if (value === "present") {
              hookData.cell.styles.textColor = BLACK;
            }
          },
        });
      });

      /* ---------- summary ---------- */

      if (currentY > 175) {
        doc.addPage();
        currentY = 12;
      }

      drawTable(
        [
          "Working Days",
          "Late",
          "Unpaid",
          "Paid Days",
          "Total Hours",
          "Weekend Off",
          "Absent",
        ],
        [
          workingDays,
          lateCount,
          unpaidDays,
          paidDays,
          totalHours,
          weekendCount,
          absentCount,
        ]
      );

      /* ---------- leaves / salary ---------- */

      drawTable(
        [
          "Half Day",
          "Casual Leave",
          "Sick Leave",
          "NCNS/UCL/USL",
          "Salary",
          "Arrears (-ve)",
          "Arrears (+ve)",
        ],
        [
          firstEmployee.half_day ?? firstEmployee.halfDay ?? 0,
          firstEmployee.casual_leave ?? firstEmployee.casualLeave ?? 0,
          firstEmployee.sick_leave ?? firstEmployee.sickLeave ?? 0,
          firstEmployee.usl ?? firstEmployee.ncns ?? firstEmployee.ucl ?? 0,
          money(basicNum),
          money(
            firstEmployee.arrears_negative ??
              firstEmployee.arrearsNegative ??
              0
          ),
          money(
            firstEmployee.arrears_positive ??
              firstEmployee.arrearsPositive ??
              0
          ),
        ]
      );

      /* ---------- allowance / bonus ---------- */

      drawTable(
        [
          "Fatal Count",
          "Attendance Allowance",
          "Fatal Other Category",
          "Dependability Bonus",
          "Sales Incentive",
          "Fuel Allowance",
          "Additional Incentive",
        ],
        [
          firstEmployee.fatal_count ?? firstEmployee.fatalCount ?? 0,
          money(allowanceNum),
          firstEmployee.fatal_other_category ??
            firstEmployee.fatalOtherCategory ??
            0,
          money(
            firstEmployee.dependability_bonus ??
              firstEmployee.dependabilityBonus ??
              0
          ),
          money(
            firstEmployee.sales_incentive ?? firstEmployee.salesIncentive ?? 0
          ),
          money(
            firstEmployee.fuel_allowance ?? firstEmployee.fuelAllowance ?? 0
          ),
          money(
            firstEmployee.additional_incentive ??
              firstEmployee.additionalIncentive ??
              0
          ),
        ],
        { headFontSize: 6.2 }
      );

      /* ---------- deductions / net salary ---------- */

      drawTable(
        [
          "Gross Salary",
          "Income Tax",
          "EOBI",
          "Van Charges",
          "Parking Charges",
          "Advance Salary",
          "Net Salary",
        ],
        [
          `PKR ${money(grossSalary)}`,
          `PKR ${money(incomeTax)}`,
          `PKR ${money(eobi)}`,
          firstEmployee.van_charges ?? firstEmployee.vanCharges ?? "-",
          firstEmployee.parking_charges ?? firstEmployee.parkingCharges ?? "-",
          `PKR ${money(advanceSalary)}`,
          `PKR ${money(netSalary)}`,
        ],
        {
          didParseCell: (hookData) => {
            if (hookData.section === "body" && hookData.column.index === 6) {
              hookData.cell.styles.fontStyle = "bold";
              hookData.cell.styles.fontSize = 8;
            }
          },
        }
      );

      /* ---------- final info ---------- */

      if (currentY > 190) {
        doc.addPage();
        currentY = 12;
      }

      drawTable(
        [
          "Referral Bonus",
          "Anniversary",
          "Birthday",
          "Salary Processed",
          "Pending",
          "Advance Due",
          "Account No",
        ],
        [
          money(
            firstEmployee.referral_bonus ?? firstEmployee.referralBonus ?? 0
          ),
          firstEmployee.anniversary ?? "-",
          firstEmployee.birthday ?? "-",
          firstEmployee.salary_processed ??
            firstEmployee.salaryProcessed ??
            "-",
          money(
            firstEmployee.pending_salary ?? firstEmployee.pendingSalary ?? 0
          ),
          money(firstEmployee.advance_due ?? firstEmployee.advanceDue ?? 0),
          firstEmployee.account_no ?? firstEmployee.accountNo ?? "-",
        ],
        {
          headFontSize: 6,
          styles: { ...baseStyles, fontSize: 6.5 },
        }
      );

      /* ---------- footer on every page ---------- */

      const pageCount = doc.internal.getNumberOfPages();

      for (let page = 1; page <= pageCount; page++) {
        doc.setPage(page);

        const pageHeight = doc.internal.pageSize.height;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(120, 120, 120);

        doc.text(
          `Digital Orbits CRM • Salary / Attendance Report • ${CALIFORNIA_TIMEZONE}`,
          8,
          pageHeight - 6
        );

        doc.text(`Page ${page} of ${pageCount}`, 289, pageHeight - 6, {
          align: "right",
        });
      }

      /* ---------- file name ---------- */

      const slugify = (text) =>
        String(text)
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^a-zA-Z0-9-_]/g, "");

      const selectedEmployee =
        userFilter !== "All Users"
          ? userOptions.find((user) => String(user.id) === String(userFilter))
          : null;

      const nameForFile = selectedEmployee?.name || employeeName;

      const employeeSlug =
        nameForFile && nameForFile !== "-" ? `-${slugify(nameForFile)}` : "";

      doc.save(
        `attendance-salary-slip${employeeSlug}-${fromDate}-${toDate}.pdf`
      );

      setSuccess("Attendance Salary Slip PDF downloaded successfully.");
    } catch (err) {
      console.error("PDF ERROR:", err);

      setError(
        "Unable to generate PDF. Please make sure jspdf and jspdf-autotable are installed."
      );
    }
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#741C29]/20 border-t-[#741C29] rounded-full animate-spin" />

          <p className="text-sm text-slate-500">Loading attendance...</p>
        </div>
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen lg:pl-[270px]">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* SIDEBAR */}

        <Sidebar />

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#741C29] flex items-center justify-center shadow-sm">
                <CalendarDays className="w-5 h-5 text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Attendance
                </h1>

                <p className="text-sm text-slate-500">
                  Employee attendance and login history
                </p>
              </div>

              {isAdmin && (
                <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#741C29]/10 text-[#741C29]">
                  Admin View
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* REFRESH */}

            <button
              type="button"
              onClick={() => loadAttendance(false)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-60"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            {/* PDF */}

            <button
              type="button"
              onClick={exportPDF}
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>

            {/* ADMIN: SALARY SETUP */}

            {isAdmin && (
              <button
                type="button"
                onClick={openSalaryModal}
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-[#741C29]/30 transition"
              >
                <Wallet className="w-4 h-4 text-[#741C29]" />
                Salary Setup
              </button>
            )}

            {/* ADMIN: ADD */}

            {isAdmin && (
              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#741C29] text-white text-sm font-semibold shadow-sm hover:bg-[#611621] transition"
              >
                <Plus className="w-4 h-4" />
                Add Attendance
              </button>
            )}
          </div>
        </div>

        {/* =================================================
            ALERTS
        ================================================= */}

        {error && !showModal && !showSalaryModal && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />

            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <UserCheck className="w-5 h-5" />

            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="ml-auto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4 mb-6">
          <StatCard
            icon={Users}
            title="Total Records"
            value={stats.total}
            subtitle={`Weekdays • ${stats.off} weekend off`}
          />

          <StatCard
            icon={UserCheck}
            title="Present"
            value={stats.present}
            subtitle="On time attendance"
          />

          <StatCard
            icon={AlertCircle}
            title="Late"
            value={stats.late}
            subtitle="Late arrivals"
          />

          <StatCard
            icon={Clock3}
            title="Total Hours"
            value={stats.totalHours}
            subtitle="Logged working hours"
          />

          <StatCard
            icon={FileText}
            title="Absent"
            value={stats.absent}
            subtitle="Weekdays without attendance"
          />

          <StatCard
            icon={CalendarDays}
            title="Weekend Off"
            value={stats.off}
            subtitle="Saturday & Sunday"
          />
        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 mb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3">
            {/* SEARCH */}

            <div className="xl:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee, email or team..."
                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none focus:bg-white focus:border-[#741C29] focus:ring-4 focus:ring-[#741C29]/10"
              />
            </div>

            {/* FROM */}

            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none focus:bg-white focus:border-[#741C29] focus:ring-4 focus:ring-[#741C29]/10"
              />
            </div>

            {/* TO */}

            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none focus:bg-white focus:border-[#741C29] focus:ring-4 focus:ring-[#741C29]/10"
              />
            </div>

            {/* USER */}

            {isAdmin && (
              <div className="relative">
                <select
                  value={userFilter}
                  onChange={(e) => {
                    setUserFilter(e.target.value);
                    setTeamFilter("All Teams");
                  }}
                  className="appearance-none w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm text-slate-700 outline-none focus:bg-white focus:border-[#741C29] focus:ring-4 focus:ring-[#741C29]/10"
                >
                  <option value="All Users">All Users</option>

                  {userOptions.map((user) => (
                    <option key={user.id} value={String(user.id)}>
                      {user.name}
                      {user.email ? ` — ${user.email}` : ""}
                    </option>
                  ))}
                </select>

                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            )}

            {/* TEAM */}

            <div className="relative">
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="appearance-none w-full h-11 rounded-xl border border-[#DDD6D2] bg-[#FCFBFA] px-3 pr-9 text-sm text-gray-700 outline-none focus:bg-white focus:border-[#741C29] focus:ring-4 focus:ring-[#741C29]/10"
              >
                <option value="All Teams">All Teams</option>

                {teams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>

              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* STATUS */}

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm text-slate-700 outline-none focus:bg-white focus:border-[#741C29] focus:ring-4 focus:ring-[#741C29]/10"
              >
                <option value="All">All Status</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
                <option value="OFF">Weekend Off</option>
              </select>

              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* HIDE / UNHIDE */}

          <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-xs text-slate-400">
              {hiddenRecords.length > 0
                ? `${hiddenRecords.length} attendance ${
                    hiddenRecords.length === 1 ? "record" : "records"
                  } hidden`
                : "No hidden attendance records"}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowHiddenMenu((prev) => !prev)}
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-[#741C29]/30 transition"
              >
                <Settings2 className="w-4 h-4 text-[#741C29]" />

                Hide / Unhide Lines

                {hiddenRecords.length > 0 && (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[#741C29] text-white text-[10px] font-bold">
                    {hiddenRecords.length}
                  </span>
                )}

                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showHiddenMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showHiddenMenu && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-[100] w-full sm:w-[420px] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="px-4 py-4 border-b border-slate-100 bg-slate-50/80">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <EyeOff className="w-4 h-4 text-[#741C29]" />

                          <h3 className="text-sm font-bold text-slate-900">
                            Hidden Lines
                          </h3>
                        </div>

                        <p className="text-xs text-slate-500 mt-1">
                          Manage hidden attendance records.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowHiddenMenu(false)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {hiddenRecords.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 mx-auto flex items-center justify-center mb-3">
                        <Eye className="w-5 h-5 text-slate-400" />
                      </div>

                      <p className="text-sm font-semibold text-slate-700">
                        No hidden lines
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Click Hide in the Action column to hide a record.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
                        {hiddenRecords.map((row) => (
                          <div
                            key={row.id}
                            className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50"
                          >
                            <div className="w-9 h-9 shrink-0 rounded-full bg-[#741C29]/10 text-[#741C29] flex items-center justify-center font-bold text-xs">
                              {String(row.name || "U")
                                .slice(0, 1)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-800 truncate">
                                {row.name || "Unknown Employee"}
                              </p>

                              <p className="text-xs text-slate-400 truncate">
                                {formatCaliforniaDate(
                                  row.attendance_date || row.login_time
                                )}{" "}
                                • {formatCaliforniaTime(row.login_time)}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => unhideAttendanceRecord(row.id)}
                              className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Unhide
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/70">
                        <button
                          type="button"
                          onClick={unhideAllAttendance}
                          className="w-full h-9 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-[#741C29] hover:text-[#741C29] transition"
                        >
                          Unhide All Lines
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto h-[600px]">
            <table className="w-full min-w-[1150px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {isAdmin && <th className={TH_CLASS}>Staff</th>}

                  <th className={TH_CLASS}>Date</th>
                  <th className={TH_CLASS}>Day</th>
                  <th className={TH_CLASS}>Login</th>
                  <th className={TH_CLASS}>Logout</th>
                  <th className={TH_CLASS}>Duration</th>
                  <th className={TH_CLASS}>Status</th>

                  {isAdmin && (
                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  )}

                  {!isAdmin && <th className={TH_CLASS}>Email</th>}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {visibleAttendance.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isAdmin ? 8 : 7}
                      className="px-5 py-14 text-center"
                    >
                      <div className="flex flex-col items-center">
                        {filteredAttendance.length > 0 ? (
                          <>
                            <EyeOff className="w-10 h-10 text-slate-300 mb-3" />

                            <p className="font-semibold text-slate-700">
                              All filtered lines are hidden
                            </p>

                            <p className="text-sm text-slate-400 mt-1">
                              Open Hide / Unhide Lines to show them again.
                            </p>

                            <button
                              type="button"
                              onClick={() => setShowHiddenMenu(true)}
                              className="mt-4 inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#741C29] text-white text-xs font-semibold hover:bg-[#611621] transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Show Hidden Lines
                            </button>
                          </>
                        ) : (
                          <>
                            <FileText className="w-10 h-10 text-slate-300 mb-3" />

                            <p className="font-semibold text-slate-700">
                              No attendance found
                            </p>

                            <p className="text-sm text-slate-400 mt-1">
                              Try changing the filters or date range.
                            </p>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  visibleAttendance.map((row) => {
                    const status = getStatus(row);
                    const isOff = row.row_type === "weekend_off";

                    const rowKey = isOff
                      ? `off-${row.user_id}-${row.attendance_date}`
                      : row.id
                      ? `attendance-${row.id}`
                      : `absent-${row.user_id}-${row.attendance_date}`;

                    return (
                      <tr
                        key={rowKey}
                        className={
                          isOff
                            ? "bg-slate-50 hover:bg-slate-100 transition"
                            : status === "Absent"
                            ? "bg-red-50/30 hover:bg-red-50 transition"
                            : "hover:bg-slate-50/70 transition"
                        }
                      >
                        {/* STAFF */}

                        {isAdmin && (
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                                  isOff
                                    ? "bg-slate-200 text-slate-600"
                                    : status === "Absent"
                                    ? "bg-red-100 text-red-600"
                                    : "bg-[#741C29]/10 text-[#741C29]"
                                }`}
                              >
                                {String(row.name || "U")
                                  .slice(0, 1)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <div className="font-semibold text-sm text-slate-800">
                                  {row.name || "-"}
                                </div>

                                <div className="text-xs text-slate-400">
                                  {row.team || "Staff"}
                                </div>
                              </div>
                            </div>
                          </td>
                        )}

                        {/* DATE */}

                        <td className="px-5 py-4 text-sm text-slate-700 whitespace-nowrap">
                          {formatCaliforniaDate(
                            row.attendance_date || row.login_time
                          )}
                        </td>

                        {/* DAY */}

                        <td className="px-5 py-4 text-sm font-medium text-slate-600 whitespace-nowrap">
                          {row.day_name ||
                            getDayName(row.attendance_date || row.login_time)}
                        </td>

                        {/* LOGIN */}

                        <td className="px-5 py-4 text-sm font-medium text-slate-700 whitespace-nowrap">
                          {isOff ? "—" : formatCaliforniaTime(row.login_time)}
                        </td>

                        {/* LOGOUT */}

                        <td className="px-5 py-4 text-sm font-medium text-slate-700 whitespace-nowrap">
                          {isOff ? "—" : formatCaliforniaTime(row.logout_time)}
                        </td>

                        {/* DURATION */}

                        <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">
                          {isOff ? "OFF" : formatDuration(row.duration_seconds)}
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">
                          {status === "OFF" ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              Weekend Off
                            </span>
                          ) : status === "Absent" ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
                              Absent
                            </span>
                          ) : status === "Late" ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                              Late
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              Present
                            </span>
                          )}
                        </td>

                        {/* ADMIN ACTION */}

                        {isAdmin && (
                          <td className="px-5 py-4 text-right">
                            {isOff ? (
                              <span className="text-xs font-semibold text-slate-400">
                                Weekend Off
                              </span>
                            ) : (
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEditModal(row)}
                                  className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:border-[#741C29] hover:text-[#741C29] transition"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openDeleteConfirm(row)}
                                  className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-red-200 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 hover:border-red-300 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </button>

                                {row.id && (
                                  <button
                                    type="button"
                                    onClick={() => hideAttendanceRecord(row)}
                                    className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold hover:bg-slate-100 hover:border-[#741C29]/30 hover:text-[#741C29] transition"
                                    title="Hide this attendance record"
                                  >
                                    <EyeOff className="w-3.5 h-3.5" />
                                    Hide
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        )}

                        {/* NON ADMIN EMAIL */}

                        {!isAdmin && (
                          <td className="px-5 py-4 text-sm text-slate-500">
                            {row.email || "-"}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {visibleAttendance.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {filteredAttendance.length}
            </span>{" "}
            rows
            {hiddenRecords.length > 0 && (
              <>
                {" "}
                •{" "}
                <span className="font-semibold text-[#741C29]">
                  {hiddenRecords.length} hidden
                </span>
              </>
            )}{" "}
            •{" "}
            <span className="font-semibold text-slate-700">{stats.off}</span>{" "}
            weekend off
          </div>
        </div>
      </div>

      {/* ===================================================
          ADMIN ADD / EDIT ATTENDANCE MODAL
      =================================================== */}

      {showModal && isAdmin && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
            onClick={closeModal}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* HEADER */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#741C29]/10 flex items-center justify-center">
                  {editingRecord ? (
                    <Pencil className="w-5 h-5 text-[#741C29]" />
                  ) : (
                    <Plus className="w-5 h-5 text-[#741C29]" />
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingRecord ? "Edit Attendance" : "Add Attendance"}
                  </h2>

                  <p className="text-xs text-slate-500 mt-0.5">
                    {editingRecord?.attendance_status === "Absent"
                      ? "Editing Absent attendance"
                      : "Time is saved using California timezone"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSave} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* EMPLOYEE */}

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Employee
                  </label>

                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                    <select
                      value={form.user_id}
                      onChange={(e) => updateForm("user_id", e.target.value)}
                      required
                      className="appearance-none w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-700 outline-none focus:bg-white focus:border-[#741C29] focus:ring-4 focus:ring-[#741C29]/10"
                    >
                      <option value="">Select employee</option>

                      {staff.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name}
                          {employee.email ? ` — ${employee.email}` : ""}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* LOGIN */}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Login Time
                  </label>

                  <input
                    type="datetime-local"
                    step="1"
                    value={form.login_time}
                    onChange={(e) => updateForm("login_time", e.target.value)}
                    required
                    className={INPUT_CLASS}
                  />

                  {editingRecord?.attendance_date && (
                    <p className="text-xs text-slate-400 mt-1.5">
                      Attendance date:{" "}
                      {formatCaliforniaDate(editingRecord.attendance_date)}
                    </p>
                  )}
                </div>

                {/* LOGOUT */}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Logout Time
                  </label>

                  <input
                    type="datetime-local"
                    step="1"
                    value={form.logout_time}
                    onChange={(e) => updateForm("logout_time", e.target.value)}
                    className={INPUT_CLASS}
                  />

                  <p className="text-xs text-slate-400 mt-1.5">
                    Leave empty if employee is still logged in.
                  </p>
                </div>

                {/* IP */}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    IP Address
                  </label>

                  <input
                    type="text"
                    value={form.ip_address}
                    onChange={(e) => updateForm("ip_address", e.target.value)}
                    placeholder="Optional"
                    className={INPUT_CLASS}
                  />
                </div>

                {/* USER AGENT */}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    User Agent
                  </label>

                  <input
                    type="text"
                    value={form.user_agent}
                    onChange={(e) => updateForm("user_agent", e.target.value)}
                    placeholder="Optional"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              {/* ABSENT INFO */}

              {editingRecord?.attendance_status === "Absent" && (
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />

                    <div>
                      <p className="text-sm font-semibold text-amber-800">
                        Absent record
                      </p>

                      <p className="text-xs text-amber-700 mt-1">
                        This row does not have a database attendance ID yet.
                        Saving it will create the attendance record for{" "}
                        {formatCaliforniaDate(editingRecord.attendance_date)}.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL ERROR */}

              {error && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />

                  <span>{error}</span>
                </div>
              )}

              {/* FOOTER */}

              <div className="flex items-center justify-end gap-3 mt-7 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="h-11 px-5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 px-5 rounded-xl bg-[#741C29] text-white text-sm font-semibold hover:bg-[#611621] transition disabled:opacity-60 inline-flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingRecord ? "Update Attendance" : "Add Attendance"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================
          SALARY SETUP MODAL
      =================================================== */}

      {showSalaryModal && isAdmin && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
            onClick={closeSalaryModal}
          />

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* HEADER */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#741C29]/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-[#741C29]" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Employee Salary Setup
                  </h2>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Each employee has their own salary
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeSalaryModal}
                disabled={savingSalary}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSaveSalary} className="p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Employee
              </label>

              <div className="relative mb-5">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                <select
                  value={salaryForm.user_id}
                  onChange={(e) => fillSalaryForm(e.target.value)}
                  required
                  className="appearance-none w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-700 outline-none focus:bg-white focus:border-[#741C29] focus:ring-4 focus:ring-[#741C29]/10"
                >
                  <option value="">Select employee</option>

                  {userOptions.map((user) => (
                    <option key={user.id} value={String(user.id)}>
                      {user.name}
                      {user.email ? ` — ${user.email}` : ""}
                    </option>
                  ))}
                </select>

                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Basic Salary (PKR)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={salaryForm.basic_salary}
                    onChange={(e) =>
                      setSalaryForm((prev) => ({
                        ...prev,
                        basic_salary: e.target.value,
                      }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Attendance Allowance (PKR)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={salaryForm.attendance_allowance}
                    onChange={(e) =>
                      setSalaryForm((prev) => ({
                        ...prev,
                        attendance_allowance: e.target.value,
                      }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-3">
                Gross Salary = Basic Salary + Attendance Allowance
              </p>

              {salaryError && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />

                  <span>{salaryError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-7 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeSalaryModal}
                  disabled={savingSalary}
                  className="h-11 px-5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingSalary}
                  className="h-11 px-5 rounded-xl bg-[#741C29] text-white text-sm font-semibold hover:bg-[#611621] transition disabled:opacity-60 inline-flex items-center gap-2"
                >
                  {savingSalary ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Salary
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================
          DELETE CONFIRMATION MODAL
      =================================================== */}

      {deleteRecord && isAdmin && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"
            onClick={closeDeleteConfirm}
          />

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                Are you sure?
              </h2>

              <p className="text-sm text-slate-500 mt-2 leading-6">
                Are you sure you want to permanently delete this attendance
                record? This action cannot be undone.
              </p>

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#741C29]/10 text-[#741C29] flex items-center justify-center font-bold text-sm">
                    {String(deleteRecord.name || "U")
                      .slice(0, 1)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-800 truncate">
                      {deleteRecord.name || "Unknown Employee"}
                    </p>

                    <p className="text-xs text-slate-500 truncate">
                      {deleteRecord.email ||
                        deleteRecord.team ||
                        "Attendance Record"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
                      Date
                    </p>

                    <p className="text-sm font-medium text-slate-700 mt-1">
                      {formatCaliforniaDate(
                        deleteRecord.attendance_date || deleteRecord.login_time
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
                      Login
                    </p>

                    <p className="text-sm font-medium text-slate-700 mt-1">
                      {formatCaliforniaTime(deleteRecord.login_time)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeDeleteConfirm}
                  disabled={deleting}
                  className="h-11 px-5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="h-11 px-5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-60 inline-flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Yes, Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ icon: Icon, title, value, subtitle }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>

          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        </div>

        <div className="w-10 h-10 rounded-xl bg-[#741C29]/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#741C29]" />
        </div>
      </div>
    </div>
  );
}
