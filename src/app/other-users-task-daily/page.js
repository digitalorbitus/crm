
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  CheckCheck,
  Clock3,
  Download,
  Edit3,
  FileSpreadsheet,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings2,
  Trash2,
  Users,
  X,
  ClipboardList,
} from "lucide-react";

// Existing CRM sidebar: update this import if your component is elsewhere.
import Sidebar from "@/components/Sidebar";

const TASK_API = "/api/admin/other-users-task-daily";
const TYPES_API = `${TASK_API}/types`;
const USERS_API = "/api/new-users";
const MAROON = "#741C29";
const PAGE_SIZE = 10;

const EMPTY_FORM = {
  title: "",
  description: "",
  type: "",
  priority: "Normal",
  assigned_to: "",
  due_date: "",
  status: "Pending",
};

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function asArray(data, keys = []) {
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return [];
}

function taskId(task) {
  return task.id ?? task.task_id ?? task.assignment_id;
}

function assignedId(task) {
  return (
    task.assigned_to ??
    task.user_id ??
    task.staff_id ??
    task.assignee_id ??
    ""
  );
}

function taskTitle(task) {
  return task.title || task.task_title || "Untitled task";
}

function staffName(task, users) {
  const direct =
    task.assigned_to_name ||
    task.staff_name ||
    task.user_name ||
    task.assignee_name;

  if (direct) return direct;

  const id = String(assignedId(task));
  const user = users.find(
    (item) => String(item.id) === id
  );

  return user?.name || user?.full_name || "Unassigned";
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function badgeStatus(status) {
  const value = String(status || "Pending").toLowerCase();

  if (value.includes("complete") || value === "done") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }
  if (value.includes("progress")) {
    return "bg-blue-50 text-blue-700 ring-blue-200";
  }
  if (value.includes("cancel")) {
    return "bg-slate-100 text-slate-600 ring-slate-200";
  }
  return "bg-amber-50 text-amber-700 ring-amber-200";
}

function badgePriority(priority) {
  const value = String(priority || "Normal").toLowerCase();

  if (value === "urgent" || value === "critical") {
    return "bg-rose-50 text-rose-700";
  }
  if (value === "high") {
    return "bg-orange-50 text-orange-700";
  }
  if (value === "low") {
    return "bg-slate-100 text-slate-600";
  }
  return "bg-blue-50 text-blue-700";
}

function Modal({ title, subtitle, onClose, children, wide = false }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={cx(
          "max-h-[92vh] w-full overflow-hidden rounded-2xl bg-white shadow-2xl",
          wide ? "max-w-3xl" : "max-w-xl"
        )}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X size={19} />
          </button>
        </div>
        <div className="max-h-[calc(92vh-80px)] overflow-y-auto p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
        </div>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}14`, color }}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

export default function OtherUsersTaskDailyPage() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [userFilter, setUserFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [selectedTasks, setSelectedTasks] = useState([]);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [showBulkCreateModal, setShowBulkCreateModal] = useState(false);
  const [bulkTaskText, setBulkTaskText] = useState("");
  const [bulkTaskType, setBulkTaskType] = useState("");
  const [bulkTaskPriority, setBulkTaskPriority] = useState("Normal");
  const [bulkTaskStaff, setBulkTaskStaff] = useState("");
  const [bulkTaskDescription, setBulkTaskDescription] = useState("");

  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [bulkStaff, setBulkStaff] = useState([]);
  const [distribution, setDistribution] = useState("round-robin");

  const [showTypesModal, setShowTypesModal] = useState(false);
  const [newType, setNewType] = useState("");

  const request = useCallback(async (url, options = {}) => {
    const response = await fetch(url, {
      credentials: "include",
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data?.error ||
          (typeof data === "string" ? data : "") ||
          `Request failed (${response.status})`
      );
    }

    return data;
  }, []);

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError("");

    try {
      const [taskResult, userResult, typeResult] = await Promise.allSettled([
        request(TASK_API),
        request(USERS_API),
        request(TYPES_API),
      ]);

      if (taskResult.status === "rejected") throw taskResult.reason;

      setTasks(
        asArray(taskResult.value, [
          "tasks",
          "data",
          "assignments",
          "records",
        ])
      );

      if (userResult.status === "fulfilled") {
        const userList = asArray(userResult.value, [
          "users",
          "data",
          "staff",
          "employees",
        ]).map((user) => ({
          ...user,
          id: user.id ?? user.user_id,
          name:
            user.name ||
            user.full_name ||
            user.username ||
            user.email ||
            `User ${user.id ?? user.user_id}`,
        }));

        setUsers(userList);
      }

      if (typeResult.status === "fulfilled") {
        setTypes(
          asArray(typeResult.value, ["types", "data", "taskTypes"])
        );
      }
    } catch (err) {
      setError(err.message || "Unable to load tasks.");
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const staffOptions = useMemo(
    () =>
      users.filter((user) => {
        const role = String(user.role || "").toLowerCase();
        return (
          !role ||
          role.includes("staff") ||
          role.includes("agent") ||
          role.includes("employee") ||
          role.includes("supervisor")
        );
      }),
    [users]
  );

  const activeTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          !["deleted", "archived"].includes(
            String(task.status || "").toLowerCase()
          )
      ),
    [tasks]
  );

  const completedCount = activeTasks.filter((task) =>
    ["completed", "complete", "done"].includes(
      String(task.status || "").toLowerCase()
    )
  ).length;

  const pendingCount = activeTasks.filter((task) =>
    ["pending", "todo", "to do", ""].includes(
      String(task.status || "Pending").toLowerCase()
    )
  ).length;

  const progressCount = activeTasks.filter((task) =>
    String(task.status || "").toLowerCase().includes("progress")
  ).length;

  const filteredTasks = useMemo(() => {
    let result = [...activeTasks];

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      result = result.filter((task) =>
        [
          taskTitle(task),
          task.description,
          task.type,
          task.task_type,
          task.status,
          task.priority,
          taskId(task),
          staffName(task, users),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    }

    if (statusFilter !== "All") {
      result = result.filter(
        (task) =>
          String(task.status || "Pending").toLowerCase() ===
          statusFilter.toLowerCase()
      );
    }

    if (userFilter === "Unassigned") {
      result = result.filter((task) => !assignedId(task));
    } else if (userFilter !== "All") {
      result = result.filter(
        (task) => String(assignedId(task)) === userFilter
      );
    }

    if (priorityFilter !== "All") {
      result = result.filter(
        (task) =>
          String(task.priority || "Normal").toLowerCase() ===
          priorityFilter.toLowerCase()
      );
    }

    if (typeFilter !== "All") {
      result = result.filter(
        (task) => String(task.type || task.task_type || "") === typeFilter
      );
    }

    result.sort((a, b) => {
      const aDate = new Date(a.created_at || a.createdAt || 0).getTime();
      const bDate = new Date(b.created_at || b.createdAt || 0).getTime();

      if (sortBy === "oldest") return aDate - bDate;
      if (sortBy === "title") {
        return taskTitle(a).localeCompare(taskTitle(b));
      }
      return bDate - aDate;
    });

    return result;
  }, [
    activeTasks,
    search,
    statusFilter,
    userFilter,
    priorityFilter,
    typeFilter,
    sortBy,
    users,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageTasks = filteredTasks.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, userFilter, priorityFilter, typeFilter, sortBy]);

  function toggleTask(id) {
    setSelectedTasks((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  const allPageSelected =
    pageTasks.length > 0 &&
    pageTasks.every((task) => selectedTasks.includes(taskId(task)));

  function togglePageSelection() {
    const ids = pageTasks.map(taskId);

    setSelectedTasks((current) =>
      allPageSelected
        ? current.filter((id) => !ids.includes(id))
        : [...new Set([...current, ...ids])]
    );
  }

  function openCreateTask() {
    setEditingTask(null);
    setForm({
      ...EMPTY_FORM,
      type: types[0]?.name || types[0]?.type || "",
    });
    setShowTaskModal(true);
  }

  function openEditTask(task) {
    setEditingTask(task);
    setForm({
      title: task.title || task.task_title || "",
      description: task.description || "",
      type: task.type || task.task_type || "",
      priority: task.priority || "Normal",
      assigned_to: String(assignedId(task) || ""),
      due_date: task.due_date ? String(task.due_date).slice(0, 10) : "",
      status: task.status || "Pending",
    });
    setShowTaskModal(true);
  }

  async function saveTask(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = {
        ...form,
        assigned_to: form.assigned_to || null,
      };

      if (editingTask) {
        payload.id = taskId(editingTask);
        await request(TASK_API, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setNotice("Task updated successfully.");
      } else {
        await request(TASK_API, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setNotice("Task created successfully.");
      }

      setShowTaskModal(false);
      await loadData(false);
    } catch (err) {
      setError(err.message || "Unable to save task.");
    } finally {
      setSaving(false);
    }
  }

  async function createMultipleTasks(event) {
    event.preventDefault();

    const titles = bulkTaskText
      .split(/\r?\n/)
      .map((title) => title.trim())
      .filter(Boolean);

    if (!titles.length) {
      setError("Please enter at least one task title.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    let created = 0;

    try {
      // Uses the existing POST endpoint once per title.
      for (const title of titles) {
        await request(TASK_API, {
          method: "POST",
          body: JSON.stringify({
            title,
            description: bulkTaskDescription,
            type: bulkTaskType,
            priority: bulkTaskPriority,
            assigned_to: bulkTaskStaff || null,
            status: "Pending",
          }),
        });
        created += 1;
      }

      setShowBulkCreateModal(false);
      setBulkTaskText("");
      setBulkTaskDescription("");
      setBulkTaskStaff("");
      setNotice(`${created} tasks created successfully.`);
      await loadData(false);
    } catch (err) {
      setError(
        `${created} task(s) were created before the request failed. ${err.message || "Please refresh and check the list before retrying."}`
      );
      await loadData(false);
    } finally {
      setSaving(false);
    }
  }

  async function assignSelectedTasks(event) {
    event.preventDefault();

    if (!selectedTasks.length || !bulkStaff.length) {
      setError("Select tasks and at least one staff member.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    let assignedCount = 0;

    try {
      const staffIds = [...bulkStaff];

      // Round-robin rotates staff. Equal distribution uses the same
      // rotation here; for balancing by current workload, the API needs
      // to expose current assignment counts.
      for (let i = 0; i < selectedTasks.length; i += 1) {
        const staffId = staffIds[i % staffIds.length];

        await request(TASK_API, {
          method: "PATCH",
          body: JSON.stringify({
            id: selectedTasks[i],
            assigned_to: staffId,
          }),
        });

        assignedCount += 1;
      }

      setShowBulkAssignModal(false);
      setSelectedTasks([]);
      setBulkStaff([]);
      setNotice(`${assignedCount} tasks assigned successfully.`);
      await loadData(false);
    } catch (err) {
      setError(
        `${assignedCount} task(s) were assigned before the request failed. Refresh the list before retrying. ${err.message || ""}`
      );
      await loadData(false);
    } finally {
      setSaving(false);
    }
  }

  async function deleteTask(task) {
    const id = taskId(task);
    if (!window.confirm(`Delete "${taskTitle(task)}"?`)) return;

    setError("");
    setNotice("");

    try {
      await request(`${TASK_API}?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      setTasks((current) =>
        current.filter((item) => taskId(item) !== id)
      );
      setSelectedTasks((current) => current.filter((item) => item !== id));
      setNotice("Task deleted successfully.");
    } catch (err) {
      setError(err.message || "Unable to delete task.");
    }
  }

  async function addType(event) {
    event.preventDefault();
    const name = newType.trim();
    if (!name) return;

    setSaving(true);
    setError("");

    try {
      await request(TYPES_API, {
        method: "POST",
        body: JSON.stringify({ name, type: name }),
      });

      setNewType("");
      const result = await request(TYPES_API);
      setTypes(asArray(result, ["types", "data", "taskTypes"]));
      setNotice("Task type added.");
    } catch (err) {
      setError(err.message || "Unable to add task type.");
    } finally {
      setSaving(false);
    }
  }

  async function removeType(type) {
    const id = type.id ?? type.type_id;
    const name = type.name || type.type || "";

    if (!window.confirm(`Delete task type "${name}"?`)) return;

    try {
      await request(
        `${TYPES_API}?id=${encodeURIComponent(id ?? name)}`,
        { method: "DELETE" }
      );

      setTypes((current) =>
        current.filter((item) => {
          const itemId = item.id ?? item.type_id;
          const itemName = item.name || item.type;
          return id != null
            ? String(itemId) !== String(id)
            : itemName !== name;
        })
      );
      setNotice("Task type deleted.");
    } catch (err) {
      setError(err.message || "Unable to delete task type.");
    }
  }

  function exportCSV() {
    const headers = [
      "Task ID",
      "Title",
      "Type",
      "Assigned To",
      "Priority",
      "Status",
      "Due Date",
      "Created At",
    ];

    const rows = filteredTasks.map((task) => [
      taskId(task),
      taskTitle(task),
      task.type || task.task_type,
      staffName(task, users),
      task.priority,
      task.status,
      task.due_date,
      task.created_at,
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "other-users-daily-tasks.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("All");
    setUserFilter("All");
    setPriorityFilter("All");
    setTypeFilter("All");
    setSortBy("newest");
  }

  return (
    <div className="flex flex-col lg:ml-64 h-screen min-h-0 p-4 sm:p-6 lg:p-8 bg-slate-50 text-slate-800 font-sans ">
      {/* Keep only one Sidebar instance if the admin layout already renders it. */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="min-w-0 px-4 py-5 sm:px-6 sm:py-7 xl:px-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                <span>Admin</span>
                <span className="text-slate-300">/</span>
                <span style={{ color: MAROON }}>Task Management</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                Other Users Daily Tasks
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Create multiple tasks, assign staff and manage daily work from
                one professional dashboard.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => loadData()}
                disabled={loading}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => setShowTypesModal(true)}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <Settings2 size={16} />
                Task Types
              </button>

              <button
                type="button"
                onClick={openCreateTask}
                className="inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold text-white shadow-sm hover:brightness-110"
                style={{ backgroundColor: MAROON }}
              >
                <Plus size={17} />
                Create Task
              </button>

              <button
                type="button"
                onClick={() => {
                  setBulkTaskText("");
                  setBulkTaskType(types[0]?.name || types[0]?.type || "");
                  setBulkTaskPriority("Normal");
                  setBulkTaskStaff("");
                  setBulkTaskDescription("");
                  setShowBulkCreateModal(true);
                }}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#741C29] bg-white px-4 text-sm font-bold text-[#741C29] hover:bg-rose-50"
              >
                <Layers size={17} />
                Bulk Create Tasks
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">{error}</div>
              <button type="button" onClick={() => setError("")}>
                <X size={16} />
              </button>
            </div>
          )}

          {notice && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <CheckCheck size={18} className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">{notice}</div>
              <button type="button" onClick={() => setNotice("")}>
                <X size={16} />
              </button>
            </div>
          )}

          <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            <StatCard
              title="Total Tasks"
              value={activeTasks.length}
              subtitle="Tasks in your workspace"
              icon={Layers}
              color={MAROON}
            />
            <StatCard
              title="Pending Tasks"
              value={pendingCount}
              subtitle="Waiting to be started"
              icon={Clock3}
              color="#D97706"
            />
            <StatCard
              title="In Progress"
              value={progressCount}
              subtitle="Currently being worked on"
              icon={Activity}
              color="#2563EB"
            />
            <StatCard
              title="Completed"
              value={completedCount}
              subtitle="Successfully completed"
              icon={CheckCheck}
              color="#059669"
            />
          </div>

          <div
            className="mb-7 overflow-hidden rounded-2xl text-white shadow-sm"
            style={{
              background:
                "linear-gradient(110deg, #5b1420 0%, #741c29 58%, #8d3040 100%)",
            }}
          >
            <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                  <Users size={23} />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold">
                    Bulk Assignment Center
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-white/75">
                    Select several tasks and distribute them among staff members.
                    Or use Bulk Create Tasks to add many new tasks in one go.
                  </p>
                  <span className="mt-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                    {selectedTasks.length} task(s) selected
                  </span>
                </div>
              </div>
              <button
                type="button"
                disabled={!selectedTasks.length}
                onClick={() => {
                  setBulkStaff([]);
                  setShowBulkAssignModal(true);
                }}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-extrabold text-[#741C29] hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={17} />
                Assign Selected
              </button>
            </div>
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
                  <ClipboardList size={20} style={{ color: MAROON }} />
                  Task Management
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Search, filter, edit and assign tasks.
                </p>
              </div>
              <button
                type="button"
                onClick={exportCSV}
                className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 px-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 lg:self-auto"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>

            <div className="border-b border-slate-100 bg-slate-50/70 p-4 sm:p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
                <div className="relative sm:col-span-2 xl:col-span-2">
                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search task, staff, ID..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-[#741C29] focus:ring-2 focus:ring-[#741C29]/10"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#741C29]"
                >
                  <option value="All">All statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <select
                  value={userFilter}
                  onChange={(event) => setUserFilter(event.target.value)}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#741C29]"
                >
                  <option value="All">All staff</option>
                  <option value="Unassigned">Unassigned</option>
                  {staffOptions.map((user) => (
                    <option key={user.id} value={String(user.id)}>
                      {user.name}
                    </option>
                  ))}
                </select>

                <select
                  value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value)}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#741C29]"
                >
                  <option value="All">All priorities</option>
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#741C29]"
                >
                  <option value="All">All task types</option>
                  {types.map((type) => {
                    const name = type.name || type.type;
                    return (
                      <option key={type.id ?? name} value={name}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  <strong className="text-slate-800">
                    {filteredTasks.length}
                  </strong>{" "}
                  matching task(s)
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold outline-none focus:border-[#741C29]"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="title">Title A–Z</option>
                  </select>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="h-9 rounded-lg px-3 text-xs font-bold text-slate-600 hover:bg-white hover:text-[#741C29]"
                  >
                    Reset filters
                  </button>
                </div>
              </div>
            </div>

            {selectedTasks.length > 0 && (
              <div className="flex flex-col gap-3 border-b border-rose-100 bg-rose-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="text-sm font-bold text-[#741C29]">
                  {selectedTasks.length} task(s) selected
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTasks([])}
                    className="h-9 rounded-lg border border-rose-200 px-3 text-xs font-bold text-rose-700 hover:bg-rose-100"
                  >
                    Clear selection
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBulkStaff([]);
                      setShowBulkAssignModal(true);
                    }}
                    className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-bold text-white"
                    style={{ backgroundColor: MAROON }}
                  >
                    <Users size={14} />
                    Bulk assign
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-white">
                    <th className="w-12 px-4 py-4">
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        onChange={togglePageSelection}
                        aria-label="Select all tasks on this page"
                        className="h-4 w-4 accent-[#741C29]"
                      />
                    </th>
                    {[
                      "Task",
                      "Assigned To",
                      "Type",
                      "Priority",
                      "Status",
                      "Due Date",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className={cx(
                          "px-3 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500",
                          heading === "Actions" && "text-right"
                        )}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-20 text-center">
                        <Loader2
                          size={28}
                          className="mx-auto animate-spin"
                          style={{ color: MAROON }}
                        />
                        <p className="mt-3 text-sm font-semibold text-slate-500">
                          Loading tasks...
                        </p>
                      </td>
                    </tr>
                  ) : pageTasks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-20 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                          <FileSpreadsheet size={25} />
                        </div>
                        <h3 className="mt-4 text-sm font-extrabold text-slate-800">
                          No tasks found
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Change filters or create your first task.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowBulkCreateModal(true)}
                          className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold text-white"
                          style={{ backgroundColor: MAROON }}
                        >
                          <Plus size={16} />
                          Bulk Create Tasks
                        </button>
                      </td>
                    </tr>
                  ) : (
                    pageTasks.map((task) => {
                      const id = taskId(task);
                      const title = taskTitle(task);
                      const checked = selectedTasks.includes(id);

                      return (
                        <tr
                          key={id}
                          className={cx(
                            "transition hover:bg-slate-50/80",
                            checked && "bg-rose-50/40"
                          )}
                        >
                          <td className="px-4 py-4 align-top">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleTask(id)}
                              aria-label={`Select ${title}`}
                              className="mt-1 h-4 w-4 accent-[#741C29]"
                            />
                          </td>

                          <td className="max-w-[330px] px-3 py-4 align-top">
                            <div className="flex items-start gap-3">
                              <div
                                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold"
                                style={{
                                  backgroundColor: "#741C2912",
                                  color: MAROON,
                                }}
                              >
                                #{id ?? "—"}
                              </div>
                              <div className="min-w-0">
                                <p className="break-words text-sm font-extrabold text-slate-900">
                                  {title}
                                </p>
                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                  {task.description || "No description"}
                                </p>
                                <p className="mt-1.5 text-[10px] font-semibold text-slate-400">
                                  Created{" "}
                                  {formatDate(task.created_at || task.createdAt)}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-4 align-top">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold text-slate-600">
                                {staffName(task, users)
                                  .split(" ")
                                  .filter(Boolean)
                                  .slice(0, 2)
                                  .map((part) => part[0])
                                  .join("")
                                  .toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800">
                                  {staffName(task, users)}
                                </p>
                                <p className="mt-0.5 text-[11px] text-slate-400">
                                  {assignedId(task)
                                    ? `Staff ID: ${assignedId(task)}`
                                    : "Not assigned"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-4 align-top">
                            <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                              {task.type || task.task_type || "General"}
                            </span>
                          </td>

                          <td className="px-3 py-4 align-top">
                            <span
                              className={cx(
                                "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold capitalize",
                                badgePriority(task.priority)
                              )}
                            >
                              {task.priority || "Normal"}
                            </span>
                          </td>

                          <td className="px-3 py-4 align-top">
                            <span
                              className={cx(
                                "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset",
                                badgeStatus(task.status)
                              )}
                            >
                              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                              {task.status || "Pending"}
                            </span>
                          </td>

                          <td className="px-3 py-4 align-top">
                            <p className="text-xs font-bold text-slate-700">
                              {formatDate(task.due_date)}
                            </p>
                          </td>

                          <td className="px-3 py-4 align-top">
                            <div className="flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditTask(task)}
                                title="Edit task"
                                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteTask(task)}
                                title="Delete task"
                                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {!loading && filteredTasks.length > 0 && (
              <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="text-xs font-medium text-slate-500">
                  Showing{" "}
                  <strong className="text-slate-800">
                    {(currentPage - 1) * PAGE_SIZE + 1}–
                    {Math.min(currentPage * PAGE_SIZE, filteredTasks.length)}
                  </strong>{" "}
                  of{" "}
                  <strong className="text-slate-800">
                    {filteredTasks.length}
                  </strong>{" "}
                  tasks
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ArrowLeft size={14} />
                    Previous
                  </button>
                  <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-extrabold text-slate-700">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Next
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </section>

          <div className="mt-5 flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>CallCRM · Daily Task Management</p>
            <p className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Dashboard ready
            </p>
          </div>
        </div>
      </main>

      {/* Single task create/edit modal */}
      {showTaskModal && (
        <Modal
          title={editingTask ? "Edit Task" : "Create New Task"}
          subtitle="Enter task details and optional staff assignment."
          onClose={() => !saving && setShowTaskModal(false)}
          wide
        >
          <form onSubmit={saveTask} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-extrabold text-slate-700">
                  Task Title *
                </label>
                <input
                  required
                  maxLength={250}
                  value={form.title}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Enter task title"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-[#741C29] focus:ring-2 focus:ring-[#741C29]/10"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-extrabold text-slate-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe the task..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-[#741C29]"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-extrabold text-slate-700">
                  Task Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      type: e.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                >
                  <option value="">General</option>
                  {types.map((type) => {
                    const name = type.name || type.type;
                    return (
                      <option key={type.id ?? name} value={name}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-extrabold text-slate-700">
                  Priority
                </label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      priority: e.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                >
                  <option>Low</option>
                  <option>Normal</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-extrabold text-slate-700">
                  Assign To
                </label>
                <select
                  value={form.assigned_to}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      assigned_to: e.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                >
                  <option value="">Unassigned</option>
                  {staffOptions.map((user) => (
                    <option key={user.id} value={String(user.id)}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-extrabold text-slate-700">
                  Due Date
                </label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      due_date: e.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                />
              </div>

              {editingTask && (
                <div>
                  <label className="mb-2 block text-xs font-extrabold text-slate-700">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        status: e.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={() => setShowTaskModal(false)}
                className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: MAROON }}
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={17} />
                )}
                {editingTask ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Bulk create multiple tasks modal */}
      {showBulkCreateModal && (
        <Modal
          title="Bulk Create Tasks"
          subtitle="Har line par ek task likhein. Sab tasks ek saath create ho jayenge."
          onClose={() => !saving && setShowBulkCreateModal(false)}
          wide
        >
          <form onSubmit={createMultipleTasks} className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="text-sm font-extrabold text-slate-800">
                  Task Titles *
                </label>
                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-[#741C29]">
                  {
                    bulkTaskText
                      .split(/\r?\n/)
                      .filter((line) => line.trim()).length
                  }{" "}
                  tasks
                </span>
              </div>

              <textarea
                required
                rows={9}
                value={bulkTaskText}
                onChange={(e) => setBulkTaskText(e.target.value)}
                placeholder={
                  "Customer follow-up\nPrepare daily report\nUpdate CRM records\nVerify pending leads"
                }
                className="w-full rounded-xl border border-slate-200 p-3.5 text-sm leading-6 outline-none focus:border-[#741C29] focus:ring-2 focus:ring-[#741C29]/10"
              />
              <p className="mt-2 text-xs text-slate-500">
                Har line par ek task. Empty lines ignore hongi.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-extrabold text-slate-700">
                Shared Description (Optional)
              </label>
              <textarea
                rows={2}
                value={bulkTaskDescription}
                onChange={(e) => setBulkTaskDescription(e.target.value)}
                placeholder="This description will be applied to every task."
                className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#741C29]"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-extrabold text-slate-700">
                  Task Type
                </label>
                <select
                  value={bulkTaskType}
                  onChange={(e) => setBulkTaskType(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                >
                  <option value="">General</option>
                  {types.map((type) => {
                    const name = type.name || type.type;
                    return (
                      <option key={type.id ?? name} value={name}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-extrabold text-slate-700">
                  Priority
                </label>
                <select
                  value={bulkTaskPriority}
                  onChange={(e) => setBulkTaskPriority(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                >
                  <option>Low</option>
                  <option>Normal</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-extrabold text-slate-700">
                  Assign All Tasks To (Optional)
                </label>
                <select
                  value={bulkTaskStaff}
                  onChange={(e) => setBulkTaskStaff(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                >
                  <option value="">Create tasks without assignment</option>
                  {staffOptions.map((user) => (
                    <option key={user.id} value={String(user.id)}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={() => setShowBulkCreateModal(false)}
                className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  saving ||
                  !bulkTaskText.split(/\r?\n/).some((line) => line.trim())
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: MAROON }}
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={17} />
                )}
                Create All Tasks
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Bulk assignment modal */}
      {showBulkAssignModal && (
        <Modal
          title="Bulk Task Assignment"
          subtitle={`Assign ${selectedTasks.length} selected task(s) to staff.`}
          onClose={() => !saving && setShowBulkAssignModal(false)}
          wide
        >
          <form onSubmit={assignSelectedTasks} className="space-y-5">
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
              <p className="text-sm font-extrabold text-[#741C29]">
                {selectedTasks.length} selected task(s)
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Choose staff members. Selected tasks rotate between them.
              </p>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <label className="text-sm font-extrabold text-slate-800">
                  Select Staff Members
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setBulkStaff(
                      bulkStaff.length === staffOptions.length
                        ? []
                        : staffOptions.map((user) => String(user.id))
                    )
                  }
                  className="text-xs font-bold text-[#741C29] hover:underline"
                >
                  {bulkStaff.length === staffOptions.length
                    ? "Deselect all"
                    : "Select all"}
                </button>
              </div>

              <div className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
                {staffOptions.map((user) => {
                  const id = String(user.id);
                  const checked = bulkStaff.includes(id);

                  return (
                    <label
                      key={id}
                      className={cx(
                        "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition",
                        checked
                          ? "border-[#741C29]/40 bg-rose-50"
                          : "border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setBulkStaff((current) =>
                            checked
                              ? current.filter((item) => item !== id)
                              : [...current, id]
                          )
                        }
                        className="h-4 w-4 accent-[#741C29]"
                      />
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold text-slate-600">
                        {user.name
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-800">
                          {user.name}
                        </p>
                        <p className="truncate text-[11px] text-slate-500">
                          {user.role || user.email || `ID: ${id}`}
                        </p>
                      </div>
                      {checked && (
                        <Check
                          size={16}
                          className="ml-auto text-[#741C29]"
                        />
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-extrabold text-slate-800">
                Distribution Mode
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setDistribution("round-robin")}
                  className={cx(
                    "rounded-xl border p-4 text-left",
                    distribution === "round-robin"
                      ? "border-[#741C29] bg-rose-50 ring-2 ring-[#741C29]/10"
                      : "border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <span className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
                    <RefreshCw size={17} style={{ color: MAROON }} />
                    Round Robin
                  </span>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Rotate each task between selected staff members.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDistribution("equal")}
                  className={cx(
                    "rounded-xl border p-4 text-left",
                    distribution === "equal"
                      ? "border-[#741C29] bg-rose-50 ring-2 ring-[#741C29]/10"
                      : "border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <span className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
                    <BarChart3 size={17} style={{ color: MAROON }} />
                    Equal Distribution
                  </span>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Divide the selected tasks as evenly as possible.
                  </p>
                </button>
              </div>
            </div>

            {bulkStaff.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Assignment summary
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-2xl font-extrabold text-slate-900">
                      {selectedTasks.length}
                    </p>
                    <p className="text-xs text-slate-500">Tasks</p>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-slate-900">
                      {bulkStaff.length}
                    </p>
                    <p className="text-xs text-slate-500">Staff members</p>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-slate-900">
                      {Math.floor(selectedTasks.length / bulkStaff.length)}–
                      {Math.ceil(selectedTasks.length / bulkStaff.length)}
                    </p>
                    <p className="text-xs text-slate-500">Approx. tasks per staff</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={() => setShowBulkAssignModal(false)}
                className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !bulkStaff.length || !selectedTasks.length}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: MAROON }}
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Assign Selected Tasks
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Task types modal */}
      {showTypesModal && (
        <Modal
          title="Manage Task Types"
          subtitle="Add and manage task categories."
          onClose={() => setShowTypesModal(false)}
        >
          <form onSubmit={addType} className="flex gap-2">
            <input
              required
              maxLength={100}
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              placeholder="e.g. Follow Up"
              className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#741C29]"
            />
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center gap-1.5 rounded-xl px-4 text-sm font-bold text-white disabled:opacity-50"
              style={{ backgroundColor: MAROON }}
            >
              <Plus size={16} />
              Add
            </button>
          </form>

          <div className="mt-5 space-y-2">
            {types.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                <Layers size={24} className="mx-auto text-slate-400" />
                <p className="mt-2 text-sm font-bold text-slate-700">
                  No task types found
                </p>
              </div>
            ) : (
              types.map((type) => {
                const id = type.id ?? type.type_id;
                const name = type.name || type.type || "Untitled type";

                return (
                  <div
                    key={id ?? name}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-[#741C29]">
                        <Layers size={17} />
                      </div>
                      <span className="truncate text-sm font-bold text-slate-800">
                        {name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeType(type)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                      title={`Delete ${name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

