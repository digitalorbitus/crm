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





"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Phone,
  UserPlus,
  MessageSquare,
  BarChart3,
  Settings,
  Link2,
  CreditCard,
  LogOut,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  setShowLogoutModal,
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentRole, setCurrentRole] = useState("user");

  // Fetch Role Securely from API Endpoint
  useEffect(() => {
    async function fetchUserRole() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.success && data.role) {
          // Normalize role to lowercase (e.g., 'ADMIN' -> 'admin')
          setCurrentRole(data.role.toLowerCase());
        }
      } catch (err) {
        console.error("Failed to fetch user role:", err);
      }
    }

    fetchUserRole();
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      roles: ["admin", "user","staff", "agent"],
    },
    {
      name: "Users",
      icon: UserCheck,
      href: "/users",
      hasDropdown: true,
      roles: ["admin"],
      subItems: [
        { name: "All Users", href: "/users" },
        { name: "Add New User", href: "/add-new-users" },
      ],
    },
    { name: "Teams", icon: Users, href: "/teams", roles: ["admin"] },
    {
      name: "Calls",
      icon: Phone,
      href: "/calls",
      hasDropdown: true,
      roles: ["admin", "user", "agent"],
      subItems: [
        { name: "Call ", href: "/calls" },
        { name: "Recordings", href: "/calls/recordings" },
      ],
    },
        {
      name: "Daily staff task",
      icon: Users,
      href: "/staff/task",
      roles: [ "staff",  "agent"],
    },
    
    {
      name: "Leads",
      icon: UserPlus,
      href: "/leads",
      hasDropdown: true,
      roles: ["admin", "user", "agent"],
      subItems: [
        { name: "All Leads", href: "/leads" },
        { name: "Add Lead", href: "/leads/new" },
      ],
    },
    {
      name: "Daily Tasks assign",
      icon: Link2,
      href: "/daily-tasks",
      roles: ["admin", ],
    },
    {
      name: "Customers",
      icon: Users,
      href: "/customers",
      roles: ["admin", "user","staff",  "agent"],
    },
    {
      name: "Messages",
      icon: MessageSquare,
      href: "/messages",
      roles: ["admin", "user","staff", "agent"],
    },
    {
      name: "Reports",
      icon: BarChart3,
      href: "/reports",
      roles: ["admin", "user","staff", "agent"],
    },
    {
      name: "Settings",
      icon: Settings,
      href: "/settings",
      roles: ["admin", ],
    },
    { name: "Integrations", icon: Link2, href: "/integrations", roles: ["admin"] },
    // {
    //   name: "Agents",
    //   icon: Link2,
    //   href: "/agents",
    //   roles: ["admin", "user", "staff", "agent"],
    // },
    {
      name: "Plan & Billing",
      icon: CreditCard,
      href: "/billing",
      roles: ["admin"],
    },
  ];

  // Role match check using array includes
  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(currentRole)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen && setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen w-64 bg-[#050B1E] text-slate-200 flex flex-col justify-between py-4 px-3 transition-transform duration-300 lg:translate-x-0 border-r border-slate-800/50 select-none
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo Header */}
          <div className="flex items-center gap-3 px-3 mb-4 shrink-0">
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 p-[2px] flex items-center justify-center shadow-lg shadow-rose-500/20">
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

          {/* Navigation Menu */}
          <nav className="flex-1 space-y-1 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isDropdownOpen = openDropdown === item.name;

              return (
                <div key={item.name}>
                  {item.hasDropdown ? (
                    <button
                      type="button"
                      onClick={() => toggleDropdown(item.name)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-all duration-200"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className="shrink-0" />
                        <span>{item.name}</span>
                      </div>
                      {isDropdownOpen ? (
                        <ChevronUp size={14} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={14} className="text-slate-400" />
                      )}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen && setSidebarOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-all duration-200"
                    >
                      <Icon size={16} className="shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  )}

                  {/* Submenu Options */}
                  {item.hasDropdown && isDropdownOpen && (
                    <div className="pl-8 mt-1 space-y-0.5">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          onClick={() => setSidebarOpen && setSidebarOpen(false)}
                          className="block py-1 px-2 text-[11px] text-slate-400 hover:text-white transition rounded-lg hover:bg-white/5"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Logout Button */}
        <div className="pt-2 mt-2 border-t border-slate-800/60 px-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (setSidebarOpen) setSidebarOpen(false);
              if (setShowLogoutModal) setShowLogoutModal(true);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition duration-200 cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full border border-rose-500/40 flex items-center justify-center shrink-0">
              <LogOut size={11} className="text-rose-500 ml-0.5" />
            </div>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 bg-[#050B1E]/90 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-2xl px-2 py-2 flex justify-around items-center">
        <Link
          href="/dashboard"
          className="flex flex-col items-center gap-1 py-1 px-3 text-blue-500 transition-all duration-200"
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-semibold">Dashboard</span>
        </Link>

        <Link
          href="/messages"
          className="flex flex-col items-center gap-1 py-1 px-3 text-slate-400 hover:text-slate-200 transition-all duration-200"
        >
          <MessageSquare size={20} />
          <span className="text-[10px] font-medium">Messages</span>
        </Link>

        <Link
          href="/calls"
          className="flex flex-col items-center gap-1 py-1 px-3 text-slate-400 hover:text-slate-200 transition-all duration-200"
        >
          <Phone size={20} />
          <span className="text-[10px] font-medium">Calls</span>
        </Link>

        <Link
          href="/settings"
          className="flex flex-col items-center gap-1 py-1 px-3 text-slate-400 hover:text-slate-200 transition-all duration-200"
        >
          <User size={20} />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </>
  );
}