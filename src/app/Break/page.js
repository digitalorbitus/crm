
// "use client";

// import {
//   CalendarDays,
//   Coffee,
//   Users,
//   Search,
//   Filter,
//   ChevronDown,
//   Timer,
//   CheckCircle2,
//   CircleAlert,
//   RefreshCw,
//   X,
//   Activity,
//   ShieldCheck,
//   Clock3,
//   Utensils,
//   Moon,
//   Bath,
// } from "lucide-react";

// import { useState, useCallback, useEffect, useMemo } from "react";
// import { useRouter } from "next/navigation";
// import Sidebar from "@/components/Sidebar";

// export default function BreaksPage() {
//   const router = useRouter();

//   // =========================================================
//   // STATE
//   // =========================================================

//   const [currentUser, setCurrentUser] = useState(null);

//   const [breakHistory, setBreakHistory] = useState([]);

//   const [breakStats, setBreakStats] = useState({
//     total: 0,
//     namaz: 0,
//     lunch: 0,
//     washroom: 0,
//     other: 0,
//   });

//   const [loading, setLoading] = useState(true);
//   const [historyLoading, setHistoryLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const [search, setSearch] = useState("");
//   const [typeFilter, setTypeFilter] = useState("All");
//   const [dateFilter, setDateFilter] = useState("");

//   const [showFilters, setShowFilters] = useState(false);

//   // =========================================================
//   // FETCH CURRENT USER
//   // =========================================================

//   const fetchCurrentUser = useCallback(async () => {
//     try {
//       const response = await fetch("/api/auth/me", {
//         method: "GET",
//         cache: "no-store",
//       });

//       if (!response.ok) {
//         throw new Error("Failed to fetch current user");
//       }

//       const data = await response.json();

//       if (!data?.user) {
//         router.push("/login");
//         return null;
//       }

//       setCurrentUser(data.user);

//       return data.user;
//     } catch (error) {
//       console.error("CURRENT USER ERROR:", error);

//       router.push("/login");

//       return null;
//     }
//   }, [router]);

//   // =========================================================
//   // FETCH BREAK HISTORY
//   // =========================================================

//   const fetchBreakHistory = useCallback(async (manual = false) => {
//     try {
//       if (manual) {
//         setRefreshing(true);
//       } else {
//         setHistoryLoading(true);
//       }

//       const response = await fetch(
//         `/api/admin/break-history?_live=${Date.now()}`,
//         {
//           method: "GET",
//           cache: "no-store",
//           headers: {
//             "Cache-Control": "no-cache",
//             Pragma: "no-cache",
//           },
//         }
//       );

//       const data = await response.json();

//       console.log("BREAK HISTORY DATA:", data);

//       if (response.status === 401) {
//         router.push("/login");
//         return;
//       }

//       if (!response.ok || !data.success) {
//         throw new Error(
//           data.message || "Failed to fetch break history"
//         );
//       }

//       const breaks = Array.isArray(data.breaks)
//         ? data.breaks
//         : [];

//       setBreakHistory(breaks);

//       setBreakStats(
//         data.stats || {
//           total: 0,
//           namaz: 0,
//           lunch: 0,
//           washroom: 0,
//           other: 0,
//         }
//       );
//     } catch (error) {
//       console.error("BREAK HISTORY FETCH ERROR:", error);

//       if (!manual) {
//         setBreakHistory([]);
//       }
//     } finally {
//       setHistoryLoading(false);
//       setRefreshing(false);
//     }
//   }, [router]);

//   // =========================================================
//   // INITIAL LOAD
//   // =========================================================

//   useEffect(() => {
//     let mounted = true;

//     const loadPage = async () => {
//       setLoading(true);

//       const user = await fetchCurrentUser();

//       if (!mounted) return;

//       if (user) {
//         await fetchBreakHistory();
//       }

//       if (mounted) {
//         setLoading(false);
//       }
//     };

//     loadPage();

//     return () => {
//       mounted = false;
//     };
//   }, [fetchCurrentUser, fetchBreakHistory]);

//   // =========================================================
//   // AUTO REFRESH
//   // =========================================================

//   useEffect(() => {
//     if (!currentUser) return;

//     const interval = setInterval(() => {
//       fetchBreakHistory();
//     }, 5000);

//     return () => clearInterval(interval);
//   }, [currentUser, fetchBreakHistory]);

//   // =========================================================
//   // HELPERS
//   // =========================================================

//   const formatDateTime = useCallback((value) => {
//     if (!value) {
//       return "Active";
//     }

//     const date = new Date(value);

//     if (Number.isNaN(date.getTime())) {
//       return "-";
//     }

//     return date.toLocaleString("en-US", {
//       month: "short",
//       day: "2-digit",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//     });
//   }, []);

//   const formatDateOnly = useCallback((value) => {
//     if (!value) return "-";

//     const date = new Date(value);

//     if (Number.isNaN(date.getTime())) {
//       return "-";
//     }

//     return date.toLocaleDateString("en-US", {
//       month: "short",
//       day: "2-digit",
//       year: "numeric",
//     });
//   }, []);

//   const formatDuration = useCallback((seconds) => {
//     if (
//       seconds === null ||
//       seconds === undefined ||
//       seconds === ""
//     ) {
//       return "—";
//     }

//     const totalSeconds = Number(seconds);

//     if (!Number.isFinite(totalSeconds)) {
//       return "—";
//     }

//     const hours = Math.floor(totalSeconds / 3600);
//     const minutes = Math.floor(
//       (totalSeconds % 3600) / 60
//     );
//     const secs = totalSeconds % 60;

//     if (hours > 0) {
//       return `${hours}h ${minutes}m ${secs}s`;
//     }

//     if (minutes > 0) {
//       return `${minutes}m ${secs}s`;
//     }

//     return `${secs}s`;
//   }, []);

//   const getTypeIcon = useCallback((type) => {
//     switch (type) {
//       case "Namaz Break":
//         return Moon;

//       case "Lunch Break":
//         return Utensils;

//       case "Washroom Break":
//         return Bath;

//       default:
//         return Coffee;
//     }
//   }, []);

//   const getTypeStyles = useCallback((type) => {
//     switch (type) {
//       case "Namaz Break":
//         return {
//           wrapper:
//             "bg-violet-50 border-violet-100 text-violet-700",
//           icon: "bg-violet-100 text-violet-600",
//           dot: "bg-violet-500",
//         };

//       case "Lunch Break":
//         return {
//           wrapper:
//             "bg-orange-50 border-orange-100 text-orange-700",
//           icon: "bg-orange-100 text-orange-600",
//           dot: "bg-orange-500",
//         };

//       case "Washroom Break":
//         return {
//           wrapper:
//             "bg-sky-50 border-sky-100 text-sky-700",
//           icon: "bg-sky-100 text-sky-600",
//           dot: "bg-sky-500",
//         };

//       default:
//         return {
//           wrapper:
//             "bg-gray-50 border-gray-200 text-gray-700",
//           icon: "bg-gray-100 text-gray-600",
//           dot: "bg-gray-500",
//         };
//     }
//   }, []);

//   const isActiveBreak = useCallback((item) => {
//     return !item?.ended_at;
//   }, []);

//   // =========================================================
//   // FILTERED HISTORY
//   // =========================================================

//   const filteredBreakHistory = useMemo(() => {
//     let result = [...breakHistory];

//     // SEARCH
//     const searchValue = search.trim().toLowerCase();

//     if (searchValue) {
//       result = result.filter((item) => {
//         return (
//           String(item.name || "")
//             .toLowerCase()
//             .includes(searchValue) ||
//           String(item.email || "")
//             .toLowerCase()
//             .includes(searchValue) ||
//           String(item.team || "")
//             .toLowerCase()
//             .includes(searchValue) ||
//           String(item.break_type || "")
//             .toLowerCase()
//             .includes(searchValue)
//         );
//       });
//     }

//     // BREAK TYPE
//     if (typeFilter !== "All") {
//       result = result.filter(
//         (item) => item.break_type === typeFilter
//       );
//     }

//     // DATE
//     if (dateFilter) {
//       result = result.filter((item) => {
//         if (!item.started_at) return false;

//         const date = new Date(item.started_at);

//         if (Number.isNaN(date.getTime())) {
//           return false;
//         }

//         const year = date.getFullYear();
//         const month = String(
//           date.getMonth() + 1
//         ).padStart(2, "0");
//         const day = String(
//           date.getDate()
//         ).padStart(2, "0");

//         const itemDate = `${year}-${month}-${day}`;

//         return itemDate === dateFilter;
//       });
//     }

//     return result;
//   }, [
//     breakHistory,
//     search,
//     typeFilter,
//     dateFilter,
//   ]);

//   // =========================================================
//   // FILTER RESET
//   // =========================================================

//   const clearFilters = () => {
//     setSearch("");
//     setTypeFilter("All");
//     setDateFilter("");
//   };

//   const hasFilters =
//     search.trim() ||
//     typeFilter !== "All" ||
//     dateFilter;

//   // =========================================================
//   // LOADING
//   // =========================================================

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#F7F8FA] flex">
//         <Sidebar />

//         <main className="flex-1 min-w-0 flex items-center justify-center">
//           <div className="flex flex-col items-center gap-4">
//             <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-[#741C29] animate-spin" />

//             <p className="text-sm font-medium text-gray-500">
//               Loading break history...
//             </p>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   // =========================================================
//   // MAIN UI
//   // =========================================================

//   return (
//     <div className="min-h-screen bg-[#F7F8FA] flex">
//       {/* =====================================================
//           SIDEBAR
//       ===================================================== */}

//       <Sidebar />

//       {/* =====================================================
//           MAIN
//       ===================================================== */}

//       <main className="flex-1 min-w-0 overflow-hidden">
//         <div className="w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
//           {/* =================================================
//               HEADER
//           ================================================= */}

//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">
//             <div>
//               <div className="flex items-center gap-2 mb-2">
//                 <div className="w-9 h-9 rounded-xl bg-[#741C29] flex items-center justify-center shadow-sm">
//                   <CalendarDays
//                     size={18}
//                     className="text-white"
//                   />
//                 </div>

//                 <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#741C29]">
//                   Attendance
//                 </span>
//               </div>

//               <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
//                 Break History
//               </h1>

//               <p className="mt-1.5 text-sm text-gray-500">
//                 View and monitor all employee break records.
//               </p>
//             </div>

//             {/* RIGHT HEADER */}

//             <div className="flex items-center gap-2">
//               {currentUser?.role === "admin" && (
//                 <div className="hidden sm:flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
//                   <ShieldCheck
//                     size={16}
//                     className="text-[#741C29]"
//                   />

//                   <span className="text-xs font-semibold text-gray-600">
//                     Admin View
//                   </span>
//                 </div>
//               )}

//               <button
//                 onClick={() => fetchBreakHistory(true)}
//                 disabled={refreshing}
//                 className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition disabled:opacity-60"
//               >
//                 <RefreshCw
//                   size={16}
//                   className={
//                     refreshing
//                       ? "animate-spin"
//                       : ""
//                   }
//                 />

//                 <span className="hidden sm:inline">
//                   Refresh
//                 </span>
//               </button>
//             </div>
//           </div>

//           {/* =================================================
//               STAT CARDS
//           ================================================= */}

//           <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
//             {/* TOTAL */}

//             <StatCard
//               title="Total Breaks"
//               value={breakStats.total}
//               icon={CalendarDays}
//               description="All records"
//               iconClass="bg-[#741C29]/10 text-[#741C29]"
//             />

//             {/* NAMAZ */}

//             <StatCard
//               title="Namaz"
//               value={breakStats.namaz}
//               icon={Moon}
//               description="Prayer breaks"
//               iconClass="bg-violet-50 text-violet-600"
//             />

//             {/* LUNCH */}

//             <StatCard
//               title="Lunch"
//               value={breakStats.lunch}
//               icon={Utensils}
//               description="Meal breaks"
//               iconClass="bg-orange-50 text-orange-600"
//             />

//             {/* WASHROOM */}

//             <StatCard
//               title="Washroom"
//               value={breakStats.washroom}
//               icon={Bath}
//               description="Washroom breaks"
//               iconClass="bg-sky-50 text-sky-600"
//             />

//             {/* OTHER */}

//             <StatCard
//               title="Other"
//               value={breakStats.other}
//               icon={Coffee}
//               description="Other breaks"
//               iconClass="bg-gray-100 text-gray-600"
//             />
//           </div>

//           {/* =================================================
//               FILTER BAR
//           ================================================= */}

//           <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-5">
//             <div className="p-3 sm:p-4">
//               <div className="flex flex-col lg:flex-row gap-3">
//                 {/* SEARCH */}

//                 <div className="relative flex-1">
//                   <Search
//                     size={17}
//                     className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
//                   />

//                   <input
//                     type="text"
//                     value={search}
//                     onChange={(e) =>
//                       setSearch(e.target.value)
//                     }
//                     placeholder="Search employee, email, team or break type..."
//                     className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 bg-gray-50/70 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:bg-white focus:border-[#741C29]/40 focus:ring-4 focus:ring-[#741C29]/5 transition"
//                   />

//                   {search && (
//                     <button
//                       onClick={() => setSearch("")}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
//                     >
//                       <X size={16} />
//                     </button>
//                   )}
//                 </div>

//                 {/* FILTER TOGGLE MOBILE */}

//                 <button
//                   onClick={() =>
//                     setShowFilters(!showFilters)
//                   }
//                   className="lg:hidden h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700 flex items-center justify-center gap-2"
//                 >
//                   <Filter size={16} />

//                   Filters

//                   <ChevronDown
//                     size={15}
//                     className={
//                       showFilters
//                         ? "rotate-180 transition"
//                         : "transition"
//                     }
//                   />
//                 </button>

//                 {/* FILTERS */}

//                 <div
//                   className={`${
//                     showFilters
//                       ? "flex"
//                       : "hidden"
//                   } lg:flex flex-col sm:flex-row gap-3`}
//                 >
//                   {/* TYPE */}

//                   <div className="relative">
//                     <select
//                       value={typeFilter}
//                       onChange={(e) =>
//                         setTypeFilter(e.target.value)
//                       }
//                       className="appearance-none w-full sm:w-48 h-11 pl-4 pr-10 rounded-xl border border-gray-200 bg-gray-50/70 text-sm font-medium text-gray-700 outline-none focus:bg-white focus:border-[#741C29]/40 transition"
//                     >
//                       <option value="All">
//                         All Break Types
//                       </option>
//                       <option value="Namaz Break">
//                         Namaz Break
//                       </option>
//                       <option value="Lunch Break">
//                         Lunch Break
//                       </option>
//                       <option value="Washroom Break">
//                         Washroom Break
//                       </option>
//                       <option value="Other">
//                         Other
//                       </option>
//                     </select>

//                     <ChevronDown
//                       size={16}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
//                     />
//                   </div>

//                   {/* DATE */}

//                   <div className="relative">
//                     <CalendarDays
//                       size={16}
//                       className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
//                     />

//                     <input
//                       type="date"
//                       value={dateFilter}
//                       onChange={(e) =>
//                         setDateFilter(
//                           e.target.value
//                         )
//                       }
//                       className="w-full sm:w-48 h-11 pl-10 pr-3 rounded-xl border border-gray-200 bg-gray-50/70 text-sm font-medium text-gray-700 outline-none focus:bg-white focus:border-[#741C29]/40 transition"
//                     />
//                   </div>

//                   {/* CLEAR */}

//                   {hasFilters && (
//                     <button
//                       onClick={clearFilters}
//                       className="h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
//                     >
//                       <X size={15} />
//                       Clear
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* FILTER RESULT */}

//             <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-3">
//               <div className="flex items-center gap-2 text-xs text-gray-500">
//                 <Filter size={14} />

//                 <span>
//                   Showing{" "}
//                   <strong className="text-gray-800">
//                     {filteredBreakHistory.length}
//                   </strong>{" "}
//                   of{" "}
//                   <strong className="text-gray-800">
//                     {breakHistory.length}
//                   </strong>{" "}
//                   records
//                 </span>
//               </div>

//               <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
//                 <Activity size={13} />

//                 <span>
//                   Auto refresh: 5 sec
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* =================================================
//               TABLE
//           ================================================= */}

//           <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
//             {/* TABLE HEADER */}

//             <div className="hidden xl:grid grid-cols-[1.5fr_1fr_1.15fr_1.35fr_1.35fr_0.8fr] gap-4 px-5 py-3.5 bg-gray-50/80 border-b border-gray-200">
//               <TableHeading>
//                 Employee
//               </TableHeading>

//               <TableHeading>
//                 Team
//               </TableHeading>

//               <TableHeading>
//                 Break Type
//               </TableHeading>

//               <TableHeading>
//                 Started
//               </TableHeading>

//               <TableHeading>
//                 Ended
//               </TableHeading>

//               <TableHeading>
//                 Duration
//               </TableHeading>
//             </div>

//             {/* LOADING */}

//             {historyLoading && breakHistory.length === 0 ? (
//               <div className="py-16 flex flex-col items-center justify-center">
//                 <div className="w-9 h-9 rounded-full border-4 border-gray-200 border-t-[#741C29] animate-spin mb-4" />

//                 <p className="text-sm font-medium text-gray-500">
//                   Loading break records...
//                 </p>
//               </div>
//             ) : filteredBreakHistory.length === 0 ? (
//               /* EMPTY */

//               <div className="py-16 px-5 flex flex-col items-center justify-center text-center">
//                 <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
//                   <CalendarDays
//                     size={25}
//                     className="text-gray-400"
//                   />
//                 </div>

//                 <h3 className="text-base font-bold text-gray-800">
//                   No break records found
//                 </h3>

//                 <p className="mt-1.5 max-w-md text-sm text-gray-500">
//                   {hasFilters
//                     ? "Try changing your search or filters."
//                     : "There are no break records available yet."}
//                 </p>

//                 {hasFilters && (
//                   <button
//                     onClick={clearFilters}
//                     className="mt-4 px-4 py-2 rounded-lg bg-[#741C29] text-white text-sm font-semibold hover:bg-[#5f1722] transition"
//                   >
//                     Clear Filters
//                   </button>
//                 )}
//               </div>
//             ) : (
//               <>
//                 {/* DESKTOP/TABLE */}

//                 <div className="hidden xl:block">
//                   {filteredBreakHistory.map(
//                     (item) => (
//                       <BreakTableRow
//                         key={item.id}
//                         item={item}
//                         formatDateTime={
//                           formatDateTime
//                         }
//                         formatDuration={
//                           formatDuration
//                         }
//                         getTypeIcon={
//                           getTypeIcon
//                         }
//                         getTypeStyles={
//                           getTypeStyles
//                         }
//                         isActiveBreak={
//                           isActiveBreak
//                         }
//                       />
//                     )
//                   )}
//                 </div>

//                 {/* MOBILE/TABLET */}

//                 <div className="xl:hidden divide-y divide-gray-100">
//                   {filteredBreakHistory.map(
//                     (item) => (
//                       <BreakMobileCard
//                         key={item.id}
//                         item={item}
//                         formatDateTime={
//                           formatDateTime
//                         }
//                         formatDuration={
//                           formatDuration
//                         }
//                         formatDateOnly={
//                           formatDateOnly
//                         }
//                         getTypeIcon={
//                           getTypeIcon
//                         }
//                         getTypeStyles={
//                           getTypeStyles
//                         }
//                         isActiveBreak={
//                           isActiveBreak
//                         }
//                       />
//                     )
//                   )}
//                 </div>
//               </>
//             )}
//           </div>

//           {/* =================================================
//               FOOTER INFO
//           ================================================= */}

//           <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-400">
//             <div className="flex items-center gap-2">
//               <ShieldCheck size={13} />

//               <span>
//                 Break history is loaded from status history.
//               </span>
//             </div>

//             <span>
//               {currentUser?.name
//                 ? `Logged in as ${currentUser.name}`
//                 : ""}
//             </span>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// // =============================================================
// // STAT CARD
// // =============================================================

// function StatCard({
//   title,
//   value,
//   icon: Icon,
//   description,
//   iconClass,
// }) {
//   return (
//     <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
//       <div className="flex items-start justify-between gap-3">
//         <div className="min-w-0">
//           <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
//             {title}
//           </p>

//           <p className="mt-1.5 text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
//             {value}
//           </p>

//           <p className="mt-1 text-[11px] sm:text-xs text-gray-400">
//             {description}
//           </p>
//         </div>

//         <div
//           className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${iconClass}`}
//         >
//           <Icon size={19} />
//         </div>
//       </div>
//     </div>
//   );
// }

// // =============================================================
// // TABLE HEADING
// // =============================================================

// function TableHeading({ children }) {
//   return (
//     <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
//       {children}
//     </div>
//   );
// }

// // =============================================================
// // DESKTOP TABLE ROW
// // =============================================================

// function BreakTableRow({
//   item,
//   formatDateTime,
//   formatDuration,
//   getTypeIcon,
//   getTypeStyles,
//   isActiveBreak,
// }) {
//   const Icon = getTypeIcon(item.break_type);

//   const styles = getTypeStyles(
//     item.break_type
//   );

//   const active = isActiveBreak(item);

//   return (
//     <div className="grid grid-cols-[1.5fr_1fr_1.15fr_1.35fr_1.35fr_0.8fr] gap-4 items-center px-5 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/70 transition">
//       {/* EMPLOYEE */}

//       <div className="min-w-0 flex items-center gap-3">
//         <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
//           <span className="text-sm font-bold text-gray-600">
//             {(item.name || "?")
//               .charAt(0)
//               .toUpperCase()}
//           </span>
//         </div>

//         <div className="min-w-0">
//           <p className="text-sm font-bold text-gray-900 truncate">
//             {item.name || "Unknown User"}
//           </p>

//           <p className="text-xs text-gray-400 truncate mt-0.5">
//             {item.email || "—"}
//           </p>
//         </div>
//       </div>

//       {/* TEAM */}

//       <div className="flex items-center gap-2 min-w-0">
//         <Users
//           size={14}
//           className="text-gray-400 shrink-0"
//         />

//         <span className="text-sm text-gray-600 truncate">
//           {item.team || "—"}
//         </span>
//       </div>

//       {/* TYPE */}

//       <div>
//         <div
//           className={`inline-flex items-center gap-2 rounded-xl border px-2.5 py-1.5 ${styles.wrapper}`}
//         >
//           <span
//             className={`w-7 h-7 rounded-lg flex items-center justify-center ${styles.icon}`}
//           >
//             <Icon size={14} />
//           </span>

//           <span className="text-xs font-bold whitespace-nowrap">
//             {item.break_type || "Other"}
//           </span>
//         </div>
//       </div>

//       {/* START */}

//       <div>
//         <p className="text-sm font-medium text-gray-700">
//           {formatDateTime(item.started_at)}
//         </p>

//         <p className="text-[11px] text-gray-400 mt-0.5">
//           Start time
//         </p>
//       </div>

//       {/* END */}

//       <div>
//         {active ? (
//           <div className="inline-flex items-center gap-2">
//             <span className="relative flex h-2.5 w-2.5">
//               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
//               <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
//             </span>

//             <span className="text-sm font-semibold text-emerald-600">
//               Active
//             </span>
//           </div>
//         ) : (
//           <>
//             <p className="text-sm font-medium text-gray-700">
//               {formatDateTime(item.ended_at)}
//             </p>

//             <p className="text-[11px] text-gray-400 mt-0.5">
//               End time
//             </p>
//           </>
//         )}
//       </div>

//       {/* DURATION */}

//       <div className="flex items-center gap-2">
//         <Clock3
//           size={15}
//           className="text-gray-400"
//         />

//         <span className="text-sm font-bold text-gray-700">
//           {formatDuration(
//             item.duration_seconds
//           )}
//         </span>
//       </div>
//     </div>
//   );
// }

// // =============================================================
// // MOBILE CARD
// // =============================================================

// function BreakMobileCard({
//   item,
//   formatDateTime,
//   formatDuration,
//   formatDateOnly,
//   getTypeIcon,
//   getTypeStyles,
//   isActiveBreak,
// }) {
//   const Icon = getTypeIcon(item.break_type);

//   const styles = getTypeStyles(
//     item.break_type
//   );

//   const active = isActiveBreak(item);

//   return (
//     <div className="p-4 sm:p-5">
//       {/* TOP */}

//       <div className="flex items-start justify-between gap-3">
//         <div className="flex items-center gap-3 min-w-0">
//           <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
//             <span className="text-sm font-bold text-gray-600">
//               {(item.name || "?")
//                 .charAt(0)
//                 .toUpperCase()}
//             </span>
//           </div>

//           <div className="min-w-0">
//             <p className="text-sm sm:text-base font-bold text-gray-900 truncate">
//               {item.name || "Unknown User"}
//             </p>

//             <p className="text-xs text-gray-400 truncate mt-0.5">
//               {item.email || "—"}
//             </p>
//           </div>
//         </div>

//         {/* TYPE */}

//         <div
//           className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 ${styles.wrapper}`}
//         >
//           <Icon size={13} />

//           <span className="text-[10px] sm:text-xs font-bold">
//             {item.break_type || "Other"}
//           </span>
//         </div>
//       </div>

//       {/* DETAILS */}

//       <div className="mt-4 grid grid-cols-2 gap-3">
//         {/* TEAM */}

//         <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
//           <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-gray-400">
//             <Users size={12} />

//             Team
//           </div>

//           <p className="mt-1.5 text-sm font-semibold text-gray-700 truncate">
//             {item.team || "—"}
//           </p>
//         </div>

//         {/* DATE */}

//         <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
//           <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-gray-400">
//             <CalendarDays size={12} />

//             Date
//           </div>

//           <p className="mt-1.5 text-sm font-semibold text-gray-700 truncate">
//             {formatDateOnly(
//               item.started_at
//             )}
//           </p>
//         </div>
//       </div>

//       {/* TIMES */}

//       <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
//         {/* START */}

//         <div className="rounded-xl border border-gray-100 p-3">
//           <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
//             Started
//           </div>

//           <p className="mt-1 text-sm font-semibold text-gray-700">
//             {formatDateTime(
//               item.started_at
//             )}
//           </p>
//         </div>

//         {/* END */}

//         <div className="rounded-xl border border-gray-100 p-3">
//           <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
//             Ended
//           </div>

//           {active ? (
//             <div className="mt-1 flex items-center gap-2">
//               <span className="relative flex h-2.5 w-2.5">
//                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
//                 <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
//               </span>

//               <span className="text-sm font-bold text-emerald-600">
//                 Active
//               </span>
//             </div>
//           ) : (
//             <p className="mt-1 text-sm font-semibold text-gray-700">
//               {formatDateTime(
//                 item.ended_at
//               )}
//             </p>
//           )}
//         </div>

//         {/* DURATION */}

//         <div className="rounded-xl border border-gray-100 p-3">
//           <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
//             Duration
//           </div>

//           <div className="mt-1 flex items-center gap-2">
//             <Timer
//               size={15}
//               className="text-[#741C29]"
//             />

//             <span className="text-sm font-bold text-gray-800">
//               {formatDuration(
//                 item.duration_seconds
//               )}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }







// "use client";

// import {
//   CalendarDays,
//   Coffee,
//   Users,
//   Search,
//   Filter,
//   ChevronDown,
//   Timer,
//   RefreshCw,
//   X,
//   Activity,
//   ShieldCheck,
//   Clock3,
//   Utensils,
//   Moon,
//   Bath,
// } from "lucide-react";

// import {
//   useState,
//   useCallback,
//   useEffect,
//   useMemo,
// } from "react";

// import { useRouter } from "next/navigation";
// import Sidebar from "@/components/Sidebar";

// export default function BreaksPage() {
//   const router = useRouter();

//   // =========================================================
//   // STATE
//   // =========================================================

//   const [currentUser, setCurrentUser] = useState(null);

//   const [breakHistory, setBreakHistory] = useState([]);

//   const [breakStats, setBreakStats] = useState({
//     total: 0,
//     namaz: 0,
//     lunch: 0,
//     washroom: 0,
//     other: 0,
//   });

//   const [loading, setLoading] = useState(true);
//   const [historyLoading, setHistoryLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const [search, setSearch] = useState("");
//   const [typeFilter, setTypeFilter] = useState("All");

//   // NEW DATE FILTERS
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   const [showFilters, setShowFilters] = useState(false);

//   // =========================================================
//   // FETCH CURRENT USER
//   // =========================================================

//   const fetchCurrentUser = useCallback(async () => {
//     try {
//       const response = await fetch("/api/auth/me", {
//         method: "GET",
//         cache: "no-store",
//       });

//       if (!response.ok) {
//         throw new Error("Failed to fetch current user");
//       }

//       const data = await response.json();

//       if (!data?.user) {
//         router.push("/login");
//         return null;
//       }

//       setCurrentUser(data.user);

//       return data.user;
//     } catch (error) {
//       console.error("CURRENT USER ERROR:", error);

//       router.push("/login");

//       return null;
//     }
//   }, [router]);

//   // =========================================================
//   // FETCH BREAK HISTORY
//   // =========================================================

//   const fetchBreakHistory = useCallback(
//     async (manual = false) => {
//       try {
//         if (manual) {
//           setRefreshing(true);
//         } else {
//           setHistoryLoading(true);
//         }

//         const response = await fetch(
//           `/api/admin/break-history?_live=${Date.now()}`,
//           {
//             method: "GET",
//             cache: "no-store",
//             headers: {
//               "Cache-Control": "no-cache",
//               Pragma: "no-cache",
//             },
//           }
//         );

//         const data = await response.json();

//         console.log("BREAK HISTORY DATA:", data);

//         if (response.status === 401) {
//           router.push("/login");
//           return;
//         }

//         if (!response.ok || !data.success) {
//           throw new Error(
//             data.message || "Failed to fetch break history"
//           );
//         }

//         const breaks = Array.isArray(data.breaks)
//           ? data.breaks
//           : [];

//         setBreakHistory(breaks);

//         setBreakStats(
//           data.stats || {
//             total: 0,
//             namaz: 0,
//             lunch: 0,
//             washroom: 0,
//             other: 0,
//           }
//         );
//       } catch (error) {
//         console.error(
//           "BREAK HISTORY FETCH ERROR:",
//           error
//         );

//         if (!manual) {
//           setBreakHistory([]);
//         }
//       } finally {
//         setHistoryLoading(false);
//         setRefreshing(false);
//       }
//     },
//     [router]
//   );

//   // =========================================================
//   // INITIAL LOAD
//   // =========================================================

//   useEffect(() => {
//     let mounted = true;

//     const loadPage = async () => {
//       setLoading(true);

//       const user = await fetchCurrentUser();

//       if (!mounted) return;

//       if (user) {
//         await fetchBreakHistory();
//       }

//       if (mounted) {
//         setLoading(false);
//       }
//     };

//     loadPage();

//     return () => {
//       mounted = false;
//     };
//   }, [fetchCurrentUser, fetchBreakHistory]);

//   // =========================================================
//   // AUTO REFRESH
//   // =========================================================

//   useEffect(() => {
//     if (!currentUser) return;

//     const interval = setInterval(() => {
//       fetchBreakHistory();
//     }, 5000);

//     return () => clearInterval(interval);
//   }, [currentUser, fetchBreakHistory]);

//   // =========================================================
//   // HELPERS
//   // =========================================================

//   const formatDateTime = useCallback((value) => {
//     if (!value) {
//       return "Active";
//     }

//     const date = new Date(value);

//     if (Number.isNaN(date.getTime())) {
//       return "-";
//     }

//     return date.toLocaleString("en-US", {
//       month: "short",
//       day: "2-digit",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//     });
//   }, []);

//   const formatDateOnly = useCallback((value) => {
//     if (!value) return "-";

//     const date = new Date(value);

//     if (Number.isNaN(date.getTime())) {
//       return "-";
//     }

//     return date.toLocaleDateString("en-US", {
//       month: "short",
//       day: "2-digit",
//       year: "numeric",
//     });
//   }, []);

//   const formatDuration = useCallback((seconds) => {
//     if (
//       seconds === null ||
//       seconds === undefined ||
//       seconds === ""
//     ) {
//       return "—";
//     }

//     const totalSeconds = Number(seconds);

//     if (!Number.isFinite(totalSeconds)) {
//       return "—";
//     }

//     const hours = Math.floor(totalSeconds / 3600);

//     const minutes = Math.floor(
//       (totalSeconds % 3600) / 60
//     );

//     const secs = totalSeconds % 60;

//     if (hours > 0) {
//       return `${hours}h ${minutes}m ${secs}s`;
//     }

//     if (minutes > 0) {
//       return `${minutes}m ${secs}s`;
//     }

//     return `${secs}s`;
//   }, []);

//   const getTypeIcon = useCallback((type) => {
//     switch (type) {
//       case "Namaz Break":
//         return Moon;

//       case "Lunch Break":
//         return Utensils;

//       case "Washroom Break":
//         return Bath;

//       default:
//         return Coffee;
//     }
//   }, []);

//   const getTypeStyles = useCallback((type) => {
//     switch (type) {
//       case "Namaz Break":
//         return {
//           wrapper:
//             "bg-violet-50 border-violet-100 text-violet-700",
//           icon:
//             "bg-violet-100 text-violet-600",
//           dot: "bg-violet-500",
//         };

//       case "Lunch Break":
//         return {
//           wrapper:
//             "bg-orange-50 border-orange-100 text-orange-700",
//           icon:
//             "bg-orange-100 text-orange-600",
//           dot: "bg-orange-500",
//         };

//       case "Washroom Break":
//         return {
//           wrapper:
//             "bg-sky-50 border-sky-100 text-sky-700",
//           icon:
//             "bg-sky-100 text-sky-600",
//           dot: "bg-sky-500",
//         };

//       default:
//         return {
//           wrapper:
//             "bg-gray-50 border-gray-200 text-gray-700",
//           icon:
//             "bg-gray-100 text-gray-600",
//           dot: "bg-gray-500",
//         };
//     }
//   }, []);

//   const isActiveBreak = useCallback((item) => {
//     return !item?.ended_at;
//   }, []);

//   // =========================================================
//   // FILTERED HISTORY
//   // =========================================================

//   const filteredBreakHistory = useMemo(() => {
//     let result = [...breakHistory];

//     // -------------------------------------------------------
//     // SEARCH
//     // -------------------------------------------------------

//     const searchValue = search
//       .trim()
//       .toLowerCase();

//     if (searchValue) {
//       result = result.filter((item) => {
//         return (
//           String(item.name || "")
//             .toLowerCase()
//             .includes(searchValue) ||
//           String(item.email || "")
//             .toLowerCase()
//             .includes(searchValue) ||
//           String(item.team || "")
//             .toLowerCase()
//             .includes(searchValue) ||
//           String(item.break_type || "")
//             .toLowerCase()
//             .includes(searchValue)
//         );
//       });
//     }

//     // -------------------------------------------------------
//     // BREAK TYPE
//     // -------------------------------------------------------

//     if (typeFilter !== "All") {
//       result = result.filter(
//         (item) =>
//           item.break_type === typeFilter
//       );
//     }

//     // -------------------------------------------------------
//     // START DATE / END DATE
//     // -------------------------------------------------------

//     if (startDate || endDate) {
//       result = result.filter((item) => {
//         if (!item.started_at) {
//           return false;
//         }

//         const itemDate = new Date(
//           item.started_at
//         );

//         if (Number.isNaN(itemDate.getTime())) {
//           return false;
//         }

//         const year = itemDate.getFullYear();

//         const month = String(
//           itemDate.getMonth() + 1
//         ).padStart(2, "0");

//         const day = String(
//           itemDate.getDate()
//         ).padStart(2, "0");

//         const itemDateString =
//           `${year}-${month}-${day}`;

//         // Before start date
//         if (
//           startDate &&
//           itemDateString < startDate
//         ) {
//           return false;
//         }

//         // After end date
//         if (
//           endDate &&
//           itemDateString > endDate
//         ) {
//           return false;
//         }

//         return true;
//       });
//     }

//     return result;
//   }, [
//     breakHistory,
//     search,
//     typeFilter,
//     startDate,
//     endDate,
//   ]);

//   // =========================================================
//   // FILTER RESET
//   // =========================================================

//   const clearFilters = () => {
//     setSearch("");
//     setTypeFilter("All");
//     setStartDate("");
//     setEndDate("");
//   };

//   const hasFilters =
//     search.trim() ||
//     typeFilter !== "All" ||
//     startDate ||
//     endDate;

//   // =========================================================
//   // LOADING
//   // =========================================================

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#F7F8FA] flex">
//         {/* LEFT SIDEBAR */}

//         <Sidebar />

//         {/* MAIN CONTENT */}

//         <main className="flex-1 min-w-0 flex items-center justify-center">
//           <div className="flex flex-col items-center gap-4">
//             <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-[#741C29] animate-spin" />

//             <p className="text-sm font-medium text-gray-500">
//               Loading break history...
//             </p>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   // =========================================================
//   // MAIN UI
//   // =========================================================

//   return (
//     <div className="min-h-screen bg-[#F7F8FA] flex">

//       {/* =====================================================
//           LEFT SIDEBAR
//       ===================================================== */}

//       <Sidebar />

//       {/* =====================================================
//           RIGHT CONTENT
//       ===================================================== */}

//       <main className="min-h-screen lg:pl-[270px]">
//         <div className="w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7">

//           {/* =================================================
//               HEADER
//           ================================================= */}

//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">

//             <div>
//               <div className="flex items-center gap-2 mb-2">

//                 <div className="w-9 h-9 rounded-xl bg-[#741C29] flex items-center justify-center shadow-sm">
//                   <CalendarDays
//                     size={18}
//                     className="text-white"
//                   />
//                 </div>

//                 <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#741C29]">
//                   Attendance
//                 </span>
//               </div>

//               <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
//                 Break History
//               </h1>

//               <p className="mt-1.5 text-sm text-gray-500">
//                 View and monitor all employee break records.
//               </p>
//             </div>

//             {/* RIGHT HEADER */}

//             <div className="flex items-center gap-2">

//               {currentUser?.role === "admin" && (
//                 <div className="hidden sm:flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
//                   <ShieldCheck
//                     size={16}
//                     className="text-[#741C29]"
//                   />

//                   <span className="text-xs font-semibold text-gray-600">
//                     Admin View
//                   </span>
//                 </div>
//               )}

//               <button
//                 onClick={() =>
//                   fetchBreakHistory(true)
//                 }
//                 disabled={refreshing}
//                 className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition disabled:opacity-60"
//               >
//                 <RefreshCw
//                   size={16}
//                   className={
//                     refreshing
//                       ? "animate-spin"
//                       : ""
//                   }
//                 />

//                 <span className="hidden sm:inline">
//                   Refresh
//                 </span>
//               </button>
//             </div>
//           </div>

//           {/* =================================================
//               STAT CARDS
//           ================================================= */}

//           <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">

//             <StatCard
//               title="Total Breaks"
//               value={breakStats.total}
//               icon={CalendarDays}
//               description="All records"
//               iconClass="bg-[#741C29]/10 text-[#741C29]"
//             />

//             <StatCard
//               title="Namaz"
//               value={breakStats.namaz}
//               icon={Moon}
//               description="Prayer breaks"
//               iconClass="bg-violet-50 text-violet-600"
//             />

//             <StatCard
//               title="Lunch"
//               value={breakStats.lunch}
//               icon={Utensils}
//               description="Meal breaks"
//               iconClass="bg-orange-50 text-orange-600"
//             />

//             <StatCard
//               title="Washroom"
//               value={breakStats.washroom}
//               icon={Bath}
//               description="Washroom breaks"
//               iconClass="bg-sky-50 text-sky-600"
//             />

//             <StatCard
//               title="Other"
//               value={breakStats.other}
//               icon={Coffee}
//               description="Other breaks"
//               iconClass="bg-gray-100 text-gray-600"
//             />

//           </div>

//           {/* =================================================
//               FILTER BAR
//           ================================================= */}

//           <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-5">

//             <div className="p-3 sm:p-4">

//               <div className="flex flex-col lg:flex-row gap-3">

//                 {/* SEARCH */}

//                 <div className="relative flex-1">

//                   <Search
//                     size={17}
//                     className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
//                   />

//                   <input
//                     type="text"
//                     value={search}
//                     onChange={(e) =>
//                       setSearch(e.target.value)
//                     }
//                     placeholder="Search employee, email, team or break type..."
//                     className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 bg-gray-50/70 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:bg-white focus:border-[#741C29]/40 focus:ring-4 focus:ring-[#741C29]/5 transition"
//                   />

//                   {search && (
//                     <button
//                       onClick={() =>
//                         setSearch("")
//                       }
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
//                     >
//                       <X size={16} />
//                     </button>
//                   )}
//                 </div>

//                 {/* MOBILE FILTER TOGGLE */}

//                 <button
//                   onClick={() =>
//                     setShowFilters(
//                       !showFilters
//                     )
//                   }
//                   className="lg:hidden h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700 flex items-center justify-center gap-2"
//                 >
//                   <Filter size={16} />

//                   Filters

//                   <ChevronDown
//                     size={15}
//                     className={
//                       showFilters
//                         ? "rotate-180 transition"
//                         : "transition"
//                     }
//                   />
//                 </button>

//                 {/* FILTERS */}

//                 <div
//                   className={`${
//                     showFilters
//                       ? "flex"
//                       : "hidden"
//                   } lg:flex flex-col sm:flex-row gap-3`}
//                 >

//                   {/* BREAK TYPE */}

//                   <div className="relative">

//                     <select
//                       value={typeFilter}
//                       onChange={(e) =>
//                         setTypeFilter(
//                           e.target.value
//                         )
//                       }
//                       className="appearance-none w-full sm:w-48 h-11 pl-4 pr-10 rounded-xl border border-gray-200 bg-gray-50/70 text-sm font-medium text-gray-700 outline-none focus:bg-white focus:border-[#741C29]/40 transition"
//                     >
//                       <option value="All">
//                         All Break Types
//                       </option>

//                       <option value="Namaz Break">
//                         Namaz Break
//                       </option>

//                       <option value="Lunch Break">
//                         Lunch Break
//                       </option>

//                       <option value="Washroom Break">
//                         Washroom Break
//                       </option>

//                       <option value="Other">
//                         Other
//                       </option>
//                     </select>

//                     <ChevronDown
//                       size={16}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
//                     />
//                   </div>

//                   {/* START DATE */}

//                   <div className="relative">

//                     <CalendarDays
//                       size={16}
//                       className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
//                     />

//                     <input
//                       type="date"
//                       value={startDate}
//                       onChange={(e) =>
//                         setStartDate(
//                           e.target.value
//                         )
//                       }
//                       max={
//                         endDate || undefined
//                       }
//                       className="w-full sm:w-44 h-11 pl-10 pr-3 rounded-xl border border-gray-200 bg-gray-50/70 text-sm font-medium text-gray-700 outline-none focus:bg-white focus:border-[#741C29]/40 transition"
//                       title="Start date"
//                     />
//                   </div>

//                   {/* END DATE */}

//                   <div className="relative">

//                     <CalendarDays
//                       size={16}
//                       className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
//                     />

//                     <input
//                       type="date"
//                       value={endDate}
//                       onChange={(e) =>
//                         setEndDate(
//                           e.target.value
//                         )
//                       }
//                       min={
//                         startDate || undefined
//                       }
//                       className="w-full sm:w-44 h-11 pl-10 pr-3 rounded-xl border border-gray-200 bg-gray-50/70 text-sm font-medium text-gray-700 outline-none focus:bg-white focus:border-[#741C29]/40 transition"
//                       title="End date"
//                     />
//                   </div>

//                   {/* CLEAR */}

//                   {hasFilters && (
//                     <button
//                       onClick={
//                         clearFilters
//                       }
//                       className="h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
//                     >
//                       <X size={15} />

//                       Clear
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* FILTER RESULT */}

//             <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-3">

//               <div className="flex items-center gap-2 text-xs text-gray-500">

//                 <Filter size={14} />

//                 <span>
//                   Showing{" "}
//                   <strong className="text-gray-800">
//                     {
//                       filteredBreakHistory.length
//                     }
//                   </strong>{" "}
//                   of{" "}
//                   <strong className="text-gray-800">
//                     {breakHistory.length}
//                   </strong>{" "}
//                   records
//                 </span>
//               </div>

//               <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">

//                 <Activity size={13} />

//                 <span>
//                   Auto refresh: 5 sec
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* =================================================
//               ACTIVE FILTER SUMMARY
//           ================================================= */}

//           {startDate || endDate ? (
//             <div className="mb-5 flex flex-wrap items-center gap-2">

//               <span className="text-xs font-semibold text-gray-500">
//                 Date range:
//               </span>

//               {startDate && (
//                 <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#741C29]/5 border border-[#741C29]/10 text-xs font-semibold text-[#741C29]">
//                   From: {startDate}
//                 </span>
//               )}

//               {endDate && (
//                 <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#741C29]/5 border border-[#741C29]/10 text-xs font-semibold text-[#741C29]">
//                   To: {endDate}
//                 </span>
//               )}
//             </div>
//           ) : null}

//           {/* =================================================
//               TABLE
//           ================================================= */}

//           <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

//             {/* TABLE HEADER */}

//             <div className="hidden xl:grid grid-cols-[1.5fr_1fr_1.15fr_1.35fr_1.35fr_0.8fr] gap-4 px-5 py-3.5 bg-gray-50/80 border-b border-gray-200">

//               <TableHeading>
//                 Employee
//               </TableHeading>

//               <TableHeading>
//                 Team
//               </TableHeading>

//               <TableHeading>
//                 Break Type
//               </TableHeading>

//               <TableHeading>
//                 Started
//               </TableHeading>

//               <TableHeading>
//                 Ended
//               </TableHeading>

//               <TableHeading>
//                 Duration
//               </TableHeading>
//             </div>

//             {/* LOADING */}

//             {historyLoading &&
//             breakHistory.length === 0 ? (
//               <div className="py-16 flex flex-col items-center justify-center">

//                 <div className="w-9 h-9 rounded-full border-4 border-gray-200 border-t-[#741C29] animate-spin mb-4" />

//                 <p className="text-sm font-medium text-gray-500">
//                   Loading break records...
//                 </p>
//               </div>
//             ) : filteredBreakHistory.length ===
//               0 ? (
//               /* EMPTY */

//               <div className="py-16 px-5 flex flex-col items-center justify-center text-center">

//                 <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">

//                   <CalendarDays
//                     size={25}
//                     className="text-gray-400"
//                   />
//                 </div>

//                 <h3 className="text-base font-bold text-gray-800">
//                   No break records found
//                 </h3>

//                 <p className="mt-1.5 max-w-md text-sm text-gray-500">
//                   {hasFilters
//                     ? "Try changing your search or filters."
//                     : "There are no break records available yet."}
//                 </p>

//                 {hasFilters && (
//                   <button
//                     onClick={
//                       clearFilters
//                     }
//                     className="mt-4 px-4 py-2 rounded-lg bg-[#741C29] text-white text-sm font-semibold hover:bg-[#5f1722] transition"
//                   >
//                     Clear Filters
//                   </button>
//                 )}
//               </div>
//             ) : (
//               <>
//                 {/* DESKTOP TABLE */}

//                 <div className="hidden xl:block">

//                   {filteredBreakHistory.map(
//                     (item) => (
//                       <BreakTableRow
//                         key={item.id}
//                         item={item}
//                         formatDateTime={
//                           formatDateTime
//                         }
//                         formatDuration={
//                           formatDuration
//                         }
//                         getTypeIcon={
//                           getTypeIcon
//                         }
//                         getTypeStyles={
//                           getTypeStyles
//                         }
//                         isActiveBreak={
//                           isActiveBreak
//                         }
//                       />
//                     )
//                   )}
//                 </div>

//                 {/* MOBILE / TABLET */}

//                 <div className="xl:hidden divide-y divide-gray-100">

//                   {filteredBreakHistory.map(
//                     (item) => (
//                       <BreakMobileCard
//                         key={item.id}
//                         item={item}
//                         formatDateTime={
//                           formatDateTime
//                         }
//                         formatDuration={
//                           formatDuration
//                         }
//                         formatDateOnly={
//                           formatDateOnly
//                         }
//                         getTypeIcon={
//                           getTypeIcon
//                         }
//                         getTypeStyles={
//                           getTypeStyles
//                         }
//                         isActiveBreak={
//                           isActiveBreak
//                         }
//                       />
//                     )
//                   )}
//                 </div>
//               </>
//             )}
//           </div>

//           {/* =================================================
//               FOOTER
//           ================================================= */}

//           <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-400">

//             <div className="flex items-center gap-2">

//               <ShieldCheck size={13} />

//               <span>
//                 Break history is loaded from status history.
//               </span>
//             </div>

//             <span>
//               {currentUser?.name
//                 ? `Logged in as ${currentUser.name}`
//                 : ""}
//             </span>
//           </div>

//         </div>
//       </main>
//     </div>
//   );
// }

// // =============================================================
// // STAT CARD
// // =============================================================

// function StatCard({
//   title,
//   value,
//   icon: Icon,
//   description,
//   iconClass,
// }) {
//   return (
//     <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">

//       <div className="flex items-start justify-between gap-3">

//         <div className="min-w-0">

//           <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
//             {title}
//           </p>

//           <p className="mt-1.5 text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
//             {value}
//           </p>

//           <p className="mt-1 text-[11px] sm:text-xs text-gray-400">
//             {description}
//           </p>
//         </div>

//         <div
//           className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${iconClass}`}
//         >
//           <Icon size={19} />
//         </div>
//       </div>
//     </div>
//   );
// }

// // =============================================================
// // TABLE HEADING
// // =============================================================

// function TableHeading({ children }) {
//   return (
//     <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
//       {children}
//     </div>
//   );
// }

// // =============================================================
// // DESKTOP TABLE ROW
// // =============================================================

// function BreakTableRow({
//   item,
//   formatDateTime,
//   formatDuration,
//   getTypeIcon,
//   getTypeStyles,
//   isActiveBreak,
// }) {
//   const Icon = getTypeIcon(
//     item.break_type
//   );

//   const styles = getTypeStyles(
//     item.break_type
//   );

//   const active = isActiveBreak(item);

//   return (
//     <div className="grid grid-cols-[1.5fr_1fr_1.15fr_1.35fr_1.35fr_0.8fr] gap-4 items-center px-5 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/70 transition">

//       {/* EMPLOYEE */}

//       <div className="min-w-0 flex items-center gap-3">

//         <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">

//           <span className="text-sm font-bold text-gray-600">
//             {(item.name || "?")
//               .charAt(0)
//               .toUpperCase()}
//           </span>
//         </div>

//         <div className="min-w-0">

//           <p className="text-sm font-bold text-gray-900 truncate">
//             {item.name ||
//               "Unknown User"}
//           </p>

//           <p className="text-xs text-gray-400 truncate mt-0.5">
//             {item.email || "—"}
//           </p>
//         </div>
//       </div>

//       {/* TEAM */}

//       <div className="flex items-center gap-2 min-w-0">

//         <Users
//           size={14}
//           className="text-gray-400 shrink-0"
//         />

//         <span className="text-sm text-gray-600 truncate">
//           {item.team || "—"}
//         </span>
//       </div>

//       {/* BREAK TYPE */}

//       <div>

//         <div
//           className={`inline-flex items-center gap-2 rounded-xl border px-2.5 py-1.5 ${styles.wrapper}`}
//         >

//           <span
//             className={`w-7 h-7 rounded-lg flex items-center justify-center ${styles.icon}`}
//           >
//             <Icon size={14} />
//           </span>

//           <span className="text-xs font-bold whitespace-nowrap">
//             {item.break_type ||
//               "Other"}
//           </span>
//         </div>
//       </div>

//       {/* START */}

//       <div>

//         <p className="text-sm font-medium text-gray-700">
//           {formatDateTime(
//             item.started_at
//           )}
//         </p>

//         <p className="text-[11px] text-gray-400 mt-0.5">
//           Start time
//         </p>
//       </div>

//       {/* END */}

//       <div>

//         {active ? (
//           <div className="inline-flex items-center gap-2">

//             <span className="relative flex h-2.5 w-2.5">

//               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />

//               <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
//             </span>

//             <span className="text-sm font-semibold text-emerald-600">
//               Active
//             </span>
//           </div>
//         ) : (
//           <>
//             <p className="text-sm font-medium text-gray-700">
//               {formatDateTime(
//                 item.ended_at
//               )}
//             </p>

//             <p className="text-[11px] text-gray-400 mt-0.5">
//               End time
//             </p>
//           </>
//         )}
//       </div>

//       {/* DURATION */}

//       <div className="flex items-center gap-2">

//         <Clock3
//           size={15}
//           className="text-gray-400"
//         />

//         <span className="text-sm font-bold text-gray-700">
//           {formatDuration(
//             item.duration_seconds
//           )}
//         </span>
//       </div>
//     </div>
//   );
// }

// // =============================================================
// // MOBILE CARD
// // =============================================================

// function BreakMobileCard({
//   item,
//   formatDateTime,
//   formatDuration,
//   formatDateOnly,
//   getTypeIcon,
//   getTypeStyles,
//   isActiveBreak,
// }) {
//   const Icon = getTypeIcon(
//     item.break_type
//   );

//   const styles = getTypeStyles(
//     item.break_type
//   );

//   const active = isActiveBreak(item);

//   return (
//     <div className="p-4 sm:p-5">

//       {/* TOP */}

//       <div className="flex items-start justify-between gap-3">

//         <div className="flex items-center gap-3 min-w-0">

//           <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">

//             <span className="text-sm font-bold text-gray-600">
//               {(item.name || "?")
//                 .charAt(0)
//                 .toUpperCase()}
//             </span>
//           </div>

//           <div className="min-w-0">

//             <p className="text-sm sm:text-base font-bold text-gray-900 truncate">
//               {item.name ||
//                 "Unknown User"}
//             </p>

//             <p className="text-xs text-gray-400 truncate mt-0.5">
//               {item.email || "—"}
//             </p>
//           </div>
//         </div>

//         {/* TYPE */}

//         <div
//           className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 ${styles.wrapper}`}
//         >

//           <Icon size={13} />

//           <span className="text-[10px] sm:text-xs font-bold">
//             {item.break_type ||
//               "Other"}
//           </span>
//         </div>
//       </div>

//       {/* DETAILS */}

//       <div className="mt-4 grid grid-cols-2 gap-3">

//         {/* TEAM */}

//         <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">

//           <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-gray-400">

//             <Users size={12} />

//             Team
//           </div>

//           <p className="mt-1.5 text-sm font-semibold text-gray-700 truncate">
//             {item.team || "—"}
//           </p>
//         </div>

//         {/* DATE */}

//         <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">

//           <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-gray-400">

//             <CalendarDays size={12} />

//             Date
//           </div>

//           <p className="mt-1.5 text-sm font-semibold text-gray-700 truncate">
//             {formatDateOnly(
//               item.started_at
//             )}
//           </p>
//         </div>
//       </div>

//       {/* TIMES */}

//       <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">

//         {/* START */}

//         <div className="rounded-xl border border-gray-100 p-3">

//           <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
//             Started
//           </div>

//           <p className="mt-1 text-sm font-semibold text-gray-700">
//             {formatDateTime(
//               item.started_at
//             )}
//           </p>
//         </div>

//         {/* END */}

//         <div className="rounded-xl border border-gray-100 p-3">

//           <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
//             Ended
//           </div>

//           {active ? (
//             <div className="mt-1 flex items-center gap-2">

//               <span className="relative flex h-2.5 w-2.5">

//                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />

//                 <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
//               </span>

//               <span className="text-sm font-bold text-emerald-600">
//                 Active
//               </span>
//             </div>
//           ) : (
//             <p className="mt-1 text-sm font-semibold text-gray-700">
//               {formatDateTime(
//                 item.ended_at
//               )}
//             </p>
//           )}
//         </div>

//         {/* DURATION */}

//         <div className="rounded-xl border border-gray-100 p-3">

//           <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
//             Duration
//           </div>

//           <div className="mt-1 flex items-center gap-2">

//             <Timer
//               size={15}
//               className="text-[#741C29]"
//             />

//             <span className="text-sm font-bold text-gray-800">
//               {formatDuration(
//                 item.duration_seconds
//               )}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }























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
} from "lucide-react";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function BreaksPage() {
  const router = useRouter();

  // =========================================================
  // STATE
  // =========================================================

  const [currentUser, setCurrentUser] = useState(null);

  const [breakHistory, setBreakHistory] = useState([]);
  // const [breakStats, setBreakStats] = useState({
  //   total: 0,
  //   namaz: 0,
  //   lunch: 0,
  //   washroom: 0,
  //   other: 0,
  // });
const [breakStats, setBreakStats] = useState({
  total: 0,
  namaz: 0,
  lunch: 0,
  shortBreak: 0,
  washroom: 0,
  other: 0,
});
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  // DATE FILTERS
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [showFilters, setShowFilters] = useState(false);

  // =========================================================
  // FETCH CURRENT USER
  // =========================================================

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const data = await response.json();

      if (data?.success && data?.user) {
        setCurrentUser(data.user);
      } else if (data?.user) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error("Current user fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // =========================================================
  // FETCH BREAK HISTORY
  // =========================================================

  const fetchBreakHistory = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setHistoryLoading(true);
      }

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

      const data = await response.json();

      if (data?.success) {
        setBreakHistory(Array.isArray(data.breaks) ? data.breaks : []);

   setBreakStats({
  total: Number(data?.stats?.total || 0),
  namaz: Number(data?.stats?.namaz || 0),
  lunch: Number(data?.stats?.lunch || 0),
  shortBreak: Number(data?.stats?.shortBreak || 0),
  washroom: Number(data?.stats?.washroom || 0),
  other: Number(data?.stats?.other || 0),
});
      } else {
        setBreakHistory([]);
      }
    } catch (error) {
      console.error("Break history fetch error:", error);
    } finally {
      setHistoryLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchCurrentUser();
    fetchBreakHistory();
  }, [fetchCurrentUser, fetchBreakHistory]);

  // =========================================================
  // AUTO REFRESH EVERY 5 SECONDS
  // =========================================================

  useEffect(() => {
    const interval = setInterval(() => {
      fetchBreakHistory(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchBreakHistory]);

  // =========================================================
  // HELPERS
  // =========================================================

  const formatDateTime = (dateValue) => {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateOnly = (dateValue) => {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatDuration = (seconds) => {
    const totalSeconds = Number(seconds || 0);

    if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
      return "0m";
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }

    return `${secs}s`;
  };

  // =========================================================
  // BREAK TYPE ICON
  // =========================================================

  // const getTypeIcon = (type) => {
  //   const value = String(type || "").toLowerCase();

  //   if (value.includes("namaz") || value.includes("prayer")) {
  //     return Moon;
  //   }

  //   if (value.includes("lunch") || value.includes("meal")) {
  //     return Utensils;
  //   }

  //   if (value.includes("washroom") || value.includes("bathroom")) {
  //     return Bath;
  //   }

  //   if (value.includes("coffee") || value.includes("tea")) {
  //     return Coffee;
  //   }

  //   return Timer;
  // };

  const getTypeIcon = (type) => {
  const value = String(type || "").toLowerCase();

  if (value.includes("namaz") || value.includes("prayer")) {
    return Moon;
  }

  if (value.includes("lunch") || value.includes("meal")) {
    return Utensils;
  }

  if (
    value.includes("short break") ||
    value.includes("shortbreak")
  ) {
    return Clock3;
  }

  if (
    value.includes("washroom") ||
    value.includes("bathroom")
  ) {
    return Bath;
  }

  if (
    value.includes("coffee") ||
    value.includes("tea")
  ) {
    return Coffee;
  }

  return Timer;
};

  // =========================================================
  // BREAK TYPE STYLE
  // =========================================================

  // const getTypeStyles = (type) => {
  //   const value = String(type || "").toLowerCase();

  //   if (value.includes("namaz") || value.includes("prayer")) {
  //     return {
  //       bg: "bg-indigo-50",
  //       text: "text-indigo-700",
  //       border: "border-indigo-100",
  //     };
  //   }

  //   if (value.includes("lunch") || value.includes("meal")) {
  //     return {
  //       bg: "bg-orange-50",
  //       text: "text-orange-700",
  //       border: "border-orange-100",
  //     };
  //   }

  //   if (value.includes("washroom") || value.includes("bathroom")) {
  //     return {
  //       bg: "bg-cyan-50",
  //       text: "text-cyan-700",
  //       border: "border-cyan-100",
  //     };
  //   }

  //   if (value.includes("coffee") || value.includes("tea")) {
  //     return {
  //       bg: "bg-amber-50",
  //       text: "text-amber-700",
  //       border: "border-amber-100",
  //     };
  //   }

  //   return {
  //     bg: "bg-slate-50",
  //     text: "text-slate-700",
  //     border: "border-slate-200",
  //   };
  // };
  const getTypeStyles = (type) => {
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

  if (
    value.includes("short break") ||
    value.includes("shortbreak")
  ) {
    return {
      bg: "bg-teal-50",
      text: "text-teal-700",
      border: "border-teal-100",
    };
  }

  if (
    value.includes("washroom") ||
    value.includes("bathroom")
  ) {
    return {
      bg: "bg-cyan-50",
      text: "text-cyan-700",
      border: "border-cyan-100",
    };
  }

  if (
    value.includes("coffee") ||
    value.includes("tea")
  ) {
    return {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-100",
    };
  }

  return {
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
  };
};

  // =========================================================
  // ACTIVE BREAK
  // =========================================================

  const isActiveBreak = (item) => {
    return (
      !item?.ended_at ||
      item?.status === "active" ||
      item?.is_active === true
    );
  };

  // =========================================================
  // FILTERED BREAK HISTORY
  // =========================================================

  const filteredBreakHistory = useMemo(() => {
    let result = [...breakHistory];

    // SEARCH
    if (search.trim()) {
      const searchValue = search.trim().toLowerCase();

      result = result.filter((item) => {
        const employeeName = String(
          item.employee_name ||
            item.user_name ||
            item.name ||
            ""
        ).toLowerCase();

        const email = String(
          item.employee_email ||
            item.user_email ||
            item.email ||
            ""
        ).toLowerCase();

        const team = String(
          item.team ||
            item.department ||
            item.team_name ||
            ""
        ).toLowerCase();

        const type = String(
          item.break_type ||
            item.type ||
            item.status ||
            ""
        ).toLowerCase();

        return (
          employeeName.includes(searchValue) ||
          email.includes(searchValue) ||
          team.includes(searchValue) ||
          type.includes(searchValue)
        );
      });
    }

    // BREAK TYPE
    if (typeFilter !== "All") {
      result = result.filter((item) => {
        const type = String(
          item.break_type ||
            item.type ||
            item.status ||
            ""
        ).toLowerCase();

        return type === typeFilter.toLowerCase();
      });
    }

    // START DATE + END DATE
    if (startDate || endDate) {
      result = result.filter((item) => {
        if (!item.started_at) return false;

        const itemDate = new Date(item.started_at);

        if (Number.isNaN(itemDate.getTime())) {
          return false;
        }

        const year = itemDate.getFullYear();
        const month = String(itemDate.getMonth() + 1).padStart(2, "0");
        const day = String(itemDate.getDate()).padStart(2, "0");

        const itemDateString = `${year}-${month}-${day}`;

        // START DATE
        if (startDate && itemDateString < startDate) {
          return false;
        }

        // END DATE
        if (endDate && itemDateString > endDate) {
          return false;
        }

        return true;
      });
    }

    return result;
  }, [
    breakHistory,
    search,
    typeFilter,
    startDate,
    endDate,
  ]);

  // =========================================================
  // TOTAL FILTERED HOURS
  // =========================================================

  const totalFilteredSeconds = useMemo(() => {
    return filteredBreakHistory.reduce((total, item) => {
      const seconds = Number(item?.duration_seconds);

      if (!Number.isFinite(seconds)) {
        return total;
      }

      return total + seconds;
    }, 0);
  }, [filteredBreakHistory]);

  const totalFilteredHours = useMemo(() => {
    const totalSeconds = totalFilteredSeconds;

    const hours = Math.floor(totalSeconds / 3600);

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );

    if (hours === 0 && minutes === 0) {
      const seconds = Math.floor(totalSeconds % 60);

      if (seconds > 0) {
        return `${seconds}s`;
      }

      return "0h 0m";
    }

    return `${hours}h ${minutes}m`;
  }, [totalFilteredSeconds]);

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("All");
    setStartDate("");
    setEndDate("");
  };

  const hasFilters =
    search.trim() ||
    typeFilter !== "All" ||
    startDate ||
    endDate;

  // =========================================================
  // DATE RANGE TEXT
  // =========================================================

  const dateRangeText = useMemo(() => {
    if (startDate && endDate) {
      return `${formatDateOnly(startDate)} → ${formatDateOnly(
        endDate
      )}`;
    }

    if (startDate) {
      return `From ${formatDateOnly(startDate)}`;
    }

    if (endDate) {
      return `Until ${formatDateOnly(endDate)}`;
    }

    return "All dates";
  }, [startDate, endDate]);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar />

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="min-h-screen lg:pl-[270px]">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* =================================================
              HEADER
          ================================================== */}

          <div className="mb-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 border border-rose-100 px-3 py-1.5">
                    <CalendarDays className="w-4 h-4 text-[#741C29]" />

                    <span className="text-xs font-semibold text-[#741C29]">
                      Attendance
                    </span>
                  </div>

                  {currentUser?.role === "admin" && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />

                      <span className="text-xs font-semibold text-indigo-700">
                        Admin View
                      </span>
                    </div>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Break History
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  View and monitor employee break activity
                </p>
              </div>

              {/* REFRESH BUTTON */}
              <button
                type="button"
                onClick={() => fetchBreakHistory(true)}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />

                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {/* =================================================
              STATS
          ================================================== */}

   <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 mb-6">
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

          {/* =================================================
              FILTER BAR
          ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm mb-6">
            <div className="p-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                {/* SEARCH */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search employee, team or break type..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#741C29] focus:bg-white focus:ring-2 focus:ring-[#741C29]/10"
                  />
                </div>

                {/* MOBILE FILTER TOGGLE */}
                <button
                  type="button"
                  onClick={() =>
                    setShowFilters((prev) => !prev)
                  }
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

                {/* FILTERS */}
                <div
                  className={`${
                    showFilters ? "flex" : "hidden"
                  } flex-col gap-3 xl:flex xl:flex-row xl:items-center`}
                >
                  {/* BREAK TYPE */}
                  <div className="relative">
                    <select
                      value={typeFilter}
                      onChange={(e) =>
                        setTypeFilter(e.target.value)
                      }
                      className="w-full min-w-[160px] appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-[#741C29] focus:bg-white focus:ring-2 focus:ring-[#741C29]/10"
                    >
                      <option value="All">
                        All Break Types
                      </option>
                      <option value="Namaz">Namaz</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Short Break">Short Break</option>
                      <option value="Washroom">
                        Washroom
                      </option>
                      <option value="Other">Other</option>
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>

                  {/* START DATE */}
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) =>
                        setStartDate(e.target.value)
                      }
                      className="w-full min-w-[165px] rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#741C29] focus:bg-white focus:ring-2 focus:ring-[#741C29]/10"
                      title="Start Date"
                    />
                  </div>

                  {/* END DATE */}
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type="date"
                      value={endDate}
                      min={startDate || undefined}
                      onChange={(e) =>
                        setEndDate(e.target.value)
                      }
                      className="w-full min-w-[165px] rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#741C29] focus:bg-white focus:ring-2 focus:ring-[#741C29]/10"
                      title="End Date"
                    />
                  </div>

                  {/* CLEAR */}
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

              {/* DATE RANGE SUMMARY */}
              {(startDate || endDate) && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                  <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <CalendarDays className="h-3.5 w-3.5" />

                    <span>
                      Date Range: {dateRangeText}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    <Clock3 className="h-3.5 w-3.5" />

                    <span>
                      Total Hours: {totalFilteredHours}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400">
                    {filteredBreakHistory.length} record
                    {filteredBreakHistory.length !== 1
                      ? "s"
                      : ""}{" "}
                    found
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* =================================================
              TABLE
          ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* TABLE HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Break Records
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  {filteredBreakHistory.length} record
                  {filteredBreakHistory.length !== 1
                    ? "s"
                    : ""}
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                <Users className="h-4 w-4 text-slate-400" />

                <span className="text-xs font-semibold text-slate-600">
                  {filteredBreakHistory.length} Records
                </span>
              </div>
            </div>

            {/* =================================================
                LOADING
            ================================================== */}

            {historyLoading && !breakHistory.length ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-[#741C29]" />

                  <p className="text-sm text-slate-500">
                    Loading break history...
                  </p>
                </div>
              </div>
            ) : filteredBreakHistory.length === 0 ? (
              /* =================================================
                  EMPTY STATE
              ================================================== */

              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
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
                {/* =================================================
                    DESKTOP TABLE
                ================================================== */}

                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70">
                        <TableHeading>
                          Employee
                        </TableHeading>

                        <TableHeading>
                          Team
                        </TableHeading>

                        <TableHeading>
                          Break Type
                        </TableHeading>

                        <TableHeading>
                          Started
                        </TableHeading>

                        <TableHeading>
                          Ended
                        </TableHeading>

                        <TableHeading align="right">
                          Duration
                        </TableHeading>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredBreakHistory.map(
                        (item, index) => (
                          <BreakTableRow
                            key={
                              item.id ||
                              item.break_id ||
                              `${item.started_at}-${index}`
                            }
                            item={item}
                            formatDateTime={formatDateTime}
                            formatDuration={formatDuration}
                            getTypeIcon={getTypeIcon}
                            getTypeStyles={
                              getTypeStyles
                            }
                            isActiveBreak={
                              isActiveBreak
                            }
                          />
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* =================================================
                    MOBILE / TABLET CARDS
                ================================================== */}

                <div className="md:hidden divide-y divide-slate-100">
                  {filteredBreakHistory.map(
                    (item, index) => (
                      <BreakMobileCard
                        key={
                          item.id ||
                          item.break_id ||
                          `${item.started_at}-${index}`
                        }
                        item={item}
                        formatDateTime={formatDateTime}
                        formatDateOnly={formatDateOnly}
                        formatDuration={formatDuration}
                        getTypeIcon={getTypeIcon}
                        getTypeStyles={getTypeStyles}
                        isActiveBreak={
                          isActiveBreak
                        }
                      />
                    )
                  )}
                </div>
              </>
            )}
          </div>

          {/* =================================================
              FOOTER
          ================================================== */}

          <div className="mt-4 flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Data automatically refreshes every 5 seconds.
            </span>

            <span>
              Showing {filteredBreakHistory.length} of{" "}
              {breakHistory.length} records
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

// =============================================================
// STAT CARD
// =============================================================

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  iconClass,
}) {
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
      className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

// =============================================================
// DESKTOP TABLE ROW
// =============================================================

function BreakTableRow({
  item,
  formatDateTime,
  formatDuration,
  getTypeIcon,
  getTypeStyles,
  isActiveBreak,
}) {
  const employeeName =
    item.employee_name ||
    item.user_name ||
    item.name ||
    "Unknown Employee";

  const employeeEmail =
    item.employee_email ||
    item.user_email ||
    item.email ||
    "";

  const team =
    item.team ||
    item.department ||
    item.team_name ||
    "—";

  const breakType =
    item.break_type ||
    item.type ||
    item.status ||
    "Other";

  const TypeIcon = getTypeIcon(breakType);

  const styles = getTypeStyles(breakType);

  const active = isActiveBreak(item);

  return (
    <tr className="group transition hover:bg-slate-50/70">
      {/* EMPLOYEE */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-bold text-slate-600">
            {employeeName
              .charAt(0)
              .toUpperCase()}
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

      {/* TEAM */}
      <td className="px-5 py-4">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          {team}
        </span>
      </td>

      {/* TYPE */}
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-bold ${styles.bg} ${styles.text} ${styles.border}`}
        >
          <TypeIcon className="h-3.5 w-3.5" />

          {breakType}
        </span>
      </td>

      {/* STARTED */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock3 className="h-4 w-4 text-slate-400" />

          {formatDateTime(item.started_at)}
        </div>
      </td>

      {/* ENDED */}
      <td className="px-5 py-4">
        {active ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Active
          </span>
        ) : (
          <span className="text-sm text-slate-600">
            {formatDateTime(item.ended_at)}
          </span>
        )}
      </td>

      {/* DURATION */}
      <td className="px-5 py-4 text-right">
        <span
          className={`text-sm font-bold ${
            active
              ? "text-emerald-600"
              : "text-slate-800"
          }`}
        >
          {formatDuration(
            item.duration_seconds
          )}
        </span>
      </td>
    </tr>
  );
}

// =============================================================
// MOBILE CARD
// =============================================================

function BreakMobileCard({
  item,
  formatDateTime,
  formatDateOnly,
  formatDuration,
  getTypeIcon,
  getTypeStyles,
  isActiveBreak,
}) {
  const employeeName =
    item.employee_name ||
    item.user_name ||
    item.name ||
    "Unknown Employee";

  const employeeEmail =
    item.employee_email ||
    item.user_email ||
    item.email ||
    "";

  const team =
    item.team ||
    item.department ||
    item.team_name ||
    "—";

  const breakType =
    item.break_type ||
    item.type ||
    item.status ||
    "Other";

  const TypeIcon = getTypeIcon(breakType);

  const styles = getTypeStyles(breakType);

  const active = isActiveBreak(item);

  return (
    <div className="p-4">
      {/* TOP */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-bold text-slate-600">
            {employeeName
              .charAt(0)
              .toUpperCase()}
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

      {/* TEAM */}
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <Users className="h-3.5 w-3.5 text-slate-400" />

        <span>{team}</span>
      </div>

      {/* DATE */}
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

        <span>
          {formatDateOnly(item.started_at)}
        </span>
      </div>

      {/* TIME GRID */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Started
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-700">
            {formatDateTime(item.started_at)}
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
              {formatDateTime(item.ended_at)}
            </p>
          )}
        </div>
      </div>

      {/* DURATION */}
      <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-3">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-slate-400" />

          <span className="text-xs font-semibold text-slate-500">
            Duration
          </span>
        </div>

        <span
          className={`text-sm font-bold ${
            active
              ? "text-emerald-600"
              : "text-slate-800"
          }`}
        >
          {formatDuration(
            item.duration_seconds
          )}
        </span>
      </div>
    </div>
  );
}