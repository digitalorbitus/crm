// "use client";

// import {
//   Users,
//   UserCheck,
//   UserX,
//   UserPlus,
//   ShieldCheck,
//   Search,
//   Filter,
//   Download,
//   Eye,
//   Edit,
//   Trash2,
//   Calendar,
//   ChevronDown,
//   ChevronLeft,
//   ChevronRight,
//   Menu,
//   X,
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
//   const [loadingUsers, setLoadingUsers] = useState(true);
//   const [usersError, setUsersError] = useState("");
//   const [loggingOut, setLoggingOut] = useState(false);
//   const [showLogoutModal, setShowLogoutModal] = useState(false);

//   // Filter States
//   const [searchTerm, setSearchTerm] = useState("");
//   const [roleFilter, setRoleFilter] = useState("All Roles");
//   const [statusFilter, setStatusFilter] = useState("All Status");
//   const [teamFilter, setTeamFilter] = useState("All Teams");

//   // Helper Function for Consistent Date/Time Formatting
//   const formatDateTime = (dateObj) => {
//     const day = dateObj.toLocaleDateString("en-US", { weekday: "long" });
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

//     return { day, date, time };
//   };

//   const [loginDetails, setLoginDetails] = useState(() => formatDateTime(new Date()));

//   useEffect(() => {
//     try {
//       let savedLoginTime = localStorage.getItem("crm_login_time");
//       if (!savedLoginTime) {
//         const now = new Date();
//         savedLoginTime = now.toISOString();
//         localStorage.setItem("crm_login_time", savedLoginTime);
//       }
//       setLoginDetails(formatDateTime(new Date(savedLoginTime)));
//     } catch (e) {
//       console.error("Storage access error:", e);
//     }
//   }, []);

//   // Fetch Users Function
//   const fetchUsers = async () => {
//     try {
//       setLoadingUsers(true);
//       setUsersError("");

//       const response = await fetch("/api/new-users", {
//         method: "GET",
//         cache: "no-store",
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to fetch users");
//       }

//       setUsersList(data.users || data.data || []);
//     } catch (error) {
//       console.error("FETCH USERS ERROR:", error);
//       setUsersError(error.message || "Failed to load users");
//     } finally {
//       setLoadingUsers(false);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   // Filter Logic
//   const filteredUsers = useMemo(() => {
//     return usersList.filter((usr) => {
//       const name = usr.name || usr.fullName || "";
//       const email = usr.email || "";
//       const phone = usr.phone || "";

//       const matchesSearch =
//         name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         phone.includes(searchTerm);

//       const matchesRole =
//         roleFilter === "All Roles" ||
//         (usr.role || "").toLowerCase() === roleFilter.toLowerCase();

//       const matchesStatus =
//         statusFilter === "All Status" ||
//         (usr.status || "").toLowerCase() === statusFilter.toLowerCase();

//       const matchesTeam =
//         teamFilter === "All Teams" ||
//         (usr.team || "").toLowerCase() === teamFilter.toLowerCase();

//       return matchesSearch && matchesRole && matchesStatus && matchesTeam;
//     });
//   }, [usersList, searchTerm, roleFilter, statusFilter, teamFilter]);

//   // Dynamic Stats based on fetched users
//   const stats = useMemo(() => {
//     const total = usersList.length;
//     const active = usersList.filter(
//       (u) => (u.status || "").toLowerCase() === "online" || (u.status || "").toLowerCase() === "active"
//     ).length;
//     const inactive = usersList.filter(
//       (u) => (u.status || "").toLowerCase() === "offline" || (u.status || "").toLowerCase() === "inactive"
//     ).length;
//     const admins = usersList.filter(
//       (u) => (u.role || "").toLowerCase() === "admin"
//     ).length;

//     return [
//       {
//         title: "Total Users",
//         value: total,
//         change: "Dynamic",
//         isPositive: true,
//         period: "total in system",
//         icon: Users,
//         bgColor: "bg-purple-50",
//         iconColor: "text-purple-600",
//       },
//       {
//         title: "Active Users",
//         value: active,
//         change: "Active",
//         isPositive: true,
//         period: "currently active",
//         icon: UserCheck,
//         bgColor: "bg-emerald-50",
//         iconColor: "text-emerald-500",
//       },
//       {
//         title: "Inactive Users",
//         value: inactive,
//         change: "Offline",
//         isPositive: false,
//         period: "currently offline",
//         icon: UserX,
//         bgColor: "bg-orange-50",
//         iconColor: "text-orange-500",
//       },
//       {
//         title: "Logged In Now",
//         value: active,
//         change: "Live",
//         isPositive: true,
//         period: "online users",
//         icon: UserPlus,
//         bgColor: "bg-blue-50",
//         iconColor: "text-blue-500",
//       },
//       {
//         title: "Total Admins",
//         value: admins,
//         change: "Admins",
//         isNeutral: true,
//         period: "admin accounts",
//         icon: ShieldCheck,
//         bgColor: "bg-indigo-50",
//         iconColor: "text-indigo-600",
//       },
//     ];
//   }, [usersList]);

//   const handleConfirmLogout = async () => {
//     setLoggingOut(true);
//     try {
//       localStorage.removeItem("crm_login_time");
//       const response = await fetch("/api/logout", { method: "POST" });
//       if (!response.ok) {
//         setLoggingOut(false);
//         setShowLogoutModal(false);
//         return;
//       }
//       router.push("/login");
//     } catch (error) {
//       console.error("Logout error:", error);
//       setLoggingOut(false);
//       setShowLogoutModal(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#F8FAFC] text-slate-800 relative">
//       {/* MOBILE HEADER */}
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
//           onClick={() => setSidebarOpen(!sidebarOpen)}
//           className="p-2 rounded-lg text-slate-300 hover:bg-white/10"
//         >
//           {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
//         </button>
//       </header>

//       {/* MOBILE OVERLAY */}
//       {sidebarOpen && (
//         <div
//           onClick={() => setSidebarOpen(false)}
//           className="fixed inset-0 z-40 bg-black/60 lg:hidden"
//         />
//       )}

//       {/* SIDEBAR */}
//       <Sidebar
//         sidebarOpen={sidebarOpen}
//         setSidebarOpen={setSidebarOpen}
//         setShowLogoutModal={setShowLogoutModal}
//       />

//       {/* MAIN CONTENT AREA */}
//       <main className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">
//         {/* TOP BAR */}
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-2xl font-black text-slate-900 tracking-tight">
//               Users
//             </h1>
//             <p className="text-xs text-slate-400 font-medium mt-0.5">
//               Dashboard &gt; Users &gt;{" "}
//               <span className="text-slate-600">All Users</span>
//             </p>
//           </div>

//           <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
//             {/* DATE PICKER BADGE */}
//             <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50">
//               <Calendar size={14} className="text-slate-500" />
//               <span>{loginDetails.date}</span>
//               <ChevronDown size={14} className="text-slate-400" />
//             </div>

//             {/* ADD NEW USER BUTTON */}
//             <Link href="/add-new-users">
//               <button
//                 type="button"
//                 className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-md transition cursor-pointer"
//               >
//                 <UserPlus size={15} />
//                 <span>+ Add New User</span>
//               </button>
//             </Link>

//             {/* ADMIN USER AVATAR */}
//             <div className="flex items-center gap-2.5 shrink-0 pl-2">
//               <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
//                 <span className="bg-gradient-to-tr from-amber-500 to-rose-500 w-full h-full rounded-full flex items-center justify-center">
//                   A
//                 </span>
//               </div>
//               <div className="text-left hidden md:block">
//                 <p className="text-xs font-bold text-slate-900 leading-tight">
//                   Admin User
//                 </p>
//                 <p className="text-[10px] text-slate-400 font-medium">
//                   Administrator
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* 5 STAT CARDS GRID */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
//           {stats.map((stat, idx) => {
//             const Icon = stat.icon;
//             return (
//               <div
//                 key={idx}
//                 className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
//               >
//                 <div className="flex items-center justify-between">
//                   <span className="text-xs font-semibold text-slate-400">
//                     {stat.title}
//                   </span>
//                   <div
//                     className={`w-8 h-8 rounded-xl ${stat.bgColor} ${stat.iconColor} flex items-center justify-center shrink-0`}
//                   >
//                     <Icon size={16} />
//                   </div>
//                 </div>

//                 <div className="mt-2">
//                   <h3 className="text-2xl font-black text-slate-900">
//                     {stat.value}
//                   </h3>
//                   <p className="text-[11px] font-semibold mt-1">
//                     {stat.isNeutral ? (
//                       <span className="text-slate-400 font-normal">
//                         {stat.period}
//                       </span>
//                     ) : stat.isPositive ? (
//                       <span className="text-emerald-500">
//                         ↑ {stat.change}{" "}
//                         <span className="text-slate-400 font-normal">
//                           {stat.period}
//                         </span>
//                       </span>
//                     ) : (
//                       <span className="text-rose-500">
//                         ↓ {stat.change}{" "}
//                         <span className="text-slate-400 font-normal">
//                           {stat.period}
//                         </span>
//                       </span>
//                     )}
//                   </p>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* TABLE WRAPPER WITH TOOLBAR & FILTERS */}
//         <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
//           {/* SEARCH & FILTERS BAR */}
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
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   placeholder="Search by name, email or number..."
//                   className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
//                 />
//               </div>

//               {/* DROPDOWNS */}
//               <div className="flex items-center gap-2 text-xs">
//                 <select
//                   value={roleFilter}
//                   onChange={(e) => setRoleFilter(e.target.value)}
//                   className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 focus:outline-none"
//                 >
//              <option>All Roles</option>
// <option>Admin</option>
// <option>Staff</option>
// <option>Agent</option>
//                 </select>

//                 <select
//                   value={statusFilter}
//                   onChange={(e) => setStatusFilter(e.target.value)}
//                   className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 focus:outline-none"
//                 >
//                   <option>All Status</option>
//                   <option>Online</option>
//                   <option>Offline</option>
//                 </select>

//                 <select
//                   value={teamFilter}
//                   onChange={(e) => setTeamFilter(e.target.value)}
//                   className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 focus:outline-none"
//                 >
//                   <option>All Teams</option>
//                   <option>Sales</option>
//                   <option>Support</option>
//                   <option>Marketing</option>
//                 </select>
//               </div>
//             </div>

//             {/* ACTION BUTTONS */}
//             <div className="flex items-center gap-2">
//               <button
//                 type="button"
//                 onClick={fetchUsers}
//                 className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
//               >
//                 <RefreshCw size={13} className={loadingUsers ? "animate-spin" : ""} />
//                 <span>Refresh</span>
//               </button>

//               <button
//                 type="button"
//                 className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm hover:bg-slate-50 transition"
//               >
//                 <Download size={13} className="text-slate-500" />
//                 <span>Export</span>
//               </button>
//             </div>
//           </div>

//           {/* DATA TABLE */}
//           <div className="overflow-x-auto">
//             <table className="w-full text-xs text-left">
//               <thead>
//                 <tr className="bg-slate-50/60 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
//                   <th className="py-3 px-4 w-8">#</th>
//                   <th className="py-3 px-4">User</th>
//                   <th className="py-3 px-4">Role</th>
//                   <th className="py-3 px-4">Team</th>
//                   <th className="py-3 px-4">Total Calls</th>
//                   <th className="py-3 px-4">Messages</th>
//                   <th className="py-3 px-4">Last Login</th>
//                   <th className="py-3 px-4">Login Time</th>
//                   <th className="py-3 px-4">Logout Time</th>
//                   <th className="py-3 px-4">Status</th>
//                   <th className="py-3 px-4 text-center">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {/* 1. LOADING STATE */}
//                 {loadingUsers && (
//                   <tr>
//                     <td colSpan={11} className="py-12 text-center text-slate-500">
//                       <div className="flex flex-col items-center justify-center gap-2">
//                         <Loader2 size={24} className="animate-spin text-blue-600" />
//                         <span className="text-xs font-medium">Fetching Users Data...</span>
//                       </div>
//                     </td>
//                   </tr>
//                 )}

//                 {/* 2. ERROR STATE */}
//                 {!loadingUsers && usersError && (
//                   <tr>
//                     <td colSpan={11} className="py-10 text-center text-rose-500">
//                       <div className="flex flex-col items-center justify-center gap-2">
//                         <AlertTriangle size={22} />
//                         <span className="font-semibold text-xs">{usersError}</span>
//                         <button
//                           onClick={fetchUsers}
//                           className="mt-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold hover:bg-rose-200 transition"
//                         >
//                           Try Again
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 )}

//                 {/* 3. EMPTY STATE */}
//                 {!loadingUsers && !usersError && filteredUsers.length === 0 && (
//                   <tr>
//                     <td colSpan={11} className="py-12 text-center text-slate-400">
//                       <div className="flex flex-col items-center justify-center gap-1">
//                         <Users size={28} className="text-slate-300 mb-1" />
//                         <p className="font-bold text-slate-600 text-xs">No users found</p>
//                         <p className="text-[11px]">Try adjusting your search or filter keywords.</p>
//                       </div>
//                     </td>
//                   </tr>
//                 )}

//                 {/* 4. SUCCESS STATE (DATA ROW) */}
//                 {!loadingUsers &&
//                   !usersError &&
//                   filteredUsers.map((usr, index) => {
//                     const name = usr.name || usr.fullName || "Unnamed User";
//                     const email = usr.email || "No Email";
//                     const role = usr.role || "Agent";
//                     const team = usr.team || "Sales";
//                     const status = usr.status || "Offline";

//                     return (
//                       <tr
//                         key={usr.id || usr._id || index}
//                         className="hover:bg-slate-50/70 transition-colors"
//                       >
//                         <td className="py-3 px-4 text-slate-400 font-medium">
//                           {index + 1}
//                         </td>

//                         {/* USER NAME & AVATAR */}
//       {/* USER NAME & AVATAR */}
// <td className="py-3 px-4">
//   <div className="flex items-center gap-2.5">
//     <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-[11px] uppercase overflow-hidden shrink-0">
//       {usr.avatar ? (
//         <img
//           src={usr.avatar}
//           alt={name}
//           className="w-full h-full object-cover"
//         />
//       ) : (
//         name.charAt(0)
//       )}
//     </div>

//     <div>
//       <p className="font-bold text-slate-800 leading-snug">
//         {name}
//       </p>
//       <p className="text-[10px] text-slate-400">
//         {email}
//       </p>
//     </div>
//   </div>
// </td>
//                         {/* ROLE BADGE */}
//                         <td className="py-3 px-4">
//                           <span
//                           className={`px-2 py-0.5 rounded-md font-bold text-[10px] capitalize ${
//   role.toLowerCase() === "admin"
//     ? "bg-purple-100 text-purple-700"
//     : role.toLowerCase() === "staff"
//     ? "bg-blue-100 text-blue-700"
//     : "bg-emerald-100 text-emerald-700"
// }`}
//                           >
//                             {role}
//                           </span>
//                         </td>

//                         <td className="py-3 px-4 text-slate-600 font-medium">
//                           {team}
//                         </td>
//                         <td className="py-3 px-4 text-slate-800 font-bold">
//                           {usr.calls ?? usr.totalCalls ?? 0}
//                         </td>
//                         <td className="py-3 px-4 text-slate-800 font-bold">
//                           {usr.messages ?? usr.totalMessages ?? 0}
//                         </td>
//                         <td className="py-3 px-4 text-slate-500 font-medium whitespace-nowrap">
//                           {usr.lastLogin || "N/A"}
//                         </td>
//                         <td className="py-3 px-4 text-emerald-600 font-medium whitespace-nowrap">
//                           {usr.loginTime || "N/A"}
//                         </td>
//                         <td className="py-3 px-4 text-rose-500 font-medium whitespace-nowrap">
//                           {usr.logoutTime || "N/A"}
//                         </td>

//                         {/* STATUS BADGE */}
//                         <td className="py-3 px-4">
//                           <span
//                             className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
//                               status.toLowerCase() === "online" || status.toLowerCase() === "active"
//                                 ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
//                                 : "bg-rose-50 text-rose-500 border border-rose-200"
//                             }`}
//                           >
//                             {status}
//                           </span>
//                         </td>

//                         {/* ACTION BUTTONS */}
//                         <td className="py-3 px-4">
//                           <div className="flex items-center justify-center gap-2 text-slate-400">
//                             <button
//                               type="button"
//                               className="hover:text-blue-600 transition"
//                               title="View Details"
//                             >
//                               <Eye size={14} />
//                             </button>
//                             <button
//                               type="button"
//                               className="hover:text-amber-600 transition"
//                               title="Edit User"
//                             >
//                               <Edit size={14} />
//                             </button>
//                             <button
//                               type="button"
//                               className="hover:text-rose-600 transition"
//                               title="Delete User"
//                             >
//                               <Trash2 size={14} />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//               </tbody>
//             </table>
//           </div>

//           {/* PAGINATION FOOTER */}
//           <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
//             <span>
//               Showing {filteredUsers.length} of {usersList.length} users
//             </span>

//             <div className="flex items-center gap-1">
//               <button
//                 type="button"
//                 className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50"
//               >
//                 <ChevronLeft size={14} />
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
//                 <ChevronRight size={14} />
//               </button>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* LOGOUT CONFIRMATION MODAL */}
//       {showLogoutModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
//           <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
//             <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
//               <AlertTriangle size={24} />
//             </div>

//             <div className="text-center space-y-1">
//               <h3 className="text-lg font-bold text-slate-900">Log Out?</h3>
//               <p className="text-sm text-slate-500">
//                 Are you sure you want to log out of your account?
//               </p>
//             </div>

//             <div className="flex items-center gap-3 pt-2">
//               <button
//                 type="button"
//                 disabled={loggingOut}
//                 onClick={() => setShowLogoutModal(false)}
//                 className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition disabled:opacity-50 cursor-pointer"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 disabled={loggingOut}
//                 onClick={handleConfirmLogout}
//                 className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
//               >
//                 {loggingOut ? (
//                   <>
//                     <Loader2 size={16} className="animate-spin" />
//                     <span>Logging out...</span>
//                   </>
//                 ) : (
//                   <span>Yes, Logout</span>
//                 )}
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
  UserPlus,
  ShieldCheck,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

export default function UsersPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [teamFilter, setTeamFilter] = useState("All Teams");
  const [dateFilter, setDateFilter] = useState("");
const [filterType, setFilterType] = useState("date");

  // Format Helper for Date/Time Display
  const formatDateTime = (dateObj) => {
    const day = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    const date = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const time = dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return { day, date, time };
  };
const formatDisplayDateTime = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (isNaN(date.getTime())) return "N/A";

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
  const [loginDetails, setLoginDetails] = useState(() =>
    formatDateTime(new Date())
  );

  useEffect(() => {
    try {
      let savedLoginTime = localStorage.getItem("crm_login_time");
      if (!savedLoginTime) {
        const now = new Date();
        savedLoginTime = now.toISOString();
        localStorage.setItem("crm_login_time", savedLoginTime);
      }
      setLoginDetails(formatDateTime(new Date(savedLoginTime)));
    } catch (e) {
      console.error("Storage access error:", e);
    }
  }, []);

  // Fetch Users Function
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      setUsersError("");

      const response = await fetch("/api/new-users", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch users");
      }

      console.log("API USERS DATA:", data); // Inspection ke liye log
      setUsersList(data.users || data.data || []);
    } catch (error) {
      console.error("FETCH USERS ERROR:", error);
      setUsersError(error.message || "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter Logic
// Filter Logic Fixed
const filteredUsers = useMemo(() => {
  return usersList.filter((usr) => {
    // 1. SEARCH FILTER
    const name = (usr.name || usr.fullName || "").toLowerCase();
    const email = (usr.email || "").toLowerCase();
    const phone = (usr.phone || "").toString();
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      !search ||
      name.includes(search) ||
      email.includes(search) ||
      phone.includes(search);

    // 2. ROLE FILTER
    const userRole = (usr.role || "").trim().toLowerCase();
    const matchesRole =
      roleFilter === "All Roles" ||
      userRole === roleFilter.trim().toLowerCase();

    // 3. STATUS FILTER (Handles Online/Active & Offline/Inactive together)
    const userStatus = (usr.status || "").trim().toLowerCase();
    const selectedStatus = statusFilter.trim().toLowerCase();

    let matchesStatus = statusFilter === "All Status";
    if (!matchesStatus) {
      if (selectedStatus === "online" || selectedStatus === "active") {
        matchesStatus = userStatus === "online" || userStatus === "active";
      } else if (selectedStatus === "offline" || selectedStatus === "inactive") {
        matchesStatus = userStatus === "offline" || userStatus === "inactive";
      } else {
        matchesStatus = userStatus === selectedStatus;
      }
    }

    // 4. TEAM FILTER
    const userTeam = (usr.team || "").trim().toLowerCase();
    const matchesTeam =
      teamFilter === "All Teams" ||
      userTeam === teamFilter.trim().toLowerCase();

    // 5. DATE / MONTH FILTER
    // let matchesDate = true;
    // if (dateFilter) {
    //   const rawUserDate =
    //     usr.loginTime ||
    //     usr.login_time ||
    //     usr.lastLogin ||
    //     usr.last_login ||
    //     usr.createdAt;

    //   if (rawUserDate) {
    //     const userDateObj = new Date(rawUserDate);

    //     if (!isNaN(userDateObj.getTime())) {
    //       // Local Date/Month Extraction (avoiding UTC timezone shift bugs)
    //       const year = userDateObj.getFullYear();
    //       const month = String(userDateObj.getMonth() + 1).padStart(2, "0");
    //       const day = String(userDateObj.getDate()).padStart(2, "0");

    //       if (filterType === "date") {
    //         const userFormattedDate = `${year}-${month}-${day}`;
    //         matchesDate = userFormattedDate === dateFilter;
    //       } else if (filterType === "month") {
    //         const userFormattedMonth = `${year}-${month}`;
    //         matchesDate = userFormattedMonth === dateFilter;
    //       }
    //     } else {
    //       matchesDate = false;
    //     }
    //   } else {
    //     matchesDate = false;
    //   }
    // }

    // 5. DATE / MONTH FILTER
let matchesDate = true;

if (dateFilter) {
  const rawUserDate =
    usr.loginTime ||
    usr.login_time;

  if (!rawUserDate) {
    matchesDate = false;
  } else {
    const userDate = new Date(rawUserDate);

    if (isNaN(userDate.getTime())) {
      matchesDate = false;
    } else {
      const year = userDate.getFullYear();
      const month = String(userDate.getMonth() + 1).padStart(2, "0");
      const day = String(userDate.getDate()).padStart(2, "0");

      // Specific Date
      if (filterType === "date") {
        const userDateFormatted = `${year}-${month}-${day}`;

        matchesDate = userDateFormatted === dateFilter;
      }

      // Full Month
      if (filterType === "month") {
        const userMonthFormatted = `${year}-${month}`;

        matchesDate = userMonthFormatted === dateFilter;
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
  });
}, [
  usersList,
  searchTerm,
  roleFilter,
  statusFilter,
  teamFilter,
  dateFilter,
  filterType,
]);

  // Dynamic Stats calculations
  const stats = useMemo(() => {
    const total = usersList.length;
    const active = usersList.filter(
      (u) =>
        (u.status || "").toLowerCase() === "online" ||
        (u.status || "").toLowerCase() === "active"
    ).length;
    const inactive = usersList.filter(
      (u) =>
        (u.status || "").toLowerCase() === "offline" ||
        (u.status || "").toLowerCase() === "inactive"
    ).length;
    const admins = usersList.filter(
      (u) => (u.role || "").toLowerCase() === "admin"
    ).length;

    return [
      {
        title: "Total Users",
        value: total,
        change: "Dynamic",
        isPositive: true,
        period: "total in system",
        icon: Users,
        bgColor: "bg-purple-50",
        iconColor: "text-purple-600",
      },
      {
        title: "Active Users",
        value: active,
        change: "Active",
        isPositive: true,
        period: "currently active",
        icon: UserCheck,
        bgColor: "bg-emerald-50",
        iconColor: "text-emerald-500",
      },
      {
        title: "Inactive Users",
        value: inactive,
        change: "Offline",
        isPositive: false,
        period: "currently offline",
        icon: UserX,
        bgColor: "bg-orange-50",
        iconColor: "text-orange-500",
      },
      {
        title: "Logged In Now",
        value: active,
        change: "Live",
        isPositive: true,
        period: "online users",
        icon: UserPlus,
        bgColor: "bg-blue-50",
        iconColor: "text-blue-500",
      },
      {
        title: "Total Admins",
        value: admins,
        change: "Admins",
        isNeutral: true,
        period: "admin accounts",
        icon: ShieldCheck,
        bgColor: "bg-indigo-50",
        iconColor: "text-indigo-600",
      },
    ];
  }, [usersList]);

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      localStorage.removeItem("crm_login_time");
      const response = await fetch("/api/logout", { method: "POST" });
      if (!response.ok) {
        setLoggingOut(false);
        setShowLogoutModal(false);
        return;
      }
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 relative">
      {/* MOBILE HEADER */}
      <header className="lg:hidden h-16 bg-[#050B1E] border-b border-slate-800 flex items-center justify-between px-4 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 p-[2px] flex items-center justify-center">
            <div className="w-full h-full bg-[#050B1E] rounded-full flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-rose-500 flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full" />
              </div>
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            CallCRM
          </span>
        </div>

        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-slate-300 hover:bg-white/10"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setShowLogoutModal={setShowLogoutModal}
      />

      {/* MAIN CONTENT AREA */}
      <main className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">
        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Users
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Dashboard &gt; Users &gt;{" "}
              <span className="text-slate-600">All Users</span>
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
            {/* DATE PICKER BADGE */}
      <div className="flex items-center gap-2">
  {/* DATE / MONTH TYPE */}
  <select
    value={filterType}
    onChange={(e) => {
      setFilterType(e.target.value);
      setDateFilter("");
    }}
    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:border-blue-500"
  >
    <option value="date">Date</option>
    <option value="month">Month</option>
  </select>

  {/* DATE PICKER */}
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm">
    <Calendar size={14} className="text-slate-500" />

    <input
      type={filterType}
      value={dateFilter}
      onChange={(e) => setDateFilter(e.target.value)}
      className="text-xs font-semibold text-slate-700 outline-none bg-transparent cursor-pointer"
    />

    {dateFilter && (
      <button
        type="button"
        onClick={() => setDateFilter("")}
        className="text-slate-400 hover:text-rose-500 text-xs font-bold"
        title="Clear date filter"
      >
        ×
      </button>
    )}
  </div>
</div>

            {/* ADD NEW USER BUTTON */}
            <Link href="/add-new-users">
              <button
                type="button"
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-md transition cursor-pointer"
              >
                <UserPlus size={15} />
                <span>+ Add New User</span>
              </button>
            </Link>

            {/* ADMIN USER AVATAR */}
            {/* <div className="flex items-center gap-2.5 shrink-0 pl-2">
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                <span className="bg-gradient-to-tr from-amber-500 to-rose-500 w-full h-full rounded-full flex items-center justify-center">
                  A
                </span>
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  Admin User
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  Administrator
                </p>
              </div>
            </div> */}
          </div>
        </div>

        {/* STAT CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    {stat.title}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-xl ${stat.bgColor} ${stat.iconColor} flex items-center justify-center shrink-0`}
                  >
                    <Icon size={16} />
                  </div>
                </div>

                <div className="mt-2">
                  <h3 className="text-2xl font-black text-slate-900">
                    {stat.value}
                  </h3>
                  <p className="text-[11px] font-semibold mt-1">
                    {stat.isNeutral ? (
                      <span className="text-slate-400 font-normal">
                        {stat.period}
                      </span>
                    ) : stat.isPositive ? (
                      <span className="text-emerald-500">
                        ↑ {stat.change}{" "}
                        <span className="text-slate-400 font-normal">
                          {stat.period}
                        </span>
                      </span>
                    ) : (
                      <span className="text-rose-500">
                        ↓ {stat.change}{" "}
                        <span className="text-slate-400 font-normal">
                          {stat.period}
                        </span>
                      </span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* TABLE WRAPPER WITH TOOLBAR & FILTERS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* SEARCH & FILTERS BAR */}
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto flex-1">
              {/* SEARCH INPUT */}
              <div className="relative flex-1 min-w-[200px] sm:min-w-[240px]">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email or number..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* DROPDOWNS */}
              <div className="flex items-center gap-2 text-xs">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 focus:outline-none"
                >
                  <option>All Roles</option>
                  <option>Admin</option>
                  <option>Staff</option>
                  <option>Agent</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 focus:outline-none"
                >
                  <option>All Status</option>
                  <option>Online</option>
                  <option>Offline</option>
                  <option>Active</option>
                </select>

                <select
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 focus:outline-none"
                >
                  <option>All Teams</option>
                  <option>Sales</option>
                  <option>Support</option>
                  <option>Marketing</option>
                </select>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchUsers}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <RefreshCw
                  size={13}
                  className={loadingUsers ? "animate-spin" : ""}
                />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm hover:bg-slate-50 transition"
              >
                <Download size={13} className="text-slate-500" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* DATA TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-8">#</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4">Total Calls</th>
                  <th className="py-3 px-4">Messages</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 px-4">Login Time</th>
                  <th className="py-3 px-4">Logout Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* 1. LOADING STATE */}
                {loadingUsers && (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2
                          size={24}
                          className="animate-spin text-blue-600"
                        />
                        <span className="text-xs font-medium">
                          Fetching Users Data...
                        </span>
                      </div>
                    </td>
                  </tr>
                )}

                {/* 2. ERROR STATE */}
                {!loadingUsers && usersError && (
                  <tr>
                    <td colSpan={11} className="py-10 text-center text-rose-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertTriangle size={22} />
                        <span className="font-semibold text-xs">
                          {usersError}
                        </span>
                        <button
                          onClick={fetchUsers}
                          className="mt-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold hover:bg-rose-200 transition"
                        >
                          Try Again
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {/* 3. EMPTY STATE */}
                {!loadingUsers &&
                  !usersError &&
                  filteredUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan={11}
                        className="py-12 text-center text-slate-400"
                      >
                        <div className="flex flex-col items-center justify-center gap-1">
                          <Users size={28} className="text-slate-300 mb-1" />
                          <p className="font-bold text-slate-600 text-xs">
                            No users found
                          </p>
                          <p className="text-[11px]">
                            Try adjusting your search or filter keywords.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}

                {/* 4. SUCCESS STATE (DATA ROWS) */}
                {!loadingUsers &&
                  !usersError &&
                  filteredUsers.map((usr, index) => {
                    const name = usr.name || usr.fullName || "Unnamed User";
                    const email = usr.email || "No Email";
                    const role = usr.role || "Agent";
                    const team = usr.team || "Sales";
                    const status = usr.status || "Offline";

                    // Multiple key fallbacks for Time fields
                  const lastLogin = formatDisplayDateTime(
  usr.lastLogin || usr.last_login || usr.lastLoginTime
);

const loginTime = formatDisplayDateTime(
  usr.loginTime || usr.login_time
);

const logoutTime = formatDisplayDateTime(
  usr.logoutTime || usr.logout_time
);

                    return (
                      <tr
                        key={usr.id || usr._id || index}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="py-3 px-4 text-slate-400 font-medium">
                          {index + 1}
                        </td>

                        {/* USER NAME & AVATAR */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-[11px] uppercase overflow-hidden shrink-0">
                              {usr.avatar ? (
                                <img
                                  src={usr.avatar}
                                  alt={name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                name.charAt(0)
                              )}
                            </div>

                            <div>
                              <p className="font-bold text-slate-800 leading-snug">
                                {name}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* ROLE BADGE */}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] capitalize ${
                              role.toLowerCase() === "admin"
                                ? "bg-purple-100 text-purple-700"
                                : role.toLowerCase() === "staff"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {role}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {team}
                        </td>
                        <td className="py-3 px-4 text-slate-800 font-bold">
                          {usr.calls ?? usr.totalCalls ?? 0}
                        </td>
                        <td className="py-3 px-4 text-slate-800 font-bold">
                          {usr.messages ?? usr.totalMessages ?? 0}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-medium whitespace-nowrap">
                          {lastLogin}
                        </td>
                        <td className="py-3 px-4 text-emerald-600 font-medium whitespace-nowrap">
                          {loginTime}
                        </td>
                        <td className="py-3 px-4 text-rose-500 font-medium whitespace-nowrap">
                          {logoutTime}
                        </td>

                        {/* STATUS BADGE */}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              status.toLowerCase() === "online" ||
                              status.toLowerCase() === "active"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                : "bg-rose-50 text-rose-500 border border-rose-200"
                            }`}
                          >
                            {status}
                          </span>
                        </td>

                        {/* ACTION BUTTONS */}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2 text-slate-400">
                            <button
                              type="button"
                              className="hover:text-blue-600 transition"
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              className="hover:text-amber-600 transition"
                              title="Edit User"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              type="button"
                              className="hover:text-rose-600 transition"
                              title="Delete User"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* PAGINATION FOOTER */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <span>
              Showing {filteredUsers.length} of {usersList.length} users
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shadow-sm"
              >
                1
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Log Out?</h3>
              <p className="text-sm text-slate-500">
                Are you sure you want to log out of your account?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={loggingOut}
                onClick={() => setShowLogoutModal(false)}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={loggingOut}
                onClick={handleConfirmLogout}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {loggingOut ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Logging out...</span>
                  </>
                ) : (
                  <span>Yes, Logout</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}