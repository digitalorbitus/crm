




























// "use client";

// import {
//   Phone,
//   Menu,
//   X,
//   Clock,
//   PhoneIncoming,
//   PhoneOff,
//   TrendingUp,
//   TrendingDown,
// } from "lucide-react";

// import LogoutModal from "@/components/LogoutModal";
// import { useState, useCallback, useEffect, useMemo } from "react";
// import { useRouter } from "next/navigation";
// import Sidebar from "@/components/Sidebar";
// import CRMLoader from "@/components/CRMLoader";
// import DashboardTopBar from "@/components/DashboardTopBar";

// export default function DashboardPage() {
//   const router = useRouter();

//   // =========================================================
//   // STATES
//   // =========================================================

//   const [loading, setLoading] = useState(true);
//   const [errorMessage, setErrorMessage] = useState("");

//   const [staff, setStaff] = useState(null);
//   const [allStaff, setAllStaff] = useState([]);

//   const [rawApiResponse, setRawApiResponse] = useState(null);

//   const [numbers, setNumbers] = useState([]);
//   const [calls, setCalls] = useState([]);

//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [loggingOut, setLoggingOut] = useState(false);
//   const [showLogoutModal, setShowLogoutModal] = useState(false);

//   // =========================================================
//   // HELPERS
//   // =========================================================

//   const normalizeExtension = (value) => {
//     if (value === undefined || value === null) {
//       return null;
//     }

//     const cleaned = String(value)
//       .trim()
//       .replace(/^Ext\.?\s*/i, "");

//     return cleaned || null;
//   };

//   // =========================================================
//   // GET CALL LIST
//   // Handles multiple possible API response formats
//   // =========================================================

//   const getCallList = useCallback((data) => {
//     if (!data) return [];

//     // Direct array
//     if (Array.isArray(data)) {
//       return data;
//     }

//     const possibleKeys = [
//       "calls",
//       "call_history",
//       "callHistory",
//       "call_logs",
//       "callLogs",
//       "history",
//       "records",
//       "results",
//       "items",
//       "rows",
//       "logs",
//       "data",
//     ];

//     // Direct object keys
//     for (const key of possibleKeys) {
//       if (Array.isArray(data?.[key])) {
//         return data[key];
//       }
//     }

//     // Nested data object
//     if (data?.data && typeof data.data === "object") {
//       if (Array.isArray(data.data)) {
//         return data.data;
//       }

//       for (const key of possibleKeys) {
//         if (Array.isArray(data.data?.[key])) {
//           return data.data[key];
//         }
//       }
//     }

//     // Nested response object
//     if (data?.response && typeof data.response === "object") {
//       if (Array.isArray(data.response)) {
//         return data.response;
//       }

//       for (const key of possibleKeys) {
//         if (Array.isArray(data.response?.[key])) {
//           return data.response[key];
//         }
//       }
//     }

//     // Nested result object
//     if (data?.result && typeof data.result === "object") {
//       if (Array.isArray(data.result)) {
//         return data.result;
//       }

//       for (const key of possibleKeys) {
//         if (Array.isArray(data.result?.[key])) {
//           return data.result[key];
//         }
//       }
//     }

//     return [];
//   }, []);

//   // =========================================================
//   // GET CALL DATE
//   // =========================================================

//   const getCallDate = useCallback((call) => {
//     if (!call) return null;

//     const value =
//       call?.start_time ||
//       call?.startTime ||
//       call?.start_datetime ||
//       call?.startDateTime ||
//       call?.date_time ||
//       call?.datetime ||
//       call?.created_at ||
//       call?.createdAt ||
//       call?.timestamp ||
//       call?.time ||
//       call?.date;

//     if (!value) return null;

//     const date = new Date(value);

//     if (Number.isNaN(date.getTime())) {
//       return null;
//     }

//     return date;
//   }, []);

//   // =========================================================
//   // GET DURATION
//   // =========================================================

//   const getDurationSeconds = useCallback((call) => {
//     if (!call) return 0;

//     const value =
//       call?.duration_seconds ??
//       call?.durationSeconds ??
//       call?.duration ??
//       call?.talk_time ??
//       call?.talkTime ??
//       call?.seconds ??
//       call?.duration_sec ??
//       0;

//     if (typeof value === "number") {
//       return Number.isFinite(value) ? value : 0;
//     }

//     if (typeof value === "string") {
//       const trimmed = value.trim();

//       // HH:MM:SS
//       const timeMatch = trimmed.match(
//         /^(\d{1,2}):(\d{1,2}):(\d{1,2})$/
//       );

//       if (timeMatch) {
//         return (
//           Number(timeMatch[1]) * 3600 +
//           Number(timeMatch[2]) * 60 +
//           Number(timeMatch[3])
//         );
//       }

//       // MM:SS
//       const shortTimeMatch = trimmed.match(
//         /^(\d{1,3}):(\d{1,2})$/
//       );

//       if (shortTimeMatch) {
//         return (
//           Number(shortTimeMatch[1]) * 60 +
//           Number(shortTimeMatch[2])
//         );
//       }

//       // "1h 20m 10s"
//       const hMatch = trimmed.match(/(\d+)\s*h/i);
//       const mMatch = trimmed.match(/(\d+)\s*m/i);
//       const sMatch = trimmed.match(/(\d+)\s*s/i);

//       if (hMatch || mMatch || sMatch) {
//         return (
//           Number(hMatch?.[1] || 0) * 3600 +
//           Number(mMatch?.[1] || 0) * 60 +
//           Number(sMatch?.[1] || 0)
//         );
//       }

//       const numeric = Number(trimmed);

//       if (!Number.isNaN(numeric)) {
//         return numeric;
//       }
//     }

//     return 0;
//   }, []);

//   // =========================================================
//   // GET STATUS
//   // =========================================================

//   const getCallStatus = useCallback(
//     (call) => {
//       if (!call) return "missed";

//       const raw =
//         call?.status ??
//         call?.call_status ??
//         call?.callStatus ??
//         call?.result ??
//         call?.disposition ??
//         call?.connect_type ??
//         call?.connectType ??
//         "";

//       const status = String(raw).toLowerCase().trim();

//       // Missed / unanswered
//       if (
//         status.includes("miss") ||
//         status.includes("no answer") ||
//         status.includes("no_answer") ||
//         status.includes("unanswered") ||
//         status.includes("failed") ||
//         status.includes("cancel") ||
//         status.includes("busy") ||
//         status.includes("voicemail")
//       ) {
//         return "missed";
//       }

//       // Answered
//       if (
//         status.includes("answer") ||
//         status.includes("answered") ||
//         status.includes("completed") ||
//         status.includes("connected") ||
//         status.includes("success") ||
//         status.includes("connected")
//       ) {
//         return "answered";
//       }

//       // Duration is a strong fallback
//       if (getDurationSeconds(call) > 0) {
//         return "answered";
//       }

//       return "missed";
//     },
//     [getDurationSeconds]
//   );

//   // =========================================================
//   // GET STAFF NAME
//   // =========================================================

//   const getStaffName = useCallback((call) => {
//     if (!call) return "Unknown Staff";

//     const name =
//       call?.user_name ||
//       call?.userName ||
//       call?.agent_name ||
//       call?.agentName ||
//       call?.staff_name ||
//       call?.staffName ||
//       call?.owner_name ||
//       call?.ownerName ||
//       call?.extension_name ||
//       call?.extensionName ||
//       call?.caller_name ||
//       call?.callerName ||
//       call?.from_name ||
//       call?.fromName ||
//       call?.display_name ||
//       call?.displayName ||
//       call?.user?.name ||
//       call?.agent?.name ||
//       call?.staff?.name ||
//       call?.owner?.name ||
//       "";

//     return name ? String(name) : "Unknown Staff";
//   }, []);

//   // =========================================================
//   // GET DIRECTION
//   // =========================================================

//   const getCallDirection = useCallback((call) => {
//     const raw =
//       call?.direction ||
//       call?.call_direction ||
//       call?.callDirection ||
//       "";

//     const direction = String(raw).toLowerCase().trim();

//     if (
//       direction.includes("inbound") ||
//       direction === "in"
//     ) {
//       return "inbound";
//     }

//     if (
//       direction.includes("outbound") ||
//       direction === "out"
//     ) {
//       return "outbound";
//     }

//     return "";
//   }, []);

//   // =========================================================
//   // GET CALL OWNER EXTENSION
//   // =========================================================

//   const getCallOwnerExtension = useCallback(
//     (call) => {
//       if (!call) return null;

//       const direction = getCallDirection(call);

//       const callerExtension =
//         normalizeExtension(call?.caller_extension) ||
//         normalizeExtension(call?.caller_ext_number) ||
//         normalizeExtension(call?.callerExtension) ||
//         normalizeExtension(call?.extension) ||
//         normalizeExtension(call?.extension_number) ||
//         normalizeExtension(call?.owner_extension) ||
//         normalizeExtension(call?.user_extension) ||
//         normalizeExtension(call?.raw_zoom_data?.caller_ext_number) ||
//         normalizeExtension(call?.raw_zoom_data?.caller_ext_id);

//       const receiverExtension =
//         normalizeExtension(call?.receiver_extension) ||
//         normalizeExtension(call?.receiver_ext_number) ||
//         normalizeExtension(call?.receiverExtension) ||
//         normalizeExtension(call?.callee_extension) ||
//         normalizeExtension(call?.callee_ext_number) ||
//         normalizeExtension(call?.raw_zoom_data?.callee_ext_number) ||
//         normalizeExtension(call?.raw_zoom_data?.callee_ext_id);

//       // Inbound call belongs to receiver/staff
//       if (direction === "inbound") {
//         return receiverExtension || callerExtension || null;
//       }

//       // Outbound call belongs to caller/staff
//       if (direction === "outbound") {
//         return callerExtension || receiverExtension || null;
//       }

//       return callerExtension || receiverExtension || null;
//     },
//     [getCallDirection]
//   );

//   // =========================================================
//   // FIND STAFF BY EXTENSION
//   // =========================================================

//   const findStaffByExtension = useCallback(
//     (extension) => {
//       if (!extension) return null;

//       const normalized = normalizeExtension(extension);

//       if (!normalized) return null;

//       return (
//         allStaff.find((user) => {
//           const staffExtension = normalizeExtension(
//             user?.zoom_extension
//           );

//           return (
//             staffExtension &&
//             staffExtension === normalized
//           );
//         }) || null
//       );
//     },
//     [allStaff]
//   );

//   // =========================================================
//   // LOAD ALL DASHBOARD DATA
//   // =========================================================

//   const loadStaffData = useCallback(async () => {
//     try {
//       setLoading(true);
//       setErrorMessage("");

//       // =====================================================
//       // CURRENT USER
//       // =====================================================

//       const meRes = await fetch("/api/auth/me", {
//         cache: "no-store",
//       });

//       const meData = await meRes.json();

//       if (!meRes.ok) {
//         throw new Error(
//           meData?.message ||
//             meData?.error ||
//             "Unable to load current user."
//         );
//       }

//       const currentUser =
//         meData?.user ||
//         meData?.data ||
//         meData;

//       setStaff(currentUser);

//       // =====================================================
//       // STAFF LIST
//       // =====================================================

//       try {
//         const staffRes = await fetch("/api/staffes/list", {
//           cache: "no-store",
//         });

//         const staffData = await staffRes.json();

//         if (staffRes.ok) {
//           const staffList =
//             staffData?.staff ||
//             staffData?.users ||
//             staffData?.data ||
//             staffData?.results ||
//             [];

//           setAllStaff(
//             Array.isArray(staffList)
//               ? staffList
//               : []
//           );
//         }
//       } catch (staffError) {
//         console.error(
//           "STAFF LIST ERROR:",
//           staffError
//         );

//         setAllStaff([]);
//       }

//       // =====================================================
//       // DAILY DESK
//       // =====================================================

//       try {
//         const deskRes = await fetch(
//           "/api/staff/daily-desk",
//           {
//             cache: "no-store",
//           }
//         );

//         const deskData = await deskRes.json();

//         if (deskRes.ok) {
//           const deskNumbers =
//             deskData?.numbers ||
//             deskData?.data ||
//             deskData?.extensions ||
//             [];

//           setNumbers(
//             Array.isArray(deskNumbers)
//               ? deskNumbers
//               : []
//           );
//         }
//       } catch (deskError) {
//         console.error(
//           "DAILY DESK ERROR:",
//           deskError
//         );

//         setNumbers([]);
//       }

//       // =====================================================
//       // ZOOM CALL HISTORY
//       // =====================================================

//       const callRes = await fetch(
//         "/api/zoom/call-history",
//         {
//           method: "GET",
//           cache: "no-store",
//           headers: {
//             Accept: "application/json",
//           },
//         }
//       );

//       const callData = await callRes.json();

//       console.log(
//         "===================================="
//       );
//       console.log(
//         "ZOOM CALL HISTORY FULL RESPONSE:"
//       );
//       console.log(callData);
//       console.log(
//         "===================================="
//       );

//       setRawApiResponse(callData);

//       if (!callRes.ok) {
//         throw new Error(
//           callData?.message ||
//             callData?.error ||
//             "Failed to load Zoom call history."
//         );
//       }

//       const callList = getCallList(callData);

//       console.log(
//         "NORMALIZED CALL LIST:",
//         callList
//       );

//       console.log(
//         "CALL COUNT:",
//         callList.length
//       );

//       if (callList.length > 0) {
//         console.log(
//           "FIRST CALL OBJECT:",
//           callList[0]
//         );
//       }

//       setCalls(
//         Array.isArray(callList)
//           ? callList
//           : []
//       );
//     } catch (error) {
//       console.error(
//         "DASHBOARD LOAD ERROR:",
//         error
//       );

//       setErrorMessage(
//         error?.message ||
//           "Unable to load dashboard data."
//       );

//       setCalls([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [getCallList]);

//   // =========================================================
//   // INITIAL LOAD
//   // =========================================================

//   useEffect(() => {
//     loadStaffData();
//   }, [loadStaffData]);

//   // =========================================================
//   // LAST 7 DAYS
//   // =========================================================

//   const lastSevenDays = useMemo(() => {
//     const days = [];

//     const today = new Date();

//     today.setHours(
//       0,
//       0,
//       0,
//       0
//     );

//     for (let i = 6; i >= 0; i--) {
//       const date = new Date(today);

//       date.setDate(
//         today.getDate() - i
//       );

//       days.push(date);
//     }

//     return days;
//   }, []);

//   // =========================================================
//   // NORMALIZED CALLS
//   // =========================================================

//   const normalizedCalls = useMemo(() => {
//     if (!Array.isArray(calls)) {
//       return [];
//     }

//     return calls
//       .map((call) => {
//         const date = getCallDate(call);
//         const status = getCallStatus(call);
//         const staffName = getStaffName(call);
//         const duration =
//           getDurationSeconds(call);

//         const ownerExtension =
//           getCallOwnerExtension(call);

//         const staffFromExtension =
//           findStaffByExtension(
//             ownerExtension
//           );

//         const finalStaffName =
//           staffFromExtension?.name ||
//           staffFromExtension?.full_name ||
//           staffFromExtension?.display_name ||
//           staffName;

//         return {
//           original: call,
//           date,
//           status,
//           staffName:
//             finalStaffName ||
//             "Unknown Staff",
//           duration,
//           ownerExtension,
//           direction:
//             getCallDirection(call),
//         };
//       })
//       .filter((call) => call.date);
//   }, [
//     calls,
//     getCallDate,
//     getCallStatus,
//     getStaffName,
//     getDurationSeconds,
//     getCallOwnerExtension,
//     findStaffByExtension,
//     getCallDirection,
//   ]);

//   // =========================================================
//   // TOTAL CALLS
//   // =========================================================

//   const totalCalls = normalizedCalls.length;

//   // =========================================================
//   // ANSWERED CALLS
//   // =========================================================

//   const answeredCalls = useMemo(() => {
//     return normalizedCalls.filter(
//       (call) =>
//         call.status === "answered"
//     );
//   }, [normalizedCalls]);

//   // =========================================================
//   // MISSED CALLS
//   // =========================================================

//   const missedCalls = useMemo(() => {
//     return normalizedCalls.filter(
//       (call) =>
//         call.status === "missed"
//     );
//   }, [normalizedCalls]);

//   // =========================================================
//   // ANSWERED PERCENTAGE
//   // =========================================================

//   const answeredPercentage = useMemo(() => {
//     if (totalCalls === 0) return 0;

//     return Math.round(
//       (answeredCalls.length /
//         totalCalls) *
//         100
//     );
//   }, [
//     answeredCalls.length,
//     totalCalls,
//   ]);

//   // =========================================================
//   // MISSED PERCENTAGE
//   // =========================================================

//   const missedPercentage = useMemo(() => {
//     if (totalCalls === 0) return 0;

//     return Math.round(
//       (missedCalls.length /
//         totalCalls) *
//         100
//     );
//   }, [
//     missedCalls.length,
//     totalCalls,
//   ]);

//   // =========================================================
//   // TOTAL TALK TIME
//   // =========================================================

//   const totalTalkSeconds = useMemo(() => {
//     return answeredCalls.reduce(
//       (total, call) =>
//         total +
//         (Number(call.duration) || 0),
//       0
//     );
//   }, [answeredCalls]);

//   // =========================================================
//   // FORMAT DURATION
//   // =========================================================

//   const formatDuration = (seconds) => {
//     const value =
//       Number(seconds) || 0;

//     const hours = Math.floor(
//       value / 3600
//     );

//     const minutes = Math.floor(
//       (value % 3600) / 60
//     );

//     const secs = Math.floor(
//       value % 60
//     );

//     if (hours > 0) {
//       return `${hours}h ${minutes}m`;
//     }

//     if (minutes > 0) {
//       return `${minutes}m ${secs}s`;
//     }

//     return `${secs}s`;
//   };

//   // =========================================================
//   // TOP STAFF
//   // =========================================================

//   const topStaff = useMemo(() => {
//     if (!Array.isArray(allStaff)) {
//       return [];
//     }

//     return allStaff
//       .map((user) => {
//         const extension =
//           normalizeExtension(
//             user?.zoom_extension
//           );

//         const userCalls =
//           normalizedCalls.filter(
//             ({ ownerExtension }) => {
//               return (
//                 extension &&
//                 ownerExtension &&
//                 extension ===
//                   normalizeExtension(
//                     ownerExtension
//                   )
//               );
//             }
//           );

//         const answered =
//           userCalls.filter(
//             (call) =>
//               call.status === "answered"
//           ).length;

//         const missed =
//           userCalls.filter(
//             (call) =>
//               call.status === "missed"
//           ).length;

//         const talkTime =
//           userCalls.reduce(
//             (total, call) =>
//               total +
//               (Number(call.duration) ||
//                 0),
//             0
//           );

//         return {
//           ...user,
//           extension,
//           totalCalls:
//             userCalls.length,
//           answered,
//           missed,
//           talkTime,
//         };
//       })
//       .filter(
//         (user) =>
//           user.totalCalls > 0
//       )
//       .sort(
//         (a, b) =>
//           b.totalCalls -
//           a.totalCalls
//       )
//       .slice(0, 5);
//   }, [
//     allStaff,
//     normalizedCalls,
//   ]);

//   // =========================================================
//   // LAST 7 DAYS CHART
//   // =========================================================

//   const chartData = useMemo(() => {
//     return lastSevenDays.map(
//       (day) => {
//         const start = new Date(day);

//         start.setHours(
//           0,
//           0,
//           0,
//           0
//         );

//         const end = new Date(day);

//         end.setHours(
//           23,
//           59,
//           59,
//           999
//         );

//         const dayCalls =
//           normalizedCalls.filter(
//             ({ date }) =>
//               date >= start &&
//               date <= end
//           );

//         const answered =
//           dayCalls.filter(
//             (call) =>
//               call.status ===
//               "answered"
//           ).length;

//         const missed =
//           dayCalls.filter(
//             (call) =>
//               call.status ===
//               "missed"
//           ).length;

//         return {
//           date: day,
//           total: dayCalls.length,
//           answered,
//           missed,
//           label: day.toLocaleDateString(
//             "en-US",
//             {
//               weekday: "short",
//             }
//           ),
//         };
//       }
//     );
//   }, [
//     lastSevenDays,
//     normalizedCalls,
//   ]);

//   const chartMax = Math.max(
//     ...chartData.map(
//       (item) => item.total
//     ),
//     1
//   );

//   // =========================================================
//   // LIVE ACTIVITIES
//   // =========================================================

//   const liveActivities = useMemo(() => {
//     return [...normalizedCalls]
//       .sort(
//         (a, b) =>
//           b.date.getTime() -
//           a.date.getTime()
//       )
//       .slice(0, 8)
//       .map((call, index) => {
//         const original =
//           call.original;

//         const phone =
//           original?.caller_number ||
//           original?.callerNumber ||
//           original?.from_number ||
//           original?.fromNumber ||
//           original?.receiver_number ||
//           original?.receiverNumber ||
//           original?.to_number ||
//           original?.toNumber ||
//           "Unknown Number";

//         return {
//           id:
//             original?.id ||
//             original?.zoom_call_id ||
//             original?.call_history_uuid ||
//             index,
//           name:
//             call.staffName ||
//             "Unknown Staff",
//           extension:
//             call.ownerExtension ||
//             "-",
//           phone,
//           status:
//             call.status,
//           direction:
//             call.direction,
//           duration:
//             call.duration,
//           date:
//             call.date,
//         };
//       });
//   }, [normalizedCalls]);

//   // =========================================================
//   // HANDLE LOGOUT
//   // =========================================================

//   const handleLogout = async () => {
//     try {
//       setLoggingOut(true);

//       await fetch(
//         "/api/auth/logout",
//         {
//           method: "POST",
//           credentials: "include",
//         }
//       );

//       router.push("/login");
//       router.refresh();
//     } catch (error) {
//       console.error(
//         "LOGOUT ERROR:",
//         error
//       );

//       router.push("/login");
//     } finally {
//       setLoggingOut(false);
//       setShowLogoutModal(false);
//     }
//   };

//   // =========================================================
//   // LOADING
//   // =========================================================

//   if (loading) {
//     return <CRMLoader />;
//   }

//   // =========================================================
//   // DASHBOARD
//   // =========================================================

//   return (
//     <div className="min-h-screen bg-[#f7f8fa] text-[#171717]">
//       {/* =====================================================
//           MOBILE SIDEBAR OVERLAY
//       ====================================================== */}

//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 z-40 bg-black/40 lg:hidden"
//           onClick={() =>
//             setSidebarOpen(false)
//           }
//         />
//       )}

//       {/* =====================================================
//           SIDEBAR
//       ====================================================== */}

//       <div
//         className={`
//           fixed inset-y-0 left-0 z-50
//           w-[270px]
//           transform
//           bg-white
//           shadow-xl
//           transition-transform
//           duration-300
//           lg:translate-x-0
//           ${
//             sidebarOpen
//               ? "translate-x-0"
//               : "-translate-x-full"
//           }
//         `}
//       >
//         <Sidebar
//           staff={staff}
//           allStaff={allStaff}
//           numbers={numbers}
//           onLogout={() =>
//             setShowLogoutModal(true)
//           }
//         />
//       </div>

//       {/* =====================================================
//           MAIN
//       ====================================================== */}

//       <main className="min-h-screen lg:pl-[270px]">
//         {/* ===================================================
//             TOP BAR
//         ==================================================== */}

//         <div className="sticky top-0 z-30 bg-[#f7f8fa]/95 backdrop-blur">
//           <div className="flex items-center gap-3 px-4 py-3 lg:hidden">
//             <button
//               type="button"
//               onClick={() =>
//                 setSidebarOpen(
//                   !sidebarOpen
//                 )
//               }
//               className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm"
//             >
//               {sidebarOpen ? (
//                 <X size={20} />
//               ) : (
//                 <Menu size={20} />
//               )}
//             </button>
//           </div>

//           <DashboardTopBar
//             staff={staff}
//             onLogout={() =>
//               setShowLogoutModal(true)
//             }
//           />
//         </div>

//         {/* ===================================================
//             CONTENT
//         ==================================================== */}

//         <div className="px-4 pb-10 pt-4 sm:px-6 lg:px-8">
//           {/* =================================================
//               ERROR
//           ================================================== */}

//           {errorMessage && (
//             <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//               <div className="font-semibold">
//                 Dashboard data issue
//               </div>

//               <div className="mt-1">
//                 {errorMessage}
//               </div>
//             </div>
//           )}

//           {/* =================================================
//               HEADER
//           ================================================== */}

//           <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
//             <div>
//               <p className="text-sm font-medium text-[#790214]">
//                 Call Analytics
//               </p>

//               <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#191919] sm:text-3xl">
//                 Dashboard
//               </h1>

//               <p className="mt-1 text-sm text-gray-500">
//                 Monitor your team's Zoom
//                 call activity.
//               </p>
//             </div>

//             <div className="rounded-xl bg-white px-4 py-2 text-sm shadow-sm ring-1 ring-black/5">
//               <span className="text-gray-500">
//                 Total records:
//               </span>{" "}
//               <span className="font-semibold text-[#790214]">
//                 {totalCalls}
//               </span>
//             </div>
//           </div>

//           {/* =================================================
//               STATS
//           ================================================== */}

//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
//             {/* TOTAL CALLS */}

//             <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-500">
//                     Total Calls
//                   </p>

//                   <h2 className="mt-2 text-3xl font-bold">
//                     {totalCalls}
//                   </h2>
//                 </div>

//                 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#790214]/10 text-[#790214]">
//                   <Phone size={21} />
//                 </div>
//               </div>

//               <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
//                 <TrendingUp
//                   size={14}
//                 />

//                 <span>
//                   Live call history
//                 </span>
//               </div>
//             </div>

//             {/* ANSWERED */}

//             <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-500">
//                     Answered
//                   </p>

//                   <h2 className="mt-2 text-3xl font-bold text-green-600">
//                     {answeredCalls.length}
//                   </h2>
//                 </div>

//                 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
//                   <PhoneIncoming
//                     size={21}
//                   />
//                 </div>
//               </div>

//               <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
//                 <span>
//                   {answeredPercentage}% answer
//                   rate
//                 </span>
//               </div>
//             </div>

//             {/* MISSED */}

//             <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-500">
//                     Missed
//                   </p>

//                   <h2 className="mt-2 text-3xl font-bold text-red-600">
//                     {missedCalls.length}
//                   </h2>
//                 </div>

//                 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
//                   <PhoneOff size={21} />
//                 </div>
//               </div>

//               <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
//                 <TrendingDown
//                   size={14}
//                 />

//                 <span>
//                   {missedPercentage}% missed
//                   rate
//                 </span>
//               </div>
//             </div>

//             {/* TALK TIME */}

//             <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-500">
//                     Talk Time
//                   </p>

//                   <h2 className="mt-2 text-3xl font-bold">
//                     {formatDuration(
//                       totalTalkSeconds
//                     )}
//                   </h2>
//                 </div>

//                 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
//                   <Clock size={21} />
//                 </div>
//               </div>

//               <div className="mt-4 text-xs text-gray-500">
//                 Total answered-call duration
//               </div>
//             </div>
//           </div>

//           {/* =================================================
//               CHART + DONUT
//           ================================================== */}

//           <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
//             {/* CHART */}

//             <div className="xl:col-span-2 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
//               <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//                 <div>
//                   <h2 className="text-lg font-bold">
//                     Call Activity
//                   </h2>

//                   <p className="text-sm text-gray-500">
//                     Last 7 days
//                   </p>
//                 </div>

//                 <div className="text-sm text-gray-500">
//                   Peak:
//                   <span className="ml-1 font-semibold text-[#790214]">
//                     {chartMax}
//                   </span>
//                 </div>
//               </div>

//               <div className="mt-7">
//                 <div className="flex h-[180px] items-end gap-2 sm:gap-4">
//                   {chartData.map(
//                     (item, index) => {
//                       const height =
//                         Math.max(
//                           (item.total /
//                             chartMax) *
//                             100,
//                           item.total > 0
//                             ? 6
//                             : 0
//                         );

//                       return (
//                         <div
//                           key={index}
//                           className="flex h-full flex-1 flex-col justify-end"
//                         >
//                           <div className="flex h-full items-end justify-center">
//                             <div
//                               title={`${item.total} calls`}
//                               className="w-full max-w-[42px] rounded-t-xl bg-[#790214] transition-all duration-300 hover:opacity-80"
//                               style={{
//                                 height: `${height}%`,
//                               }}
//                             />
//                           </div>

//                           <div className="mt-3 text-center text-[11px] font-medium text-gray-500">
//                             {item.label}
//                           </div>

//                           <div className="mt-1 text-center text-xs font-bold text-gray-700">
//                             {item.total}
//                           </div>
//                         </div>
//                       );
//                     }
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* DONUT */}

//             <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
//               <h2 className="text-lg font-bold">
//                 Call Outcome
//               </h2>

//               <p className="text-sm text-gray-500">
//                 Answered vs missed
//               </p>

//               <div className="mt-7 flex items-center justify-center">
//                 <div className="relative h-48 w-48">
//                   <div
//                     className="absolute inset-0 rounded-full"
//                     style={{
//                       background: `conic-gradient(
//                         #16a34a 0% ${answeredPercentage}%,
//                         #dc2626 ${answeredPercentage}% 100%
//                       )`,
//                     }}
//                   />

//                   <div className="absolute inset-[22px] flex flex-col items-center justify-center rounded-full bg-white">
//                     <div className="text-3xl font-bold">
//                       {answeredPercentage}%
//                     </div>

//                     <div className="text-xs text-gray-500">
//                       Answered
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-7 grid grid-cols-2 gap-3">
//                 <div className="rounded-xl bg-green-50 p-3">
//                   <div className="text-xs text-green-700">
//                     Answered
//                   </div>

//                   <div className="mt-1 text-lg font-bold text-green-700">
//                     {answeredCalls.length}
//                   </div>
//                 </div>

//                 <div className="rounded-xl bg-red-50 p-3">
//                   <div className="text-xs text-red-700">
//                     Missed
//                   </div>

//                   <div className="mt-1 text-lg font-bold text-red-700">
//                     {missedCalls.length}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* =================================================
//               STAFF + LIVE ACTIVITY
//           ================================================== */}

//           <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
//             {/* TOP STAFF */}

//             <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h2 className="text-lg font-bold">
//                     Top Staff
//                   </h2>

//                   <p className="text-sm text-gray-500">
//                     Calls by extension
//                   </p>
//                 </div>

//                 <Phone
//                   size={20}
//                   className="text-[#790214]"
//                 />
//               </div>

//               <div className="mt-5 space-y-3">
//                 {topStaff.length === 0 ? (
//                   <div className="rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-500">
//                     No staff call data found.
//                   </div>
//                 ) : (
//                   topStaff.map(
//                     (user, index) => (
//                       <div
//                         key={
//                           user?.id ||
//                           user?.extension ||
//                           index
//                         }
//                         className="flex items-center justify-between rounded-xl border border-gray-100 p-3 transition hover:bg-gray-50"
//                       >
//                         <div className="flex min-w-0 items-center gap-3">
//                           <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#790214]/10 text-sm font-bold text-[#790214]">
//                             {String(
//                               user?.name ||
//                                 user?.full_name ||
//                                 "U"
//                             )
//                               .charAt(0)
//                               .toUpperCase()}
//                           </div>

//                           <div className="min-w-0">
//                             <div className="truncate text-sm font-semibold">
//                               {user?.name ||
//                                 user?.full_name ||
//                                 user?.display_name ||
//                                 "Unknown Staff"}
//                             </div>

//                             <div className="text-xs text-gray-500">
//                               Ext.{" "}
//                               {user.extension ||
//                                 "-"}
//                             </div>
//                           </div>
//                         </div>

//                         <div className="text-right">
//                           <div className="text-sm font-bold">
//                             {user.totalCalls}
//                           </div>

//                           <div className="text-[11px] text-gray-500">
//                             {user.answered} answered
//                           </div>
//                         </div>
//                       </div>
//                     )
//                   )
//                 )}
//               </div>
//             </div>

//             {/* LIVE ACTIVITY */}

//             <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h2 className="text-lg font-bold">
//                     Recent Calls
//                   </h2>

//                   <p className="text-sm text-gray-500">
//                     Latest Zoom call activity
//                   </p>
//                 </div>

//                 <div className="flex items-center gap-2 text-xs font-medium text-green-600">
//                   <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
//                   Live
//                 </div>
//               </div>

//               <div className="mt-5 space-y-2">
//                 {liveActivities.length === 0 ? (
//                   <div className="rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-500">
//                     No call activity found.
//                   </div>
//                 ) : (
//                   liveActivities.map(
//                     (activity) => (
//                       <div
//                         key={activity.id}
//                         className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3"
//                       >
//                         <div className="flex min-w-0 items-center gap-3">
//                           <div
//                             className={`
//                               flex h-9 w-9 shrink-0
//                               items-center justify-center
//                               rounded-full
//                               ${
//                                 activity.status ===
//                                 "answered"
//                                   ? "bg-green-50 text-green-600"
//                                   : "bg-red-50 text-red-600"
//                               }
//                             `}
//                           >
//                             {activity.status ===
//                             "answered" ? (
//                               <PhoneIncoming
//                                 size={16}
//                               />
//                             ) : (
//                               <PhoneOff
//                                 size={16}
//                               />
//                             )}
//                           </div>

//                           <div className="min-w-0">
//                             <div className="truncate text-sm font-semibold">
//                               {activity.name}
//                             </div>

//                             <div className="truncate text-xs text-gray-500">
//                               Ext.{" "}
//                               {activity.extension}
//                               {" • "}
//                               {activity.phone}
//                             </div>
//                           </div>
//                         </div>

//                         <div className="shrink-0 text-right">
//                           <div
//                             className={`
//                               text-xs font-semibold
//                               ${
//                                 activity.status ===
//                                 "answered"
//                                   ? "text-green-600"
//                                   : "text-red-600"
//                               }
//                             `}
//                           >
//                             {activity.status ===
//                             "answered"
//                               ? "Answered"
//                               : "Missed"}
//                           </div>

//                           <div className="mt-1 text-[11px] text-gray-500">
//                             {formatDuration(
//                               activity.duration
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     )
//                   )
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* =================================================
//               DEBUG INFORMATION
//               Remove after everything works
//           ================================================== */}

//           <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
//             <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//               <div>
//                 <p className="text-sm font-semibold text-gray-700">
//                   API Debug
//                 </p>

//                 <p className="text-xs text-gray-500">
//                   Calls detected:
//                   {" "}
//                   {calls.length}
//                 </p>
//               </div>

//               <div className="text-xs text-gray-500">
//                 Answered:{" "}
//                 {answeredCalls.length}
//                 {" • "}
//                 Missed:{" "}
//                 {missedCalls.length}
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* =====================================================
//           LOGOUT MODAL
//       ====================================================== */}

//       {showLogoutModal && (
//         <LogoutModal
//           open={showLogoutModal}
//           loading={loggingOut}
//           onCancel={() =>
//             setShowLogoutModal(false)
//           }
//           onConfirm={handleLogout}
//         />
//       )}
//     </div>
//   );
// }






















































































"use client";

import {
  Phone,
  Menu,
  X,
  Clock,
  PhoneIncoming,
  PhoneOff,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import LogoutModal from "../../components/LogoutModal";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import CRMLoader from "@/components/CRMLoader";

import DashboardTopBar from "@/components/DashboardTopBar";

export default function DashboardPage() {
  const router = useRouter();

  // =========================================================
  // STATES
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [staff, setStaff] = useState(null);
  const [allStaff, setAllStaff] = useState([]);

  const [rawApiResponse, setRawApiResponse] = useState(null);

  const [numbers, setNumbers] = useState([]);
  const [calls, setCalls] = useState([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // =========================================================
  // HELPERS
  // =========================================================

  const normalizeExtension = (value) => {
    if (value === undefined || value === null) {
      return null;
    }

    const cleaned = String(value)
      .trim()
      .replace(/^Ext\.?\s*/i, "");

    return cleaned || null;
  };

  // =========================================================
  // GET CALL LIST
  // Handles multiple possible API response formats
  // =========================================================

  const getCallList = useCallback((data) => {
    if (!data) return [];

    // Direct array
    if (Array.isArray(data)) {
      return data;
    }

    const possibleKeys = [
      "calls",
      "call_history",
      "callHistory",
      "call_logs",
      "callLogs",
      "history",
      "records",
      "results",
      "items",
      "rows",
      "logs",
      "data",
    ];

    // Direct object keys
    for (const key of possibleKeys) {
      if (Array.isArray(data?.[key])) {
        return data[key];
      }
    }

    // Nested data object
    if (data?.data && typeof data.data === "object") {
      if (Array.isArray(data.data)) {
        return data.data;
      }

      for (const key of possibleKeys) {
        if (Array.isArray(data.data?.[key])) {
          return data.data[key];
        }
      }
    }

    // Nested response object
    if (data?.response && typeof data.response === "object") {
      if (Array.isArray(data.response)) {
        return data.response;
      }

      for (const key of possibleKeys) {
        if (Array.isArray(data.response?.[key])) {
          return data.response[key];
        }
      }
    }

    // Nested result object
    if (data?.result && typeof data.result === "object") {
      if (Array.isArray(data.result)) {
        return data.result;
      }

      for (const key of possibleKeys) {
        if (Array.isArray(data.result?.[key])) {
          return data.result[key];
        }
      }
    }

    return [];
  }, []);

  // =========================================================
  // GET CALL DATE
  // =========================================================

  const getCallDate = useCallback((call) => {
    if (!call) return null;

    const value =
      call?.start_time ||
      call?.startTime ||
      call?.start_datetime ||
      call?.startDateTime ||
      call?.date_time ||
      call?.datetime ||
      call?.created_at ||
      call?.createdAt ||
      call?.timestamp ||
      call?.time ||
      call?.date;

    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  }, []);

  // =========================================================
  // GET DURATION
  // =========================================================

  const getDurationSeconds = useCallback((call) => {
    if (!call) return 0;

    const value =
      call?.duration_seconds ??
      call?.durationSeconds ??
      call?.duration ??
      call?.talk_time ??
      call?.talkTime ??
      call?.seconds ??
      call?.duration_sec ??
      0;

    if (typeof value === "number") {
      return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();

      // HH:MM:SS
      const timeMatch = trimmed.match(
        /^(\d{1,2}):(\d{1,2}):(\d{1,2})$/
      );

      if (timeMatch) {
        return (
          Number(timeMatch[1]) * 3600 +
          Number(timeMatch[2]) * 60 +
          Number(timeMatch[3])
        );
      }

      // MM:SS
      const shortTimeMatch = trimmed.match(
        /^(\d{1,3}):(\d{1,2})$/
      );

      if (shortTimeMatch) {
        return (
          Number(shortTimeMatch[1]) * 60 +
          Number(shortTimeMatch[2])
        );
      }

      // "1h 20m 10s"
      const hMatch = trimmed.match(/(\d+)\s*h/i);
      const mMatch = trimmed.match(/(\d+)\s*m/i);
      const sMatch = trimmed.match(/(\d+)\s*s/i);

      if (hMatch || mMatch || sMatch) {
        return (
          Number(hMatch?.[1] || 0) * 3600 +
          Number(mMatch?.[1] || 0) * 60 +
          Number(sMatch?.[1] || 0)
        );
      }

      const numeric = Number(trimmed);

      if (!Number.isNaN(numeric)) {
        return numeric;
      }
    }

    return 0;
  }, []);

  // =========================================================
  // GET STATUS
  // =========================================================

  const getCallStatus = useCallback(
    (call) => {
      if (!call) return "missed";

      const raw =
        call?.status ??
        call?.call_status ??
        call?.callStatus ??
        call?.result ??
        call?.disposition ??
        call?.connect_type ??
        call?.connectType ??
        "";

      const status = String(raw).toLowerCase().trim();

      // Missed / unanswered
      if (
        status.includes("miss") ||
        status.includes("no answer") ||
        status.includes("no_answer") ||
        status.includes("unanswered") ||
        status.includes("failed") ||
        status.includes("cancel") ||
        status.includes("busy") ||
        status.includes("voicemail")
      ) {
        return "missed";
      }

      // Answered
      if (
        status.includes("answer") ||
        status.includes("answered") ||
        status.includes("completed") ||
        status.includes("connected") ||
        status.includes("success") ||
        status.includes("connected")
      ) {
        return "answered";
      }

      // Duration is a strong fallback
      if (getDurationSeconds(call) > 0) {
        return "answered";
      }

      return "missed";
    },
    [getDurationSeconds]
  );

  // =========================================================
  // GET STAFF NAME
  // =========================================================

  const getStaffName = useCallback((call) => {
    if (!call) return "Unknown Staff";

    const name =
      call?.user_name ||
      call?.userName ||
      call?.agent_name ||
      call?.agentName ||
      call?.staff_name ||
      call?.staffName ||
      call?.owner_name ||
      call?.ownerName ||
      call?.extension_name ||
      call?.extensionName ||
      call?.caller_name ||
      call?.callerName ||
      call?.from_name ||
      call?.fromName ||
      call?.display_name ||
      call?.displayName ||
      call?.user?.name ||
      call?.agent?.name ||
      call?.staff?.name ||
      call?.owner?.name ||
      "";

    return name ? String(name) : "Unknown Staff";
  }, []);

  // =========================================================
  // GET DIRECTION
  // =========================================================

  const getCallDirection = useCallback((call) => {
    const raw =
      call?.direction ||
      call?.call_direction ||
      call?.callDirection ||
      "";

    const direction = String(raw).toLowerCase().trim();

    if (
      direction.includes("inbound") ||
      direction === "in"
    ) {
      return "inbound";
    }

    if (
      direction.includes("outbound") ||
      direction === "out"
    ) {
      return "outbound";
    }

    return "";
  }, []);

  // =========================================================
  // GET CALL OWNER EXTENSION
  // =========================================================

  const getCallOwnerExtension = useCallback(
    (call) => {
      if (!call) return null;

      const direction = getCallDirection(call);

      const callerExtension =
        normalizeExtension(call?.caller_extension) ||
        normalizeExtension(call?.caller_ext_number) ||
        normalizeExtension(call?.callerExtension) ||
        normalizeExtension(call?.extension) ||
        normalizeExtension(call?.extension_number) ||
        normalizeExtension(call?.owner_extension) ||
        normalizeExtension(call?.user_extension) ||
        normalizeExtension(call?.raw_zoom_data?.caller_ext_number) ||
        normalizeExtension(call?.raw_zoom_data?.caller_ext_id);

      const receiverExtension =
        normalizeExtension(call?.receiver_extension) ||
        normalizeExtension(call?.receiver_ext_number) ||
        normalizeExtension(call?.receiverExtension) ||
        normalizeExtension(call?.callee_extension) ||
        normalizeExtension(call?.callee_ext_number) ||
        normalizeExtension(call?.raw_zoom_data?.callee_ext_number) ||
        normalizeExtension(call?.raw_zoom_data?.callee_ext_id);

      // Inbound call belongs to receiver/staff
      if (direction === "inbound") {
        return receiverExtension || callerExtension || null;
      }

      // Outbound call belongs to caller/staff
      if (direction === "outbound") {
        return callerExtension || receiverExtension || null;
      }

      return callerExtension || receiverExtension || null;
    },
    [getCallDirection]
  );

  // =========================================================
  // FIND STAFF BY EXTENSION
  // =========================================================

  const findStaffByExtension = useCallback(
    (extension) => {
      if (!extension) return null;

      const normalized = normalizeExtension(extension);

      if (!normalized) return null;

      return (
        allStaff.find((user) => {
          const staffExtension = normalizeExtension(
            user?.zoom_extension
          );

          return (
            staffExtension &&
            staffExtension === normalized
          );
        }) || null
      );
    },
    [allStaff]
  );

  // =========================================================
  // LOAD ALL DASHBOARD DATA
  // =========================================================

  const loadStaffData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      // =====================================================
      // CURRENT USER
      // =====================================================

      const meRes = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      const meData = await meRes.json();

      if (!meRes.ok) {
        throw new Error(
          meData?.message ||
            meData?.error ||
            "Unable to load current user."
        );
      }

      const currentUser =
        meData?.user ||
        meData?.data ||
        meData;

      setStaff(currentUser);

      // =====================================================
      // STAFF LIST
      // =====================================================

      try {
        const staffRes = await fetch("/api/staffes/list", {
          cache: "no-store",
        });

        const staffData = await staffRes.json();

        if (staffRes.ok) {
          const staffList =
            staffData?.staff ||
            staffData?.users ||
            staffData?.data ||
            staffData?.results ||
            [];

          setAllStaff(
            Array.isArray(staffList)
              ? staffList
              : []
          );
        }
      } catch (staffError) {
        console.error(
          "STAFF LIST ERROR:",
          staffError
        );

        setAllStaff([]);
      }

      // =====================================================
      // DAILY DESK
      // =====================================================

      try {
        const deskRes = await fetch(
          "/api/staff/daily-desk",
          {
            cache: "no-store",
          }
        );

        const deskData = await deskRes.json();

        if (deskRes.ok) {
          const deskNumbers =
            deskData?.numbers ||
            deskData?.data ||
            deskData?.extensions ||
            [];

          setNumbers(
            Array.isArray(deskNumbers)
              ? deskNumbers
              : []
          );
        }
      } catch (deskError) {
        console.error(
          "DAILY DESK ERROR:",
          deskError
        );

        setNumbers([]);
      }

      // =====================================================
      // ZOOM CALL HISTORY
      // =====================================================

      const callRes = await fetch(
        "/api/zoom/call-history",
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const callData = await callRes.json();

      console.log(
        "===================================="
      );
      console.log(
        "ZOOM CALL HISTORY FULL RESPONSE:"
      );
      console.log(callData);
      console.log(
        "===================================="
      );

      setRawApiResponse(callData);

      if (!callRes.ok) {
        throw new Error(
          callData?.message ||
            callData?.error ||
            "Failed to load Zoom call history."
        );
      }

      const callList = getCallList(callData);

      console.log(
        "NORMALIZED CALL LIST:",
        callList
      );

      console.log(
        "CALL COUNT:",
        callList.length
      );

      if (callList.length > 0) {
        console.log(
          "FIRST CALL OBJECT:",
          callList[0]
        );
      }

      setCalls(
        Array.isArray(callList)
          ? callList
          : []
      );
    } catch (error) {
      console.error(
        "DASHBOARD LOAD ERROR:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to load dashboard data."
      );

      setCalls([]);
    } finally {
      setLoading(false);
    }
  }, [getCallList]);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadStaffData();
  }, [loadStaffData]);

  // =========================================================
  // LAST 7 DAYS
  // =========================================================

  const lastSevenDays = useMemo(() => {
    const days = [];

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);

      date.setDate(
        today.getDate() - i
      );

      days.push(date);
    }

    return days;
  }, []);

  // =========================================================
  // NORMALIZED CALLS
  // =========================================================

  const normalizedCalls = useMemo(() => {
    if (!Array.isArray(calls)) {
      return [];
    }

    return calls
      .map((call) => {
        const date = getCallDate(call);
        const status = getCallStatus(call);
        const staffName = getStaffName(call);
        const duration =
          getDurationSeconds(call);

        const ownerExtension =
          getCallOwnerExtension(call);

        const staffFromExtension =
          findStaffByExtension(
            ownerExtension
          );

        const finalStaffName =
          staffFromExtension?.name ||
          staffFromExtension?.full_name ||
          staffFromExtension?.display_name ||
          staffName;

        return {
          original: call,
          date,
          status,
          staffName:
            finalStaffName ||
            "Unknown Staff",
          duration,
          ownerExtension,
          direction:
            getCallDirection(call),
        };
      })
      .filter((call) => call.date);
  }, [
    calls,
    getCallDate,
    getCallStatus,
    getStaffName,
    getDurationSeconds,
    getCallOwnerExtension,
    findStaffByExtension,
    getCallDirection,
  ]);

  // =========================================================
  // TOTAL CALLS
  // =========================================================

  // const totalCalls = normalizedCalls.length;

  const todayCalls = useMemo(() => {
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  return normalizedCalls.filter(({ date }) => {
    if (!date) return false;

    return date >= startOfToday && date <= endOfToday;
  });
}, [normalizedCalls]);

const totalCalls = todayCalls.length;

  // =========================================================
  // ANSWERED CALLS
  // =========================================================

  // const answeredCalls = useMemo(() => {
  //   return normalizedCalls.filter(
  //     (call) =>
  //       call.status === "answered"
  //   );
  // }, [normalizedCalls]);
  const answeredCalls = useMemo(() => {
  return todayCalls.filter(
    (call) => call.status === "answered"
  );
}, [todayCalls]);

  // =========================================================
  // MISSED CALLS
  // =========================================================

  // const missedCalls = useMemo(() => {
  //   return normalizedCalls.filter(
  //     (call) =>
  //       call.status === "missed"
  //   );
  // }, [normalizedCalls]);

  const missedCalls = useMemo(() => {
  return todayCalls.filter(
    (call) => call.status === "missed"
  );
}, [todayCalls]);
  // =========================================================
  // ANSWERED PERCENTAGE
  // =========================================================

  // const answeredPercentage = useMemo(() => {
  //   if (totalCalls === 0) return 0;

  //   return Math.round(
  //     (answeredCalls.length /
  //       totalCalls) *
  //       100
  //   );
  // }, [
  //   answeredCalls.length,
  //   totalCalls,
  // ]);


  const answeredPercentage = useMemo(() => {
  if (totalCalls === 0) return 0;

  return Math.round(
    (answeredCalls.length / totalCalls) * 100
  );
}, [answeredCalls.length, totalCalls]);

const missedPercentage = useMemo(() => {
  if (totalCalls === 0) return 0;

  return Math.round(
    (missedCalls.length / totalCalls) * 100
  );
}, [missedCalls.length, totalCalls]);
  // =========================================================
  // MISSED PERCENTAGE
  // =========================================================

  // const missedPercentage = useMemo(() => {
  //   if (totalCalls === 0) return 0;

  //   return Math.round(
  //     (missedCalls.length /
  //       totalCalls) *
  //       100
  //   );
  // }, [
  //   missedCalls.length,
  //   totalCalls,
  // ]);

  // =========================================================
  // TOTAL TALK TIME
  // =========================================================

  const totalTalkSeconds = useMemo(() => {
    return answeredCalls.reduce(
      (total, call) =>
        total +
        (Number(call.duration) || 0),
      0
    );
  }, [answeredCalls]);

  // =========================================================
  // FORMAT DURATION
  // =========================================================

  const formatDuration = (seconds) => {
    const value =
      Number(seconds) || 0;

    const hours = Math.floor(
      value / 3600
    );

    const minutes = Math.floor(
      (value % 3600) / 60
    );

    const secs = Math.floor(
      value % 60
    );

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }

    return `${secs}s`;
  };

  // =========================================================
  // TOP STAFF
  // =========================================================

  const topStaff = useMemo(() => {
    if (!Array.isArray(allStaff)) {
      return [];
    }

    return allStaff
      .map((user) => {
        const extension =
          normalizeExtension(
            user?.zoom_extension
          );

        const userCalls =
          normalizedCalls.filter(
            ({ ownerExtension }) => {
              return (
                extension &&
                ownerExtension &&
                extension ===
                  normalizeExtension(
                    ownerExtension
                  )
              );
            }
          );

        const answered =
          userCalls.filter(
            (call) =>
              call.status === "answered"
          ).length;

        const missed =
          userCalls.filter(
            (call) =>
              call.status === "missed"
          ).length;

        const talkTime =
          userCalls.reduce(
            (total, call) =>
              total +
              (Number(call.duration) ||
                0),
            0
          );

        return {
          ...user,
          extension,
          totalCalls:
            userCalls.length,
          answered,
          missed,
          talkTime,
        };
      })
      .filter(
        (user) =>
          user.totalCalls > 0
      )
      .sort(
        (a, b) =>
          b.totalCalls -
          a.totalCalls
      )
      .slice(0, 5);
  }, [
    allStaff,
    normalizedCalls,
  ]);

  // =========================================================
  // LAST 7 DAYS CHART
  // =========================================================

  const chartData = useMemo(() => {
    return lastSevenDays.map(
      (day) => {
        const start = new Date(day);

        start.setHours(
          0,
          0,
          0,
          0
        );

        const end = new Date(day);

        end.setHours(
          23,
          59,
          59,
          999
        );

        const dayCalls =
          normalizedCalls.filter(
            ({ date }) =>
              date >= start &&
              date <= end
          );

        const answered =
          dayCalls.filter(
            (call) =>
              call.status ===
              "answered"
          ).length;

        const missed =
          dayCalls.filter(
            (call) =>
              call.status ===
              "missed"
          ).length;

        return {
          date: day,
          total: dayCalls.length,
          answered,
          missed,
          label: day.toLocaleDateString(
            "en-US",
            {
              weekday: "short",
            }
          ),
        };
      }
    );
  }, [
    lastSevenDays,
    normalizedCalls,
  ]);

  const chartMax = Math.max(
    ...chartData.map(
      (item) => item.total
    ),
    1
  );

  // =========================================================
  // LIVE ACTIVITIES
  // =========================================================

  const liveActivities = useMemo(() => {
    return [...normalizedCalls]
      .sort(
        (a, b) =>
          b.date.getTime() -
          a.date.getTime()
      )
      .slice(0, 8)
      .map((call, index) => {
        const original =
          call.original;

        const phone =
          original?.caller_number ||
          original?.callerNumber ||
          original?.from_number ||
          original?.fromNumber ||
          original?.receiver_number ||
          original?.receiverNumber ||
          original?.to_number ||
          original?.toNumber ||
          "Unknown Number";

        return {
          id:
            original?.id ||
            original?.zoom_call_id ||
            original?.call_history_uuid ||
            index,
          name:
            call.staffName ||
            "Unknown Staff",
          extension:
            call.ownerExtension ||
            "-",
          phone,
          status:
            call.status,
          direction:
            call.direction,
          duration:
            call.duration,
          date:
            call.date,
        };
      });
  }, [normalizedCalls]);

  // =========================================================
  // HANDLE LOGOUT
  // =========================================================

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error(
        "LOGOUT ERROR:",
        error
      );

      router.push("/login");
    } finally {
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return <CRMLoader />;
  }

  // =========================================================
  // DASHBOARD
  // =========================================================

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#171717]">
      {/* =====================================================
          MOBILE SIDEBAR OVERLAY
      ====================================================== */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <div
        className={`
          fixed inset-y-0 left-0 z-50
          w-[270px]
          transform
          bg-white
          shadow-xl
          transition-transform
          duration-300
          lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <Sidebar
          staff={staff}
          allStaff={allStaff}
          numbers={numbers}
          onLogout={() =>
            setShowLogoutModal(true)
          }
        />
      </div>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="min-h-screen lg:pl-[270px]">
        {/* ===================================================
            TOP BAR
        ==================================================== */}

        <div className="sticky top-0 z-30 bg-[#f7f8fa]/95 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 lg:hidden">
            <button
              type="button"
              onClick={() =>
                setSidebarOpen(
                  !sidebarOpen
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm"
            >
              {sidebarOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>
          </div>

          <DashboardTopBar
            staff={staff}
            onLogout={() =>
              setShowLogoutModal(true)
            }
          />
        </div>

        {/* ===================================================
            CONTENT
        ==================================================== */}

        <div className="px-4 pb-10 pt-4 sm:px-6 lg:px-8">
          {/* =================================================
              ERROR
          ================================================== */}

          {errorMessage && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <div className="font-semibold">
                Dashboard data issue
              </div>

              <div className="mt-1">
                {errorMessage}
              </div>
            </div>
          )}

          {/* =================================================
              HEADER
          ================================================== */}

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#790214]">
                Call Analytics
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#191919] sm:text-3xl">
                Dashboard
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Monitor your team's Zoom
                call activity.
              </p>
            </div>

            <div className="rounded-xl bg-white px-4 py-2 text-sm shadow-sm ring-1 ring-black/5">
              <span className="text-gray-500">
                Total records:
              </span>{" "}
              <span className="font-semibold text-[#790214]">
                {totalCalls}
              </span>
            </div>
          </div>

          {/* =================================================
              STATS
          ================================================== */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* TOTAL CALLS */}

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Calls
                  </p>

                  <h2 className="mt-2 text-3xl font-bold">
                    {totalCalls}
                  </h2>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#790214]/10 text-[#790214]">
                  <Phone size={21} />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <TrendingUp
                  size={14}
                />

                <span>
                  Live call history
                </span>
              </div>
            </div>

            {/* ANSWERED */}

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Answered
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-green-600">
                    {answeredCalls.length}
                  </h2>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <PhoneIncoming
                    size={21}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <span>
                  {answeredPercentage}% answer
                  rate
                </span>
              </div>
            </div>

            {/* MISSED */}

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Missed
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-red-600">
                    {missedCalls.length}
                  </h2>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <PhoneOff size={21} />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <TrendingDown
                  size={14}
                />

                <span>
                  {missedPercentage}% missed
                  rate
                </span>
              </div>
            </div>

            {/* TALK TIME */}

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Talk Time
                  </p>

                  <h2 className="mt-2 text-3xl font-bold">
                    {formatDuration(
                      totalTalkSeconds
                    )}
                  </h2>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Clock size={21} />
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Total answered-call duration
              </div>
            </div>
          </div>

          {/* =================================================
              CHART + DONUT
          ================================================== */}

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* CHART */}

            <div className="xl:col-span-2 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold">
                    Call Activity
                  </h2>

                  <p className="text-sm text-gray-500">
                    Last 7 days
                  </p>
                </div>

                <div className="text-sm text-gray-500">
                  Peak:
                  <span className="ml-1 font-semibold text-[#790214]">
                    {chartMax}
                  </span>
                </div>
              </div>

              <div className="mt-7">
                <div className="flex h-[180px] items-end gap-2 sm:gap-4">
                  {chartData.map(
                    (item, index) => {
                      const height =
                        Math.max(
                          (item.total /
                            chartMax) *
                            100,
                          item.total > 0
                            ? 6
                            : 0
                        );

                      return (
                        <div
                          key={index}
                          className="flex h-full flex-1 flex-col justify-end"
                        >
                          <div className="flex h-full items-end justify-center">
                            <div
                              title={`${item.total} calls`}
                              className="w-full max-w-[42px] rounded-t-xl bg-[#790214] transition-all duration-300 hover:opacity-80"
                              style={{
                                height: `${height}%`,
                              }}
                            />
                          </div>

                          <div className="mt-3 text-center text-[11px] font-medium text-gray-500">
                            {item.label}
                          </div>

                          <div className="mt-1 text-center text-xs font-bold text-gray-700">
                            {item.total}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            {/* DONUT */}

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
              <h2 className="text-lg font-bold">
                Call Outcome
              </h2>

              <p className="text-sm text-gray-500">
                Answered vs missed
              </p>

              <div className="mt-7 flex items-center justify-center">
                <div className="relative h-48 w-48">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(
                        #16a34a 0% ${answeredPercentage}%,
                        #dc2626 ${answeredPercentage}% 100%
                      )`,
                    }}
                  />

                  <div className="absolute inset-[22px] flex flex-col items-center justify-center rounded-full bg-white">
                    <div className="text-3xl font-bold">
                      {answeredPercentage}%
                    </div>

                    <div className="text-xs text-gray-500">
                      Answered
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-green-50 p-3">
                  <div className="text-xs text-green-700">
                    Answered
                  </div>

                  <div className="mt-1 text-lg font-bold text-green-700">
                    {answeredCalls.length}
                  </div>
                </div>

                <div className="rounded-xl bg-red-50 p-3">
                  <div className="text-xs text-red-700">
                    Missed
                  </div>

                  <div className="mt-1 text-lg font-bold text-red-700">
                    {missedCalls.length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              STAFF + LIVE ACTIVITY
          ================================================== */}

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* TOP STAFF */}

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">
                    Top Staff
                  </h2>

                  <p className="text-sm text-gray-500">
                    Calls by extension
                  </p>
                </div>

                <Phone
                  size={20}
                  className="text-[#790214]"
                />
              </div>

              <div className="mt-5 space-y-3">
                {topStaff.length === 0 ? (
                  <div className="rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-500">
                    No staff call data found.
                  </div>
                ) : (
                  topStaff.map(
                    (user, index) => (
                      <div
                        key={
                          user?.id ||
                          user?.extension ||
                          index
                        }
                        className="flex items-center justify-between rounded-xl border border-gray-100 p-3 transition hover:bg-gray-50"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#790214]/10 text-sm font-bold text-[#790214]">
                            {String(
                              user?.name ||
                                user?.full_name ||
                                "U"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold">
                              {user?.name ||
                                user?.full_name ||
                                user?.display_name ||
                                "Unknown Staff"}
                            </div>

                            <div className="text-xs text-gray-500">
                              Ext.{" "}
                              {user.extension ||
                                "-"}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-bold">
                            {user.totalCalls}
                          </div>

                          <div className="text-[11px] text-gray-500">
                            {user.answered} answered
                          </div>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>

            {/* LIVE ACTIVITY */}

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">
                    Recent Calls
                  </h2>

                  <p className="text-sm text-gray-500">
                    Latest Zoom call activity
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-green-600">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  Live
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {liveActivities.length === 0 ? (
                  <div className="rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-500">
                    No call activity found.
                  </div>
                ) : (
                  liveActivities.map(
                    (activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`
                              flex h-9 w-9 shrink-0
                              items-center justify-center
                              rounded-full
                              ${
                                activity.status ===
                                "answered"
                                  ? "bg-green-50 text-green-600"
                                  : "bg-red-50 text-red-600"
                              }
                            `}
                          >
                            {activity.status ===
                            "answered" ? (
                              <PhoneIncoming
                                size={16}
                              />
                            ) : (
                              <PhoneOff
                                size={16}
                              />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold">
                              {activity.name}
                            </div>

                            <div className="truncate text-xs text-gray-500">
                              Ext.{" "}
                              {activity.extension}
                              {" • "}
                              {activity.phone}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <div
                            className={`
                              text-xs font-semibold
                              ${
                                activity.status ===
                                "answered"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            `}
                          >
                            {activity.status ===
                            "answered"
                              ? "Answered"
                              : "Missed"}
                          </div>

                          <div className="mt-1 text-[11px] text-gray-500">
                            {formatDuration(
                              activity.duration
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              DEBUG INFORMATION
              Remove after everything works
          ================================================== */}

          <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  API Debug
                </p>

                <p className="text-xs text-gray-500">
                  Calls detected:
                  {" "}
                  {calls.length}
                </p>
              </div>

              <div className="text-xs text-gray-500">
                Answered:{" "}
                {answeredCalls.length}
                {" • "}
                Missed:{" "}
                {missedCalls.length}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* =====================================================
          LOGOUT MODAL
      ====================================================== */}

      {showLogoutModal && (
        <LogoutModal
          open={showLogoutModal}
          loading={loggingOut}
          onCancel={() =>
            setShowLogoutModal(false)
          }
          onConfirm={handleLogout}
        />
      )}
    </div>
  );
}









