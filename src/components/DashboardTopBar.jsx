














// "use client";

// import { useState, useEffect, useRef } from "react";
// import {
//   Calendar,
//   ChevronDown,
//   User,
//   Check,
//   Circle,
//   Phone,
//   Coffee,
//   Moon,
//   Utensils,
//   CircleOff,
//   Bath,
//   MoreHorizontal,
// } from "lucide-react";

// export default function DashboardTopBar() {
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

//   const statusRef = useRef(null);

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
//   // CURRENT STATUS
//   // ============================================================

//   const selectedStatus =
//     statusOptions.find(
//       (status) => status.value === userStatus
//     ) || statusOptions[0];

//   const StatusIcon = selectedStatus.icon;

//   // ============================================================
//   // FETCH USER
//   // ============================================================

//   useEffect(() => {
//     async function fetchUserData() {
//       try {
//         const res = await fetch("/api/auth/me", {
//           cache: "no-store",
//         });

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

//           setCurrentUser({
//             name: userName,
//             email: userObj.email || "",
//             role: userObj.role || "user",
//             avatar: avatarUrl,
//           });

//           // Agar future mein API se status aaye
//           if (userObj.status) {
//             setUserStatus(userObj.status);
//           }
//         }
//       } catch (err) {
//         console.error(
//           "Failed to fetch user details:",
//           err
//         );
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchUserData();
//   }, []);

//   // ============================================================
//   // CLOSE STATUS DROPDOWN WHEN CLICK OUTSIDE
//   // ============================================================

//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (
//         statusRef.current &&
//         !statusRef.current.contains(event.target)
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
//   // STATUS CHANGE
//   // ============================================================

//   const handleStatusChange = (status) => {
//     setUserStatus(status);
//     setStatusOpen(false);

//     console.log("USER STATUS:", status);

//     // ========================================================
//     // FUTURE API
//     // Yahan baad mein status database mein save kar sakte hain.
//     // ========================================================
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
//     currentUser.role?.toLowerCase() === "admin";

//   // ============================================================
//   // UI
//   // ============================================================

//   return (
//     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">

//       {/* ======================================================
//           LEFT
//       ======================================================= */}

//       <div>
//         <h1 className="text-xl font-extrabold text-slate-900">
//           Dashboard
//         </h1>

//         <p className="text-xs text-slate-500 mt-0.5">
//           Call Activity & Performance Analytics
//         </p>
//       </div>

//       {/* ======================================================
//           RIGHT
//       ======================================================= */}

//       <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">

//         {/* ====================================================
//             LOGIN BADGE
//         ===================================================== */}

//         <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700 font-medium shadow-sm">

//           <Calendar
//             size={14}
//             className="text-blue-600 shrink-0"
//           />

//           <span>
//             Logged in:{" "}
//             <strong>
//               {loginDetails.day}
//             </strong>
//             , {loginDetails.date} at{" "}
//             {loginDetails.time}
//           </span>
//         </div>

//         {/* ====================================================
//             PROFILE SECTION
//         ===================================================== */}

//         <div
//           className="flex items-center gap-3 shrink-0 relative"
//           ref={statusRef}
//         >

//           {/* ==================================================
//               AVATAR
//           =================================================== */}

//           <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-md overflow-hidden shrink-0 relative">

//             {loading ? (
//               <div className="w-full h-full bg-slate-200 animate-pulse flex items-center justify-center">
//                 <User
//                   size={18}
//                   className="text-slate-400"
//                 />
//               </div>
//             ) : currentUser.avatar &&
//               !imageError ? (
//               <img
//                 src={currentUser.avatar}
//                 alt={
//                   currentUser.name ||
//                   "User Avatar"
//                 }
//                 className="w-full h-full object-cover"
//                 onError={() =>
//                   setImageError(true)
//                 }
//               />
//             ) : userInitial ? (
//               <span className="bg-gradient-to-tr from-amber-500 to-rose-500 w-full h-full rounded-full flex items-center justify-center uppercase font-black text-white">
//                 {userInitial}
//               </span>
//             ) : (
//               <div className="bg-slate-800 w-full h-full flex items-center justify-center">
//                 <User
//                   size={18}
//                   className="text-slate-300"
//                 />
//               </div>
//             )}
//           </div>

//           {/* ==================================================
//               USER DETAILS
//           =================================================== */}

//           <div className="text-left hidden md:block">

//             {/* ================================================
//                 NAME + ROLE
//             ================================================= */}

//             <div className="flex items-center gap-2">

//               <p className="text-xs sm:text-sm font-bold text-slate-900 leading-none capitalize">
//                 {loading
//                   ? "Loading..."
//                   : currentUser.name ||
//                     "Guest User"}
//               </p>

//               {!loading &&
//                 currentUser.role && (
//                   <span
//                     className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md border ${
//                       isAdmin
//                         ? "bg-purple-50 text-purple-700 border-purple-200"
//                         : "bg-emerald-50 text-emerald-700 border-emerald-200"
//                     }`}
//                   >
//                     {currentUser.role}
//                   </span>
//                 )}
//             </div>

//             {/* ================================================
//                 EMAIL
//             ================================================= */}

//             <p className="text-[11px] text-slate-400 font-medium mt-1">
//               {loading
//                 ? "fetching email..."
//                 : currentUser.email ||
//                   "No email available"}
//             </p>

//             {/* ================================================
//                 STATUS BUTTON
//             ================================================= */}

//             {!loading && (
//               <div className="relative mt-2">

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setStatusOpen(
//                       (prev) => !prev
//                     )
//                   }
//                   className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border ${selectedStatus.bg} ${selectedStatus.color} border-slate-200/70 hover:shadow-sm transition-all duration-200`}
//                 >

//                   {/* STATUS DOT */}

//                   <span
//                     className={`w-2 h-2 rounded-full ${selectedStatus.dot} ${
//                       userStatus === "Active"
//                         ? "animate-pulse"
//                         : ""
//                     }`}
//                   />

//                   <span className="text-[11px] font-bold whitespace-nowrap">
//                     {selectedStatus.label}
//                   </span>

//                   <ChevronDown
//                     size={12}
//                     className={`transition-transform ${
//                       statusOpen
//                         ? "rotate-180"
//                         : ""
//                     }`}
//                   />
//                 </button>

//                 {/* ============================================
//                     STATUS DROPDOWN
//                 ============================================= */}

//                 {statusOpen && (
//                   <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-900/10 p-1.5 z-50">

//                     <div className="px-2.5 py-2 mb-1">
//                       <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
//                         Set your status
//                       </p>
//                     </div>

//                     {statusOptions.map(
//                       (option) => {
//                         const Icon =
//                           option.icon;

//                         const isSelected =
//                           userStatus ===
//                           option.value;

//                         return (
//                           <button
//                             key={
//                               option.value
//                             }
//                             type="button"
//                             onClick={() =>
//                               handleStatusChange(
//                                 option.value
//                               )
//                             }
//                             className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-all ${
//                               isSelected
//                                 ? `${option.bg} ${option.color}`
//                                 : "hover:bg-slate-50 text-slate-600"
//                             }`}
//                           >

//                             {/* ICON */}

//                             <div
//                               className={`w-7 h-7 rounded-lg flex items-center justify-center ${
//                                 isSelected
//                                   ? option.bg
//                                   : "bg-slate-100"
//                               }`}
//                             >
//                               <Icon
//                                 size={14}
//                                 className={
//                                   isSelected
//                                     ? option.color
//                                     : "text-slate-500"
//                                 }
//                               />
//                             </div>

//                             {/* LABEL */}

//                             <span
//                               className={`text-xs font-semibold flex-1 ${
//                                 isSelected
//                                   ? option.color
//                                   : "text-slate-700"
//                               }`}
//                             >
//                               {option.label}
//                             </span>

//                             {/* CHECK */}

//                             {isSelected && (
//                               <Check
//                                 size={14}
//                                 className={
//                                   option.color
//                                 }
//                               />
//                             )}
//                           </button>
//                         );
//                       }
//                     )}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* DESKTOP PROFILE ARROW */}

//           <button
//             type="button"
//             onClick={() =>
//               setStatusOpen(
//                 (prev) => !prev
//               )
//             }
//             className="hidden md:flex items-center justify-center"
//           >
//             <ChevronDown
//               size={15}
//               className={`text-slate-400 transition-transform ${
//                 statusOpen
//                   ? "rotate-180"
//                   : ""
//               }`}
//             />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }























"use client";

import { useState, useEffect, useRef } from "react";

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
  X,
  Clock3,
} from "lucide-react";

export default function DashboardTopBar() {
  // ============================================================
  // CURRENT USER
  // ============================================================

  const [currentUser, setCurrentUser] = useState({
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
    const hrs = Math.floor(seconds / 3600);

    const mins = Math.floor(
      (seconds % 3600) / 60
    );

    const secs = seconds % 60;

    return [
      hrs.toString().padStart(2, "0"),
      mins.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":");
  };

  // ============================================================
  // LOAD USER + SAVED TIMER
  // ============================================================

  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
        });

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

          setCurrentUser({
            name: userName,
            email: userObj.email || "",
            role: userObj.role || "user",
            avatar: avatarUrl,
          });

          // ====================================================
          // LOAD STATUS FROM DATABASE
          // ====================================================

          const dbStatus =
            userObj.availability_status ||
            userObj.status ||
            "Active";

          setUserStatus(dbStatus);

          // ====================================================
          // LOAD TIMER FROM LOCAL STORAGE
          // ====================================================

          try {
            const savedTimer =
              localStorage.getItem(
                "crm_status_timer"
              );

            if (savedTimer) {
              const parsed =
                JSON.parse(savedTimer);

              if (
                parsed &&
                parsed.status &&
                parsed.startedAt
              ) {
                const elapsed = Math.floor(
                  (Date.now() -
                    Number(parsed.startedAt)) /
                    1000
                );

                if (
                  elapsed >= 0 &&
                  parsed.status !== "Active"
                ) {
                  setTimerStatus(
                    parsed.status
                  );

                  setTimerSeconds(elapsed);

                  setTimerOpen(true);
                }
              }
            }
          } catch (storageError) {
            console.error(
              "Timer localStorage error:",
              storageError
            );
          }
        }
      } catch (err) {
        console.error(
          "Failed to fetch user details:",
          err
        );
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  // ============================================================
  // TIMER TICK
  // ============================================================

  useEffect(() => {
    if (
      !timerOpen ||
      !timerStatus
    ) {
      return;
    }

    const interval = setInterval(() => {
      try {
        const savedTimer =
          localStorage.getItem(
            "crm_status_timer"
          );

        if (!savedTimer) {
          return;
        }

        const parsed =
          JSON.parse(savedTimer);

        if (!parsed?.startedAt) {
          return;
        }

        const elapsed = Math.floor(
          (Date.now() -
            Number(parsed.startedAt)) /
            1000
        );

        setTimerSeconds(
          Math.max(0, elapsed)
        );
      } catch (error) {
        console.error(
          "Timer update error:",
          error
        );
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [timerOpen, timerStatus]);

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
    if (statusUpdating) return;

    const oldStatus = userStatus;

    setStatusOpen(false);

    // ========================================================
    // ACTIVE
    // ========================================================

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

        if (!res.ok || !data.success) {
          throw new Error(
            data.message ||
              "Failed to update status"
          );
        }

        setUserStatus("Active");

        // Remove saved timer
        localStorage.removeItem(
          "crm_status_timer"
        );

        setTimerOpen(false);
        setTimerStatus(null);
        setTimerSeconds(0);
      } catch (error) {
        console.error(
          "Status update error:",
          error
        );

        setUserStatus(oldStatus);

        alert(
          "Status update nahi ho saka."
        );
      } finally {
        setStatusUpdating(false);
      }

      return;
    }

    // ========================================================
    // NON ACTIVE STATUS
    // ========================================================

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

      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update status"
        );
      }

      // ======================================================
      // UPDATE STATE
      // ======================================================

      setUserStatus(newStatus);

      // ======================================================
      // SAVE TIMER START TIME LOCALLY
      // ======================================================

      const timerData = {
        status: newStatus,
        startedAt: Date.now(),
      };

      localStorage.setItem(
        "crm_status_timer",
        JSON.stringify(timerData)
      );

      // ======================================================
      // OPEN MODAL
      // ======================================================

      setTimerStatus(newStatus);
      setTimerSeconds(0);
      setTimerOpen(true);
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      setUserStatus(oldStatus);

      alert(
        "Status update nahi ho saka."
      );
    } finally {
      setStatusUpdating(false);
    }
  };

  // ============================================================
  // END BREAK / RETURN ACTIVE
  // ============================================================

  const endStatusTimer = async () => {
    if (statusUpdating) return;

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

      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to activate user"
        );
      }

      // ======================================================
      // RESET STATUS
      // ======================================================

      setUserStatus("Active");

      // ======================================================
      // REMOVE TIMER
      // ======================================================

      localStorage.removeItem(
        "crm_status_timer"
      );

      setTimerOpen(false);
      setTimerStatus(null);
      setTimerSeconds(0);
    } catch (error) {
      console.error(
        "End status error:",
        error
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

  const userInitial = currentUser.name
    ? currentUser.name
        .trim()
        .charAt(0)
        .toUpperCase()
    : "";

  const isAdmin =
    currentUser.role?.toLowerCase() ===
    "admin";

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
          <h1 className="text-xl font-extrabold text-slate-900">
            Dashboard
          </h1>

          <p className="text-xs text-slate-500 mt-0.5">
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
              , {loginDetails.date} at{" "}
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

            {/* ================================================
                AVATAR
            ================================================= */}

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
                  src={currentUser.avatar}
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

            {/* ================================================
                USER DETAILS
            ================================================= */}

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
                      {currentUser.role}
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
                    disabled={statusUpdating}
                    onClick={() =>
                      setStatusOpen(
                        (prev) => !prev
                      )
                    }
                    className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border ${selectedStatus.bg} ${selectedStatus.color} border-slate-200/70 hover:shadow-sm transition-all duration-200 disabled:opacity-60`}
                  >

                    <span
                      className={`w-2 h-2 rounded-full ${selectedStatus.dot} ${
                        userStatus === "Active"
                          ? "animate-pulse"
                          : ""
                      }`}
                    />

                    <span className="text-[11px] font-bold whitespace-nowrap">
                      {selectedStatus.label}
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
                              className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-all ${
                                isSelected
                                  ? `${option.bg} ${option.color}`
                                  : "hover:bg-slate-50 text-slate-600"
                              } disabled:opacity-50`}
                            >

                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                  isSelected
                                    ? option.bg
                                    : "bg-slate-100"
                                }`}
                              >
                                <Icon
                                  size={14}
                                  className={
                                    isSelected
                                      ? option.color
                                      : "text-slate-500"
                                  }
                                />
                              </div>

                              <span
                                className={`text-xs font-semibold flex-1 ${
                                  isSelected
                                    ? option.color
                                    : "text-slate-700"
                                }`}
                              >
                                {
                                  option.label
                                }
                              </span>

                              {isSelected && (
                                <Check
                                  size={14}
                                  className={
                                    option.color
                                  }
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
          TIMER MODAL
      ======================================================= */}


{/* ======================================================
    LOCKED TIMER MODAL
======================================================= */}

{timerOpen &&
  timerStatus &&
  timerStatus !== "Active" && (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">

      {/* ==================================================
          FULL SCREEN BACKDROP
          No click close
      =================================================== */}

      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" />

      {/* ==================================================
          CENTER MODAL
      =================================================== */}

      <div
        className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ==================================================
            TOP STATUS LINE
        =================================================== */}

        <div
          className={`h-1.5 w-full ${timerOption.dot}`}
        />

        {/* ==================================================
            CONTENT
        =================================================== */}

        <div className="px-6 sm:px-8 py-9 text-center">

          {/* ==================================================
              STATUS ICON
          =================================================== */}

          <div
            className={`mx-auto w-20 h-20 rounded-3xl ${timerOption.bg} ${timerOption.color} flex items-center justify-center shadow-sm`}
          >
            <TimerIcon size={36} />
          </div>

          {/* ==================================================
              STATUS LABEL
          =================================================== */}

          <p className="mt-6 text-[10px] uppercase tracking-[0.25em] font-extrabold text-slate-400">
            Current Status
          </p>

          <h2
            className={`mt-1 text-2xl sm:text-3xl font-black ${timerOption.color}`}
          >
            {timerStatus}
          </h2>

          {/* ==================================================
              TIMER BOX
          =================================================== */}

          <div className="mt-7 rounded-2xl bg-slate-50 border border-slate-200 px-5 py-7">

            <div className="flex items-center justify-center gap-2 text-slate-400 mb-3">
              <Clock3 size={16} />

              <span className="text-xs font-bold">
                Time Elapsed
              </span>
            </div>

            <div className="text-4xl sm:text-5xl font-black tracking-[0.08em] text-slate-900 tabular-nums">
              {formatTimer(timerSeconds)}
            </div>

          </div>

          {/* ==================================================
              LOCK MESSAGE
          =================================================== */}

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />

            <span>
              Status is currently active
            </span>
          </div>

          {/* ==================================================
              RETURN ACTIVE
          =================================================== */}

          <button
            type="button"
            disabled={statusUpdating}
            onClick={endStatusTimer}
            className="mt-6 w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-3.5 px-5 text-sm font-bold transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {statusUpdating
              ? "Updating..."
              : "Return to Active"}
          </button>

        </div>
      </div>
    </div>
  )}


    </>
  );
}


