




















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

//   // DB STATUS START TIME
//   const [statusStartedAt, setStatusStartedAt] =
//     useState(null);

//   // ============================================================
//   // LOGIN DETAILS
//   // ============================================================

//   const [loginDetails] = useState(() => {
//     const now = new Date();

//     return {
//       day: now.toLocaleDateString("en-US", {
//         weekday: "long",
//       }),

//       date: now.toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         year: "numeric",
//       }),

//       time: now.toLocaleTimeString("en-US", {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: true,
//       }),
//     };
//   });

//   // ============================================================
//   // STATUS OPTIONS
//   // ============================================================

//   const statusOptions = [
//     {
//       value: "Active",
//       label: "Active",
//       icon: Circle,
//       color: "text-emerald-600",
//       dot: "bg-emerald-500",
//       bg: "bg-emerald-50",
//     },

//     {
//       value: "Namaz Break",
//       label: "Namaz Break",
//       icon: Moon,
//       color: "text-indigo-600",
//       dot: "bg-indigo-500",
//       bg: "bg-indigo-50",
//     },

//     {
//       value: "Lunch Break",
//       label: "Lunch Break",
//       icon: Utensils,
//       color: "text-orange-600",
//       dot: "bg-orange-500",
//       bg: "bg-orange-50",
//     },

//       {
//     value: "Short Break",
//     label: "Short Break",
//     icon: Clock3,
//     color: "text-teal-600",
//     dot: "bg-teal-500",
//     bg: "bg-teal-50",
//   },


//     {
//       value: "Inactive",
//       label: "Inactive",
//       icon: CircleOff,
//       color: "text-slate-500",
//       dot: "bg-slate-400",
//       bg: "bg-slate-100",
//     },

//     {
//       value: "On Call",
//       label: "On Call",
//       icon: Phone,
//       color: "text-blue-600",
//       dot: "bg-blue-500",
//       bg: "bg-blue-50",
//     },

//     {
//       value: "Washroom Break",
//       label: "Washroom Break",
//       icon: Bath,
//       color: "text-cyan-600",
//       dot: "bg-cyan-500",
//       bg: "bg-cyan-50",
//     },

//     {
//       value: "Other",
//       label: "Other",
//       icon: MoreHorizontal,
//       color: "text-purple-600",
//       dot: "bg-purple-500",
//       bg: "bg-purple-50",
//     },
//   ];

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
//   // CALCULATE TIMER FROM DATABASE START TIME
//   // ============================================================

//   const calculateElapsedTime = (
//     startedAt
//   ) => {
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
//   // LOAD USER + STATUS FROM DATABASE
//   // ============================================================

//   useEffect(() => {
//     let mounted = true;

//     async function fetchUserData() {
//       try {
//         // ======================================================
//         // GET CURRENT USER
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

//         if (
//           data.success ||
//           userObj
//         ) {
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

//           if (!mounted) return;

//           setCurrentUser({
//             name: userName,
//             email: userObj.email || "",
//             role:
//               userObj.role || "user",
//             avatar: avatarUrl,
//           });
//         }

//         // ======================================================
//         // GET CURRENT STATUS FROM DATABASE
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

//         if (!mounted) return;

//         // ======================================================
//         // SET STATUS
//         // ======================================================

//         setUserStatus(dbStatus);

//         // ======================================================
//         // SET DATABASE START TIME
//         // ======================================================

//         setStatusStartedAt(
//           dbStartedAt
//         );

//         // ======================================================
//         // RESTORE TIMER FROM DATABASE
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
//       } catch (err) {
//         console.error(
//           "Failed to fetch user/status:",
//           err
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
//   // DATABASE BASED
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
//       const elapsed =
//         calculateElapsedTime(
//           statusStartedAt
//         );

//       setTimerSeconds(elapsed);
//     };

//     // Immediately calculate
//     updateTimer();

//     // Update every second
//     const interval =
//       setInterval(
//         updateTimer,
//         1000
//       );

//     return () => {
//       clearInterval(
//         interval
//       );
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
//     function handleClickOutside(
//       event
//     ) {
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

//   const handleStatusChange =
//     async (newStatus) => {
//       if (statusUpdating) {
//         return;
//       }

//       const oldStatus =
//         userStatus;

//       const oldStartedAt =
//         statusStartedAt;

//       setStatusOpen(false);

//       // ========================================================
//       // ACTIVE
//       // ========================================================

//       if (newStatus === "Active") {
//         try {
//           setStatusUpdating(true);

//           const res =
//             await fetch(
//               "/api/users/status",
//               {
//                 method: "PUT",

//                 headers: {
//                   "Content-Type":
//                     "application/json",
//                 },

//                 credentials:
//                   "include",

//                 body: JSON.stringify(
//                   {
//                     status:
//                       "Active",
//                   }
//                 ),
//               }
//             );

//           const data =
//             await res.json();

//           if (
//             !res.ok ||
//             !data.success
//           ) {
//             throw new Error(
//               data.message ||
//                 "Failed to update status"
//             );
//           }

//           // ====================================================
//           // DATABASE HAS CLOSED THE BREAK
//           // ====================================================

//           setUserStatus(
//             "Active"
//           );

//           setStatusStartedAt(
//             null
//           );

//           setTimerOpen(
//             false
//           );

//           setTimerStatus(
//             null
//           );

//           setTimerSeconds(
//             0
//           );
//         } catch (error) {
//           console.error(
//             "Status update error:",
//             error
//           );

//           setUserStatus(
//             oldStatus
//           );

//           setStatusStartedAt(
//             oldStartedAt
//           );

//           alert(
//             "Status update nahi ho saka."
//           );
//         } finally {
//           setStatusUpdating(
//             false
//           );
//         }

//         return;
//       }

//       // ========================================================
//       // NON ACTIVE STATUS
//       // ========================================================

//       try {
//         setStatusUpdating(true);

//         const res =
//           await fetch(
//             "/api/users/status",
//             {
//               method: "PUT",

//               headers: {
//                 "Content-Type":
//                   "application/json",
//               },

//               credentials:
//                 "include",

//               body: JSON.stringify(
//                 {
//                   status:
//                     newStatus,
//                 }
//               ),
//             }
//           );

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
//         // GET START TIME FROM DATABASE RESPONSE
//         // ======================================================

//         const dbStartedAt =
//           data.status_started_at ??
//           data.user
//             ?.status_started_at ??
//           null;

//         // ======================================================
//         // UPDATE STATE
//         // ======================================================

//         setUserStatus(
//           newStatus
//         );

//         setStatusStartedAt(
//           dbStartedAt
//         );

//         setTimerStatus(
//           newStatus
//         );

//         // ======================================================
//         // START TIMER FROM DATABASE TIME
//         // ======================================================

//         const elapsed =
//           calculateElapsedTime(
//             dbStartedAt
//           );

//         setTimerSeconds(
//           elapsed
//         );

//         setTimerOpen(true);
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
//           "Status update nahi ho saka."
//         );
//       } finally {
//         setStatusUpdating(
//           false
//         );
//       }
//     };

//   // ============================================================
//   // END BREAK / RETURN ACTIVE
//   // ============================================================

//   const endStatusTimer =
//     async () => {
//       if (statusUpdating) {
//         return;
//       }

//       const oldStatus =
//         userStatus;

//       const oldStartedAt =
//         statusStartedAt;

//       try {
//         setStatusUpdating(true);

//         const res =
//           await fetch(
//             "/api/users/status",
//             {
//               method: "PUT",

//               headers: {
//                 "Content-Type":
//                   "application/json",
//               },

//               credentials:
//                 "include",

//               body: JSON.stringify(
//                 {
//                   status:
//                     "Active",
//                 }
//               ),
//             }
//           );

//         const data =
//           await res.json();

//         if (
//           !res.ok ||
//           !data.success
//         ) {
//           throw new Error(
//             data.message ||
//               "Failed to activate user"
//           );
//         }

//         // ======================================================
//         // RESET STATUS
//         // ======================================================

//         setUserStatus(
//           "Active"
//         );

//         setStatusStartedAt(
//           null
//         );

//         setTimerOpen(
//           false
//         );

//         setTimerStatus(
//           null
//         );

//         setTimerSeconds(
//           0
//         );
//       } catch (error) {
//         console.error(
//           "End status error:",
//           error
//         );

//         setUserStatus(
//           oldStatus
//         );

//         setStatusStartedAt(
//           oldStartedAt
//         );

//         alert(
//           "Status change nahi ho saka."
//         );
//       } finally {
//         setStatusUpdating(
//           false
//         );
//       }
//     };

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
//     ) ||
//     statusOptions[0];

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
//           <h1 className="text-xl font-extrabold text-slate-900">
//             Dashboard
//           </h1>

//           <p className="text-xs text-slate-500 mt-0.5">
//             Call Activity & Performance
//             Analytics
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

//             {/* ================================================
//                 AVATAR
//             ================================================= */}

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

//             {/* ================================================
//                 USER DETAILS
//             ================================================= */}

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

//                       {statusOptions.map(
//                         (
//                           option
//                         ) => {
//                           const Icon =
//                             option.icon;

//                           const isSelected =
//                             userStatus ===
//                             option.value;

//                           return (
//                             <button
//                               key={
//                                 option.value
//                               }
//                               type="button"
//                               disabled={
//                                 statusUpdating
//                               }
//                               onClick={() =>
//                                 handleStatusChange(
//                                   option.value
//                                 )
//                               }
//                               className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-all ${
//                                 isSelected
//                                   ? `${option.bg} ${option.color}`
//                                   : "hover:bg-slate-50 text-slate-600"
//                               } disabled:opacity-50`}
//                             >

//                               <div
//                                 className={`w-7 h-7 rounded-lg flex items-center justify-center ${
//                                   isSelected
//                                     ? option.bg
//                                     : "bg-slate-100"
//                                 }`}
//                               >
//                                 <Icon
//                                   size={
//                                     14
//                                   }
//                                   className={
//                                     isSelected
//                                       ? option.color
//                                       : "text-slate-500"
//                                   }
//                                 />
//                               </div>

//                               <span
//                                 className={`text-xs font-semibold flex-1 ${
//                                   isSelected
//                                     ? option.color
//                                     : "text-slate-700"
//                                 }`}
//                               >
//                                 {
//                                   option.label
//                                 }
//                               </span>

//                               {isSelected && (
//                                 <Check
//                                   size={
//                                     14
//                                   }
//                                   className={
//                                     option.color
//                                   }
//                                 />
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
//           LOCKED TIMER MODAL
//       ======================================================= */}
// {/* ======================================================
//     PROFESSIONAL LOCKED STATUS TIMER
// ======================================================= */}

// {/* ============================================================
//     PROFESSIONAL LOCKED STATUS TIMER
//     - Portal to body
//     - Sidebar frozen
//     - Background frozen
//     - No outside click close
//     - No Escape close
//     - Only Return to Active works
// ============================================================ */}

// {timerOpen &&
//   timerStatus &&
//   timerStatus !== "Active" &&
//   typeof document !== "undefined" &&
//   createPortal(
//     <div
//       className="fixed inset-0 z-[2147483647] flex min-h-screen w-screen items-center justify-center p-4"
//       style={{
//         position: "fixed",
//         inset: 0,
//         width: "100vw",
//         height: "100vh",
//         pointerEvents: "auto",
//       }}
//       role="dialog"
//       aria-modal="true"
//       aria-labelledby="status-timer-title"
//     >

//       {/* ======================================================
//           FULL SCREEN BACKDROP
//           This blocks Sidebar + Dashboard completely
//       ======================================================= */}

//       <div
//         className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
//         style={{
//           pointerEvents: "auto",
//         }}
//         onMouseDown={(e) => {
//           e.preventDefault();
//           e.stopPropagation();
//         }}
//         onClick={(e) => {
//           e.preventDefault();
//           e.stopPropagation();
//         }}
//         onContextMenu={(e) => {
//           e.preventDefault();
//           e.stopPropagation();
//         }}
//       />

//       {/* ======================================================
//           TIMER CARD
//       ======================================================= */}

//       <div
//         className="relative z-[2147483647] w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.45)]"
//         style={{
//           pointerEvents: "auto",
//         }}
//         onMouseDown={(e) => {
//           e.stopPropagation();
//         }}
//         onClick={(e) => {
//           e.stopPropagation();
//         }}
//       >

//         {/* ==================================================
//             TOP ACCENT
//         =================================================== */}

//         <div
//           className={`h-1.5 w-full ${timerOption.dot}`}
//         />

//         {/* ==================================================
//             CONTENT
//         =================================================== */}

//         <div className="px-5 py-7 sm:px-8 sm:py-8">

//           {/* ==================================================
//               HEADER
//           =================================================== */}

//           <div className="flex items-start justify-between gap-4">

//             {/* STATUS */}

//             <div className="min-w-0 text-left">

//               <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
//                 Current Status
//               </p>

//               <h2
//                 id="status-timer-title"
//                 className={`mt-1.5 truncate text-xl font-black sm:text-2xl ${timerOption.color}`}
//               >
//                 {timerStatus}
//               </h2>

//             </div>

//             {/* LIVE BADGE */}

//        <div className="flex shrink-0 items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1.5">

//   <span className="relative flex h-2.5 w-2.5">

//     <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />

//     <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />

//   </span>

//   <span className="text-[10px] font-extrabold tracking-wide text-red-700">
//     Break
//   </span>

// </div>

//           </div>

//           {/* ==================================================
//               MAIN TIMER AREA
//           =================================================== */}

//           <div className="relative mt-7 overflow-hidden rounded-[24px] border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-100 px-5 py-8 text-center shadow-sm">

//             {/* Decorative circles */}

//             <div
//               className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full ${timerOption.bg} opacity-70 blur-2xl`}
//             />

//             <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-slate-200/50 blur-2xl" />

//             {/* ICON */}

//             <div
//               className={`relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${timerOption.bg} ${timerOption.color} shadow-sm ring-1 ring-black/5`}
//             >
//               <TimerIcon
//                 size={30}
//                 strokeWidth={2}
//               />
//             </div>

//             {/* LABEL */}

//             <p className="relative mt-5 text-[10px] font-extrabold uppercase tracking-[0.25em] text-slate-400">
//               Time Elapsed
//             </p>

//             {/* TIMER */}

//             <div className="relative mt-2 font-mono text-5xl font-black tracking-[-0.04em] text-slate-900 tabular-nums sm:text-6xl">
//               {formatTimer(timerSeconds)}
//             </div>

//             {/* DESCRIPTION */}

//             <p className="relative mt-3 text-xs font-medium text-slate-500 sm:text-sm">
//               Your status timer is currently running
//             </p>

//           </div>

//           {/* ==================================================
//               STATUS INFORMATION
//           =================================================== */}

//           <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">

//             <div className="flex items-center gap-3">

//               {/* STATUS ICON */}

//               <div
//                 className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${timerOption.bg} ${timerOption.color}`}
//               >
//                 <TimerIcon
//                   size={18}
//                   strokeWidth={2}
//                 />
//               </div>

//               {/* STATUS */}

//               <div className="min-w-0 text-left">

//                 <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-slate-400">
//                   Status
//                 </p>

//                 <p className="mt-0.5 truncate text-sm font-bold text-slate-800">
//                   {timerStatus}
//                 </p>

//               </div>

//               {/* DIVIDER */}

//               <div className="ml-auto h-9 w-px bg-slate-200" />

//               {/* DURATION */}

//               <div className="text-right">

//                 <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-slate-400">
//                   Duration
//                 </p>

//                 <p className="mt-0.5 font-mono text-sm font-bold text-slate-800 tabular-nums">
//                   {formatTimer(timerSeconds)}
//                 </p>

//               </div>

//             </div>

//           </div>

//           {/* ==================================================
//               LOCKED STATUS MESSAGE
//           =================================================== */}

//           <div className="mt-5 flex items-center justify-center gap-2">

//             <span className="relative flex h-2.5 w-2.5">

//               <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />

//               <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />

//             </span>

//             <p className="text-xs font-medium text-slate-500">
//               Your status is currently Break
//             </p>

//           </div>

//           {/* ==================================================
//               RETURN TO ACTIVE
//               ONLY INTERACTIVE ACTION
//           =================================================== */}

//           <button
//             type="button"
//             disabled={statusUpdating}
//             onClick={(e) => {
//               e.preventDefault();
//               e.stopPropagation();

//               endStatusTimer();
//             }}
//             className="group mt-6 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#790214] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-[#790214]/20 transition-all duration-200 hover:bg-[#650111] hover:shadow-xl hover:shadow-[#790214]/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
//           >

//             {statusUpdating ? (
//               <>

//                 {/* LOADING */}

//                 <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

//                 <span>
//                   Updating...
//                 </span>

//               </>
//             ) : (
//               <>

//                 {/* CHECK ICON */}

//                 <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 transition-colors group-hover:bg-white/20">

//                   <Check
//                     size={16}
//                     strokeWidth={2.5}
//                   />

//                 </span>

//                 <span>
//                   Return to Active
//                 </span>

//               </>
//             )}

//           </button>

//           {/* ==================================================
//               FOOTER
//           =================================================== */}

//           <div className="mt-4 flex items-center justify-center gap-1.5">

//             <Clock3
//               size={12}
//               className="text-slate-400"
//             />

//             <p className="text-[10px] font-medium text-slate-400">
//               Your status duration is automatically recorded.
//             </p>

//           </div>

//         </div>
//       </div>
//     </div>,

//     document.body
//   )}
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
//   Bath,
//   MoreHorizontal,
//   Clock3,
// } from "lucide-react";

// export default function DashboardTopBar() {
//   // ============================================================
//   // CURRENT USER
//   // ============================================================

//   const [currentUser, setCurrentUser] = useState({
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

//   const [loginDetails] = useState(() => {
//     const now = new Date();

//     return {
//       day: now.toLocaleDateString("en-US", {
//         weekday: "long",
//       }),

//       date: now.toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         year: "numeric",
//       }),

//       time: now.toLocaleTimeString("en-US", {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: true,
//       }),
//     };
//   });

//   // ============================================================
//   // STATUS OPTIONS
//   // ============================================================

//   const statusOptions = [
//     {
//       value: "Active",
//       label: "Active",
//       icon: Circle,
//       color: "text-emerald-600",
//       dot: "bg-emerald-500",
//       bg: "bg-emerald-50",
//     },

//     {
//       value: "Namaz Break",
//       label: "Namaz Break",
//       icon: Moon,
//       color: "text-indigo-600",
//       dot: "bg-indigo-500",
//       bg: "bg-indigo-50",
//     },

//     {
//       value: "Lunch Break",
//       label: "Lunch Break",
//       icon: Utensils,
//       color: "text-orange-600",
//       dot: "bg-orange-500",
//       bg: "bg-orange-50",
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
//     },

//     {
//       value: "Inactive",
//       label: "Inactive",
//       icon: CircleOff,
//       color: "text-slate-500",
//       dot: "bg-slate-400",
//       bg: "bg-slate-100",
//     },

//     {
//       value: "On Call",
//       label: "On Call",
//       icon: Phone,
//       color: "text-blue-600",
//       dot: "bg-blue-500",
//       bg: "bg-blue-50",
//     },

//     {
//       value: "Washroom Break",
//       label: "Washroom Break",
//       icon: Bath,
//       color: "text-cyan-600",
//       dot: "bg-cyan-500",
//       bg: "bg-cyan-50",
//     },

//     {
//       value: "Other",
//       label: "Other",
//       icon: MoreHorizontal,
//       color: "text-purple-600",
//       dot: "bg-purple-500",
//       bg: "bg-purple-50",
//     },
//   ];

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

//           setCurrentUser({
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

// useEffect(() => {
//   if (
//     !timerOpen ||
//     !timerStatus ||
//     !statusStartedAt
//   ) {
//     return;
//   }

//   const updateTimer = () => {
//     const startedTime = new Date(
//       statusStartedAt
//     ).getTime();

//     if (Number.isNaN(startedTime)) {
//       setTimerSeconds(0);
//       return;
//     }

//     const elapsed = Math.max(
//       0,
//       Math.floor(
//         (Date.now() - startedTime) / 1000
//       )
//     );

//     setTimerSeconds(elapsed);
//   };

//   // Immediately calculate
//   updateTimer();

//   // Update every second
//   const interval = setInterval(
//     updateTimer,
//     1000
//   );

//   return () => {
//     clearInterval(interval);
//   };
// }, [
//   timerOpen,
//   timerStatus,
//   statusStartedAt,
// ]);

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
//     const oldStartedAt = statusStartedAt;

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

//       setTimerStatus(newStatus);

//       // ========================================================
//       // CALCULATE TIMER FROM DATABASE
//       // ========================================================

//       const elapsed =
//         calculateElapsedTime(
//           dbStartedAt
//         );

//       setTimerSeconds(elapsed);

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
//     const oldStartedAt = statusStartedAt;

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

//   const userInitial = currentUser.name
//     ? currentUser.name
//         .trim()
//         .charAt(0)
//         .toUpperCase()
//     : "";

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
//   <div className="flex items-center gap-2">
//     <h1 className="text-xl font-extrabold text-slate-900">
//       Dashboard
//     </h1>

//     {!loading && currentUser.id && (
//       <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500">
//         ID: {currentUser.id}
//       </span>
//     )}
//   </div>

//   <p className="text-xs text-slate-500 mt-0.5">
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
//                   src={currentUser.avatar}
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
//                       {currentUser.role}
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
//                       {selectedStatus.label}
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

//               {statusOptions.map((option) => {
//   const Icon = option.icon;
//   const isSelected = userStatus === option.value;

//   return (
//     <button
//       key={option.value}
//       type="button"
//       disabled={statusUpdating}
//       onClick={() => handleStatusChange(option.value)}
//       className={`group w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-all duration-200 ${
//         isSelected
//           ? `${option.bg} ${option.color}`
//           : "text-slate-600 hover:bg-[#ec3737] hover:text-white hover:shadow-sm"
//       } disabled:opacity-50`}
//     >
//       {/* Icon */}
//       <div
//         className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
//           isSelected
//             ? option.bg
//             : "bg-slate-100 group-hover:bg-white/20"
//         }`}
//       >
//         <Icon
//           size={14}
//           className={`transition-all duration-200 ${
//             isSelected
//               ? option.color
//               : "text-slate-500 group-hover:text-white group-hover:scale-110"
//           }`}
//         />
//       </div>

//       {/* Label */}
//       <span
//         className={`text-xs font-semibold flex-1 transition-colors duration-200 ${
//           isSelected
//             ? option.color
//             : "text-slate-700 group-hover:text-white"
//         }`}
//       >
//         {option.label}
//       </span>

//       {/* Selected Check */}
//       {isSelected && (
//         <Check
//           size={14}
//           className={`${option.color} transition-all duration-200`}
//         />
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
//         typeof document !== "undefined" &&
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

//             {/* TIMER CARD */}

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

//                   {/* LIVE / BREAK BADGE */}

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

//                     <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />

//                     <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />

//                   </span>

//                   <p className="text-xs font-medium text-slate-500">
//                     Your status is currently{" "}
//                     {timerStatus}
//                   </p>
//                 </div>

//                 {/* RETURN ACTIVE */}

//                 <button
//                   type="button"
//                   disabled={statusUpdating}
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
  Bath,
  MoreHorizontal,
  Clock3,
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
  // TIMER MODAL
  // ============================================================

  const [timerOpen, setTimerOpen] = useState(false);
  const [timerStatus, setTimerStatus] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // ============================================================
  // DATABASE STATUS START TIME
  // ============================================================

  const [statusStartedAt, setStatusStartedAt] = useState(null);

  // ============================================================
  // LOGIN DETAILS
  // ============================================================

  const [loginDetails] = useState(() => {
    const now = new Date();

    return {
      day: now.toLocaleDateString("en-US", {
        weekday: "long",
      }),

      date: now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),

      time: now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  });

  // ============================================================
  // STATUS OPTIONS
  // ============================================================

  const statusOptions = [
    {
      value: "Active",
      label: "Active",
      icon: Circle,
      color: "text-emerald-600",
      dot: "bg-emerald-500",
      bg: "bg-emerald-50",
    },

    {
      value: "Namaz Break",
      label: "Namaz Break",
      icon: Moon,
      color: "text-indigo-600",
      dot: "bg-indigo-500",
      bg: "bg-indigo-50",
    },

    {
      value: "Lunch Break",
      label: "Lunch Break",
      icon: Utensils,
      color: "text-orange-600",
      dot: "bg-orange-500",
      bg: "bg-orange-50",
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
    },

    {
      value: "Inactive",
      label: "Inactive",
      icon: CircleOff,
      color: "text-slate-500",
      dot: "bg-slate-400",
      bg: "bg-slate-100",
    },

    {
      value: "On Call",
      label: "On Call",
      icon: Phone,
      color: "text-blue-600",
      dot: "bg-blue-500",
      bg: "bg-blue-50",
    },

    {
      value: "Washroom Break",
      label: "Washroom Break",
      icon: Bath,
      color: "text-cyan-600",
      dot: "bg-cyan-500",
      bg: "bg-cyan-50",
    },

    {
      value: "Other",
      label: "Other",
      icon: MoreHorizontal,
      color: "text-purple-600",
      dot: "bg-purple-500",
      bg: "bg-purple-50",
    },
  ];

  // ============================================================
  // SELECTED STATUS
  // ============================================================

  const selectedStatus =
    statusOptions.find(
      (status) => status.value === userStatus
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

    const secs = safeSeconds % 60;

    return [
      hrs.toString().padStart(2, "0"),
      mins.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":");
  };

  // ============================================================
  // CALCULATE ELAPSED TIME
  // ============================================================

  const calculateElapsedTime = (startedAt) => {
    if (!startedAt) {
      return 0;
    }

    const startTime = new Date(
      startedAt
    ).getTime();

    if (Number.isNaN(startTime)) {
      return 0;
    }

    const elapsed = Math.floor(
      (Date.now() - startTime) / 1000
    );

    return Math.max(0, elapsed);
  };

  // ============================================================
  // LOAD CURRENT USER + CURRENT STATUS
  // ============================================================

  useEffect(() => {
    let mounted = true;

    async function fetchUserData() {
      try {
        // ======================================================
        // CURRENT USER
        // ======================================================

        const res = await fetch(
          "/api/auth/me",
          {
            cache: "no-store",
            credentials: "include",
          }
        );

        const data = await res.json();

        const userObj =
          data.user ||
          data.data ||
          data;

        if (data.success || userObj) {
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

          // ====================================================
          // CURRENT USER INCLUDING ID
          // ====================================================

          setCurrentUser({
            id: userObj.id || null,
            name: userName,
            email: userObj.email || "",
            role: userObj.role || "user",
            avatar: avatarUrl,
          });
        }

        // ======================================================
        // CURRENT STATUS
        // ======================================================

        const statusRes = await fetch(
          "/api/users/status",
          {
            cache: "no-store",
            credentials: "include",
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

        const dbStatus =
          statusData.status ||
          statusData.user
            ?.availability_status ||
          "Active";

        const dbStartedAt =
          statusData.status_started_at ??
          statusData.user
            ?.status_started_at ??
          null;

        if (!mounted) {
          return;
        }

        // ======================================================
        // SET STATUS
        // ======================================================

        setUserStatus(dbStatus);

        // ======================================================
        // SET START TIME
        // ======================================================

        setStatusStartedAt(
          dbStartedAt
        );

        // ======================================================
        // RESTORE TIMER
        // ======================================================

        if (
          dbStatus !== "Active" &&
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

          setTimerOpen(true);
        } else {
          setTimerStatus(null);
          setTimerSeconds(0);
          setTimerOpen(false);
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

    const updateTimer = () => {
      const startedTime = new Date(
        statusStartedAt
      ).getTime();

      if (Number.isNaN(startedTime)) {
        setTimerSeconds(0);
        return;
      }

      const elapsed = Math.max(
        0,
        Math.floor(
          (Date.now() - startedTime) /
            1000
        )
      );

      setTimerSeconds(elapsed);
    };

    updateTimer();

    const interval = setInterval(
      updateTimer,
      1000
    );

    return () => {
      clearInterval(interval);
    };
  }, [
    timerOpen,
    timerStatus,
    statusStartedAt,
  ]);

  // ============================================================
  // CLOSE DROPDOWN OUTSIDE
  // ============================================================

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        statusRef.current &&
        !statusRef.current.contains(
          event.target
        )
      ) {
        setStatusOpen(false);
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

  const handleStatusChange = async (
    newStatus
  ) => {
    if (statusUpdating) {
      return;
    }

    const oldStatus = userStatus;
    const oldStartedAt =
      statusStartedAt;

    setStatusOpen(false);

    // ==========================================================
    // ACTIVE
    // ==========================================================

    if (newStatus === "Active") {
      try {
        setStatusUpdating(true);

        const res = await fetch(
          "/api/users/status",
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials: "include",

            body: JSON.stringify({
              status: "Active",
            }),
          }
        );

        const data = await res.json();

        if (
          !res.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to update status"
          );
        }

        setUserStatus("Active");
        setStatusStartedAt(null);
        setTimerOpen(false);
        setTimerStatus(null);
        setTimerSeconds(0);
      } catch (error) {
        console.error(
          "Status update error:",
          error
        );

        setUserStatus(oldStatus);

        setStatusStartedAt(
          oldStartedAt
        );

        alert(
          "Status update nahi ho saka."
        );
      } finally {
        setStatusUpdating(false);
      }

      return;
    }

    // ==========================================================
    // NON ACTIVE STATUS
    // ==========================================================

    try {
      setStatusUpdating(true);

      const res = await fetch(
        "/api/users/status",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await res.json();

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

      setUserStatus(newStatus);

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

      setTimerOpen(true);
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      setUserStatus(oldStatus);

      setStatusStartedAt(
        oldStartedAt
      );

      alert(
        "Status update nahi ho saka."
      );
    } finally {
      setStatusUpdating(false);
    }
  };

  // ============================================================
  // END STATUS / RETURN ACTIVE
  // ============================================================

  const endStatusTimer = async () => {
    if (statusUpdating) {
      return;
    }

    const oldStatus = userStatus;
    const oldStartedAt =
      statusStartedAt;

    try {
      setStatusUpdating(true);

      const res = await fetch(
        "/api/users/status",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            status: "Active",
          }),
        }
      );

      const data = await res.json();

      if (
        !res.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to activate user"
        );
      }

      setUserStatus("Active");
      setStatusStartedAt(null);
      setTimerOpen(false);
      setTimerStatus(null);
      setTimerSeconds(0);
    } catch (error) {
      console.error(
        "End status error:",
        error
      );

      setUserStatus(oldStatus);

      setStatusStartedAt(
        oldStartedAt
      );

      alert(
        "Status change nahi ho saka."
      );
    } finally {
      setStatusUpdating(false);
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

  const isAdmin =
    currentUser.role?.toLowerCase() ===
    "admin";

  // ============================================================
  // TIMER ICON
  // ============================================================

  const TimerIcon =
    statusOptions.find(
      (item) =>
        item.value === timerStatus
    )?.icon || Clock3;

  const timerOption =
    statusOptions.find(
      (item) =>
        item.value === timerStatus
    ) || statusOptions[0];

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
  {/* ==================================================
      DASHBOARD HEADER
  =================================================== */}
  <div className="flex items-center gap-3">
    
    {/* Accent Line */}
    <div className="h-8 w-1 rounded-full bg-[#ec3737]" />

    {/* Title */}
    <div className="flex items-center gap-2.5">
      <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
        Dashboard
      </h1>

      {/* User ID */}
   {!loading && currentUser.id && (
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

  {/* Subtitle */}
  <p className="mt-1.5 ml-4 text-xs font-medium text-slate-500">
    Call Activity & Performance Analytics
  </p>
</div>

        {/* ====================================================
            RIGHT
        ===================================================== */}

        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">

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
            ref={statusRef}
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
                    setImageError(true)
                  }
                />
              ) : userInitial ? (
                <span className="bg-gradient-to-tr from-amber-500 to-rose-500 w-full h-full rounded-full flex items-center justify-center uppercase font-black text-white">
                  {userInitial}
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

                  {/* STATUS DROPDOWN */}

                  {statusOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-900/10 p-1.5 z-[100]">

                      <div className="px-2.5 py-2 mb-1">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          Set your status
                        </p>
                      </div>

                      {statusOptions.map(
                        (option) => {
                          const Icon =
                            option.icon;

                          const isSelected =
                            userStatus ===
                            option.value;

                          return (
                            <button
                              key={
                                option.value
                              }
                              type="button"
                              disabled={
                                statusUpdating
                              }
                              onClick={() =>
                                handleStatusChange(
                                  option.value
                                )
                              }
                              className={`group w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-all duration-200 ${
                                isSelected
                                  ? `${option.bg} ${option.color}`
                                  : "text-slate-600 hover:bg-[#ec3737] hover:text-white hover:shadow-sm"
                              } disabled:opacity-50`}
                            >

                              {/* ICON */}

                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                  isSelected
                                    ? option.bg
                                    : "bg-slate-100 group-hover:bg-white/20"
                                }`}
                              >
                                <Icon
                                  size={14}
                                  className={`transition-all duration-200 ${
                                    isSelected
                                      ? option.color
                                      : "text-slate-500 group-hover:text-white group-hover:scale-110"
                                  }`}
                                />
                              </div>

                              {/* LABEL */}

                              <span
                                className={`text-xs font-semibold flex-1 transition-colors duration-200 ${
                                  isSelected
                                    ? option.color
                                    : "text-slate-700 group-hover:text-white"
                                }`}
                              >
                                {
                                  option.label
                                }
                              </span>

                              {/* SELECTED CHECK */}

                              {isSelected && (
                                <Check
                                  size={14}
                                  className={`${option.color} transition-all duration-200`}
                                />
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
                  (prev) => !prev
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
          LOCKED STATUS TIMER
      ======================================================= */}

      {timerOpen &&
        timerStatus &&
        timerStatus !== "Active" &&
        typeof document !==
          "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[2147483647] flex min-h-screen w-screen items-center justify-center p-4"
            style={{
              position: "fixed",
              inset: 0,
              width: "100vw",
              height: "100vh",
              pointerEvents: "auto",
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="status-timer-title"
          >

            {/* ==================================================
                BACKDROP
            =================================================== */}

            <div
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
              style={{
                pointerEvents: "auto",
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

            {/* ==================================================
                TIMER CARD
            =================================================== */}

            <div
              className="relative z-[2147483647] w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.45)]"
              style={{
                pointerEvents: "auto",
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
                      {timerStatus}
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

                  {/* DECORATIVE CIRCLES */}

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

                    {/* STATUS ICON */}

                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${timerOption.bg} ${timerOption.color}`}
                    >
                      <TimerIcon
                        size={18}
                        strokeWidth={2}
                      />
                    </div>

                    {/* STATUS */}

                    <div className="min-w-0 text-left">

                      <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-slate-400">
                        Status
                      </p>

                      <p className="mt-0.5 truncate text-sm font-bold text-slate-800">
                        {timerStatus}
                      </p>
                    </div>

                    {/* DIVIDER */}

                    <div className="ml-auto h-9 w-px bg-slate-200" />

                    {/* DURATION */}

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

                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />

                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />

                  </span>

                  <p className="text-xs font-medium text-slate-500">
                    Your status is currently{" "}
                    {timerStatus}
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
                          strokeWidth={2.5}
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