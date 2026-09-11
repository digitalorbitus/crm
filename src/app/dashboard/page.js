



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

import LogoutModal from "@/components/LogoutModal";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import CRMLoader from "@/components/CRMLoader";
import DashboardTopBar from "@/components/DashboardTopBar";

export default function DashboardPage() {
  const router = useRouter();

  // =========================
  // STATES
  // =========================
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [staff, setStaff] = useState(null);
  const [rawApiResponse, setRawApiResponse] = useState(null);
  const [numbers, setNumbers] = useState([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // =========================
  // LOAD STAFF DATA
  // =========================
  const loadStaffData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      // =====================================
      // 1. FETCH AUTH DETAILS
      // =====================================
      const userRes = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      const userData = await userRes.json();

      if (
        !userRes.ok ||
        !userData?.success ||
        !userData?.user
      ) {
        setErrorMessage(
          "Authentication failed. Please login again."
        );

        setLoading(false);
        return;
      }

      setStaff(userData.user);

      // =====================================
      // 2. FETCH DAILY DESK DATA
      // =====================================
      const res = await fetch("/api/staff/daily-desk", {
        cache: "no-store",
      });

      const data = await res.json();

      setRawApiResponse(data);

      if (!res.ok || !data?.success) {
        throw new Error(
          data?.message ||
            "Failed to load Daily Desk data."
        );
      }

      // =====================================
      // SAFE EXTRACTION
      // =====================================
      let listData = [];

      if (Array.isArray(data)) {
        listData = data;
      } else if (Array.isArray(data?.data)) {
        listData = data.data;
      } else if (Array.isArray(data?.tasks)) {
        listData = data.tasks;
      } else if (Array.isArray(data?.numbers)) {
        listData = data.numbers;
      } else if (Array.isArray(data?.assignments)) {
        listData = data.assignments;
      }

      setNumbers(listData);
    } catch (error) {
      console.error(
        "Staff dashboard fetch error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Failed to fetch daily assignments."
      );

      setNumbers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================
  // LOAD DATA ON PAGE LOAD
  // =========================
  useEffect(() => {
    loadStaffData();
  }, [loadStaffData]);

  // =========================
  // STATS DATA
  // =========================
  const stats = [
    {
      title: "Total Calls",
      value: "",
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

  // =========================
  // TOP STAFF DATA
  // =========================
  const topStaff = [
    {
      name: "Ahmed Khan",
      total: 125,
      answered: 98,
      missed: 17,
      talkTime: "04h 32m",
    },
    {
      name: "Usman Tariq",
      total: 118,
      answered: 92,
      missed: 26,
      talkTime: "04h 10m",
    },
    {
      name: "Maria Sheikh",
      total: 110,
      answered: 85,
      missed: 25,
      talkTime: "03h 45m",
    },
    {
      name: "Zain Ali",
      total: 105,
      answered: 80,
      missed: 25,
      talkTime: "03h 20m",
    },
    {
      name: "Sara Khan",
      total: 95,
      answered: 72,
      missed: 23,
      talkTime: "02h 50m",
    },
  ];

  // =========================
  // LIVE ACTIVITY DATA
  // =========================
  const liveActivities = [
    {
      name: "Ahmed Khan",
      action: "completed a call",
      time: "10:15 AM",
      avatar: "A",
      color: "bg-blue-600",
    },
    {
      name: "Usman Tariq",
      action: "missed a call",
      time: "10:14 AM",
      avatar: "U",
      color: "bg-indigo-600",
    },
    {
      name: "Maria Sheikh",
      action: "completed a call",
      time: "10:12 AM",
      avatar: "M",
      color: "bg-sky-600",
    },
    {
      name: "Zain Ali",
      action: "completed a call",
      time: "10:11 AM",
      avatar: "Z",
      color: "bg-emerald-600",
    },
    {
      name: "Sara Khan",
      action: "completed a call",
      time: "10:08 AM",
      avatar: "S",
      color: "bg-rose-600",
    },
  ];

  // =========================
  // LOGOUT
  // =========================
  const handleConfirmLogout = async () => {
    setLoggingOut(true);

    try {
      localStorage.removeItem("crm_login_time");

      const response = await fetch("/api/logout", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data?.message || "Logout failed");

        setLoggingOut(false);
        setShowLogoutModal(false);

        return;
      }

      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);

      alert(
        "Something went wrong during logout."
      );

      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  // =========================
  // LOADER
  // =========================
  if (loading) {
    return (
      <CRMLoader
        subtitle="Dashboard"
        message="Loading dashboard..."
      />
    );
  }


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
        
        {/* DYNAMIC TOP BAR WITH LOGIN TIME & USER PROFILE */}
        <DashboardTopBar />

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
      {/* {showLogoutModal && (
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
      )} */}
      <LogoutModal
  show={showLogoutModal}
  loggingOut={loggingOut}
  onCancel={() => setShowLogoutModal(false)}
  onConfirm={handleConfirmLogout}
/>
    </div>
  );
}




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

//   // =========================
//   // STATES
//   // =========================
//   const [loading, setLoading] = useState(true);
//   const [errorMessage, setErrorMessage] = useState("");

//   const [staff, setStaff] = useState(null);
//   const [allStaff, setAllStaff] = useState([]);
//   const [rawApiResponse, setRawApiResponse] = useState(null);
//   const [numbers, setNumbers] = useState([]);

//   // REAL CALL DATA
//   const [calls, setCalls] = useState([]);

//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [loggingOut, setLoggingOut] = useState(false);
//   const [showLogoutModal, setShowLogoutModal] = useState(false);

//   // =========================
//   // HELPERS
//   // =========================

//   const getCallList = (data) => {
//     if (!data) return [];

//     if (Array.isArray(data)) {
//       return data;
//     }

//     const possibleKeys = [
//       "calls",
//       "callLogs",
//       "call_logs",
//       "history",
//       "records",
//       "results",
//       "data",
//     ];

//     for (const key of possibleKeys) {
//       if (Array.isArray(data?.[key])) {
//         return data[key];
//       }
//     }

//     // Nested data
//     if (data?.data && typeof data.data === "object") {
//       for (const key of possibleKeys) {
//         if (Array.isArray(data.data?.[key])) {
//           return data.data[key];
//         }
//       }
//     }

//     return [];
//   };

//   const getCallDate = (call) => {
//     const value =
//       call?.start_time ||
//       call?.startTime ||
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
//   };

//   const getDurationSeconds = (call) => {
//     const value =
//       call?.duration ||
//       call?.duration_seconds ||
//       call?.durationSeconds ||
//       call?.talk_time ||
//       call?.talkTime ||
//       call?.seconds ||
//       0;

//     if (typeof value === "number") {
//       return value;
//     }

//     if (typeof value === "string") {
//       // "04h 32m"
//       const hMatch = value.match(/(\d+)\s*h/i);
//       const mMatch = value.match(/(\d+)\s*m/i);
//       const sMatch = value.match(/(\d+)\s*s/i);

//       if (hMatch || mMatch || sMatch) {
//         return (
//           Number(hMatch?.[1] || 0) * 3600 +
//           Number(mMatch?.[1] || 0) * 60 +
//           Number(sMatch?.[1] || 0)
//         );
//       }

//       const numeric = Number(value);

//       if (!Number.isNaN(numeric)) {
//         return numeric;
//       }
//     }

//     return 0;
//   };

//   const getCallStatus = (call) => {
//     const raw =
//       call?.status ||
//       call?.call_status ||
//       call?.callStatus ||
//       call?.result ||
//       call?.disposition ||
//       "";

//     const status = String(raw).toLowerCase();

//     if (
//       status.includes("miss") ||
//       status.includes("no answer") ||
//       status.includes("no_answer") ||
//       status.includes("unanswered") ||
//       status.includes("failed") ||
//       status.includes("cancel")
//     ) {
//       return "missed";
//     }

//     if (
//       status.includes("answer") ||
//       status.includes("completed") ||
//       status.includes("connected") ||
//       status.includes("success")
//     ) {
//       return "answered";
//     }

//     // Zoom call logs commonly have duration.
//     // If duration > 0, treat it as answered.
//     if (getDurationSeconds(call) > 0) {
//       return "answered";
//     }

//     return "missed";
//   };

//   const getStaffName = (call) => {
//     return (
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
//       "Unknown Staff"
//     );
//   };

//   const formatTalkTime = (seconds) => {
//     const totalSeconds = Math.max(0, Number(seconds) || 0);

//     const hours = Math.floor(totalSeconds / 3600);
//     const minutes = Math.floor((totalSeconds % 3600) / 60);

//     return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(
//       2,
//       "0"
//     )}m`;
//   };

//   const formatActivityTime = (date) => {
//     if (!date) return "--";

//     return date.toLocaleTimeString([], {
//       hour: "numeric",
//       minute: "2-digit",
//     });
//   };

//   const getInitial = (name) => {
//     if (!name) return "?";

//     return String(name).trim().charAt(0).toUpperCase();
//   };

//   const getAvatarColor = (index) => {
//     const colors = [
//       "bg-blue-600",
//       "bg-indigo-600",
//       "bg-sky-600",
//       "bg-emerald-600",
//       "bg-rose-600",
//       "bg-violet-600",
//       "bg-cyan-600",
//     ];

//     return colors[index % colors.length];
//   };

//   // =========================
//   // LOAD API DATA
//   // =========================
//   const loadStaffData = useCallback(async () => {
//     setLoading(true);
//     setErrorMessage("");

//     try {
//       // =====================================
//       // 1. AUTH DETAILS
//       // =====================================
//       const userRes = await fetch("/api/auth/me", {
//         cache: "no-store",
//       });

//       const userData = await userRes.json();

//       if (!userRes.ok || !userData?.success || !userData?.user) {
//         setErrorMessage("Authentication failed. Please login again.");
//         setLoading(false);
//         return;
//       }

//       setStaff(userData.user);


      
// const staffListRes = await fetch("/api/staff/list", {
//   cache: "no-store",
// });

// const staffListData = await staffListRes.json();

// if (staffListData.success && Array.isArray(staffListData.users)) {
//   setAllStaff(staffListData.users);
// }

//       // =====================================
//       // 2. EXISTING DAILY DESK API
//       // =====================================
//       try {
//         const res = await fetch("/api/staff/daily-desk", {
//           cache: "no-store",
//         });

//         const data = await res.json();

//         setRawApiResponse(data);

//         let listData = [];

//         if (Array.isArray(data)) {
//           listData = data;
//         } else if (Array.isArray(data?.data)) {
//           listData = data.data;
//         } else if (Array.isArray(data?.tasks)) {
//           listData = data.tasks;
//         } else if (Array.isArray(data?.numbers)) {
//           listData = data.numbers;
//         } else if (Array.isArray(data?.assignments)) {
//           listData = data.assignments;
//         }

//         setNumbers(listData);
//       } catch (dailyDeskError) {
//         console.error("Daily desk error:", dailyDeskError);
//         setNumbers([]);
//       }

//       // =====================================
//       // 3. ZOOM CALL HISTORY API
//       // =====================================
//       const callRes = await fetch("/api/zoom/call-history", {
//         cache: "no-store",
//       });

//       const callData = await callRes.json();

//       if (!callRes.ok) {
//         throw new Error(
//           callData?.message || "Failed to load Zoom call history."
//         );
//       }

//       const callList = getCallList(callData);

//       console.log("ZOOM CALL HISTORY:", callData);
//       console.log("NORMALIZED CALLS:", callList);

//       setCalls(callList);
//     } catch (error) {
//       console.error("Dashboard API error:", error);

//       setErrorMessage(
//         error?.message || "Failed to fetch dashboard data."
//       );

//       setCalls([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // =========================
//   // LOAD DATA
//   // =========================
//   useEffect(() => {
//     loadStaffData();
//   }, [loadStaffData]);

//   // =========================
//   // LAST 7 DAYS
//   // =========================
//   const lastSevenDays = useMemo(() => {
//     const days = [];

//     for (let i = 6; i >= 0; i--) {
//       const date = new Date();

//       date.setHours(0, 0, 0, 0);
//       date.setDate(date.getDate() - i);

//       days.push(date);
//     }

//     return days;
//   }, []);

//   // =========================
//   // NORMALIZED CALLS
//   // =========================
//   const normalizedCalls = useMemo(() => {
//     return calls
//       .map((call) => {
//         const date = getCallDate(call);
//         const status = getCallStatus(call);
//         const staffName = getStaffName(call);
//         const duration = getDurationSeconds(call);

//         return {
//           original: call,
//           date,
//           status,
//           staffName,
//           duration,
//         };
//       })
//       .filter((call) => call.date);
//   }, [calls]);

//   // =========================
//   // CALL STATS
//   // =========================
//   const totalCalls = normalizedCalls.length;

//   const answeredCalls = normalizedCalls.filter(
//     (call) => call.status === "answered"
//   ).length;

//   const missedCalls = normalizedCalls.filter(
//     (call) => call.status === "missed"
//   ).length;

//   const totalTalkSeconds = normalizedCalls.reduce(
//     (total, call) => total + call.duration,
//     0
//   );

//   const answeredPercentage =
//     totalCalls > 0
//       ? Math.round((answeredCalls / totalCalls) * 1000) / 10
//       : 0;

//   const missedPercentage =
//     totalCalls > 0
//       ? Math.round((missedCalls / totalCalls) * 1000) / 10
//       : 0;

//   // =========================
//   // STATS DATA
//   // =========================
//   const stats = [
//     {
//       title: "Total Calls",
//       value: totalCalls.toLocaleString(),
//       change: "18%",
//       isPositive: true,
//       period: "from yesterday",
//       icon: Phone,
//       bgColor: "bg-blue-50",
//       iconColor: "text-blue-500",
//     },
//     {
//       title: "Answered Calls",
//       value: answeredCalls.toLocaleString(),
//       change: "15%",
//       isPositive: true,
//       period: "from yesterday",
//       icon: PhoneIncoming,
//       bgColor: "bg-emerald-50",
//       iconColor: "text-emerald-500",
//     },
//     {
//       title: "Missed Calls",
//       value: missedCalls.toLocaleString(),
//       change: "7%",
//       isPositive: false,
//       period: "from yesterday",
//       icon: PhoneOff,
//       bgColor: "bg-rose-50",
//       iconColor: "text-rose-500",
//     },
//     {
//       title: "Total Talk Time",
//       value: formatTalkTime(totalTalkSeconds),
//       change: "20%",
//       isPositive: true,
//       period: "from yesterday",
//       icon: Clock,
//       bgColor: "bg-purple-50",
//       iconColor: "text-purple-500",
//     },
//   ];

//   // =========================
//   // TOP STAFF - DYNAMIC
//   // =========================
// const normalizeExtension = (value) => {
//   if (value === undefined || value === null) return null;

//   const cleaned = String(value)
//     .trim()
//     .replace(/^Ext\.?/i, "");

//   return cleaned || null;
// };

// const getCallOwnerExtension = (call) => {
//   return (
//     normalizeExtension(call?.caller_extension) ||
//     normalizeExtension(call?.raw_zoom_data?.caller_ext_number) ||
//     normalizeExtension(call?.raw_zoom_data?.caller_ext_id) ||
//     normalizeExtension(call?.receiver_extension) ||
//     normalizeExtension(call?.raw_zoom_data?.callee_ext_number) ||
//     normalizeExtension(call?.raw_zoom_data?.callee_ext_id) ||
//     null
//   );
// };

// const topStaff = useMemo(() => {
//   return allStaff
//     .map((user) => {
//       const extension = normalizeExtension(user.zoom_extension);

//       const userCalls = normalizedCalls.filter(({ original }) => {
//         const ownerExtension = getCallOwnerExtension(original);

//         return (
//           extension &&
//           ownerExtension &&
//           extension === ownerExtension
//         );
//       });

//       const total = userCalls.length;

//       const answered = userCalls.filter(
//         (call) => call.status === "answered"
//       ).length;

//       const missed = userCalls.filter(
//         (call) => call.status === "missed"
//       ).length;

//       const talkSeconds = userCalls.reduce(
//         (total, call) => total + call.duration,
//         0
//       );

//       return {
//         id: user.id,
//         name: user.name || "Unknown User",
//         email: user.email || "",
//         role: user.role || "",
//         extension,
//         total,
//         answered,
//         missed,
//         talkSeconds,
//       };
//     })
//     .sort((a, b) => b.total - a.total);
// }, [allStaff, normalizedCalls]);
//   // =========================
//   // LIVE ACTIVITY - DYNAMIC
//   // =========================
//   const liveActivities = useMemo(() => {
//     return [...normalizedCalls]
//       .sort((a, b) => {
//         return (
//           (b.date?.getTime() || 0) -
//           (a.date?.getTime() || 0)
//         );
//       })
//       .slice(0, 5)
//       .map((call, index) => {
//         let action = "completed a call";

//         if (call.status === "missed") {
//           action = "missed a call";
//         }

//         return {
//           name: call.staffName,
//           action,
//           time: formatActivityTime(call.date),
//           avatar: getInitial(call.staffName),
//           color: getAvatarColor(index),
//         };
//       });
//   }, [normalizedCalls]);

//   // =========================
//   // CHART DATA - LAST 7 DAYS
//   // =========================
//   const chartData = useMemo(() => {
//     return lastSevenDays.map((day) => {
//       const year = day.getFullYear();
//       const month = day.getMonth();
//       const date = day.getDate();

//       const dayCalls = normalizedCalls.filter((call) => {
//         if (!call.date) return false;

//         return (
//           call.date.getFullYear() === year &&
//           call.date.getMonth() === month &&
//           call.date.getDate() === date
//         );
//       });

//       return {
//         date: day,
//         total: dayCalls.length,
//       };
//     });
//   }, [lastSevenDays, normalizedCalls]);

//   // =========================
//   // CHART MAX
//   // =========================
//   const chartMax = useMemo(() => {
//     const max = Math.max(
//       ...chartData.map((item) => item.total),
//       1
//     );

//     return max;
//   }, [chartData]);

//   // =========================
//   // SVG CHART PATH
//   // =========================
//   const chartPath = useMemo(() => {
//     if (!chartData.length) {
//       return "M 0,100";
//     }

//     const width = 500;
//     const height = 120;

//     const points = chartData.map((item, index) => {
//       const x =
//         chartData.length === 1
//           ? width / 2
//           : (index / (chartData.length - 1)) * width;

//       const percentage = item.total / chartMax;

//       const y = height - percentage * 100;

//       return {
//         x,
//         y,
//       };
//     });

//     if (points.length === 1) {
//       return `M ${points[0].x},${points[0].y}`;
//     }

//     let path = `M ${points[0].x},${points[0].y}`;

//     for (let i = 1; i < points.length; i++) {
//       const previous = points[i - 1];
//       const current = points[i];

//       const controlX = (previous.x + current.x) / 2;

//       path += ` Q ${controlX},${previous.y} ${current.x},${current.y}`;
//     }

//     return path;
//   }, [chartData, chartMax]);

//   const chartAreaPath = useMemo(() => {
//     return `${chartPath} L 500,120 L 0,120 Z`;
//   }, [chartPath]);

//   // =========================
//   // CHART LABELS
//   // =========================
//   const formatChartDate = (date) => {
//     if (!date) return "--";

//     return date.toLocaleDateString("en-US", {
//       day: "2-digit",
//       month: "short",
//     });
//   };

//   // =========================
//   // LOGOUT
//   // =========================
//   const handleConfirmLogout = async () => {
//     setLoggingOut(true);

//     try {
//       localStorage.removeItem("crm_login_time");

//       const response = await fetch("/api/logout", {
//         method: "POST",
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         alert(data?.message || "Logout failed");

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

//   // =========================
//   // LOADER
//   // =========================
//   if (loading) {
//     return (
//       <CRMLoader
//         subtitle="Dashboard"
//         message="Loading dashboard..."
//       />
//     );
//   }

//   // =========================
//   // UI
//   // =========================
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

//       {/* MAIN CONTENT */}
//       <main className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">
//         <DashboardTopBar />

//         {/* 4 TOP STATS CARDS */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
//           {stats.map((stat, idx) => {
//             const Icon = stat.icon;

//             return (
//               <div
//                 key={idx}
//                 className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between"
//               >
//                 <div className="flex items-center justify-between">
//                   <span className="text-xs font-semibold text-slate-400">
//                     {stat.title}
//                   </span>

//                   <div
//                     className={`w-10 h-10 rounded-full ${stat.bgColor} ${stat.iconColor} flex items-center justify-center shrink-0`}
//                   >
//                     <Icon size={18} />
//                   </div>
//                 </div>

//                 <div className="mt-3">
//                   <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
//                     {stat.value}
//                   </h3>

//                   <div className="flex items-center gap-1 mt-2 text-xs font-semibold">
//                     {stat.isPositive ? (
//                       <span className="text-emerald-500 flex items-center gap-0.5">
//                         <TrendingUp size={13} />
//                         {stat.change}
//                       </span>
//                     ) : (
//                       <span className="text-rose-500 flex items-center gap-0.5">
//                         <TrendingDown size={13} />
//                         {stat.change}
//                       </span>
//                     )}

//                     <span className="text-slate-400 font-normal">
//                       {stat.period}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* CHARTS SECTION */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Call Trend Line Chart */}
//           <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
//             <div className="flex items-center justify-between mb-6">
//               <h3 className="font-bold text-slate-900 text-sm sm:text-base">
//                 Call Trend (Last 7 Days)
//               </h3>
//             </div>

//             <div className="w-full h-56 flex flex-col justify-between relative pt-2">
//               <div className="absolute inset-0 flex flex-col justify-between text-[11px] text-slate-300 pointer-events-none">
//                 <div className="border-b border-slate-100 w-full pb-1">
//                   {chartMax}
//                 </div>

//                 <div className="border-b border-slate-100 w-full pb-1">
//                   {Math.round(chartMax * 0.66)}
//                 </div>

//                 <div className="border-b border-slate-100 w-full pb-1">
//                   {Math.round(chartMax * 0.33)}
//                 </div>

//                 <div className="border-b border-slate-100 w-full pb-1">
//                   0
//                 </div>
//               </div>

//               {/* Dynamic Chart */}
//               <div className="h-40 w-full z-10 pt-4">
//                 <svg
//                   className="w-full h-full overflow-visible"
//                   viewBox="0 0 500 120"
//                   preserveAspectRatio="none"
//                 >
//                   <defs>
//                     <linearGradient
//                       id="blueGradient"
//                       x1="0"
//                       y1="0"
//                       x2="0"
//                       y2="1"
//                     >
//                       <stop
//                         offset="0%"
//                         stopColor="#3B82F6"
//                         stopOpacity="0.2"
//                       />

//                       <stop
//                         offset="100%"
//                         stopColor="#3B82F6"
//                         stopOpacity="0.0"
//                       />
//                     </linearGradient>
//                   </defs>

//                   <path
//                     d={chartAreaPath}
//                     fill="url(#blueGradient)"
//                   />

//                   <path
//                     d={chartPath}
//                     fill="none"
//                     stroke="#3B82F6"
//                     strokeWidth="3"
//                     strokeLinecap="round"
//                   />

//                   {chartData.map((item, index) => {
//                     const x =
//                       chartData.length === 1
//                         ? 250
//                         : (index / (chartData.length - 1)) *
//                           500;

//                     const percentage =
//                       item.total / chartMax;

//                     const y = 120 - percentage * 100;

//                     return (
//                       <circle
//                         key={index}
//                         cx={x}
//                         cy={y}
//                         r="3.5"
//                         fill="#3B82F6"
//                       />
//                     );
//                   })}
//                 </svg>
//               </div>

//               {/* X Axis */}
//               <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium z-10 pt-2">
//                 {chartData.map((item, index) => (
//                   <span key={index}>
//                     {formatChartDate(item.date)}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Call Status Distribution */}
//           <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
//             <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-4">
//               Call Status Distribution
//             </h3>

//             <div className="flex flex-col items-center justify-center my-auto">
//               {/* Dynamic Donut */}
//               <div className="relative w-40 h-40 flex items-center justify-center">
//                 <svg
//                   className="w-full h-full transform -rotate-90"
//                   viewBox="0 0 36 36"
//                 >
//                   <path
//                     className="text-slate-100"
//                     strokeWidth="4"
//                     stroke="currentColor"
//                     fill="none"
//                     d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//                   />

//                   <path
//                     className="text-blue-600"
//                     strokeDasharray={`${answeredPercentage}, 100`}
//                     strokeWidth="4"
//                     strokeLinecap="round"
//                     stroke="currentColor"
//                     fill="none"
//                     d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//                   />

//                   <path
//                     className="text-rose-500"
//                     strokeDasharray={`${missedPercentage}, 100`}
//                     strokeDashoffset={`-${answeredPercentage}`}
//                     strokeWidth="4"
//                     strokeLinecap="round"
//                     stroke="currentColor"
//                     fill="none"
//                     d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//                   />
//                 </svg>

//                 <div className="absolute text-center">
//                   <span className="text-2xl font-extrabold text-slate-900">
//                     {totalCalls.toLocaleString()}
//                   </span>
//                 </div>
//               </div>

//               {/* Legends */}
//               <div className="mt-6 space-y-2.5 w-full max-w-[200px]">
//                 <div className="flex items-center justify-between text-xs">
//                   <div className="flex items-center gap-2">
//                     <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />

//                     <span className="font-medium text-slate-600">
//                       Answered
//                     </span>
//                   </div>

//                   <span className="font-bold text-slate-800">
//                     {answeredCalls.toLocaleString()}{" "}
//                     <span className="font-normal text-slate-400">
//                       ({answeredPercentage}%)
//                     </span>
//                   </span>
//                 </div>

//                 <div className="flex items-center justify-between text-xs">
//                   <div className="flex items-center gap-2">
//                     <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />

//                     <span className="font-medium text-slate-600">
//                       Missed
//                     </span>
//                   </div>

//                   <span className="font-bold text-slate-800">
//                     {missedCalls.toLocaleString()}{" "}
//                     <span className="font-normal text-slate-400">
//                       ({missedPercentage}%)
//                     </span>
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* BOTTOM SECTION */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Top Staff Table */}
//           <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="font-bold text-slate-900 text-sm sm:text-base">
//                 Top Staff (By Total Calls)
//               </h3>

//               <button
//                 type="button"
//                 className="text-xs font-semibold text-blue-600 hover:underline"
//               >
//                 View All
//               </button>
//             </div>

//          <div className="overflow-x-auto">
//   <table className="w-full text-xs text-left">
//     <thead>
//       <tr className="text-slate-400 border-b border-slate-100 font-semibold">
//         <th className="pb-3 font-medium">
//           Staff
//         </th>

//         <th className="pb-3 font-medium">
//           Email
//         </th>

//         <th className="pb-3 font-medium">
//           Total Calls
//         </th>

//         <th className="pb-3 font-medium">
//           Answered
//         </th>

//         <th className="pb-3 font-medium">
//           Missed
//         </th>

//         <th className="pb-3 font-medium">
//           Talk Time
//         </th>
//       </tr>
//     </thead>

//     <tbody className="divide-y divide-slate-50">
//       {topStaff.length > 0 ? (
//         topStaff.map((person) => (
//           <tr
//             key={person.id}
//             className="hover:bg-slate-50/80 transition-colors"
//           >
//             {/* Staff */}
//             <td className="py-3">
//               <div className="font-bold text-slate-800">
//                 {person.name}
//               </div>

//               <div className="text-[11px] text-slate-400 mt-1">
//                 Ext. {person.extension || "--"}
//               </div>
//             </td>

//             {/* Email */}
//             <td className="py-3">
//               <span className="text-slate-500">
//                 {person.email || "--"}
//               </span>
//             </td>

//             {/* Total Calls */}
//             <td className="py-3 text-slate-600 font-semibold">
//               {person.total}
//             </td>

//             {/* Answered */}
//             <td className="py-3 text-slate-600 font-semibold">
//               {person.answered}
//             </td>

//             {/* Missed */}
//             <td className="py-3 text-slate-600 font-semibold">
//               {person.missed}
//             </td>

//             {/* Talk Time */}
//             <td className="py-3 text-slate-600 font-semibold">
//               {formatTalkTime(person.talkSeconds)}
//             </td>
//           </tr>
//         ))
//       ) : (
//         <tr>
//           <td
//             colSpan={6}
//             className="py-8 text-center text-slate-400"
//           >
//             No staff data available
//           </td>
//         </tr>
//       )}
//     </tbody>
//   </table>
// </div>
//           </div>

//           {/* Live Activity */}
//           <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
//             <div>
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="font-bold text-slate-900 text-sm sm:text-base">
//                   Live Activity
//                 </h3>

//                 <button
//                   type="button"
//                   className="text-xs font-semibold text-blue-600 hover:underline"
//                 >
//                   View All
//                 </button>
//               </div>

//               <div className="space-y-4">
//                 {liveActivities.length > 0 ? (
//                   liveActivities.map((act, i) => (
//                     <div
//                       key={`${act.name}-${i}`}
//                       className="flex items-center justify-between text-xs"
//                     >
//                       <div className="flex items-center gap-2.5">
//                         <div
//                           className={`w-7 h-7 rounded-full ${act.color} text-white flex items-center justify-center font-bold text-[11px] shrink-0`}
//                         >
//                           {act.avatar}
//                         </div>

//                         <p className="text-slate-700">
//                           <span className="font-bold text-slate-900">
//                             {act.name}
//                           </span>{" "}
//                           <span className="text-slate-500">
//                             {act.action}
//                           </span>
//                         </p>
//                       </div>

//                       <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap ml-2">
//                         {act.time}
//                       </span>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="py-8 text-center text-xs text-slate-400">
//                     No recent activity
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* LOGOUT MODAL */}
//       <LogoutModal
//         show={showLogoutModal}
//         loggingOut={loggingOut}
//         onCancel={() => setShowLogoutModal(false)}
//         onConfirm={handleConfirmLogout}
//       />
//     </div>
//   );
// }