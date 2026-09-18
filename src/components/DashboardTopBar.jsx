




















// "use client";

// import { useState, useEffect, useRef } from "react";
// import { createPortal } from "react-dom";

// import {
//   Calendar,
//   ChevronDown,
//   User,
//   Check,
//   Circle,
//   Phone,
//   Moon,
//   Utensils,
//   CircleOff,
//   Bath,
//   MoreHorizontal,
//   Clock3,
// } from "lucide-react";

// export default function DashboardTopBar() {
//   // ============================================================
//   // CURRENT USER
//   // ============================================================

//   const [currentUser, setCurrentUser] = useState({
//     id: null,
//     name: "",
//     email: "",
//     role: "",
//     avatar: null,
//   });

//   const [loading, setLoading] = useState(true);
//   const [imageError, setImageError] = useState(false);

//   // ============================================================
//   // USER STATUS
//   // ============================================================

//   const [userStatus, setUserStatus] = useState("Active");
//   const [statusOpen, setStatusOpen] = useState(false);
//   const [statusUpdating, setStatusUpdating] = useState(false);

//   const statusRef = useRef(null);

//   // ============================================================
//   // TIMER MODAL
//   // ============================================================

//   const [timerOpen, setTimerOpen] = useState(false);
//   const [timerStatus, setTimerStatus] = useState(null);
//   const [timerSeconds, setTimerSeconds] = useState(0);

//   // ============================================================
//   // DATABASE STATUS START TIME
//   // ============================================================

//   const [statusStartedAt, setStatusStartedAt] = useState(null);

//   // ============================================================
//   // LOGIN DETAILS
//   // ============================================================

//   // const [loginDetails] = useState(() => {
//   //   const now = new Date();

//   //   return {
//   //     day: now.toLocaleDateString("en-US", {
//   //       weekday: "long",
//   //     }),

//   //     date: now.toLocaleDateString("en-US", {
//   //       month: "short",
//   //       day: "numeric",
//   //       year: "numeric",
//   //     }),

//   //     time: now.toLocaleTimeString("en-US", {
//   //       hour: "2-digit",
//   //       minute: "2-digit",
//   //       hour12: true,
//   //     }),
//   //   };
//   // });
//   // ============================================================
// // LOGIN DETAILS — CALIFORNIA TIME
// // ============================================================

// const [loginDetails] = useState(() => {
//   const now = new Date();

//   const timeZone = "America/Los_Angeles";

//   return {
//     day: now.toLocaleDateString("en-US", {
//       weekday: "long",
//       timeZone,
//     }),

//     date: now.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//       timeZone,
//     }),

//     time: now.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//       hour12: true,
//       timeZone,
//     }),
//   };
// });

//   // ============================================================
//   // STATUS OPTIONS
//   // ============================================================

//   // const statusOptions = [
//   //   {
//   //     value: "Active",
//   //     label: "Active",
//   //     icon: Circle,
//   //     color: "text-emerald-600",
//   //     dot: "bg-emerald-500",
//   //     bg: "bg-emerald-50",
//   //   },

//   //   {
//   //     value: "Namaz Break",
//   //     label: "Namaz Break",
//   //     icon: Moon,
//   //     color: "text-indigo-600",
//   //     dot: "bg-indigo-500",
//   //     bg: "bg-indigo-50",
//   //   },

//   //   {
//   //     value: "Lunch Break",
//   //     label: "Lunch Break",
//   //     icon: Utensils,
//   //     color: "text-orange-600",
//   //     dot: "bg-orange-500",
//   //     bg: "bg-orange-50",
//   //   },

//   //   // ==========================================================
//   //   // SHORT BREAK
//   //   // ==========================================================

//   //   {
//   //     value: "Short Break",
//   //     label: "Short Break",
//   //     icon: Clock3,
//   //     color: "text-teal-600",
//   //     dot: "bg-teal-500",
//   //     bg: "bg-teal-50",
//   //   },

//   //   {
//   //     value: "Inactive",
//   //     label: "Inactive",
//   //     icon: CircleOff,
//   //     color: "text-slate-500",
//   //     dot: "bg-slate-400",
//   //     bg: "bg-slate-100",
//   //   },

//   //   {
//   //     value: "On Call",
//   //     label: "On Call",
//   //     icon: Phone,
//   //     color: "text-blue-600",
//   //     dot: "bg-blue-500",
//   //     bg: "bg-blue-50",
//   //   },

//   //   {
//   //     value: "Meeting",
//   //     label: "Meeting",
//   //     icon: Bath,
//   //     color: "text-cyan-600",
//   //     dot: "bg-cyan-500",
//   //     bg: "bg-cyan-50",
//   //   },

//   //   {
//   //     value: "Other",
//   //     label: "Other",
//   //     icon: MoreHorizontal,
//   //     color: "text-purple-600",
//   //     dot: "bg-purple-500",
//   //     bg: "bg-purple-50",
//   //   },
//   // ];


//   const statusOptions = [
//   {
//     value: "Active",
//     label: "Active",
//     icon: Circle,
//     color: "text-emerald-600",
//     dot: "bg-emerald-500",
//     bg: "bg-emerald-50",
//   },

//   {
//     value: "Namaz Break",
//     label: "Namaz Break",
//     icon: Moon,
//     color: "text-indigo-600",
//     dot: "bg-indigo-500",
//     bg: "bg-indigo-50",
//   },

//   {
//     value: "Lunch Break",
//     label: "Lunch Break",
//     icon: Utensils,
//     color: "text-orange-600",
//     dot: "bg-orange-500",
//     bg: "bg-orange-50",
//   },

//   {
//     value: "Short Break",
//     label: "Short Break",
//     icon: Clock3,
//     color: "text-teal-600",
//     dot: "bg-teal-500",
//     bg: "bg-teal-50",
//   },

//   {
//     value: "Inactive",
//     label: "Inactive",
//     icon: CircleOff,
//     color: "text-slate-500",
//     dot: "bg-slate-400",
//     bg: "bg-slate-100",
//     disabled: true, // 🔒 manually select nahi hoga
//   },

//   {
//     value: "On Call",
//     label: "On Call",
//     icon: Phone,
//     color: "text-blue-600",
//     dot: "bg-blue-500",
//     bg: "bg-blue-50",
//     disabled: true, // 🔒 manually select nahi hoga
//   },

//   {
//     value: "Meeting",
//     label: "Meeting",
//     icon: Bath,
//     color: "text-cyan-600",
//     dot: "bg-cyan-500",
//     bg: "bg-cyan-50",
//      disabled: true, // 🔒 manually select nahi hoga
//   },

//   {
//     value: "Other",
//     label: "Other",
//     icon: MoreHorizontal,
//     color: "text-purple-600",
//     dot: "bg-purple-500",
//     bg: "bg-purple-50",
//     disabled: true, // 🔒 manually select nahi hoga
//   },
// ];
//   // ============================================================
//   // SELECTED STATUS
//   // ============================================================

//   const selectedStatus =
//     statusOptions.find(
//       (status) => status.value === userStatus
//     ) || statusOptions[0];

//   // ============================================================
//   // FORMAT TIMER
//   // ============================================================

//   const formatTimer = (seconds) => {
//     const safeSeconds = Math.max(
//       0,
//       Number(seconds) || 0
//     );

//     const hrs = Math.floor(
//       safeSeconds / 3600
//     );

//     const mins = Math.floor(
//       (safeSeconds % 3600) / 60
//     );

//     const secs = safeSeconds % 60;

//     return [
//       hrs.toString().padStart(2, "0"),
//       mins.toString().padStart(2, "0"),
//       secs.toString().padStart(2, "0"),
//     ].join(":");
//   };

//   // ============================================================
//   // CALCULATE ELAPSED TIME
//   // ============================================================

//   const calculateElapsedTime = (startedAt) => {
//     if (!startedAt) {
//       return 0;
//     }

//     const startTime = new Date(
//       startedAt
//     ).getTime();

//     if (Number.isNaN(startTime)) {
//       return 0;
//     }

//     const elapsed = Math.floor(
//       (Date.now() - startTime) / 1000
//     );

//     return Math.max(0, elapsed);
//   };

//   // ============================================================
//   // LOAD CURRENT USER + CURRENT STATUS
//   // ============================================================

//   useEffect(() => {
//     let mounted = true;

//     async function fetchUserData() {
//       try {
//         // ======================================================
//         // CURRENT USER
//         // ======================================================

//         const res = await fetch(
//           "/api/auth/me",
//           {
//             cache: "no-store",
//             credentials: "include",
//           }
//         );

//         const data = await res.json();

//         const userObj =
//           data.user ||
//           data.data ||
//           data;

//         if (data.success || userObj) {
//           const avatarUrl =
//             userObj.avatar ||
//             userObj.image ||
//             userObj.profilePic ||
//             userObj.avatarUrl ||
//             userObj.profile_picture ||
//             null;

//           const userName =
//             userObj.name ||
//             userObj.username ||
//             userObj.fullName ||
//             "";

//           if (!mounted) {
//             return;
//           }

//           // ====================================================
//           // CURRENT USER INCLUDING ID
//           // ====================================================

//           setCurrentUser({
//             id: userObj.id || null,
//             name: userName,
//             email: userObj.email || "",
//             role: userObj.role || "user",
//             avatar: avatarUrl,
//           });
//         }

//         // ======================================================
//         // CURRENT STATUS
//         // ======================================================

//         const statusRes = await fetch(
//           "/api/users/status",
//           {
//             cache: "no-store",
//             credentials: "include",
//           }
//         );

//         const statusData =
//           await statusRes.json();

//         if (
//           !statusRes.ok ||
//           !statusData.success
//         ) {
//           throw new Error(
//             statusData.message ||
//               "Failed to load status"
//           );
//         }

//         const dbStatus =
//           statusData.status ||
//           statusData.user
//             ?.availability_status ||
//           "Active";

//         const dbStartedAt =
//           statusData.status_started_at ??
//           statusData.user
//             ?.status_started_at ??
//           null;

//         if (!mounted) {
//           return;
//         }

//         // ======================================================
//         // SET STATUS
//         // ======================================================

//         setUserStatus(dbStatus);

//         // ======================================================
//         // SET START TIME
//         // ======================================================

//         setStatusStartedAt(
//           dbStartedAt
//         );

//         // ======================================================
//         // RESTORE TIMER
//         // ======================================================

//         if (
//           dbStatus !== "Active" &&
//           dbStartedAt
//         ) {
//           const elapsed =
//             calculateElapsedTime(
//               dbStartedAt
//             );

//           setTimerStatus(
//             dbStatus
//           );

//           setTimerSeconds(
//             elapsed
//           );

//           setTimerOpen(true);
//         } else {
//           setTimerStatus(null);
//           setTimerSeconds(0);
//           setTimerOpen(false);
//         }
//       } catch (error) {
//         console.error(
//           "Failed to fetch user/status:",
//           error
//         );
//       } finally {
//         if (mounted) {
//           setLoading(false);
//         }
//       }
//     }

//     fetchUserData();

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   // ============================================================
//   // TIMER TICK
//   // ============================================================

//   useEffect(() => {
//     if (
//       !timerOpen ||
//       !timerStatus ||
//       !statusStartedAt
//     ) {
//       return;
//     }

//     const updateTimer = () => {
//       const startedTime = new Date(
//         statusStartedAt
//       ).getTime();

//       if (Number.isNaN(startedTime)) {
//         setTimerSeconds(0);
//         return;
//       }

//       const elapsed = Math.max(
//         0,
//         Math.floor(
//           (Date.now() - startedTime) /
//             1000
//         )
//       );

//       setTimerSeconds(elapsed);
//     };

//     updateTimer();

//     const interval = setInterval(
//       updateTimer,
//       1000
//     );

//     return () => {
//       clearInterval(interval);
//     };
//   }, [
//     timerOpen,
//     timerStatus,
//     statusStartedAt,
//   ]);

//   // ============================================================
//   // CLOSE DROPDOWN OUTSIDE
//   // ============================================================

//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (
//         statusRef.current &&
//         !statusRef.current.contains(
//           event.target
//         )
//       ) {
//         setStatusOpen(false);
//       }
//     }

//     document.addEventListener(
//       "mousedown",
//       handleClickOutside
//     );

//     return () => {
//       document.removeEventListener(
//         "mousedown",
//         handleClickOutside
//       );
//     };
//   }, []);

//   // ============================================================
//   // CHANGE STATUS
//   // ============================================================

//   const handleStatusChange = async (
//     newStatus
//   ) => {
//     if (statusUpdating) {
//       return;
//     }

//     const oldStatus = userStatus;
//     const oldStartedAt =
//       statusStartedAt;

//     setStatusOpen(false);

//     // ==========================================================
//     // ACTIVE
//     // ==========================================================

//     if (newStatus === "Active") {
//       try {
//         setStatusUpdating(true);

//         const res = await fetch(
//           "/api/users/status",
//           {
//             method: "PUT",

//             headers: {
//               "Content-Type":
//                 "application/json",
//             },

//             credentials: "include",

//             body: JSON.stringify({
//               status: "Active",
//             }),
//           }
//         );

//         const data = await res.json();

//         if (
//           !res.ok ||
//           !data.success
//         ) {
//           throw new Error(
//             data.message ||
//               "Failed to update status"
//           );
//         }

//         setUserStatus("Active");
//         setStatusStartedAt(null);
//         setTimerOpen(false);
//         setTimerStatus(null);
//         setTimerSeconds(0);
//       } catch (error) {
//         console.error(
//           "Status update error:",
//           error
//         );

//         setUserStatus(oldStatus);

//         setStatusStartedAt(
//           oldStartedAt
//         );

//         alert(
//           "Status update nahi ho saka."
//         );
//       } finally {
//         setStatusUpdating(false);
//       }

//       return;
//     }

//     // ==========================================================
//     // NON ACTIVE STATUS
//     // ==========================================================

//     try {
//       setStatusUpdating(true);

//       const res = await fetch(
//         "/api/users/status",
//         {
//           method: "PUT",

//           headers: {
//             "Content-Type":
//               "application/json",
//           },

//           credentials: "include",

//           body: JSON.stringify({
//             status: newStatus,
//           }),
//         }
//       );

//       const data = await res.json();

//       if (
//         !res.ok ||
//         !data.success
//       ) {
//         throw new Error(
//           data.message ||
//             "Failed to update status"
//         );
//       }

//       // ========================================================
//       // DATABASE START TIME
//       // ========================================================

//       const dbStartedAt =
//         data.status_started_at ??
//         data.user
//           ?.status_started_at ??
//         null;

//       // ========================================================
//       // UPDATE STATUS
//       // ========================================================

//       setUserStatus(newStatus);

//       setStatusStartedAt(
//         dbStartedAt
//       );

//       setTimerStatus(
//         newStatus
//       );

//       // ========================================================
//       // CALCULATE TIMER
//       // ========================================================

//       const elapsed =
//         calculateElapsedTime(
//           dbStartedAt
//         );

//       setTimerSeconds(
//         elapsed
//       );

//       setTimerOpen(true);
//     } catch (error) {
//       console.error(
//         "Status update error:",
//         error
//       );

//       setUserStatus(oldStatus);

//       setStatusStartedAt(
//         oldStartedAt
//       );

//       alert(
//         "Status update nahi ho saka."
//       );
//     } finally {
//       setStatusUpdating(false);
//     }
//   };

//   // ============================================================
//   // END STATUS / RETURN ACTIVE
//   // ============================================================

//   const endStatusTimer = async () => {
//     if (statusUpdating) {
//       return;
//     }

//     const oldStatus = userStatus;
//     const oldStartedAt =
//       statusStartedAt;

//     try {
//       setStatusUpdating(true);

//       const res = await fetch(
//         "/api/users/status",
//         {
//           method: "PUT",

//           headers: {
//             "Content-Type":
//               "application/json",
//           },

//           credentials: "include",

//           body: JSON.stringify({
//             status: "Active",
//           }),
//         }
//       );

//       const data = await res.json();

//       if (
//         !res.ok ||
//         !data.success
//       ) {
//         throw new Error(
//           data.message ||
//             "Failed to activate user"
//         );
//       }

//       setUserStatus("Active");
//       setStatusStartedAt(null);
//       setTimerOpen(false);
//       setTimerStatus(null);
//       setTimerSeconds(0);
//     } catch (error) {
//       console.error(
//         "End status error:",
//         error
//       );

//       setUserStatus(oldStatus);

//       setStatusStartedAt(
//         oldStartedAt
//       );

//       alert(
//         "Status change nahi ho saka."
//       );
//     } finally {
//       setStatusUpdating(false);
//     }
//   };

//   // ============================================================
//   // INITIAL
//   // ============================================================

//   const userInitial =
//     currentUser.name
//       ? currentUser.name
//           .trim()
//           .charAt(0)
//           .toUpperCase()
//       : "";

//   const isAdmin =
//     currentUser.role?.toLowerCase() ===
//     "admin";

//   // ============================================================
//   // TIMER ICON
//   // ============================================================

//   const TimerIcon =
//     statusOptions.find(
//       (item) =>
//         item.value === timerStatus
//     )?.icon || Clock3;

//   const timerOption =
//     statusOptions.find(
//       (item) =>
//         item.value === timerStatus
//     ) || statusOptions[0];

//   // ============================================================
//   // UI
//   // ============================================================

//   return (
//     <>
//       {/* ======================================================
//           TOP BAR
//       ======================================================= */}

//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">

//         {/* ====================================================
//             LEFT
//         ===================================================== */}

//   <div>
//   {/* ==================================================
//       DASHBOARD HEADER
//   =================================================== */}
//   <div className="flex items-center gap-3">
    
//     {/* Accent Line */}
//     <div className="h-8 w-1 rounded-full bg-[#ec3737]" />

//     {/* Title */}
//     <div className="flex items-center gap-2.5">
//       <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
//         Dashboard
//       </h1>

//       {/* User ID */}
//    {!loading && currentUser.id && (
//   <span className="inline-flex items-center gap-2 rounded-xl border border-[#ec3737]/20 bg-[#ec3737]/5 px-3 py-1.5 shadow-sm">
    
//     <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#ec3737] text-[9px] font-black uppercase text-white shadow-sm">
//       ID
//     </span>

//     <span className="text-sm font-extrabold tracking-tight text-[#ec3737]">
//       {currentUser.id}
//     </span>

//   </span>
// )}
//     </div>
//   </div>

//   {/* Subtitle */}
//   <p className="mt-1.5 ml-4 text-xs font-medium text-slate-500">
//     Call Activity & Performance Analytics
//   </p>
// </div>

//         {/* ====================================================
//             RIGHT
//         ===================================================== */}

//         <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">

//           {/* ==================================================
//               LOGIN BADGE
//           =================================================== */}

//           <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700 font-medium shadow-sm">

//             <Calendar
//               size={14}
//               className="text-blue-600 shrink-0"
//             />

//             <span>
//               Logged in:{" "}
//               <strong>
//                 {loginDetails.day}
//               </strong>
//               , {loginDetails.date}{" "}
//               at{" "}
//               {loginDetails.time}
//             </span>
//           </div>

//           {/* ==================================================
//               PROFILE
//           =================================================== */}

//           <div
//             className="flex items-center gap-3 shrink-0 relative"
//             ref={statusRef}
//           >

//             {/* AVATAR */}

//             <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-md overflow-hidden shrink-0 relative">

//               {loading ? (
//                 <div className="w-full h-full bg-slate-200 animate-pulse flex items-center justify-center">
//                   <User
//                     size={18}
//                     className="text-slate-400"
//                   />
//                 </div>
//               ) : currentUser.avatar &&
//                 !imageError ? (
//                 <img
//                   src={
//                     currentUser.avatar
//                   }
//                   alt={
//                     currentUser.name ||
//                     "User Avatar"
//                   }
//                   className="w-full h-full object-cover"
//                   onError={() =>
//                     setImageError(true)
//                   }
//                 />
//               ) : userInitial ? (
//                 <span className="bg-gradient-to-tr from-amber-500 to-rose-500 w-full h-full rounded-full flex items-center justify-center uppercase font-black text-white">
//                   {userInitial}
//                 </span>
//               ) : (
//                 <div className="bg-slate-800 w-full h-full flex items-center justify-center">
//                   <User
//                     size={18}
//                     className="text-slate-300"
//                   />
//                 </div>
//               )}
//             </div>

//             {/* USER DETAILS */}

//             <div className="text-left hidden md:block">

//               {/* NAME + ROLE */}

//               <div className="flex items-center gap-2">

//                 <p className="text-xs sm:text-sm font-bold text-slate-900 leading-none capitalize">
//                   {loading
//                     ? "Loading..."
//                     : currentUser.name ||
//                       "Guest User"}
//                 </p>

//                 {!loading &&
//                   currentUser.role && (
//                     <span
//                       className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md border ${
//                         isAdmin
//                           ? "bg-purple-50 text-purple-700 border-purple-200"
//                           : "bg-emerald-50 text-emerald-700 border-emerald-200"
//                       }`}
//                     >
//                       {
//                         currentUser.role
//                       }
//                     </span>
//                   )}
//               </div>

//               {/* EMAIL */}

//               <p className="text-[11px] text-slate-400 font-medium mt-1">
//                 {loading
//                   ? "fetching email..."
//                   : currentUser.email ||
//                     "No email available"}
//               </p>

//               {/* STATUS */}

//               {!loading && (
//                 <div className="relative mt-2">

//                   <button
//                     type="button"
//                     disabled={
//                       statusUpdating
//                     }
//                     onClick={() =>
//                       setStatusOpen(
//                         (prev) =>
//                           !prev
//                       )
//                     }
//                     className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border ${selectedStatus.bg} ${selectedStatus.color} border-slate-200/70 hover:shadow-sm transition-all duration-200 disabled:opacity-60`}
//                   >

//                     <span
//                       className={`w-2 h-2 rounded-full ${selectedStatus.dot} ${
//                         userStatus ===
//                         "Active"
//                           ? "animate-pulse"
//                           : ""
//                       }`}
//                     />

//                     <span className="text-[11px] font-bold whitespace-nowrap">
//                       {
//                         selectedStatus.label
//                       }
//                     </span>

//                     <ChevronDown
//                       size={12}
//                       className={`transition-transform ${
//                         statusOpen
//                           ? "rotate-180"
//                           : ""
//                       }`}
//                     />
//                   </button>

//                   {/* STATUS DROPDOWN */}

//                   {statusOpen && (
//                     <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-900/10 p-1.5 z-[100]">

//                       <div className="px-2.5 py-2 mb-1">
//                         <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
//                           Set your status
//                         </p>
//                       </div>

//                      {statusOptions.map((option) => {
//   const Icon = option.icon;

//   return (
//     <button
//       key={option.value}
//       type="button"
//       disabled={option.disabled}
//       onClick={() => {
//         if (option.disabled) return;
//         handleStatusChange(option.value);
//       }}
//       className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition
//         ${
//           option.disabled
//             ? "opacity-50 cursor-not-allowed"
//             : "hover:bg-gray-50 cursor-pointer"
//         }
//       `}
//     >
//       <div className={`w-8 h-8 rounded-lg ${option.bg} flex items-center justify-center`}>
//         <Icon className={`w-4 h-4 ${option.color}`} />
//       </div>

//       <span className="text-sm font-medium text-gray-700">
//         {option.label}
//       </span>

//       {option.disabled && (
//         <span className="ml-auto text-[10px] text-gray-400 font-medium">
//           Auto
//         </span>
//       )}
//     </button>
//   );
// })}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* PROFILE ARROW */}

//             <button
//               type="button"
//               onClick={() =>
//                 setStatusOpen(
//                   (prev) => !prev
//                 )
//               }
//               className="hidden md:flex items-center justify-center"
//             >
//               <ChevronDown
//                 size={15}
//                 className={`text-slate-400 transition-transform ${
//                   statusOpen
//                     ? "rotate-180"
//                     : ""
//                 }`}
//               />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* ======================================================
//           LOCKED STATUS TIMER
//       ======================================================= */}

//       {timerOpen &&
//         timerStatus &&
//         timerStatus !== "Active" &&
//         typeof document !==
//           "undefined" &&
//         createPortal(
//           <div
//             className="fixed inset-0 z-[2147483647] flex min-h-screen w-screen items-center justify-center p-4"
//             style={{
//               position: "fixed",
//               inset: 0,
//               width: "100vw",
//               height: "100vh",
//               pointerEvents: "auto",
//             }}
//             role="dialog"
//             aria-modal="true"
//             aria-labelledby="status-timer-title"
//           >

//             {/* ==================================================
//                 BACKDROP
//             =================================================== */}

//             <div
//               className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
//               style={{
//                 pointerEvents: "auto",
//               }}
//               onMouseDown={(e) => {
//                 e.preventDefault();
//                 e.stopPropagation();
//               }}
//               onClick={(e) => {
//                 e.preventDefault();
//                 e.stopPropagation();
//               }}
//               onContextMenu={(e) => {
//                 e.preventDefault();
//                 e.stopPropagation();
//               }}
//             />

//             {/* ==================================================
//                 TIMER CARD
//             =================================================== */}

//             <div
//               className="relative z-[2147483647] w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.45)]"
//               style={{
//                 pointerEvents: "auto",
//               }}
//               onMouseDown={(e) => {
//                 e.stopPropagation();
//               }}
//               onClick={(e) => {
//                 e.stopPropagation();
//               }}
//             >

//               {/* TOP ACCENT */}

//               <div
//                 className={`h-1.5 w-full ${timerOption.dot}`}
//               />

//               {/* CONTENT */}

//               <div className="px-5 py-7 sm:px-8 sm:py-8">

//                 {/* HEADER */}

//                 <div className="flex items-start justify-between gap-4">

//                   <div className="min-w-0 text-left">

//                     <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
//                       Current Status
//                     </p>

//                     <h2
//                       id="status-timer-title"
//                       className={`mt-1.5 truncate text-xl font-black sm:text-2xl ${timerOption.color}`}
//                     >
//                       {timerStatus}
//                     </h2>
//                   </div>

//                   {/* BREAK BADGE */}

//                   <div className="flex shrink-0 items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1.5">

//                     <span className="relative flex h-2.5 w-2.5">

//                       <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />

//                       <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />

//                     </span>

//                     <span className="text-[10px] font-extrabold tracking-wide text-red-700">
//                       Break
//                     </span>
//                   </div>
//                 </div>

//                 {/* MAIN TIMER */}

//                 <div className="relative mt-7 overflow-hidden rounded-[24px] border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-100 px-5 py-8 text-center shadow-sm">

//                   {/* DECORATIVE CIRCLES */}

//                   <div
//                     className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full ${timerOption.bg} opacity-70 blur-2xl`}
//                   />

//                   <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-slate-200/50 blur-2xl" />

//                   {/* ICON */}

//                   <div
//                     className={`relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${timerOption.bg} ${timerOption.color} shadow-sm ring-1 ring-black/5`}
//                   >
//                     <TimerIcon
//                       size={30}
//                       strokeWidth={2}
//                     />
//                   </div>

//                   {/* LABEL */}

//                   <p className="relative mt-5 text-[10px] font-extrabold uppercase tracking-[0.25em] text-slate-400">
//                     Time Elapsed
//                   </p>

//                   {/* TIMER */}

//                   <div className="relative mt-2 font-mono text-5xl font-black tracking-[-0.04em] text-slate-900 tabular-nums sm:text-6xl">
//                     {formatTimer(
//                       timerSeconds
//                     )}
//                   </div>

//                   {/* DESCRIPTION */}

//                   <p className="relative mt-3 text-xs font-medium text-slate-500 sm:text-sm">
//                     Your status timer is currently running
//                   </p>
//                 </div>

//                 {/* STATUS INFORMATION */}

//                 <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">

//                   <div className="flex items-center gap-3">

//                     {/* STATUS ICON */}

//                     <div
//                       className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${timerOption.bg} ${timerOption.color}`}
//                     >
//                       <TimerIcon
//                         size={18}
//                         strokeWidth={2}
//                       />
//                     </div>

//                     {/* STATUS */}

//                     <div className="min-w-0 text-left">

//                       <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-slate-400">
//                         Status
//                       </p>

//                       <p className="mt-0.5 truncate text-sm font-bold text-slate-800">
//                         {timerStatus}
//                       </p>
//                     </div>

//                     {/* DIVIDER */}

//                     <div className="ml-auto h-9 w-px bg-slate-200" />

//                     {/* DURATION */}

//                     <div className="text-right">

//                       <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-slate-400">
//                         Duration
//                       </p>

//                       <p className="mt-0.5 font-mono text-sm font-bold text-slate-800 tabular-nums">
//                         {formatTimer(
//                           timerSeconds
//                         )}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* LOCKED MESSAGE */}

//                 <div className="mt-5 flex items-center justify-center gap-2">

//                   <span className="relative flex h-2.5 w-2.5">

//                     <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ec3737] opacity-60" />

//                     <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#ec3737]" />

//                   </span>

//                   <p className="text-xs font-medium text-slate-500">
//                     Your status is currently{" "}
//                     {timerStatus}
//                   </p>
//                 </div>

//                 {/* RETURN ACTIVE */}

//                 <button
//                   type="button"
//                   disabled={
//                     statusUpdating
//                   }
//                   onClick={(e) => {
//                     e.preventDefault();
//                     e.stopPropagation();

//                     endStatusTimer();
//                   }}
//                   className="group mt-6 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#790214] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-[#790214]/20 transition-all duration-200 hover:bg-[#650111] hover:shadow-xl hover:shadow-[#790214]/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
//                 >

//                   {statusUpdating ? (
//                     <>
//                       <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

//                       <span>
//                         Updating...
//                       </span>
//                     </>
//                   ) : (
//                     <>
//                       <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 transition-colors group-hover:bg-white/20">

//                         <Check
//                           size={16}
//                           strokeWidth={2.5}
//                         />
//                       </span>

//                       <span>
//                         Return to Active
//                       </span>
//                     </>
//                   )}
//                 </button>

//                 {/* FOOTER */}

//                 <div className="mt-4 flex items-center justify-center gap-1.5">

//                   <Clock3
//                     size={12}
//                     className="text-slate-400"
//                   />

//                   <p className="text-[10px] font-medium text-slate-400">
//                     Your status duration is automatically recorded.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>,
//           document.body
//         )}
//     </>
//   );
// }



















// "use client";

// import { useState, useEffect, useRef } from "react";
// import { createPortal } from "react-dom";

// import {
//   Calendar,
//   ChevronDown,
//   User,
//   Check,
//   Circle,
//   Phone,
//   Moon,
//   Utensils,
//   CircleOff,
//   MoreHorizontal,
//   Clock3,
//   BriefcaseBusiness,
// } from "lucide-react";

// export default function DashboardTopBar() {
//   // ============================================================
//   // CURRENT USER
//   // ============================================================

//   const [currentUser, setCurrentUser] = useState({
//     id: null,
//     name: "",
//     email: "",
//     role: "",
//     avatar: null,
//   });

//   const [loading, setLoading] = useState(true);
//   const [imageError, setImageError] = useState(false);

//   // ============================================================
//   // USER STATUS
//   // ============================================================

//   const [userStatus, setUserStatus] = useState("Active");
//   const [statusOpen, setStatusOpen] = useState(false);
//   const [statusUpdating, setStatusUpdating] = useState(false);

//   const statusRef = useRef(null);

//   // ============================================================
//   // BREAK LIMIT
//   // ============================================================

//   const MAX_BREAKS = 5;

//   const [breakCount, setBreakCount] = useState(0);

//   const remainingBreaks = Math.max(
//     0,
//     MAX_BREAKS - breakCount
//   );

//   const breakLimitReached =
//     breakCount >= MAX_BREAKS;

//   // ============================================================
//   // TIMER MODAL
//   // ============================================================

//   const [timerOpen, setTimerOpen] = useState(false);
//   const [timerStatus, setTimerStatus] = useState(null);
//   const [timerSeconds, setTimerSeconds] = useState(0);

//   // ============================================================
//   // DATABASE STATUS START TIME
//   // ============================================================

//   const [statusStartedAt, setStatusStartedAt] =
//     useState(null);

//   // ============================================================
//   // LOGIN DETAILS — CALIFORNIA TIME
//   // ============================================================

//   const [loginDetails] = useState(() => {
//     const now = new Date();

//     const timeZone = "America/Los_Angeles";

//     return {
//       day: now.toLocaleDateString("en-US", {
//         weekday: "long",
//         timeZone,
//       }),

//       date: now.toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         year: "numeric",
//         timeZone,
//       }),

//       time: now.toLocaleTimeString("en-US", {
//         hour: "2-digit",
//         minute: "2-digit",
//         second: "2-digit",
//         hour12: true,
//         timeZone,
//       }),
//     };
//   });

//   // ============================================================
//   // STATUS OPTIONS
//   // ============================================================

//   const statusOptions = [
//     // ==========================================================
//     // ACTIVE
//     // ==========================================================

//     {
//       value: "Active",
//       label: "Active",
//       icon: Circle,
//       color: "text-emerald-600",
//       dot: "bg-emerald-500",
//       bg: "bg-emerald-50",
//       isBreak: false,
//       adminOnly: false,
//     },

//     // ==========================================================
//     // NAMAZ BREAK
//     // ==========================================================

//     {
//       value: "Namaz Break",
//       label: "Namaz Break",
//       icon: Moon,
//       color: "text-indigo-600",
//       dot: "bg-indigo-500",
//       bg: "bg-indigo-50",
//       isBreak: true,
//       adminOnly: false,
//     },

//     // ==========================================================
//     // LUNCH BREAK
//     // ==========================================================

//     {
//       value: "Lunch Break",
//       label: "Lunch Break",
//       icon: Utensils,
//       color: "text-orange-600",
//       dot: "bg-orange-500",
//       bg: "bg-orange-50",
//       isBreak: true,
//       adminOnly: false,
//     },

//     // ==========================================================
//     // SHORT BREAK
//     // ==========================================================

//     {
//       value: "Short Break",
//       label: "Short Break",
//       icon: Clock3,
//       color: "text-teal-600",
//       dot: "bg-teal-500",
//       bg: "bg-teal-50",
//       isBreak: true,
//       adminOnly: false,
//     },

//     // ==========================================================
//     // INACTIVE — ADMIN ONLY
//     // ==========================================================

//     {
//       value: "Inactive",
//       label: "Inactive",
//       icon: CircleOff,
//       color: "text-slate-500",
//       dot: "bg-slate-400",
//       bg: "bg-slate-100",
//       disabled: true,
//       adminOnly: true,
//       isBreak: false,
//     },

//     // ==========================================================
//     // ON CALL — ADMIN ONLY
//     // ==========================================================

//     {
//       value: "On Call",
//       label: "On Call",
//       icon: Phone,
//       color: "text-blue-600",
//       dot: "bg-blue-500",
//       bg: "bg-blue-50",
//       disabled: true,
//       adminOnly: true,
//       isBreak: false,
//     },

//     // ==========================================================
//     // MEETING — ADMIN ONLY
//     // ==========================================================

//     {
//       value: "Meeting",
//       label: "Meeting",
//       icon: BriefcaseBusiness,
//       color: "text-cyan-600",
//       dot: "bg-cyan-500",
//       bg: "bg-cyan-50",
//       disabled: true,
//       adminOnly: true,
//       isBreak: false,
//     },

//     // ==========================================================
//     // OTHER — ADMIN ONLY
//     // ==========================================================

//     {
//       value: "Other",
//       label: "Other",
//       icon: MoreHorizontal,
//       color: "text-purple-600",
//       dot: "bg-purple-500",
//       bg: "bg-purple-50",
//       disabled: true,
//       adminOnly: true,
//       isBreak: false,
//     },
//   ];

//   // ============================================================
//   // ADMIN
//   // ============================================================

//   const isAdmin =
//     currentUser.role?.toLowerCase() === "admin";

//   // ============================================================
//   // VISIBLE STATUS OPTIONS
//   // ============================================================

//   const visibleStatusOptions =
//     statusOptions.filter((option) => {
//       if (option.adminOnly && !isAdmin) {
//         return false;
//       }

//       return true;
//     });

//   // ============================================================
//   // SELECTED STATUS
//   // ============================================================

//   const selectedStatus =
//     statusOptions.find(
//       (status) => status.value === userStatus
//     ) || statusOptions[0];

//   // ============================================================
//   // FORMAT TIMER
//   // ============================================================

//   const formatTimer = (seconds) => {
//     const safeSeconds = Math.max(
//       0,
//       Number(seconds) || 0
//     );

//     const hrs = Math.floor(
//       safeSeconds / 3600
//     );

//     const mins = Math.floor(
//       (safeSeconds % 3600) / 60
//     );

//     const secs = safeSeconds % 60;

//     return [
//       hrs.toString().padStart(2, "0"),
//       mins.toString().padStart(2, "0"),
//       secs.toString().padStart(2, "0"),
//     ].join(":");
//   };

//   // ============================================================
//   // CALCULATE ELAPSED TIME
//   // ============================================================

//   const calculateElapsedTime = (startedAt) => {
//     if (!startedAt) {
//       return 0;
//     }

//     const startTime =
//       new Date(startedAt).getTime();

//     if (Number.isNaN(startTime)) {
//       return 0;
//     }

//     const elapsed = Math.floor(
//       (Date.now() - startTime) / 1000
//     );

//     return Math.max(0, elapsed);
//   };

//   // ============================================================
//   // LOAD CURRENT USER + STATUS
//   // ============================================================

//   useEffect(() => {
//     let mounted = true;

//     async function fetchUserData() {
//       try {
//         // ======================================================
//         // CURRENT USER
//         // ======================================================

//         const res = await fetch(
//           "/api/auth/me",
//           {
//             cache: "no-store",
//             credentials: "include",
//           }
//         );

//         const data = await res.json();

//         const userObj =
//           data.user ||
//           data.data ||
//           data;

//         if (data.success || userObj) {
//           const avatarUrl =
//             userObj.avatar ||
//             userObj.image ||
//             userObj.profilePic ||
//             userObj.avatarUrl ||
//             userObj.profile_picture ||
//             null;

//           const userName =
//             userObj.name ||
//             userObj.username ||
//             userObj.fullName ||
//             "";

//           if (!mounted) {
//             return;
//           }

//           setCurrentUser({
//             id: userObj.id || null,
//             name: userName,
//             email: userObj.email || "",
//             role: userObj.role || "user",
//             avatar: avatarUrl,
//           });
//         }

//         // ======================================================
//         // CURRENT STATUS
//         // ======================================================

//         const statusRes = await fetch(
//           "/api/users/status",
//           {
//             cache: "no-store",
//             credentials: "include",
//           }
//         );

//         const statusData =
//           await statusRes.json();

//         if (
//           !statusRes.ok ||
//           !statusData.success
//         ) {
//           throw new Error(
//             statusData.message ||
//               "Failed to load status"
//           );
//         }

//         // ======================================================
//         // BREAK COUNT
//         // ======================================================

//         const apiBreakCount =
//           Number(
//             statusData.break_count ?? 0
//           );

//         if (mounted) {
//           setBreakCount(
//             Math.max(0, apiBreakCount)
//           );
//         }

//         // ======================================================
//         // STATUS
//         // ======================================================

//         const dbStatus =
//           statusData.status ||
//           statusData.user
//             ?.availability_status ||
//           "Active";

//         // ======================================================
//         // START TIME
//         // ======================================================

//         const dbStartedAt =
//           statusData.status_started_at ??
//           statusData.user
//             ?.status_started_at ??
//           null;

//         if (!mounted) {
//           return;
//         }

//         setUserStatus(dbStatus);

//         setStatusStartedAt(
//           dbStartedAt
//         );

//         // ======================================================
//         // RESTORE TIMER
//         // ======================================================

//         if (
//           dbStatus !== "Active" &&
//           dbStartedAt
//         ) {
//           const elapsed =
//             calculateElapsedTime(
//               dbStartedAt
//             );

//           setTimerStatus(
//             dbStatus
//           );

//           setTimerSeconds(
//             elapsed
//           );

//           setTimerOpen(true);
//         } else {
//           setTimerStatus(null);
//           setTimerSeconds(0);
//           setTimerOpen(false);
//         }
//       } catch (error) {
//         console.error(
//           "Failed to fetch user/status:",
//           error
//         );
//       } finally {
//         if (mounted) {
//           setLoading(false);
//         }
//       }
//     }

//     fetchUserData();

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   // ============================================================
//   // TIMER TICK
//   // ============================================================

//   useEffect(() => {
//     if (
//       !timerOpen ||
//       !timerStatus ||
//       !statusStartedAt
//     ) {
//       return;
//     }

//     const updateTimer = () => {
//       const startedTime =
//         new Date(
//           statusStartedAt
//         ).getTime();

//       if (
//         Number.isNaN(startedTime)
//       ) {
//         setTimerSeconds(0);
//         return;
//       }

//       const elapsed = Math.max(
//         0,
//         Math.floor(
//           (Date.now() -
//             startedTime) /
//             1000
//         )
//       );

//       setTimerSeconds(elapsed);
//     };

//     updateTimer();

//     const interval =
//       setInterval(
//         updateTimer,
//         1000
//       );

//     return () => {
//       clearInterval(interval);
//     };
//   }, [
//     timerOpen,
//     timerStatus,
//     statusStartedAt,
//   ]);

//   // ============================================================
//   // CLOSE DROPDOWN OUTSIDE
//   // ============================================================

//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (
//         statusRef.current &&
//         !statusRef.current.contains(
//           event.target
//         )
//       ) {
//         setStatusOpen(false);
//       }
//     }

//     document.addEventListener(
//       "mousedown",
//       handleClickOutside
//     );

//     return () => {
//       document.removeEventListener(
//         "mousedown",
//         handleClickOutside
//       );
//     };
//   }, []);

//   // ============================================================
//   // CHANGE STATUS
//   // ============================================================

//   const handleStatusChange = async (
//     newStatus
//   ) => {
//     if (statusUpdating) {
//       return;
//     }

//     const selectedOption =
//       statusOptions.find(
//         (option) =>
//           option.value ===
//           newStatus
//       );

//     // ========================================================
//     // SAFETY CHECK
//     // ========================================================

//     if (!selectedOption) {
//       return;
//     }

//     // ========================================================
//     // ADMIN ONLY CHECK
//     // ========================================================

//     if (
//       selectedOption.adminOnly &&
//       !isAdmin
//     ) {
//       return;
//     }

//     // ========================================================
//     // DISABLED CHECK
//     // ========================================================

//     if (selectedOption.disabled) {
//       return;
//     }

//     // ========================================================
//     // BREAK LIMIT FRONTEND CHECK
//     // ========================================================

//     if (
//       selectedOption.isBreak &&
//       breakLimitReached
//     ) {
//       alert(
//         "Break limit reached. You can take maximum 5 breaks within 24 hours."
//       );

//       setStatusOpen(false);

//       return;
//     }

//     const oldStatus =
//       userStatus;

//     const oldStartedAt =
//       statusStartedAt;

//     setStatusOpen(false);

//     // ==========================================================
//     // ACTIVE
//     // ==========================================================

//     if (newStatus === "Active") {
//       try {
//         setStatusUpdating(true);

//         const res = await fetch(
//           "/api/users/status",
//           {
//             method: "PUT",

//             headers: {
//               "Content-Type":
//                 "application/json",
//             },

//             credentials:
//               "include",

//             body: JSON.stringify({
//               status: "Active",
//             }),
//           }
//         );

//         const data =
//           await res.json();

//         if (
//           !res.ok ||
//           !data.success
//         ) {
//           throw new Error(
//             data.message ||
//               "Failed to update status"
//           );
//         }

//         // ======================================================
//         // UPDATE BREAK COUNT
//         // ======================================================

//         if (
//           data.break_count !==
//           undefined
//         ) {
//           setBreakCount(
//             Number(
//               data.break_count
//             )
//           );
//         }

//         // ======================================================
//         // UPDATE STATUS
//         // ======================================================

//         setUserStatus(
//           "Active"
//         );

//         setStatusStartedAt(
//           null
//         );

//         setTimerOpen(false);
//         setTimerStatus(null);
//         setTimerSeconds(0);
//       } catch (error) {
//         console.error(
//           "Status update error:",
//           error
//         );

//         setUserStatus(
//           oldStatus
//         );

//         setStatusStartedAt(
//           oldStartedAt
//         );

//         alert(
//           error?.message ||
//             "Status update nahi ho saka."
//         );
//       } finally {
//         setStatusUpdating(
//           false
//         );
//       }

//       return;
//     }

//     // ==========================================================
//     // NON ACTIVE STATUS
//     // ==========================================================

//     try {
//       setStatusUpdating(true);

//       const res = await fetch(
//         "/api/users/status",
//         {
//           method: "PUT",

//           headers: {
//             "Content-Type":
//               "application/json",
//           },

//           credentials:
//             "include",

//           body: JSON.stringify({
//             status: newStatus,
//           }),
//         }
//       );

//       const data =
//         await res.json();

//       // ========================================================
//       // IMPORTANT:
//       // 429 = 5 BREAK LIMIT
//       // ========================================================

//       if (
//         res.status === 429 ||
//         data?.error ===
//           "MAX_BREAKS_REACHED"
//       ) {
//         if (
//           data?.break_count !==
//           undefined
//         ) {
//           setBreakCount(
//             Number(
//               data.break_count
//             )
//           );
//         }

//         alert(
//           data?.message ||
//             "Break limit reached. You can take maximum 5 breaks within 24 hours."
//         );

//         return;
//       }

//       if (
//         !res.ok ||
//         !data.success
//       ) {
//         throw new Error(
//           data.message ||
//             "Failed to update status"
//         );
//       }

//       // ========================================================
//       // UPDATE BREAK COUNT
//       // ========================================================

//       if (
//         data.break_count !==
//         undefined
//       ) {
//         setBreakCount(
//           Number(
//             data.break_count
//           )
//         );
//       }

//       // ========================================================
//       // DATABASE START TIME
//       // ========================================================

//       const dbStartedAt =
//         data.status_started_at ??
//         data.user
//           ?.status_started_at ??
//         null;

//       // ========================================================
//       // UPDATE STATUS
//       // ========================================================

//       setUserStatus(
//         newStatus
//       );

//       setStatusStartedAt(
//         dbStartedAt
//       );

//       setTimerStatus(
//         newStatus
//       );

//       // ========================================================
//       // CALCULATE TIMER
//       // ========================================================

//       const elapsed =
//         calculateElapsedTime(
//           dbStartedAt
//         );

//       setTimerSeconds(
//         elapsed
//       );

//       setTimerOpen(true);
//     } catch (error) {
//       console.error(
//         "Status update error:",
//         error
//       );

//       setUserStatus(
//         oldStatus
//       );

//       setStatusStartedAt(
//         oldStartedAt
//       );

//       alert(
//         error?.message ||
//           "Status update nahi ho saka."
//       );
//     } finally {
//       setStatusUpdating(
//         false
//       );
//     }
//   };

//   // ============================================================
//   // END STATUS / RETURN ACTIVE
//   // ============================================================

//   const endStatusTimer = async () => {
//     if (statusUpdating) {
//       return;
//     }

//     const oldStatus =
//       userStatus;

//     const oldStartedAt =
//       statusStartedAt;

//     try {
//       setStatusUpdating(true);

//       const res = await fetch(
//         "/api/users/status",
//         {
//           method: "PUT",

//           headers: {
//             "Content-Type":
//               "application/json",
//           },

//           credentials:
//             "include",

//           body: JSON.stringify({
//             status: "Active",
//           }),
//         }
//       );

//       const data =
//         await res.json();

//       if (
//         !res.ok ||
//         !data.success
//       ) {
//         throw new Error(
//           data.message ||
//             "Failed to activate user"
//         );
//       }

//       // ========================================================
//       // UPDATE BREAK COUNT
//       // ========================================================

//       if (
//         data.break_count !==
//         undefined
//       ) {
//         setBreakCount(
//           Number(
//             data.break_count
//           )
//         );
//       }

//       // ========================================================
//       // RESET STATUS
//       // ========================================================

//       setUserStatus(
//         "Active"
//       );

//       setStatusStartedAt(
//         null
//       );

//       setTimerOpen(false);
//       setTimerStatus(null);
//       setTimerSeconds(0);
//     } catch (error) {
//       console.error(
//         "End status error:",
//         error
//       );

//       setUserStatus(
//         oldStatus
//       );

//       setStatusStartedAt(
//         oldStartedAt
//       );

//       alert(
//         error?.message ||
//           "Status change nahi ho saka."
//       );
//     } finally {
//       setStatusUpdating(
//         false
//       );
//     }
//   };

//   // ============================================================
//   // INITIAL
//   // ============================================================

//   const userInitial =
//     currentUser.name
//       ? currentUser.name
//           .trim()
//           .charAt(0)
//           .toUpperCase()
//       : "";

//   // ============================================================
//   // TIMER ICON
//   // ============================================================

//   const TimerIcon =
//     statusOptions.find(
//       (item) =>
//         item.value ===
//         timerStatus
//     )?.icon || Clock3;

//   const timerOption =
//     statusOptions.find(
//       (item) =>
//         item.value ===
//         timerStatus
//     ) || statusOptions[0];

//   // ============================================================
//   // UI
//   // ============================================================

//   return (
//     <>
//       {/* ======================================================
//           TOP BAR
//       ======================================================= */}

//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">

//         {/* ====================================================
//             LEFT
//         ===================================================== */}

//         <div>
//           <div className="flex items-center gap-3">

//             <div className="h-8 w-1 rounded-full bg-[#ec3737]" />

//             <div className="flex items-center gap-2.5">

//               <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
//                 Dashboard
//               </h1>

//               {!loading &&
//                 currentUser.id && (
//                   <span className="inline-flex items-center gap-2 rounded-xl border border-[#ec3737]/20 bg-[#ec3737]/5 px-3 py-1.5 shadow-sm">

//                     <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#ec3737] text-[9px] font-black uppercase text-white shadow-sm">
//                       ID
//                     </span>

//                     <span className="text-sm font-extrabold tracking-tight text-[#ec3737]">
//                       {currentUser.id}
//                     </span>

//                   </span>
//                 )}

//             </div>
//           </div>

//           <p className="mt-1.5 ml-4 text-xs font-medium text-slate-500">
//             Call Activity & Performance Analytics
//           </p>
//         </div>

//         {/* ====================================================
//             RIGHT
//         ===================================================== */}

//         <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">

//           {/* ==================================================
//               LOGIN BADGE
//           =================================================== */}

//           <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700 font-medium shadow-sm">

//             <Calendar
//               size={14}
//               className="text-blue-600 shrink-0"
//             />

//             <span>
//               Logged in:{" "}
//               <strong>
//                 {loginDetails.day}
//               </strong>
//               , {loginDetails.date}{" "}
//               at{" "}
//               {loginDetails.time}
//             </span>
//           </div>

//           {/* ==================================================
//               PROFILE
//           =================================================== */}

//           <div
//             className="flex items-center gap-3 shrink-0 relative"
//             ref={statusRef}
//           >

//             {/* AVATAR */}

//             <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-md overflow-hidden shrink-0 relative">

//               {loading ? (
//                 <div className="w-full h-full bg-slate-200 animate-pulse flex items-center justify-center">
//                   <User
//                     size={18}
//                     className="text-slate-400"
//                   />
//                 </div>
//               ) : currentUser.avatar &&
//                 !imageError ? (
//                 <img
//                   src={
//                     currentUser.avatar
//                   }
//                   alt={
//                     currentUser.name ||
//                     "User Avatar"
//                   }
//                   className="w-full h-full object-cover"
//                   onError={() =>
//                     setImageError(
//                       true
//                     )
//                   }
//                 />
//               ) : userInitial ? (
//                 <span className="bg-gradient-to-tr from-amber-500 to-rose-500 w-full h-full rounded-full flex items-center justify-center uppercase font-black text-white">
//                   {userInitial}
//                 </span>
//               ) : (
//                 <div className="bg-slate-800 w-full h-full flex items-center justify-center">
//                   <User
//                     size={18}
//                     className="text-slate-300"
//                   />
//                 </div>
//               )}

//             </div>

//             {/* USER DETAILS */}

//             <div className="text-left hidden md:block">

//               {/* NAME + ROLE */}

//               <div className="flex items-center gap-2">

//                 <p className="text-xs sm:text-sm font-bold text-slate-900 leading-none capitalize">
//                   {loading
//                     ? "Loading..."
//                     : currentUser.name ||
//                       "Guest User"}
//                 </p>

//                 {!loading &&
//                   currentUser.role && (
//                     <span
//                       className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md border ${
//                         isAdmin
//                           ? "bg-purple-50 text-purple-700 border-purple-200"
//                           : "bg-emerald-50 text-emerald-700 border-emerald-200"
//                       }`}
//                     >
//                       {
//                         currentUser.role
//                       }
//                     </span>
//                   )}

//               </div>

//               {/* EMAIL */}

//               <p className="text-[11px] text-slate-400 font-medium mt-1">
//                 {loading
//                   ? "fetching email..."
//                   : currentUser.email ||
//                     "No email available"}
//               </p>

//               {/* STATUS */}

//               {!loading && (
//                 <div className="relative mt-2">

//                   <button
//                     type="button"
//                     disabled={
//                       statusUpdating
//                     }
//                     onClick={() =>
//                       setStatusOpen(
//                         (prev) =>
//                           !prev
//                       )
//                     }
//                     className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border ${selectedStatus.bg} ${selectedStatus.color} border-slate-200/70 hover:shadow-sm transition-all duration-200 disabled:opacity-60`}
//                   >

//                     <span
//                       className={`w-2 h-2 rounded-full ${selectedStatus.dot} ${
//                         userStatus ===
//                         "Active"
//                           ? "animate-pulse"
//                           : ""
//                       }`}
//                     />

//                     <span className="text-[11px] font-bold whitespace-nowrap">
//                       {
//                         selectedStatus.label
//                       }
//                     </span>

//                     <ChevronDown
//                       size={12}
//                       className={`transition-transform ${
//                         statusOpen
//                           ? "rotate-180"
//                           : ""
//                       }`}
//                     />

//                   </button>

//                   {/* ==================================================
//                       STATUS DROPDOWN
//                   =================================================== */}

//                   {statusOpen && (
//                     <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-900/10 p-1.5 z-[100]">

//                       {/* =================================================
//                           HEADER
//                       ================================================== */}

//                       <div className="px-2.5 py-2 mb-1">

//                         <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
//                           Set your status
//                         </p>

//                       </div>

//                       {/* =================================================
//                           BREAK COUNTER
//                       ================================================== */}

//                       <div
//                         className={`mx-1 mb-2 rounded-xl border px-3 py-2.5 ${
//                           breakLimitReached
//                             ? "bg-red-50 border-red-200"
//                             : "bg-slate-50 border-slate-200"
//                         }`}
//                       >

//                         <div className="flex items-center justify-between">

//                           <span
//                             className={`text-[11px] font-extrabold ${
//                               breakLimitReached
//                                 ? "text-red-700"
//                                 : "text-slate-700"
//                             }`}
//                           >
//                             Breaks
//                           </span>

//                           <span
//                             className={`text-[11px] font-black ${
//                               breakLimitReached
//                                 ? "text-red-600"
//                                 : "text-slate-700"
//                             }`}
//                           >
//                             {breakCount} /{" "}
//                             {MAX_BREAKS}
//                           </span>

//                         </div>

//                         <div className="mt-1">

//                           <span
//                             className={`text-[10px] font-medium ${
//                               breakLimitReached
//                                 ? "text-red-600"
//                                 : "text-slate-500"
//                             }`}
//                           >
//                             {breakLimitReached
//                               ? "5 breaks used in the last 24 hours"
//                               : `${remainingBreaks} break${
//                                   remainingBreaks ===
//                                   1
//                                     ? ""
//                                     : "s"
//                                 } remaining`}
//                           </span>

//                         </div>

//                       </div>

//                       {/* =================================================
//                           OPTIONS
//                       ================================================== */}

//                       {visibleStatusOptions.map(
//                         (option) => {
//                           const Icon =
//                             option.icon;

//                           const optionBreakDisabled =
//                             option.isBreak &&
//                             breakLimitReached;

//                           const isDisabled =
//                             option.disabled ||
//                             optionBreakDisabled;

//                           return (
//                             <button
//                               key={
//                                 option.value
//                               }
//                               type="button"
//                               disabled={
//                                 isDisabled
//                               }
//                               onClick={() => {
//                                 if (
//                                   isDisabled
//                                 ) {
//                                   return;
//                                 }

//                                 handleStatusChange(
//                                   option.value
//                                 );
//                               }}
//                               className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition ${
//                                 isDisabled
//                                   ? "opacity-50 cursor-not-allowed"
//                                   : "hover:bg-gray-50 cursor-pointer"
//                               }`}
//                             >

//                               {/* ICON */}

//                               <div
//                                 className={`w-8 h-8 rounded-lg ${option.bg} flex items-center justify-center`}
//                               >
//                                 <Icon
//                                   className={`w-4 h-4 ${option.color}`}
//                                 />
//                               </div>

//                               {/* LABEL */}

//                               <span
//                                 className={`text-sm font-medium ${
//                                   optionBreakDisabled
//                                     ? "text-slate-400"
//                                     : "text-gray-700"
//                                 }`}
//                               >
//                                 {
//                                   option.label
//                                 }
//                               </span>

//                               {/* AUTO */}

//                               {option.disabled && (
//                                 <span className="ml-auto text-[10px] text-gray-400 font-medium">
//                                   Auto
//                                 </span>
//                               )}

//                               {/* BREAK LIMIT */}

//                               {optionBreakDisabled && (
//                                 <span className="ml-auto text-[10px] text-red-400 font-semibold">
//                                   Limit
//                                 </span>
//                               )}

//                             </button>
//                           );
//                         }
//                       )}

//                     </div>
//                   )}

//                 </div>
//               )}

//             </div>

//             {/* PROFILE ARROW */}

//             <button
//               type="button"
//               onClick={() =>
//                 setStatusOpen(
//                   (prev) =>
//                     !prev
//                 )
//               }
//               className="hidden md:flex items-center justify-center"
//             >
//               <ChevronDown
//                 size={15}
//                 className={`text-slate-400 transition-transform ${
//                   statusOpen
//                     ? "rotate-180"
//                     : ""
//                 }`}
//               />
//             </button>

//           </div>
//         </div>
//       </div>

//       {/* ======================================================
//           LOCKED STATUS TIMER
//       ======================================================= */}

//       {timerOpen &&
//         timerStatus &&
//         timerStatus !== "Active" &&
//         typeof document !==
//           "undefined" &&
//         createPortal(
//           <div
//             className="fixed inset-0 z-[2147483647] flex min-h-screen w-screen items-center justify-center p-4"
//             style={{
//               position: "fixed",
//               inset: 0,
//               width: "100vw",
//               height: "100vh",
//               pointerEvents: "auto",
//             }}
//             role="dialog"
//             aria-modal="true"
//             aria-labelledby="status-timer-title"
//           >

//             {/* BACKDROP */}

//             <div
//               className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
//               style={{
//                 pointerEvents:
//                   "auto",
//               }}
//               onMouseDown={(e) => {
//                 e.preventDefault();
//                 e.stopPropagation();
//               }}
//               onClick={(e) => {
//                 e.preventDefault();
//                 e.stopPropagation();
//               }}
//               onContextMenu={(e) => {
//                 e.preventDefault();
//                 e.stopPropagation();
//               }}
//             />

//             {/* TIMER CARD */}

//             <div
//               className="relative z-[2147483647] w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.45)]"
//               style={{
//                 pointerEvents:
//                   "auto",
//               }}
//               onMouseDown={(e) => {
//                 e.stopPropagation();
//               }}
//               onClick={(e) => {
//                 e.stopPropagation();
//               }}
//             >

//               {/* TOP ACCENT */}

//               <div
//                 className={`h-1.5 w-full ${timerOption.dot}`}
//               />

//               {/* CONTENT */}

//               <div className="px-5 py-7 sm:px-8 sm:py-8">

//                 {/* HEADER */}

//                 <div className="flex items-start justify-between gap-4">

//                   <div className="min-w-0 text-left">

//                     <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
//                       Current Status
//                     </p>

//                     <h2
//                       id="status-timer-title"
//                       className={`mt-1.5 truncate text-xl font-black sm:text-2xl ${timerOption.color}`}
//                     >
//                       {
//                         timerStatus
//                       }
//                     </h2>

//                   </div>

//                   {/* BREAK BADGE */}

//                   <div className="flex shrink-0 items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1.5">

//                     <span className="relative flex h-2.5 w-2.5">

//                       <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />

//                       <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />

//                     </span>

//                     <span className="text-[10px] font-extrabold tracking-wide text-red-700">
//                       Break
//                     </span>

//                   </div>
//                 </div>

//                 {/* MAIN TIMER */}

//                 <div className="relative mt-7 overflow-hidden rounded-[24px] border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-100 px-5 py-8 text-center shadow-sm">

//                   <div
//                     className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full ${timerOption.bg} opacity-70 blur-2xl`}
//                   />

//                   <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-slate-200/50 blur-2xl" />

//                   {/* ICON */}

//                   <div
//                     className={`relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${timerOption.bg} ${timerOption.color} shadow-sm ring-1 ring-black/5`}
//                   >
//                     <TimerIcon
//                       size={30}
//                       strokeWidth={2}
//                     />
//                   </div>

//                   {/* LABEL */}

//                   <p className="relative mt-5 text-[10px] font-extrabold uppercase tracking-[0.25em] text-slate-400">
//                     Time Elapsed
//                   </p>

//                   {/* TIMER */}

//                   <div className="relative mt-2 font-mono text-5xl font-black tracking-[-0.04em] text-slate-900 tabular-nums sm:text-6xl">
//                     {formatTimer(
//                       timerSeconds
//                     )}
//                   </div>

//                   {/* DESCRIPTION */}

//                   <p className="relative mt-3 text-xs font-medium text-slate-500 sm:text-sm">
//                     Your status timer is currently running
//                   </p>

//                 </div>

//                 {/* STATUS INFORMATION */}

//                 <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">

//                   <div className="flex items-center gap-3">

//                     <div
//                       className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${timerOption.bg} ${timerOption.color}`}
//                     >
//                       <TimerIcon
//                         size={18}
//                         strokeWidth={2}
//                       />
//                     </div>

//                     <div className="min-w-0 text-left">

//                       <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-slate-400">
//                         Status
//                       </p>

//                       <p className="mt-0.5 truncate text-sm font-bold text-slate-800">
//                         {
//                           timerStatus
//                         }
//                       </p>

//                     </div>

//                     <div className="ml-auto h-9 w-px bg-slate-200" />

//                     <div className="text-right">

//                       <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-slate-400">
//                         Duration
//                       </p>

//                       <p className="mt-0.5 font-mono text-sm font-bold text-slate-800 tabular-nums">
//                         {formatTimer(
//                           timerSeconds
//                         )}
//                       </p>

//                     </div>

//                   </div>
//                 </div>

//                 {/* LOCKED MESSAGE */}

//                 <div className="mt-5 flex items-center justify-center gap-2">

//                   <span className="relative flex h-2.5 w-2.5">

//                     <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ec3737] opacity-60" />

//                     <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#ec3737]" />

//                   </span>

//                   <p className="text-xs font-medium text-slate-500">
//                     Your status is currently{" "}
//                     {timerStatus}
//                   </p>

//                 </div>

//                 {/* RETURN ACTIVE */}

//                 <button
//                   type="button"
//                   disabled={
//                     statusUpdating
//                   }
//                   onClick={(e) => {
//                     e.preventDefault();
//                     e.stopPropagation();

//                     endStatusTimer();
//                   }}
//                   className="group mt-6 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#790214] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-[#790214]/20 transition-all duration-200 hover:bg-[#650111] hover:shadow-xl hover:shadow-[#790214]/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
//                 >

//                   {statusUpdating ? (
//                     <>
//                       <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

//                       <span>
//                         Updating...
//                       </span>
//                     </>
//                   ) : (
//                     <>
//                       <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 transition-colors group-hover:bg-white/20">

//                         <Check
//                           size={16}
//                           strokeWidth={
//                             2.5
//                           }
//                         />

//                       </span>

//                       <span>
//                         Return to Active
//                       </span>
//                     </>
//                   )}

//                 </button>

//                 {/* FOOTER */}

//                 <div className="mt-4 flex items-center justify-center gap-1.5">

//                   <Clock3
//                     size={12}
//                     className="text-slate-400"
//                   />

//                   <p className="text-[10px] font-medium text-slate-400">
//                     Your status duration is automatically recorded.
//                   </p>

//                 </div>

//               </div>
//             </div>
//           </div>,
//           document.body
//         )}
//     </>
//   );
// }




















"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import {
  Calendar,
  ChevronDown,
  User,
  Check,
  Circle,
  Phone,
  Moon,
  Utensils,
  CircleOff,
  MoreHorizontal,
  Clock3,
  BriefcaseBusiness,

  // ============================================================
  // NOTIFICATION ICONS
  // ============================================================
  Bell,
  X,
  CheckCheck,
  MessageSquare,
  Info,
  AlertCircle,
} from "lucide-react";

export default function DashboardTopBar() {
  // ============================================================
  // CURRENT USER
  // ============================================================

  const [currentUser, setCurrentUser] = useState({
    id: null,
    name: "",
    email: "",
    role: "",
    avatar: null,
  });

  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // ============================================================
  // USER STATUS
  // ============================================================

  const [userStatus, setUserStatus] = useState("Active");
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const statusRef = useRef(null);

  // ============================================================
  // BREAK LIMIT
  // ============================================================

  const MAX_BREAKS = 5;

  const [breakCount, setBreakCount] = useState(0);

  const remainingBreaks = Math.max(
    0,
    MAX_BREAKS - breakCount
  );

  const breakLimitReached =
    breakCount >= MAX_BREAKS;

  // ============================================================
  // TIMER MODAL
  // ============================================================

  const [timerOpen, setTimerOpen] = useState(false);
  const [timerStatus, setTimerStatus] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // ============================================================
  // DATABASE STATUS START TIME
  // ============================================================

  const [statusStartedAt, setStatusStartedAt] =
    useState(null);

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [notificationModal, setNotificationModal] =
    useState(null);

  const [notificationsLoading, setNotificationsLoading] =
    useState(false);

  const notificationRef = useRef(null);

  const notificationInitializedRef =
    useRef(false);

  const seenNotificationIdsRef =
    useRef(new Set());

  // ============================================================
  // OFFICE CLOSING WARNING
  // ============================================================

  // Office closing time — California time
  const OFFICE_CLOSE_HOUR = 17; // 5:00 PM
  const OFFICE_CLOSE_MINUTE = 0;
  const OFFICE_WARNING_MINUTES = 5;

  const officeClosingShownRef = useRef(false);

  const getOfficeClosingKey = () => {
    const dateKey = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    return `office_closing_warning_${dateKey}`;
  };

  // ============================================================
  // LOGIN DETAILS — CALIFORNIA TIME
  // ============================================================

  const [loginDetails] = useState(() => {
    const now = new Date();

    const timeZone =
      "America/Los_Angeles";

    return {
      day: now.toLocaleDateString(
        "en-US",
        {
          weekday: "long",
          timeZone,
        }
      ),

      date: now.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone,
        }
      ),

      time: now.toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZone,
        }
      ),
    };
  });

  // ============================================================
  // STATUS OPTIONS
  // ============================================================

  const statusOptions = [
    // ==========================================================
    // ACTIVE
    // ==========================================================

    {
      value: "Active",
      label: "Active",
      icon: Circle,
      color: "text-emerald-600",
      dot: "bg-emerald-500",
      bg: "bg-emerald-50",
      isBreak: false,
      adminOnly: false,
    },

    // ==========================================================
    // NAMAZ BREAK
    // ==========================================================

    {
      value: "Namaz Break",
      label: "Namaz Break",
      icon: Moon,
      color: "text-indigo-600",
      dot: "bg-indigo-500",
      bg: "bg-indigo-50",
      isBreak: true,
      adminOnly: false,
    },

    // ==========================================================
    // LUNCH BREAK
    // ==========================================================

    {
      value: "Lunch Break",
      label: "Lunch Break",
      icon: Utensils,
      color: "text-orange-600",
      dot: "bg-orange-500",
      bg: "bg-orange-50",
      isBreak: true,
      adminOnly: false,
    },

    // ==========================================================
    // SHORT BREAK
    // ==========================================================

    {
      value: "Short Break",
      label: "Short Break",
      icon: Clock3,
      color: "text-teal-600",
      dot: "bg-teal-500",
      bg: "bg-teal-50",
      isBreak: true,
      adminOnly: false,
    },

    // ==========================================================
    // INACTIVE — ADMIN ONLY
    // ==========================================================

    {
      value: "Inactive",
      label: "Inactive",
      icon: CircleOff,
      color: "text-slate-500",
      dot: "bg-slate-400",
      bg: "bg-slate-100",
      disabled: true,
      adminOnly: true,
      isBreak: false,
    },

    // ==========================================================
    // ON CALL — ADMIN ONLY
    // ==========================================================

    {
      value: "On Call",
      label: "On Call",
      icon: Phone,
      color: "text-blue-600",
      dot: "bg-blue-500",
      bg: "bg-blue-50",
      disabled: true,
      adminOnly: true,
      isBreak: false,
    },

    // ==========================================================
    // MEETING — ADMIN ONLY
    // ==========================================================

    {
      value: "Meeting",
      label: "Meeting",
      icon: BriefcaseBusiness,
      color: "text-cyan-600",
      dot: "bg-cyan-500",
      bg: "bg-cyan-50",
      disabled: true,
      adminOnly: true,
      isBreak: false,
    },

    // ==========================================================
    // OTHER — ADMIN ONLY
    // ==========================================================

    {
      value: "Other",
      label: "Other",
      icon: MoreHorizontal,
      color: "text-purple-600",
      dot: "bg-purple-500",
      bg: "bg-purple-50",
      disabled: true,
      adminOnly: true,
      isBreak: false,
    },
  ];

  // ============================================================
  // ADMIN
  // ============================================================

  const isAdmin =
    currentUser.role?.toLowerCase() ===
    "admin";

  // ============================================================
  // VISIBLE STATUS OPTIONS
  // ============================================================

  const visibleStatusOptions =
    statusOptions.filter((option) => {
      if (
        option.adminOnly &&
        !isAdmin
      ) {
        return false;
      }

      return true;
    });

  // ============================================================
  // SELECTED STATUS
  // ============================================================

  const selectedStatus =
    statusOptions.find(
      (status) =>
        status.value === userStatus
    ) || statusOptions[0];

  // ============================================================
  // FORMAT TIMER
  // ============================================================

  const formatTimer = (seconds) => {
    const safeSeconds = Math.max(
      0,
      Number(seconds) || 0
    );

    const hrs = Math.floor(
      safeSeconds / 3600
    );

    const mins = Math.floor(
      (safeSeconds % 3600) / 60
    );

    const secs =
      safeSeconds % 60;

    return [
      hrs
        .toString()
        .padStart(2, "0"),

      mins
        .toString()
        .padStart(2, "0"),

      secs
        .toString()
        .padStart(2, "0"),
    ].join(":");
  };

  // ============================================================
  // CALCULATE ELAPSED TIME
  // ============================================================

  const calculateElapsedTime = (
    startedAt
  ) => {
    if (!startedAt) {
      return 0;
    }

    const startTime =
      new Date(
        startedAt
      ).getTime();

    if (
      Number.isNaN(startTime)
    ) {
      return 0;
    }

    const elapsed =
      Math.floor(
        (Date.now() -
          startTime) /
          1000
      );

    return Math.max(
      0,
      elapsed
    );
  };

  // ============================================================
  // NOTIFICATION TIME
  // ============================================================

  const formatNotificationTime = (
    value
  ) => {
    if (!value) {
      return "";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    return date.toLocaleString(
      "en-US",
      {
        timeZone:
          "America/Los_Angeles",

        month: "short",

        day: "numeric",

        hour: "numeric",

        minute: "2-digit",
      }
    );
  };

  // ============================================================
  // NOTIFICATION ICON
  // ============================================================

  const getNotificationIcon = (
    type
  ) => {
    switch (
      String(type || "")
        .toLowerCase()
    ) {
      case "message":
        return MessageSquare;

      case "warning":
        return AlertCircle;

      case "success":
        return Check;

      default:
        return Info;
    }
  };

  // ============================================================
  // MARK SINGLE NOTIFICATION READ
  // ============================================================

  const markNotificationRead =
    async (notificationId) => {
      try {
        const res =
          await fetch(
            `/api/notifications/${notificationId}/read`,
            {
              method: "PUT",

              credentials:
                "include",
            }
          );

        if (!res.ok) {
          return;
        }

        setNotifications(
          (previous) =>
            previous.map(
              (item) =>
                Number(item.id) ===
                Number(
                  notificationId
                )
                  ? {
                      ...item,
                      is_read: 1,
                    }
                  : item
            )
        );

        setUnreadCount(
          (previous) =>
            Math.max(
              0,
              previous - 1
            )
        );
      } catch (error) {
        console.error(
          "Mark notification read error:",
          error
        );
      }
    };

  // ============================================================
  // MARK ALL NOTIFICATIONS READ
  // ============================================================

  const markAllNotificationsRead =
    async () => {
      try {
        const res =
          await fetch(
            "/api/notifications/read-all",
            {
              method: "PUT",
              credentials:
                "include",
            }
          );

        if (!res.ok) {
          return;
        }

        setNotifications(
          (previous) =>
            previous.map(
              (item) => ({
                ...item,
                is_read: 1,
              })
            )
        );

        setUnreadCount(0);
      } catch (error) {
        console.error(
          "Mark all notifications error:",
          error
        );
      }
    };

  // ============================================================
  // FETCH NOTIFICATIONS
  // ============================================================

  const fetchNotifications =
    async () => {
      try {
        setNotificationsLoading(
          true
        );

        const res =
          await fetch(
            `/api/notifications?limit=30&_live=${Date.now()}`,
            {
              method: "GET",

              credentials:
                "include",

              cache: "no-store",

              headers: {
                "Cache-Control":
                  "no-cache",
              },
            }
          );

        if (!res.ok) {
          return;
        }

        const data =
          await res.json();

        if (!data?.success) {
          return;
        }

        const list =
          Array.isArray(
            data.notifications
          )
            ? data.notifications
            : [];

        setNotifications(list);

        setUnreadCount(
          Number(
            data.unread_count ||
              0
          )
        );

        // ======================================================
        // FIRST LOAD
        // ======================================================

        if (
          !notificationInitializedRef.current
        ) {
          list.forEach(
            (item) => {
              seenNotificationIdsRef.current.add(
                Number(
                  item.id
                )
              );
            }
          );

          notificationInitializedRef.current =
            true;

          return;
        }

        // ======================================================
        // FIND NEW UNREAD NOTIFICATION
        // ======================================================

        const newNotification =
          list.find(
            (item) => {
              const id =
                Number(
                  item.id
                );

              const alreadySeen =
                seenNotificationIdsRef.current.has(
                  id
                );

              const unread =
                Number(
                  item.is_read
                ) === 0;

              return (
                !alreadySeen &&
                unread
              );
            }
          );

        // ======================================================
        // SAVE SEEN IDS
        // ======================================================

        list.forEach(
          (item) => {
            seenNotificationIdsRef.current.add(
              Number(
                item.id
              )
            );
          }
        );

        // ======================================================
        // OPEN MODAL FOR NEW NOTIFICATION
        // ======================================================

        if (
          newNotification
        ) {
          setNotificationModal(
            newNotification
          );

          await markNotificationRead(
            newNotification.id
          );
        }
      } catch (error) {
        console.error(
          "Notification fetch error:",
          error
        );
      } finally {
        setNotificationsLoading(
          false
        );
      }
    };

  // ============================================================
  // CHECK OFFICE CLOSING TIME
  // ============================================================

  const checkOfficeClosingTime = () => {
    try {
      const now = new Date();

      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Los_Angeles",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).formatToParts(now);

      const getPart = (type) =>
        Number(
          parts.find((part) => part.type === type)?.value || 0
        );

      let currentHour = getPart("hour");
      const currentMinute = getPart("minute");

      if (currentHour === 24) {
        currentHour = 0;
      }

      const currentTotalMinutes =
        currentHour * 60 + currentMinute;

      const officeCloseTotalMinutes =
        OFFICE_CLOSE_HOUR * 60 + OFFICE_CLOSE_MINUTE;

      const warningStart =
        officeCloseTotalMinutes - OFFICE_WARNING_MINUTES;

      // Show only during the 5-minute warning window.
      const shouldShow =
        currentTotalMinutes >= warningStart &&
        currentTotalMinutes < officeCloseTotalMinutes;

      if (!shouldShow) {
        return;
      }

      const storageKey = getOfficeClosingKey();

      // Do not show this warning more than once per day.
      if (
        typeof window !== "undefined" &&
        localStorage.getItem(storageKey) === "1"
      ) {
        return;
      }

      if (officeClosingShownRef.current) {
        return;
      }

      officeClosingShownRef.current = true;

      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, "1");
      }

      // Use the existing notification modal/UI.
      setNotificationModal({
        id: `office-closing-${storageKey}`,
        title: "Office Closing Soon",
        message: "Office time will end in 5 minutes.",
        type: "warning",
        is_read: 1,
        created_at: new Date().toISOString(),
        isOfficeClosing: true,
      });
    } catch (error) {
      console.error("Office closing check error:", error);
    }
  };

  // ============================================================
  // LOAD CURRENT USER + STATUS
  // ============================================================

  useEffect(() => {
    let mounted = true;

    async function fetchUserData() {
      try {
        // ======================================================
        // CURRENT USER
        // ======================================================

        const res =
          await fetch(
            "/api/auth/me",
            {
              cache: "no-store",
              credentials:
                "include",
            }
          );

        const data =
          await res.json();

        const userObj =
          data.user ||
          data.data ||
          data;

        if (
          data.success ||
          userObj
        ) {
          const avatarUrl =
            userObj.avatar ||
            userObj.image ||
            userObj.profilePic ||
            userObj.avatarUrl ||
            userObj.profile_picture ||
            null;

          const userName =
            userObj.name ||
            userObj.username ||
            userObj.fullName ||
            "";

          if (!mounted) {
            return;
          }

          setCurrentUser({
            id:
              userObj.id ||
              null,

            name:
              userName,

            email:
              userObj.email ||
              "",

            role:
              userObj.role ||
              "user",

            avatar:
              avatarUrl,
          });
        }

        // ======================================================
        // CURRENT STATUS
        // ======================================================

        const statusRes =
          await fetch(
            "/api/users/status",
            {
              cache: "no-store",
              credentials:
                "include",
            }
          );

        const statusData =
          await statusRes.json();

        if (
          !statusRes.ok ||
          !statusData.success
        ) {
          throw new Error(
            statusData.message ||
              "Failed to load status"
          );
        }

        // ======================================================
        // BREAK COUNT
        // ======================================================

        const apiBreakCount =
          Number(
            statusData.break_count ??
              0
          );

        if (mounted) {
          setBreakCount(
            Math.max(
              0,
              apiBreakCount
            )
          );
        }

        // ======================================================
        // STATUS
        // ======================================================

        const dbStatus =
          statusData.status ||
          statusData.user
            ?.availability_status ||
          "Active";

        // ======================================================
        // START TIME
        // ======================================================

        const dbStartedAt =
          statusData.status_started_at ??
          statusData.user
            ?.status_started_at ??
          null;

        if (!mounted) {
          return;
        }

        setUserStatus(
          dbStatus
        );

        setStatusStartedAt(
          dbStartedAt
        );

        // ======================================================
        // RESTORE TIMER
        // ======================================================

        if (
          dbStatus !==
            "Active" &&
          dbStartedAt
        ) {
          const elapsed =
            calculateElapsedTime(
              dbStartedAt
            );

          setTimerStatus(
            dbStatus
          );

          setTimerSeconds(
            elapsed
          );

          setTimerOpen(
            true
          );
        } else {
          setTimerStatus(
            null
          );

          setTimerSeconds(
            0
          );

          setTimerOpen(
            false
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch user/status:",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchUserData();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================================
  // NOTIFICATION POLLING
  // ============================================================

  useEffect(() => {
    if (!currentUser.id) {
      return;
    }

    // Load existing notifications.
    fetchNotifications();

    // Check office closing warning immediately.
    checkOfficeClosingTime();

    // Continue checking every 15 seconds.
    const interval = setInterval(() => {
      fetchNotifications();
      checkOfficeClosingTime();
    }, 15000);

    return () => {
      clearInterval(interval);
    };
  }, [currentUser.id]);

  // ============================================================
  // TIMER TICK
  // ============================================================

  useEffect(() => {
    if (
      !timerOpen ||
      !timerStatus ||
      !statusStartedAt
    ) {
      return;
    }

    const updateTimer =
      () => {
        const startedTime =
          new Date(
            statusStartedAt
          ).getTime();

        if (
          Number.isNaN(
            startedTime
          )
        ) {
          setTimerSeconds(
            0
          );

          return;
        }

        const elapsed =
          Math.max(
            0,
            Math.floor(
              (Date.now() -
                startedTime) /
                1000
            )
          );

        setTimerSeconds(
          elapsed
        );
      };

    updateTimer();

    const interval =
      setInterval(
        updateTimer,
        1000
      );

    return () => {
      clearInterval(
        interval
      );
    };
  }, [
    timerOpen,
    timerStatus,
    statusStartedAt,
  ]);

  // ============================================================
  // CLOSE DROPDOWNS OUTSIDE
  // ============================================================

  useEffect(() => {
    function handleClickOutside(
      event
    ) {
      if (
        statusRef.current &&
        !statusRef.current.contains(
          event.target
        )
      ) {
        setStatusOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setNotificationOpen(
          false
        );
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ============================================================
  // CHANGE STATUS
  // ============================================================

  const handleStatusChange =
    async (
      newStatus
    ) => {
      if (
        statusUpdating
      ) {
        return;
      }

      const selectedOption =
        statusOptions.find(
          (option) =>
            option.value ===
            newStatus
        );

      // ========================================================
      // SAFETY CHECK
      // ========================================================

      if (!selectedOption) {
        return;
      }

      // ========================================================
      // ADMIN ONLY CHECK
      // ========================================================

      if (
        selectedOption.adminOnly &&
        !isAdmin
      ) {
        return;
      }

      // ========================================================
      // DISABLED CHECK
      // ========================================================

      if (
        selectedOption.disabled
      ) {
        return;
      }

      // ========================================================
      // BREAK LIMIT FRONTEND CHECK
      // ========================================================

      if (
        selectedOption.isBreak &&
        breakLimitReached
      ) {
        alert(
          "Break limit reached. You can take maximum 5 breaks within 24 hours."
        );

        setStatusOpen(
          false
        );

        return;
      }

      const oldStatus =
        userStatus;

      const oldStartedAt =
        statusStartedAt;

      setStatusOpen(
        false
      );

      // ==========================================================
      // ACTIVE
      // ==========================================================

      if (
        newStatus ===
        "Active"
      ) {
        try {
          setStatusUpdating(
            true
          );

          const res =
            await fetch(
              "/api/users/status",
              {
                method:
                  "PUT",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                credentials:
                  "include",

                body: JSON.stringify(
                  {
                    status:
                      "Active",
                  }
                ),
              }
            );

          const data =
            await res.json();

          if (
            !res.ok ||
            !data.success
          ) {
            throw new Error(
              data.message ||
                "Failed to update status"
            );
          }

          // ======================================================
          // UPDATE BREAK COUNT
          // ======================================================

          if (
            data.break_count !==
            undefined
          ) {
            setBreakCount(
              Number(
                data.break_count
              )
            );
          }

          // ======================================================
          // UPDATE STATUS
          // ======================================================

          setUserStatus(
            "Active"
          );

          setStatusStartedAt(
            null
          );

          setTimerOpen(
            false
          );

          setTimerStatus(
            null
          );

          setTimerSeconds(
            0
          );
        } catch (error) {
          console.error(
            "Status update error:",
            error
          );

          setUserStatus(
            oldStatus
          );

          setStatusStartedAt(
            oldStartedAt
          );

          alert(
            error?.message ||
              "Status update nahi ho saka."
          );
        } finally {
          setStatusUpdating(
            false
          );
        }

        return;
      }

      // ==========================================================
      // NON ACTIVE STATUS
      // ==========================================================

      try {
        setStatusUpdating(
          true
        );

        const res =
          await fetch(
            "/api/users/status",
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials:
                "include",

              body: JSON.stringify(
                {
                  status:
                    newStatus,
                }
              ),
            }
          );

        const data =
          await res.json();

        // ========================================================
        // 429 = 5 BREAK LIMIT
        // ========================================================

        if (
          res.status ===
            429 ||
          data?.error ===
            "MAX_BREAKS_REACHED"
        ) {
          if (
            data?.break_count !==
            undefined
          ) {
            setBreakCount(
              Number(
                data.break_count
              )
            );
          }

          alert(
            data?.message ||
              "Break limit reached. You can take maximum 5 breaks within 24 hours."
          );

          return;
        }

        if (
          !res.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to update status"
          );
        }

        // ========================================================
        // UPDATE BREAK COUNT
        // ========================================================

        if (
          data.break_count !==
          undefined
        ) {
          setBreakCount(
            Number(
              data.break_count
            )
          );
        }

        // ========================================================
        // DATABASE START TIME
        // ========================================================

        const dbStartedAt =
          data.status_started_at ??
          data.user
            ?.status_started_at ??
          null;

        // ========================================================
        // UPDATE STATUS
        // ========================================================

        setUserStatus(
          newStatus
        );

        setStatusStartedAt(
          dbStartedAt
        );

        setTimerStatus(
          newStatus
        );

        // ========================================================
        // CALCULATE TIMER
        // ========================================================

        const elapsed =
          calculateElapsedTime(
            dbStartedAt
          );

        setTimerSeconds(
          elapsed
        );

        setTimerOpen(
          true
        );
      } catch (error) {
        console.error(
          "Status update error:",
          error
        );

        setUserStatus(
          oldStatus
        );

        setStatusStartedAt(
          oldStartedAt
        );

        alert(
          error?.message ||
            "Status update nahi ho saka."
        );
      } finally {
        setStatusUpdating(
          false
        );
      }
    };

  // ============================================================
  // END STATUS / RETURN ACTIVE
  // ============================================================

  const endStatusTimer =
    async () => {
      if (
        statusUpdating
      ) {
        return;
      }

      const oldStatus =
        userStatus;

      const oldStartedAt =
        statusStartedAt;

      try {
        setStatusUpdating(
          true
        );

        const res =
          await fetch(
            "/api/users/status",
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials:
                "include",

              body: JSON.stringify(
                {
                  status:
                    "Active",
                }
              ),
            }
          );

        const data =
          await res.json();

        if (
          !res.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to activate user"
          );
        }

        // ========================================================
        // UPDATE BREAK COUNT
        // ========================================================

        if (
          data.break_count !==
          undefined
        ) {
          setBreakCount(
            Number(
              data.break_count
            )
          );
        }

        // ========================================================
        // RESET STATUS
        // ========================================================

        setUserStatus(
          "Active"
        );

        setStatusStartedAt(
          null
        );

        setTimerOpen(
          false
        );

        setTimerStatus(
          null
        );

        setTimerSeconds(
          0
        );
      } catch (error) {
        console.error(
          "End status error:",
          error
        );

        setUserStatus(
          oldStatus
        );

        setStatusStartedAt(
          oldStartedAt
        );

        alert(
          error?.message ||
            "Status change nahi ho saka."
        );
      } finally {
        setStatusUpdating(
          false
        );
      }
    };

  // ============================================================
  // INITIAL
  // ============================================================

  const userInitial =
    currentUser.name
      ? currentUser.name
          .trim()
          .charAt(0)
          .toUpperCase()
      : "";

  // ============================================================
  // TIMER ICON
  // ============================================================

  const TimerIcon =
    statusOptions.find(
      (item) =>
        item.value ===
        timerStatus
    )?.icon || Clock3;

  const timerOption =
    statusOptions.find(
      (item) =>
        item.value ===
        timerStatus
    ) ||
    statusOptions[0];

  // ============================================================
  // UI
  // ============================================================

  return (
    <>
      {/* ======================================================
          TOP BAR
      ======================================================= */}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">

        {/* ====================================================
            LEFT
        ===================================================== */}

        <div>
          <div className="flex items-center gap-3">

            <div className="h-8 w-1 rounded-full bg-[#ec3737]" />

            <div className="flex items-center gap-2.5">

              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                Dashboard
              </h1>

              {!loading &&
                currentUser.id && (
                  <span className="inline-flex items-center gap-2 rounded-xl border border-[#ec3737]/20 bg-[#ec3737]/5 px-3 py-1.5 shadow-sm">

                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#ec3737] text-[9px] font-black uppercase text-white shadow-sm">
                      ID
                    </span>

                    <span className="text-sm font-extrabold tracking-tight text-[#ec3737]">
                      {currentUser.id}
                    </span>

                  </span>
                )}

            </div>
          </div>

          <p className="mt-1.5 ml-4 text-xs font-medium text-slate-500">
            Call Activity & Performance Analytics
          </p>
        </div>

        {/* ====================================================
            RIGHT
        ===================================================== */}

        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">

          {/* ==================================================
              NOTIFICATIONS
          =================================================== */}

          <div
            ref={
              notificationRef
            }
            className="relative shrink-0"
          >

            {/* BELL BUTTON */}

            <button
              type="button"
              onClick={() =>
                setNotificationOpen(
                  (prev) =>
                    !prev
                )
              }
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:border-[#741C29]/20 hover:bg-[#741C29]/5 hover:text-[#741C29] active:scale-95"
              aria-label="Notifications"
            >

              <Bell
                size={18}
                strokeWidth={2}
              />

              {/* UNREAD BADGE */}

              {unreadCount >
                0 && (
                <span className="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-[#ec3737] px-1 text-[9px] font-black leading-none text-white shadow-sm">
                  {unreadCount >
                  99
                    ? "99+"
                    : unreadCount}
                </span>
              )}

            </button>

            {/* ==================================================
                NOTIFICATION DROPDOWN
            =================================================== */}

            {notificationOpen && (
              <div className="absolute right-0 top-[calc(100%+10px)] z-[100] w-[350px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                {/* HEADER */}

                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">

                  <div className="flex items-center gap-2">

                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#741C29]/10">

                      <Bell
                        size={14}
                        className="text-[#741C29]"
                      />

                    </div>

                    <div>

                      <p className="text-sm font-extrabold text-slate-900">
                        Notifications
                      </p>

                      <p className="text-[9px] font-medium text-slate-400">
                        {unreadCount >
                        0
                          ? `${unreadCount} unread`
                          : "You're all caught up"}
                      </p>

                    </div>

                  </div>

                  {unreadCount >
                    0 && (
                    <button
                      type="button"
                      onClick={
                        markAllNotificationsRead
                      }
                      className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-bold text-[#741C29] transition hover:bg-[#741C29]/5"
                    >

                      <CheckCheck
                        size={13}
                      />

                      Mark all

                    </button>
                  )}

                </div>

                {/* NOTIFICATION LIST */}

                <div className="max-h-[380px] overflow-y-auto">

                  {notificationsLoading &&
                  notifications.length ===
                    0 ? (

                    <div className="flex flex-col items-center justify-center py-10">

                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-[#741C29]" />

                      <p className="mt-3 text-[10px] font-medium text-slate-400">
                        Loading notifications...
                      </p>

                    </div>

                  ) : notifications.length ===
                    0 ? (

                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">

                        <Bell
                          size={20}
                          className="text-slate-400"
                        />

                      </div>

                      <p className="mt-3 text-sm font-bold text-slate-700">
                        No notifications
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        New messages and alerts
                        will appear here.
                      </p>

                    </div>

                  ) : (

                    notifications.map(
                      (
                        notification
                      ) => {

                        const Icon =
                          getNotificationIcon(
                            notification.type
                          );

                        const isUnread =
                          Number(
                            notification.is_read
                          ) ===
                          0;

                        return (
                          <button
                            key={
                              notification.id
                            }
                            type="button"
                            onClick={() => {

                              setNotificationModal(
                                notification
                              );

                              setNotificationOpen(
                                false
                              );

                              if (
                                isUnread
                              ) {
                                markNotificationRead(
                                  notification.id
                                );
                              }

                            }}
                            className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                              isUnread
                                ? "bg-[#741C29]/[0.025]"
                                : "bg-white"
                            }`}
                          >

                            {/* ICON */}

                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#741C29]/10">

                              <Icon
                                size={16}
                                className="text-[#741C29]"
                              />

                            </div>

                            {/* CONTENT */}

                            <div className="min-w-0 flex-1">

                              <div className="flex items-start justify-between gap-2">

                                <p
                                  className={`text-xs ${
                                    isUnread
                                      ? "font-extrabold text-slate-900"
                                      : "font-semibold text-slate-700"
                                  }`}
                                >
                                  {
                                    notification.title
                                  }
                                </p>

                                {isUnread && (
                                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#ec3737]" />
                                )}

                              </div>

                              <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">
                                {
                                  notification.message
                                }
                              </p>

                              <p className="mt-1.5 text-[9px] font-medium text-slate-400">
                                {formatNotificationTime(
                                  notification.created_at
                                )}
                              </p>

                            </div>

                          </button>
                        );
                      }
                    )

                  )}

                </div>

                {/* FOOTER */}

                {notifications.length >
                  0 && (
                  <div className="border-t border-slate-100 bg-slate-50 px-4 py-2">

                    <p className="text-center text-[9px] font-medium text-slate-400">
                      Auto refresh every 15 seconds
                    </p>

                  </div>
                )}

              </div>
            )}

          </div>

          {/* ==================================================
              LOGIN BADGE
          =================================================== */}

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700 font-medium shadow-sm">

            <Calendar
              size={14}
              className="text-blue-600 shrink-0"
            />

            <span>
              Logged in:{" "}
              <strong>
                {loginDetails.day}
              </strong>
              , {loginDetails.date}{" "}
              at{" "}
              {loginDetails.time}
            </span>

          </div>

          {/* ==================================================
              PROFILE
          =================================================== */}

          <div
            className="flex items-center gap-3 shrink-0 relative"
            ref={
              statusRef
            }
          >

            {/* AVATAR */}

            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-md overflow-hidden shrink-0 relative">

              {loading ? (

                <div className="w-full h-full bg-slate-200 animate-pulse flex items-center justify-center">

                  <User
                    size={18}
                    className="text-slate-400"
                  />

                </div>

              ) : currentUser.avatar &&
                !imageError ? (

                <img
                  src={
                    currentUser.avatar
                  }
                  alt={
                    currentUser.name ||
                    "User Avatar"
                  }
                  className="w-full h-full object-cover"
                  onError={() =>
                    setImageError(
                      true
                    )
                  }
                />

              ) : userInitial ? (

                <span className="bg-gradient-to-tr from-amber-500 to-rose-500 w-full h-full rounded-full flex items-center justify-center uppercase font-black text-white">
                  {
                    userInitial
                  }
                </span>

              ) : (

                <div className="bg-slate-800 w-full h-full flex items-center justify-center">

                  <User
                    size={18}
                    className="text-slate-300"
                  />

                </div>

              )}

            </div>

            {/* USER DETAILS */}

            <div className="text-left hidden md:block">

              {/* NAME + ROLE */}

              <div className="flex items-center gap-2">

                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-none capitalize">
                  {loading
                    ? "Loading..."
                    : currentUser.name ||
                      "Guest User"}
                </p>

                {!loading &&
                  currentUser.role && (

                  <span
                    className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md border ${
                      isAdmin
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {
                      currentUser.role
                    }
                  </span>

                )}

              </div>

              {/* EMAIL */}

              <p className="text-[11px] text-slate-400 font-medium mt-1">
                {loading
                  ? "fetching email..."
                  : currentUser.email ||
                    "No email available"}
              </p>

              {/* STATUS */}

              {!loading && (
                <div className="relative mt-2">

                  <button
                    type="button"
                    disabled={
                      statusUpdating
                    }
                    onClick={() =>
                      setStatusOpen(
                        (prev) =>
                          !prev
                      )
                    }
                    className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border ${selectedStatus.bg} ${selectedStatus.color} border-slate-200/70 hover:shadow-sm transition-all duration-200 disabled:opacity-60`}
                  >

                    <span
                      className={`w-2 h-2 rounded-full ${selectedStatus.dot} ${
                        userStatus ===
                        "Active"
                          ? "animate-pulse"
                          : ""
                      }`}
                    />

                    <span className="text-[11px] font-bold whitespace-nowrap">
                      {
                        selectedStatus.label
                      }
                    </span>

                    <ChevronDown
                      size={12}
                      className={`transition-transform ${
                        statusOpen
                          ? "rotate-180"
                          : ""
                      }`}
                    />

                  </button>

                  {/* ==================================================
                      STATUS DROPDOWN
                  =================================================== */}

                  {statusOpen && (
                    <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-900/10 p-1.5 z-[100]">

                      {/* HEADER */}

                      <div className="px-2.5 py-2 mb-1">

                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          Set your status
                        </p>

                      </div>

                      {/* BREAK COUNTER */}

                      <div
                        className={`mx-1 mb-2 rounded-xl border px-3 py-2.5 ${
                          breakLimitReached
                            ? "bg-red-50 border-red-200"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >

                        <div className="flex items-center justify-between">

                          <span
                            className={`text-[11px] font-extrabold ${
                              breakLimitReached
                                ? "text-red-700"
                                : "text-slate-700"
                            }`}
                          >
                            Breaks
                          </span>

                          <span
                            className={`text-[11px] font-black ${
                              breakLimitReached
                                ? "text-red-600"
                                : "text-slate-700"
                            }`}
                          >
                            {breakCount} /{" "}
                            {MAX_BREAKS}
                          </span>

                        </div>

                        <div className="mt-1">

                          <span
                            className={`text-[10px] font-medium ${
                              breakLimitReached
                                ? "text-red-600"
                                : "text-slate-500"
                            }`}
                          >
                            {breakLimitReached
                              ? "5 breaks used in the last 24 hours"
                              : `${remainingBreaks} break${
                                  remainingBreaks ===
                                  1
                                    ? ""
                                    : "s"
                                } remaining`}
                          </span>

                        </div>

                      </div>

                      {/* OPTIONS */}

                      {visibleStatusOptions.map(
                        (option) => {

                          const Icon =
                            option.icon;

                          const optionBreakDisabled =
                            option.isBreak &&
                            breakLimitReached;

                          const isDisabled =
                            option.disabled ||
                            optionBreakDisabled;

                          return (
                            <button
                              key={
                                option.value
                              }
                              type="button"
                              disabled={
                                isDisabled
                              }
                              onClick={() => {

                                if (
                                  isDisabled
                                ) {
                                  return;
                                }

                                handleStatusChange(
                                  option.value
                                );

                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition ${
                                isDisabled
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:bg-gray-50 cursor-pointer"
                              }`}
                            >

                              {/* ICON */}

                              <div
                                className={`w-8 h-8 rounded-lg ${option.bg} flex items-center justify-center`}
                              >

                                <Icon
                                  className={`w-4 h-4 ${option.color}`}
                                />

                              </div>

                              {/* LABEL */}

                              <span
                                className={`text-sm font-medium ${
                                  optionBreakDisabled
                                    ? "text-slate-400"
                                    : "text-gray-700"
                                }`}
                              >
                                {
                                  option.label
                                }
                              </span>

                              {/* AUTO */}

                              {option.disabled && (
                                <span className="ml-auto text-[10px] text-gray-400 font-medium">
                                  Auto
                                </span>
                              )}

                              {/* BREAK LIMIT */}

                              {optionBreakDisabled && (
                                <span className="ml-auto text-[10px] text-red-400 font-semibold">
                                  Limit
                                </span>
                              )}

                            </button>
                          );
                        }
                      )}

                    </div>
                  )}

                </div>
              )}

            </div>

            {/* PROFILE ARROW */}

            <button
              type="button"
              onClick={() =>
                setStatusOpen(
                  (prev) =>
                    !prev
                )
              }
              className="hidden md:flex items-center justify-center"
            >

              <ChevronDown
                size={15}
                className={`text-slate-400 transition-transform ${
                  statusOpen
                    ? "rotate-180"
                    : ""
                }`}
              />

            </button>

          </div>
        </div>
      </div>

      {/* ======================================================
          NEW NOTIFICATION MODAL
      ======================================================= */}

      {notificationModal &&
        typeof document !==
          "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[2147483647] flex min-h-screen w-screen items-center justify-center p-4">

            {/* BACKDROP */}

            <div
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
              onClick={() =>
                setNotificationModal(
                  null
                )
              }
            />

            {/* MODAL CARD */}

            <div
              className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.45)]"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* TOP ACCENT */}

              <div className="h-1.5 bg-[#741C29]" />

              {/* CLOSE BUTTON */}

              <button
                type="button"
                onClick={() =>
                  setNotificationModal(
                    null
                  )
                }
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
              >

                <X
                  size={16}
                />

              </button>

              {/* CONTENT */}

              <div className="p-6 sm:p-7">

                {/* HEADER */}

                <div className="flex items-start gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#741C29]/10">

                    {(() => {

                      const Icon =
                        getNotificationIcon(
                          notificationModal.type
                        );

                      return (
                        <Icon
                          size={23}
                          className="text-[#741C29]"
                        />
                      );

                    })()}

                  </div>

                  <div className="min-w-0 flex-1 pr-6">

                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#741C29]">
                      New Notification
                    </p>

                    <h2 className="mt-1 text-lg font-black leading-tight text-slate-900">
                      {
                        notificationModal.title
                      }
                    </h2>

                    <p className="mt-1 text-[9px] font-medium text-slate-400">
                      {formatNotificationTime(
                        notificationModal.created_at
                      )}
                    </p>

                  </div>

                </div>

                {/* MESSAGE */}

                <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">

                  <p className="text-sm font-medium leading-6 text-slate-600">
                    {
                      notificationModal.message
                    }
                  </p>

                </div>

                {/* GOT IT */}

                <button
                  type="button"
                  onClick={() =>
                    setNotificationModal(
                      null
                    )
                  }
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#790214] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#790214]/20 transition hover:bg-[#650111] active:scale-[0.98]"
                >

                  <CheckCheck
                    size={16}
                  />

                  Got it

                </button>

              </div>

            </div>
          </div>,
          document.body
        )}

      {/* ======================================================
          LOCKED STATUS TIMER
      ======================================================= */}

      {timerOpen &&
        timerStatus &&
        timerStatus !==
          "Active" &&
        typeof document !==
          "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[2147483640] flex min-h-screen w-screen items-center justify-center p-4"
            style={{
              position: "fixed",
              inset: 0,
              width: "100vw",
              height: "100vh",
              pointerEvents:
                "auto",
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="status-timer-title"
          >

            {/* BACKDROP */}

            <div
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
              style={{
                pointerEvents:
                  "auto",
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />

            {/* TIMER CARD */}

            <div
              className="relative z-[2147483640] w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.45)]"
              style={{
                pointerEvents:
                  "auto",
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >

              {/* TOP ACCENT */}

              <div
                className={`h-1.5 w-full ${timerOption.dot}`}
              />

              {/* CONTENT */}

              <div className="px-5 py-7 sm:px-8 sm:py-8">

                {/* HEADER */}

                <div className="flex items-start justify-between gap-4">

                  <div className="min-w-0 text-left">

                    <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                      Current Status
                    </p>

                    <h2
                      id="status-timer-title"
                      className={`mt-1.5 truncate text-xl font-black sm:text-2xl ${timerOption.color}`}
                    >
                      {
                        timerStatus
                      }
                    </h2>

                  </div>

                  {/* BREAK BADGE */}

                  <div className="flex shrink-0 items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1.5">

                    <span className="relative flex h-2.5 w-2.5">

                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />

                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />

                    </span>

                    <span className="text-[10px] font-extrabold tracking-wide text-red-700">
                      Break
                    </span>

                  </div>
                </div>

                {/* MAIN TIMER */}

                <div className="relative mt-7 overflow-hidden rounded-[24px] border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-100 px-5 py-8 text-center shadow-sm">

                  <div
                    className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full ${timerOption.bg} opacity-70 blur-2xl`}
                  />

                  <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-slate-200/50 blur-2xl" />

                  {/* ICON */}

                  <div
                    className={`relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${timerOption.bg} ${timerOption.color} shadow-sm ring-1 ring-black/5`}
                  >

                    <TimerIcon
                      size={30}
                      strokeWidth={2}
                    />

                  </div>

                  {/* LABEL */}

                  <p className="relative mt-5 text-[10px] font-extrabold uppercase tracking-[0.25em] text-slate-400">
                    Time Elapsed
                  </p>

                  {/* TIMER */}

                  <div className="relative mt-2 font-mono text-5xl font-black tracking-[-0.04em] text-slate-900 tabular-nums sm:text-6xl">
                    {formatTimer(
                      timerSeconds
                    )}
                  </div>

                  {/* DESCRIPTION */}

                  <p className="relative mt-3 text-xs font-medium text-slate-500 sm:text-sm">
                    Your status timer is currently running
                  </p>

                </div>

                {/* STATUS INFORMATION */}

                <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">

                  <div className="flex items-center gap-3">

                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${timerOption.bg} ${timerOption.color}`}
                    >

                      <TimerIcon
                        size={18}
                        strokeWidth={2}
                      />

                    </div>

                    <div className="min-w-0 text-left">

                      <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-slate-400">
                        Status
                      </p>

                      <p className="mt-0.5 truncate text-sm font-bold text-slate-800">
                        {
                          timerStatus
                        }
                      </p>

                    </div>

                    <div className="ml-auto h-9 w-px bg-slate-200" />

                    <div className="text-right">

                      <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-slate-400">
                        Duration
                      </p>

                      <p className="mt-0.5 font-mono text-sm font-bold text-slate-800 tabular-nums">
                        {formatTimer(
                          timerSeconds
                        )}
                      </p>

                    </div>

                  </div>
                </div>

                {/* LOCKED MESSAGE */}

                <div className="mt-5 flex items-center justify-center gap-2">

                  <span className="relative flex h-2.5 w-2.5">

                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ec3737] opacity-60" />

                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#ec3737]" />

                  </span>

                  <p className="text-xs font-medium text-slate-500">
                    Your status is currently{" "}
                    {
                      timerStatus
                    }
                  </p>

                </div>

                {/* RETURN ACTIVE */}

                <button
                  type="button"
                  disabled={
                    statusUpdating
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    endStatusTimer();
                  }}
                  className="group mt-6 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#790214] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-[#790214]/20 transition-all duration-200 hover:bg-[#650111] hover:shadow-xl hover:shadow-[#790214]/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {statusUpdating ? (
                    <>

                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      <span>
                        Updating...
                      </span>

                    </>
                  ) : (
                    <>

                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 transition-colors group-hover:bg-white/20">

                        <Check
                          size={16}
                          strokeWidth={
                            2.5
                          }
                        />

                      </span>

                      <span>
                        Return to Active
                      </span>

                    </>
                  )}

                </button>

                {/* FOOTER */}

                <div className="mt-4 flex items-center justify-center gap-1.5">

                  <Clock3
                    size={12}
                    className="text-slate-400"
                  />

                  <p className="text-[10px] font-medium text-slate-400">
                    Your status duration is automatically recorded.
                  </p>

                </div>

              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}