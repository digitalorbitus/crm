// "use client";
// import Sidebar from "../../components/Sidebar";
// import LogoutModal from "@/components/LogoutModal";
// import React, {
//   useState,
//   useEffect,
//    useMemo,
//    useCallback,
//   useRef,
// } from "react";
// import {
//   Image as ImageIcon,
//   Menu,
//   Users,
//   X,
//   Phone,
//   Video,
//   ArrowRight,
//   ShieldCheck,
//   CheckCircle2,
//   Sparkles,
//   CalendarDays,
//   Activity,
// } from "lucide-react";
// export default function Home() {
  
//     const [sidebarOpen, setSidebarOpen] = useState(false);
//       const [loggingOut, setLoggingOut] = useState(false);
//     const [showLogoutModal, setShowLogoutModal] = useState(false);
   
//      const handleConfirmLogout = async () => {
//     setLoggingOut(true);

//     try {
//       localStorage.removeItem("crm_login_time");

//       const response = await fetch("/api/logout", {
//         method: "POST",
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         alert(data?.message || "Logout failed");

//         setLoggingOut(false);
//         setShowLogoutModal(false);

//         return;
//       }

//       router.push("/login");
//     } catch (error) {
//       console.error("Logout error:", error);

//       alert(
//         "Something went wrong during logout."
//       );

//       setLoggingOut(false);
//       setShowLogoutModal(false);
//     }
//   };
//   return (
//    <main className="min-h-screen bg-[#F5F7FB] text-slate-900">
//       {/* Mobile Header */}
//       <header className="lg:hidden sticky top-0 z-50 h-16 bg-[#050B1E] border-b border-white/10 flex items-center justify-between px-4 text-white">
//         <div className="flex items-center gap-2.5">
//           <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 p-[2px]">
//             <div className="w-full h-full rounded-[10px] bg-[#050B1E] flex items-center justify-center">
//               <div className="w-4 h-4 rounded-full border-2 border-rose-500 flex items-center justify-center">
//                 <div className="w-1.5 h-1.5 bg-white rounded-full" />
//               </div>
//             </div>
//           </div>

//           <span className="font-extrabold text-xl tracking-tight">
//             CallCRM
//           </span>
//         </div>

//         <button
//           type="button"
//           onClick={() => setSidebarOpen(!sidebarOpen)}
//           className="p-2 rounded-xl text-slate-300 hover:bg-white/10 transition"
//         >
//           {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
//         </button>
//       </header>

//       {/* Sidebar */}
//       <Sidebar
//         sidebarOpen={sidebarOpen}
//         setSidebarOpen={setSidebarOpen}
//         setShowLogoutModal={setShowLogoutModal}
//       />

//       {/* Main Content */}
//       <div className="lg:ml-[260px] min-h-screen">
//         {/* Top Bar */}
//         <div className="hidden lg:flex h-20 bg-white border-b border-slate-200 items-center justify-between px-8">
//           <div>
//             <p className="text-sm text-slate-500">
//               Workspace
//             </p>

//             <h1 className="text-xl font-bold text-slate-900">
//               Integrations
//             </h1>
//           </div>

//           <div className="flex items-center gap-3">
//             <div className="flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1.5">
//               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
//               <span className="text-xs font-semibold text-emerald-700">
//                 System Online
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Page */}
//         <section className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
//           <div className="mx-auto max-w-7xl">

//             {/* Page Heading */}
//             {/* <div className="mb-8">
//               <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 mb-2">
//                 <Sparkles size={16} />
//                 <span>CRM Integrations</span>
//               </div>

//               <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
//                 Connect your tools
//               </h2>

//               <p className="mt-2 max-w-2xl text-sm sm:text-base leading-6 text-slate-500">
//                 Connect your favorite business tools with CallCRM and
//                 manage your customer communication from one powerful
//                 workspace.
//               </p>
//             </div> */}

//             {/* Stats */}
//             {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//               <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
//                 <div className="flex items-center justify-between">
//                   <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
//                     <Phone size={19} className="text-indigo-600" />
//                   </div>
//                   <span className="text-xs font-semibold text-emerald-600">
//                     +12%
//                   </span>
//                 </div>

//                 <p className="mt-4 text-2xl font-bold text-slate-900">
//                   1,284
//                 </p>

//                 <p className="text-xs text-slate-500 mt-1">
//                   Total Calls
//                 </p>
//               </div>

//               <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
//                 <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
//                   <Users size={19} className="text-violet-600" />
//                 </div>

//                 <p className="mt-4 text-2xl font-bold text-slate-900">
//                   482
//                 </p>

//                 <p className="text-xs text-slate-500 mt-1">
//                   Active Contacts
//                 </p>
//               </div>

//               <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
//                 <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
//                   <CalendarDays size={19} className="text-amber-600" />
//                 </div>

//                 <p className="mt-4 text-2xl font-bold text-slate-900">
//                   36
//                 </p>

//                 <p className="text-xs text-slate-500 mt-1">
//                   Meetings
//                 </p>
//               </div>

//               <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
//                 <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
//                   <Activity size={19} className="text-emerald-600" />
//                 </div>

//                 <p className="mt-4 text-2xl font-bold text-slate-900">
//                   98.4%
//                 </p>

//                 <p className="text-xs text-slate-500 mt-1">
//                   System Uptime
//                 </p>
//               </div>
//             </div> */}

//             {/* Zoom Integration Card */}
//             <div className="relative overflow-hidden rounded-3xl bg-[#050B1E] shadow-xl">
//               {/* Background decorations */}
//               <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl" />
//               <div className="absolute -left-20 -bottom-28 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />

//               <div className="relative p-6 sm:p-8 lg:p-10">
//                 <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

//                   {/* Left */}
//                   <div className="max-w-2xl">
//                     <div className="flex items-center gap-4 mb-6">
//                       <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-lg">
//                         <Video
//                           size={28}
//                           strokeWidth={2.2}
//                           className="text-[#2D8CFF]"
//                         />
//                       </div>

//                       <div>
//                         <div className="flex items-center gap-2">
//                           <h3 className="text-2xl font-bold text-white">
//                             Zoom
//                           </h3>

//                           <span className="rounded-full bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
//                             AVAILABLE
//                           </span>
//                         </div>

//                         <p className="text-sm text-slate-400 mt-1">
//                           Video meetings & team communication
//                         </p>
//                       </div>
//                     </div>

//                     <h4 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
//                       Bring your Zoom meetings directly
//                       into your CRM.
//                     </h4>

//                     <p className="mt-4 text-sm sm:text-base leading-7 text-slate-400 max-w-xl">
//                       Connect your Zoom account to create meetings,
//                       manage schedules, access meeting information and
//                       keep your customer communication organized in one
//                       place.
//                     </p>

//                     <div className="mt-6 grid sm:grid-cols-2 gap-3">
//                       <div className="flex items-center gap-2.5 text-sm text-slate-300">
//                         <CheckCircle2
//                           size={17}
//                           className="text-emerald-400"
//                         />
//                         Create Zoom meetings
//                       </div>

//                       <div className="flex items-center gap-2.5 text-sm text-slate-300">
//                         <CheckCircle2
//                           size={17}
//                           className="text-emerald-400"
//                         />
//                         Sync meeting details
//                       </div>

//                       <div className="flex items-center gap-2.5 text-sm text-slate-300">
//                         <CheckCircle2
//                           size={17}
//                           className="text-emerald-400"
//                         />
//                         Manage schedules
//                       </div>

//                       <div className="flex items-center gap-2.5 text-sm text-slate-300">
//                         <CheckCircle2
//                           size={17}
//                           className="text-emerald-400"
//                         />
//                         Secure OAuth connection
//                       </div>
//                     </div>
//                   </div>

//                   {/* Right CTA */}
//                   <div className="lg:min-w-[300px]">
//                     <div className="rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm p-5">
//                       <div className="flex items-center gap-3 mb-5">
//                         <div className="flex -space-x-2">
//                           <div className="w-9 h-9 rounded-full bg-indigo-500 border-2 border-[#11182d]" />
//                           <div className="w-9 h-9 rounded-full bg-rose-500 border-2 border-[#11182d]" />
//                           <div className="w-9 h-9 rounded-full bg-emerald-500 border-2 border-[#11182d]" />
//                         </div>

//                         <div>
//                           <p className="text-sm font-semibold text-white">
//                             Ready to connect?
//                           </p>
//                           <p className="text-xs text-slate-500">
//                             Takes less than a minute
//                           </p>
//                         </div>
//                       </div>
// <a
//   href="/api/zoom/auth"
//   target="_blank"
//   rel="noopener noreferrer"
//   className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-[#050B1E] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-xl"
// >
//   <Video size={18} />

//   <span>Connect Zoom</span>

//   <ArrowRight
//     size={17}
//     className="transition-transform duration-200 group-hover:translate-x-1"
//   />
// </a>
//                       <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-500">
//                         <ShieldCheck size={14} />
//                         Secure OAuth authentication
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Bottom Info */}
//             <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">
//               <div className="flex items-center gap-3">
//                 <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
//                   <ShieldCheck
//                     size={18}
//                     className="text-emerald-600"
//                   />
//                 </div>

//                 <div>
//                   <p className="text-sm font-semibold text-slate-800">
//                     Your connection is secure
//                   </p>

//                   <p className="text-xs text-slate-500">
//                     We use OAuth. Your Zoom password is never stored.
//                   </p>
//                 </div>
//               </div>

//               <span className="text-xs font-medium text-slate-400">
//                 CallCRM Integrations
//               </span>
//             </div>
//           </div>
//         </section>
//       </div>

//       {/* Logout Modal */}
//       <LogoutModal
//         show={showLogoutModal}
//         loggingOut={loggingOut}
//         onCancel={() => setShowLogoutModal(false)}
//         onConfirm={handleConfirmLogout}
//       />
//     </main>
//   );
// }















"use client";

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  RefreshCw,
  Search,
  CalendarDays,
  Clock3,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function CallsPage() {
  const [calls, setCalls] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [from, setFrom] =
    useState("");

  const [to, setTo] =
    useState("");

  const [nextPageToken, setNextPageToken] =
    useState(null);

  const [history, setHistory] =
    useState([]);

  // ==========================================
  // DEFAULT DATES
  // ==========================================

  useEffect(() => {
    const today =
      new Date();

    const previous =
      new Date();

    previous.setDate(
      previous.getDate() - 6
    );

    setTo(
      formatDate(today)
    );

    setFrom(
      formatDate(previous)
    );
  }, []);

  // ==========================================
  // FORMAT DATE
  // ==========================================

  function formatDate(date) {
    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  // ==========================================
  // LOAD CALLS
  // ==========================================

  const loadCalls =
    useCallback(
      async ({
        reset = true,
        pageToken = null,
      } = {}) => {
        try {
          setError("");

          if (reset) {
            setLoading(true);
          } else {
            setRefreshing(true);
          }

          const params =
            new URLSearchParams();

          params.set(
            "page_size",
            "30"
          );

          if (from) {
            params.set(
              "from",
              from
            );
          }

          if (to) {
            params.set(
              "to",
              to
            );
          }

          if (pageToken) {
            params.set(
              "next_page_token",
              pageToken
            );
          }

          const response =
            await fetch(
              `/api/zoom/call-history?${params.toString()}`,
              {
                method: "GET",
                cache: "no-store",
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.error ||
                "Failed to load calls"
            );
          }

          setCalls(
            Array.isArray(data.calls)
              ? data.calls
              : []
          );

          setNextPageToken(
            data.next_page_token ||
              null
          );

          if (reset) {
            setHistory([]);
          }
        } catch (err) {
          console.error(
            "CALL HISTORY ERROR:",
            err
          );

          setError(
            err?.message ||
              "Unable to load Zoom calls"
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [from, to]
    );

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    if (from && to) {
      loadCalls();
    }
  }, [
    from,
    to,
    loadCalls,
  ]);

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredCalls =
    calls.filter((call) => {
      const text = [
        call.caller_name,
        call.callee_name,
        call.caller_did_number,
        call.callee_did_number,
        call.direction,
        call.call_result,
        call.department,
        call.site_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(
        search.toLowerCase()
      );
    });

  // ==========================================
  // FORMAT DURATION
  // ==========================================

  function formatDuration(
    seconds
  ) {
    const value =
      Number(seconds || 0);

    const minutes =
      Math.floor(
        value / 60
      );

    const remaining =
      value % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remaining).padStart(
      2,
      "0"
    )}`;
  }

  // ==========================================
  // FORMAT DATE TIME
  // ==========================================

  function formatDateTime(
    value
  ) {
    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleString(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  // ==========================================
  // DIRECTION
  // ==========================================

  function getDirectionIcon(
    direction
  ) {
    if (
      direction ===
      "inbound"
    ) {
      return (
        <PhoneIncoming
          size={17}
        />
      );
    }

    if (
      direction ===
      "outbound"
    ) {
      return (
        <PhoneOutgoing
          size={17}
        />
      );
    }

    return (
      <Phone
        size={17}
      />
    );
  }

  // ==========================================
  // DIRECTION STYLE
  // ==========================================

  function getDirectionStyle(
    direction
  ) {
    if (
      direction ===
      "inbound"
    ) {
      return "bg-blue-50 text-blue-600 border-blue-100";
    }

    if (
      direction ===
      "outbound"
    ) {
      return "bg-violet-50 text-violet-600 border-violet-100";
    }

    return "bg-slate-50 text-slate-600 border-slate-100";
  }

  // ==========================================
  // RESULT
  // ==========================================

  function getResultStyle(
    result
  ) {
    const value =
      String(
        result || ""
      ).toLowerCase();

    if (
      value.includes(
        "answer"
      ) ||
      value.includes(
        "connect"
      )
    ) {
      return "bg-emerald-50 text-emerald-700";
    }

    if (
      value.includes(
        "miss"
      ) ||
      value.includes(
        "no_answer"
      )
    ) {
      return "bg-rose-50 text-rose-700";
    }

    return "bg-slate-100 text-slate-600";
  }

  // ==========================================
  // NEXT PAGE
  // ==========================================

  async function handleNext() {
    if (!nextPageToken) {
      return;
    }

    setHistory((prev) => [
      ...prev,
      nextPageToken,
    ]);

    await loadCalls({
      reset: false,
      pageToken:
        nextPageToken,
    });
  }

  // ==========================================
  // REFRESH
  // ==========================================

  function handleRefresh() {
    loadCalls();
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (
    loading &&
    calls.length === 0
  ) {
    return (
      <main className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            <Loader2
              className="animate-spin text-indigo-600"
              size={24}
            />
          </div>

          <p className="text-sm font-medium text-slate-500">
            Loading Zoom calls...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F7FB] text-slate-900">
      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1600px] px-5 py-6 sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Phone
                    size={21}
                  />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Calls
                  </h1>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Zoom Phone call history
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={
                handleRefresh
              }
              disabled={
                refreshing
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#050B1E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ================================= */}
      {/* CONTENT */}
      {/* ================================= */}

      <section className="mx-auto max-w-[1600px] px-5 py-6 sm:px-8">
        {/* ERROR */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Unable to load calls
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ================================= */}
        {/* FILTER CARD */}
        {/* ================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto]">
            {/* SEARCH */}

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search caller, number, department..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            {/* FROM */}

            <div className="relative">
              <CalendarDays
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="date"
                value={from}
                onChange={(e) =>
                  setFrom(
                    e.target.value
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-indigo-400 focus:bg-white"
              />
            </div>

            {/* TO */}

            <div className="relative">
              <CalendarDays
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="date"
                value={to}
                onChange={(e) =>
                  setTo(
                    e.target.value
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-indigo-400 focus:bg-white"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                loadCalls()
              }
              className="h-11 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Apply
            </button>
          </div>
        </div>

        {/* ================================= */}
        {/* STATS */}
        {/* ================================= */}

        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={
              <Phone
                size={18}
              />
            }
            label="Total Calls"
            value={
              filteredCalls.length
            }
          />

          <StatCard
            icon={
              <PhoneIncoming
                size={18}
              />
            }
            label="Inbound"
            value={
              filteredCalls.filter(
                (call) =>
                  call.direction ===
                  "inbound"
              ).length
            }
          />

          <StatCard
            icon={
              <PhoneOutgoing
                size={18}
              />
            }
            label="Outbound"
            value={
              filteredCalls.filter(
                (call) =>
                  call.direction ===
                  "outbound"
              ).length
            }
          />

          <StatCard
            icon={
              <Clock3
                size={18}
              />
            }
            label="Talk Time"
            value={formatDuration(
              filteredCalls.reduce(
                (
                  total,
                  call
                ) =>
                  total +
                  Number(
                    call.duration ||
                      0
                  ),
                0
              )
            )}
          />
        </div>

        {/* ================================= */}
        {/* TABLE */}
        {/* ================================= */}

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Caller
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Direction
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Recipient
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Result
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Duration
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Date & Time
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Department
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredCalls.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center"
                    >
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                          <Phone
                            size={25}
                          />
                        </div>

                        <h3 className="mt-4 text-sm font-bold text-slate-800">
                          No calls found
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Try another date range or search term.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCalls.map(
                    (
                      call,
                      index
                    ) => (
                      <tr
                        key={
                          call.id ||
                          call.call_history_uuid ||
                          call.call_id ||
                          index
                        }
                        className="transition hover:bg-slate-50"
                      >
                        {/* CALLER */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                              <User
                                size={18}
                              />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-800">
                                {call.caller_name ||
                                  call.caller_did_number ||
                                  "Unknown"}
                              </p>

                              {call.caller_name &&
                                call.caller_did_number && (
                                  <p className="mt-0.5 text-xs text-slate-400">
                                    {
                                      call.caller_did_number
                                    }
                                  </p>
                                )}
                            </div>
                          </div>
                        </td>

                        {/* DIRECTION */}

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getDirectionStyle(
                              call.direction
                            )}`}
                          >
                            {getDirectionIcon(
                              call.direction
                            )}

                            {call.direction ||
                              "unknown"}
                          </span>
                        </td>

                        {/* RECIPIENT */}

                        <td className="px-5 py-4">
                          <div>
                            <p className="font-medium text-slate-700">
                              {call.callee_name ||
                                "Unknown"}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {call.callee_did_number ||
                                call.callee_ext_number ||
                                "—"}
                            </p>
                          </div>
                        </td>

                        {/* RESULT */}

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getResultStyle(
                              call.call_result
                            )}`}
                          >
                            {String(
                              call.call_result ||
                                "Unknown"
                            ).replace(
                              /_/g,
                              " "
                            )}
                          </span>
                        </td>

                        {/* DURATION */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Clock3
                              size={16}
                              className="text-slate-400"
                            />

                            {formatDuration(
                              call.duration
                            )}
                          </div>
                        </td>

                        {/* DATE */}

                        <td className="px-5 py-4">
                          <p className="text-sm text-slate-700">
                            {formatDateTime(
                              call.start_time
                            )}
                          </p>
                        </td>

                        {/* DEPARTMENT */}

                        <td className="px-5 py-4">
                          <span className="text-sm text-slate-600">
                            {call.department ||
                              call.site_name ||
                              "—"}
                          </span>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* ================================= */}
          {/* PAGINATION */}
          {/* ================================= */}

          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {filteredCalls.length}
              </span>{" "}
              calls
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-300"
              >
                <ChevronLeft
                  size={17}
                />
              </button>

              <button
                type="button"
                disabled={
                  !nextPageToken ||
                  refreshing
                }
                onClick={
                  handleNext
                }
                className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next

                <ChevronRight
                  size={17}
                />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// ==========================================
// STAT CARD
// ==========================================

function StatCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs font-medium text-slate-500">
        {label}
      </p>
    </div>
  );
}
