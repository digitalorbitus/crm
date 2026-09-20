
// "use client";

// import { useEffect, useState, useCallback } from "react";
// import Sidebar from "@/components/Sidebar";
// import LogoutModal from "@/components/LogoutModal";
// import CRMLoader from "@/components/CRMLoader";
// import { useRouter } from "next/navigation";
// import {
//   Phone,
//   User,
//   CheckCircle2,
//   AlertTriangle,
//   Clock,
//   Loader2,
//   Tag,
//   RefreshCw,
// } from "lucide-react";

// export default function StaffDashboardPage() {
//   const router = useRouter();

//   const [numbers, setNumbers] = useState([]);
//   const [staff, setStaff] = useState(null);

//   const [loading, setLoading] = useState(true);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [rawApiResponse, setRawApiResponse] = useState(null);

//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [loggingOut, setLoggingOut] = useState(false);
//   const [showLogoutModal, setShowLogoutModal] = useState(false);

//   const loadStaffData = useCallback(async () => {
//     setLoading(true);
//     setErrorMessage("");

//     try {
//       // 1. Fetch Auth Details
//       const userRes = await fetch("/api/auth/me", { cache: "no-store" });
//       const userData = await userRes.json();

//       if (!userRes.ok || !userData?.success || !userData?.user) {
//         setErrorMessage("Authentication failed. Please login again.");
//         setLoading(false);
//         return;
//       }

//       setStaff(userData.user);

//       // 2. Fetch Daily Desk Data
//       const res = await fetch("/api/staff/daily-desk", { cache: "no-store" });
//       const data = await res.json();

//       setRawApiResponse(data);

//       if (!res.ok || !data?.success) {
//         throw new Error(data?.message || "Failed to load Daily Desk data.");
//       }

//       // Safe extraction across various API responses
//       let listData = [];
//       if (Array.isArray(data)) {
//         listData = data;
//       } else if (Array.isArray(data?.data)) {
//         listData = data.data;
//       } else if (Array.isArray(data?.tasks)) {
//         listData = data.tasks;
//       } else if (Array.isArray(data?.numbers)) {
//         listData = data.numbers;
//       } else if (Array.isArray(data?.assignments)) {
//         listData = data.assignments;
//       }

//       setNumbers(listData);
//     } catch (error) {
//       console.error("Staff dashboard fetch error:", error);
//       setErrorMessage(error.message || "Failed to fetch daily assignments.");
//       setNumbers([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadStaffData();
//   }, [loadStaffData]);














// // useEffect(() => {
// //   loadStaffData();
// // }, [loadStaffData]);

// // // Automatically refresh Daily Desk when the calendar date changes
// // useEffect(() => {
// //   let timeoutId;

// //   const scheduleMidnightRefresh = () => {
// //     const now = new Date();

// //     // Next local midnight
// //     const nextMidnight = new Date(now);
// //     nextMidnight.setHours(24, 0, 0, 0);

// //     const timeUntilMidnight = nextMidnight.getTime() - now.getTime();

// //     timeoutId = setTimeout(async () => {
// //       console.log("📅 New day detected — refreshing Daily Desk...");

// //       await loadStaffData();

// //       // Schedule the next midnight refresh
// //       scheduleMidnightRefresh();
// //     }, timeUntilMidnight);
// //   };

// //   scheduleMidnightRefresh();

// //   return () => {
// //     clearTimeout(timeoutId);
// //   };
// // }, [loadStaffData]);








//   const handleConfirmLogout = async () => {
//     setLoggingOut(true);
//     try {
//       localStorage.removeItem("crm_login_time");
//       const response = await fetch("/api/logout", { method: "POST" });
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
//       alert("Something went wrong during logout.");
//       setLoggingOut(false);
//       setShowLogoutModal(false);
//     }
//   };

// // =========  loder start  ==========
// // if (loading) {
// //   return (
// //     <CRMLoader
// //       title="CRM"
// //  subtitle="Daily Task Assignments"
// //       message="Loading admin workspace..."
// //     />
// //   );
// // }
// // =========  loder end  ==========

//   // Task Status Logic
//   const completedTasks = numbers.filter((item) => {
//     if (typeof item !== "object" || !item) return false;
//     const status = (item.status || "").toLowerCase();
//     return status === "completed" || status === "done" || status === "called";
//   }).length;

//   const pendingTasks = numbers.length - completedTasks;

//   return (
//     <div className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50">
//       <Sidebar
//         sidebarOpen={sidebarOpen}
//         setSidebarOpen={setSidebarOpen}
//         setShowLogoutModal={setShowLogoutModal}
//       />

//       <div className="max-w-7xl mx-auto">
//         {/* HEADER */}
//         <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//           <div className="flex items-center gap-4">
//             <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
//               <User size={22} />
//             </div>
//             <div>
//               <h1 className="text-2xl font-black text-slate-900">
//                 Staff Daily Desk
//               </h1>
//               <p className="text-sm text-slate-500 mt-0.5">
//                 Welcome back,{" "}
//                 <span className="font-semibold text-slate-700">
//                   {staff?.name || "Staff"}
//                 </span>
//               </p>
//               <p className="text-xs text-slate-400">
//                 Staff ID: {staff?.id || staff?._id || "N/A"}
//               </p>
//             </div>
//           </div>

//           <button
//             onClick={loadStaffData}
//             className="self-start sm:self-auto p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition flex items-center gap-2 text-xs font-semibold cursor-pointer"
//           >
//             <RefreshCw size={14} /> Refresh
//           </button>
//         </div>

//         {/* ERROR ALERT */}
//         {errorMessage && (
//           <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
//             <AlertTriangle size={18} className="shrink-0" />
//             <span>{errorMessage}</span>
//           </div>
//         )}

//         {/* STATS */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
//           <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
//                 <Phone size={20} />
//               </div>
//               <div>
//                 <p className="text-xs text-slate-400">My Tasks</p>
//                 <p className="text-2xl font-black text-slate-900">
//                   {numbers.length}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
//                 <Clock size={20} />
//               </div>
//               <div>
//                 <p className="text-xs text-slate-400">Pending</p>
//                 <p className="text-2xl font-black text-slate-900">
//                   {pendingTasks}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
//                 <CheckCircle2 size={20} />
//               </div>
//               <div>
//                 <p className="text-xs text-slate-400">Completed</p>
//                 <p className="text-2xl font-black text-slate-900">
//                   {completedTasks}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* DAILY NUMBERS LIST */}
//         <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
//           <div className="p-6 border-b border-slate-100">
//             <h2 className="font-bold text-slate-900">
//               Today's Assigned Call Tasks
//             </h2>
//             <p className="text-xs text-slate-400 mt-1">
//               Task IDs and phone numbers assigned to you today
//             </p>
//           </div>

//           <div className="p-6">
//             {numbers.length === 0 ? (
//               <div className="text-center py-10">
//                 <Phone size={35} className="mx-auto text-slate-300" />
//                 <p className="mt-3 text-sm font-bold text-slate-600">
//                   No numbers assigned
//                 </p>
//                 <p className="text-xs text-slate-400 mt-1">
//                   Admin se daily call list ka wait karein.
//                 </p>

//                 {/* DEBUG PRINT FOR API RESPONSE */}
//                 {/* {rawApiResponse && (
//                   <div className="mt-6 p-4 bg-slate-900 text-emerald-400 font-mono text-left text-xs rounded-xl overflow-x-auto max-w-2xl mx-auto">
//                     <p className="text-slate-400 border-b border-slate-700 pb-1 mb-2 font-sans font-bold">
//                       🔍 Backend API Raw Response (Debug Info):
//                     </p>
//                     <pre>{JSON.stringify(rawApiResponse, null, 2)}</pre>
//                   </div>
//                 )} */}
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {numbers.map((item, index) => {
//                   const taskId =
//                     typeof item === "object" && item !== null
//                       ? item.task_id || item.id || item.taskId || `TSK-${1001 + index}`
//                       : `TSK-${1001 + index}`;

//                   const phoneNumber =
//                     typeof item === "object" && item !== null
//                       ? item.phone || item.phone_number || item.phoneNumber || item.mobile || "N/A"
//                       : String(item);

//                   return (
//                     <div
//                       key={`${phoneNumber}-${index}`}
//                       className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50/50 transition"
//                     >
//                       <div className="flex items-center gap-4">
//                         <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
//                           {index + 1}
//                         </div>

//                         <div>
//                           <div className="flex items-center gap-1.5 mb-1">
//                             <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 font-extrabold rounded text-[11px]">
//                               <Tag size={10} />
//                               {taskId}
//                             </span>
//                           </div>

//                           <p className="text-xs text-slate-400">Phone Number</p>
//                           <p className="text-base font-black text-slate-800">
//                             {phoneNumber}
//                           </p>
//                         </div>
//                       </div>

//                       <a
//                         href={`tel:${phoneNumber}`}
//                         className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition"
//                       >
//                         <Phone size={14} />
//                         Call
//                       </a>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* LOGOUT CONFIRMATION MODAL */}
//       <LogoutModal
//       show={showLogoutModal}
//       loggingOut={loggingOut}
//       onCancel={() => setShowLogoutModal(false)}
//       onConfirm={handleConfirmLogout}
//     />
//     </div>
//   );
// }








// "use client";

// import { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   Phone,
//   RefreshCw,
//   CheckCircle2,
//   Clock3,
//   ListTodo,
//   ChevronLeft,
//   ChevronRight,
//   Search,
//   X,
//   AlertCircle,
// } from "lucide-react";

// import Sidebar from "@/components/Sidebar";
// import LogoutModal from "@/components/LogoutModal";
// // import CRMLoader from "@/components/CRMLoader";
// import { useRouter } from "next/navigation";

// const PAGE_SIZE = 50;

// function getCaliforniaDate() {
//   return new Intl.DateTimeFormat("en-CA", {
//     timeZone: "America/Los_Angeles",
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//   }).format(new Date());
// }

// function normalizeStatus(status) {
//   const value = String(status || "").toLowerCase().trim();

//   if (
//     value === "completed" ||
//     value === "complete" ||
//     value === "done" ||
//     value === "called"
//   ) {
//     return "completed";
//   }

//   return "pending";
// }

// function formatDate(dateValue) {
//   if (!dateValue) return "—";

//   try {
//     return new Intl.DateTimeFormat("en-US", {
//       timeZone: "America/Los_Angeles",
//       month: "short",
//       day: "2-digit",
//       year: "numeric",
//     }).format(new Date(dateValue));
//   } catch {
//     return "—";
//   }
// }

// function cleanPhone(phone) {
//   return String(phone || "").replace(/[^\d+]/g, "");
// }

// export default function StaffDashboardPage() {
//   const router = useRouter();

//   const [tasks, setTasks] = useState([]);
//   const [staff, setStaff] = useState(null);

//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const [error, setError] = useState("");
//   const [apiDate, setApiDate] = useState("");

//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState("all");

//   const [page, setPage] = useState(1);

//   const [showLogout, setShowLogout] = useState(false);

//   /*
//    * ---------------------------------------------------------
//    * LOAD STAFF
//    * ---------------------------------------------------------
//    */

//   const loadStaff = useCallback(async () => {
//     try {
//       const res = await fetch("/api/auth/me", {
//         cache: "no-store",
//         headers: {
//           "Cache-Control": "no-cache",
//           Pragma: "no-cache",
//         },
//       });

//       if (!res.ok) {
//         router.replace("/login");
//         return null;
//       }

//       const result = await res.json();

//       if (!result?.user) {
//         router.replace("/login");
//         return null;
//       }

//       setStaff(result.user);

//       return result.user;
//     } catch (err) {
//       console.error("AUTH ERROR:", err);
//       router.replace("/login");
//       return null;
//     }
//   }, [router]);

//   /*
//    * ---------------------------------------------------------
//    * LOAD DAILY DESK
//    * ---------------------------------------------------------
//    */

//   const loadDailyDesk = useCallback(
//     async (showRefresh = false) => {
//       if (showRefresh) {
//         setRefreshing(true);
//       } else {
//         setLoading(true);
//       }

//       setError("");

//       try {
//         /*
//          * First get logged-in user.
//          */
//         const currentStaff = await loadStaff();

//         if (!currentStaff) {
//           return;
//         }

//         /*
//          * IMPORTANT:
//          *
//          * API date is explicitly sent.
//          *
//          * California date is used as the initial business date.
//          */
//         const californiaDate = getCaliforniaDate();

//         console.log(
//           "Daily Desk California date:",
//           californiaDate
//         );

//         const url =
//           `/api/staff/daily-desk?date=${encodeURIComponent(
//             californiaDate
//           )}`;

//         console.log("Daily Desk API:", url);

//         const res = await fetch(url, {
//           method: "GET",
//           cache: "no-store",
//           headers: {
//             "Cache-Control": "no-cache",
//             Pragma: "no-cache",
//           },
//         });

//         const result = await res.json();

//         console.log("DAILY DESK API RESULT:", result);

//         if (!res.ok || !result?.success) {
//           throw new Error(
//             result?.message ||
//               result?.error ||
//               "Daily Desk data fetch nahi hua"
//           );
//         }

//         /*
//          * API itself tells us the actual business date.
//          */
//         setApiDate(result.date || californiaDate);

//         /*
//          * API returns:
//          *
//          * data: [...]
//          *
//          * Make sure it is always an array.
//          */
//         const rawTasks = Array.isArray(result.data)
//           ? result.data
//           : [];

//         /*
//          * Normalize every task.
//          */
//         const normalizedTasks = rawTasks.map((item, index) => ({
//           ...item,

//           unique_id:
//             item.assignment_id ||
//             item.id ||
//             `${item.task_id || "task"}-${index}`,

//           status: normalizeStatus(item.status),

//           task_id:
//             item.task_id ||
//             item.taskId ||
//             `TASK-${index + 1}`,

//           phone:
//             item.phone ||
//             item.phone_number ||
//             item.number ||
//             "",

//           source_file:
//             item.source_file ||
//             item.sourceFile ||
//             "",

//           assignment_id:
//             item.assignment_id ||
//             item.assignmentId ||
//             item.id ||
//             null,
//         }));

//         setTasks(normalizedTasks);
//         setPage(1);

//         console.log(
//           `Daily Desk loaded: ${normalizedTasks.length} tasks`
//         );
//       } catch (err) {
//         console.error("DAILY DESK ERROR:", err);

//         setTasks([]);

//         setError(
//           err?.message ||
//             "Daily Desk data fetch nahi hua"
//         );
//       } finally {
//         setLoading(false);
//         setRefreshing(false);
//       }
//     },
//     [loadStaff]
//   );

//   /*
//    * ---------------------------------------------------------
//    * INITIAL LOAD
//    * ---------------------------------------------------------
//    */

//   useEffect(() => {
//     loadDailyDesk(false);
//   }, [loadDailyDesk]);

//   /*
//    * ---------------------------------------------------------
//    * AUTO REFRESH
//    *
//    * Zoom calls complete hone ke baad status automatically
//    * update ho jayega.
//    * ---------------------------------------------------------
//    */

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (document.visibilityState === "visible") {
//         loadDailyDesk(true);
//       }
//     }, 15000);

//     return () => clearInterval(interval);
//   }, [loadDailyDesk]);

//   /*
//    * ---------------------------------------------------------
//    * REFRESH WHEN TAB BECOMES ACTIVE
//    * ---------------------------------------------------------
//    */

//   useEffect(() => {
//     const handleVisibility = () => {
//       if (document.visibilityState === "visible") {
//         loadDailyDesk(true);
//       }
//     };

//     document.addEventListener(
//       "visibilitychange",
//       handleVisibility
//     );

//     return () => {
//       document.removeEventListener(
//         "visibilitychange",
//         handleVisibility
//       );
//     };
//   }, [loadDailyDesk]);

//   /*
//    * ---------------------------------------------------------
//    * STATS
//    * ---------------------------------------------------------
//    */

//   const stats = useMemo(() => {
//     const total = tasks.length;

//     const completed = tasks.filter(
//       (task) =>
//         normalizeStatus(task.status) === "completed"
//     ).length;

//     const pending = total - completed;

//     return {
//       total,
//       completed,
//       pending,
//     };
//   }, [tasks]);

//   /*
//    * ---------------------------------------------------------
//    * SEARCH + FILTER
//    * ---------------------------------------------------------
//    */

//   const filteredTasks = useMemo(() => {
//     const q = search.trim().toLowerCase();

//     return tasks.filter((task) => {
//       const status = normalizeStatus(task.status);

//       if (
//         filter === "completed" &&
//         status !== "completed"
//       ) {
//         return false;
//       }

//       if (
//         filter === "pending" &&
//         status !== "pending"
//       ) {
//         return false;
//       }

//       if (!q) return true;

//       return (
//         String(task.task_id || "")
//           .toLowerCase()
//           .includes(q) ||
//         String(task.phone || "")
//           .toLowerCase()
//           .includes(q) ||
//         String(task.source_file || "")
//           .toLowerCase()
//           .includes(q)
//       );
//     });
//   }, [tasks, search, filter]);

//   /*
//    * ---------------------------------------------------------
//    * PAGINATION
//    * ---------------------------------------------------------
//    */

//   const totalPages = Math.max(
//     1,
//     Math.ceil(filteredTasks.length / PAGE_SIZE)
//   );

//   const safePage = Math.min(page, totalPages);

//   const paginatedTasks = useMemo(() => {
//     const start = (safePage - 1) * PAGE_SIZE;

//     return filteredTasks.slice(
//       start,
//       start + PAGE_SIZE
//     );
//   }, [filteredTasks, safePage]);

//   /*
//    * ---------------------------------------------------------
//    * SEARCH / FILTER RESET
//    * ---------------------------------------------------------
//    */

//   useEffect(() => {
//     setPage(1);
//   }, [search, filter]);

//   /*
//    * ---------------------------------------------------------
//    * LOGOUT
//    * ---------------------------------------------------------
//    */

//   const handleLogout = async () => {
//     try {
//       await fetch("/api/logout", {
//         method: "POST",
//         credentials: "include",
//       });
//     } catch (err) {
//       console.error("LOGOUT ERROR:", err);
//     }

//     try {
//       localStorage.removeItem("crm_login_time");
//       localStorage.removeItem("crm_status_timer");
//     } catch {}

//     router.replace("/login");
//   };

//   /*
//    * ---------------------------------------------------------
//    * LOADING
//    * ---------------------------------------------------------
//    */

//   // if (loading) {
//   //   return (
//   //     <div className="min-h-screen bg-[#f7f7f8]">
//   //       <Sidebar />

//   //       <main className="ml-0 lg:ml-[250px] min-h-screen">
//   //         <CRMLoader />
//   //       </main>
//   //     </div>
//   //   );
//   // }

//   /*
//    * ---------------------------------------------------------
//    * UI
//    * ---------------------------------------------------------
//    */

//   return (
//     <div className="min-h-screen bg-[#f7f7f8] text-gray-900">
//       <Sidebar />

//       <main className="lg:ml-[250px] min-h-screen">
//         <div className="p-4 sm:p-6 lg:p-8">

//           {/* =================================================
//               HEADER
//           ================================================= */}

//           <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between mb-7">

//             <div>
//               <div className="flex items-center gap-3">
//                 <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
//                   Daily Desk
//                 </h1>

//                 {staff?.name && (
//                   <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-600">
//                     {String(staff.name).trim()}
//                   </span>
//                 )}
//               </div>

//               <p className="mt-1 text-sm text-gray-500">
//                 Your daily call assignments
//               </p>

//               {apiDate && (
//                 <p className="mt-2 text-xs text-gray-400">
//                   Business Date:{" "}
//                   <span className="font-semibold text-gray-600">
//                     {formatDate(apiDate)}
//                   </span>
//                   {" "}• California Time
//                 </p>
//               )}
//             </div>

//             <button
//               type="button"
//               onClick={() => loadDailyDesk(true)}
//               disabled={refreshing}
//               className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#741C29] text-white text-sm font-semibold shadow-sm hover:bg-[#5f1722] disabled:opacity-60 disabled:cursor-not-allowed transition"
//             >
//               <RefreshCw
//                 className={`w-4 h-4 ${
//                   refreshing ? "animate-spin" : ""
//                 }`}
//               />

//               {refreshing
//                 ? "Refreshing..."
//                 : "Refresh"}
//             </button>
//           </div>

//           {/* =================================================
//               ERROR
//           ================================================= */}

//           {error && (
//             <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
//               <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />

//               <div className="min-w-0">
//                 <p className="font-semibold text-red-800">
//                   Daily Desk Error
//                 </p>

//                 <p className="text-sm text-red-700 mt-1 break-words">
//                   {error}
//                 </p>

//                 <button
//                   type="button"
//                   onClick={() => loadDailyDesk(true)}
//                   className="mt-3 text-sm font-semibold text-red-800 underline"
//                 >
//                   Try Again
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* =================================================
//               STATS
//           ================================================= */}

//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">

//             {/* TOTAL */}

//             <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500 font-medium">
//                     My Tasks
//                   </p>

//                   <p className="text-3xl font-bold mt-2">
//                     {stats.total.toLocaleString()}
//                   </p>
//                 </div>

//                 <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
//                   <ListTodo className="w-5 h-5 text-gray-700" />
//                 </div>
//               </div>
//             </div>

//             {/* PENDING */}

//             <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500 font-medium">
//                     Pending
//                   </p>

//                   <p className="text-3xl font-bold mt-2 text-amber-600">
//                     {stats.pending.toLocaleString()}
//                   </p>
//                 </div>

//                 <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
//                   <Clock3 className="w-5 h-5 text-amber-600" />
//                 </div>
//               </div>
//             </div>

//             {/* COMPLETED */}

//             <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500 font-medium">
//                     Completed
//                   </p>

//                   <p className="text-3xl font-bold mt-2 text-green-600">
//                     {stats.completed.toLocaleString()}
//                   </p>
//                 </div>

//                 <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
//                   <CheckCircle2 className="w-5 h-5 text-green-600" />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* =================================================
//               TASK AREA
//           ================================================= */}

//           <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

//             {/* TOOLBAR */}

//             <div className="p-4 sm:p-5 border-b border-gray-200">

//               <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">

//                 {/* SEARCH */}

//                 <div className="relative w-full lg:max-w-md">
//                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

//                   <input
//                     type="text"
//                     value={search}
//                     onChange={(e) =>
//                       setSearch(e.target.value)
//                     }
//                     placeholder="Search task ID or phone..."
//                     className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:bg-white focus:border-[#741C29] focus:ring-2 focus:ring-[#741C29]/10 transition"
//                   />

//                   {search && (
//                     <button
//                       type="button"
//                       onClick={() => setSearch("")}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
//                     >
//                       <X className="w-4 h-4" />
//                     </button>
//                   )}
//                 </div>

//                 {/* FILTERS */}

//                 <div className="flex items-center gap-2">
//                   <button
//                     type="button"
//                     onClick={() => setFilter("all")}
//                     className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
//                       filter === "all"
//                         ? "bg-[#741C29] text-white"
//                         : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//                     }`}
//                   >
//                     All
//                   </button>

//                   <button
//                     type="button"
//                     onClick={() =>
//                       setFilter("pending")
//                     }
//                     className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
//                       filter === "pending"
//                         ? "bg-[#741C29] text-white"
//                         : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//                     }`}
//                   >
//                     Pending
//                   </button>

//                   <button
//                     type="button"
//                     onClick={() =>
//                       setFilter("completed")
//                     }
//                     className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
//                       filter === "completed"
//                         ? "bg-[#741C29] text-white"
//                         : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//                     }`}
//                   >
//                     Completed
//                   </button>
//                 </div>
//               </div>

//               {/* RESULT COUNT */}

//               <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
//                 <span>
//                   Showing{" "}
//                   <strong className="text-gray-700">
//                     {filteredTasks.length.toLocaleString()}
//                   </strong>{" "}
//                   tasks
//                 </span>

//                 {refreshing && (
//                   <span className="inline-flex items-center gap-1.5">
//                     <RefreshCw className="w-3.5 h-3.5 animate-spin" />
//                     Updating...
//                   </span>
//                 )}
//               </div>
//             </div>

//             {/* =================================================
//                 EMPTY STATE
//             ================================================= */}

//             {filteredTasks.length === 0 ? (
//               <div className="py-20 px-6 text-center">

//                 <div className="mx-auto w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
//                   <ListTodo className="w-6 h-6 text-gray-400" />
//                 </div>

//                 <h3 className="mt-4 font-semibold text-gray-800">
//                   No tasks found
//                 </h3>

//                 <p className="mt-1 text-sm text-gray-500">
//                   {search
//                     ? "Try a different task ID or phone number."
//                     : "No Daily Desk tasks are assigned for this date."}
//                 </p>

//                 {!search && !error && (
//                   <button
//                     type="button"
//                     onClick={() =>
//                       loadDailyDesk(true)
//                     }
//                     className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#741C29] text-white text-sm font-semibold"
//                   >
//                     <RefreshCw className="w-4 h-4" />
//                     Refresh Tasks
//                   </button>
//                 )}
//               </div>
//             ) : (
//               <>
//                 {/* =================================================
//                     DESKTOP TABLE
//                 ================================================= */}

//                 <div className="hidden md:block overflow-x-auto">
//                   <table className="w-full">
//                     <thead>
//                       <tr className="bg-gray-50 border-b border-gray-200">
//                         <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
//                           #
//                         </th>

//                         <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
//                           Task ID
//                         </th>

//                         <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
//                           Phone Number
//                         </th>

//                         <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
//                           Status
//                         </th>

//                         <th className="text-right px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
//                           Action
//                         </th>
//                       </tr>
//                     </thead>

//                     <tbody className="divide-y divide-gray-100">
//                       {paginatedTasks.map(
//                         (task, index) => {
//                           const status =
//                             normalizeStatus(
//                               task.status
//                             );

//                           const isCompleted =
//                             status === "completed";

//                           const globalIndex =
//                             (safePage - 1) *
//                               PAGE_SIZE +
//                             index +
//                             1;

//                           const phone =
//                             cleanPhone(task.phone);

//                           return (
//                             <tr
//                               key={task.unique_id}
//                               className="hover:bg-gray-50/70 transition"
//                             >
//                               <td className="px-5 py-4 text-sm text-gray-400 font-medium">
//                                 {globalIndex}
//                               </td>

//                               <td className="px-5 py-4">
//                                 <span className="font-semibold text-gray-800">
//                                   {task.task_id}
//                                 </span>
//                               </td>

//                               <td className="px-5 py-4">
//                                 <span className="font-mono text-sm text-gray-700">
//                                   {task.phone ||
//                                     "—"}
//                                 </span>
//                               </td>

//                               <td className="px-5 py-4">
//                                 {isCompleted ? (
//                                   <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold">
//                                     <CheckCircle2 className="w-3.5 h-3.5" />
//                                     Completed
//                                   </span>
//                                 ) : (
//                                   <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
//                                     <Clock3 className="w-3.5 h-3.5" />
//                                     Pending
//                                   </span>
//                                 )}
//                               </td>

//                               <td className="px-5 py-4 text-right">
//                                 {phone ? (
//                                   <a
//                                     href={`tel:${phone}`}
//                                     className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
//                                       isCompleted
//                                         ? "bg-gray-100 text-gray-500"
//                                         : "bg-[#741C29] text-white hover:bg-[#5f1722]"
//                                     }`}
//                                   >
//                                     <Phone className="w-4 h-4" />

//                                     {isCompleted
//                                       ? "Call Again"
//                                       : "Call"}
//                                   </a>
//                                 ) : (
//                                   <span className="text-xs text-gray-400">
//                                     No number
//                                   </span>
//                                 )}
//                               </td>
//                             </tr>
//                           );
//                         }
//                       )}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* =================================================
//                     MOBILE CARDS
//                 ================================================= */}

//                 <div className="md:hidden divide-y divide-gray-100">
//                   {paginatedTasks.map(
//                     (task, index) => {
//                       const status =
//                         normalizeStatus(
//                           task.status
//                         );

//                       const isCompleted =
//                         status === "completed";

//                       const phone =
//                         cleanPhone(task.phone);

//                       const globalIndex =
//                         (safePage - 1) *
//                           PAGE_SIZE +
//                         index +
//                         1;

//                       return (
//                         <div
//                           key={task.unique_id}
//                           className="p-4"
//                         >
//                           <div className="flex items-start justify-between gap-3">

//                             <div className="min-w-0">
//                               <p className="text-xs text-gray-400 mb-1">
//                                 #{globalIndex}
//                               </p>

//                               <p className="font-bold text-gray-800">
//                                 {task.task_id}
//                               </p>

//                               <p className="mt-1 font-mono text-sm text-gray-600">
//                                 {task.phone ||
//                                   "No phone number"}
//                               </p>
//                             </div>

//                             {isCompleted ? (
//                               <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold">
//                                 <CheckCircle2 className="w-3.5 h-3.5" />
//                                 Done
//                               </span>
//                             ) : (
//                               <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
//                                 <Clock3 className="w-3.5 h-3.5" />
//                                 Pending
//                               </span>
//                             )}
//                           </div>

//                           {phone && (
//                             <a
//                               href={`tel:${phone}`}
//                               className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#741C29] text-white text-sm font-semibold"
//                             >
//                               <Phone className="w-4 h-4" />
//                               {isCompleted
//                                 ? "Call Again"
//                                 : "Call"}
//                             </a>
//                           )}
//                         </div>
//                       );
//                     }
//                   )}
//                 </div>

//                 {/* =================================================
//                     PAGINATION
//                 ================================================= */}

//                 {totalPages > 1 && (
//                   <div className="px-4 sm:px-5 py-4 border-t border-gray-200 flex items-center justify-between gap-4">

//                     <p className="text-xs sm:text-sm text-gray-500">
//                       Page{" "}
//                       <strong className="text-gray-700">
//                         {safePage}
//                       </strong>{" "}
//                       of{" "}
//                       <strong className="text-gray-700">
//                         {totalPages}
//                       </strong>
//                     </p>

//                     <div className="flex items-center gap-2">

//                       <button
//                         type="button"
//                         disabled={
//                           safePage <= 1
//                         }
//                         onClick={() =>
//                           setPage(
//                             Math.max(
//                               1,
//                               safePage - 1
//                             )
//                           )
//                         }
//                         className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
//                       >
//                         <ChevronLeft className="w-4 h-4" />
//                       </button>

//                       <button
//                         type="button"
//                         disabled={
//                           safePage >=
//                           totalPages
//                         }
//                         onClick={() =>
//                           setPage(
//                             Math.min(
//                               totalPages,
//                               safePage + 1
//                             )
//                           )
//                         }
//                         className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
//                       >
//                         <ChevronRight className="w-4 h-4" />
//                       </button>

//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>

//           {/* =================================================
//               DEBUG INFO
//           ================================================= */}

//           {process.env.NODE_ENV ===
//             "development" && (
//             <div className="mt-5 rounded-xl bg-gray-900 text-gray-300 p-4 text-xs font-mono overflow-x-auto">
//               <div>
//                 API Date:{" "}
//                 {apiDate || "—"}
//               </div>

//               <div>
//                 Staff ID:{" "}
//                 {staff?.id || "—"}
//               </div>

//               <div>
//                 Total Loaded:{" "}
//                 {tasks.length}
//               </div>

//               <div>
//                 Pending:{" "}
//                 {stats.pending}
//               </div>

//               <div>
//                 Completed:{" "}
//                 {stats.completed}
//               </div>
//             </div>
//           )}
//         </div>
//       </main>

//       {/* =================================================
//           LOGOUT MODAL
//       ================================================= */}

//       {showLogout && (
//         <LogoutModal
//           onClose={() =>
//             setShowLogout(false)
//           }
//           onConfirm={handleLogout}
//         />
//       )}
//     </div>
//   );
// }














"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Phone,
  CheckCircle2,
  Clock3,
  X,
  AlertCircle,
  CalendarDays,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import LogoutModal from "@/components/LogoutModal";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";

const PAGE_SIZE = 50;
const DAILY_TASK_LIMIT = 500;
const CALIFORNIA_TIMEZONE = "America/Los_Angeles";

/* =========================================================
   CALIFORNIA DATE
========================================================= */

function getCaliforniaDate() {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: CALIFORNIA_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

/* =========================================================
   CALIFORNIA DISPLAY DATE
========================================================= */

function formatCaliforniaDate(dateValue) {
  if (!dateValue) return "—";

  try {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return String(dateValue);
    }

    return new Intl.DateTimeFormat("en-US", {
      timeZone: CALIFORNIA_TIMEZONE,
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(date);
  } catch {
    return String(dateValue);
  }
}

/* =========================================================
   PHONE CLEAN
========================================================= */

function cleanPhone(phone) {
  if (!phone) return "";

  return String(phone)
    .trim()
    .replace(/[^\d+]/g, "");
}

/* =========================================================
   NORMALIZE STATUS
========================================================= */

function normalizeStatus(status) {
  const value = String(status || "")
    .trim()
    .toLowerCase();

  if (
    value === "completed" ||
    value === "complete" ||
    value === "done" ||
    value === "called" ||
    value === "answered" ||
    value === "connected"
  ) {
    return "completed";
  }

  return "pending";
}

/* =========================================================
   DISPLAY STATUS
========================================================= */

function getDisplayStatus(row) {
  const rawStatus =
    row?.disposition ||
    row?.outcome ||
    row?.call_disposition ||
    row?.call_status ||
    row?.status;

  const value = String(rawStatus || "").trim();

  if (
    value === "Straight to Voicemail" ||
    value === "No Business" ||
    value === "No Answer" ||
    value === "Hang Up"
  ) {
    return value;
  }

  if (normalizeStatus(value) === "completed") {
    return "Completed";
  }

  return "Pending";
}

/* =========================================================
   ROW NAME
========================================================= */

function getName(row) {
  return (
    row?.name ||
    row?.contact_name ||
    row?.customer_name ||
    row?.full_name ||
    row?.lead_name ||
    row?.client_name ||
    "—"
  );
}

/* =========================================================
   BUSINESS NAME
========================================================= */

function getBusiness(row) {
  return (
    row?.business ||
    row?.business_name ||
    row?.company ||
    row?.company_name ||
    row?.organization ||
    row?.source_file ||
    "—"
  );
}

/* =========================================================
   NOTES
========================================================= */

function getNotes(row) {
  return (
    row?.notes ||
    row?.note ||
    row?.remarks ||
    row?.comment ||
    ""
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function StaffDashboardPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState([]); // sttaus fetch from db
  const [staff, setStaff] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [apiDate, setApiDate] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [page, setPage] = useState(1);

  const [showLogout, setShowLogout] = useState(false);

  /* =======================================================
     LOAD STAFF
  ======================================================= */

  const loadStaff = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        router.replace("/login");
        return null;
      }

      const data = await response.json();

      if (!data?.user) {
        router.replace("/login");
        return null;
      }

      setStaff(data.user);

      return data.user;
    } catch (err) {
      console.error("loadStaff error:", err);

      router.replace("/login");

      return null;
    }
  }, [router]);

  /* =======================================================
     LOAD DAILY DESK
  ======================================================= */

  // const loadDailyDesk = useCallback(
  //   async (showRefresh = false) => {
  //     if (showRefresh) {
  //       setRefreshing(true);
  //     } else {
  //       setLoading(true);
  //     }

  //     setError("");

  //     try {
  //       const currentStaff = await loadStaff();

  //       if (!currentStaff) {
  //         return;
  //       }

  //       const californiaDate = getCaliforniaDate();

  //       const response = await fetch(
  //         `/api/staff/daily-desk?date=${encodeURIComponent(
  //           californiaDate
  //         )}`,
  //         {
  //           method: "GET",
  //           cache: "no-store",
  //           headers: {
  //             "Cache-Control": "no-cache, no-store, must-revalidate",
  //             Pragma: "no-cache",
  //             Expires: "0",
  //           },
  //         }
  //       );

  //       const data = await response.json();

  //       if (!response.ok || !data?.success) {
  //         throw new Error(
  //           data?.message ||
  //           data?.error ||
  //           "Unable to load Daily Desk."
  //         );
  //       }

  //       setApiDate(
  //         data?.california_date ||
  //         data?.date ||
  //         californiaDate
  //       );

  //       const rows = Array.isArray(data?.data)
  //         ? data.data
  //         : [];

  //       /*
  //         Hard UI safety limit.

  //         API should already return maximum 500.
  //       */

  //       const normalizedRows = rows
  //         .slice(0, DAILY_TASK_LIMIT)
  //         .map((item, index) => {
  //           const assignmentId =
  //             item?.assignment_id ??
  //             item?.id ??
  //             item?.assignmentId ??
  //             index + 2;

  //           const phone =
  //             item?.phone ??
  //             item?.phone_number ??
  //             item?.number ??
  //             "";

  //           const taskId =
  //             item?.task_id ??
  //             item?.taskId ??
  //             item?.id ??
  //             "";

  //           const normalizedCallStatus =
  //             normalizeStatus(
  //               item?.status ??
  //               item?.call_status ??
  //               item?.result ??
  //               item?.disposition
  //             );

  //           return {
  //             ...item,

  //             id: assignmentId,

  //             assignment_id: assignmentId,

  //             task_id: taskId,

  //             phone,

  //             name: getName(item),

  //             business: getBusiness(item),

  //             notes: getNotes(item),

  //             date:
  //               item?.assigned_date ||
  //               item?.date ||
  //               data?.california_date ||
  //               californiaDate,

  //             status: normalizedCallStatus,

  //             displayStatus: getDisplayStatus({
  //               ...item,
  //               status: item?.status,
  //             }),
  //           };
  //         });

  //       setTasks(normalizedRows);

  //       setPage(1);
  //     } catch (err) {
  //       console.error("Daily Desk error:", err);

  //       setError(
  //         err?.message ||
  //         "Something went wrong while loading Daily Desk."
  //       );
  //     } finally {
  //       setLoading(false);
  //       setRefreshing(false);
  //     }
  //   },
  //   [loadStaff]
  // );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  // useEffect(() => {
  //   loadDailyDesk(false);
  // }, [loadDailyDesk]);

  /* =======================================================
     AUTO REFRESH EVERY 15 SEC
  ======================================================= */

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (document.visibilityState === "visible") {
  //       loadDailyDesk(true);
  //     }
  //   }, 50);

  //   return () => clearInterval(interval);
  // }, [loadDailyDesk]);

  /* =======================================================
     REFRESH WHEN TAB BECOMES VISIBLE
  ======================================================= */

  // useEffect(() => {
  //   const handleVisibility = () => {
  //     if (document.visibilityState === "visible") {
  //       loadDailyDesk(true);
  //     }
  //   };

  //   document.addEventListener(
  //     "visibilitychange",
  //     handleVisibility
  //   );

  //   return () => {
  //     document.removeEventListener(
  //       "visibilitychange",
  //       handleVisibility
  //     );
  //   };
  // }, [loadDailyDesk]);

  /* =======================================================
     STATS
  ======================================================= */

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) =>
      task.is_completed
  ).length;

  const pendingTasks = totalTasks - completedTasks;

  /* =======================================================
     SEARCH + FILTER
  ======================================================= */

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      // API se actual status
      const status = String(task.assignment_status || "").toLowerCase();

      // API se actual completed state
      const isCompleted =
        task.is_completed === true ||
        task.is_completed === 1 ||
        status === "completed";

      // =========================
      // STATUS FILTER
      // =========================
      const matchesFilter =
        filter === "all" ||
        (filter === "pending" && !isCompleted) ||
        (filter === "completed" && isCompleted);

      if (!matchesFilter) {
        return false;
      }

      // =========================
      // SEARCH
      // =========================
      if (!query) {
        return true;
      }

      const searchable = [
        task.task_id,
        task.phone_number,
        task.name,
        task.business_name,
        task.source_file,
        task.notes,
        task.comment,
        task.assignment_id,
      ]
        .filter(
          (value) => value !== null && value !== undefined
        )
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [tasks, search, filter]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTasks.length / PAGE_SIZE)
  );

  const safePage = Math.min(page, totalPages);

  const paginatedTasks = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;

    return filteredTasks.slice(
      start,
      start + PAGE_SIZE
    );
  }, [filteredTasks, safePage]);

  /* =======================================================
     PAGE CHANGE
  ======================================================= */

  const changePage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) {
      return;
    }

    setPage(newPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     SEARCH CHANGE
  ======================================================= */

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  /* =======================================================
     FILTER CHANGE
  ======================================================= */

  const handleFilter = (value) => {
    setFilter(value);
    setPage(1);
  };

  /* =======================================================
     STATUS CHANGE
  ======================================================= */
  const handleCommentChange = (id, newComment) => {
    setTasks((prev) =>
      prev.map((row) =>
        row.assignment_id === id
          ? {
            ...row,
            comment: newComment,
          }
          : row
      )
    );
  };

  const handleStatusChange = (id, newStatus) => {
    setTasks((prev) =>
      prev.map((row) =>
        row.assignment_id === id
          ? {
            ...row,
            status: newStatus,
          }
          : row
      )
    );


    /*
      IMPORTANT:

      This changes the UI locally.

      To permanently save:
      Straight to Voicemail
      No Business
      No Answer
      Hang Up

      you need a backend status/disposition
      update API.

      Your current Daily Desk API was only
      returning completion status.
    */
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }

    try {
      localStorage.removeItem("crm_login_time");
      localStorage.removeItem("crm_status_timer");
    } catch { }

    router.replace("/login");
  };

  /* =======================================================
     ROW START NUMBER
  ======================================================= */

  const getRowNumber = (index) => {
    return (safePage - 1) * PAGE_SIZE + index + 2;
  };

  /* =======================================================
     LOADING
  ======================================================= */

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gray-100">
  //       <Sidebar />

  //       <main className="md:ml-64 min-h-screen flex items-center justify-center p-6">
  //         <div className="bg-white border border-gray-200 shadow-sm rounded-xl px-8 py-7 flex flex-col items-center">
  //           <RefreshCw className="w-7 h-7 animate-spin text-[#741C29]" />

  //           <p className="mt-3 text-sm font-medium text-gray-700">
  //             Loading Daily Desk...
  //           </p>

  //           <p className="mt-1 text-xs text-gray-400">
  //             California Time
  //           </p>
  //         </div>
  //       </main>
  //     </div>
  //   );
  // }

  /* =======================================================
     UI
  ======================================================= */



  // ==== data bete
  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/employee/tasks`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "failed to load daily tasks")
      }

      setTasks(data?.tasks || []);

      console.log(data)

    } catch (error) {
      toast.error(error.message || "fail to load data.")
      console.error("Error: ", error)
    } finally {
      setLoading(false)
    }
  }


  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/employee/tasks-status`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "failed to load daily tasks")
      }

      setStatus(data?.data || []);

      console.log(data)

    } catch (error) {
      toast.error(error.message || "fail to load data.")
      console.error("Error: ", error)
    }
  }


  useEffect(() => {
    fetchData();
    fetchStatus();
  }, []);



  // ======= PATCH Call Handler
  const handleCallClick = async (id, status, comment) => {
    if(isSubmitting) return;
    if (!id || !status || !comment) {
      toast.error("Please select status and add comment to proceed");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/employee/tasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: status || "PENDING",
          comment: comment || "", // Undefined check before sending
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // =========================================================
        // LIVE STATE UPDATE LOGIC (Fixed variable names)
        // =========================================================
        setTasks((prevTasks) =>
          prevTasks
            .map((task) => {
              if (task.assignment_id === id) {
                return {
                  ...task,
                  assignment_status: status,
                  comment: comment || null,
                  is_completed: true,
                  is_locked: result.isLocked,
                };
              }
              return task;
            })
          // Filter out lock hit non-repeatable status
          // .filter((task) => !(task.assignment_id === id && result.isLocked))
        );

        toast.success("Task updated successfully!");
        return result;
      } else {
        toast.error(`Error: ${result.error || "Failed to update"}`);
        return null;
      }
    } catch (error) {
      console.error("Call button error:", error);
      toast.error(error.message || "Failed to execute request");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };




  // ============= skeleton ================

  const renderStatsSkeleton = () => (
    <div className="px-4 md:px-6 mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="h-3 w-20 bg-gray-200 rounded" />
                <div className="h-7 w-12 bg-gray-200 rounded mt-2" />
              </div>

              <div className="w-10 h-10 rounded-lg bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTableSkeleton = () => (
    <tbody>
      {[1, 2, 3, 4, 5, 6].map((row) => (
        <tr
          key={row}
          className="border-b border-gray-200 animate-pulse"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((col) => (
            <td key={col} className="py-2 px-2">
              <div className="h-5 bg-gray-200 rounded w-full" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );


  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />

      <main className="md:ml-64 min-h-screen">
        {/* =================================================
            TOP SECTION
        ================================================= */}

        <div className="px-4 md:px-6 pt-5">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 md:p-5">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
              {/* LEFT */}

              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#741C29] text-white flex items-center justify-center shadow-sm">
                    <CalendarDays className="w-5 h-5" />
                  </div>

                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                      Daily Desk
                    </h1>

                    <p className="text-xs md:text-sm text-gray-500">
                      {staff?.name
                        ? `Welcome, ${staff.name}`
                        : "Your daily call assignments"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 border border-gray-200 text-xs text-gray-600">
                    <CalendarDays className="w-3.5 h-3.5" />

                    {apiDate || getCaliforniaDate()}
                  </span>

                  <span className="px-2.5 py-1 rounded-md bg-[#741C29]/10 text-[#741C29] border border-[#741C29]/20 text-xs font-medium">
                    California Time
                  </span>

                  <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium">
                    Max {DAILY_TASK_LIMIT} Tasks
                  </span>
                </div>
              </div>

              {/* RIGHT */}

              {/* <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => loadDailyDesk(true)}
                  disabled={refreshing}
                  className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-[#741C29] text-white text-sm font-medium hover:bg-[#5f1722] transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${
                      refreshing ? "animate-spin" : ""
                    }`}
                  />

                  {refreshing
                    ? "Refreshing..."
                    : "Refresh"}
                </button>
              </div> */}
            </div>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="px-4 md:px-6 mt-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />

              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">
                  Daily Desk Error
                </p>

                <p className="text-xs text-red-700 mt-1">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setError("")}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        {loading ? (
          renderStatsSkeleton()
        ) : (
          <div className="px-4 md:px-6 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* TOTAL */}

              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">
                      Total Tasks
                    </p>

                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {totalTasks}
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* COMPLETED */}

              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">
                      Completed
                    </p>

                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {completedTasks}
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-lg bg-green-50 text-green-700 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* PENDING */}

              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">
                      Remaining
                    </p>

                    <p className="text-2xl font-bold text-orange-600 mt-1">
                      {pendingTasks}
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center">
                    <Clock3 className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        )}

        {/* =================================================
            SEARCH / FILTER
        ================================================= */}

        <div className="px-4 md:px-6 mt-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3">
            <div className="flex flex-col md:flex-row gap-3">
              {/* SEARCH */}

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    handleSearch(e.target.value)
                  }
                  placeholder="Search name, phone, business, task ID..."
                  className="w-full h-10 pl-9 pr-9 border border-gray-300 rounded-lg bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#741C29]/20 focus:border-[#741C29]"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => handleSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* FILTER */}

              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {[
                  {
                    value: "all",
                    label: "All",
                  },
                  {
                    value: "pending",
                    label: "Pending",
                  },
                  {
                    value: "completed",
                    label: "Completed",
                  },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      handleFilter(item.value)
                    }
                    className={`px-3 py-2 rounded-md text-xs font-medium transition ${filter === item.value
                      ? "bg-white text-[#741C29] shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            EXCEL / SHEET TABLE
        ================================================= */}

        <div className="p-4 md:px-6">
          <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm bg-white">
            <table className="border-collapse min-w-[1050px] w-full bg-white text-xs md:text-sm">
              {/* =================================================
                  COLUMN LETTERS
              ================================================= */}

              <thead>
                <tr className="bg-gray-100 text-gray-600 font-semibold text-center divide-x divide-gray-300 border-b border-gray-300">
                  <th className="w-10 min-w-[40px] py-1"></th>

                  <th className="w-32 min-w-[130px] py-1">
                    A
                  </th>

                  <th className="w-36 min-w-[140px] py-1">
                    B
                  </th>

                  <th className="w-40 min-w-[160px] py-1">
                    C
                  </th>

                  <th className="w-72 min-w-[280px] py-1">
                    D
                  </th>

                  <th className="w-44 min-w-[180px] py-1">
                    E
                  </th>

                  <th className="w-52 min-w-[210px] py-1">
                    F
                  </th>

                  <th className="w-40 min-w-[160px] py-1">
                    G
                  </th>

                  <th className="w-32 min-w-[130px] py-1">
                    H
                  </th>
                </tr>

                {/* =================================================
                    MAIN HEADER
                ================================================= */}

                <tr className="bg-[#1b365d] text-white font-bold text-center divide-x divide-gray-400 border-b border-gray-400">
                  <td className="bg-gray-200 text-gray-600 font-normal border-r border-gray-300 text-center">
                    1
                  </td>

                  <td className="py-2">
                    Date
                  </td>

                  <td className="py-2">
                    Name
                  </td>

                  <td className="py-2">
                    Phone Number
                  </td>

                  <td className="py-2">
                    Business Name
                  </td>

                  <td className="py-2">
                    Status
                  </td>

                  <td className="py-2">
                    Comments
                  </td>

                  <td className="py-2">
                    Task ID
                  </td>

                  <td className="py-2">
                    Action
                  </td>
                </tr>
              </thead>

              {/* =================================================
                  BODY
              ================================================= */}

              {loading ? (
                renderTableSkeleton()
              ) : (
                <tbody>
                  {paginatedTasks.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="py-16 text-center"
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <Search className="w-5 h-5 text-gray-400" />
                          </div>

                          <p className="mt-3 font-medium text-gray-700">
                            No tasks found
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Try changing your search or filter.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedTasks.map((row, index) => {
                      const isCompleted =
                        row.is_completed;

                      const phone = cleanPhone(row.phone);

                      return (
                        <tr
                          key={row.assignment_id}
                          className={`divide-x divide-gray-300 border-b border-gray-300 text-center transition ${row.is_completed
                            ? "bg-gray-100 text-gray-400 opacity-60 pointer-events-none"
                              : "hover:bg-blue-50"
                            }`}
                        >

                          {/* ROW NUMBER */}

                          <td
                            className={`text-gray-600 text-center font-normal py-1 bg-gray-100 `}
                          >
                            {getRowNumber(index)}
                          </td>

                          {/* DATE */}

                          <td className="py-1 px-2 whitespace-nowrap">
                            {formatCaliforniaDate(
                              row.assignment_date
                            )}
                          </td>

                          {/* NAME */}

                          <td className="py-1 px-2 font-medium text-gray-800">
                            {row.name}
                          </td>

                          {/* PHONE */}

                          <td className="py-1 px-2">
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-mono text-gray-800">
                                {row.phone_number || "—"}
                              </span>
                            </div>
                          </td>

                          {/* BUSINESS */}

                          <td className="py-1 px-2 text-left text-gray-800">
                            <div
                              className="truncate max-w-[280px]"
                              title={row.business_name}
                            >
                              {row.business_name}
                            </div>
                          </td>

                          {/* STATUS */}
                          <td className="py-1 px-1">
                            <select
                              value={row.status || ""}
                              onChange={(e) =>
                                handleStatusChange(
                                  row.assignment_id,
                                  e.target.value
                                )
                              }
                              className={`w-full min-w-[155px] bg-white border border-gray-300 text-gray-800 rounded px-2 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#741C29]`}
                            >
                              <option value="">
                                Select Status
                              </option>

                              {status.map((statusOption) => (
                                <option
                                  key={statusOption.status_name}
                                  value={statusOption.status_name}
                                >
                                  {statusOption.status_name}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* NOTES */}
                          <td className="py-1 px-2 text-left text-gray-700">
                            <input
                              type="text"
                              value={row.comment || ""}
                              onChange={(e) => handleCommentChange(row.assignment_id, e.target.value)}
                              placeholder="Add comment..."
                              className="w-full max-w-[200px] border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              title={row.comment || ""}
                            />
                          </td>

                          {/* TASK ID */}

                          <td className="py-1 px-2 font-mono text-gray-500">
                            {row.assignment_id || "—"}
                          </td>

                          {/* ACTION */}

                          <td className="py-1 px-1">
                            <button
                              type="button"
                              onClick={() =>
                                handleCallClick(
                                  row.assignment_id,
                                  row.status,
                                  row.comment || ""
                                )
                              }
                              className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md bg-[#741C29] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#5f1722]"
                            >
                              Save
                            </button>
                          </td>



                        </tr>
                      );
                    })
                  )}
                </tbody>
              )}

            </table>
          </div>
        </div>

        {/* =================================================
            PAGINATION
        ================================================= */}

        <div className="px-4 md:px-6 pb-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-800">
                {filteredTasks.length === 0
                  ? 0
                  : (safePage - 1) * PAGE_SIZE + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-800">
                {Math.min(
                  safePage * PAGE_SIZE,
                  filteredTasks.length
                )}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-800">
                {filteredTasks.length}
              </span>{" "}
              tasks
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() =>
                  changePage(safePage - 1)
                }
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="px-3 py-2 rounded-lg bg-gray-100 text-xs font-semibold text-gray-700">
                {safePage} / {totalPages}
              </div>

              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() =>
                  changePage(safePage + 1)
                }
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            DEBUG / INFO
        ================================================= */}

        <div className="px-4 md:px-6 pb-6">
          <div className="text-[10px] text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
            <span>
              Timezone: {CALIFORNIA_TIMEZONE}
            </span>

            <span>
              Daily Limit: {DAILY_TASK_LIMIT}
            </span>

            <span>
              Loaded: {tasks.length}
            </span>

            <span>
              API Date: {apiDate || "—"}
            </span>

            <span>
              Auto Refresh: 15s
            </span>
          </div>
        </div>
      </main>

      {/* ===================================================
          LOGOUT
      =================================================== */}

      {showLogout && (
        <LogoutModal
          onCancel={() => setShowLogout(false)}
          onConfirm={handleLogout}
        />
      )}


      {isSubmitting && (
        <Loader />
      )}


    </div>
  );
}