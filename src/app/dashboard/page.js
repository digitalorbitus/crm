


// "use client";

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
//   Menu,
//   X,
//   Loader2,
//   AlertTriangle,
//   Clock,
//   Calendar,
//   ChevronDown,
//   ChevronUp,
// } from "lucide-react";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Sidebar from "@/components/Sidebar";

// export default function DashboardPage() {
//   const router = useRouter();

//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [loggingOut, setLoggingOut] = useState(false);
//   const [showLogoutModal, setShowLogoutModal] = useState(false);
//   const [openDropdown, setOpenDropdown] = useState(null);

//   const toggleDropdown = (name) => {
//     setOpenDropdown(openDropdown === name ? null : name);
//   };

//   // Helper Function for Consistent Formatting
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

//     return {
//       day,
//       date,
//       time,
//       fullString: `${day}, ${date} at ${time}`,
//     };
//   };

//   // State initialized with Current Date/Time immediately
//   const [loginDetails, setLoginDetails] = useState(() =>
//     formatDateTime(new Date())
//   );

//   useEffect(() => {
//     try {
//       let savedLoginTime = localStorage.getItem("crm_login_time");

//       if (!savedLoginTime) {
//         const now = new Date();
//         savedLoginTime = now.toISOString();
//         localStorage.setItem("crm_login_time", savedLoginTime);
//       }

//       const loginDateObj = new Date(savedLoginTime);
//       setLoginDetails(formatDateTime(loginDateObj));
//     } catch (e) {
//       console.error("Storage access error:", e);
//     }
//   }, []);

//   // Menu items exact match with UI Image & Dropdowns
//   const menuItems = [
//     {
//       name: "Dashboard",
//       icon: LayoutDashboard,
//       href: "/dashboard",
//       active: true,
//     },
//     {
//       name: "Users",
//       icon: UserCheck,
//       href: "/users",
//       hasDropdown: true,
//       subItems: [
//         { name: "All Users", href: "/users" },
//         { name: "Roles & Permissions", href: "/users/roles" },
//       ],
//     },
//     {
//       name: "Teams",
//       icon: Users,
//       href: "/teams",
//     },
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
//     {
//       name: "Customers",
//       icon: Users,
//       href: "/customers",
//     },
//     {
//       name: "Messages",
//       icon: MessageSquare,
//       href: "/messages",
//     },
//     {
//       name: "Reports",
//       icon: BarChart3,
//       href: "/reports",
//     },
//     {
//       name: "Settings",
//       icon: Settings,
//       href: "/settings",
//     },
//     {
//       name: "Integrations",
//       icon: Link2,
//       href: "/integrations",
//     },
//     {
//       name: "Plan & Billing",
//       icon: CreditCard,
//       href: "/billing",
//     },
//   ];

//   const stats = [
//     {
//       title: "Total Leads",
//       value: "1,248",
//       change: "+12.5%",
//       icon: UserPlus,
//     },
//     {
//       title: "Total Calls",
//       value: "3,842",
//       change: "+8.2%",
//       icon: Phone,
//     },
//     {
//       title: "Contacts",
//       value: "856",
//       change: "+5.4%",
//       icon: Users,
//     },
//     {
//       title: "Conversion Rate",
//       value: "24.8%",
//       change: "+3.1%",
//       icon: BarChart3,
//     },
//   ];

//   const handleConfirmLogout = async () => {
//     setLoggingOut(true);

//     try {
//       localStorage.removeItem("crm_login_time");

//       const response = await fetch("/api/logout", {
//         method: "POST",
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         alert(data.message || "Logout failed");
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

//   return (
//     <div className="min-h-screen bg-slate-100 relative">
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

//       {/* EXACT MATCH SIDEBAR */}
// {/* SIDEBAR COMPONENT */}
//       <Sidebar
//         sidebarOpen={sidebarOpen}
//         setSidebarOpen={setSidebarOpen}
//         setShowLogoutModal={setShowLogoutModal}
//       />

//       {/* MODAL IMPLEMENTATION */}
//       {showLogoutModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
//             <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
//               <AlertTriangle size={24} />
//             </div>

//             <div className="text-center space-y-1">
//               <h3 className="text-lg font-bold text-slate-900">Log Out?</h3>
//               <p className="text-sm text-slate-500">
//                 Are you sure you want to logout?
//               </p>
//             </div>

//             <div className="flex items-center gap-3 pt-2">
//               <button
//                 type="button"
//                 disabled={loggingOut}
//                 onClick={() => setShowLogoutModal(false)}
//                 className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 disabled={loggingOut}
//                 onClick={handleConfirmLogout}
//                 className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
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

//       {/* MAIN CONTENT */}
//       <main className="lg:ml-64 min-h-screen">
//         {/* TOP BAR */}
//         <div className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
//           <div>
//             <h1 className="text-lg font-bold text-slate-900">Dashboard</h1>
//             <p className="text-xs text-slate-500">CRM Overview</p>
//           </div>

//           {/* USER PROFILE + LOGIN DATE, DAY & TIME */}
//           <div className="flex items-center gap-3">
//             <div className="text-right">
//               <p className="text-xs sm:text-sm font-semibold text-slate-800">
//                 Admin
//               </p>
//               <p className="hidden sm:block text-xs text-slate-500">
//                 admin@crm.com
//               </p>

//               <div className="flex items-center justify-end gap-1 text-[10px] sm:text-[11px] font-semibold text-blue-600 mt-0.5">
//                 <Clock size={11} className="shrink-0" />
//                 <span>{loginDetails.fullString}</span>
//               </div>
//             </div>

//             <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-md shadow-blue-600/20 shrink-0">
//               A
//             </div>
//           </div>
//         </div>

//         {/* PAGE CONTENT */}
//         <div className="p-4 sm:p-6">
//           {/* Welcome Header */}
//           <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//             <div>
//               <h2 className="text-2xl font-bold text-slate-900">
//                 Good evening, Admin
//               </h2>
//               <p className="text-sm text-slate-500 mt-1">
//                 Here's what's happening with your CRM today.
//               </p>
//             </div>

//             <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700 font-medium self-start sm:self-center shadow-sm">
//               <Calendar size={14} className="text-blue-600 shrink-0" />
//               <span>
//                 Logged in: <strong>{loginDetails.day}</strong>,{" "}
//                 {loginDetails.date} at {loginDetails.time}
//               </span>
//             </div>
//           </div>

//           {/* STATS GRID */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
//             {stats.map((stat) => {
//               const Icon = stat.icon;

//               return (
//                 <div
//                   key={stat.title}
//                   className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition"
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
//                       <Icon size={21} />
//                     </div>

//                     <span className="text-xs font-semibold text-green-600">
//                       {stat.change}
//                     </span>
//                   </div>

//                   <p className="text-sm text-slate-500 mt-5">{stat.title}</p>

//                   <h3 className="text-2xl font-bold text-slate-900 mt-1">
//                     {stat.value}
//                   </h3>
//                 </div>
//               );
//             })}
//           </div>

//           {/* RECENT CALLS TABLE */}
//           <div className="mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
//             <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
//               <div>
//                 <h3 className="font-bold text-slate-900">Recent Calls</h3>
//                 <p className="text-xs text-slate-500 mt-1">
//                   Latest call activity
//                 </p>
//               </div>

//               <a
//                 href="/calls"
//                 className="text-sm font-medium text-blue-600 hover:text-blue-700"
//               >
//                 View all
//               </a>
//             </div>

//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-slate-50">
//                   <tr>
//                     <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">
//                       Contact
//                     </th>
//                     <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">
//                       Phone
//                     </th>
//                     <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">
//                       Status
//                     </th>
//                     <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">
//                       Time
//                     </th>
//                   </tr>
//                 </thead>

//                 <tbody className="divide-y divide-slate-100">
//                   {[
//                     ["John Smith", "+1 555 123 4567", "Completed", "10 min ago"],
//                     ["Sarah Wilson", "+1 555 987 6543", "Missed", "25 min ago"],
//                     ["Mike Johnson", "+1 555 456 7890", "Completed", "1 hour ago"],
//                     ["Emily Brown", "+1 555 321 6549", "Pending", "2 hours ago"],
//                   ].map((call, index) => (
//                     <tr key={index} className="hover:bg-slate-50 transition">
//                       <td className="px-5 py-4 font-medium text-slate-800 whitespace-nowrap">
//                         {call[0]}
//                       </td>
//                       <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
//                         {call[1]}
//                       </td>
//                       <td className="px-5 py-4">
//                         <span
//                           className={`
//                             px-2.5 py-1 rounded-full text-xs font-medium
//                             ${
//                               call[2] === "Completed"
//                                 ? "bg-green-50 text-green-600"
//                                 : call[2] === "Missed"
//                                 ? "bg-red-50 text-red-600"
//                                 : "bg-yellow-50 text-yellow-600"
//                             }
//                           `}
//                         >
//                           {call[2]}
//                         </span>
//                       </td>
//                       <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
//                         {call[3]}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* QUICK ACTIONS */}
//           <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
//             <a
//               href="/leads"
//               className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition"
//             >
//               <UserPlus className="text-blue-600" size={24} />
//               <h3 className="font-bold text-slate-900 mt-4">Add New Lead</h3>
//               <p className="text-xs text-slate-500 mt-1">
//                 Create and manage new leads
//               </p>
//             </a>

//             <a
//               href="/contacts"
//               className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition"
//             >
//               <Users className="text-blue-600" size={24} />
//               <h3 className="font-bold text-slate-900 mt-4">Contacts</h3>
//               <p className="text-xs text-slate-500 mt-1">
//                 View your customer contacts
//               </p>
//             </a>

//             <a
//               href="/calls"
//               className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition"
//             >
//               <Phone className="text-blue-600" size={24} />
//               <h3 className="font-bold text-slate-900 mt-4">Start Calling</h3>
//               <p className="text-xs text-slate-500 mt-1">
//                 Manage your call activity
//               </p>
//             </a>
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
  Phone,
  UserPlus,
  BarChart3,
  Menu,
  X,
  Loader2,
  AlertTriangle,
  Clock,
  Calendar,
  ChevronDown,
  PhoneIncoming,
  PhoneOff,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function DashboardPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Helper Function for Consistent Date/Time Formatting
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

    return {
      day,
      date,
      time,
      fullString: `${day}, ${date} at ${time}`,
    };
  };

  // State initialized with Current Date/Time immediately
  const [loginDetails, setLoginDetails] = useState(() =>
    formatDateTime(new Date())
  );
  // Dynamic User State
const [currentUser, setCurrentUser] = useState({
  name: "User",
  email: "Loading...",
  role: "Agent",
  avatar: null,
});

// LocalStorage se user fetch karein
useEffect(() => {
  try {
    const storedUser = localStorage.getItem("crm_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser({
        name: parsedUser.name || parsedUser.fullName || "User",
        email: parsedUser.email || "",
        role: parsedUser.role || "Agent",
        avatar: parsedUser.avatar || null, // Agar photo hai toh
      });
    }
  } catch (error) {
    console.error("Error loading user profile:", error);
  }
}, []);

// Dynamic Avatar Initial (First Letter)
const userInitial = currentUser.name
  ? currentUser.name.charAt(0).toUpperCase()
  : currentUser.email
  ? currentUser.email.charAt(0).toUpperCase()
  : "U";

  useEffect(() => {
    try {
      let savedLoginTime = localStorage.getItem("crm_login_time");

      if (!savedLoginTime) {
        const now = new Date();
        savedLoginTime = now.toISOString();
        localStorage.setItem("crm_login_time", savedLoginTime);
      }

      const loginDateObj = new Date(savedLoginTime);
      setLoginDetails(formatDateTime(loginDateObj));
    } catch (e) {
      console.error("Storage access error:", e);
    }
  }, []);

  // Stats Data matching UI Image Layout
  const stats = [
    {
      title: "Total Calls",
      value: "1,250",
      change: "18%",
      isPositive: true,
      period: "from yesterday",
      icon: Phone,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      title: "Answered Calls",
      value: "980",
      change: "15%",
      isPositive: true,
      period: "from yesterday",
      icon: PhoneIncoming,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
    {
      title: "Missed Calls",
      value: "270",
      change: "7%",
      isPositive: false,
      period: "from yesterday",
      icon: PhoneOff,
      bgColor: "bg-rose-50",
      iconColor: "text-rose-500",
    },
    {
      title: "Total Talk Time",
      value: "45h 20m",
      change: "20%",
      isPositive: true,
      period: "from yesterday",
      icon: Clock,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-500",
    },
  ];

  // Top Staff Data
  const topStaff = [
    { name: "Ahmed Khan", total: 125, answered: 98, missed: 17, talkTime: "04h 32m" },
    { name: "Usman Tariq", total: 118, answered: 92, missed: 26, talkTime: "04h 10m" },
    { name: "Maria Sheikh", total: 110, answered: 85, missed: 25, talkTime: "03h 45m" },
    { name: "Zain Ali", total: 105, answered: 80, missed: 25, talkTime: "03h 20m" },
    { name: "Sara Khan", total: 95, answered: 72, missed: 23, talkTime: "02h 50m" },
  ];

  // Live Activity Data
  const liveActivities = [
    { name: "Ahmed Khan", action: "completed a call", time: "10:15 AM", avatar: "A", color: "bg-blue-600" },
    { name: "Usman Tariq", action: "missed a call", time: "10:14 AM", avatar: "U", color: "bg-indigo-600" },
    { name: "Maria Sheikh", action: "completed a call", time: "10:12 AM", avatar: "M", color: "bg-sky-600" },
    { name: "Zain Ali", action: "completed a call", time: "10:11 AM", avatar: "Z", color: "bg-emerald-600" },
    { name: "Sara Khan", action: "completed a call", time: "10:08 AM", avatar: "S", color: "bg-rose-600" },
  ];

  const handleConfirmLogout = async () => {
    setLoggingOut(true);

    try {
      localStorage.removeItem("crm_login_time");

      const response = await fetch("/api/logout", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Logout failed");
        setLoggingOut(false);
        setShowLogoutModal(false);
        return;
      }

      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Something went wrong during logout.");
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

      {/* EXACT MATCH SIDEBAR COMPONENT */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setShowLogoutModal={setShowLogoutModal}
      />

      {/* MAIN CONTENT */}
      <main className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* TOP BAR WITH LOGIN TIME, DAY & DATE + USER PROFILE */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
  <div>
    <h1 className="text-xl font-extrabold text-slate-900">Dashboard</h1>
    <p className="text-xs text-slate-500 mt-0.5">Call Activity & Performance Analytics</p>
  </div>

  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
    {/* LOGIN DAY, DATE & TIME BADGE */}
    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700 font-medium shadow-sm">
      <Calendar size={14} className="text-blue-600 shrink-0" />
      <span>
        Logged in: <strong>{loginDetails.day}</strong>, {loginDetails.date} at {loginDetails.time}
      </span>
    </div>

    {/* DYNAMIC LOGGED IN USER PROFILE */}
    <div className="flex items-center gap-3 shrink-0">
      {/* AVATAR IMAGE OR INITIAL */}
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-md overflow-hidden">
        {currentUser.avatar ? (
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="bg-gradient-to-tr from-amber-500 to-rose-500 w-full h-full rounded-full flex items-center justify-center uppercase">
            {userInitial}
          </span>
        )}
      </div>

      <div className="text-left hidden md:block">
        <div className="flex items-center gap-2">
          {/* DYNAMIC USER NAME */}
          <p className="text-xs sm:text-sm font-bold text-slate-900 leading-none capitalize">
            {currentUser.name}
          </p>

          {/* DYNAMIC ROLE BADGE */}
          <span
            className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md border ${
              currentUser.role?.toLowerCase() === "admin"
                ? "bg-purple-50 text-purple-700 border-purple-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            {currentUser.role}
          </span>

          <ChevronDown size={13} className="text-slate-400" />
        </div>

        {/* DYNAMIC LOGGED IN EMAIL */}
        <p className="text-[11px] text-slate-400 font-medium mt-1">
          {currentUser.email}
        </p>
      </div>
    </div>
  </div>
</div>

        {/* 4 TOP STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    {stat.title}
                  </span>
                  <div
                    className={`w-10 h-10 rounded-full ${stat.bgColor} ${stat.iconColor} flex items-center justify-center shrink-0`}
                  >
                    <Icon size={18} />
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {stat.value}
                  </h3>
                  <div className="flex items-center gap-1 mt-2 text-xs font-semibold">
                    {stat.isPositive ? (
                      <span className="text-emerald-500 flex items-center gap-0.5">
                        <TrendingUp size={13} /> {stat.change}
                      </span>
                    ) : (
                      <span className="text-rose-500 flex items-center gap-0.5">
                        <TrendingDown size={13} /> {stat.change}
                      </span>
                    )}
                    <span className="text-slate-400 font-normal">
                      {stat.period}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Call Trend Line Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Call Trend (Last 7 Days)
              </h3>
            </div>

            {/* SVG Line Chart Representation */}
            <div className="w-full h-56 flex flex-col justify-between relative pt-2">
              <div className="absolute inset-0 flex flex-col justify-between text-[11px] text-slate-300 pointer-events-none">
                <div className="border-b border-slate-100 w-full pb-1">600</div>
                <div className="border-b border-slate-100 w-full pb-1">400</div>
                <div className="border-b border-slate-100 w-full pb-1">200</div>
                <div className="border-b border-slate-100 w-full pb-1">0</div>
              </div>

              {/* Chart Line Path */}
              <div className="h-40 w-full z-10 pt-4">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 500 120"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0,80 Q 40,50 80,70 T 160,30 T 240,70 T 320,50 T 400,35 T 500,10 L 500,120 L 0,120 Z"
                    fill="url(#blueGradient)"
                  />
                  <path
                    d="M 0,80 Q 40,50 80,70 T 160,30 T 240,70 T 320,50 T 400,35 T 500,10"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="500" cy="10" r="4" fill="#3B82F6" />
                </svg>
              </div>

              {/* X-Axis Labels */}
              <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium z-10 pt-2">
                <span>06 Aug</span>
                <span>07 Aug</span>
                <span>08 Aug</span>
                <span>09 Aug</span>
                <span>10 Aug</span>
                <span>11 Aug</span>
                <span>12 Aug</span>
              </div>
            </div>
          </div>

          {/* Call Status Distribution Donut Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-4">
              Call Status Distribution
            </h3>

            <div className="flex flex-col items-center justify-center my-auto">
              {/* Donut Chart with Center Total */}
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-600"
                    strokeDasharray="78.4, 100"
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-rose-500"
                    strokeDasharray="21.6, 100"
                    strokeDashoffset="-78.4"
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-extrabold text-slate-900">
                    1,250
                  </span>
                </div>
              </div>

              {/* Legends */}
              <div className="mt-6 space-y-2.5 w-full max-w-[200px]">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span className="font-medium text-slate-600">Answered</span>
                  </div>
                  <span className="font-bold text-slate-800">980 <span className="font-normal text-slate-400">(78.4%)</span></span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="font-medium text-slate-600">Missed</span>
                  </div>
                  <span className="font-bold text-slate-800">270 <span className="font-normal text-slate-400">(21.6%)</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: TOP STAFF & LIVE ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Top Staff Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Top Staff (By Total Calls)
              </h3>
              <button type="button" className="text-xs font-semibold text-blue-600 hover:underline">
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 font-semibold">
                    <th className="pb-3 font-medium">Staff</th>
                    <th className="pb-3 font-medium">Total Calls</th>
                    <th className="pb-3 font-medium">Answered</th>
                    <th className="pb-3 font-medium">Missed</th>
                    <th className="pb-3 font-medium">Talk Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {topStaff.map((staff, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-bold text-slate-800">{staff.name}</td>
                      <td className="py-3 text-slate-600 font-semibold">{staff.total}</td>
                      <td className="py-3 text-slate-600 font-semibold">{staff.answered}</td>
                      <td className="py-3 text-slate-600 font-semibold">{staff.missed}</td>
                      <td className="py-3 text-slate-600 font-semibold">{staff.talkTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Activity List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Live Activity
                </h3>
                <button type="button" className="text-xs font-semibold text-blue-600 hover:underline">
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {liveActivities.map((act, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full ${act.color} text-white flex items-center justify-center font-bold text-[11px] shrink-0`}
                      >
                        {act.avatar}
                      </div>
                      <p className="text-slate-700">
                        <span className="font-bold text-slate-900">{act.name}</span>{" "}
                        <span className="text-slate-500">{act.action}</span>
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap ml-2">
                      {act.time}
                    </span>
                  </div>
                ))}
              </div>
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