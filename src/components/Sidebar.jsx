// "use client";

// import { useState } from "react";
// import Link from "next/link"; // Next.js Link import kiya gaya hai
// import {
//   LayoutDashboard,
//   Users,
//   UserCheck,
//   Phone,
//   UserPlus,
//   MessageSquare,
//   BarChart3,
//   Settings,
//   Link2,
//   CreditCard,
//   LogOut,
//   ChevronDown,
//   ChevronUp,
//   User,
// } from "lucide-react";

// export default function Sidebar({ sidebarOpen, setSidebarOpen, setShowLogoutModal }) {
//   const [openDropdown, setOpenDropdown] = useState(null);

//   const toggleDropdown = (name) => {
//     setOpenDropdown(openDropdown === name ? null : name);
//   };

//   const menuItems = [
//     { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard", active: true },
//     {
//       name: "Users",
//       icon: UserCheck,
//       href: "/users",
//       hasDropdown: true,
//       subItems: [
//         { name: "All Users", href: "/users" },
//         { name: "Add New User", href: "/add-new-users" }, // Updated route link
//       ],
//     },
//     { name: "Teams", icon: Users, href: "/teams" },
//     {
//       name: "Calls",
//       icon: Phone,
//       href: "/calls",
//       hasDropdown: true,
//       subItems: [
//         { name: "Call Logs", href: "/calls/logs" },
//         { name: "Recordings", href: "/calls/recordings" },
//       ],
//     },
//     {
//       name: "Leads",
//       icon: UserPlus,
//       href: "/leads",
//       hasDropdown: true,
//       subItems: [
//         { name: "All Leads", href: "/leads" },
//         { name: "Add Lead", href: "/leads/new" },
//       ],
//     },
//     { name: "Daily Tasks", icon: Link2, href: "/daily-tasks" },
//     { name: "Customers", icon: Users, href: "/customers" },
//     { name: "Messages", icon: MessageSquare, href: "/messages" },
//     { name: "Reports", icon: BarChart3, href: "/reports" },
//     { name: "Settings", icon: Settings, href: "/settings" },
//     { name: "Integrations", icon: Link2, href: "/integrations" },
//      { name: "Agents", icon: Link2, href: "/agents" },
//     { name: "Plan & Billing", icon: CreditCard, href: "/billing" },
//   ];

//   return (
//     <>
//       {/* Mobile Backdrop */}
//       {sidebarOpen && (
//         <div
//           onClick={() => setSidebarOpen && setSidebarOpen(false)}
//           className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
//         />
//       )}

//       {/* Sidebar Container (Desktop/Laptop View) */}
//       <aside
//         className={`
//           fixed left-0 top-0 z-50 h-screen w-64 bg-[#050B1E] text-slate-200 flex flex-col justify-between py-4 px-3 transition-transform duration-300 lg:translate-x-0 border-r border-slate-800/50 select-none
//           ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
//         `}
//       >
//         <div className="flex flex-col flex-1 min-h-0">
//           {/* Logo Header */}
//           <div className="flex items-center gap-3 px-3 mb-4 shrink-0">
//             <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 p-[2px] flex items-center justify-center shadow-lg shadow-rose-500/20">
//               <div className="w-full h-full bg-[#050B1E] rounded-full flex items-center justify-center">
//                 <div className="w-3.5 h-3.5 rounded-full border-2 border-rose-500 flex items-center justify-center">
//                   <div className="w-1 h-1 bg-white rounded-full" />
//                 </div>
//               </div>
//             </div>

//             <span className="font-extrabold text-xl tracking-tight text-white">
//               CallCRM
//             </span>
//           </div>

//           {/* Navigation Menu */}
//           <nav className="flex-1 space-y-1 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
//             {menuItems.map((item) => {
//               const Icon = item.icon;
//               const isDropdownOpen = openDropdown === item.name;

//               return (
//                 <div key={item.name}>
//                   {item.hasDropdown ? (
//                     <button
//                       type="button"
//                       onClick={() => toggleDropdown(item.name)}
//                       className={`
//                         w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200
//                         ${
//                           item.active
//                             ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30"
//                             : "text-slate-300 hover:bg-white/5 hover:text-white"
//                         }
//                       `}
//                     >
//                       <div className="flex items-center gap-2.5">
//                         <Icon size={16} className="shrink-0" />
//                         <span>{item.name}</span>
//                       </div>
//                       {isDropdownOpen ? (
//                         <ChevronUp size={14} className="text-slate-400" />
//                       ) : (
//                         <ChevronDown size={14} className="text-slate-400" />
//                       )}
//                     </button>
//                   ) : (
//                     <Link
//                       href={item.href}
//                       onClick={() => setSidebarOpen && setSidebarOpen(false)}
//                       className={`
//                         flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200
//                         ${
//                           item.active
//                             ? "bg-[#2563EB] text-white font-semibold shadow-md shadow-blue-600/30"
//                             : "text-slate-300 hover:bg-white/5 hover:text-white"
//                         }
//                       `}
//                     >
//                       <Icon size={16} className="shrink-0" />
//                       <span>{item.name}</span>
//                     </Link>
//                   )}

//                   {/* Submenu Options */}
//                   {item.hasDropdown && isDropdownOpen && (
//                     <div className="pl-8 mt-1 space-y-0.5">
//                       {item.subItems.map((sub) => (
//                         <Link
//                           key={sub.name}
//                           href={sub.href}
//                           onClick={() => setSidebarOpen && setSidebarOpen(false)}
//                           className="block py-1 px-2 text-[11px] text-slate-400 hover:text-white transition rounded-lg hover:bg-white/5"
//                         >
//                           {sub.name}
//                         </Link>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </nav>
//         </div>

//         {/* Bottom Logout Button */}
//         <div className="pt-2 mt-2 border-t border-slate-800/60 px-1 shrink-0">
//           <button
//             type="button"
//             onClick={() => {
//               if (setSidebarOpen) setSidebarOpen(false);
//               if (setShowLogoutModal) setShowLogoutModal(true);
//             }}
//             className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition duration-200 cursor-pointer"
//           >
//             <div className="w-5 h-5 rounded-full border border-rose-500/40 flex items-center justify-center shrink-0">
//               <LogOut size={11} className="text-rose-500 ml-0.5" />
//             </div>
//             <span>Logout</span>
//           </button>
//         </div>
//       </aside>

//       {/* Professional Mobile Bottom Navigation Bar */}
//       <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 bg-[#050B1E]/90 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-2xl px-2 py-2 flex justify-around items-center">
//         {/* Active: Dashboard */}
//         <Link
//           href="/dashboard"
//           className="relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-blue-500 transition-all duration-200"
//         >
//           <div className="relative">
//             <LayoutDashboard size={20} />
//             <span className="absolute -top-1 -right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
//           </div>
//           <span className="text-[10px] font-semibold tracking-tight">Dashboard</span>
//         </Link>

//         {/* Messages */}
//         <Link
//           href="/messages"
//           className="flex flex-col items-center gap-1 py-1 px-3 text-slate-400 hover:text-slate-200 transition-all duration-200"
//         >
//           <MessageSquare size={20} />
//           <span className="text-[10px] font-medium tracking-tight">Messages</span>
//         </Link>

//         {/* Calls */}
//         <Link
//           href="/calls"
//           className="flex flex-col items-center gap-1 py-1 px-3 text-slate-400 hover:text-slate-200 transition-all duration-200"
//         >
//           <Phone size={20} />
//           <span className="text-[10px] font-medium tracking-tight">Calls</span>
//         </Link>

//         {/* Profile / Settings */}
//         <Link
//           href="/settings"
//           className="flex flex-col items-center gap-1 py-1 px-3 text-slate-400 hover:text-slate-200 transition-all duration-200"
//         >
//           <User size={20} />
//           <span className="text-[10px] font-medium tracking-tight">Profile</span>
//         </Link>
//       </div>
//     </>
//   );
// }





// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import LogoutModal from "@/components/LogoutModal";
// import {
//   LayoutDashboard,
//   Users,
//   UserCheck,
//   Phone,
//   UserPlus,
//   MessageSquare,
//   BarChart3,
//   Settings,
//   Link2,
//   CreditCard,
//   LogOut,
//   ChevronDown,
//   ChevronUp,
//   User,
// } from "lucide-react";

// export default function Sidebar({
//   sidebarOpen,
//   setSidebarOpen,
//   setShowLogoutModal,
// }) {
//   const router = useRouter();
//   const [openDropdown, setOpenDropdown] = useState(null);
//   const [currentRole, setCurrentRole] = useState("user");
//   const [internalLogoutOpen, setInternalLogoutOpen] = useState(false);
//   const [loggingOut, setLoggingOut] = useState(false);

//   // Fetch Role Securely from API Endpoint
//   useEffect(() => {
//     async function fetchUserRole() {
//       try {
//         const res = await fetch("/api/auth/me");
//         const data = await res.json();
//         if (data.success && data.role) {
//           // Normalize role to lowercase (e.g., 'ADMIN' -> 'admin')
//           setCurrentRole(data.role.toLowerCase());
//         }
//       } catch (err) {
//         console.error("Failed to fetch user role:", err);
//       }
//     }

//     fetchUserRole();
//   }, []);

//   const toggleDropdown = (name) => {
//     setOpenDropdown(openDropdown === name ? null : name);
//   };

//   const openLogoutModal = () => {
//     if (setSidebarOpen) setSidebarOpen(false);

//     if (setShowLogoutModal) {
//       setShowLogoutModal(true);
//       return;
//     }

//     setInternalLogoutOpen(true);
//   };

//   const confirmInternalLogout = async () => {
//     setLoggingOut(true);

//     try {
//       localStorage.removeItem("crm_login_time");
//       const response = await fetch("/api/logout", { method: "POST" });
//       const data = await response.json();

//       if (!response.ok) {
//         alert(data?.message || "Logout failed");
//         setLoggingOut(false);
//         setInternalLogoutOpen(false);
//         return;
//       }

//       router.push("/login");
//     } catch (error) {
//       console.error("Logout error:", error);
//       alert("Something went wrong during logout.");
//       setLoggingOut(false);
//       setInternalLogoutOpen(false);
//     }
//   };

//   const menuItems = [
//     {
//       name: "Dashboard",
//       icon: LayoutDashboard,
//       href: "/dashboard",
//       roles: ["admin", "user","staff", "agent"],
//     },
//     {
//       name: "Users",
//       icon: UserCheck,
//       href: "/users",
//       hasDropdown: true,
//       roles: ["admin"],
//       subItems: [
//         { name: "All Users", href: "/users" },
//         { name: "Add New User", href: "/add-new-users" },
//       ],
//     },
//     { name: "Teams", icon: Users, href: "/teams", roles: ["admin"] },
//     {
//       name: "Calls",
//       icon: Phone,
//       href: "/calls",
//       hasDropdown: true,
//       roles: ["admin", "user", "agent","staff"],
//       subItems: [
//         { name: "Call ", href: "/calls" },
//         { name: "Recordings", href: "/calls/recordings" },
//       ],
//     },
//         {
//       name: "Daily task",
//       icon: Users,
//       href: "/staff/task",
//       roles: [ "staff",  "agent"],
//     },
//        {
//       name: " daily leads",
//       icon: Users,
//       href: "/staff/task",
//       roles: [ "staff", "agent"],
//     },
//     {
//       name: "Attendance",
//       icon: UserPlus,
//       href: "/Attendance",
//       hasDropdown: false,
//       roles: ["admin","staff",  "agent"],
    
//     },
//     {
//       name: "Daily Tasks assign",
//       icon: Link2,
//       href: "/daily-tasks",
//       roles: ["admin", ],
//     },
//     {
//       name: "Break",
//       icon: Users,
//       href: "/Break",
//       roles: ["admin", "user","staff",  "agent"],
//     },
//     {
//       name: "Messages",
//       icon: MessageSquare,
//       href: "/messages",
//       roles: ["admin", "user","staff", "agent"],
//     },
//       {
//       name: "Admin Edit",
//       icon: MessageSquare,
//       href: "/messages",
//       roles: ["admin", "user","staff", "agent"],
//     },
//        {
//       name: "Domain Email",
//       icon: MessageSquare,
//       href: "/messages",
//       roles: ["admin", "user","staff", "agent"],
//     },
//            {
//       name: "QA",
//       icon: MessageSquare,
//       href: "/messages",
//       roles: ["admin", "user","staff", "agent"],
//     },

//     {
//       name: "Reports",
//       icon: BarChart3,
//       href: "/reports",
//       roles: ["admin", "user","staff", "agent"],
//     },
//     {
//       name: "Settings",
//       icon: Settings,
//       href: "/settings",
//       roles: ["admin", ],
//     },
//     { name: "Integrations", icon: Link2, href: "/integrations", roles: ["admin"] },
//     // {
//     //   name: "Agents",
//     //   icon: Link2,
//     //   href: "/agents",
//     //   roles: ["admin", "user", "staff", "agent"],
//     // },
//     {
//       name: "Plan & Billing",
//       icon: CreditCard,
//       href: "/billing",
//       roles: ["admin"],
//     },
//   ];

//   // Role match check using array includes
//   const filteredMenuItems = menuItems.filter((item) =>
//     item.roles.includes(currentRole)
//   );

//   return (
//     <>
//       {/* Mobile Backdrop */}
//       {sidebarOpen && (
//         <div
//           onClick={() => setSidebarOpen && setSidebarOpen(false)}
//           className="fixed inset-0 z-40 bg-black backdrop-blur-sm lg:hidden transition-opacity"
//         />
//       )}

//       {/* Sidebar Container */}
//       <aside
//         className={`
//           fixed left-0 top-0 z-50 h-screen w-64 bg-black text-slate-200 flex flex-col justify-between py-4 px-3 transition-transform duration-300 lg:translate-x-0 border-r border-slate-800/50 select-none
//           ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
//         `}
//       >
//         <div className="flex flex-col flex-1 min-h-0">
//           {/* Logo Header */}
//           <div className="flex items-center gap-3 px-3 mb-4 shrink-0">
//             <img
//     src="/uploads/CRM-LOGO-removebg-preview.png"
//     alt="CallCRM Logo"
//     className="w-12 h-12 object-contain "
//   />
//             <span className="font-extrabold text-md tracking-tight text-[#ec3737]">
//                 DIGITAL ORBIT
//             </span>
//           </div>
// {/* Logo Header */}
// {/* <div className="flex items-center justify-center px-3 mb-5 shrink-0">
//   <img
//     src="/Digital_Orbit_logo_in_white-removebg-preview-removebg-preview.webp"
//     alt="CallCRM Logo"
//     className="w-12 h-12 object-contain"
//   />
// </div> */}
//           {/* Navigation Menu */}
//           <nav className="flex-1 space-y-1 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
//             {filteredMenuItems.map((item) => {
//               const Icon = item.icon;
//               const isDropdownOpen = openDropdown === item.name;

//               return (
//                 <div key={item.name}>
//                   {item.hasDropdown ? (
//                     <button
//                       type="button"
//                       onClick={() => toggleDropdown(item.name)}
//                       className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-all duration-200"
//                     >
//                       <div className="flex items-center gap-2.5">
//                         <Icon size={16} className="shrink-0" />
//                         <span>{item.name}</span>
//                       </div>
//                       {isDropdownOpen ? (
//                         <ChevronUp size={14} className="text-slate-400" />
//                       ) : (
//                         <ChevronDown size={14} className="text-slate-400" />
//                       )}
//                     </button>
//                   ) : (
//                     <Link
//                       href={item.href}
//                       onClick={() => setSidebarOpen && setSidebarOpen(false)}
//                       className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-all duration-200"
//                     >
//                       <Icon size={16} className="shrink-0" />
//                       <span>{item.name}</span>
//                     </Link>
//                   )}

//                   {/* Submenu Options */}
//                   {item.hasDropdown && isDropdownOpen && (
//                     <div className="pl-8 mt-1 space-y-0.5">
//                       {item.subItems.map((sub) => (
//                         <Link
//                           key={sub.name}
//                           href={sub.href}
//                           onClick={() => setSidebarOpen && setSidebarOpen(false)}
//                           className="block py-1 px-2 text-[11px] text-slate-400 hover:text-white transition rounded-lg hover:bg-white/5"
//                         >
//                           {sub.name}
//                         </Link>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </nav>
//         </div>

//         {/* Bottom Logout Button */}
//         <div className="pt-2 mt-2 border-t border-slate-800/60 px-1 shrink-0">
//           <button
//             type="button"
//             onClick={() => {
//               openLogoutModal();
//             }}
//             className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition duration-200 cursor-pointer"
//           >
//             <div className="w-5 h-5 rounded-full border border-rose-500/40 flex items-center justify-center shrink-0">
//               <LogOut size={11} className="text-rose-500 ml-0.5" />
//             </div>
//             <span>Logout</span>
//           </button>
//         </div>
//       </aside>

//       {/* Mobile Bottom Navigation Bar */}
//       <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 bg-[#050B1E]/90 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-2xl px-2 py-2 flex justify-around items-center">
//         <Link
//           href="/dashboard"
//           className="flex flex-col items-center gap-1 py-1 px-3 text-blue-500 transition-all duration-200"
//         >
//           <LayoutDashboard size={20} />
//           <span className="text-[10px] font-semibold">Dashboard</span>
//         </Link>

//         <Link
//           href="/messages"
//           className="flex flex-col items-center gap-1 py-1 px-3 text-slate-400 hover:text-slate-200 transition-all duration-200"
//         >
//           <MessageSquare size={20} />
//           <span className="text-[10px] font-medium">Messages</span>
//         </Link>

//         <Link
//           href="/calls"
//           className="flex flex-col items-center gap-1 py-1 px-3 text-slate-400 hover:text-slate-200 transition-all duration-200"
//         >
//           <Phone size={20} />
//           <span className="text-[10px] font-medium">Calls</span>
//         </Link>

//         <Link
//           href="/settings"
//           className="flex flex-col items-center gap-1 py-1 px-3 text-slate-400 hover:text-slate-200 transition-all duration-200"
//         >
//           <User size={20} />
//           <span className="text-[10px] font-medium">Profile</span>
//         </Link>

//         <button
//           type="button"
//           onClick={openLogoutModal}
//           aria-label="Logout"
//           className="flex flex-col items-center gap-1 py-1 px-3 text-rose-500 hover:text-rose-400 transition-all duration-200"
//         >
//           <LogOut size={20} />
//           <span className="text-[10px] font-medium">Logout</span>
//         </button>
//       </div>

//       {!setShowLogoutModal && (
//         <LogoutModal
//           show={internalLogoutOpen}
//           loggingOut={loggingOut}
//           onCancel={() => setInternalLogoutOpen(false)}
//           onConfirm={confirmInternalLogout}
//         />
//       )}
//     </>
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

import {
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";

import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

// =============================================================
// CONSTANTS
// =============================================================

const CALIFORNIA_TIMEZONE = "America/Los_Angeles";

// =============================================================
// MAIN PAGE
// =============================================================

export default function BreaksPage() {
  const router = useRouter();

  // ===========================================================
  // CURRENT USER
  // ===========================================================

  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(true);

  // ===========================================================
  // BREAK HISTORY
  // ===========================================================

  const [breakHistory, setBreakHistory] = useState([]);

  const [breakStats, setBreakStats] = useState({
    total: 0,
    namaz: 0,
    lunch: 0,
    shortBreak: 0,
    washroom: 0,
    other: 0,
  });

  const [historyLoading, setHistoryLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  // ===========================================================
  // FILTERS
  // ===========================================================

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] =
    useState("All");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [showFilters, setShowFilters] =
    useState(false);

  // ===========================================================
  // IS ADMIN
  // ===========================================================

  const isAdmin = useMemo(() => {
    return (
      String(currentUser?.role || "")
        .trim()
        .toLowerCase() === "admin"
    );
  }, [currentUser]);

  // ===========================================================
  // FETCH CURRENT USER
  // ===========================================================

  const fetchCurrentUser = useCallback(
    async () => {
      try {
        const response = await fetch(
          "/api/auth/me",
          {
            cache: "no-store",
            credentials: "include",
            headers: {
              "Cache-Control": "no-cache",
            },
          }
        );

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
        console.error(
          "Current user fetch error:",
          error
        );
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  // ===========================================================
  // FETCH BREAK HISTORY
  // ===========================================================

  const fetchBreakHistory = useCallback(
    async (isRefresh = false) => {
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
            credentials: "include",
            headers: {
              "Cache-Control":
                "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        );

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (response.status === 403) {
          console.error(
            "Break history access denied."
          );

          setBreakHistory([]);
          return;
        }

        const data = await response.json();

        if (data?.success) {
          setBreakHistory(
            Array.isArray(data.breaks)
              ? data.breaks
              : []
          );

          setBreakStats({
            total: Number(
              data?.stats?.total || 0
            ),

            namaz: Number(
              data?.stats?.namaz || 0
            ),

            lunch: Number(
              data?.stats?.lunch || 0
            ),

            shortBreak: Number(
              data?.stats?.shortBreak || 0
            ),

            washroom: Number(
              data?.stats?.washroom || 0
            ),

            other: Number(
              data?.stats?.other || 0
            ),
          });
        } else {
          setBreakHistory([]);

          setBreakStats({
            total: 0,
            namaz: 0,
            lunch: 0,
            shortBreak: 0,
            washroom: 0,
            other: 0,
          });
        }
      } catch (error) {
        console.error(
          "Break history fetch error:",
          error
        );
      } finally {
        setHistoryLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );

  // ===========================================================
  // INITIAL LOAD
  // ===========================================================

  useEffect(() => {
    fetchCurrentUser();
    fetchBreakHistory();
  }, [
    fetchCurrentUser,
    fetchBreakHistory,
  ]);

  // ===========================================================
  // AUTO REFRESH EVERY 5 SECONDS
  // ===========================================================

  useEffect(() => {
    const interval = setInterval(() => {
      fetchBreakHistory(true);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchBreakHistory]);

  // ===========================================================
  // CALIFORNIA DATE PARSER
  // ===========================================================

  const parseCaliforniaDateTime = useCallback(
    (value) => {
      if (!value) return null;

      const raw = String(value).trim();

      // -------------------------------------------------------
      // MYSQL DATETIME
      // Example:
      // 2026-09-22 08:30:15
      // -------------------------------------------------------

      const match = raw.match(
        /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/
      );

      if (match) {
        const [
          ,
          year,
          month,
          day,
          hour,
          minute,
          second = "0",
        ] = match;

        /*
         * We need to interpret the DB value as
         * California local time.
         *
         * California can be:
         *
         * PST = UTC-08:00
         * PDT = UTC-07:00
         *
         * So we don't hard-code -07 or -08.
         */

        let utcMs = Date.UTC(
          Number(year),
          Number(month) - 1,
          Number(day),
          Number(hour),
          Number(minute),
          Number(second)
        );

        const formatter =
          new Intl.DateTimeFormat(
            "en-US",
            {
              timeZone:
                CALIFORNIA_TIMEZONE,

              timeZoneName: "longOffset",

              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",

              hourCycle: "h23",
            }
          );

        const parts =
          formatter.formatToParts(
            new Date(utcMs)
          );

        const timezonePart =
          parts.find(
            (part) =>
              part.type ===
              "timeZoneName"
          );

        const offsetMatch =
          timezonePart?.value?.match(
            /GMT([+-])(\d{2}):(\d{2})/
          );

        if (offsetMatch) {
          const sign =
            offsetMatch[1] === "-"
              ? -1
              : 1;

          const offsetMinutes =
            sign *
            (
              Number(
                offsetMatch[2]
              ) *
                60 +
              Number(
                offsetMatch[3]
              )
            );

          utcMs -=
            offsetMinutes *
            60 *
            1000;
        }

        return new Date(utcMs);
      }

      // -------------------------------------------------------
      // ISO / TIMEZONE-AWARE VALUE
      // -------------------------------------------------------

      const date = new Date(raw);

      return Number.isNaN(
        date.getTime()
      )
        ? null
        : date;
    },
    []
  );

  // ===========================================================
  // FORMAT CALIFORNIA DATETIME
  // ===========================================================

  const formatDateTime = useCallback(
    (dateValue) => {
      const date =
        parseCaliforniaDateTime(
          dateValue
        );

      if (!date) return "—";

      return date.toLocaleString(
        "en-US",
        {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone:
            CALIFORNIA_TIMEZONE,
        }
      );
    },
    [parseCaliforniaDateTime]
  );

  // ===========================================================
  // FORMAT CALIFORNIA DATE ONLY
  // ===========================================================

  const formatDateOnly = useCallback(
    (dateValue) => {
      const date =
        parseCaliforniaDateTime(
          dateValue
        );

      if (!date) return "—";

      return date.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "2-digit",
          year: "numeric",
          timeZone:
            CALIFORNIA_TIMEZONE,
        }
      );
    },
    [parseCaliforniaDateTime]
  );

  // ===========================================================
  // FORMAT DATE INPUT LABEL
  // ===========================================================

  const formatDateInputLabel =
    useCallback((value) => {
      if (!value) return "—";

      const [
        year,
        month,
        day,
      ] = String(value).split("-");

      if (
        !year ||
        !month ||
        !day
      ) {
        return "—";
      }

      const date = new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
      );

      return date.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }
      );
    }, []);

  // ===========================================================
  // FORMAT DURATION
  // ===========================================================

  const formatDuration = useCallback(
    (seconds) => {
      const totalSeconds =
        Number(seconds || 0);

      if (
        !Number.isFinite(
          totalSeconds
        ) ||
        totalSeconds <= 0
      ) {
        return "0m";
      }

      const hours = Math.floor(
        totalSeconds / 3600
      );

      const minutes = Math.floor(
        (totalSeconds % 3600) / 60
      );

      const secs = Math.floor(
        totalSeconds % 60
      );

      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }

      if (minutes > 0) {
        return `${minutes}m ${secs}s`;
      }

      return `${secs}s`;
    },
    []
  );

  // ===========================================================
  // BREAK TYPE ICON
  // ===========================================================

  const getTypeIcon = useCallback(
    (type) => {
      const value = String(
        type || ""
      ).toLowerCase();

      if (
        value.includes("namaz") ||
        value.includes("prayer")
      ) {
        return Moon;
      }

      if (
        value.includes("lunch") ||
        value.includes("meal")
      ) {
        return Utensils;
      }

      if (
        value.includes(
          "short break"
        ) ||
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
    },
    []
  );

  // ===========================================================
  // BREAK TYPE STYLE
  // ===========================================================

  const getTypeStyles = useCallback(
    (type) => {
      const value = String(
        type || ""
      ).toLowerCase();

      if (
        value.includes("namaz") ||
        value.includes("prayer")
      ) {
        return {
          bg: "bg-indigo-50",
          text: "text-indigo-700",
          border:
            "border-indigo-100",
        };
      }

      if (
        value.includes("lunch") ||
        value.includes("meal")
      ) {
        return {
          bg: "bg-orange-50",
          text: "text-orange-700",
          border:
            "border-orange-100",
        };
      }

      if (
        value.includes(
          "short break"
        ) ||
        value.includes("shortbreak")
      ) {
        return {
          bg: "bg-teal-50",
          text: "text-teal-700",
          border:
            "border-teal-100",
        };
      }

      if (
        value.includes("washroom") ||
        value.includes("bathroom")
      ) {
        return {
          bg: "bg-cyan-50",
          text: "text-cyan-700",
          border:
            "border-cyan-100",
        };
      }

      if (
        value.includes("coffee") ||
        value.includes("tea")
      ) {
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border:
            "border-amber-100",
        };
      }

      return {
        bg: "bg-slate-50",
        text: "text-slate-700",
        border:
          "border-slate-200",
      };
    },
    []
  );

  // ===========================================================
  // ACTIVE BREAK
  // ===========================================================

  const isActiveBreak = useCallback(
    (item) => {
      return (
        !item?.ended_at ||
        item?.status === "active" ||
        item?.is_active === true
      );
    },
    []
  );

  // ===========================================================
  // FILTERED BREAK HISTORY
  //
  // ADMIN:
  // ALL USERS
  //
  // NORMAL USER:
  // ONLY OWN RECORDS
  // ===========================================================

  const filteredBreakHistory =
    useMemo(() => {
      let result = [
        ...breakHistory,
      ];

      // -------------------------------------------------------
      // NORMAL USER → ONLY OWN RECORDS
      // ADMIN → EVERYTHING
      // -------------------------------------------------------

      if (
        !isAdmin &&
        currentUser?.id
      ) {
        const currentUserId =
          String(
            currentUser.id
          );

        result = result.filter(
          (item) => {
            const itemUserId =
              item.user_id ??
              item.userId ??
              item.employee_id ??
              item.employeeId;

            if (
              itemUserId ===
                undefined ||
              itemUserId === null
            ) {
              return false;
            }

            return (
              String(
                itemUserId
              ) === currentUserId
            );
          }
        );
      }

      // -------------------------------------------------------
      // SEARCH
      // -------------------------------------------------------

      if (search.trim()) {
        const searchValue =
          search
            .trim()
            .toLowerCase();

        result =
          result.filter(
            (item) => {
              const employeeName =
                String(
                  item.employee_name ||
                    item.user_name ||
                    item.name ||
                    ""
                ).toLowerCase();

              const email =
                String(
                  item.employee_email ||
                    item.user_email ||
                    item.email ||
                    ""
                ).toLowerCase();

              const team =
                String(
                  item.team ||
                    item.department ||
                    item.team_name ||
                    ""
                ).toLowerCase();

              const type =
                String(
                  item.break_type ||
                    item.type ||
                    item.status ||
                    ""
                ).toLowerCase();

              return (
                employeeName.includes(
                  searchValue
                ) ||
                email.includes(
                  searchValue
                ) ||
                team.includes(
                  searchValue
                ) ||
                type.includes(
                  searchValue
                )
              );
            }
          );
      }

      // -------------------------------------------------------
      // BREAK TYPE
      // -------------------------------------------------------

      if (
        typeFilter !== "All"
      ) {
        result =
          result.filter(
            (item) => {
              const type =
                String(
                  item.break_type ||
                    item.type ||
                    item.status ||
                    ""
                ).toLowerCase();

              return (
                type ===
                typeFilter.toLowerCase()
              );
            }
          );
      }

      // -------------------------------------------------------
      // CALIFORNIA DATE FILTER
      // -------------------------------------------------------

      if (
        startDate ||
        endDate
      ) {
        result =
          result.filter(
            (item) => {
              if (
                !item.started_at
              ) {
                return false;
              }

              const date =
                parseCaliforniaDateTime(
                  item.started_at
                );

              if (!date) {
                return false;
              }

              const californiaDate =
                date.toLocaleDateString(
                  "en-CA",
                  {
                    timeZone:
                      CALIFORNIA_TIMEZONE,
                  }
                );

              if (
                startDate &&
                californiaDate <
                  startDate
              ) {
                return false;
              }

              if (
                endDate &&
                californiaDate >
                  endDate
              ) {
                return false;
              }

              return true;
            }
          );
      }

      return result;
    }, [
      breakHistory,
      currentUser,
      isAdmin,
      search,
      typeFilter,
      startDate,
      endDate,
      parseCaliforniaDateTime,
    ]);

  // ===========================================================
  // VISIBLE STATS
  //
  // ADMIN → ALL
  // USER → OWN
  // ===========================================================

  const visibleBreakStats =
    useMemo(() => {
      const stats = {
        total: 0,
        namaz: 0,
        lunch: 0,
        shortBreak: 0,
        washroom: 0,
        other: 0,
      };

      filteredBreakHistory.forEach(
        (item) => {
          stats.total += 1;

          const type =
            String(
              item.break_type ||
                item.type ||
                item.status ||
                ""
            ).toLowerCase();

          if (
            type.includes("namaz") ||
            type.includes("prayer")
          ) {
            stats.namaz += 1;
          } else if (
            type.includes("lunch") ||
            type.includes("meal")
          ) {
            stats.lunch += 1;
          } else if (
            type.includes(
              "short break"
            ) ||
            type.includes(
              "shortbreak"
            )
          ) {
            stats.shortBreak += 1;
          } else if (
            type.includes(
              "washroom"
            ) ||
            type.includes(
              "bathroom"
            )
          ) {
            stats.washroom += 1;
          } else {
            stats.other += 1;
          }
        }
      );

      return stats;
    }, [filteredBreakHistory]);

  // ===========================================================
  // TOTAL FILTERED SECONDS
  // ===========================================================

  const totalFilteredSeconds =
    useMemo(() => {
      return filteredBreakHistory.reduce(
        (total, item) => {
          const seconds =
            Number(
              item?.duration_seconds
            );

          if (
            !Number.isFinite(
              seconds
            )
          ) {
            return total;
          }

          return (
            total + seconds
          );
        },
        0
      );
    }, [filteredBreakHistory]);

  // ===========================================================
  // TOTAL FILTERED HOURS
  // ===========================================================

  const totalFilteredHours =
    useMemo(() => {
      const totalSeconds =
        totalFilteredSeconds;

      const hours = Math.floor(
        totalSeconds / 3600
      );

      const minutes = Math.floor(
        (totalSeconds % 3600) / 60
      );

      if (
        hours === 0 &&
        minutes === 0
      ) {
        const seconds =
          Math.floor(
            totalSeconds % 60
          );

        if (seconds > 0) {
          return `${seconds}s`;
        }

        return "0h 0m";
      }

      return `${hours}h ${minutes}m`;
    }, [totalFilteredSeconds]);

  // ===========================================================
  // CLEAR FILTERS
  // ===========================================================

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("All");
    setStartDate("");
    setEndDate("");
  };

  const hasFilters =
    Boolean(search.trim()) ||
    typeFilter !== "All" ||
    Boolean(startDate) ||
    Boolean(endDate);

  // ===========================================================
  // DATE RANGE TEXT
  // ===========================================================

  const dateRangeText =
    useMemo(() => {
      if (
        startDate &&
        endDate
      ) {
        return `${formatDateInputLabel(
          startDate
        )} → ${formatDateInputLabel(
          endDate
        )}`;
      }

      if (startDate) {
        return `From ${formatDateInputLabel(
          startDate
        )}`;
      }

      if (endDate) {
        return `Until ${formatDateInputLabel(
          endDate
        )}`;
      }

      return "All dates";
    }, [
      startDate,
      endDate,
      formatDateInputLabel,
    ]);

  // ===========================================================
  // RENDER
  // ===========================================================

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar />

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="min-h-screen lg:pl-[270px] w-full">
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

                  {isAdmin && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />

                      <span className="text-xs font-semibold text-indigo-700">
                        Admin View
                      </span>
                    </div>
                  )}

                  {!isAdmin &&
                    currentUser && (
                      <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 border border-slate-200 px-3 py-1.5">
                        <Users className="w-4 h-4 text-slate-500" />

                        <span className="text-xs font-semibold text-slate-600">
                          My Breaks
                        </span>
                      </div>
                    )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Break History
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  {isAdmin
                    ? "View and monitor all employee break activity"
                    : "View your break activity"}
                </p>
              </div>

              {/* REFRESH */}

              <button
                type="button"
                onClick={() =>
                  fetchBreakHistory(true)
                }
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />

                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </button>
            </div>
          </div>

          {/* =================================================
              STATS
          ================================================== */}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 mb-6">

            <StatCard
              title="Total Breaks"
              value={
                visibleBreakStats.total
              }
              icon={Activity}
              description={
                isAdmin
                  ? "All break records"
                  : "Your break records"
              }
              iconClass="bg-rose-50 text-rose-600"
            />

            <StatCard
              title="Namaz"
              value={
                visibleBreakStats.namaz
              }
              icon={Moon}
              description="Prayer breaks"
              iconClass="bg-indigo-50 text-indigo-600"
            />

            <StatCard
              title="Lunch"
              value={
                visibleBreakStats.lunch
              }
              icon={Utensils}
              description="Lunch breaks"
              iconClass="bg-orange-50 text-orange-600"
            />

            <StatCard
              title="Short Break"
              value={
                visibleBreakStats.shortBreak
              }
              icon={Clock3}
              description="Short breaks"
              iconClass="bg-teal-50 text-teal-600"
            />

            <StatCard
              title="Washroom"
              value={
                visibleBreakStats.washroom
              }
              icon={Bath}
              description="Washroom breaks"
              iconClass="bg-cyan-50 text-cyan-600"
            />

            <StatCard
              title="Other"
              value={
                visibleBreakStats.other
              }
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
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder={
                      isAdmin
                        ? "Search employee, team or break type..."
                        : "Search your break type..."
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#741C29] focus:bg-white focus:ring-2 focus:ring-[#741C29]/10"
                  />
                </div>

                {/* MOBILE FILTER */}

                <button
                  type="button"
                  onClick={() =>
                    setShowFilters(
                      (prev) => !prev
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 xl:hidden"
                >
                  <Filter className="h-4 w-4" />

                  Filters

                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      showFilters
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {/* FILTERS */}

                <div
                  className={`${
                    showFilters
                      ? "flex"
                      : "hidden"
                  } flex-col gap-3 xl:flex xl:flex-row xl:items-center`}
                >

                  {/* TYPE */}

                  <div className="relative">
                    <select
                      value={typeFilter}
                      onChange={(e) =>
                        setTypeFilter(
                          e.target.value
                        )
                      }
                      className="w-full min-w-[160px] appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-[#741C29] focus:bg-white focus:ring-2 focus:ring-[#741C29]/10"
                    >
                      <option value="All">
                        All Break Types
                      </option>

                      <option value="Namaz">
                        Namaz
                      </option>

                      <option value="Lunch">
                        Lunch
                      </option>

                      <option value="Short Break">
                        Short Break
                      </option>

                      <option value="Washroom">
                        Washroom
                      </option>

                      <option value="Other">
                        Other
                      </option>
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
                        setStartDate(
                          e.target.value
                        )
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
                      min={
                        startDate ||
                        undefined
                      }
                      onChange={(e) =>
                        setEndDate(
                          e.target.value
                        )
                      }
                      className="w-full min-w-[165px] rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#741C29] focus:bg-white focus:ring-2 focus:ring-[#741C29]/10"
                      title="End Date"
                    />
                  </div>

                  {/* CLEAR */}

                  {hasFilters && (
                    <button
                      type="button"
                      onClick={
                        clearFilters
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <X className="h-4 w-4" />

                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* DATE RANGE */}

              {(startDate ||
                endDate) && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">

                  <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <CalendarDays className="h-3.5 w-3.5" />

                    <span>
                      Date Range:{" "}
                      {dateRangeText}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    <Clock3 className="h-3.5 w-3.5" />

                    <span>
                      Total Hours:{" "}
                      {
                        totalFilteredHours
                      }
                    </span>
                  </div>

                  <div className="text-xs text-slate-400">
                    {
                      filteredBreakHistory.length
                    }{" "}
                    record
                    {filteredBreakHistory.length !==
                    1
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

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6">

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Break Records
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  {
                    filteredBreakHistory.length
                  }{" "}
                  record
                  {filteredBreakHistory.length !==
                  1
                    ? "s"
                    : ""}
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                <Users className="h-4 w-4 text-slate-400" />

                <span className="text-xs font-semibold text-slate-600">
                  {
                    filteredBreakHistory.length
                  }{" "}
                  Records
                </span>
              </div>
            </div>

            {/* LOADING */}

            {historyLoading &&
            !breakHistory.length ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-[#741C29]" />

                  <p className="text-sm text-slate-500">
                    Loading break history...
                  </p>
                </div>
              </div>
            ) : filteredBreakHistory.length ===
              0 ? (
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
                    onClick={
                      clearFilters
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#741C29] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5f1722]"
                  >
                    <X className="h-4 w-4" />

                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* DESKTOP */}

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
                        (
                          item,
                          index
                        ) => (
                          <BreakTableRow
                            key={
                              item.id ||
                              item.break_id ||
                              `${item.started_at}-${index}`
                            }
                            item={item}
                            formatDateTime={
                              formatDateTime
                            }
                            formatDuration={
                              formatDuration
                            }
                            getTypeIcon={
                              getTypeIcon
                            }
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

                {/* MOBILE */}

                <div className="md:hidden divide-y divide-slate-100">

                  {filteredBreakHistory.map(
                    (
                      item,
                      index
                    ) => (
                      <BreakMobileCard
                        key={
                          item.id ||
                          item.break_id ||
                          `${item.started_at}-${index}`
                        }
                        item={item}
                        formatDateTime={
                          formatDateTime
                        }
                        formatDateOnly={
                          formatDateOnly
                        }
                        formatDuration={
                          formatDuration
                        }
                        getTypeIcon={
                          getTypeIcon
                        }
                        getTypeStyles={
                          getTypeStyles
                        }
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

          {/* FOOTER */}

          <div className="mt-4 flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

            <span>
              Data automatically refreshes
              every 5 seconds.
            </span>

            <span>
              Showing{" "}
              {
                filteredBreakHistory.length
              }{" "}
              of{" "}
              {breakHistory.length}{" "}
              records
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

function TableHeading({
  children,
  align = "left",
}) {
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

  const TypeIcon =
    getTypeIcon(breakType);

  const styles =
    getTypeStyles(breakType);

  const active =
    isActiveBreak(item);

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

          {formatDateTime(
            item.started_at
          )}
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
            {formatDateTime(
              item.ended_at
            )}
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

  const TypeIcon =
    getTypeIcon(breakType);

  const styles =
    getTypeStyles(breakType);

  const active =
    isActiveBreak(item);

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
          {formatDateOnly(
            item.started_at
          )}
        </span>
      </div>

      {/* TIME GRID */}

      <div className="mt-4 grid grid-cols-2 gap-3">

        <div className="rounded-xl bg-slate-50 p-3">

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Started
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-700">
            {formatDateTime(
              item.started_at
            )}
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
              {formatDateTime(
                item.ended_at
              )}
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