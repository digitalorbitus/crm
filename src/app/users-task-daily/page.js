
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ListTodo,
  Loader2,
  RefreshCw,
  Search,
  UserRound,
  X,
  Menu,
  LayoutDashboard,
  ChevronRight,
  Activity,
  Filter,
  CircleCheck,
  ClipboardList,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";

const API = "/api/other-users-task-daily";

const STATUSES = [
  "Active",
  "Pending",
  "Called",
  "In Progress",
  "Completed",
  "Cancelled",
];

const MAROON = "#741C29";

function statusClass(status) {
  const styles = {
    Active: "bg-blue-50 text-blue-700 border-blue-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Called: "bg-violet-50 text-violet-700 border-violet-200",
    "In Progress": "bg-cyan-50 text-cyan-700 border-cyan-200",
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return styles[status] || "bg-slate-100 text-slate-700 border-slate-200";
}

function formatDate(value) {
  if (!value) return "—";

  const date = String(value).slice(0, 10);
  const parts = date.split("-");

  return parts.length === 3
    ? `${parts[2]}/${parts[1]}/${parts[0]}`
    : date;
}

function SummaryCard({ title, value, description, icon: Icon, color }) {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>

        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}12`, color }}
        >
          <Icon size={22} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

export default function OtherUsersTaskDailyStaffPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const loadTasks = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");

    try {
      const response = await fetch(API, {
        credentials: "same-origin",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to load tasks");
      }

      setTasks(Array.isArray(data.tasks) ? data.tasks : []);
    } catch (err) {
      setError(err.message || "Unable to load your tasks.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesStatus =
        statusFilter === "All" || task.status === statusFilter;

      const matchesSearch =
        !query ||
        [
          task.title,
          task.description,
          task.task_type,
          task.status,
          task.id,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        );

      return matchesStatus && matchesSearch;
    });
  }, [tasks, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: tasks.length,
      pending: tasks.filter((task) =>
        ["Active", "Pending"].includes(task.status)
      ).length,
      progress: tasks.filter((task) =>
        ["Called", "In Progress"].includes(task.status)
      ).length,
      completed: tasks.filter((task) => task.status === "Completed").length,
    }),
    [tasks]
  );

  async function updateStatus(task, status) {
    const previousTasks = tasks;

    setUpdatingId(task.id);
    setError("");
    setMessage("");

    // Update the UI immediately, then reconcile with the server.
    setTasks((current) =>
      current.map((item) =>
        item.id === task.id ? { ...item, status } : item
      )
    );

    try {
      const response = await fetch(API, {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: task.id,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to update task status");
      }

      setMessage(`Task "${task.title}" updated to ${status}.`);
      await loadTasks(false);
    } catch (err) {
      setTasks(previousTasks);
      setError(err.message || "Status update failed.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="flex flex-col lg:ml-64 h-screen min-h-0 p-4 sm:p-6 lg:p-8 bg-slate-50 text-slate-800 font-sans">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <Sidebar />
      </aside>

      {/* Optional mobile sidebar drawer. Remove this drawer if your
          shared layout already manages responsive sidebar navigation. */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileSidebarOpen(false)}
            className="absolute inset-0 bg-slate-950/50"
          />
          <div className="relative z-10 h-full w-[290px] max-w-[85vw] overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <p className="font-extrabold text-slate-900">CallCRM</p>
                <p className="mt-1 text-xs text-slate-500">Navigation</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      <main className="min-w-0 px-4 py-5 sm:px-6 sm:py-7 xl:px-8">
        <div className="mx-auto max-w-[1500px] space-y-6">
          {/* Page header */}
          <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-1.5" style={{ backgroundColor: MAROON }} />

            <div className="flex flex-col justify-between gap-5 p-5 sm:p-7 xl:flex-row xl:items-center">
              <div className="flex min-w-0 items-start gap-4">
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(true)}
                  className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
                  aria-label="Open navigation"
                >
                  <Menu size={20} />
                </button>

                <div
                  className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm sm:flex"
                  style={{ backgroundColor: MAROON }}
                >
                  <ListTodo size={27} />
                </div>

                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    <span>CallCRM</span>
                    <ChevronRight size={13} />
                    <span>My Work</span>
                    <ChevronRight size={13} />
                    <span style={{ color: MAROON }}>Daily Tasks</span>
                  </div>

                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                    My Daily Tasks
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    View your assigned work, update task progress and manage
                    your daily responsibilities from one place.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pl-0 sm:pl-14 xl:pl-0">
                <div className="mr-auto flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 sm:mr-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-xs font-bold text-emerald-700">
                    Task workspace
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => loadTasks()}
                  disabled={loading}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
              </div>
            </div>
          </header>

          {/* Error alert */}
          {error && (
            <div
              className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
              role="alert"
            >
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
              <p className="min-w-0 flex-1">{error}</p>
              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
                className="rounded-md p-1 hover:bg-rose-100"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* Success alert */}
          {message && (
            <div
              className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
              role="status"
            >
              <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
              <p className="min-w-0 flex-1">{message}</p>
              <button
                type="button"
                onClick={() => setMessage("")}
                aria-label="Dismiss message"
                className="rounded-md p-1 hover:bg-emerald-100"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* Statistics */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            <SummaryCard
              title="My Tasks"
              value={stats.total}
              description="Total assigned tasks"
              icon={ClipboardList}
              color={MAROON}
            />
            <SummaryCard
              title="Pending / Active"
              value={stats.pending}
              description="Tasks waiting to be handled"
              icon={Clock3}
              color="#D97706"
            />
            <SummaryCard
              title="In Progress"
              value={stats.progress}
              description="Called or being worked on"
              icon={Activity}
              color="#0284C7"
            />
            <SummaryCard
              title="Completed"
              value={stats.completed}
              description="Tasks marked as completed"
              icon={CircleCheck}
              color="#059669"
            />
          </section>

          {/* Main task section */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:p-6 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: `${MAROON}12`,
                      color: MAROON,
                    }}
                  >
                    <ListTodo size={19} />
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Assigned to Me
                  </h2>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {filteredTasks.length} task(s) match your current filters.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative sm:min-w-[260px]">
                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search tasks..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-[#741C29] focus:bg-white focus:ring-4 focus:ring-rose-50"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen((open) => !open)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Filter size={16} />
                  Filters
                </button>
              </div>

              {mobileFiltersOpen && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 xl:hidden">
                  <label className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    Filter by status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#741C29]"
                  >
                    <option value="All">All statuses</option>
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="hidden xl:block">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-11 min-w-[170px] rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#741C29]"
                  aria-label="Filter by status"
                >
                  <option value="All">All statuses</option>
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="px-5 py-24 text-center">
                <Loader2
                  size={30}
                  className="mx-auto animate-spin"
                  style={{ color: MAROON }}
                />
                <p className="mt-4 text-sm font-semibold text-slate-500">
                  Loading your tasks...
                </p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="px-5 py-24 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <CalendarDays size={28} />
                </div>
                <h3 className="mt-4 text-base font-extrabold text-slate-800">
                  No tasks found
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  There are no tasks matching your search or selected status.
                  Try changing the filters or refresh your task list.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All");
                  }}
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-bold text-white"
                  style={{ backgroundColor: MAROON }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 bg-slate-50/60 p-4 sm:p-5 xl:grid-cols-2">
                {filteredTasks.map((task) => (
                  <article
                    key={task.id}
                    className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                          style={{
                            backgroundColor: `${MAROON}12`,
                            color: MAROON,
                          }}
                        >
                          <ListTodo size={21} />
                        </div>

                        <div className="min-w-0 pt-0.5">
                          <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-slate-400">
                            Task #{task.id}
                          </p>
                          <h3 className="mt-1 break-words text-base font-extrabold leading-6 text-slate-900">
                            {task.title || "Untitled task"}
                          </h3>
                        </div>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-extrabold ${statusClass(task.status)}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {task.status || "Pending"}
                      </span>
                    </div>

                    <div className="mt-5 flex-1">
                      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                        {task.description || "No additional instructions."}
                      </p>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
                        <ClipboardList size={14} className="text-slate-400" />
                        {task.task_type || "Daily Task"}
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
                        <CalendarDays size={14} className="text-slate-400" />
                        {formatDate(task.task_date)}
                      </span>
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <label
                          htmlFor={`task-status-${task.id}`}
                          className="text-xs font-extrabold uppercase tracking-wide text-slate-500"
                        >
                          Update status
                        </label>

                        {updatingId === task.id && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                            <Loader2 size={13} className="animate-spin" />
                            Saving
                          </span>
                        )}
                      </div>

                      <select
                        id={`task-status-${task.id}`}
                        value={task.status || "Pending"}
                        disabled={updatingId === task.id}
                        onChange={(event) =>
                          updateStatus(task, event.target.value)
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[#741C29] focus:ring-4 focus:ring-rose-50 disabled:cursor-wait disabled:bg-slate-50 disabled:opacity-60"
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <footer className="flex flex-col gap-2 border-t border-slate-200 bg-white px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>CallCRM · My Daily Tasks</p>
              <p className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" />
                Changes are saved through the CRM API
              </p>
            </footer>
          </section>
        </div>
      </main>
    </div>
  );
}

