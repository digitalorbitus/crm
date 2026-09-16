







// "use client";

// import {
//   Users,
//   UserCheck,
//   UserX,
//   UserPlus,
//   ShieldCheck,
//   Search,
//   Download,
//   Eye,
//   Edit,
//   Trash2,
//   Calendar,
//   ChevronLeft,
//   ChevronRight,
//   Menu,
//   X,
//    Clock,
//   Loader2,
//   AlertTriangle,
//   RefreshCw,
// } from "lucide-react";

// import { useState, useEffect, useMemo } from "react";
// import { useRouter } from "next/navigation";
// import Sidebar from "@/components/Sidebar";
// import Link from "next/link";

// export default function UsersPage() {
//   const router = useRouter();

//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const [usersList, setUsersList] = useState([]);
//   const [loginHistory, setLoginHistory] = useState([]);

//   const [loadingUsers, setLoadingUsers] = useState(true);
//   const [usersError, setUsersError] = useState("");

//   const [loggingOut, setLoggingOut] = useState(false);
//   const [showLogoutModal, setShowLogoutModal] = useState(false);

//   // ==========================================
//   // FILTER STATES
//   // ==========================================

//   const [searchTerm, setSearchTerm] = useState("");
//   const [roleFilter, setRoleFilter] = useState("All Roles");
//   const [statusFilter, setStatusFilter] = useState("All Status");
//   const [teamFilter, setTeamFilter] = useState("All Teams");
//   const [showBreakModal, setShowBreakModal] = useState(false);
//   const [showAdminBreakModal, setShowAdminBreakModal] = useState(false);
//   const [selectedBreakUser, setSelectedBreakUser] = useState(null);
//   const [applyBreakToAll, setApplyBreakToAll] = useState(false);
//   const [breakStartInput, setBreakStartInput] = useState("");
//   const [breakEndInput, setBreakEndInput] = useState("");
//   const [adminBreakStartInput, setAdminBreakStartInput] = useState("");
//   const [adminBreakEndInput, setAdminBreakEndInput] = useState("");
//   const [savingBreak, setSavingBreak] = useState(false);
//   const [savingAdminBreak, setSavingAdminBreak] = useState(false);

//   const [dateFilter, setDateFilter] = useState("");
//   const [filterType, setFilterType] = useState("date");

//   // ==========================================
//   // FORMAT DATE TIME
//   // ==========================================

//   const formatDateTime = (dateObj) => {
//     const day = dateObj.toLocaleDateString("en-US", {
//       weekday: "long",
//     });

//     const date = dateObj.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });

//     const time = dateObj.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });

//     return {
//       day,
//       date,
//       time,
//     };
//   };

//   const formatDisplayDateTime = (value) => {
//     if (!value) return "N/A";

//     const date = new Date(value);

//     if (isNaN(date.getTime())) {
//       return "N/A";
//     }

//     return date.toLocaleString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   const toDateTimeLocalValue = (value) => {
//     if (!value) return "";

//     const date = new Date(value);

//     if (isNaN(date.getTime())) {
//       return "";
//     }

//     const pad = (num) =>
//       String(num).padStart(2, "0");

//     return `${date.getFullYear()}-${pad(
//       date.getMonth() + 1
//     )}-${pad(date.getDate())}T${pad(
//       date.getHours()
//     )}:${pad(date.getMinutes())}`;
//   };

//   const normalizeDateTimeForDb = (value) => {
//     if (!value) return null;

//     const date = new Date(value);

//     if (isNaN(date.getTime())) {
//       return null;
//     }

//     const pad = (num) =>
//       String(num).padStart(2, "0");

//     return `${date.getFullYear()}-${pad(
//       date.getMonth() + 1
//     )}-${pad(date.getDate())} ${pad(
//       date.getHours()
//     )}:${pad(date.getMinutes())}:00`;
//   };

//   // ==========================================
//   // LOGIN DETAILS
//   // ==========================================

//   const [loginDetails, setLoginDetails] = useState(() =>
//     formatDateTime(new Date())
//   );

//   useEffect(() => {
//     try {
//       let savedLoginTime =
//         localStorage.getItem("crm_login_time");

//       if (!savedLoginTime) {
//         const now = new Date();

//         savedLoginTime = now.toISOString();

//         localStorage.setItem(
//           "crm_login_time",
//           savedLoginTime
//         );
//       }

//       setLoginDetails(
//         formatDateTime(
//           new Date(savedLoginTime)
//         )
//       );
//     } catch (e) {
//       console.error(
//         "Storage access error:",
//         e
//       );
//     }
//   }, []);

//   // ==========================================
//   // FETCH USERS + LOGIN HISTORY
//   // ==========================================

//   const fetchUsers = async () => {
//     try {
//       setLoadingUsers(true);
//       setUsersError("");

//       // USERS API
//       const response = await fetch(
//         "/api/new-users",
//         {
//           method: "GET",
//           cache: "no-store",
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data.message ||
//             "Failed to fetch users"
//         );
//       }

//       const users =
//         data.users ||
//         data.data ||
//         [];

//       setUsersList(users);

//       // LOGIN HISTORY API
//       const historyRes = await fetch(
//         "/api/login-history",
//         {
//           method: "GET",
//           cache: "no-store",
//         }
//       );

//       const historyData =
//         await historyRes.json();

//       if (!historyRes.ok) {
//         throw new Error(
//           historyData.message ||
//             "Failed to fetch login history"
//         );
//       }

//       setLoginHistory(
//         historyData.history || []
//       );

//       console.log(
//         "USERS:",
//         users
//       );

//       console.log(
//         "LOGIN HISTORY:",
//         historyData.history || []
//       );
//     } catch (error) {
//       console.error(
//         "FETCH USERS ERROR:",
//         error
//       );

//       setUsersError(
//         error.message ||
//           "Failed to load users"
//       );
//     } finally {
//       setLoadingUsers(false);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);
// const handleSaveBreakTime = async () => {
//   if (!selectedBreakUser && !applyBreakToAll) return;

//   const formattedBreakStart = normalizeDateTimeForDb(breakStartInput);
//   const formattedBreakEnd = normalizeDateTimeForDb(breakEndInput);

//   if (formattedBreakStart && formattedBreakEnd) {
//     const start = new Date(breakStartInput);
//     const end = new Date(breakEndInput);

//     if (end < start) {
//       alert("Break end time must be after break start time.");
//       return;
//     }
//   }

//   try {
//     setSavingBreak(true);

//     const response = await fetch("/api/new-users", {
//       method: "PATCH",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         userId: applyBreakToAll ? undefined : selectedBreakUser.id,
//         applyAll: applyBreakToAll,
//         break_start: formattedBreakStart,
//         break_end: formattedBreakEnd,
//       }),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(
//         data.message || "Failed to update break time"
//       );
//     }

//     if (applyBreakToAll) {
//       setUsersList((prevUsers) =>
//         prevUsers.map((user) => ({
//           ...user,
//           break_start: formattedBreakStart,
//           break_end: formattedBreakEnd,
//         }))
//       );
//     } else {
//       setUsersList((prevUsers) =>
//         prevUsers.map((user) =>
//           String(user.id) === String(selectedBreakUser.id)
//             ? {
//                 ...user,
//                 break_start: formattedBreakStart,
//                 break_end: formattedBreakEnd,
//               }
//             : user
//         )
//       );
//     }

//     setShowBreakModal(false);
//     setSelectedBreakUser(null);
//     setApplyBreakToAll(false);
//     setBreakStartInput("");
//     setBreakEndInput("");
//   } catch (error) {
//     console.error("SAVE BREAK ERROR:", error);
//     alert(error.message || "Failed to save break time");
//   } finally {
//     setSavingBreak(false);
//   }
// };

//   const handleSaveAdminBreakTime = async () => {
//     const formattedBreakStart = normalizeDateTimeForDb(adminBreakStartInput);
//     const formattedBreakEnd = normalizeDateTimeForDb(adminBreakEndInput);

//     if (formattedBreakStart && formattedBreakEnd) {
//       const start = new Date(adminBreakStartInput);
//       const end = new Date(adminBreakEndInput);

//       if (end < start) {
//         alert("Break end time must be after break start time.");
//         return;
//       }
//     }

//     try {
//       setSavingAdminBreak(true);

//       const response = await fetch("/api/new-users", {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           applyAll: true,
//           break_start: formattedBreakStart,
//           break_end: formattedBreakEnd,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data.message || "Failed to update all users break time"
//         );
//       }

//       setUsersList((prevUsers) =>
//         prevUsers.map((user) => ({
//           ...user,
//           break_start: formattedBreakStart,
//           break_end: formattedBreakEnd,
//         }))
//       );

//       setShowAdminBreakModal(false);
//       setAdminBreakStartInput("");
//       setAdminBreakEndInput("");
//     } catch (error) {
//       console.error("SAVE ALL BREAK ERROR:", error);
//       alert(error.message || "Failed to apply break to all users");
//     } finally {
//       setSavingAdminBreak(false);
//     }
//   };
//   // ==========================================
//   // CHECK HISTORY DATE
//   // ==========================================

//   const historyMatchesFilter = (
//     historyItem
//   ) => {
//     if (!dateFilter) {
//       return true;
//     }

//     if (!historyItem?.login_time) {
//       return false;
//     }

//     const loginDate = new Date(
//       historyItem.login_time
//     );

//     if (isNaN(loginDate.getTime())) {
//       return false;
//     }

//     const year =
//       loginDate.getFullYear();

//     const month = String(
//       loginDate.getMonth() + 1
//     ).padStart(2, "0");

//     const day = String(
//       loginDate.getDate()
//     ).padStart(2, "0");

//     // ========================================
//     // DATE FILTER
//     // ========================================

//     if (filterType === "date") {
//       const formattedDate =
//         `${year}-${month}-${day}`;

//       return (
//         formattedDate === dateFilter
//       );
//     }

//     // ========================================
//     // MONTH FILTER
//     // ========================================

//     if (filterType === "month") {
//       const formattedMonth =
//         `${year}-${month}`;

//       return (
//         formattedMonth === dateFilter
//       );
//     }

//     return true;
//   };

//   // ==========================================
//   // GET HISTORY FOR USER
//   // ==========================================

//   const getUserHistory = (userId) => {
//     return loginHistory
//       .filter((item) => {
//         const historyUserId =
//           item.user_id ??
//           item.userId ??
//           item.userid;

//         const currentUserId =
//           userId;

//         return (
//           String(historyUserId) ===
//           String(currentUserId)
//         );
//       })
//       .filter(historyMatchesFilter)
//       .sort(
//         (a, b) =>
//           new Date(
//             b.login_time
//           ) -
//           new Date(
//             a.login_time
//           )
//       );
//   };

//   // ==========================================
//   // FILTER USERS
//   // ==========================================

//   const filteredUsers = useMemo(() => {
//     return usersList.filter((usr) => {
//       // ========================================
//       // SEARCH
//       // ========================================

//       const name = (
//         usr.name ||
//         usr.fullName ||
//         ""
//       ).toLowerCase();

//       const email = (
//         usr.email || ""
//       ).toLowerCase();

//       const phone = (
//         usr.phone || ""
//       ).toString();

//       const search =
//         searchTerm
//           .trim()
//           .toLowerCase();

//       const matchesSearch =
//         !search ||
//         name.includes(search) ||
//         email.includes(search) ||
//         phone.includes(search);



//       // ========================================
//       // ROLE
//       // ========================================

//       const userRole = (
//         usr.role || ""
//       )
//         .trim()
//         .toLowerCase();

//       const matchesRole =
//         roleFilter ===
//           "All Roles" ||
//         userRole ===
//           roleFilter
//             .trim()
//             .toLowerCase();

//       // ========================================
//       // STATUS
//       // ========================================

//       const userStatus = (
//         usr.status || ""
//       )
//         .trim()
//         .toLowerCase();

//       const selectedStatus =
//         statusFilter
//           .trim()
//           .toLowerCase();

//       let matchesStatus =
//         statusFilter ===
//         "All Status";

//       if (!matchesStatus) {
//         if (
//           selectedStatus ===
//             "online" ||
//           selectedStatus ===
//             "active"
//         ) {
//           matchesStatus =
//             userStatus ===
//               "online" ||
//             userStatus ===
//               "active";
//         } else if (
//           selectedStatus ===
//             "offline" ||
//           selectedStatus ===
//             "inactive"
//         ) {
//           matchesStatus =
//             userStatus ===
//               "offline" ||
//             userStatus ===
//               "inactive";
//         } else {
//           matchesStatus =
//             userStatus ===
//             selectedStatus;
//         }
//       }

//       // ========================================
//       // TEAM
//       // ========================================

//       const userTeam = (
//         usr.team || ""
//       )
//         .trim()
//         .toLowerCase();

//       const matchesTeam =
//         teamFilter ===
//           "All Teams" ||
//         userTeam ===
//           teamFilter
//             .trim()
//             .toLowerCase();

//       // ========================================
//       // DATE / MONTH
//       // ========================================

//       let matchesDate = true;

//       if (dateFilter) {
//         const userId =
//           usr.id ??
//           usr._id;

//         const userHistory =
//           getUserHistory(userId);

//         matchesDate =
//           userHistory.length > 0;
//       }

//       return (
//         matchesSearch &&
//         matchesRole &&
//         matchesStatus &&
//         matchesTeam &&
//         matchesDate
//       );
//     });
//   }, [
//     usersList,
//     loginHistory,
//     searchTerm,
//     roleFilter,
//     statusFilter,
//     teamFilter,
//     dateFilter,
//     filterType,
//   ]);

//   // ==========================================
//   // CREATE TABLE ROWS
//   //
//   // IMPORTANT:
//   // MONTH/DATE FILTER = EVERY HISTORY RECORD
//   // ==========================================

//   const tableRows = useMemo(() => {
//     const rows = [];

//     filteredUsers.forEach((usr) => {
//       const userId =
//         usr.id ??
//         usr._id;

//       const userHistory =
//         getUserHistory(userId);

//       const name =
//         usr.name ||
//         usr.fullName ||
//         "Unnamed User";

//       const email =
//         usr.email ||
//         "No Email";

//       const role =
//         usr.role ||
//         "Agent";

//       const team =
//         usr.team ||
//         "Sales";

//       const status =
//         usr.status ||
//         "Offline";

//       // ========================================
//       // DATE / MONTH SELECTED
//       //
//       // EVERY HISTORY RECORD GETS OWN ROW
//       // ========================================

//       if (dateFilter) {
//         userHistory.forEach(
//           (history, historyIndex) => {
//             rows.push({
//               user: usr,
//               name,
//               email,
//               role,
//               team,
//                 break_start: usr.break_start,
//   break_end: usr.break_end,
//               status,
//               history,
//               historyIndex,
//             });
//           }
//         );

//         return;
//       }

//       // ========================================
//       // NO DATE FILTER
//       //
//       // ONE ROW PER USER
//       // ========================================

//       rows.push({
//         user: usr,
//         name,
//         email,
//         role,
//         team,
//           break_start: usr.break_start,
//   break_end: usr.break_end,
//         status,
//         history: null,
//         historyIndex: 0,
//       });
      
//     });
    

//     return rows;
//   }, [
//     filteredUsers,
//     loginHistory,
//     dateFilter,
//     filterType,
//   ]);

//   // ==========================================
//   // STATS
//   // ==========================================

//   const stats = useMemo(() => {
//     const total =
//       usersList.length;

//     const active =
//       usersList.filter(
//         (u) => {
//           const status = (
//             u.status || ""
//           ).toLowerCase();

//           return (
//             status === "online" ||
//             status === "active"
//           );
//         }
//       ).length;

//     const inactive =
//       usersList.filter(
//         (u) => {
//           const status = (
//             u.status || ""
//           ).toLowerCase();

//           return (
//             status === "offline" ||
//             status === "inactive"
//           );
//         }
//       ).length;

//     const admins =
//       usersList.filter(
//         (u) =>
//           (
//             u.role || ""
//           ).toLowerCase() ===
//           "admin"
//       ).length;

//     return [
//       {
//         title: "Total Users",
//         value: total,
//         change: "Dynamic",
//         isPositive: true,
//         period: "total in system",
//         icon: Users,
//         bgColor: "bg-purple-50",
//         iconColor:
//           "text-purple-600",
//       },

//       {
//         title: "Active Users",
//         value: active,
//         change: "Active",
//         isPositive: true,
//         period:
//           "currently active",
//         icon: UserCheck,
//         bgColor:
//           "bg-emerald-50",
//         iconColor:
//           "text-emerald-500",
//       },

//       {
//         title: "Inactive Users",
//         value: inactive,
//         change: "Offline",
//         isPositive: false,
//         period:
//           "currently offline",
//         icon: UserX,
//         bgColor:
//           "bg-orange-50",
//         iconColor:
//           "text-orange-500",
//       },

//       {
//         title: "Logged In Now",
//         value: active,
//         change: "Live",
//         isPositive: true,
//         period:
//           "online users",
//         icon: UserPlus,
//         bgColor:
//           "bg-blue-50",
//         iconColor:
//           "text-blue-500",
//       },

//       {
//         title: "Total Admins",
//         value: admins,
//         change: "Admins",
//         isNeutral: true,
//         period:
//           "admin accounts",
//         icon: ShieldCheck,
//         bgColor:
//           "bg-indigo-50",
//         iconColor:
//           "text-indigo-600",
//       },
//     ];
//   }, [usersList]);

//   // ==========================================
//   // LOGOUT
//   // ==========================================

//   const handleConfirmLogout =
//     async () => {
//       setLoggingOut(true);

//       try {
//         localStorage.removeItem(
//           "crm_login_time"
//         );

//         const response =
//           await fetch(
//             "/api/logout",
//             {
//               method: "POST",
//             }
//           );

//         if (!response.ok) {
//           setLoggingOut(false);
//           setShowLogoutModal(
//             false
//           );
//           return;
//         }

//         router.push("/login");
//       } catch (error) {
//         console.error(
//           "Logout error:",
//           error
//         );

//         setLoggingOut(false);
//         setShowLogoutModal(
//           false
//         );
//       }
//     };

//   // ==========================================
//   // RENDER
//   // ==========================================

//   return (
//     <div className="min-h-screen bg-[#F8FAFC] text-slate-800 relative">

//       {/* ==========================================
//           MOBILE HEADER
//       ========================================== */}

//       <header className="lg:hidden h-16 bg-[#050B1E] border-b border-slate-800 flex items-center justify-between px-4 text-white">

//         <div className="flex items-center gap-2.5">

//           <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 p-[2px] flex items-center justify-center">

//             <div className="w-full h-full bg-[#050B1E] rounded-full flex items-center justify-center">

//               <div className="w-3.5 h-3.5 rounded-full border-2 border-rose-500 flex items-center justify-center">

//                 <div className="w-1 h-1 bg-white rounded-full" />

//               </div>

//             </div>

//           </div>

//           <span className="font-extrabold text-xl tracking-tight text-white">
//             CallCRM
//           </span>

//         </div>

//         <button
//           type="button"
//           onClick={() =>
//             setSidebarOpen(
//               !sidebarOpen
//             )
//           }
//           className="p-2 rounded-lg text-slate-300 hover:bg-white/10"
//         >
//           {sidebarOpen ? (
//             <X size={22} />
//           ) : (
//             <Menu size={22} />
//           )}
//         </button>

//       </header>

//       {/* ==========================================
//           MOBILE OVERLAY
//       ========================================== */}

//       {sidebarOpen && (
//         <div
//           onClick={() =>
//             setSidebarOpen(false)
//           }
//           className="fixed inset-0 z-40 bg-black/60 lg:hidden"
//         />
//       )}

//       {/* ==========================================
//           SIDEBAR
//       ========================================== */}

//       <Sidebar
//         sidebarOpen={
//           sidebarOpen
//         }
//         setSidebarOpen={
//           setSidebarOpen
//         }
//         setShowLogoutModal={
//           setShowLogoutModal
//         }
//       />

//       {/* ==========================================
//           MAIN
//       ========================================== */}

//       <main className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">

//         {/* ========================================
//             TOP BAR
//         ======================================== */}

//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

//           <div>

//             <h1 className="text-2xl font-black text-slate-900 tracking-tight">
//               Users
//             </h1>

//             <p className="text-xs text-slate-400 font-medium mt-0.5">
//               Dashboard &gt; Users &gt;{" "}
//               <span className="text-slate-600">
//                 All Users
//               </span>
//             </p>

//           </div>

//           <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">

//             {/* DATE / MONTH FILTER */}

//             <div className="flex items-center gap-2">

//               <select
//                 value={
//                   filterType
//                 }
//                 onChange={(e) => {
//                   setFilterType(
//                     e.target.value
//                   );

//                   setDateFilter("");
//                 }}
//                 className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:border-blue-500"
//               >

//                 <option value="date">
//                   Date
//                 </option>

//                 <option value="month">
//                   Month
//                 </option>

//               </select>

//               <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm">

//                 <Calendar
//                   size={14}
//                   className="text-slate-500"
//                 />

//                 <input
//                   type={
//                     filterType
//                   }
//                   value={
//                     dateFilter
//                   }
//                   onChange={(e) =>
//                     setDateFilter(
//                       e.target.value
//                     )
//                   }
//                   className="text-xs font-semibold text-slate-700 outline-none bg-transparent cursor-pointer"
//                 />

//                 {dateFilter && (
//                   <button
//                     type="button"
//                     onClick={() =>
//                       setDateFilter(
//                         ""
//                       )
//                     }
//                     className="text-slate-400 hover:text-rose-500 text-xs font-bold"
//                     title="Clear date filter"
//                   >
//                     ×
//                   </button>
//                 )}

//               </div>

//             </div>

//             {/* ADD USER */}

//             <Link href="/add-new-users">

//               <button
//                 type="button"
//                 className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-md transition cursor-pointer"
//               >

//                 <UserPlus
//                   size={15}
//                 />

//                 <span>
//                   + Add New User
//                 </span>

//               </button>

//             </Link>

//           </div>

//         </div>

//         {/* ========================================
//             STATS
//         ======================================== */}

//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">

//           {stats.map(
//             (
//               stat,
//               idx
//             ) => {

//               const Icon =
//                 stat.icon;

//               return (
//                 <div
//                   key={idx}
//                   className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
//                 >

//                   <div className="flex items-center justify-between">

//                     <span className="text-xs font-semibold text-slate-400">
//                       {stat.title}
//                     </span>

//                     <div
//                       className={`w-8 h-8 rounded-xl ${stat.bgColor} ${stat.iconColor} flex items-center justify-center shrink-0`}
//                     >

//                       <Icon
//                         size={16}
//                       />

//                     </div>

//                   </div>

//                   <div className="mt-2">

//                     <h3 className="text-2xl font-black text-slate-900">
//                       {stat.value}
//                     </h3>

//                     <p className="text-[11px] font-semibold mt-1">

//                       {stat.isNeutral ? (

//                         <span className="text-slate-400 font-normal">
//                           {stat.period}
//                         </span>

//                       ) : stat.isPositive ? (

//                         <span className="text-emerald-500">

//                           ↑{" "}
//                           {stat.change}{" "}

//                           <span className="text-slate-400 font-normal">
//                             {stat.period}
//                           </span>

//                         </span>

//                       ) : (

//                         <span className="text-rose-500">

//                           ↓{" "}
//                           {stat.change}{" "}

//                           <span className="text-slate-400 font-normal">
//                             {stat.period}
//                           </span>

//                         </span>

//                       )}

//                     </p>

//                   </div>

//                 </div>
//               );
//             }
//           )}

//         </div>

//         {/* ========================================
//             TABLE CONTAINER
//         ======================================== */}

//         <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">

//           {/* ======================================
//               SEARCH
//           ====================================== */}

//           <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">

//             <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto flex-1">

//               {/* SEARCH INPUT */}

//               <div className="relative flex-1 min-w-[200px] sm:min-w-[240px]">

//                 <Search
//                   size={15}
//                   className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                 />

//                 <input
//                   type="text"
//                   value={
//                     searchTerm
//                   }
//                   onChange={(e) =>
//                     setSearchTerm(
//                       e.target.value
//                     )
//                   }
//                   placeholder="Search by name, email or number..."
//                   className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
//                 />

//               </div>

//               <div className="flex items-center gap-2 text-xs">

//                 {/* ROLE */}

//                 <select
//                   value={
//                     roleFilter
//                   }
//                   onChange={(e) =>
//                     setRoleFilter(
//                       e.target.value
//                     )
//                   }
//                   className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 focus:outline-none"
//                 >

//                   <option>
//                     All Roles
//                   </option>

//                   <option>
//                     Admin
//                   </option>

//                   <option>
//                     Staff
//                   </option>

//                   <option>
//                     Agent
//                   </option>

//                 </select>

//                 {/* STATUS */}

//                 <select
//                   value={
//                     statusFilter
//                   }
//                   onChange={(e) =>
//                     setStatusFilter(
//                       e.target.value
//                     )
//                   }
//                   className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 focus:outline-none"
//                 >

//                   <option>
//                     All Status
//                   </option>

//                   <option>
//                     Online
//                   </option>

//                   <option>
//                     Offline
//                   </option>

//                   <option>
//                     Active
//                   </option>

//                 </select>

//                 {/* TEAM */}

//                 <select
//                   value={
//                     teamFilter
//                   }
//                   onChange={(e) =>
//                     setTeamFilter(
//                       e.target.value
//                     )
//                   }
//                   className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 focus:outline-none"
//                 >

//                   <option>
//                     All Teams
//                   </option>

//                   <option>
//                     Sales
//                   </option>

//                   <option>
//                     Support
//                   </option>

//                   <option>
//                     Marketing
//                   </option>

//                 </select>

//               </div>

//             </div>

//             {/* ACTIONS */}

//             <div className="flex items-center gap-2">

//               <button
//                 type="button"
//                 onClick={() => {
//                   setAdminBreakStartInput("");
//                   setAdminBreakEndInput("");
//                   setShowAdminBreakModal(true);
//                 }}
//                 className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shadow-sm cursor-pointer"
//               >
//                 <Clock size={13} />
//                 <span>All Users Break</span>
//               </button>

//               <button
//                 type="button"
//                 onClick={
//                   fetchUsers
//                 }
//                 className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
//               >

//                 <RefreshCw
//                   size={13}
//                   className={
//                     loadingUsers
//                       ? "animate-spin"
//                       : ""
//                   }
//                 />

//                 <span>
//                   Refresh
//                 </span>

//               </button>

//               <button
//                 type="button"
//                 className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm hover:bg-slate-50 transition"
//               >

//                 <Download
//                   size={13}
//                   className="text-slate-500"
//                 />

//                 <span>
//                   Export
//                 </span>

//               </button>

//             </div>

//           </div>

//           {/* ======================================
//               TABLE
//           ====================================== */}

//        <div className="overflow-x-auto">

//   <table className="w-full text-xs text-left">

//     <thead>

//       <tr className="bg-slate-50/60 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">

//         <th className="py-3 px-4 w-8">
//           #
//         </th>

//         <th className="py-3 px-4">
//           User
//         </th>

//         <th className="py-3 px-4">
//           Role
//         </th>

//         <th className="py-3 px-4">
//           Team
//         </th>

//         <th className="py-3 px-4">
//           Total Calls
//         </th>

//         <th className="py-3 px-4">
//           Messages
//         </th>

//         <th className="py-3 px-4">
//           Last Login
//         </th>

//         <th className="py-3 px-4">
//           Login Time
//         </th>

//         <th className="py-3 px-4">
//           Logout Time
//         </th>

//         <th className="py-3 px-4">
//           Break Start
//         </th>

//         <th className="py-3 px-4">
//           Break End
//         </th>

//         <th className="py-3 px-4">
//           Status
//         </th>

//         <th className="py-3 px-4 text-center">
//           Actions
//         </th>

//       </tr>

//     </thead>

//     <tbody className="divide-y divide-slate-100">

//       {/* ==================================
//           LOADING
//       ================================== */}

//       {loadingUsers && (
//         <tr>

//           <td
//             colSpan={13}
//             className="py-12 text-center text-slate-500"
//           >

//             <div className="flex flex-col items-center justify-center gap-2">

//               <Loader2
//                 size={24}
//                 className="animate-spin text-blue-600"
//               />

//               <span className="text-xs font-medium">
//                 Fetching Users Data...
//               </span>

//             </div>

//           </td>

//         </tr>
//       )}

//       {/* ==================================
//           ERROR
//       ================================== */}

//       {!loadingUsers && usersError && (
//         <tr>

//           <td
//             colSpan={13}
//             className="py-10 text-center text-rose-500"
//           >

//             <div className="flex flex-col items-center justify-center gap-2">

//               <AlertTriangle size={22} />

//               <span className="font-semibold text-xs">
//                 {usersError}
//               </span>

//               <button
//                 type="button"
//                 onClick={fetchUsers}
//                 className="mt-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold hover:bg-rose-200 transition"
//               >
//                 Try Again
//               </button>

//             </div>

//           </td>

//         </tr>
//       )}

//       {/* ==================================
//           EMPTY
//       ================================== */}

//       {!loadingUsers &&
//         !usersError &&
//         tableRows.length === 0 && (
//           <tr>

//             <td
//               colSpan={13}
//               className="py-12 text-center text-slate-400"
//             >

//               <div className="flex flex-col items-center justify-center gap-1">

//                 <Users
//                   size={28}
//                   className="text-slate-300 mb-1"
//                 />

//                 <p className="font-bold text-slate-600 text-xs">
//                   No users found
//                 </p>

//                 <p className="text-[11px]">
//                   {dateFilter
//                     ? "No login record found for the selected date/month."
//                     : "No users match your current filters."}
//                 </p>

//               </div>

//             </td>

//           </tr>
//         )}

//       {/* ==================================
//           DATA
//       ================================== */}

//       {!loadingUsers &&
//         !usersError &&
//         tableRows.map((row, index) => {

//           const {
//             user: usr,
//             name,
//             email,
//             role,
//             team,
//             status,
//             history,
//           } = row;

//           // ==================================
//           // BREAK TIME
//           // ==================================

//           const breakStart =
//             formatDisplayDateTime(
//               usr.break_start
//             );

//           const breakEnd =
//             formatDisplayDateTime(
//               usr.break_end
//             );

//           // ==================================
//           // LOGIN TIME
//           // ==================================

//           const loginTime = history
//             ? formatDisplayDateTime(
//                 history.login_time
//               )
//             : formatDisplayDateTime(
//                 usr.loginTime ||
//                   usr.login_time
//               );

//           // ==================================
//           // LOGOUT TIME
//           // ==================================

//           const logoutTime = history
//             ? formatDisplayDateTime(
//                 history.logout_time
//               )
//             : formatDisplayDateTime(
//                 usr.logoutTime ||
//                   usr.logout_time
//               );

//           // ==================================
//           // LAST LOGIN
//           // ==================================

//           const lastLogin = history
//             ? formatDisplayDateTime(
//                 history.login_time
//               )
//             : formatDisplayDateTime(
//                 usr.lastLogin ||
//                   usr.last_login ||
//                   usr.lastLoginTime
//               );

//           // ==================================
//           // UNIQUE KEY
//           // ==================================

//           const rowKey = history
//             ? `${usr.id || usr._id}-${
//                 history.id ||
//                 history._id ||
//                 history.login_time ||
//                 index
//               }`
//             : `${usr.id || usr._id}-${index}`;

//           return (
//             <tr
//               key={rowKey}
//               className="hover:bg-slate-50/70 transition-colors"
//             >

//               {/* NUMBER */}

//               <td className="py-3 px-4 text-slate-400 font-medium">
//                 {index + 1}
//               </td>

//               {/* USER */}

//               <td className="py-3 px-4">

//                 <div className="flex items-center gap-2.5">

//                   <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-[11px] uppercase overflow-hidden shrink-0">

//                     {usr.avatar ? (
//                       <img
//                         src={usr.avatar}
//                         alt={name}
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       name.charAt(0)
//                     )}

//                   </div>

//                   <div>

//                     <p className="font-bold text-slate-800 leading-snug">
//                       {name}
//                     </p>

//                     <p className="text-[10px] text-slate-400">
//                       {email}
//                     </p>

//                   </div>

//                 </div>

//               </td>

//               {/* ROLE */}

//               <td className="py-3 px-4">

//                 <span
//                   className={`px-2 py-0.5 rounded-md font-bold text-[10px] capitalize ${
//                     role.toLowerCase() === "admin"
//                       ? "bg-purple-100 text-purple-700"
//                       : role.toLowerCase() === "staff"
//                       ? "bg-blue-100 text-blue-700"
//                       : "bg-emerald-100 text-emerald-700"
//                   }`}
//                 >
//                   {role}
//                 </span>

//               </td>

//               {/* TEAM */}

//               <td className="py-3 px-4 text-slate-600 font-medium">
//                 {team}
//               </td>

//               {/* TOTAL CALLS */}

//               <td className="py-3 px-4 text-slate-800 font-bold">
//                 {usr.calls ??
//                   usr.totalCalls ??
//                   0}
//               </td>

//               {/* MESSAGES */}

//               <td className="py-3 px-4 text-slate-800 font-bold">
//                 {usr.messages ??
//                   usr.totalMessages ??
//                   0}
//               </td>

//               {/* LAST LOGIN */}

//               <td className="py-3 px-4 text-slate-500 font-medium whitespace-nowrap">
//                 {lastLogin}
//               </td>

//               {/* LOGIN TIME */}

//               <td className="py-3 px-4 text-emerald-600 font-medium whitespace-nowrap">
//                 {loginTime}
//               </td>

//               {/* LOGOUT TIME */}

//               <td className="py-3 px-4 text-rose-500 font-medium whitespace-nowrap">
//                 {logoutTime}
//               </td>

//               {/* BREAK START */}

//               <td className="py-3 px-4 text-amber-600 font-medium whitespace-nowrap">
//                 {breakStart}
//               </td>

//               {/* BREAK END */}

//               <td className="py-3 px-4 text-indigo-600 font-medium whitespace-nowrap">
//                 {breakEnd}
//               </td>

//               {/* STATUS */}

//               <td className="py-3 px-4">

//                 <span
//                   className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
//                     status.toLowerCase() === "online" ||
//                     status.toLowerCase() === "active"
//                       ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
//                       : "bg-rose-50 text-rose-500 border border-rose-200"
//                   }`}
//                 >
//                   {status}
//                 </span>

//               </td>

//               {/* ACTIONS */}

//               <td className="py-3 px-4">

//                 <div className="flex items-center justify-center gap-2 text-slate-400">

//                   {/* VIEW */}

//                   <button
//                     type="button"
//                     className="hover:text-blue-600 transition"
//                     title="View Details"
//                   >
//                     <Eye size={14} />
//                   </button>

//                   {/* BREAK */}

//                   <button
//                     type="button"
//                     onClick={() => {

//                       setSelectedBreakUser(usr);
//                       setApplyBreakToAll(false);

//                       setBreakStartInput(
//                         toDateTimeLocalValue(
//                           usr.break_start
//                         )
//                       );

//                       setBreakEndInput(
//                         toDateTimeLocalValue(
//                           usr.break_end
//                         )
//                       );

//                       setShowBreakModal(true);

//                     }}
//                     className="hover:text-amber-600 transition"
//                     title="Set Break Time"
//                   >
//                     <Clock size={14} />
//                   </button>

//                   {/* EDIT */}

//                   <button
//                     type="button"
//                     className="hover:text-blue-600 transition"
//                     title="Edit User"
//                   >
//                     <Edit size={14} />
//                   </button>

//                   {/* DELETE */}

//                   <button
//                     type="button"
//                     className="hover:text-rose-600 transition"
//                     title="Delete User"
//                   >
//                     <Trash2 size={14} />
//                   </button>

//                 </div>

//               </td>

//             </tr>
//           );
//         })}

//     </tbody>

//   </table>

// </div>

//           {/* ========================================
//               FOOTER
//           ======================================== */}

//           <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">

//             <span>
//               Showing{" "}
//               {tableRows.length}{" "}
//               {dateFilter
//                 ? "records"
//                 : "users"}{" "}
//               of{" "}
//               {dateFilter
//                 ? loginHistory.length
//                 : usersList.length}
//             </span>

//             <div className="flex items-center gap-1">

//               <button
//                 type="button"
//                 className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50"
//               >
//                 <ChevronLeft
//                   size={14}
//                 />
//               </button>

//               <button
//                 type="button"
//                 className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shadow-sm"
//               >
//                 1
//               </button>

//               <button
//                 type="button"
//                 className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50"
//               >
//                 <ChevronRight
//                   size={14}
//                 />
//               </button>

//             </div>

//           </div>

//         </div>

//       </main>

//       {/* ==========================================
//           LOGOUT MODAL
//       ========================================== */}

//       {showBreakModal && selectedBreakUser && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">

//           <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">

//             <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
//               <Clock size={22} />
//             </div>

//             <div className="text-center space-y-1">
//               <h3 className="text-lg font-bold text-slate-900">
//                 Set Break Time
//               </h3>
//               <p className="text-sm text-slate-500">
//                 Update break schedule for {selectedBreakUser.name}
//               </p>
//             </div>

//             <div className="space-y-3">
//               <label className="block text-xs font-semibold text-slate-600">
//                 Break Start
//                 <input
//                   type="datetime-local"
//                   value={breakStartInput}
//                   onChange={(e) => setBreakStartInput(e.target.value)}
//                   className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:border-blue-500"
//                 />
//               </label>

//               <label className="block text-xs font-semibold text-slate-600">
//                 Break End
//                 <input
//                   type="datetime-local"
//                   value={breakEndInput}
//                   onChange={(e) => setBreakEndInput(e.target.value)}
//                   className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:border-blue-500"
//                 />
//               </label>

//               <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
//                 <input
//                   type="checkbox"
//                   checked={applyBreakToAll}
//                   onChange={(e) => setApplyBreakToAll(e.target.checked)}
//                   className="h-4 w-4 accent-amber-500"
//                 />
//                 Apply to all users
//               </label>
//             </div>

//             <div className="flex items-center gap-3 pt-2">
//               <button
//                 type="button"
//                 onClick={() => {
//                   setShowBreakModal(false);
//                   setSelectedBreakUser(null);
//                   setApplyBreakToAll(false);
//                   setBreakStartInput("");
//                   setBreakEndInput("");
//                 }}
//                 className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 disabled={savingBreak}
//                 onClick={handleSaveBreakTime}
//                 className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 shadow-lg transition disabled:opacity-50 cursor-pointer"
//               >
//                 {savingBreak ? "Saving..." : applyBreakToAll ? "Apply to All" : "Save Break"}
//               </button>
//             </div>

//           </div>

//         </div>
//       )}

//       {showAdminBreakModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">

//           <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">

//             <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
//               <Clock size={22} />
//             </div>

//             <div className="text-center space-y-1">
//               <h3 className="text-lg font-bold text-slate-900">
//                 Admin Break for All Users
//               </h3>
//               <p className="text-sm text-slate-500">
//                 Set one break schedule for the whole team.
//               </p>
//             </div>

//             <div className="space-y-3">
//               <label className="block text-xs font-semibold text-slate-600">
//                 Break Start
//                 <input
//                   type="datetime-local"
//                   value={adminBreakStartInput}
//                   onChange={(e) => setAdminBreakStartInput(e.target.value)}
//                   className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:border-blue-500"
//                 />
//               </label>

//               <label className="block text-xs font-semibold text-slate-600">
//                 Break End
//                 <input
//                   type="datetime-local"
//                   value={adminBreakEndInput}
//                   onChange={(e) => setAdminBreakEndInput(e.target.value)}
//                   className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:border-blue-500"
//                 />
//               </label>
//             </div>

//             <div className="flex items-center gap-3 pt-2">
//               <button
//                 type="button"
//                 onClick={() => {
//                   setShowAdminBreakModal(false);
//                   setAdminBreakStartInput("");
//                   setAdminBreakEndInput("");
//                 }}
//                 className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 disabled={savingAdminBreak}
//                 onClick={handleSaveAdminBreakTime}
//                 className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 shadow-lg transition disabled:opacity-50 cursor-pointer"
//               >
//                 {savingAdminBreak ? "Applying..." : "Apply to All"}
//               </button>
//             </div>

//           </div>

//         </div>
//       )}

//       {showLogoutModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">

//           <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">

//             <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">

//               <AlertTriangle
//                 size={24}
//               />

//             </div>

//             <div className="text-center space-y-1">

//               <h3 className="text-lg font-bold text-slate-900">
//                 Log Out?
//               </h3>

//               <p className="text-sm text-slate-500">
//                 Are you sure you want to
//                 log out of your account?
//               </p>

//             </div>

//             <div className="flex items-center gap-3 pt-2">

//               <button
//                 type="button"
//                 disabled={
//                   loggingOut
//                 }
//                 onClick={() =>
//                   setShowLogoutModal(
//                     false
//                   )
//                 }
//                 className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition disabled:opacity-50 cursor-pointer"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 disabled={
//                   loggingOut
//                 }
//                 onClick={
//                   handleConfirmLogout
//                 }
//                 className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
//               >

//                 {loggingOut ? (
//                   <>
//                     <Loader2
//                       size={16}
//                       className="animate-spin"
//                     />

//                     <span>
//                       Logging out...
//                     </span>
//                   </>
//                 ) : (
//                   <span>
//                     Yes, Logout
//                   </span>
//                 )}

//               </button>

//             </div>

//           </div>

//         </div>
//       )}

//     </div>
//   );
// }






















// "use client";

// import {
//   Users,
//   UserCheck,
//   UserX,
//   ShieldCheck,
//   Clock,
//   Search,
//   Filter,
//   Calendar,
//   Phone,
//   Mail,
//   Edit,
//   Trash2,
//   MoreVertical,
//   Menu,
//   X,
//   Coffee,
//   LogOut,
//   AlertCircle,
//   RefreshCw,
// } from "lucide-react";

// import { useState, useCallback, useEffect, useMemo } from "react";
// import { useRouter } from "next/navigation";
// import Sidebar from "@/components/Sidebar";
// import Link from "next/link";

// export default function UsersPage() {
//   const router = useRouter();

//   // =========================================================
//   // STATES
//   // =========================================================

//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const [usersList, setUsersList] = useState([]);
//   const [loginHistory, setLoginHistory] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [searchTerm, setSearchTerm] = useState("");
//   const [roleFilter, setRoleFilter] = useState("All Roles");
//   const [statusFilter, setStatusFilter] = useState("All Status");
//   const [teamFilter, setTeamFilter] = useState("All Teams");

//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   const [logoutModalOpen, setLogoutModalOpen] = useState(false);

//   const [breakModalOpen, setBreakModalOpen] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);

//   const [breakStart, setBreakStart] = useState("");
//   const [breakEnd, setBreakEnd] = useState("");

//   const [adminBreakModalOpen, setAdminBreakModalOpen] = useState(false);
//   const [adminBreakStart, setAdminBreakStart] = useState("");
//   const [adminBreakEnd, setAdminBreakEnd] = useState("");

//   const [savingBreak, setSavingBreak] = useState(false);
//   const [deletingUserId, setDeletingUserId] = useState(null);

//   // =========================================================
//   // DATE HELPERS
//   // =========================================================

//   const formatDateTime = (value) => {
//     if (!value) return "-";

//     const date = new Date(value);

//     if (Number.isNaN(date.getTime())) {
//       return "-";
//     }

//     return date.toLocaleString();
//   };

//   const formatDisplayDateTime = (value) => {
//     if (!value) return "-";

//     const date = new Date(value);

//     if (Number.isNaN(date.getTime())) {
//       return "-";
//     }

//     return date.toLocaleString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//       hour: "numeric",
//       minute: "2-digit",
//     });
//   };

//   const toDateTimeLocalValue = (value) => {
//     if (!value) return "";

//     const date = new Date(value);

//     if (Number.isNaN(date.getTime())) {
//       return "";
//     }

//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     const hours = String(date.getHours()).padStart(2, "0");
//     const minutes = String(date.getMinutes()).padStart(2, "0");

//     return `${year}-${month}-${day}T${hours}:${minutes}`;
//   };

//   const normalizeDateTimeForDb = (value) => {
//     if (!value) return null;

//     const date = new Date(value);

//     if (Number.isNaN(date.getTime())) {
//       return null;
//     }

//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     const hours = String(date.getHours()).padStart(2, "0");
//     const minutes = String(date.getMinutes()).padStart(2, "0");
//     const seconds = String(date.getSeconds()).padStart(2, "0");

//     return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
//   };

//   // =========================================================
//   // STATUS HELPERS
//   // =========================================================

//   const getUserStatus = useCallback((user) => {
//     return (
//       user?.availability_status ||
//       user?.status ||
//       "Active"
//     )
//       .toString()
//       .trim();
//   }, []);

//   const getUserStatusLower = useCallback(
//     (user) => {
//       return getUserStatus(user).toLowerCase();
//     },
//     [getUserStatus]
//   );

//   // =========================================================
//   // FETCH USERS
//   // =========================================================

//   const fetchUsers = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const usersResponse = await fetch("/api/new-users", {
//         method: "GET",
//         credentials: "include",
//         cache: "no-store",
//       });

//       if (!usersResponse.ok) {
//         throw new Error("Failed to fetch users");
//       }

//       const usersData = await usersResponse.json();

//       let users = [];

//       if (Array.isArray(usersData)) {
//         users = usersData;
//       } else if (Array.isArray(usersData?.users)) {
//         users = usersData.users;
//       } else if (Array.isArray(usersData?.data)) {
//         users = usersData.data;
//       }

//       setUsersList(users);

//       // =====================================================
//       // LOGIN HISTORY
//       // =====================================================

//       try {
//         const historyResponse = await fetch("/api/login-history", {
//           method: "GET",
//           credentials: "include",
//           cache: "no-store",
//         });

//         if (historyResponse.ok) {
//           const historyData = await historyResponse.json();

//           if (Array.isArray(historyData)) {
//             setLoginHistory(historyData);
//           } else if (Array.isArray(historyData?.history)) {
//             setLoginHistory(historyData.history);
//           } else if (Array.isArray(historyData?.data)) {
//             setLoginHistory(historyData.data);
//           } else {
//             setLoginHistory([]);
//           }
//         } else {
//           setLoginHistory([]);
//         }
//       } catch (historyError) {
//         console.error("Login history error:", historyError);
//         setLoginHistory([]);
//       }
//     } catch (err) {
//       console.error("Users fetch error:", err);
//       setError(err.message || "Failed to load users");
//       setUsersList([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // =========================================================
//   // INITIAL LOAD
//   // =========================================================

//   useEffect(() => {
//     fetchUsers();
//   }, [fetchUsers]);

//   // =========================================================
//   // USER LOGIN TIME
//   // =========================================================

//   useEffect(() => {
//     const loginTime = localStorage.getItem("crm_login_time");

//     if (loginTime) {
//       console.log("CRM login time:", loginTime);
//     }
//   }, []);

//   // =========================================================
//   // TEAMS
//   // =========================================================

//   const teams = useMemo(() => {
//     const uniqueTeams = new Set();

//     usersList.forEach((user) => {
//       if (user?.team) {
//         uniqueTeams.add(user.team);
//       }
//     });

//     return Array.from(uniqueTeams).sort();
//   }, [usersList]);

//   // =========================================================
//   // FILTER USERS
//   // =========================================================

//   const filteredUsers = useMemo(() => {
//     const search = searchTerm.trim().toLowerCase();
//     const selectedRole = roleFilter.trim().toLowerCase();
//     const selectedStatus = statusFilter.trim().toLowerCase();
//     const selectedTeam = teamFilter.trim().toLowerCase();

//     return usersList.filter((usr) => {
//       // -----------------------------------------------------
//       // SEARCH
//       // -----------------------------------------------------

//       let matchesSearch = true;

//       if (search) {
//         const name = (usr.name || "").toLowerCase();
//         const email = (usr.email || "").toLowerCase();
//         const phone = (usr.phone || "").toLowerCase();

//         matchesSearch =
//           name.includes(search) ||
//           email.includes(search) ||
//           phone.includes(search);
//       }

//       // -----------------------------------------------------
//       // ROLE
//       // -----------------------------------------------------

//       let matchesRole = true;

//       if (roleFilter !== "All Roles") {
//         matchesRole =
//           (usr.role || "").trim().toLowerCase() === selectedRole;
//       }

//       // -----------------------------------------------------
//       // STATUS
//       // -----------------------------------------------------

//       const userStatus = (
//         usr.availability_status ||
//         usr.status ||
//         ""
//       )
//         .trim()
//         .toLowerCase();

//       let matchesStatus = true;

//       if (statusFilter !== "All Status") {
//         // ACTIVE
//         if (selectedStatus === "active") {
//           matchesStatus = userStatus === "active";
//         }

//         // INACTIVE
//         // Anything that is NOT Active is considered unavailable/inactive
//         else if (selectedStatus === "inactive") {
//           matchesStatus = userStatus !== "active";
//         }

//         // OTHER STATUS
//         else {
//           matchesStatus = userStatus === selectedStatus;
//         }
//       }

//       // -----------------------------------------------------
//       // TEAM
//       // -----------------------------------------------------

//       let matchesTeam = true;

//       if (teamFilter !== "All Teams") {
//         matchesTeam =
//           (usr.team || "").trim().toLowerCase() === selectedTeam;
//       }

//       // -----------------------------------------------------
//       // DATE
//       // -----------------------------------------------------

//       let matchesDate = true;

//       const userDate =
//         usr.created_at ||
//         usr.last_login ||
//         usr.login_time;

//       if (startDate || endDate) {
//         if (!userDate) {
//           matchesDate = false;
//         } else {
//           const date = new Date(userDate);

//           if (Number.isNaN(date.getTime())) {
//             matchesDate = false;
//           } else {
//             if (startDate) {
//               const start = new Date(`${startDate}T00:00:00`);

//               if (date < start) {
//                 matchesDate = false;
//               }
//             }

//             if (endDate) {
//               const end = new Date(`${endDate}T23:59:59`);

//               if (date > end) {
//                 matchesDate = false;
//               }
//             }
//           }
//         }
//       }

//       return (
//         matchesSearch &&
//         matchesRole &&
//         matchesStatus &&
//         matchesTeam &&
//         matchesDate
//       );
//     });
//   }, [
//     usersList,
//     searchTerm,
//     roleFilter,
//     statusFilter,
//     teamFilter,
//     startDate,
//     endDate,
//   ]);

//   // =========================================================
//   // STATS
//   // IMPORTANT: THIS IS AN ARRAY BECAUSE WE USE stats.map()
//   // =========================================================

//   const stats = useMemo(() => {
//     const total = usersList.length;

//     const active = usersList.filter((user) => {
//       const status = (
//         user?.availability_status ||
//         user?.status ||
//         ""
//       )
//         .trim()
//         .toLowerCase();

//       return status === "active";
//     }).length;

//     const inactive = usersList.filter((user) => {
//       const status = (
//         user?.availability_status ||
//         user?.status ||
//         ""
//       )
//         .trim()
//         .toLowerCase();

//       // Everything except Active
//       return status !== "active";
//     }).length;

//     const admins = usersList.filter((user) => {
//       return (
//         (user?.role || "")
//           .trim()
//           .toLowerCase() === "admin"
//       );
//     }).length;

//     return [
//       {
//         key: "total",
//         label: "Total Users",
//         value: total,
//         icon: Users,
//         description: "All registered users",
//       },
//       {
//         key: "active",
//         label: "Active Users",
//         value: active,
//         icon: UserCheck,
//         description: "Currently active",
//       },
//       {
//         key: "inactive",
//         label: "Inactive Users",
//         value: inactive,
//         icon: UserX,
//         description: "Not currently active",
//       },
//       {
//         key: "logged-in",
//         label: "Logged In Now",
//         value: active,
//         icon: Clock,
//         description: "Currently active users",
//       },
//       {
//         key: "admins",
//         label: "Total Admins",
//         value: admins,
//         icon: ShieldCheck,
//         description: "Administrator accounts",
//       },
//     ];
//   }, [usersList]);

//   // =========================================================
//   // TABLE ROWS
//   // =========================================================

//   const tableRows = useMemo(() => {
//     return filteredUsers.map((usr) => {
//       const status = getUserStatus(usr);

//       return {
//         ...usr,
//         displayStatus: status,
//       };
//     });
//   }, [filteredUsers, getUserStatus]);

//   // =========================================================
//   // LOGIN HISTORY FOR USER
//   // =========================================================

//   const getUserHistory = useCallback(
//     (userId) => {
//       return loginHistory.filter((item) => {
//         return (
//           String(item.user_id || item.userId) ===
//           String(userId)
//         );
//       });
//     },
//     [loginHistory]
//   );

//   // =========================================================
//   // SAVE USER BREAK
//   // =========================================================

//   const handleSaveBreakTime = async () => {
//     if (!selectedUser) return;

//     try {
//       setSavingBreak(true);

//       const response = await fetch("/api/new-users", {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify({
//           userId: selectedUser.id,
//           applyAll: false,
//           break_start: normalizeDateTimeForDb(breakStart),
//           break_end: normalizeDateTimeForDb(breakEnd),
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data?.error || "Failed to save break time"
//         );
//       }

//       setUsersList((prev) =>
//         prev.map((user) => {
//           if (String(user.id) !== String(selectedUser.id)) {
//             return user;
//           }

//           return {
//             ...user,
//             break_start: normalizeDateTimeForDb(breakStart),
//             break_end: normalizeDateTimeForDb(breakEnd),
//           };
//         })
//       );

//       setBreakModalOpen(false);
//       setSelectedUser(null);
//       setBreakStart("");
//       setBreakEnd("");

//       await fetchUsers();
//     } catch (err) {
//       console.error("Save break error:", err);
//       alert(err.message || "Failed to save break time");
//     } finally {
//       setSavingBreak(false);
//     }
//   };

//   // =========================================================
//   // SAVE ADMIN BREAK FOR ALL
//   // =========================================================

//   const handleSaveAdminBreakTime = async () => {
//     try {
//       setSavingBreak(true);

//       const response = await fetch("/api/new-users", {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify({
//           applyAll: true,
//           break_start: normalizeDateTimeForDb(
//             adminBreakStart
//           ),
//           break_end: normalizeDateTimeForDb(
//             adminBreakEnd
//           ),
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data?.error || "Failed to save break time"
//         );
//       }

//       setAdminBreakModalOpen(false);
//       setAdminBreakStart("");
//       setAdminBreakEnd("");

//       await fetchUsers();
//     } catch (err) {
//       console.error("Admin break error:", err);
//       alert(err.message || "Failed to save break time");
//     } finally {
//       setSavingBreak(false);
//     }
//   };

//   // =========================================================
//   // OPEN BREAK MODAL
//   // =========================================================

//   const openBreakModal = (user) => {
//     setSelectedUser(user);

//     setBreakStart(
//       toDateTimeLocalValue(user?.break_start)
//     );

//     setBreakEnd(
//       toDateTimeLocalValue(user?.break_end)
//     );

//     setBreakModalOpen(true);
//   };

//   // =========================================================
//   // DELETE USER
//   // =========================================================

//   const handleDeleteUser = async (userId) => {
//     if (!userId) return;

//     const confirmed = window.confirm(
//       "Are you sure you want to delete this user?"
//     );

//     if (!confirmed) return;

//     try {
//       setDeletingUserId(userId);

//       const response = await fetch("/api/new-users", {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify({
//           userId,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data?.error || "Failed to delete user"
//         );
//       }

//       setUsersList((prev) =>
//         prev.filter(
//           (user) => String(user.id) !== String(userId)
//         )
//       );
//     } catch (err) {
//       console.error("Delete user error:", err);
//       alert(err.message || "Failed to delete user");
//     } finally {
//       setDeletingUserId(null);
//     }
//   };

//   // =========================================================
//   // CLEAR FILTERS
//   // =========================================================

//   const clearFilters = () => {
//     setSearchTerm("");
//     setRoleFilter("All Roles");
//     setStatusFilter("All Status");
//     setTeamFilter("All Teams");
//     setStartDate("");
//     setEndDate("");
//   };

//   // =========================================================
//   // STATUS BADGE
//   // =========================================================

//   const getStatusBadge = (status) => {
//     const normalized = (status || "")
//       .trim()
//       .toLowerCase();

//     if (normalized === "active") {
//       return {
//         className:
//           "bg-emerald-50 text-emerald-700 border-emerald-200",
//         dot: "bg-emerald-500",
//       };
//     }

//     if (normalized === "inactive") {
//       return {
//         className:
//           "bg-gray-100 text-gray-600 border-gray-200",
//         dot: "bg-gray-500",
//       };
//     }

//     if (normalized === "on call") {
//       return {
//         className:
//           "bg-blue-50 text-blue-700 border-blue-200",
//         dot: "bg-blue-500",
//       };
//     }

//     if (normalized === "namaz break") {
//       return {
//         className:
//           "bg-purple-50 text-purple-700 border-purple-200",
//         dot: "bg-purple-500",
//       };
//     }

//     if (normalized === "lunch break") {
//       return {
//         className:
//           "bg-orange-50 text-orange-700 border-orange-200",
//         dot: "bg-orange-500",
//       };
//     }

//     if (normalized === "washroom break") {
//       return {
//         className:
//           "bg-cyan-50 text-cyan-700 border-cyan-200",
//         dot: "bg-cyan-500",
//       };
//     }

//     return {
//       className:
//         "bg-amber-50 text-amber-700 border-amber-200",
//       dot: "bg-amber-500",
//     };
//   };

//   // =========================================================
//   // ROLE BADGE
//   // =========================================================

//   const getRoleBadge = (role) => {
//     const normalized = (role || "")
//       .trim()
//       .toLowerCase();

//     if (normalized === "admin") {
//       return "bg-red-50 text-red-700 border-red-200";
//     }

//     if (normalized === "manager") {
//       return "bg-indigo-50 text-indigo-700 border-indigo-200";
//     }

//     return "bg-slate-50 text-slate-700 border-slate-200";
//   };

//   // =========================================================
//   // LOADING
//   // =========================================================

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#F7F8FA] flex">
//         <Sidebar
//           sidebarOpen={sidebarOpen}
//           setSidebarOpen={setSidebarOpen}
//         />

//         <main className="flex-1 min-w-0">
//           <div className="flex items-center justify-center min-h-screen">
//             <div className="flex flex-col items-center gap-4">
//               <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
//               <p className="text-sm text-gray-500">
//                 Loading users...
//               </p>
//             </div>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   // =========================================================
//   // MAIN UI
//   // =========================================================

//   return (
//     <div className="min-h-screen bg-[#F7F8FA]">
//       <Sidebar
//         sidebarOpen={sidebarOpen}
//         setSidebarOpen={setSidebarOpen}
//       />

//       {/* MOBILE OVERLAY */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/40 z-40 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* MAIN */}
//       <main className="lg:ml-[260px] min-h-screen">
//         {/* HEADER */}
//         <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200">
//           <div className="px-4 sm:px-6 lg:px-8 py-4">
//             <div className="flex items-center justify-between gap-4">
//               <div className="flex items-center gap-3">
//                 <button
//                   type="button"
//                   onClick={() =>
//                     setSidebarOpen(true)
//                   }
//                   className="lg:hidden w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center"
//                 >
//                   <Menu className="w-5 h-5" />
//                 </button>

//                 <div>
//                   <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
//                     Users
//                   </h1>

//                   <p className="text-sm text-gray-500 mt-0.5">
//                     Manage your CRM users and availability
//                   </p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-2">
//                 <button
//                   type="button"
//                   onClick={fetchUsers}
//                   className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700"
//                 >
//                   <RefreshCw className="w-4 h-4" />
//                   <span className="hidden sm:inline">
//                     Refresh
//                   </span>
//                 </button>

//                 <Link
//                   href="/users/new"
//                   className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium shadow-sm"
//                 >
//                   <Users className="w-4 h-4" />
//                   <span className="hidden sm:inline">
//                     Add User
//                   </span>
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </header>

//         <div className="p-4 sm:p-6 lg:p-8">
//           {/* ERROR */}
//           {error && (
//             <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
//               <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />

//               <div className="flex-1">
//                 <p className="font-medium text-red-800">
//                   Failed to load users
//                 </p>

//                 <p className="text-sm text-red-700 mt-1">
//                   {error}
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 onClick={fetchUsers}
//                 className="text-sm font-medium text-red-700 hover:text-red-900"
//               >
//                 Retry
//               </button>
//             </div>
//           )}

//           {/* =====================================================
//               STATS
//           ===================================================== */}

//           <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
//             {stats.map((stat) => {
//               const Icon = stat.icon;

//               return (
//                 <div
//                   key={stat.key}
//                   className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm"
//                 >
//                   <div className="flex items-start justify-between gap-3">
//                     <div>
//                       <p className="text-xs sm:text-sm text-gray-500 font-medium">
//                         {stat.label}
//                       </p>

//                       <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
//                         {stat.value}
//                       </p>

//                       <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
//                         {stat.description}
//                       </p>
//                     </div>

//                     <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
//                       <Icon className="w-5 h-5 text-gray-700" />
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* =====================================================
//               FILTERS
//           ===================================================== */}

//           <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-6">
//             <div className="p-4 sm:p-5">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center gap-2">
//                   <Filter className="w-5 h-5 text-gray-700" />

//                   <h2 className="font-semibold text-gray-900">
//                     Filters
//                   </h2>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={clearFilters}
//                   className="text-sm text-gray-500 hover:text-gray-900"
//                 >
//                   Clear all
//                 </button>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
//                 {/* SEARCH */}
//                 <div className="lg:col-span-2 relative">
//                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

//                   <input
//                     type="text"
//                     value={searchTerm}
//                     onChange={(e) =>
//                       setSearchTerm(e.target.value)
//                     }
//                     placeholder="Search name, email, phone..."
//                     className="w-full h-11 rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
//                   />
//                 </div>

//                 {/* ROLE */}
//                 <select
//                   value={roleFilter}
//                   onChange={(e) =>
//                     setRoleFilter(e.target.value)
//                   }
//                   className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-gray-400"
//                 >
//                   <option>All Roles</option>
//                   <option>Admin</option>
//                   <option>Manager</option>
//                   <option>Agent</option>
//                 </select>

//                 {/* STATUS */}
//                 <select
//                   value={statusFilter}
//                   onChange={(e) =>
//                     setStatusFilter(e.target.value)
//                   }
//                   className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-gray-400"
//                 >
//                   <option>All Status</option>
//                   <option>Active</option>
//                   <option>Inactive</option>
//                 </select>

//                 {/* TEAM */}
//                 <select
//                   value={teamFilter}
//                   onChange={(e) =>
//                     setTeamFilter(e.target.value)
//                   }
//                   className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-gray-400"
//                 >
//                   <option>All Teams</option>

//                   {teams.map((team) => (
//                     <option key={team} value={team}>
//                       {team}
//                     </option>
//                   ))}
//                 </select>

//                 {/* DATE */}
//                 <div className="flex gap-2">
//                   <div className="relative flex-1">
//                     <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

//                     <input
//                       type="date"
//                       value={startDate}
//                       onChange={(e) =>
//                         setStartDate(e.target.value)
//                       }
//                       className="w-full h-11 rounded-xl border border-gray-200 bg-white pl-9 pr-2 text-xs text-gray-700 outline-none focus:border-gray-400"
//                     />
//                   </div>

//                   <div className="relative flex-1">
//                     <input
//                       type="date"
//                       value={endDate}
//                       onChange={(e) =>
//                         setEndDate(e.target.value)
//                       }
//                       className="w-full h-11 rounded-xl border border-gray-200 bg-white px-2 text-xs text-gray-700 outline-none focus:border-gray-400"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* =====================================================
//               RESULTS HEADER
//           ===================================================== */}

//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
//             <div>
//               <h2 className="text-lg font-semibold text-gray-900">
//                 All Users
//               </h2>

//               <p className="text-sm text-gray-500">
//                 Showing {filteredUsers.length} of{" "}
//                 {usersList.length} users
//               </p>
//             </div>

//             {(searchTerm ||
//               roleFilter !== "All Roles" ||
//               statusFilter !== "All Status" ||
//               teamFilter !== "All Teams" ||
//               startDate ||
//               endDate) && (
//               <div className="text-sm text-gray-500">
//                 Filters applied
//               </div>
//             )}
//           </div>

//           {/* =====================================================
//               USERS TABLE
//           ===================================================== */}

//           <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
//             {tableRows.length === 0 ? (
//               <div className="py-16 px-6 text-center">
//                 <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />

//                 <h3 className="font-semibold text-gray-900">
//                   No users found
//                 </h3>

//                 <p className="text-sm text-gray-500 mt-1">
//                   Try changing your filters or search.
//                 </p>
//               </div>
//             ) : (
//               <>
//                 {/* DESKTOP TABLE */}
//                 <div className="hidden lg:block overflow-x-auto">
//                   <table className="w-full">
//                     <thead>
//                       <tr className="border-b border-gray-200 bg-gray-50/70">
//                         <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
//                           User
//                         </th>

//                         <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
//                           Contact
//                         </th>

//                         <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
//                           Role
//                         </th>

//                         <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
//                           Team
//                         </th>

//                         <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
//                           Status
//                         </th>

//                         <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
//                           Last Login
//                         </th>

//                         <th className="text-right px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
//                           Actions
//                         </th>
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {tableRows.map((user) => {
//                         const badge = getStatusBadge(
//                           user.displayStatus
//                         );

//                         return (
//                           <tr
//                             key={user.id}
//                             className="border-b border-gray-100 last:border-0 hover:bg-gray-50/70 transition"
//                           >
//                             {/* USER */}
//                             <td className="px-5 py-4">
//                               <div className="flex items-center gap-3">
//                                 <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-sm overflow-hidden">
//                                   {user.avatar ? (
//                                     <img
//                                       src={user.avatar}
//                                       alt={user.name}
//                                       className="w-full h-full object-cover"
//                                     />
//                                   ) : (
//                                     (
//                                       user.name ||
//                                       "U"
//                                     )
//                                       .charAt(0)
//                                       .toUpperCase()
//                                   )}
//                                 </div>

//                                 <div>
//                                   <p className="font-medium text-gray-900">
//                                     {user.name || "-"}
//                                   </p>

//                                   <p className="text-xs text-gray-500 mt-0.5">
//                                     ID #{user.id}
//                                   </p>
//                                 </div>
//                               </div>
//                             </td>

//                             {/* CONTACT */}
//                             <td className="px-5 py-4">
//                               <div className="space-y-1">
//                                 <div className="flex items-center gap-2 text-sm text-gray-700">
//                                   <Mail className="w-3.5 h-3.5 text-gray-400" />
//                                   {user.email || "-"}
//                                 </div>

//                                 {user.phone && (
//                                   <div className="flex items-center gap-2 text-xs text-gray-500">
//                                     <Phone className="w-3.5 h-3.5 text-gray-400" />
//                                     {user.phone}
//                                   </div>
//                                 )}
//                               </div>
//                             </td>

//                             {/* ROLE */}
//                             <td className="px-5 py-4">
//                               <span
//                                 className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-medium capitalize ${getRoleBadge(
//                                   user.role
//                                 )}`}
//                               >
//                                 {user.role || "-"}
//                               </span>
//                             </td>

//                             {/* TEAM */}
//                             <td className="px-5 py-4">
//                               <span className="text-sm text-gray-700">
//                                 {user.team || "-"}
//                               </span>
//                             </td>

//                             {/* STATUS */}
//                             <td className="px-5 py-4">
//                               <span
//                                 className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-medium ${badge.className}`}
//                               >
//                                 <span
//                                   className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}
//                                 />

//                                 {user.displayStatus}
//                               </span>
//                             </td>

//                             {/* LAST LOGIN */}
//                             <td className="px-5 py-4">
//                               <div className="text-sm text-gray-700">
//                                 {formatDisplayDateTime(
//                                   user.last_login ||
//                                     user.login_time
//                                 )}
//                               </div>
//                             </td>

//                             {/* ACTIONS */}
//                             <td className="px-5 py-4">
//                               <div className="flex items-center justify-end gap-2">
//                                 <button
//                                   type="button"
//                                   onClick={() =>
//                                     openBreakModal(user)
//                                   }
//                                   className="w-9 h-9 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
//                                   title="Break time"
//                                 >
//                                   <Coffee className="w-4 h-4 text-gray-600" />
//                                 </button>

//                                 <Link
//                                   href={`/users/${user.id}/edit`}
//                                   className="w-9 h-9 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
//                                   title="Edit user"
//                                 >
//                                   <Edit className="w-4 h-4 text-gray-600" />
//                                 </Link>

//                                 <button
//                                   type="button"
//                                   onClick={() =>
//                                     handleDeleteUser(
//                                       user.id
//                                     )
//                                   }
//                                   disabled={
//                                     deletingUserId ===
//                                     user.id
//                                   }
//                                   className="w-9 h-9 rounded-lg border border-red-100 hover:bg-red-50 flex items-center justify-center disabled:opacity-50"
//                                   title="Delete user"
//                                 >
//                                   {deletingUserId ===
//                                   user.id ? (
//                                     <RefreshCw className="w-4 h-4 text-red-500 animate-spin" />
//                                   ) : (
//                                     <Trash2 className="w-4 h-4 text-red-500" />
//                                   )}
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* MOBILE CARDS */}
//                 <div className="lg:hidden divide-y divide-gray-100">
//                   {tableRows.map((user) => {
//                     const badge = getStatusBadge(
//                       user.displayStatus
//                     );

//                     return (
//                       <div
//                         key={user.id}
//                         className="p-4 sm:p-5"
//                       >
//                         <div className="flex items-start justify-between gap-3">
//                           <div className="flex items-center gap-3 min-w-0">
//                             <div className="w-11 h-11 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold shrink-0 overflow-hidden">
//                               {user.avatar ? (
//                                 <img
//                                   src={user.avatar}
//                                   alt={user.name}
//                                   className="w-full h-full object-cover"
//                                 />
//                               ) : (
//                                 (
//                                   user.name || "U"
//                                 )
//                                   .charAt(0)
//                                   .toUpperCase()
//                               )}
//                             </div>

//                             <div className="min-w-0">
//                               <p className="font-semibold text-gray-900 truncate">
//                                 {user.name || "-"}
//                               </p>

//                               <p className="text-xs text-gray-500 truncate">
//                                 {user.email || "-"}
//                               </p>
//                             </div>
//                           </div>

//                           <span
//                             className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium whitespace-nowrap ${badge.className}`}
//                           >
//                             <span
//                               className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}
//                             />

//                             {user.displayStatus}
//                           </span>
//                         </div>

//                         <div className="grid grid-cols-2 gap-3 mt-4">
//                           <div className="rounded-xl bg-gray-50 p-3">
//                             <p className="text-[11px] text-gray-400 uppercase tracking-wide">
//                               Role
//                             </p>

//                             <p className="text-sm font-medium text-gray-700 mt-1 capitalize">
//                               {user.role || "-"}
//                             </p>
//                           </div>

//                           <div className="rounded-xl bg-gray-50 p-3">
//                             <p className="text-[11px] text-gray-400 uppercase tracking-wide">
//                               Team
//                             </p>

//                             <p className="text-sm font-medium text-gray-700 mt-1">
//                               {user.team || "-"}
//                             </p>
//                           </div>

//                           <div className="rounded-xl bg-gray-50 p-3">
//                             <p className="text-[11px] text-gray-400 uppercase tracking-wide">
//                               Phone
//                             </p>

//                             <p className="text-sm font-medium text-gray-700 mt-1">
//                               {user.phone || "-"}
//                             </p>
//                           </div>

//                           <div className="rounded-xl bg-gray-50 p-3">
//                             <p className="text-[11px] text-gray-400 uppercase tracking-wide">
//                               Last Login
//                             </p>

//                             <p className="text-sm font-medium text-gray-700 mt-1">
//                               {formatDisplayDateTime(
//                                 user.last_login ||
//                                   user.login_time
//                               )}
//                             </p>
//                           </div>
//                         </div>

//                         <div className="flex items-center justify-end gap-2 mt-4">
//                           <button
//                             type="button"
//                             onClick={() =>
//                               openBreakModal(user)
//                             }
//                             className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
//                           >
//                             <Coffee className="w-4 h-4" />
//                             Break
//                           </button>

//                           <Link
//                             href={`/users/${user.id}/edit`}
//                             className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
//                           >
//                             <Edit className="w-4 h-4" />
//                             Edit
//                           </Link>

//                           <button
//                             type="button"
//                             onClick={() =>
//                               handleDeleteUser(user.id)
//                             }
//                             disabled={
//                               deletingUserId === user.id
//                             }
//                             className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-100 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
//                           >
//                             {deletingUserId ===
//                             user.id ? (
//                               <RefreshCw className="w-4 h-4 animate-spin" />
//                             ) : (
//                               <Trash2 className="w-4 h-4" />
//                             )}
//                             Delete
//                           </button>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </main>

//       {/* =====================================================
//           USER BREAK MODAL
//       ===================================================== */}

//       {breakModalOpen && selectedUser && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//           <div
//             className="absolute inset-0 bg-black/50"
//             onClick={() =>
//               !savingBreak &&
//               setBreakModalOpen(false)
//             }
//           />

//           <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
//             <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
//               <div>
//                 <h3 className="font-semibold text-gray-900">
//                   Set Break Time
//                 </h3>

//                 <p className="text-sm text-gray-500 mt-0.5">
//                   {selectedUser.name}
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 disabled={savingBreak}
//                 onClick={() =>
//                   setBreakModalOpen(false)
//                 }
//                 className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center"
//               >
//                 <X className="w-5 h-5 text-gray-500" />
//               </button>
//             </div>

//             <div className="p-5 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Break Start
//                 </label>

//                 <input
//                   type="datetime-local"
//                   value={breakStart}
//                   onChange={(e) =>
//                     setBreakStart(e.target.value)
//                   }
//                   className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Break End
//                 </label>

//                 <input
//                   type="datetime-local"
//                   value={breakEnd}
//                   onChange={(e) =>
//                     setBreakEnd(e.target.value)
//                   }
//                   className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400"
//                 />
//               </div>
//             </div>

//             <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200 bg-gray-50">
//               <button
//                 type="button"
//                 disabled={savingBreak}
//                 onClick={() =>
//                   setBreakModalOpen(false)
//                 }
//                 className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 disabled={savingBreak}
//                 onClick={handleSaveBreakTime}
//                 className="px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-50"
//               >
//                 {savingBreak
//                   ? "Saving..."
//                   : "Save Break"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* =====================================================
//           ADMIN BREAK MODAL
//       ===================================================== */}

//       {adminBreakModalOpen && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//           <div
//             className="absolute inset-0 bg-black/50"
//             onClick={() =>
//               !savingBreak &&
//               setAdminBreakModalOpen(false)
//             }
//           />

//           <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
//             <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
//               <div>
//                 <h3 className="font-semibold text-gray-900">
//                   Set Break For All Users
//                 </h3>

//                 <p className="text-sm text-gray-500 mt-0.5">
//                   Apply break schedule to everyone
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 disabled={savingBreak}
//                 onClick={() =>
//                   setAdminBreakModalOpen(false)
//                 }
//                 className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center"
//               >
//                 <X className="w-5 h-5 text-gray-500" />
//               </button>
//             </div>

//             <div className="p-5 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Break Start
//                 </label>

//                 <input
//                   type="datetime-local"
//                   value={adminBreakStart}
//                   onChange={(e) =>
//                     setAdminBreakStart(
//                       e.target.value
//                     )
//                   }
//                   className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Break End
//                 </label>

//                 <input
//                   type="datetime-local"
//                   value={adminBreakEnd}
//                   onChange={(e) =>
//                     setAdminBreakEnd(
//                       e.target.value
//                     )
//                   }
//                   className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400"
//                 />
//               </div>
//             </div>

//             <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200 bg-gray-50">
//               <button
//                 type="button"
//                 disabled={savingBreak}
//                 onClick={() =>
//                   setAdminBreakModalOpen(false)
//                 }
//                 className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 disabled={savingBreak}
//                 onClick={handleSaveAdminBreakTime}
//                 className="px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-50"
//               >
//                 {savingBreak
//                   ? "Saving..."
//                   : "Apply To All"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* =====================================================
//           LOGOUT MODAL
//       ===================================================== */}

//       {logoutModalOpen && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//           <div
//             className="absolute inset-0 bg-black/50"
//             onClick={() =>
//               setLogoutModalOpen(false)
//             }
//           />

//           <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
//             <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
//               <LogOut className="w-6 h-6 text-red-600" />
//             </div>

//             <h3 className="text-lg font-semibold text-gray-900">
//               Logout
//             </h3>

//             <p className="text-sm text-gray-500 mt-2">
//               Are you sure you want to logout?
//             </p>

//             <div className="flex items-center justify-end gap-3 mt-6">
//               <button
//                 type="button"
//                 onClick={() =>
//                   setLogoutModalOpen(false)
//                 }
//                 className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 onClick={() => {
//                   localStorage.removeItem(
//                     "crm_login_time"
//                   );
//                   router.push("/login");
//                 }}
//                 className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium"
//               >
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



































// "use client";

// import {
//   Users,
//   UserCheck,
//   UserX,
//   ShieldCheck,
//   Clock3,
//   Search,
//   Filter,
//   CalendarDays,
//   Phone,
//   Mail,
//   Edit3,
//   Trash2,
//   Menu,
//   X,
//   Coffee,
//   LogOut,
//   AlertCircle,
//   RefreshCw,
//   ChevronDown,
//   UserRound,
//   Building2,
//   Activity,
// } from "lucide-react";

// import {
//   useState,
//   useCallback,
//   useEffect,
//   useMemo,
// } from "react";

// import { useRouter } from "next/navigation";
// import Sidebar from "@/components/Sidebar";
// import Link from "next/link";

// export default function UsersPage() {
//   const router = useRouter();

//   // =========================================================
//   // THEME
//   // =========================================================

//   const MAROON = "#741C29";
//   const MAROON_DARK = "#5C1520";

//   // =========================================================
//   // STATES
//   // =========================================================

//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const [usersList, setUsersList] = useState([]);
//   const [loginHistory, setLoginHistory] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [searchTerm, setSearchTerm] = useState("");
//   const [roleFilter, setRoleFilter] = useState("All Roles");
//   const [statusFilter, setStatusFilter] = useState("All Status");
//   const [teamFilter, setTeamFilter] = useState("All Teams");

//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   const [logoutModalOpen, setLogoutModalOpen] =
//     useState(false);

//   const [breakModalOpen, setBreakModalOpen] =
//     useState(false);

//   const [selectedUser, setSelectedUser] =
//     useState(null);

//   const [breakStart, setBreakStart] = useState("");
//   const [breakEnd, setBreakEnd] = useState("");

//   const [adminBreakModalOpen, setAdminBreakModalOpen] =
//     useState(false);

//   const [adminBreakStart, setAdminBreakStart] =
//     useState("");

//   const [adminBreakEnd, setAdminBreakEnd] =
//     useState("");

//   const [savingBreak, setSavingBreak] =
//     useState(false);

//   const [deletingUserId, setDeletingUserId] =
//     useState(null);

//   // =========================================================
//   // DATE HELPERS
//   // =========================================================

//   const formatDisplayDateTime = (value) => {
//     if (!value) return "Never";

//     const date = new Date(value);

//     if (Number.isNaN(date.getTime())) {
//       return "Never";
//     }

//     return date.toLocaleString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//       hour: "numeric",
//       minute: "2-digit",
//     });
//   };

//   const toDateTimeLocalValue = (value) => {
//     if (!value) return "";

//     const date = new Date(value);

//     if (Number.isNaN(date.getTime())) {
//       return "";
//     }

//     const year = date.getFullYear();

//     const month = String(
//       date.getMonth() + 1
//     ).padStart(2, "0");

//     const day = String(
//       date.getDate()
//     ).padStart(2, "0");

//     const hours = String(
//       date.getHours()
//     ).padStart(2, "0");

//     const minutes = String(
//       date.getMinutes()
//     ).padStart(2, "0");

//     return `${year}-${month}-${day}T${hours}:${minutes}`;
//   };

//   const normalizeDateTimeForDb = (value) => {
//     if (!value) return null;

//     const date = new Date(value);

//     if (Number.isNaN(date.getTime())) {
//       return null;
//     }

//     const year = date.getFullYear();

//     const month = String(
//       date.getMonth() + 1
//     ).padStart(2, "0");

//     const day = String(
//       date.getDate()
//     ).padStart(2, "0");

//     const hours = String(
//       date.getHours()
//     ).padStart(2, "0");

//     const minutes = String(
//       date.getMinutes()
//     ).padStart(2, "0");

//     const seconds = String(
//       date.getSeconds()
//     ).padStart(2, "0");

//     return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
//   };

//   // =========================================================
//   // STATUS HELPERS
//   // =========================================================

//   const getUserStatus = useCallback((user) => {
//     return (
//       user?.availability_status ||
//       user?.status ||
//       "Active"
//     )
//       .toString()
//       .trim();
//   }, []);

//   // =========================================================
//   // FETCH USERS
//   // =========================================================

//   const fetchUsers = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const usersResponse = await fetch(
//         "/api/new-users",
//         {
//           method: "GET",
//           credentials: "include",
//           cache: "no-store",
//         }
//       );

//       if (!usersResponse.ok) {
//         throw new Error(
//           "Failed to fetch users"
//         );
//       }

//       const usersData =
//         await usersResponse.json();

//       let users = [];

//       if (Array.isArray(usersData)) {
//         users = usersData;
//       } else if (
//         Array.isArray(usersData?.users)
//       ) {
//         users = usersData.users;
//       } else if (
//         Array.isArray(usersData?.data)
//       ) {
//         users = usersData.data;
//       }

//       setUsersList(users);

//       // -------------------------------------------------------
//       // LOGIN HISTORY
//       // -------------------------------------------------------

//       try {
//         const historyResponse =
//           await fetch(
//             "/api/login-history",
//             {
//               method: "GET",
//               credentials: "include",
//               cache: "no-store",
//             }
//           );

//         if (historyResponse.ok) {
//           const historyData =
//             await historyResponse.json();

//           if (Array.isArray(historyData)) {
//             setLoginHistory(historyData);
//           } else if (
//             Array.isArray(
//               historyData?.history
//             )
//           ) {
//             setLoginHistory(
//               historyData.history
//             );
//           } else if (
//             Array.isArray(
//               historyData?.data
//             )
//           ) {
//             setLoginHistory(
//               historyData.data
//             );
//           } else {
//             setLoginHistory([]);
//           }
//         } else {
//           setLoginHistory([]);
//         }
//       } catch (historyError) {
//         console.error(
//           "Login history error:",
//           historyError
//         );

//         setLoginHistory([]);
//       }
//     } catch (err) {
//       console.error(
//         "Users fetch error:",
//         err
//       );

//       setError(
//         err.message ||
//           "Failed to load users"
//       );

//       setUsersList([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // =========================================================
//   // INITIAL LOAD
//   // =========================================================

//   useEffect(() => {
//     fetchUsers();
//   }, [fetchUsers]);

//   // =========================================================
//   // TEAMS
//   // =========================================================

//   const teams = useMemo(() => {
//     const uniqueTeams = new Set();

//     usersList.forEach((user) => {
//       if (user?.team) {
//         uniqueTeams.add(user.team);
//       }
//     });

//     return Array.from(uniqueTeams).sort();
//   }, [usersList]);

//   // =========================================================
//   // FILTERED USERS
//   // =========================================================

//   const filteredUsers = useMemo(() => {
//     const search =
//       searchTerm
//         .trim()
//         .toLowerCase();

//     const selectedRole =
//       roleFilter
//         .trim()
//         .toLowerCase();

//     const selectedStatus =
//       statusFilter
//         .trim()
//         .toLowerCase();

//     const selectedTeam =
//       teamFilter
//         .trim()
//         .toLowerCase();

//     return usersList.filter(
//       (usr) => {
//         // ---------------------------------------------------
//         // SEARCH
//         // ---------------------------------------------------

//         let matchesSearch = true;

//         if (search) {
//           const name =
//             (usr.name || "")
//               .toLowerCase();

//           const email =
//             (usr.email || "")
//               .toLowerCase();

//           const phone =
//             (usr.phone || "")
//               .toLowerCase();

//           matchesSearch =
//             name.includes(search) ||
//             email.includes(search) ||
//             phone.includes(search);
//         }

//         // ---------------------------------------------------
//         // ROLE
//         // ---------------------------------------------------

//         let matchesRole = true;

//         if (
//           roleFilter !== "All Roles"
//         ) {
//           matchesRole =
//             (
//               usr.role || ""
//             )
//               .trim()
//               .toLowerCase() ===
//             selectedRole;
//         }

//         // ---------------------------------------------------
//         // STATUS
//         // ---------------------------------------------------

//         const userStatus = (
//           usr.availability_status ||
//           usr.status ||
//           ""
//         )
//           .trim()
//           .toLowerCase();

//         let matchesStatus = true;

//         if (
//           statusFilter !==
//           "All Status"
//         ) {
//           if (
//             selectedStatus ===
//             "active"
//           ) {
//             matchesStatus =
//               userStatus ===
//               "active";
//           } else if (
//             selectedStatus ===
//             "inactive"
//           ) {
//             // IMPORTANT:
//             // Everything except Active
//             // is treated as unavailable/inactive.
//             matchesStatus =
//               userStatus !==
//               "active";
//           } else {
//             matchesStatus =
//               userStatus ===
//               selectedStatus;
//           }
//         }

//         // ---------------------------------------------------
//         // TEAM
//         // ---------------------------------------------------

//         let matchesTeam = true;

//         if (
//           teamFilter !== "All Teams"
//         ) {
//           matchesTeam =
//             (
//               usr.team || ""
//             )
//               .trim()
//               .toLowerCase() ===
//             selectedTeam;
//         }

//         // ---------------------------------------------------
//         // DATE
//         // ---------------------------------------------------

//         let matchesDate = true;

//         const userDate =
//           usr.created_at ||
//           usr.last_login ||
//           usr.login_time;

//         if (startDate || endDate) {
//           if (!userDate) {
//             matchesDate = false;
//           } else {
//             const date =
//               new Date(userDate);

//             if (
//               Number.isNaN(
//                 date.getTime()
//               )
//             ) {
//               matchesDate = false;
//             } else {
//               if (startDate) {
//                 const start =
//                   new Date(
//                     `${startDate}T00:00:00`
//                   );

//                 if (date < start) {
//                   matchesDate = false;
//                 }
//               }

//               if (endDate) {
//                 const end =
//                   new Date(
//                     `${endDate}T23:59:59`
//                   );

//                 if (date > end) {
//                   matchesDate = false;
//                 }
//               }
//             }
//           }
//         }

//         return (
//           matchesSearch &&
//           matchesRole &&
//           matchesStatus &&
//           matchesTeam &&
//           matchesDate
//         );
//       }
//     );
//   }, [
//     usersList,
//     searchTerm,
//     roleFilter,
//     statusFilter,
//     teamFilter,
//     startDate,
//     endDate,
//   ]);

//   // =========================================================
//   // STATS
//   // =========================================================

//   const stats = useMemo(() => {
//     const total =
//       usersList.length;

//     const active =
//       usersList.filter(
//         (user) => {
//           const status = (
//             user?.availability_status ||
//             user?.status ||
//             ""
//           )
//             .trim()
//             .toLowerCase();

//           return (
//             status === "active"
//           );
//         }
//       ).length;

//     const inactive =
//       usersList.filter(
//         (user) => {
//           const status = (
//             user?.availability_status ||
//             user?.status ||
//             ""
//           )
//             .trim()
//             .toLowerCase();

//           return (
//             status !== "active"
//           );
//         }
//       ).length;

//     const admins =
//       usersList.filter(
//         (user) =>
//           (
//             user?.role || ""
//           )
//             .trim()
//             .toLowerCase() ===
//           "admin"
//       ).length;

//     return [
//       {
//         key: "total",
//         label: "Total Users",
//         value: total,
//         icon: Users,
//         small: "All registered users",
//       },
//       {
//         key: "active",
//         label: "Active Users",
//         value: active,
//         icon: UserCheck,
//         small: "Currently active",
//       },
//       {
//         key: "inactive",
//         label: "Inactive Users",
//         value: inactive,
//         icon: UserX,
//         small: "Unavailable users",
//       },
//       {
//         key: "logged",
//         label: "Logged In Now",
//         value: active,
//         icon: Clock3,
//         small: "Currently online",
//       },
//       {
//         key: "admins",
//         label: "Total Admins",
//         value: admins,
//         icon: ShieldCheck,
//         small: "Administrator accounts",
//       },
//     ];
//   }, [usersList]);

//   // =========================================================
//   // TABLE ROWS
//   // =========================================================

//   const tableRows = useMemo(() => {
//     return filteredUsers.map(
//       (user) => ({
//         ...user,
//         displayStatus:
//           getUserStatus(user),
//       })
//     );
//   }, [
//     filteredUsers,
//     getUserStatus,
//   ]);

//   // =========================================================
//   // STATUS STYLE
//   // =========================================================

//   const getStatusStyle = (status) => {
//     const normalized = (
//       status || ""
//     )
//       .trim()
//       .toLowerCase();

//     if (
//       normalized === "active"
//     ) {
//       return {
//         wrapper:
//           "bg-[#741C29]/8 border-[#741C29]/20 text-[#741C29]",
//         dot:
//           "bg-[#741C29]",
//       };
//     }

//     if (
//       normalized === "inactive"
//     ) {
//       return {
//         wrapper:
//           "bg-gray-100 border-gray-200 text-gray-700",
//         dot:
//           "bg-gray-700",
//       };
//     }

//     return {
//       wrapper:
//         "bg-[#F4F1EF] border-[#D9D0CC] text-[#5E4B4F]",
//       dot:
//         "bg-[#741C29]",
//     };
//   };

//   // =========================================================
//   // ROLE STYLE
//   // =========================================================

//   const getRoleStyle = (role) => {
//     const normalized = (
//       role || ""
//     )
//       .trim()
//       .toLowerCase();

//     if (
//       normalized === "admin"
//     ) {
//       return "bg-[#741C29] text-white border-[#741C29]";
//     }

//     if (
//       normalized === "manager"
//     ) {
//       return "bg-[#F4F1EF] text-[#741C29] border-[#DCCFD0]";
//     }

//     return "bg-white text-gray-700 border-gray-200";
//   };

//   // =========================================================
//   // OPEN BREAK MODAL
//   // =========================================================

//   const openBreakModal = (
//     user
//   ) => {
//     setSelectedUser(user);

//     setBreakStart(
//       toDateTimeLocalValue(
//         user?.break_start
//       )
//     );

//     setBreakEnd(
//       toDateTimeLocalValue(
//         user?.break_end
//       )
//     );

//     setBreakModalOpen(true);
//   };

//   // =========================================================
//   // SAVE BREAK
//   // =========================================================

//   const handleSaveBreakTime =
//     async () => {
//       if (!selectedUser) return;

//       try {
//         setSavingBreak(true);

//         const response =
//           await fetch(
//             "/api/new-users",
//             {
//               method: "PATCH",
//               headers: {
//                 "Content-Type":
//                   "application/json",
//               },
//               credentials:
//                 "include",
//               body: JSON.stringify({
//                 userId:
//                   selectedUser.id,
//                 applyAll: false,
//                 break_start:
//                   normalizeDateTimeForDb(
//                     breakStart
//                   ),
//                 break_end:
//                   normalizeDateTimeForDb(
//                     breakEnd
//                   ),
//               }),
//             }
//           );

//         const data =
//           await response.json();

//         if (!response.ok) {
//           throw new Error(
//             data?.error ||
//               "Failed to save break time"
//           );
//         }

//         setBreakModalOpen(
//           false
//         );

//         setSelectedUser(
//           null
//         );

//         setBreakStart("");
//         setBreakEnd("");

//         await fetchUsers();
//       } catch (err) {
//         console.error(
//           "Save break error:",
//           err
//         );

//         alert(
//           err.message ||
//             "Failed to save break time"
//         );
//       } finally {
//         setSavingBreak(false);
//       }
//     };

//   // =========================================================
//   // SAVE ADMIN BREAK
//   // =========================================================

//   const handleSaveAdminBreakTime =
//     async () => {
//       try {
//         setSavingBreak(true);

//         const response =
//           await fetch(
//             "/api/new-users",
//             {
//               method: "PATCH",
//               headers: {
//                 "Content-Type":
//                   "application/json",
//               },
//               credentials:
//                 "include",
//               body: JSON.stringify({
//                 applyAll: true,
//                 break_start:
//                   normalizeDateTimeForDb(
//                     adminBreakStart
//                   ),
//                 break_end:
//                   normalizeDateTimeForDb(
//                     adminBreakEnd
//                   ),
//               }),
//             }
//           );

//         const data =
//           await response.json();

//         if (!response.ok) {
//           throw new Error(
//             data?.error ||
//               "Failed to save break time"
//           );
//         }

//         setAdminBreakModalOpen(
//           false
//         );

//         setAdminBreakStart("");
//         setAdminBreakEnd("");

//         await fetchUsers();
//       } catch (err) {
//         console.error(
//           "Admin break error:",
//           err
//         );

//         alert(
//           err.message ||
//             "Failed to save break time"
//         );
//       } finally {
//         setSavingBreak(false);
//       }
//     };

//   // =========================================================
//   // DELETE USER
//   // =========================================================

//   const handleDeleteUser =
//     async (userId) => {
//       if (!userId) return;

//       const confirmed =
//         window.confirm(
//           "Are you sure you want to delete this user?"
//         );

//       if (!confirmed) return;

//       try {
//         setDeletingUserId(
//           userId
//         );

//         const response =
//           await fetch(
//             "/api/new-users",
//             {
//               method: "DELETE",
//               headers: {
//                 "Content-Type":
//                   "application/json",
//               },
//               credentials:
//                 "include",
//               body: JSON.stringify({
//                 userId,
//               }),
//             }
//           );

//         const data =
//           await response.json();

//         if (!response.ok) {
//           throw new Error(
//             data?.error ||
//               "Failed to delete user"
//           );
//         }

//         setUsersList(
//           (prev) =>
//             prev.filter(
//               (user) =>
//                 String(user.id) !==
//                 String(userId)
//             )
//         );
//       } catch (err) {
//         console.error(
//           "Delete user error:",
//           err
//         );

//         alert(
//           err.message ||
//             "Failed to delete user"
//         );
//       } finally {
//         setDeletingUserId(
//           null
//         );
//       }
//     };

//   // =========================================================
//   // CLEAR FILTERS
//   // =========================================================

//   const clearFilters = () => {
//     setSearchTerm("");
//     setRoleFilter(
//       "All Roles"
//     );
//     setStatusFilter(
//       "All Status"
//     );
//     setTeamFilter(
//       "All Teams"
//     );
//     setStartDate("");
//     setEndDate("");
//   };

//   // =========================================================
//   // LOADING
//   // =========================================================

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#F7F5F3]">
//         <Sidebar
//           sidebarOpen={
//             sidebarOpen
//           }
//           setSidebarOpen={
//             setSidebarOpen
//           }
//         />

//         <main className="lg:ml-[260px] min-h-screen flex items-center justify-center">
//           <div className="text-center">
//             <div className="w-14 h-14 rounded-2xl bg-[#741C29] flex items-center justify-center mx-auto shadow-lg shadow-[#741C29]/20">
//               <RefreshCw className="w-6 h-6 text-white animate-spin" />
//             </div>

//             <h2 className="mt-5 text-lg font-semibold text-gray-900">
//               Loading Users
//             </h2>

//             <p className="mt-1 text-sm text-gray-500">
//               Please wait...
//             </p>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   // =========================================================
//   // MAIN
//   // =========================================================

//   return (
//     <div className="min-h-screen bg-[#F7F5F3] text-gray-900">
//       {/* MOBILE OVERLAY */}

//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 z-40 lg:hidden"
//           onClick={() =>
//             setSidebarOpen(false)
//           }
//         />
//       )}

//       <Sidebar
//         sidebarOpen={
//           sidebarOpen
//         }
//         setSidebarOpen={
//           setSidebarOpen
//         }
//       />

//       <main className="lg:ml-[260px] min-h-screen">
//         {/* =====================================================
//             HEADER
//         ===================================================== */}

//         <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-[#E6E0DC]">
//           <div className="px-4 sm:px-6 lg:px-8 py-4">
//             <div className="flex items-center justify-between gap-4">
//               <div className="flex items-center gap-3">
//                 <button
//                   type="button"
//                   onClick={() =>
//                     setSidebarOpen(
//                       true
//                     )
//                   }
//                   className="lg:hidden w-10 h-10 rounded-xl border border-[#E5DEDA] bg-white flex items-center justify-center hover:bg-[#F7F5F3]"
//                 >
//                   <Menu className="w-5 h-5 text-gray-800" />
//                 </button>

//                 <div>
//                   <div className="flex items-center gap-2">
//                     <div className="hidden sm:block w-1 h-6 rounded-full bg-[#741C29]" />

//                     <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
//                       EMP ID
//                     </h1>
//                   </div>

//                   <p className="text-sm text-gray-500 mt-1">
//                     Manage users, roles and availability
//                   </p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-2">
//                 <button
//                   type="button"
//                   onClick={
//                     fetchUsers
//                   }
//                   className="h-10 sm:h-11 px-3 sm:px-4 rounded-xl border border-[#DED7D3] bg-white hover:bg-[#F7F5F3] text-sm font-semibold text-gray-800 flex items-center gap-2 transition"
//                 >
//                   <RefreshCw className="w-4 h-4" />

//                   <span className="hidden sm:inline">
//                     Refresh
//                   </span>
//                 </button>

//                 <Link
//                   href="/add-new-users"
//                   className="h-10 sm:h-11 px-3 sm:px-5 rounded-xl bg-[#741C29] hover:bg-[#5C1520] text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-[#741C29]/15 transition"
//                 >
//                   <Users className="w-4 h-4" />

//                   <span>
//                     <span className="hidden sm:inline">
//                       Add User
//                     </span>

//                     <span className="sm:hidden">
//                       Add
//                     </span>
//                   </span>
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </header>

//         <div className="p-4 sm:p-6 lg:p-8 max-w-[1800px] mx-auto">
//           {/* =====================================================
//               ERROR
//           ===================================================== */}

//           {error && (
//             <div className="mb-6 bg-white border border-[#D9BFC3] rounded-2xl p-4 flex items-start gap-3 shadow-sm">
//               <div className="w-9 h-9 rounded-xl bg-[#741C29]/10 flex items-center justify-center shrink-0">
//                 <AlertCircle className="w-5 h-5 text-[#741C29]" />
//               </div>

//               <div className="flex-1">
//                 <p className="font-semibold text-gray-900">
//                   Failed to load users
//                 </p>

//                 <p className="text-sm text-gray-500 mt-1">
//                   {error}
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 onClick={
//                   fetchUsers
//                 }
//                 className="text-sm font-semibold text-[#741C29] hover:text-[#5C1520]"
//               >
//                 Retry
//               </button>
//             </div>
//           )}

//           {/* =====================================================
//               STATS
//           ===================================================== */}

//           <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 sm:gap-4 mb-7">
//             {stats.map(
//               (stat, index) => {
//                 const Icon =
//                   stat.icon;

//                 const isMain =
//                   index === 0;

//                 return (
//                   <div
//                     key={
//                       stat.key
//                     }
//                     className={`group relative overflow-hidden rounded-2xl border bg-white p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 ${
//                       isMain
//                         ? "border-[#741C29]/20 shadow-[0_10px_35px_rgba(116,28,41,0.08)]"
//                         : "border-[#E4DEDA] shadow-sm hover:shadow-md"
//                     }`}
//                   >
//                     {isMain && (
//                       <div className="absolute top-0 left-0 right-0 h-1 bg-[#741C29]" />
//                     )}

//                     <div className="flex items-start justify-between gap-3">
//                       <div>
//                         <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.08em] text-gray-500">
//                           {stat.label}
//                         </p>

//                         <p className="text-2xl sm:text-3xl font-bold text-[#111111] mt-2">
//                           {stat.value}
//                         </p>

//                         <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
//                           {stat.small}
//                         </p>
//                       </div>

//                       <div
//                         className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${
//                           isMain
//                             ? "bg-[#741C29] text-white"
//                             : "bg-[#F5F1EF] text-[#741C29]"
//                         }`}
//                       >
//                         <Icon className="w-5 h-5" />
//                       </div>
//                     </div>
//                   </div>
//                 );
//               }
//             )}
//           </div>

//           {/* =====================================================
//               FILTER PANEL
//           ===================================================== */}

//           <div className="bg-white border border-[#E4DEDA] rounded-2xl shadow-sm overflow-hidden mb-7">
//             <div className="px-4 sm:px-5 py-4 border-b border-[#ECE7E4] flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="w-9 h-9 rounded-xl bg-[#741C29]/10 flex items-center justify-center">
//                   <Filter className="w-4 h-4 text-[#741C29]" />
//                 </div>

//                 <div>
//                   <h2 className="font-bold text-gray-900">
//                     Filters
//                   </h2>

//                   <p className="text-xs text-gray-400">
//                     Find users quickly
//                   </p>
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={
//                   clearFilters
//                 }
//                 className="text-xs sm:text-sm font-semibold text-[#741C29] hover:text-[#5C1520]"
//               >
//                 Clear Filters
//               </button>
//             </div>

//             <div className="p-4 sm:p-5">
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
//                 {/* SEARCH */}

//                 <div className="lg:col-span-2 relative">
//                   <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

//                   <input
//                     type="text"
//                     value={
//                       searchTerm
//                     }
//                     onChange={(e) =>
//                       setSearchTerm(
//                         e.target
//                           .value
//                       )
//                     }
//                     placeholder="Search name, email or phone..."
//                     className="w-full h-11 rounded-xl border border-[#DDD6D2] bg-[#FCFBFA] pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:bg-white focus:border-[#741C29] focus:ring-4 focus:ring-[#741C29]/8"
//                   />
//                 </div>

//                 {/* ROLE */}

//                 <div className="relative">
//                   <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

//                   <select
//                     value={
//                       roleFilter
//                     }
//                     onChange={(e) =>
//                       setRoleFilter(
//                         e.target
//                           .value
//                       )
//                     }
//                     className="appearance-none w-full h-11 rounded-xl border border-[#DDD6D2] bg-[#FCFBFA] pl-10 pr-9 text-sm text-gray-700 outline-none focus:bg-white focus:border-[#741C29] focus:ring-4 focus:ring-[#741C29]/8"
//                   >
//                     <option>
//                       All Roles
//                     </option>
//                     <option>
//                       Admin
//                     </option>
//                     <option>
//                       Manager
//                     </option>
//                     <option>
//                       Agent
//                     </option>
//                   </select>

//                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
//                 </div>

//                 {/* STATUS */}

//                 <div className="relative">
//                   <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

//                   <select
//                     value={
//                       statusFilter
//                     }
//                     onChange={(e) =>
//                       setStatusFilter(
//                         e.target
//                           .value
//                       )
//                     }
//                     className="appearance-none w-full h-11 rounded-xl border border-[#DDD6D2] bg-[#FCFBFA] pl-10 pr-9 text-sm text-gray-700 outline-none focus:bg-white focus:border-[#741C29] focus:ring-4 focus:ring-[#741C29]/8"
//                   >
//                     <option>
//                       All Status
//                     </option>
//                     <option>
//                       Active
//                     </option>
//                     <option>
//                       Inactive
//                     </option>
//                   </select>

//                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
//                 </div>

//                 {/* TEAM */}

//                 <div className="relative">
//                   <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

//                   <select
//                     value={
//                       teamFilter
//                     }
//                     onChange={(e) =>
//                       setTeamFilter(
//                         e.target
//                           .value
//                       )
//                     }
//                     className="appearance-none w-full h-11 rounded-xl border border-[#DDD6D2] bg-[#FCFBFA] pl-10 pr-9 text-sm text-gray-700 outline-none focus:bg-white focus:border-[#741C29] focus:ring-4 focus:ring-[#741C29]/8"
//                   >
//                     <option>
//                       All Teams
//                     </option>

//                     {teams.map(
//                       (
//                         team
//                       ) => (
//                         <option
//                           key={
//                             team
//                           }
//                           value={
//                             team
//                           }
//                         >
//                           {
//                             team
//                           }
//                         </option>
//                       )
//                     )}
//                   </select>

//                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
//                 </div>

//                 {/* DATES */}

//                 <div className="grid grid-cols-2 gap-2">
//                   <div className="relative">
//                     <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

//                     <input
//                       type="date"
//                       value={
//                         startDate
//                       }
//                       onChange={(e) =>
//                         setStartDate(
//                           e.target
//                             .value
//                         )
//                       }
//                       className="w-full h-11 rounded-xl border border-[#DDD6D2] bg-[#FCFBFA] pl-9 pr-1 text-xs text-gray-700 outline-none focus:bg-white focus:border-[#741C29]"
//                     />
//                   </div>

//                   <div>
//                     <input
//                       type="date"
//                       value={
//                         endDate
//                       }
//                       onChange={(e) =>
//                         setEndDate(
//                           e.target
//                             .value
//                         )
//                       }
//                       className="w-full h-11 rounded-xl border border-[#DDD6D2] bg-[#FCFBFA] px-2 text-xs text-gray-700 outline-none focus:bg-white focus:border-[#741C29]"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* =====================================================
//               TABLE HEADER
//           ===================================================== */}

//           <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
//             <div>
//               <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#741C29]">
//                 User Directory
//               </p>

//               <h2 className="text-xl font-bold text-[#111111] mt-1">
//                 All Users
//               </h2>

//               <p className="text-sm text-gray-500 mt-1">
//                 Showing{" "}
//                 <span className="font-semibold text-gray-800">
//                   {
//                     filteredUsers.length
//                   }
//                 </span>{" "}
//                 of{" "}
//                 <span className="font-semibold text-gray-800">
//                   {
//                     usersList.length
//                   }
//                 </span>{" "}
//                 EMP ID
//               </p>
//             </div>

//             <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
//               <span className="w-2 h-2 rounded-full bg-[#741C29]" />
//               Live availability
//             </div>
//           </div>

//           {/* =====================================================
//               USERS TABLE
//           ===================================================== */}

//           <div className="bg-white border border-[#E4DEDA] rounded-2xl shadow-sm overflow-hidden">
//             {tableRows.length ===
//             0 ? (
//               <div className="py-20 px-6 text-center">
//                 <div className="w-16 h-16 rounded-2xl bg-[#F5F1EF] flex items-center justify-center mx-auto">
//                   <Users className="w-7 h-7 text-[#741C29]" />
//                 </div>

//                 <h3 className="font-bold text-gray-900 mt-5">
//                   No users found
//                 </h3>

//                 <p className="text-sm text-gray-500 mt-1">
//                   Try changing your search or filters.
//                 </p>

//                 <button
//                   type="button"
//                   onClick={
//                     clearFilters
//                   }
//                   className="mt-5 px-4 py-2.5 rounded-xl bg-[#741C29] text-white text-sm font-semibold hover:bg-[#5C1520]"
//                 >
//                   Clear Filters
//                 </button>
//               </div>
//             ) : (
//               <>
//                 {/* =================================================
//                     DESKTOP TABLE
//                 ================================================= */}

//                 <div className="hidden lg:block overflow-x-auto">
//                   <table className="w-full">
//                     <thead>
//                       <tr className="bg-[#FAF9F8] border-b border-[#E8E2DE]">
//                         <th className="text-left px-5 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">
//                           User
//                         </th>

//                         <th className="text-left px-5 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">
//                           Contact
//                         </th>

//                         <th className="text-left px-5 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">
//                           Role
//                         </th>

//                         <th className="text-left px-5 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">
//                           Team
//                         </th>

//                         <th className="text-left px-5 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">
//                           Status
//                         </th>

//                         <th className="text-left px-5 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">
//                           Last Login
//                         </th>

//                         <th className="text-right px-5 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">
//                           Actions
//                         </th>
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {tableRows.map(
//                         (user) => {
//                           const statusStyle =
//                             getStatusStyle(
//                               user.displayStatus
//                             );

//                           return (
//                             <tr
//                               key={
//                                 user.id
//                               }
//                               className="border-b border-[#F0ECE9] last:border-0 hover:bg-[#FCFAF9] transition-colors"
//                             >
//                               {/* USER */}

//                               <td className="px-5 py-4">
//                                 <div className="flex items-center gap-3">
//                                   <div className="relative w-11 h-11 rounded-xl bg-[#741C29] text-white flex items-center justify-center font-bold overflow-hidden shrink-0 shadow-sm">
//                                     {user.avatar ? (
//                                       <img
//                                         src={
//                                           user.avatar
//                                         }
//                                         alt={
//                                           user.name ||
//                                           "User"
//                                         }
//                                         className="w-full h-full object-cover"
//                                       />
//                                     ) : (
//                                       (
//                                         user.name ||
//                                         "U"
//                                       )
//                                         .charAt(
//                                           0
//                                         )
//                                         .toUpperCase()
//                                     )}
//                                   </div>

//                                   <div className="min-w-0">
//                                     <p className="font-bold text-gray-900 truncate max-w-[180px]">
//                                       {user.name ||
//                                         "-"}
//                                     </p>

//                                     <p className="text-xs text-gray-400 mt-0.5">
//                                       EMP ID #
//                                       {
//                                         user.id
//                                       }
//                                     </p>
//                                   </div>
//                                 </div>
//                               </td>

//                               {/* CONTACT */}

//                               <td className="px-5 py-4">
//                                 <div className="space-y-1.5">
//                                   <div className="flex items-center gap-2 text-sm text-gray-700">
//                                     <Mail className="w-3.5 h-3.5 text-[#741C29]" />

//                                     <span className="truncate max-w-[220px]">
//                                       {user.email ||
//                                         "-"}
//                                     </span>
//                                   </div>

//                                   {user.phone && (
//                                     <div className="flex items-center gap-2 text-xs text-gray-500">
//                                       <Phone className="w-3.5 h-3.5 text-gray-400" />

//                                       {
//                                         user.phone
//                                       }
//                                     </div>
//                                   )}
//                                 </div>
//                               </td>

//                               {/* ROLE */}

//                               <td className="px-5 py-4">
//                                 <span
//                                   className={`inline-flex items-center px-2.5 py-1.5 rounded-lg border text-[11px] font-bold capitalize ${getRoleStyle(
//                                     user.role
//                                   )}`}
//                                 >
//                                   {
//                                     user.role ||
//                                     "-"
//                                   }
//                                 </span>
//                               </td>

//                               {/* TEAM */}

//                               <td className="px-5 py-4">
//                                 <span className="inline-flex items-center gap-2 text-sm text-gray-700">
//                                   <Building2 className="w-3.5 h-3.5 text-gray-400" />

//                                   {
//                                     user.team ||
//                                     "No Team"
//                                   }
//                                 </span>
//                               </td>

//                               {/* STATUS */}

//                               <td className="px-5 py-4">
//                                 <span
//                                   className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${statusStyle.wrapper}`}
//                                 >
//                                   <span
//                                     className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
//                                   />

//                                   {
//                                     user.displayStatus
//                                   }
//                                 </span>
//                               </td>

//                               {/* LAST LOGIN */}

//                               <td className="px-5 py-4">
//                                 <div className="flex items-center gap-2 text-sm text-gray-600">
//                                   <Clock3 className="w-3.5 h-3.5 text-gray-400" />

//                                   {formatDisplayDateTime(
//                                     user.last_login ||
//                                       user.login_time
//                                   )}
//                                 </div>
//                               </td>

//                               {/* ACTIONS */}

//                               <td className="px-5 py-4">
//                                 <div className="flex items-center justify-end gap-2">
//                                   <button
//                                     type="button"
//                                     onClick={() =>
//                                       openBreakModal(
//                                         user
//                                       )
//                                     }
//                                     className="w-9 h-9 rounded-xl border border-[#DED7D3] bg-white hover:bg-[#F7F3F1] hover:border-[#741C29]/30 flex items-center justify-center transition"
//                                     title="Break time"
//                                   >
//                                     <Coffee className="w-4 h-4 text-[#741C29]" />
//                                   </button>

//                                   <Link
//                                     href={`/users/${user.id}/edit`}
//                                     className="w-9 h-9 rounded-xl border border-[#DED7D3] bg-white hover:bg-[#F7F3F1] hover:border-[#741C29]/30 flex items-center justify-center transition"
//                                     title="Edit user"
//                                   >
//                                     <Edit3 className="w-4 h-4 text-gray-700" />
//                                   </Link>

//                                   <button
//                                     type="button"
//                                     onClick={() =>
//                                       handleDeleteUser(
//                                         user.id
//                                       )
//                                     }
//                                     disabled={
//                                       deletingUserId ===
//                                       user.id
//                                     }
//                                     className="w-9 h-9 rounded-xl border border-[#DED7D3] bg-white hover:bg-[#F7F3F1] hover:border-[#741C29]/30 flex items-center justify-center transition disabled:opacity-50"
//                                     title="Delete user"
//                                   >
//                                     {deletingUserId ===
//                                     user.id ? (
//                                       <RefreshCw className="w-4 h-4 text-[#741C29] animate-spin" />
//                                     ) : (
//                                       <Trash2 className="w-4 h-4 text-[#741C29]" />
//                                     )}
//                                   </button>
//                                 </div>
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

//                 <div className="lg:hidden divide-y divide-[#EEE9E6]">
//                   {tableRows.map(
//                     (user) => {
//                       const statusStyle =
//                         getStatusStyle(
//                           user.displayStatus
//                         );

//                       return (
//                         <div
//                           key={
//                             user.id
//                           }
//                           className="p-4 sm:p-5"
//                         >
//                           <div className="flex items-start justify-between gap-3">
//                             <div className="flex items-center gap-3 min-w-0">
//                               <div className="w-11 h-11 rounded-xl bg-[#741C29] text-white flex items-center justify-center font-bold overflow-hidden shrink-0">
//                                 {user.avatar ? (
//                                   <img
//                                     src={
//                                       user.avatar
//                                     }
//                                     alt={
//                                       user.name ||
//                                       "User"
//                                     }
//                                     className="w-full h-full object-cover"
//                                   />
//                                 ) : (
//                                   (
//                                     user.name ||
//                                     "U"
//                                   )
//                                     .charAt(
//                                       0
//                                     )
//                                     .toUpperCase()
//                                 )}
//                               </div>

//                               <div className="min-w-0">
//                                 <p className="font-bold text-gray-900 truncate">
//                                   {user.name ||
//                                     "-"}
//                                 </p>

//                                 <p className="text-xs text-gray-500 truncate mt-0.5">
//                                   {user.email ||
//                                     "-"}
//                                 </p>
//                               </div>
//                             </div>

//                             <span
//                               className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-bold whitespace-nowrap ${statusStyle.wrapper}`}
//                             >
//                               <span
//                                 className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
//                               />

//                               {
//                                 user.displayStatus
//                               }
//                             </span>
//                           </div>

//                           <div className="grid grid-cols-2 gap-2.5 mt-4">
//                             <div className="rounded-xl bg-[#FAF9F8] border border-[#EEE9E6] p-3">
//                               <p className="text-[10px] uppercase tracking-[0.08em] font-bold text-gray-400">
//                                 Role
//                               </p>

//                               <p className="text-sm font-semibold text-gray-800 mt-1 capitalize">
//                                 {user.role ||
//                                   "-"}
//                               </p>
//                             </div>

//                             <div className="rounded-xl bg-[#FAF9F8] border border-[#EEE9E6] p-3">
//                               <p className="text-[10px] uppercase tracking-[0.08em] font-bold text-gray-400">
//                                 Team
//                               </p>

//                               <p className="text-sm font-semibold text-gray-800 mt-1">
//                                 {user.team ||
//                                   "No Team"}
//                               </p>
//                             </div>

//                             <div className="rounded-xl bg-[#FAF9F8] border border-[#EEE9E6] p-3">
//                               <p className="text-[10px] uppercase tracking-[0.08em] font-bold text-gray-400">
//                                 Phone
//                               </p>

//                               <p className="text-sm font-semibold text-gray-800 mt-1 truncate">
//                                 {user.phone ||
//                                   "-"}
//                               </p>
//                             </div>

//                             <div className="rounded-xl bg-[#FAF9F8] border border-[#EEE9E6] p-3">
//                               <p className="text-[10px] uppercase tracking-[0.08em] font-bold text-gray-400">
//                                 Last Login
//                               </p>

//                               <p className="text-xs font-semibold text-gray-800 mt-1">
//                                 {formatDisplayDateTime(
//                                   user.last_login ||
//                                     user.login_time
//                                 )}
//                               </p>
//                             </div>
//                           </div>

//                           <div className="flex items-center justify-end gap-2 mt-4">
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 openBreakModal(
//                                   user
//                                 )
//                               }
//                               className="flex-1 h-10 rounded-xl border border-[#DED7D3] bg-white hover:bg-[#F7F3F1] text-xs font-bold text-gray-700 flex items-center justify-center gap-2"
//                             >
//                               <Coffee className="w-4 h-4 text-[#741C29]" />
//                               Break
//                             </button>

//                             <Link
//                               href={`/users/${user.id}/edit`}
//                               className="flex-1 h-10 rounded-xl border border-[#DED7D3] bg-white hover:bg-[#F7F3F1] text-xs font-bold text-gray-700 flex items-center justify-center gap-2"
//                             >
//                               <Edit3 className="w-4 h-4 text-[#741C29]" />
//                               Edit
//                             </Link>

//                             <button
//                               type="button"
//                               onClick={() =>
//                                 handleDeleteUser(
//                                   user.id
//                                 )
//                               }
//                               disabled={
//                                 deletingUserId ===
//                                 user.id
//                               }
//                               className="w-10 h-10 rounded-xl border border-[#DED7D3] bg-white hover:bg-[#F7F3F1] flex items-center justify-center disabled:opacity-50"
//                             >
//                               {deletingUserId ===
//                               user.id ? (
//                                 <RefreshCw className="w-4 h-4 text-[#741C29] animate-spin" />
//                               ) : (
//                                 <Trash2 className="w-4 h-4 text-[#741C29]" />
//                               )}
//                             </button>
//                           </div>
//                         </div>
//                       );
//                     }
//                   )}
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </main>

//       {/* =========================================================
//           USER BREAK MODAL
//       ========================================================= */}

//       {breakModalOpen &&
//         selectedUser && (
//           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//             <div
//               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
//               onClick={() =>
//                 !savingBreak &&
//                 setBreakModalOpen(
//                   false
//                 )
//               }
//             />

//             <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E5DEDA]">
//               <div className="h-1.5 bg-[#741C29]" />

//               <div className="px-5 py-5 border-b border-[#ECE7E4] flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-xl bg-[#741C29]/10 flex items-center justify-center">
//                     <Coffee className="w-5 h-5 text-[#741C29]" />
//                   </div>

//                   <div>
//                     <h3 className="font-bold text-gray-900">
//                       Break Schedule
//                     </h3>

//                     <p className="text-xs text-gray-500 mt-0.5">
//                       {
//                         selectedUser.name
//                       }
//                     </p>
//                   </div>
//                 </div>

//                 <button
//                   type="button"
//                   disabled={
//                     savingBreak
//                   }
//                   onClick={() =>
//                     setBreakModalOpen(
//                       false
//                     )
//                   }
//                   className="w-9 h-9 rounded-xl hover:bg-[#F7F5F3] flex items-center justify-center"
//                 >
//                   <X className="w-5 h-5 text-gray-500" />
//                 </button>
//               </div>

//               <div className="p-5 space-y-4">
//                 <div>
//                   <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
//                     Break Start
//                   </label>

//                   <input
//                     type="datetime-local"
//                     value={
//                       breakStart
//                     }
//                     onChange={(e) =>
//                       setBreakStart(
//                         e.target
//                           .value
//                       )
//                     }
//                     className="w-full h-11 rounded-xl border border-[#DDD6D2] bg-[#FCFBFA] px-3 text-sm outline-none focus:bg-white focus:border-[#741C29] focus:ring-4 focus:ring-[#741C29]/8"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
//                     Break End
//                   </label>

//                   <input
//                     type="datetime-local"
//                     value={
//                       breakEnd
//                     }
//                     onChange={(e) =>
//                       setBreakEnd(
//                         e.target
//                           .value
//                       )
//                     }
//                     className="w-full h-11 rounded-xl border border-[#DDD6D2] bg-[#FCFBFA] px-3 text-sm outline-none focus:bg-white focus:border-[#741C29] focus:ring-4 focus:ring-[#741C29]/8"
//                   />
//                 </div>
//               </div>

//               <div className="px-5 py-4 bg-[#FAF9F8] border-t border-[#ECE7E4] flex items-center justify-end gap-3">
//                 <button
//                   type="button"
//                   disabled={
//                     savingBreak
//                   }
//                   onClick={() =>
//                     setBreakModalOpen(
//                       false
//                     )
//                   }
//                   className="px-4 py-2.5 rounded-xl border border-[#DCD5D1] bg-white text-sm font-semibold text-gray-700 hover:bg-[#F7F5F3]"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="button"
//                   disabled={
//                     savingBreak
//                   }
//                   onClick={
//                     handleSaveBreakTime
//                   }
//                   className="px-5 py-2.5 rounded-xl bg-[#741C29] hover:bg-[#5C1520] text-white text-sm font-semibold disabled:opacity-50 shadow-lg shadow-[#741C29]/15"
//                 >
//                   {savingBreak
//                     ? "Saving..."
//                     : "Save Break"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//       {/* =========================================================
//           ADMIN BREAK MODAL
//       ========================================================= */}

//       {adminBreakModalOpen && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//           <div
//             className="absolute inset-0 bg-black/60 backdrop-blur-sm"
//             onClick={() =>
//               !savingBreak &&
//               setAdminBreakModalOpen(
//                 false
//               )
//             }
//           />

//           <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E5DEDA]">
//             <div className="h-1.5 bg-[#741C29]" />

//             <div className="px-5 py-5 border-b border-[#ECE7E4] flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-xl bg-[#741C29]/10 flex items-center justify-center">
//                   <Users className="w-5 h-5 text-[#741C29]" />
//                 </div>

//                 <div>
//                   <h3 className="font-bold text-gray-900">
//                     All Users Break
//                   </h3>

//                   <p className="text-xs text-gray-500 mt-0.5">
//                     Apply schedule to everyone
//                   </p>
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 disabled={
//                   savingBreak
//                 }
//                 onClick={() =>
//                   setAdminBreakModalOpen(
//                     false
//                   )
//                 }
//                 className="w-9 h-9 rounded-xl hover:bg-[#F7F5F3] flex items-center justify-center"
//               >
//                 <X className="w-5 h-5 text-gray-500" />
//               </button>
//             </div>

//             <div className="p-5 space-y-4">
//               <div>
//                 <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
//                   Break Start
//                 </label>

//                 <input
//                   type="datetime-local"
//                   value={
//                     adminBreakStart
//                   }
//                   onChange={(e) =>
//                     setAdminBreakStart(
//                       e.target
//                         .value
//                     )
//                   }
//                   className="w-full h-11 rounded-xl border border-[#DDD6D2] bg-[#FCFBFA] px-3 text-sm outline-none focus:bg-white focus:border-[#741C29] focus:ring-4 focus:ring-[#741C29]/8"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
//                   Break End
//                 </label>

//                 <input
//                   type="datetime-local"
//                   value={
//                     adminBreakEnd
//                   }
//                   onChange={(e) =>
//                     setAdminBreakEnd(
//                       e.target
//                         .value
//                     )
//                   }
//                   className="w-full h-11 rounded-xl border border-[#DDD6D2] bg-[#FCFBFA] px-3 text-sm outline-none focus:bg-white focus:border-[#741C29] focus:ring-4 focus:ring-[#741C29]/8"
//                 />
//               </div>
//             </div>

//             <div className="px-5 py-4 bg-[#FAF9F8] border-t border-[#ECE7E4] flex items-center justify-end gap-3">
//               <button
//                 type="button"
//                 disabled={
//                   savingBreak
//                 }
//                 onClick={() =>
//                   setAdminBreakModalOpen(
//                     false
//                   )
//                 }
//                 className="px-4 py-2.5 rounded-xl border border-[#DCD5D1] bg-white text-sm font-semibold text-gray-700 hover:bg-[#F7F5F3]"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 disabled={
//                   savingBreak
//                 }
//                 onClick={
//                   handleSaveAdminBreakTime
//                 }
//                 className="px-5 py-2.5 rounded-xl bg-[#741C29] hover:bg-[#5C1520] text-white text-sm font-semibold disabled:opacity-50 shadow-lg shadow-[#741C29]/15"
//               >
//                 {savingBreak
//                   ? "Saving..."
//                   : "Apply To All"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* =========================================================
//           LOGOUT MODAL
//       ========================================================= */}

//       {logoutModalOpen && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//           <div
//             className="absolute inset-0 bg-black/60 backdrop-blur-sm"
//             onClick={() =>
//               setLogoutModalOpen(
//                 false
//               )
//             }
//           />

//           <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 border border-[#E5DEDA]">
//             <div className="w-12 h-12 rounded-xl bg-[#741C29]/10 flex items-center justify-center">
//               <LogOut className="w-5 h-5 text-[#741C29]" />
//             </div>

//             <h3 className="text-lg font-bold text-gray-900 mt-5">
//               Logout
//             </h3>

//             <p className="text-sm text-gray-500 mt-2 leading-6">
//               Are you sure you want to logout from your CRM account?
//             </p>

//             <div className="flex items-center justify-end gap-3 mt-6">
//               <button
//                 type="button"
//                 onClick={() =>
//                   setLogoutModalOpen(
//                     false
//                   )
//                 }
//                 className="px-4 py-2.5 rounded-xl border border-[#DCD5D1] bg-white text-sm font-semibold text-gray-700 hover:bg-[#F7F5F3]"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 onClick={() => {
//                   localStorage.removeItem(
//                     "crm_login_time"
//                   );

//                   router.push(
//                     "/login"
//                   );
//                 }}
//                 className="px-5 py-2.5 rounded-xl bg-[#741C29] hover:bg-[#5C1520] text-white text-sm font-semibold shadow-lg shadow-[#741C29]/15"
//               >
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
























"use client";

import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Clock3,
  Search,
  Filter,
  CalendarDays,
  Phone,
  Mail,
  Edit3,
  Trash2,
  Menu,
  X,
  Coffee,
  LogOut,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  UserRound,
  Building2,
  Activity,
} from "lucide-react";

import {
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";

import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

export default function UsersPage() {
  const router = useRouter();

  // =========================================================
  // THEME
  // =========================================================

  const RED = "#ec3737";
  const RED_DARK = "#d92f2f";

  // =========================================================
  // STATES
  // =========================================================

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [usersList, setUsersList] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [teamFilter, setTeamFilter] = useState("All Teams");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const [breakModalOpen, setBreakModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const [breakStart, setBreakStart] = useState("");
  const [breakEnd, setBreakEnd] = useState("");

  const [adminBreakModalOpen, setAdminBreakModalOpen] =
    useState(false);

  const [adminBreakStart, setAdminBreakStart] = useState("");
  const [adminBreakEnd, setAdminBreakEnd] = useState("");

  const [savingBreak, setSavingBreak] = useState(false);

  const [deletingUserId, setDeletingUserId] = useState(null);

  // =========================================================
  // DATE HELPERS
  // =========================================================

  const formatDisplayDateTime = (value) => {
    if (!value) return "Never";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Never";
    }

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const toDateTimeLocalValue = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    const hours = String(
      date.getHours()
    ).padStart(2, "0");

    const minutes = String(
      date.getMinutes()
    ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const normalizeDateTimeForDb = (value) => {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    const hours = String(
      date.getHours()
    ).padStart(2, "0");

    const minutes = String(
      date.getMinutes()
    ).padStart(2, "0");

    const seconds = String(
      date.getSeconds()
    ).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // =========================================================
  // LOGIN STATUS HELPERS
  // =========================================================

  const isUserLoggedIn = useCallback((user) => {
    if (!user) return false;

    const loginTime = user?.login_time
      ? new Date(user.login_time)
      : null;

    const logoutTime = user?.logout_time
      ? new Date(user.logout_time)
      : null;

    const hasValidLogin =
      loginTime &&
      !Number.isNaN(loginTime.getTime());

    const hasValidLogout =
      logoutTime &&
      !Number.isNaN(logoutTime.getTime());

    // No valid login time = not logged in
    if (!hasValidLogin) {
      return false;
    }

    // Login exists but logout does not = currently logged in
    if (!hasValidLogout) {
      return true;
    }

    // Latest event decides the state
    return loginTime.getTime() > logoutTime.getTime();
  }, []);

  // =========================================================
  // STATUS HELPER
  // =========================================================

  const getUserStatus = useCallback(
    (user) => {
      if (!user) {
        return "Inactive";
      }

      // IMPORTANT:
      // Database status alone is NOT used to decide
      // whether the user is currently online.
      //
      // login_time + logout_time decide login state.

      const loggedIn = isUserLoggedIn(user);

      if (!loggedIn) {
        return "Inactive";
      }

      // If user is actually logged in,
      // then show availability status.
      const availability =
        user?.availability_status ||
        user?.status ||
        "Active";

      return availability
        .toString()
        .trim() || "Active";
    },
    [isUserLoggedIn]
  );

  // =========================================================
  // FETCH USERS
  // =========================================================

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const usersResponse = await fetch(
        "/api/new-users",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!usersResponse.ok) {
        throw new Error(
          "Failed to fetch users"
        );
      }

      const usersData =
        await usersResponse.json();

      let users = [];

      if (Array.isArray(usersData)) {
        users = usersData;
      } else if (
        Array.isArray(usersData?.users)
      ) {
        users = usersData.users;
      } else if (
        Array.isArray(usersData?.data)
      ) {
        users = usersData.data;
      }

      setUsersList(users);

      // -------------------------------------------------------
      // LOGIN HISTORY
      // -------------------------------------------------------

      try {
        const historyResponse =
          await fetch(
            "/api/login-history",
            {
              method: "GET",
              credentials: "include",
              cache: "no-store",
            }
          );

        if (historyResponse.ok) {
          const historyData =
            await historyResponse.json();

          if (Array.isArray(historyData)) {
            setLoginHistory(
              historyData
            );
          } else if (
            Array.isArray(
              historyData?.history
            )
          ) {
            setLoginHistory(
              historyData.history
            );
          } else if (
            Array.isArray(
              historyData?.data
            )
          ) {
            setLoginHistory(
              historyData.data
            );
          } else {
            setLoginHistory([]);
          }
        } else {
          setLoginHistory([]);
        }
      } catch (historyError) {
        console.error(
          "Login history error:",
          historyError
        );

        setLoginHistory([]);
      }
    } catch (err) {
      console.error(
        "Users fetch error:",
        err
      );

      setError(
        err.message ||
          "Failed to load users"
      );

      setUsersList([]);
    } finally {
      setLoading(false);
    }
  }, []);


  const [syncing, setSyncing] = useState(false);

const handleSync = async () => {
  try {
    setSyncing(true);
    await fetchUsers();
  } finally {
    setSyncing(false);
  }
};
  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // =========================================================
  // AUTO REFRESH
  // =========================================================
  //
  // This makes login/logout status update automatically.
  // Every 10 seconds users are fetched again.
  //

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     fetchUsers();
  //   }, 10000);

  //   return () => clearInterval(interval);
  // }, [fetchUsers]);

  // =========================================================
  // TEAMS
  // =========================================================

  const teams = useMemo(() => {
    const uniqueTeams = new Set();

    usersList.forEach((user) => {
      if (user?.team) {
        uniqueTeams.add(user.team);
      }
    });

    return Array.from(uniqueTeams).sort();
  }, [usersList]);

  // =========================================================
  // FILTERED USERS
  // =========================================================

  const filteredUsers = useMemo(() => {
    const search =
      searchTerm
        .trim()
        .toLowerCase();

    const selectedRole =
      roleFilter
        .trim()
        .toLowerCase();

    const selectedStatus =
      statusFilter
        .trim()
        .toLowerCase();

    const selectedTeam =
      teamFilter
        .trim()
        .toLowerCase();

    return usersList.filter(
      (usr) => {
        // ---------------------------------------------------
        // SEARCH
        // ---------------------------------------------------

        let matchesSearch = true;

        if (search) {
          const name =
            (usr.name || "")
              .toLowerCase();

          const email =
            (usr.email || "")
              .toLowerCase();

          const phone =
            (usr.phone || "")
              .toLowerCase();

          matchesSearch =
            name.includes(search) ||
            email.includes(search) ||
            phone.includes(search);
        }

        // ---------------------------------------------------
        // ROLE
        // ---------------------------------------------------

        let matchesRole = true;

        if (
          roleFilter !== "All Roles"
        ) {
          matchesRole =
            (
              usr.role || ""
            )
              .trim()
              .toLowerCase() ===
            selectedRole;
        }

        // ---------------------------------------------------
        // STATUS
        // ---------------------------------------------------

        const userStatus =
          getUserStatus(usr)
            .trim()
            .toLowerCase();

        let matchesStatus = true;

        if (
          statusFilter !==
          "All Status"
        ) {
          matchesStatus =
            userStatus ===
            selectedStatus;
        }

        // ---------------------------------------------------
        // TEAM
        // ---------------------------------------------------

        let matchesTeam = true;

        if (
          teamFilter !== "All Teams"
        ) {
          matchesTeam =
            (
              usr.team || ""
            )
              .trim()
              .toLowerCase() ===
            selectedTeam;
        }

        // ---------------------------------------------------
        // DATE
        // ---------------------------------------------------

        let matchesDate = true;

        const userDate =
          usr.created_at ||
          usr.last_login ||
          usr.login_time;

        if (startDate || endDate) {
          if (!userDate) {
            matchesDate = false;
          } else {
            const date =
              new Date(userDate);

            if (
              Number.isNaN(
                date.getTime()
              )
            ) {
              matchesDate = false;
            } else {
              if (startDate) {
                const start =
                  new Date(
                    `${startDate}T00:00:00`
                  );

                if (date < start) {
                  matchesDate = false;
                }
              }

              if (endDate) {
                const end =
                  new Date(
                    `${endDate}T23:59:59`
                  );

                if (date > end) {
                  matchesDate = false;
                }
              }
            }
          }
        }

        return (
          matchesSearch &&
          matchesRole &&
          matchesStatus &&
          matchesTeam &&
          matchesDate
        );
      }
    );
  }, [
    usersList,
    searchTerm,
    roleFilter,
    statusFilter,
    teamFilter,
    startDate,
    endDate,
    getUserStatus,
  ]);

  // =========================================================
  // STATS
  // =========================================================

  const stats = useMemo(() => {
    const total =
      usersList.length;

    // ACTUAL LOGGED-IN USERS
    const active =
      usersList.filter(
        (user) =>
          isUserLoggedIn(user)
      ).length;

    // EVERYONE WHO IS NOT LOGGED IN
    const inactive =
      usersList.length -
      active;

    const admins =
      usersList.filter(
        (user) =>
          (
            user?.role || ""
          )
            .trim()
            .toLowerCase() ===
          "admin"
      ).length;

    return [
      {
        key: "total",
        label: "Total Users",
        value: total,
        icon: Users,
        small: "All registered users",
      },
      {
        key: "active",
        label: "Active Users",
        value: active,
        icon: UserCheck,
        small: "Currently logged in",
      },
      {
        key: "inactive",
        label: "Inactive Users",
        value: inactive,
        icon: UserX,
        small: "Currently logged out",
      },
      {
        key: "logged",
        label: "Logged In Now",
        value: active,
        icon: Clock3,
        small: "Currently online",
      },
      {
        key: "admins",
        label: "Total Admins",
        value: admins,
        icon: ShieldCheck,
        small: "Administrator accounts",
      },
    ];
  }, [
    usersList,
    isUserLoggedIn,
  ]);

  // =========================================================
  // TABLE ROWS
  // =========================================================

  const tableRows = useMemo(() => {
    return filteredUsers.map(
      (user) => ({
        ...user,
        displayStatus:
          getUserStatus(user),
      })
    );
  }, [
    filteredUsers,
    getUserStatus,
  ]);

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusStyle = (status) => {
    const normalized =
      (status || "")
        .trim()
        .toLowerCase();

    // -------------------------------------------------------
    // ACTIVE
    // -------------------------------------------------------

    if (
      normalized === "active"
    ) {
      return {
        wrapper:
          "bg-emerald-50 border-emerald-200 text-emerald-700",
        dot:
          "bg-emerald-500",
      };
    }

    // -------------------------------------------------------
    // INACTIVE
    // -------------------------------------------------------

    if (
      normalized === "inactive"
    ) {
      return {
        wrapper:
          "bg-[#ec3737]/10 border-[#ec3737]/25 text-[#ec3737]",
        dot:
          "bg-[#ec3737]",
      };
    }

    // -------------------------------------------------------
    // OTHER AVAILABILITY STATUS
    // -------------------------------------------------------

    return {
      wrapper:
        "bg-[#F4F1EF] border-[#D9D0CC] text-[#741C29]",
      dot:
        "bg-[#741C29]",
    };
  };

  // =========================================================
  // ROLE STYLE
  // =========================================================

  const getRoleStyle = (role) => {
    const normalized =
      (role || "")
        .trim()
        .toLowerCase();

    if (
      normalized === "admin"
    ) {
      return "bg-[#ec3737] text-white border-[#ec3737]";
    }

    if (
      normalized === "manager"
    ) {
      return "bg-[#F4F1EF] text-[#741C29] border-[#DCCFD0]";
    }

    return "bg-white text-gray-700 border-gray-200";
  };

  // =========================================================
  // OPEN BREAK MODAL
  // =========================================================

  const openBreakModal = (
    user
  ) => {
    setSelectedUser(user);

    setBreakStart(
      toDateTimeLocalValue(
        user?.break_start
      )
    );

    setBreakEnd(
      toDateTimeLocalValue(
        user?.break_end
      )
    );

    setBreakModalOpen(true);
  };

  // =========================================================
  // SAVE BREAK
  // =========================================================

  const handleSaveBreakTime =
    async () => {
      if (!selectedUser) return;

      try {
        setSavingBreak(true);

        const response =
          await fetch(
            "/api/new-users",
            {
              method: "PATCH",
              headers: {
                "Content-Type":
                  "application/json",
              },
              credentials:
                "include",
              body: JSON.stringify({
                userId:
                  selectedUser.id,
                applyAll: false,
                break_start:
                  normalizeDateTimeForDb(
                    breakStart
                  ),
                break_end:
                  normalizeDateTimeForDb(
                    breakEnd
                  ),
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Failed to save break time"
          );
        }

        setBreakModalOpen(
          false
        );

        setSelectedUser(
          null
        );

        setBreakStart("");
        setBreakEnd("");

        await fetchUsers();
      } catch (err) {
        console.error(
          "Save break error:",
          err
        );

        alert(
          err.message ||
            "Failed to save break time"
        );
      } finally {
        setSavingBreak(false);
      }
    };

  // =========================================================
  // SAVE ADMIN BREAK
  // =========================================================

  const handleSaveAdminBreakTime =
    async () => {
      try {
        setSavingBreak(true);

        const response =
          await fetch(
            "/api/new-users",
            {
              method: "PATCH",
              headers: {
                "Content-Type":
                  "application/json",
              },
              credentials:
                "include",
              body: JSON.stringify({
                applyAll: true,
                break_start:
                  normalizeDateTimeForDb(
                    adminBreakStart
                  ),
                break_end:
                  normalizeDateTimeForDb(
                    adminBreakEnd
                  ),
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Failed to save break time"
          );
        }

        setAdminBreakModalOpen(
          false
        );

        setAdminBreakStart("");
        setAdminBreakEnd("");

        await fetchUsers();
      } catch (err) {
        console.error(
          "Admin break error:",
          err
        );

        alert(
          err.message ||
            "Failed to save break time"
        );
      } finally {
        setSavingBreak(false);
      }
    };

  // =========================================================
  // DELETE USER
  // =========================================================

  const handleDeleteUser =
    async (userId) => {
      if (!userId) return;

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this user?"
        );

      if (!confirmed) return;

      try {
        setDeletingUserId(
          userId
        );

        const response =
          await fetch(
            "/api/new-users",
            {
              method: "DELETE",
              headers: {
                "Content-Type":
                  "application/json",
              },
              credentials:
                "include",
              body: JSON.stringify({
                userId,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Failed to delete user"
          );
        }

        setUsersList(
          (prev) =>
            prev.filter(
              (user) =>
                String(user.id) !==
                String(userId)
            )
        );
      } catch (err) {
        console.error(
          "Delete user error:",
          err
        );

        alert(
          err.message ||
            "Failed to delete user"
        );
      } finally {
        setDeletingUserId(
          null
        );
      }
    };

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter(
      "All Roles"
    );
    setStatusFilter(
      "All Status"
    );
    setTeamFilter(
      "All Teams"
    );
    setStartDate("");
    setEndDate("");
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F3]">
        <Sidebar
          sidebarOpen={
            sidebarOpen
          }
          setSidebarOpen={
            setSidebarOpen
          }
        />

        <main className="lg:ml-[260px] min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-lg"
              style={{
                backgroundColor: RED,
                boxShadow:
                  `0 10px 25px ${RED}33`,
              }}
            >
              <RefreshCw className="w-6 h-6 text-white animate-spin" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-gray-900">
              Loading Users
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Please wait...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="min-h-screen bg-[#F7F5F3] text-gray-900">
      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      <Sidebar
        sidebarOpen={
          sidebarOpen
        }
        setSidebarOpen={
          setSidebarOpen
        }
      />

      <main className="lg:ml-[260px] min-h-screen">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-[#E6E0DC]">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setSidebarOpen(
                      true
                    )
                  }
                  className="lg:hidden w-10 h-10 rounded-xl border border-[#E5DEDA] bg-white flex items-center justify-center hover:bg-[#F7F5F3]"
                >
                  <Menu className="w-5 h-5 text-gray-800" />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <div
                      className="hidden sm:block w-1 h-6 rounded-full"
                      style={{
                        backgroundColor:
                          RED,
                      }}
                    />

                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
                      EMP ID
                    </h1>
                  </div>

                  <p className="text-sm text-gray-500 mt-1">
                    Manage users, roles and availability
                  </p>
                </div>
              </div>
<button
  type="button"
  onClick={handleSync}
  disabled={syncing}
  className="inline-flex items-center gap-2 rounded-xl bg-[#ec3737] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#d92f2f] disabled:cursor-not-allowed disabled:opacity-60"
>
  <RefreshCw
    size={16}
    className={syncing ? "animate-spin" : ""}
  />
  {syncing ? "Syncing..." : "Sync"}
</button>
              <div className="flex items-center gap-2">
                {/* REFRESH */}

                <button
                  type="button"
                  onClick={
                    fetchUsers
                  }
                  className="h-10 sm:h-11 px-3 sm:px-4 rounded-xl border border-[#DED7D3] bg-white hover:bg-[#F7F5F3] text-sm font-semibold flex items-center gap-2 transition"
                  style={{
                    color: RED,
                  }}
                >
                  <RefreshCw className="w-4 h-4" />

                  <span className="hidden sm:inline">
                    Refresh
                  </span>
                </button>

                {/* ADD USER */}

                <Link
                  href="/add-new-users"
                  className="h-10 sm:h-11 px-3 sm:px-5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 shadow-lg transition"
                  style={{
                    backgroundColor:
                      RED,
                    boxShadow:
                      `0 10px 25px ${RED}26`,
                  }}
                >
                  <Users className="w-4 h-4" />

                  <span>
                    <span className="hidden sm:inline">
                      Add User
                    </span>

                    <span className="sm:hidden">
                      Add
                    </span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 max-w-[1800px] mx-auto">
          {/* =====================================================
              ERROR
          ===================================================== */}

          {error && (
            <div className="mb-6 bg-white border border-[#D9BFC3] rounded-2xl p-4 flex items-start gap-3 shadow-sm">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor:
                    `${RED}18`,
                }}
              >
                <AlertCircle
                  className="w-5 h-5"
                  style={{
                    color: RED,
                  }}
                />
              </div>

              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  Failed to load users
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  fetchUsers
                }
                className="text-sm font-semibold hover:opacity-80"
                style={{
                  color: RED,
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* =====================================================
              STATS
          ===================================================== */}

          <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 sm:gap-4 mb-7">
            {stats.map(
              (stat, index) => {
                const Icon =
                  stat.icon;

                const isMain =
                  index === 0;

                return (
                  <div
                    key={
                      stat.key
                    }
                    className={`group relative overflow-hidden rounded-2xl border bg-white p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 ${
                      isMain
                        ? "border-[#ec3737]/20 shadow-[0_10px_35px_rgba(236,55,55,0.08)]"
                        : "border-[#E4DEDA] shadow-sm hover:shadow-md"
                    }`}
                  >
                    {isMain && (
                      <div
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{
                          backgroundColor:
                            RED,
                        }}
                      />
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.08em] text-gray-500">
                          {stat.label}
                        </p>

                        <p className="text-2xl sm:text-3xl font-bold text-[#111111] mt-2">
                          {
                            stat.value
                          }
                        </p>

                        <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
                          {
                            stat.small
                          }
                        </p>
                      </div>

                      <div
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          isMain
                            ? "text-white"
                            : "bg-[#FFF1F1]"
                        }`}
                        style={
                          isMain
                            ? {
                                backgroundColor:
                                  RED,
                              }
                            : {
                                color:
                                  RED,
                              }
                        }
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          {/* =====================================================
              FILTER PANEL
          ===================================================== */}

          <div className="bg-white border border-[#E4DEDA] rounded-2xl shadow-sm overflow-hidden mb-7">
            <div className="px-4 sm:px-5 py-4 border-b border-[#ECE7E4] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor:
                      `${RED}12`,
                  }}
                >
                  <Filter
                    className="w-4 h-4"
                    style={{
                      color: RED,
                    }}
                  />
                </div>

                <div>
                  <h2 className="font-bold text-gray-900">
                    Filters
                  </h2>

                  <p className="text-xs text-gray-400">
                    Find users quickly
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="text-xs sm:text-sm font-semibold hover:opacity-80"
                style={{
                  color: RED,
                }}
              >
                Clear Filters
              </button>
            </div>

            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                {/* SEARCH */}

                <div className="lg:col-span-2 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                  <input
                    type="text"
                    value={
                      searchTerm
                    }
                    onChange={(e) =>
                      setSearchTerm(
                        e.target
                          .value
                      )
                    }
                    placeholder="Search name, email or phone..."
                    className="w-full h-11 rounded-xl border border-[#DDD6D2] bg-[#FCFBFA] pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:bg-white focus:border-[#ec3737] focus:ring-4 focus:ring-[#ec3737]/8"
                  />
                </div>

                {/* ROLE */}

                <div className="relative">
                  <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                  <select
                    value={
                      roleFilter
                    }
                    onChange={(e) =>
                      setRoleFilter(
                        e.target
                          .value
                      )
                    }
                    className="appearance-none w-full h-11 rounded-xl border border-[#DDD6D2] bg-[#FCFBFA] pl-10 pr-9 text-sm text-gray-700 outline-none focus:bg-white focus:border-[#ec3737] focus:ring-4 focus:ring-[#ec3737]/8"
                  >
                   <option>All Roles</option>
  <option>Admin</option>
  <option>Manager</option>
  <option>Agent</option>
  <option>Staff</option>
  <option>HR</option>
  <option>Supervisor</option>
  <option>Management</option>
  <option>Team Lead</option>
                  </select>

                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* STATUS */}

                <div className="relative">
                  <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                  <select
                    value={
                      statusFilter
                    }
                    onChange={(e) =>
                      setStatusFilter(
                        e.target
                          .value
                      )
                    }
                    className="appearance-none w-full h-11 rounded-xl border border-[#DDD6D2] bg-[#FCFBFA] pl-10 pr-9 text-sm text-gray-700 outline-none focus:bg-white focus:border-[#ec3737] focus:ring-4 focus:ring-[#ec3737]/8"
                  >
                    <option>
                      All Status
                    </option>
                    <option>
                      Active
                    </option>
                    <option>
                      Inactive
                    </option>
                  </select>

                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* TEAM */}

                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

               <select
  value={teamFilter}
  onChange={(e) => setTeamFilter(e.target.value)}
  className="appearance-none w-full h-11 rounded-xl border border-[#DDD6D2] bg-[#FCFBFA] pl-10 pr-9 text-sm text-gray-700 outline-none focus:bg-white focus:border-[#ec3737] focus:ring-4 focus:ring-[#ec3737]/8"
>
  <option value="All Teams">All Teams</option>

  {[
    "Design",
    "Sales",
    "Developer",
    "SMM",
    "HR",
    "Supervisor",
    "Management",
    "Team Lead",
  ].map((team) => (
    <option key={team} value={team}>
      {team}
    </option>
  ))}
</select>

                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* DATES */}

                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                    <input
                      type="date"
                      value={
                        startDate
                      }
                      onChange={(e) =>
                        setStartDate(
                          e.target
                            .value
                        )
                      }
                      className="w-full h-11 rounded-xl border border-[#DDD6D2] bg-[#FCFBFA] pl-9 pr-1 text-xs text-gray-700 outline-none focus:bg-white focus:border-[#ec3737]"
                    />
                  </div>

                  <div>
                    <input
                      type="date"
                      value={
                        endDate
                      }
                      onChange={(e) =>
                        setEndDate(
                          e.target
                            .value
                        )
                      }
                      className="w-full h-11 rounded-xl border border-[#DDD6D2] bg-[#FCFBFA] px-2 text-xs text-gray-700 outline-none focus:bg-white focus:border-[#ec3737]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              TABLE HEADER
          ===================================================== */}

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-[0.12em]"
                style={{
                  color: RED,
                }}
              >
                User Directory
              </p>

              <h2 className="text-xl font-bold text-[#111111] mt-1">
                All Users
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Showing{" "}
                <span className="font-semibold text-gray-800">
                  {
                    filteredUsers.length
                  }
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-800">
                  {
                    usersList.length
                  }
                </span>{" "}
                EMP ID
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor:
                    RED,
                }}
              />

              Live availability
            </div>
          </div>

          {/* =====================================================
              USERS TABLE
          ===================================================== */}

          <div className="bg-white border border-[#E4DEDA] rounded-2xl shadow-sm overflow-hidden">
            {tableRows.length ===
            0 ? (
              <div className="py-20 px-6 text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                  style={{
                    backgroundColor:
                      `${RED}12`,
                  }}
                >
                  <Users
                    className="w-7 h-7"
                    style={{
                      color: RED,
                    }}
                  />
                </div>

                <h3 className="font-bold text-gray-900 mt-5">
                  No users found
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Try changing your search or filters.
                </p>

                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="mt-5 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
                  style={{
                    backgroundColor:
                      RED,
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* =================================================
                    DESKTOP TABLE
                ================================================= */}

                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#FAF9F8] border-b border-[#E8E2DE]">
                        <th className="text-left px-5 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">
                          User
                        </th>

                        <th className="text-left px-5 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">
                          Contact
                        </th>

                        <th className="text-left px-5 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">
                          Role
                        </th>

                        <th className="text-left px-5 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">
                          Team
                        </th>

                        <th className="text-left px-5 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">
                          Status
                        </th>

                        <th className="text-left px-5 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">
                          Last Login
                        </th>

                        <th className="text-right px-5 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {tableRows.map(
                        (user) => {
                          const statusStyle =
                            getStatusStyle(
                              user.displayStatus
                            );

                          return (
                            <tr
                              key={
                                user.id
                              }
                              className="border-b border-[#F0ECE9] last:border-0 hover:bg-[#FCFAF9] transition-colors"
                            >
                              {/* USER */}

                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="relative w-11 h-11 rounded-xl text-white flex items-center justify-center font-bold overflow-hidden shrink-0 shadow-sm"
                                    style={{
                                      backgroundColor:
                                        RED,
                                    }}
                                  >
                                    {user.avatar ? (
                                      <img
                                        src={
                                          user.avatar
                                        }
                                        alt={
                                          user.name ||
                                          "User"
                                        }
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      (
                                        user.name ||
                                        "U"
                                      )
                                        .charAt(
                                          0
                                        )
                                        .toUpperCase()
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="font-bold text-gray-900 truncate max-w-[180px]">
                                      {user.name ||
                                        "-"}
                                    </p>

                                    <p className="text-xs text-gray-400 mt-0.5">
                                      EMP ID #
                                      {
                                        user.id
                                      }
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* CONTACT */}

                              <td className="px-5 py-4">
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <Mail
                                      className="w-3.5 h-3.5"
                                      style={{
                                        color: RED,
                                      }}
                                    />

                                    <span className="truncate max-w-[220px]">
                                      {user.email ||
                                        "-"}
                                    </span>
                                  </div>

                                  {user.phone && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <Phone className="w-3.5 h-3.5 text-gray-400" />

                                      {
                                        user.phone
                                      }
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* ROLE */}

                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1.5 rounded-lg border text-[11px] font-bold capitalize ${getRoleStyle(
                                    user.role
                                  )}`}
                                >
                                  {
                                    user.role ||
                                    "-"
                                  }
                                </span>
                              </td>

                              {/* TEAM */}

                              <td className="px-5 py-4">
                                <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                                  <Building2 className="w-3.5 h-3.5 text-gray-400" />

                                  {
                                    user.team ||
                                    "No Team"
                                  }
                                </span>
                              </td>

                              {/* STATUS */}

                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${statusStyle.wrapper}`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
                                  />

                                  {
                                    user.displayStatus
                                  }
                                </span>
                              </td>

                              {/* LAST LOGIN */}

                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Clock3 className="w-3.5 h-3.5 text-gray-400" />

                                  {formatDisplayDateTime(
                                    user.last_login ||
                                      user.login_time
                                  )}
                                </div>
                              </td>

                              {/* ACTIONS */}

                              <td className="px-5 py-4">
                                <div className="flex items-center justify-end gap-2">
                                  {/* BREAK */}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openBreakModal(
                                        user
                                      )
                                    }
                                    className="w-9 h-9 rounded-xl border border-[#DED7D3] bg-white hover:bg-[#FFF5F5] hover:border-[#ec3737]/30 flex items-center justify-center transition"
                                    title="Break time"
                                  >
                                    <Coffee
                                      className="w-4 h-4"
                                      style={{
                                        color: RED,
                                      }}
                                    />
                                  </button>

                                  {/* EDIT */}

                                  <Link
                                    href={`/users/${user.id}/edit`}
                                    className="w-9 h-9 rounded-xl border border-[#DED7D3] bg-white hover:bg-[#FFF5F5] hover:border-[#ec3737]/30 flex items-center justify-center transition"
                                    title="Edit user"
                                  >
                                    <Edit3
                                      className="w-4 h-4"
                                      style={{
                                        color: RED,
                                      }}
                                    />
                                  </Link>

                                  {/* DELETE */}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteUser(
                                        user.id
                                      )
                                    }
                                    disabled={
                                      deletingUserId ===
                                      user.id
                                    }
                                    className="w-9 h-9 rounded-xl border border-[#DED7D3] bg-white hover:bg-[#FFF5F5] hover:border-[#ec3737]/30 flex items-center justify-center transition disabled:opacity-50"
                                    title="Delete user"
                                  >
                                    {deletingUserId ===
                                    user.id ? (
                                      <RefreshCw
                                        className="w-4 h-4 animate-spin"
                                        style={{
                                          color: RED,
                                        }}
                                      />
                                    ) : (
                                      <Trash2
                                        className="w-4 h-4"
                                        style={{
                                          color: RED,
                                        }}
                                      />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>

                {/* =================================================
                    MOBILE CARDS
                ================================================= */}

                <div className="lg:hidden divide-y divide-[#EEE9E6]">
                  {tableRows.map(
                    (user) => {
                      const statusStyle =
                        getStatusStyle(
                          user.displayStatus
                        );

                      return (
                        <div
                          key={
                            user.id
                          }
                          className="p-4 sm:p-5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className="w-11 h-11 rounded-xl text-white flex items-center justify-center font-bold overflow-hidden shrink-0"
                                style={{
                                  backgroundColor:
                                    RED,
                                }}
                              >
                                {user.avatar ? (
                                  <img
                                    src={
                                      user.avatar
                                    }
                                    alt={
                                      user.name ||
                                      "User"
                                    }
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  (
                                    user.name ||
                                    "U"
                                  )
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="font-bold text-gray-900 truncate">
                                  {user.name ||
                                    "-"}
                                </p>

                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                  {user.email ||
                                    "-"}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-bold whitespace-nowrap ${statusStyle.wrapper}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
                              />

                              {
                                user.displayStatus
                              }
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5 mt-4">
                            <div className="rounded-xl bg-[#FAF9F8] border border-[#EEE9E6] p-3">
                              <p className="text-[10px] uppercase tracking-[0.08em] font-bold text-gray-400">
                                Role
                              </p>

                              <p className="text-sm font-semibold text-gray-800 mt-1 capitalize">
                                {user.role ||
                                  "-"}
                              </p>
                            </div>

                            <div className="rounded-xl bg-[#FAF9F8] border border-[#EEE9E6] p-3">
                              <p className="text-[10px] uppercase tracking-[0.08em] font-bold text-gray-400">
                                Team
                              </p>

                              <p className="text-sm font-semibold text-gray-800 mt-1">
                                {user.team ||
                                  "No Team"}
                              </p>
                            </div>

                            <div className="rounded-xl bg-[#FAF9F8] border border-[#EEE9E6] p-3">
                              <p className="text-[10px] uppercase tracking-[0.08em] font-bold text-gray-400">
                                Phone
                              </p>

                              <p className="text-sm font-semibold text-gray-800 mt-1 truncate">
                                {user.phone ||
                                  "-"}
                              </p>
                            </div>

                            <div className="rounded-xl bg-[#FAF9F8] border border-[#EEE9E6] p-3">
                              <p className="text-[10px] uppercase tracking-[0.08em] font-bold text-gray-400">
                                Last Login
                              </p>

                              <p className="text-xs font-semibold text-gray-800 mt-1">
                                {formatDisplayDateTime(
                                  user.last_login ||
                                    user.login_time
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 mt-4">
                            {/* BREAK */}

                            <button
                              type="button"
                              onClick={() =>
                                openBreakModal(
                                  user
                                )
                              }
                              className="flex-1 h-10 rounded-xl border border-[#DED7D3] bg-white hover:bg-[#FFF5F5] text-xs font-bold text-gray-700 flex items-center justify-center gap-2"
                            >
                              <Coffee
                                className="w-4 h-4"
                                style={{
                                  color: RED,
                                }}
                              />
                              Break
                            </button>

                            {/* EDIT */}

                            <Link
                              href={`/users/${user.id}/edit`}
                              className="flex-1 h-10 rounded-xl border border-[#DED7D3] bg-white hover:bg-[#FFF5F5] text-xs font-bold text-gray-700 flex items-center justify-center gap-2"
                            >
                              <Edit3
                                className="w-4 h-4"
                                style={{
                                  color: RED,
                                }}
                              />
                              Edit
                            </Link>

                            {/* DELETE */}

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteUser(
                                  user.id
                                )
                              }
                              disabled={
                                deletingUserId ===
                                user.id
                              }
                              className="w-10 h-10 rounded-xl border border-[#DED7D3] bg-white hover:bg-[#FFF5F5] flex items-center justify-center disabled:opacity-50"
                            >
                              {deletingUserId ===
                              user.id ? (
                                <RefreshCw
                                  className="w-4 h-4 animate-spin"
                                  style={{
                                    color: RED,
                                  }}
                                />
                              ) : (
                                <Trash2
                                  className="w-4 h-4"
                                  style={{
                                    color: RED,
                                  }}
                                />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* =========================================================
          USER BREAK MODAL
      ========================================================= */}

      {breakModalOpen &&
        selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() =>
                !savingBreak &&
                setBreakModalOpen(
                  false
                )
              }
            />

            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E5DEDA]">
              <div
                className="h-1.5"
                style={{
                  backgroundColor:
                    RED,
                }}
              />

              <div className="px-5 py-5 border-b border-[#ECE7E4] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor:
                        `${RED}12`,
                    }}
                  >
                    <Coffee
                      className="w-5 h-5"
                      style={{
                        color: RED,
                      }}
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900">
                      Break Schedule
                    </h3>

                    <p className="text-xs text-gray-500 mt-0.5">
                      {
                        selectedUser.name
                      }
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={
                    savingBreak
                  }
                  onClick={() =>
                    setBreakModalOpen(
                      false
                    )
                  }
                  className="w-9 h-9 rounded-xl hover:bg-[#F7F5F3] flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                    Break Start
                  </label>

                  <input
                    type="datetime-local"
                    value={
                      breakStart
                    }
                    onChange={(e) =>
                      setBreakStart(
                        e.target
                          .value
                      )
                    }
                    className="w-full h-11 rounded-xl border border-[#DDD6D2] bg-[#FCFBFA] px-3 text-sm outline-none focus:bg-white focus:border-[#ec3737] focus:ring-4 focus:ring-[#ec3737]/8"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                    Break End
                  </label>

                  <input
                    type="datetime-local"
                    value={
                      breakEnd
                    }
                    onChange={(e) =>
                      setBreakEnd(
                        e.target
                          .value
                      )
                    }
                    className="w-full h-11 rounded-xl border border-[#DDD6D2] bg-[#FCFBFA] px-3 text-sm outline-none focus:bg-white focus:border-[#ec3737] focus:ring-4 focus:ring-[#ec3737]/8"
                  />
                </div>
              </div>

              <div className="px-5 py-4 bg-[#FAF9F8] border-t border-[#ECE7E4] flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={
                    savingBreak
                  }
                  onClick={() =>
                    setBreakModalOpen(
                      false
                    )
                  }
                  className="px-4 py-2.5 rounded-xl border border-[#DCD5D1] bg-white text-sm font-semibold text-gray-700 hover:bg-[#F7F5F3]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    savingBreak
                  }
                  onClick={
                    handleSaveBreakTime
                  }
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 shadow-lg"
                  style={{
                    backgroundColor:
                      RED,
                    boxShadow:
                      `0 10px 25px ${RED}26`,
                  }}
                >
                  {savingBreak
                    ? "Saving..."
                    : "Save Break"}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* =========================================================
          ADMIN BREAK MODAL
      ========================================================= */}

      {adminBreakModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() =>
              !savingBreak &&
              setAdminBreakModalOpen(
                false
              )
            }
          />

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E5DEDA]">
            <div
              className="h-1.5"
              style={{
                backgroundColor:
                  RED,
              }}
            />

            <div className="px-5 py-5 border-b border-[#ECE7E4] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor:
                      `${RED}12`,
                  }}
                >
                  <Users
                    className="w-5 h-5"
                    style={{
                      color: RED,
                    }}
                  />
                </div>

                <div>
                  <h3 className="font-bold text-gray-900">
                    All Users Break
                  </h3>

                  <p className="text-xs text-gray-500 mt-0.5">
                    Apply schedule to everyone
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={
                  savingBreak
                }
                onClick={() =>
                  setAdminBreakModalOpen(
                    false
                  )
                }
                className="w-9 h-9 rounded-xl hover:bg-[#F7F5F3] flex items-center justify-center"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                  Break Start
                </label>

                <input
                  type="datetime-local"
                  value={
                    adminBreakStart
                  }
                  onChange={(e) =>
                    setAdminBreakStart(
                      e.target
                        .value
                    )
                  }
                  className="w-full h-11 rounded-xl border border-[#DDD6D2] bg-[#FCFBFA] px-3 text-sm outline-none focus:bg-white focus:border-[#ec3737] focus:ring-4 focus:ring-[#ec3737]/8"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                  Break End
                </label>

                <input
                  type="datetime-local"
                  value={
                    adminBreakEnd
                  }
                  onChange={(e) =>
                    setAdminBreakEnd(
                      e.target
                        .value
                    )
                  }
                  className="w-full h-11 rounded-xl border border-[#DDD6D2] bg-[#FCFBFA] px-3 text-sm outline-none focus:bg-white focus:border-[#ec3737] focus:ring-4 focus:ring-[#ec3737]/8"
                />
              </div>
            </div>

            <div className="px-5 py-4 bg-[#FAF9F8] border-t border-[#ECE7E4] flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={
                  savingBreak
                }
                onClick={() =>
                  setAdminBreakModalOpen(
                    false
                  )
                }
                className="px-4 py-2.5 rounded-xl border border-[#DCD5D1] bg-white text-sm font-semibold text-gray-700 hover:bg-[#F7F5F3]"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  savingBreak
                }
                onClick={
                  handleSaveAdminBreakTime
                }
                className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 shadow-lg"
                style={{
                  backgroundColor:
                    RED,
                  boxShadow:
                    `0 10px 25px ${RED}26`,
                }}
              >
                {savingBreak
                  ? "Saving..."
                  : "Apply To All"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          LOGOUT MODAL
      ========================================================= */}

      {logoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() =>
              setLogoutModalOpen(
                false
              )
            }
          />

          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 border border-[#E5DEDA]">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor:
                  `${RED}12`,
              }}
            >
              <LogOut
                className="w-5 h-5"
                style={{
                  color: RED,
                }}
              />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-5">
              Logout
            </h3>

            <p className="text-sm text-gray-500 mt-2 leading-6">
              Are you sure you want to logout from your CRM account?
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() =>
                  setLogoutModalOpen(
                    false
                  )
                }
                className="px-4 py-2.5 rounded-xl border border-[#DCD5D1] bg-white text-sm font-semibold text-gray-700 hover:bg-[#F7F5F3]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem(
                    "crm_login_time"
                  );

                  router.push(
                    "/login"
                  );
                }}
                className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg"
                style={{
                  backgroundColor:
                    RED,
                  boxShadow:
                    `0 10px 25px ${RED}26`,
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

