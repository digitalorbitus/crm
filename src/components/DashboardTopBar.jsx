


















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

//   // ============================================================
//   // NOTIFICATION ICONS
//   // ============================================================
//   Bell,
//   X,
//   CheckCheck,
//   MessageSquare,
//   Info,
//   AlertCircle,
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
//   // NOTIFICATIONS
//   // ============================================================

//   const [notifications, setNotifications] =
//     useState([]);

//   const [unreadCount, setUnreadCount] =
//     useState(0);

//   const [notificationOpen, setNotificationOpen] =
//     useState(false);

//   const [notificationModal, setNotificationModal] =
//     useState(null);

//   const [notificationsLoading, setNotificationsLoading] =
//     useState(false);

//   const notificationRef = useRef(null);

//   const notificationInitializedRef =
//     useRef(false);

//   const seenNotificationIdsRef =
//     useRef(new Set());

//   // ============================================================
//   // OFFICE CLOSING WARNING
//   // ============================================================

//   // Office closing time — California time
//   const OFFICE_CLOSE_HOUR = 17; // 5:00 PM
//   const OFFICE_CLOSE_MINUTE = 0;
//   const OFFICE_WARNING_MINUTES = 5;

//   const officeClosingShownRef = useRef(false);

//   const getOfficeClosingKey = () => {
//     const dateKey = new Intl.DateTimeFormat("en-CA", {
//       timeZone: "America/Los_Angeles",
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//     }).format(new Date());

//     return `office_closing_warning_${dateKey}`;
//   };

//   // ============================================================
//   // LOGIN DETAILS — CALIFORNIA TIME
//   // ============================================================

//   const [loginDetails] = useState(() => {
//     const now = new Date();

//     const timeZone =
//       "America/Los_Angeles";

//     return {
//       day: now.toLocaleDateString(
//         "en-US",
//         {
//           weekday: "long",
//           timeZone,
//         }
//       ),

//       date: now.toLocaleDateString(
//         "en-US",
//         {
//           month: "short",
//           day: "numeric",
//           year: "numeric",
//           timeZone,
//         }
//       ),

//       time: now.toLocaleTimeString(
//         "en-US",
//         {
//           hour: "2-digit",
//           minute: "2-digit",
//           second: "2-digit",
//           hour12: true,
//           timeZone,
//         }
//       ),
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
//     currentUser.role?.toLowerCase() ===
//     "admin";

//   // ============================================================
//   // VISIBLE STATUS OPTIONS
//   // ============================================================

//   const visibleStatusOptions =
//     statusOptions.filter((option) => {
//       if (
//         option.adminOnly &&
//         !isAdmin
//       ) {
//         return false;
//       }

//       return true;
//     });

//   // ============================================================
//   // SELECTED STATUS
//   // ============================================================

//   const selectedStatus =
//     statusOptions.find(
//       (status) =>
//         status.value === userStatus
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

//     const secs =
//       safeSeconds % 60;

//     return [
//       hrs
//         .toString()
//         .padStart(2, "0"),

//       mins
//         .toString()
//         .padStart(2, "0"),

//       secs
//         .toString()
//         .padStart(2, "0"),
//     ].join(":");
//   };

//   // ============================================================
//   // CALCULATE ELAPSED TIME
//   // ============================================================

//   const calculateElapsedTime = (
//     startedAt
//   ) => {
//     if (!startedAt) {
//       return 0;
//     }

//     const startTime =
//       new Date(
//         startedAt
//       ).getTime();

//     if (
//       Number.isNaN(startTime)
//     ) {
//       return 0;
//     }

//     const elapsed =
//       Math.floor(
//         (Date.now() -
//           startTime) /
//           1000
//       );

//     return Math.max(
//       0,
//       elapsed
//     );
//   };

//   // ============================================================
//   // NOTIFICATION TIME
//   // ============================================================

//   const formatNotificationTime = (
//     value
//   ) => {
//     if (!value) {
//       return "";
//     }

//     const date =
//       new Date(value);

//     if (
//       Number.isNaN(
//         date.getTime()
//       )
//     ) {
//       return "";
//     }

//     return date.toLocaleString(
//       "en-US",
//       {
//         timeZone:
//           "America/Los_Angeles",

//         month: "short",

//         day: "numeric",

//         hour: "numeric",

//         minute: "2-digit",
//       }
//     );
//   };

//   // ============================================================
//   // NOTIFICATION ICON
//   // ============================================================

//   const getNotificationIcon = (
//     type
//   ) => {
//     switch (
//       String(type || "")
//         .toLowerCase()
//     ) {
//       case "message":
//         return MessageSquare;

//       case "warning":
//         return AlertCircle;

//       case "success":
//         return Check;

//       default:
//         return Info;
//     }
//   };

//   // ============================================================
//   // MARK SINGLE NOTIFICATION READ
//   // ============================================================

//   const markNotificationRead =
//     async (notificationId) => {
//       try {
//         const res =
//           await fetch(
//             `/api/notifications/${notificationId}/read`,
//             {
//               method: "PUT",

//               credentials:
//                 "include",
//             }
//           );

//         if (!res.ok) {
//           return;
//         }

//         setNotifications(
//           (previous) =>
//             previous.map(
//               (item) =>
//                 Number(item.id) ===
//                 Number(
//                   notificationId
//                 )
//                   ? {
//                       ...item,
//                       is_read: 1,
//                     }
//                   : item
//             )
//         );

//         setUnreadCount(
//           (previous) =>
//             Math.max(
//               0,
//               previous - 1
//             )
//         );
//       } catch (error) {
//         console.error(
//           "Mark notification read error:",
//           error
//         );
//       }
//     };

//   // ============================================================
//   // MARK ALL NOTIFICATIONS READ
//   // ============================================================

//   const markAllNotificationsRead =
//     async () => {
//       try {
//         const res =
//           await fetch(
//             "/api/notifications/read-all",
//             {
//               method: "PUT",
//               credentials:
//                 "include",
//             }
//           );

//         if (!res.ok) {
//           return;
//         }

//         setNotifications(
//           (previous) =>
//             previous.map(
//               (item) => ({
//                 ...item,
//                 is_read: 1,
//               })
//             )
//         );

//         setUnreadCount(0);
//       } catch (error) {
//         console.error(
//           "Mark all notifications error:",
//           error
//         );
//       }
//     };

//   // ============================================================
//   // FETCH NOTIFICATIONS
//   // ============================================================

//   const fetchNotifications =
//     async () => {
//       try {
//         setNotificationsLoading(
//           true
//         );

//         const res =
//           await fetch(
//             `/api/notifications?limit=30&_live=${Date.now()}`,
//             {
//               method: "GET",

//               credentials:
//                 "include",

//               cache: "no-store",

//               headers: {
//                 "Cache-Control":
//                   "no-cache",
//               },
//             }
//           );

//         if (!res.ok) {
//           return;
//         }

//         const data =
//           await res.json();

//         if (!data?.success) {
//           return;
//         }

//         const list =
//           Array.isArray(
//             data.notifications
//           )
//             ? data.notifications
//             : [];

//         setNotifications(list);

//         setUnreadCount(
//           Number(
//             data.unread_count ||
//               0
//           )
//         );

//         // ======================================================
//         // FIRST LOAD
//         // ======================================================

//         if (
//           !notificationInitializedRef.current
//         ) {
//           list.forEach(
//             (item) => {
//               seenNotificationIdsRef.current.add(
//                 Number(
//                   item.id
//                 )
//               );
//             }
//           );

//           notificationInitializedRef.current =
//             true;

//           return;
//         }

//         // ======================================================
//         // FIND NEW UNREAD NOTIFICATION
//         // ======================================================

//         const newNotification =
//           list.find(
//             (item) => {
//               const id =
//                 Number(
//                   item.id
//                 );

//               const alreadySeen =
//                 seenNotificationIdsRef.current.has(
//                   id
//                 );

//               const unread =
//                 Number(
//                   item.is_read
//                 ) === 0;

//               return (
//                 !alreadySeen &&
//                 unread
//               );
//             }
//           );

//         // ======================================================
//         // SAVE SEEN IDS
//         // ======================================================

//         list.forEach(
//           (item) => {
//             seenNotificationIdsRef.current.add(
//               Number(
//                 item.id
//               )
//             );
//           }
//         );

//         // ======================================================
//         // OPEN MODAL FOR NEW NOTIFICATION
//         // ======================================================

//         if (
//           newNotification
//         ) {
//           setNotificationModal(
//             newNotification
//           );

//           await markNotificationRead(
//             newNotification.id
//           );
//         }
//       } catch (error) {
//         console.error(
//           "Notification fetch error:",
//           error
//         );
//       } finally {
//         setNotificationsLoading(
//           false
//         );
//       }
//     };

//   // ============================================================
//   // CHECK OFFICE CLOSING TIME
//   // ============================================================

//   const checkOfficeClosingTime = () => {
//     try {
//       const now = new Date();

//       const parts = new Intl.DateTimeFormat("en-US", {
//         timeZone: "America/Los_Angeles",
//         hour: "2-digit",
//         minute: "2-digit",
//         second: "2-digit",
//         hour12: false,
//       }).formatToParts(now);

//       const getPart = (type) =>
//         Number(
//           parts.find((part) => part.type === type)?.value || 0
//         );

//       let currentHour = getPart("hour");
//       const currentMinute = getPart("minute");

//       if (currentHour === 24) {
//         currentHour = 0;
//       }

//       const currentTotalMinutes =
//         currentHour * 60 + currentMinute;

//       const officeCloseTotalMinutes =
//         OFFICE_CLOSE_HOUR * 60 + OFFICE_CLOSE_MINUTE;

//       const warningStart =
//         officeCloseTotalMinutes - OFFICE_WARNING_MINUTES;

//       // Show only during the 5-minute warning window.
//       const shouldShow =
//         currentTotalMinutes >= warningStart &&
//         currentTotalMinutes < officeCloseTotalMinutes;

//       if (!shouldShow) {
//         return;
//       }

//       const storageKey = getOfficeClosingKey();

//       // Do not show this warning more than once per day.
//       if (
//         typeof window !== "undefined" &&
//         localStorage.getItem(storageKey) === "1"
//       ) {
//         return;
//       }

//       if (officeClosingShownRef.current) {
//         return;
//       }

//       officeClosingShownRef.current = true;

//       if (typeof window !== "undefined") {
//         localStorage.setItem(storageKey, "1");
//       }

//       // Use the existing notification modal/UI.
//       setNotificationModal({
//         id: `office-closing-${storageKey}`,
//         title: "Office Closing Soon",
//         message: "Office time will end in 5 minutes.",
//         type: "warning",
//         is_read: 1,
//         created_at: new Date().toISOString(),
//         isOfficeClosing: true,
//       });
//     } catch (error) {
//       console.error("Office closing check error:", error);
//     }
//   };

//   // ============================================================
//   // LOAD CURRENT USER + STATUS
//   // ============================================================

//   useEffect(() => {

//     console.log("API CALL.")
//     // let mounted = true;

//     async function fetchUserData() {
//       try {
//         // ======================================================
//         // CURRENT USER
//         // ======================================================

//         const res = await fetch("/api/auth/me");

//         const data =
//           await res.json();

//           console.log(data, "data")

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

//           // if (!mounted) {
//           //   return;
//           // }

//           setCurrentUser({
//             id:
//               userObj.id ||
//               null,

//             name:
//               userName,

//             email:
//               userObj.email ||
//               "",

//             role:
//               userObj.role ||
//               "user",

//             avatar:
//               avatarUrl,
//           });
//         }

//         // ======================================================
//         // CURRENT STATUS
//         // ======================================================

//         const statusRes =
//           await fetch(
//             "/api/users/status",
//             {
//               cache: "no-store",
//               credentials:
//                 "include",
//             }
//           );

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
//             statusData.break_count ??
//               0
//           );

//         // if (mounted) {
//           setBreakCount(
//             Math.max(
//               0,
//               apiBreakCount
//             )
//           );
//         // }

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

//         setUserStatus(
//           dbStatus
//         );

//         setStatusStartedAt(
//           dbStartedAt
//         );

//         // ======================================================
//         // RESTORE TIMER
//         // ======================================================

//         if (
//           dbStatus !==
//             "Active" &&
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

//           setTimerOpen(
//             true
//           );
//         } else {
//           setTimerStatus(
//             null
//           );

//           setTimerSeconds(
//             0
//           );

//           setTimerOpen(
//             false
//           );
//         }
//       } catch (error) {
//         console.error(
//           "Failed to fetch user/status:",
//           error
//         );
//       } finally {
//         // if (mounted) {
//           setLoading(false);
//         // }
//       }
//     }

//     fetchUserData();

//     // return () => {
//     //   mounted = false;
//     // };
//   }, []);

//   // ============================================================
//   // NOTIFICATION POLLING
//   // ============================================================

//   useEffect(() => {
//     if (!currentUser.id) {
//       return;
//     }

//     // Load existing notifications.
//     fetchNotifications();

//     // Check office closing warning immediately.
//     checkOfficeClosingTime();

//     // Continue checking every 15 seconds.
//     const interval = setInterval(() => {
//       fetchNotifications();
//       checkOfficeClosingTime();
//     }, 15000);

//     return () => {
//       clearInterval(interval);
//     };
//   }, [currentUser.id]);

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

//     const updateTimer =
//       () => {
//         const startedTime =
//           new Date(
//             statusStartedAt
//           ).getTime();

//         if (
//           Number.isNaN(
//             startedTime
//           )
//         ) {
//           setTimerSeconds(
//             0
//           );

//           return;
//         }

//         const elapsed =
//           Math.max(
//             0,
//             Math.floor(
//               (Date.now() -
//                 startedTime) /
//                 1000
//             )
//           );

//         setTimerSeconds(
//           elapsed
//         );
//       };

//     updateTimer();

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
//   // CLOSE DROPDOWNS OUTSIDE
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

//       if (
//         notificationRef.current &&
//         !notificationRef.current.contains(
//           event.target
//         )
//       ) {
//         setNotificationOpen(
//           false
//         );
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
//     async (
//       newStatus
//     ) => {
//       if (
//         statusUpdating
//       ) {
//         return;
//       }

//       const selectedOption =
//         statusOptions.find(
//           (option) =>
//             option.value ===
//             newStatus
//         );

//       // ========================================================
//       // SAFETY CHECK
//       // ========================================================

//       if (!selectedOption) {
//         return;
//       }

//       // ========================================================
//       // ADMIN ONLY CHECK
//       // ========================================================

//       if (
//         selectedOption.adminOnly &&
//         !isAdmin
//       ) {
//         return;
//       }

//       // ========================================================
//       // DISABLED CHECK
//       // ========================================================

//       if (
//         selectedOption.disabled
//       ) {
//         return;
//       }

//       // ========================================================
//       // BREAK LIMIT FRONTEND CHECK
//       // ========================================================

//       if (
//         selectedOption.isBreak &&
//         breakLimitReached
//       ) {
//         alert(
//           "Break limit reached. You can take maximum 5 breaks within 24 hours."
//         );

//         setStatusOpen(
//           false
//         );

//         return;
//       }

//       const oldStatus =
//         userStatus;

//       const oldStartedAt =
//         statusStartedAt;

//       setStatusOpen(
//         false
//       );

//       // ==========================================================
//       // ACTIVE
//       // ==========================================================

//       if (
//         newStatus ===
//         "Active"
//       ) {
//         try {
//           setStatusUpdating(
//             true
//           );

//           const res =
//             await fetch(
//               "/api/users/status",
//               {
//                 method:
//                   "PUT",

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

//           // ======================================================
//           // UPDATE BREAK COUNT
//           // ======================================================

//           if (
//             data.break_count !==
//             undefined
//           ) {
//             setBreakCount(
//               Number(
//                 data.break_count
//               )
//             );
//           }

//           // ======================================================
//           // UPDATE STATUS
//           // ======================================================

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
//             error?.message ||
//               "Status update nahi ho saka."
//           );
//         } finally {
//           setStatusUpdating(
//             false
//           );
//         }

//         return;
//       }

//       // ==========================================================
//       // NON ACTIVE STATUS
//       // ==========================================================

//       try {
//         setStatusUpdating(
//           true
//         );

//         const res =
//           await fetch(
//             "/api/users/status",
//             {
//               method:
//                 "PUT",

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

//         // ========================================================
//         // 429 = 5 BREAK LIMIT
//         // ========================================================

//         if (
//           res.status ===
//             429 ||
//           data?.error ===
//             "MAX_BREAKS_REACHED"
//         ) {
//           if (
//             data?.break_count !==
//             undefined
//           ) {
//             setBreakCount(
//               Number(
//                 data.break_count
//               )
//             );
//           }

//           alert(
//             data?.message ||
//               "Break limit reached. You can take maximum 5 breaks within 24 hours."
//           );

//           return;
//         }

//         if (
//           !res.ok ||
//           !data.success
//         ) {
//           throw new Error(
//             data.message ||
//               "Failed to update status"
//           );
//         }

//         // ========================================================
//         // UPDATE BREAK COUNT
//         // ========================================================

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

//         // ========================================================
//         // DATABASE START TIME
//         // ========================================================

//         const dbStartedAt =
//           data.status_started_at ??
//           data.user
//             ?.status_started_at ??
//           null;

//         // ========================================================
//         // UPDATE STATUS
//         // ========================================================

//         setUserStatus(
//           newStatus
//         );

//         setStatusStartedAt(
//           dbStartedAt
//         );

//         setTimerStatus(
//           newStatus
//         );

//         // ========================================================
//         // CALCULATE TIMER
//         // ========================================================

//         const elapsed =
//           calculateElapsedTime(
//             dbStartedAt
//           );

//         setTimerSeconds(
//           elapsed
//         );

//         setTimerOpen(
//           true
//         );
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
//     };

//   // ============================================================
//   // END STATUS / RETURN ACTIVE
//   // ============================================================

//   const endStatusTimer =
//     async () => {
//       if (
//         statusUpdating
//       ) {
//         return;
//       }

//       const oldStatus =
//         userStatus;

//       const oldStartedAt =
//         statusStartedAt;

//       try {
//         setStatusUpdating(
//           true
//         );

//         const res =
//           await fetch(
//             "/api/users/status",
//             {
//               method:
//                 "PUT",

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

//         // ========================================================
//         // UPDATE BREAK COUNT
//         // ========================================================

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

//         // ========================================================
//         // RESET STATUS
//         // ========================================================

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
//           error?.message ||
//             "Status change nahi ho saka."
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
//               NOTIFICATIONS
//           =================================================== */}

//           <div
//             ref={
//               notificationRef
//             }
//             className="relative shrink-0"
//           >

//             {/* BELL BUTTON */}

//             <button
//               type="button"
//               onClick={() =>
//                 setNotificationOpen(
//                   (prev) =>
//                     !prev
//                 )
//               }
//               className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:border-[#741C29]/20 hover:bg-[#741C29]/5 hover:text-[#741C29] active:scale-95"
//               aria-label="Notifications"
//             >

//               <Bell
//                 size={18}
//                 strokeWidth={2}
//               />

//               {/* UNREAD BADGE */}

//               {unreadCount >
//                 0 && (
//                 <span className="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-[#ec3737] px-1 text-[9px] font-black leading-none text-white shadow-sm">
//                   {unreadCount >
//                   99
//                     ? "99+"
//                     : unreadCount}
//                 </span>
//               )}

//             </button>

//             {/* ==================================================
//                 NOTIFICATION DROPDOWN
//             =================================================== */}

//             {notificationOpen && (
//               <div className="absolute right-0 top-[calc(100%+10px)] z-[100] w-[350px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

//                 {/* HEADER */}

//                 <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">

//                   <div className="flex items-center gap-2">

//                     <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#741C29]/10">

//                       <Bell
//                         size={14}
//                         className="text-[#741C29]"
//                       />

//                     </div>

//                     <div>

//                       <p className="text-sm font-extrabold text-slate-900">
//                         Notifications
//                       </p>

//                       <p className="text-[9px] font-medium text-slate-400">
//                         {unreadCount >
//                         0
//                           ? `${unreadCount} unread`
//                           : "You're all caught up"}
//                       </p>

//                     </div>

//                   </div>

//                   {unreadCount >
//                     0 && (
//                     <button
//                       type="button"
//                       onClick={
//                         markAllNotificationsRead
//                       }
//                       className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-bold text-[#741C29] transition hover:bg-[#741C29]/5"
//                     >

//                       <CheckCheck
//                         size={13}
//                       />

//                       Mark all

//                     </button>
//                   )}

//                 </div>

//                 {/* NOTIFICATION LIST */}

//                 <div className="max-h-[380px] overflow-y-auto">

//                   {notificationsLoading &&
//                   notifications.length ===
//                     0 ? (

//                     <div className="flex flex-col items-center justify-center py-10">

//                       <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-[#741C29]" />

//                       <p className="mt-3 text-[10px] font-medium text-slate-400">
//                         Loading notifications...
//                       </p>

//                     </div>

//                   ) : notifications.length ===
//                     0 ? (

//                     <div className="flex flex-col items-center justify-center px-6 py-12 text-center">

//                       <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">

//                         <Bell
//                           size={20}
//                           className="text-slate-400"
//                         />

//                       </div>

//                       <p className="mt-3 text-sm font-bold text-slate-700">
//                         No notifications
//                       </p>

//                       <p className="mt-1 text-[10px] text-slate-400">
//                         New messages and alerts
//                         will appear here.
//                       </p>

//                     </div>

//                   ) : (

//                     notifications.map(
//                       (
//                         notification
//                       ) => {

//                         const Icon =
//                           getNotificationIcon(
//                             notification.type
//                           );

//                         const isUnread =
//                           Number(
//                             notification.is_read
//                           ) ===
//                           0;

//                         return (
//                           <button
//                             key={
//                               notification.id
//                             }
//                             type="button"
//                             onClick={() => {

//                               setNotificationModal(
//                                 notification
//                               );

//                               setNotificationOpen(
//                                 false
//                               );

//                               if (
//                                 isUnread
//                               ) {
//                                 markNotificationRead(
//                                   notification.id
//                                 );
//                               }

//                             }}
//                             className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
//                               isUnread
//                                 ? "bg-[#741C29]/[0.025]"
//                                 : "bg-white"
//                             }`}
//                           >

//                             {/* ICON */}

//                             <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#741C29]/10">

//                               <Icon
//                                 size={16}
//                                 className="text-[#741C29]"
//                               />

//                             </div>

//                             {/* CONTENT */}

//                             <div className="min-w-0 flex-1">

//                               <div className="flex items-start justify-between gap-2">

//                                 <p
//                                   className={`text-xs ${
//                                     isUnread
//                                       ? "font-extrabold text-slate-900"
//                                       : "font-semibold text-slate-700"
//                                   }`}
//                                 >
//                                   {
//                                     notification.title
//                                   }
//                                 </p>

//                                 {isUnread && (
//                                   <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#ec3737]" />
//                                 )}

//                               </div>

//                               <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">
//                                 {
//                                   notification.message
//                                 }
//                               </p>

//                               <p className="mt-1.5 text-[9px] font-medium text-slate-400">
//                                 {formatNotificationTime(
//                                   notification.created_at
//                                 )}
//                               </p>

//                             </div>

//                           </button>
//                         );
//                       }
//                     )

//                   )}

//                 </div>

//                 {/* FOOTER */}

//                 {notifications.length >
//                   0 && (
//                   <div className="border-t border-slate-100 bg-slate-50 px-4 py-2">

//                     <p className="text-center text-[9px] font-medium text-slate-400">
//                       Auto refresh every 15 seconds
//                     </p>

//                   </div>
//                 )}

//               </div>
//             )}

//           </div>

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
//             ref={
//               statusRef
//             }
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
//                   {
//                     userInitial
//                   }
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

//                   <span
//                     className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md border ${
//                       isAdmin
//                         ? "bg-purple-50 text-purple-700 border-purple-200"
//                         : "bg-emerald-50 text-emerald-700 border-emerald-200"
//                     }`}
//                   >
//                     {
//                       currentUser.role
//                     }
//                   </span>

//                 )}

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

//                       {/* HEADER */}

//                       <div className="px-2.5 py-2 mb-1">

//                         <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
//                           Set your status
//                         </p>

//                       </div>

//                       {/* BREAK COUNTER */}

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

//                       {/* OPTIONS */}

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
//           NEW NOTIFICATION MODAL
//       ======================================================= */}

//       {notificationModal &&
//         typeof document !==
//           "undefined" &&
//         createPortal(
//           <div className="fixed inset-0 z-[2147483647] flex min-h-screen w-screen items-center justify-center p-4">

//             {/* BACKDROP */}

//             <div
//               className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
//               onClick={() =>
//                 setNotificationModal(
//                   null
//                 )
//               }
//             />

//             {/* MODAL CARD */}

//             <div
//               className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.45)]"
//               onClick={(e) =>
//                 e.stopPropagation()
//               }
//             >

//               {/* TOP ACCENT */}

//               <div className="h-1.5 bg-[#741C29]" />

//               {/* CLOSE BUTTON */}

//               <button
//                 type="button"
//                 onClick={() =>
//                   setNotificationModal(
//                     null
//                   )
//                 }
//                 className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
//               >

//                 <X
//                   size={16}
//                 />

//               </button>

//               {/* CONTENT */}

//               <div className="p-6 sm:p-7">

//                 {/* HEADER */}

//                 <div className="flex items-start gap-4">

//                   <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#741C29]/10">

//                     {(() => {

//                       const Icon =
//                         getNotificationIcon(
//                           notificationModal.type
//                         );

//                       return (
//                         <Icon
//                           size={23}
//                           className="text-[#741C29]"
//                         />
//                       );

//                     })()}

//                   </div>

//                   <div className="min-w-0 flex-1 pr-6">

//                     <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#741C29]">
//                       New Notification
//                     </p>

//                     <h2 className="mt-1 text-lg font-black leading-tight text-slate-900">
//                       {
//                         notificationModal.title
//                       }
//                     </h2>

//                     <p className="mt-1 text-[9px] font-medium text-slate-400">
//                       {formatNotificationTime(
//                         notificationModal.created_at
//                       )}
//                     </p>

//                   </div>

//                 </div>

//                 {/* MESSAGE */}

//                 <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">

//                   <p className="text-sm font-medium leading-6 text-slate-600">
//                     {
//                       notificationModal.message
//                     }
//                   </p>

//                 </div>

//                 {/* GOT IT */}

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setNotificationModal(
//                       null
//                     )
//                   }
//                   className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#790214] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#790214]/20 transition hover:bg-[#650111] active:scale-[0.98]"
//                 >

//                   <CheckCheck
//                     size={16}
//                   />

//                   Got it

//                 </button>

//               </div>

//             </div>
//           </div>,
//           document.body
//         )}

//       {/* ======================================================
//           LOCKED STATUS TIMER
//       ======================================================= */}

//       {timerOpen &&
//         timerStatus &&
//         timerStatus !==
//           "Active" &&
//         typeof document !==
//           "undefined" &&
//         createPortal(
//           <div
//             className="fixed inset-0 z-[2147483640] flex min-h-screen w-screen items-center justify-center p-4"
//             style={{
//               position: "fixed",
//               inset: 0,
//               width: "100vw",
//               height: "100vh",
//               pointerEvents:
//                 "auto",
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
//               className="relative z-[2147483640] w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.45)]"
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
//                     {
//                       timerStatus
//                     }
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

import {
  Bell,
  Calendar,
  ChevronDown,
  Clock3,
  CircleOff,
  LogOut,
  Menu,
  Moon,
  Phone,
  Utensils,
  User,
  Users,
  X,
  Check,
  MoreHorizontal,
  BriefcaseBusiness,
  Coffee,
  AlertCircle,
} from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const MAX_BREAKS = 5;
const CALIFORNIA_TIMEZONE = "America/Los_Angeles";

export default function DashboardTopBar({
  onMenuClick,
  onLogout,
}) {
  // ============================================================
  // USER
  // ============================================================

  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [imageError, setImageError] = useState(false);

  // ============================================================
  // STATUS
  // ============================================================

  const [status, setStatus] = useState("Active");

  const [statusStartedAt, setStatusStartedAt] = useState(null);

  const [statusDropdownOpen, setStatusDropdownOpen] =
    useState(false);

  // ============================================================
  // TIMER
  // ============================================================

  const [timerOpen, setTimerOpen] = useState(false);

  const [timerStatus, setTimerStatus] = useState(null);

  const [timerSeconds, setTimerSeconds] = useState(0);

  /*
    IMPORTANT

    true  = new break just started
    false = existing break restored from backend
  */
  const [isNewTimer, setIsNewTimer] = useState(false);

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  const [notifications, setNotifications] = useState([]);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const notificationRef = useRef(null);

  // ============================================================
  // OFFICE CLOSING
  // ============================================================

  const [officeClosingWarning, setOfficeClosingWarning] =
    useState(false);

  const [officeClosed, setOfficeClosed] =
    useState(false);

  // ============================================================
  // LOGIN DETAILS
  //
  // IMPORTANT:
  // Do NOT use new Date() inside useState initializer.
  // That causes hydration mismatch.
  // ============================================================

  const [loginDetails, setLoginDetails] = useState({
    day: "",
    date: "",
    time: "",
  });

  // ============================================================
  // STATUS OPTIONS
  // ============================================================

  const statusOptions = useMemo(
    () => [
      {
        value: "Active",
        label: "Active",
        icon: Check,
        color: "text-green-600",
        bg: "bg-green-50",
      },
      {
        value: "Namaz Break",
        label: "Namaz Break",
        icon: Moon,
        color: "text-indigo-600",
        bg: "bg-indigo-50",
      },
      {
        value: "Lunch Break",
        label: "Lunch Break",
        icon: Utensils,
        color: "text-orange-600",
        bg: "bg-orange-50",
      },
      {
        value: "Short Break",
        label: "Short Break",
        icon: Clock3,
        color: "text-teal-600",
        bg: "bg-teal-50",
      },
      {
        value: "Inactive",
        label: "Inactive",
        icon: CircleOff,
        color: "text-red-600",
        bg: "bg-red-50",
        adminOnly: true,
      },
      {
        value: "On Call",
        label: "On Call",
        icon: Phone,
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      {
        value: "Meeting",
        label: "Meeting",
        icon: Users,
        color: "text-purple-600",
        bg: "bg-purple-50",
      },
      {
        value: "Washroom Break",
        label: "Washroom Break",
        icon: Coffee,
        color: "text-cyan-600",
        bg: "bg-cyan-50",
      },
      {
        value: "Other",
        label: "Other",
        icon: MoreHorizontal,
        color: "text-gray-600",
        bg: "bg-gray-50",
      },
    ],
    []
  );

  const isAdmin =
    String(currentUser?.role || "").toLowerCase() ===
    "admin";

const visibleStatusOptions = useMemo(() => {
  // ADMIN → sab statuses
  if (isAdmin) {
    return statusOptions;
  }

  // NORMAL USER → sirf ye 3 breaks + Active
  return statusOptions.filter((item) =>
    [
      "Active",
      "Namaz Break",
      "Lunch Break",
      "Short Break",
    ].includes(item.value)
  );
}, [statusOptions, isAdmin]);

  // ============================================================
  // LOGIN CLOCK
  //
  // Client-side only to avoid hydration mismatch.
  // ============================================================

  useEffect(() => {
    const updateLoginDetails = () => {
      const now = new Date();

      setLoginDetails({
        day: now.toLocaleDateString("en-US", {
          weekday: "long",
          timeZone: CALIFORNIA_TIMEZONE,
        }),

        date: now.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: CALIFORNIA_TIMEZONE,
        }),

        time: now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZone: CALIFORNIA_TIMEZONE,
        }),
      });
    };

    updateLoginDetails();

    const interval = setInterval(
      updateLoginDetails,
      1000
    );

    return () => clearInterval(interval);
  }, []);

  // ============================================================
  // FORMAT TIMER
  // ============================================================

  const formatTimer = (totalSeconds) => {
    const seconds = Math.max(
      0,
      Number(totalSeconds) || 0
    );

    const hours = Math.floor(seconds / 3600);

    const minutes = Math.floor(
      (seconds % 3600) / 60
    );

    const secs = seconds % 60;

    return [
      String(hours).padStart(2, "0"),
      String(minutes).padStart(2, "0"),
      String(secs).padStart(2, "0"),
    ].join(":");
  };

  // ============================================================
  // CALIFORNIA TIME ELAPSED
  // ============================================================

  const calculateElapsedTime = (startedAt) => {
    if (!startedAt) {
      return 0;
    }

    try {
      let startDate;

      const value = String(startedAt).trim();

      /*
        ISO / timezone-aware date
      */
      if (
        value.includes("T") ||
        value.includes("Z") ||
        /[+-]\d{2}:\d{2}$/.test(value)
      ) {
        startDate = new Date(value);
      } else {
        /*
          MySQL format:

          2026-09-22 08:30:15
        */

        const match = value.match(
          /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/
        );

        if (!match) {
          startDate = new Date(value);
        } else {
          const [
            ,
            year,
            month,
            day,
            hour,
            minute,
            second,
          ] = match;

          let utcMs = Date.UTC(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hour),
            Number(minute),
            Number(second)
          );

          const getOffsetMinutes = (date) => {
            const formatter =
              new Intl.DateTimeFormat("en-US", {
                timeZone: CALIFORNIA_TIMEZONE,
                timeZoneName: "longOffset",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hourCycle: "h23",
              });

            const parts =
              formatter.formatToParts(date);

            const zonePart = parts.find(
              (part) =>
                part.type === "timeZoneName"
            );

            const offsetMatch =
              zonePart?.value?.match(
                /GMT([+-])(\d{2}):(\d{2})/
              );

            if (!offsetMatch) {
              return 0;
            }

            const sign =
              offsetMatch[1] === "-"
                ? -1
                : 1;

            const hours = Number(
              offsetMatch[2]
            );

            const minutes = Number(
              offsetMatch[3]
            );

            return (
              sign *
              (hours * 60 + minutes)
            );
          };

          const offsetMinutes =
            getOffsetMinutes(
              new Date(utcMs)
            );

          utcMs -=
            offsetMinutes *
            60 *
            1000;

          startDate = new Date(utcMs);
        }
      }

      if (
        !startDate ||
        Number.isNaN(startDate.getTime())
      ) {
        return 0;
      }

      const elapsed = Math.floor(
        (Date.now() -
          startDate.getTime()) /
          1000
      );

      return Math.max(0, elapsed);
    } catch (error) {
      console.error(
        "Timer calculation error:",
        error
      );

      return 0;
    }
  };

  // ============================================================
  // FETCH CURRENT USER
  // ============================================================

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(
          "/api/auth/me",
          {
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setCurrentUser(
          data?.user || data || null
        );
      } catch (error) {
        console.error(
          "Current user error:",
          error
        );
      }
    };

    fetchCurrentUser();
  }, []);

  // ============================================================
  // RESTORE STATUS AFTER PAGE REFRESH
  // ============================================================

  useEffect(() => {
    const restoreStatus = async () => {
      try {
        const response = await fetch(
          "/api/users/status",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        const currentStatus =
          data?.status || "Active";

        setStatus(currentStatus);

        // ======================================================
        // ACTIVE
        // ======================================================

        if (currentStatus === "Active") {
          setTimerOpen(false);
          setTimerStatus(null);
          setStatusStartedAt(null);
          setTimerSeconds(0);
          setIsNewTimer(false);

          return;
        }

        // ======================================================
        // EXISTING ACTIVE BREAK
        // ======================================================

        const startedAt =
          data?.status_started_at || null;

        setTimerStatus(currentStatus);

        setStatusStartedAt(startedAt);

        /*
          Refresh ke baad existing break hai.

          Isliye backend start time se elapsed calculate hoga.
        */

        const elapsed =
          calculateElapsedTime(startedAt);

        setTimerSeconds(elapsed);

        /*
          IMPORTANT:
          This is NOT a newly started break.
        */

        setIsNewTimer(false);

        setTimerOpen(true);
      } catch (error) {
        console.error(
          "Restore status error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    restoreStatus();
  }, []);

  // ============================================================
  // ⭐ TIMER EFFECT
  //
  // NEW BREAK:
  // 00:00:00 -> 00:00:01 -> 00:00:02
  //
  // EXISTING BREAK:
  // status_started_at -> actual elapsed
  // ============================================================

  useEffect(() => {
    if (!timerOpen || !timerStatus) {
      return;
    }

    // ==========================================================
    // NEW BREAK
    // ==========================================================

    if (isNewTimer) {
      const interval = setInterval(() => {
        setTimerSeconds(
          (previous) => previous + 1
        );
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }

    // ==========================================================
    // EXISTING BREAK
    // ==========================================================

    if (statusStartedAt) {
      const updateTimer = () => {
        setTimerSeconds(
          calculateElapsedTime(
            statusStartedAt
          )
        );
      };

      updateTimer();

      const interval = setInterval(
        updateTimer,
        1000
      );

      return () => {
        clearInterval(interval);
      };
    }
  }, [
    timerOpen,
    timerStatus,
    statusStartedAt,
    isNewTimer,
  ]);

  // ============================================================
  // ⭐ CHANGE STATUS
  // ============================================================

  const handleStatusChange = async (
    newStatus
  ) => {
    if (loading) {
      return;
    }

    if (newStatus === status) {
      setStatusDropdownOpen(false);
      return;
    }

    // Save old state
    const previousStatus = status;

    const previousTimerStatus =
      timerStatus;

    const previousStartedAt =
      statusStartedAt;

    const previousTimerSeconds =
      timerSeconds;

    const previousIsNewTimer =
      isNewTimer;

    try {
      setLoading(true);

      const response = await fetch(
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

      const data =
        await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          alert(
            data?.message ||
              "Maximum break limit reached."
          );
        } else {
          alert(
            data?.message ||
              "Failed to update status."
          );
        }

        return;
      }

      // ========================================================
      // ACTIVE
      // ========================================================

      if (newStatus === "Active") {
        setStatus("Active");

        setTimerOpen(false);

        setTimerStatus(null);

        setStatusStartedAt(null);

        // Reset timer
        setTimerSeconds(0);

        setIsNewTimer(false);

        setStatusDropdownOpen(false);

        return;
      }

      // ========================================================
      // ⭐ NEW BREAK
      // ========================================================

      setStatus(newStatus);

      setTimerStatus(newStatus);

      /*
        ⭐ VERY IMPORTANT ⭐

        Every new break ALWAYS starts at 0.

        Backend ka old elapsed time yahan
        calculate nahi karna.
      */

      setTimerSeconds(0);

      /*
        Mark this timer as NEW.

        Timer effect ab:
        0 -> 1 -> 2 -> 3...
      */

      setIsNewTimer(true);

      /*
        Backend se newly created start time save
        kar rahe hain so refresh ke baad restore ho sake.
      */

      setStatusStartedAt(
        data?.status_started_at ||
          null
      );

      // Open timer modal
      setTimerOpen(true);

      setStatusDropdownOpen(false);
    } catch (error) {
      console.error(
        "Status change error:",
        error
      );

      // Restore previous state
      setStatus(previousStatus);

      setTimerStatus(
        previousTimerStatus
      );

      setStatusStartedAt(
        previousStartedAt
      );

      setTimerSeconds(
        previousTimerSeconds
      );

      setIsNewTimer(
        previousIsNewTimer
      );

      alert(
        "Something went wrong while changing status."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // END TIMER / ACTIVE
  // ============================================================

  const endStatusTimer = async () => {
    try {
      setLoading(true);

      const response = await fetch(
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

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data?.message ||
            "Unable to end break."
        );

        return;
      }

      setStatus("Active");

      setTimerOpen(false);

      setTimerStatus(null);

      setStatusStartedAt(null);

      setTimerSeconds(0);

      setIsNewTimer(false);
    } catch (error) {
      console.error(
        "End timer error:",
        error
      );

      alert(
        "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
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

    try {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return "";
      }

      return date.toLocaleString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return "";
    }
  };

  // ============================================================
  // NOTIFICATION ICON
  // ============================================================

  const getNotificationIcon = (
    notification
  ) => {
    const type = String(
      notification?.type || ""
    ).toLowerCase();

    if (type.includes("break")) {
      return <Clock3 size={17} />;
    }

    if (type.includes("call")) {
      return <Phone size={17} />;
    }

    if (type.includes("user")) {
      return <User size={17} />;
    }

    if (type.includes("alert")) {
      return (
        <AlertCircle size={17} />
      );
    }

    return <Bell size={17} />;
  };

  // ============================================================
  // MARK NOTIFICATION READ
  // ============================================================

  const markNotificationRead = async (
    notificationId
  ) => {
    try {
      await fetch(
        `/api/notifications/${notificationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            read: true,
          }),
        }
      );
    } catch (error) {
      console.error(
        "Notification read error:",
        error
      );
    }

    setNotifications((previous) =>
      previous.map((item) =>
        item.id === notificationId
          ? {
              ...item,
              read: true,
            }
          : item
      )
    );
  };

  // ============================================================
  // MARK ALL NOTIFICATIONS READ
  // ============================================================

  const markAllNotificationsRead =
    async () => {
      try {
        await fetch(
          "/api/notifications/read-all",
          {
            method: "PUT",
            credentials: "include",
          }
        );
      } catch (error) {
        console.error(
          "Read all notification error:",
          error
        );
      }

      setNotifications((previous) =>
        previous.map((item) => ({
          ...item,
          read: true,
        }))
      );
    };

  // ============================================================
  // FETCH NOTIFICATIONS
  // ============================================================

  const fetchNotifications =
    async () => {
      try {
        const response = await fetch(
          "/api/notifications",
          {
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        const list = Array.isArray(data)
          ? data
          : data?.notifications ||
            [];

        setNotifications(list);
      } catch (error) {
        console.error(
          "Notifications error:",
          error
        );
      }
    };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(
      fetchNotifications,
      15000
    );

    return () =>
      clearInterval(interval);
  }, []);

  // ============================================================
  // CLICK OUTSIDE NOTIFICATION
  // ============================================================

  useEffect(() => {
    const handleClickOutside = (
      event
    ) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setNotificationOpen(false);
      }
    };

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
  // UNREAD COUNT
  // ============================================================

  const unreadCount =
    notifications.filter(
      (item) => !item.read
    ).length;

  // ============================================================
  // PROFILE IMAGE
  // ============================================================

  const profileImage =
    currentUser?.avatar ||
    currentUser?.image ||
    currentUser?.profilePic ||
    currentUser?.avatarUrl ||
    currentUser?.profile_picture ||
    null;

  // ============================================================
  // USER NAME
  // ============================================================

  const userName =
    currentUser?.name ||
    currentUser?.full_name ||
    currentUser?.username ||
    "User";

  const userRole =
    currentUser?.role || "Agent";

  // ============================================================
  // STATUS INFO
  // ============================================================

  const currentStatusInfo =
    statusOptions.find(
      (item) => item.value === status
    ) ||
    statusOptions[0];

  const CurrentStatusIcon =
    currentStatusInfo?.icon ||
    Check;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      {/* ======================================================
          TOP BAR
      ====================================================== */}

      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

          {/* LEFT */}
          <div className="flex min-w-0 items-center gap-3">

            {onMenuClick && (
              <button
                type="button"
                onClick={onMenuClick}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50 lg:hidden"
              >
                <Menu size={20} />
              </button>
            )}

            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">
                Dashboard
              </h1>

              <p className="hidden truncate text-sm text-gray-500 sm:block">
                Call Activity & Performance Analytics
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">

            {/* ==================================================
                LOGIN DATE/TIME
            ================================================== */}

            <div className="hidden items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 lg:flex">

              <Calendar
                size={17}
                className="text-gray-500"
              />

              <div className="leading-tight">
                <div className="text-xs font-semibold text-gray-700">
                  {loginDetails.day}
                </div>

                <div className="text-[11px] text-gray-500">
                  {loginDetails.date}
                </div>
              </div>

              <div className="border-l border-gray-300 pl-3 text-xs font-semibold text-gray-700">
                {loginDetails.time}
              </div>
            </div>

            {/* ==================================================
                NOTIFICATIONS
            ================================================== */}

            <div
              ref={notificationRef}
              className="relative"
            >
              <button
                type="button"
                onClick={() =>
                  setNotificationOpen(
                    (previous) =>
                      !previous
                  )
                }
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
              >
                <Bell size={19} />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ec3737] px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 top-12 z-50 w-[350px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        Notifications
                      </h3>

                      <p className="text-xs text-gray-500">
                        {unreadCount} unread
                      </p>
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={
                          markAllNotificationsRead
                        }
                        className="text-xs font-semibold text-[#ec3737] hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[380px] overflow-y-auto">
                    {notifications.length ===
                    0 ? (
                      <div className="px-5 py-10 text-center">
                        <Bell
                          size={28}
                          className="mx-auto mb-2 text-gray-300"
                        />

                        <p className="text-sm text-gray-500">
                          No notifications
                        </p>
                      </div>
                    ) : (
                      notifications.map(
                        (notification) => (
                          <button
                            type="button"
                            key={
                              notification.id
                            }
                            onClick={() =>
                              !notification.read &&
                              markNotificationRead(
                                notification.id
                              )
                            }
                            className={`flex w-full gap-3 border-b border-gray-100 px-4 py-3 text-left transition hover:bg-gray-50 ${
                              !notification.read
                                ? "bg-red-50/40"
                                : "bg-white"
                            }`}
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                              {getNotificationIcon(
                                notification
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-800">
                                {notification.title ||
                                  "Notification"}
                              </p>

                              <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                                {notification.message ||
                                  ""}
                              </p>

                              <p className="mt-1 text-[10px] text-gray-400">
                                {formatNotificationTime(
                                  notification.created_at ||
                                    notification.createdAt
                                )}
                              </p>
                            </div>

                            {!notification.read && (
                              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#ec3737]" />
                            )}
                          </button>
                        )
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ==================================================
                PROFILE / STATUS
            ================================================== */}

            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setStatusDropdownOpen(
                    (previous) =>
                      !previous
                  )
                }
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-2 py-1.5 transition hover:bg-gray-50 sm:px-3"
              >
                {/* Avatar */}

                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">

                  {profileImage &&
                  !imageError ? (
                    <img
                      src={profileImage}
                      alt={userName}
                      className="h-full w-full object-cover"
                      onError={() =>
                        setImageError(true)
                      }
                    />
                  ) : (
                    <User
                      size={18}
                      className="text-gray-500"
                    />
                  )}
                </div>

                <div className="hidden min-w-0 text-left sm:block">
                  <div className="max-w-[120px] truncate text-xs font-bold text-gray-800">
                    {userName}
                  </div>

                  <div className="text-[10px] capitalize text-gray-500">
                    {userRole}
                  </div>
                </div>

                <ChevronDown
                  size={16}
                  className={`hidden text-gray-400 transition sm:block ${
                    statusDropdownOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {/* =================================================
                  STATUS DROPDOWN
              ================================================= */}

              {statusDropdownOpen && (
                <div className="absolute right-0 top-12 z-50 w-[270px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

                  {/* USER HEADER */}

                  <div className="border-b border-gray-100 px-4 py-3">
                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-100">

                        {profileImage &&
                        !imageError ? (
                          <img
                            src={
                              profileImage
                            }
                            alt={
                              userName
                            }
                            className="h-full w-full object-cover"
                            onError={() =>
                              setImageError(
                                true
                              )
                            }
                          />
                        ) : (
                          <User
                            size={19}
                            className="text-gray-500"
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-900">
                          {userName}
                        </p>

                        <p className="text-xs capitalize text-gray-500">
                          {userRole}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* STATUS TITLE */}

                  <div className="px-4 pb-2 pt-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Availability Status
                    </p>
                  </div>

                  {/* STATUS OPTIONS */}

                  <div className="max-h-[350px] overflow-y-auto px-2 pb-2">

                    {visibleStatusOptions.map(
                      (item) => {
                        const Icon =
                          item.icon;

                        const selected =
                          status ===
                          item.value;

                        return (
                          <button
                            type="button"
                            key={
                              item.value
                            }
                            disabled={
                              loading
                            }
                            onClick={() =>
                              handleStatusChange(
                                item.value
                              )
                            }
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                              selected
                                ? "bg-gray-100"
                                : "hover:bg-gray-50"
                            } ${
                              loading
                                ? "cursor-not-allowed opacity-60"
                                : ""
                            }`}
                          >
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg} ${item.color}`}
                            >
                              <Icon
                                size={
                                  16
                                }
                              />
                            </div>

                            <span className="flex-1 text-sm font-medium text-gray-700">
                              {item.label}
                            </span>

                            {selected && (
                              <Check
                                size={
                                  16
                                }
                                className="text-green-600"
                              />
                            )}
                          </button>
                        );
                      }
                    )}
                  </div>

                  {/* LOGOUT */}

                  {onLogout && (
                    <div className="border-t border-gray-100 p-2">
                      <button
                        type="button"
                        onClick={() => {
                          setStatusDropdownOpen(
                            false
                          );

                          onLogout();
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-red-600 transition hover:bg-red-50"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                          <LogOut
                            size={16}
                          />
                        </div>

                        <span className="text-sm font-semibold">
                          Logout
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================
          ⭐ TIMER MODAL
      ======================================================== */}

      {timerOpen &&
        typeof document !==
          "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">

            <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

              {/* HEADER */}

              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Current Status
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-gray-900">
                    {timerStatus}
                  </h2>
                </div>

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                    currentStatusInfo?.bg ||
                    "bg-gray-100"
                  } ${
                    currentStatusInfo?.color ||
                    "text-gray-600"
                  }`}
                >
                  <CurrentStatusIcon
                    size={21}
                  />
                </div>
              </div>

              {/* TIMER */}

              <div className="px-6 py-10 text-center">

                <p className="text-sm font-medium text-gray-500">
                  Time Elapsed
                </p>

                <div className="mt-3 font-mono text-5xl font-bold tracking-wider text-gray-900 sm:text-6xl">
                  {formatTimer(
                    timerSeconds
                  )}
                </div>

                {/* New timer indicator */}

                {isNewTimer && (
                  <p className="mt-3 text-xs font-medium text-green-600">
                    Break started
                  </p>
                )}

                {!isNewTimer &&
                  statusStartedAt && (
                    <p className="mt-3 text-xs text-gray-400">
                      Break in progress
                    </p>
                  )}
              </div>

              {/* FOOTER */}

              <div className="border-t border-gray-100 bg-gray-50 px-6 py-5">

                <button
                  type="button"
                  disabled={loading}
                  onClick={
                    endStatusTimer
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ec3737] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#d92f2f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Check size={17} />

                  {loading
                    ? "Updating..."
                    : "End Break"}
                </button>

                <p className="mt-3 text-center text-xs text-gray-400">
                  Your break timer will continue
                  while this status is active.
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}