// "use client";

// import { useEffect, useState } from "react";
// import {
//   Phone,
//   User,
//   CheckCircle2,
//   Clock,
//   Loader2,
// } from "lucide-react";

// export default function StaffDashboardPage() {
//   const [numbers, setNumbers] = useState([]);
//   const [staff, setStaff] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadStaffData = async () => {
//       try {
//         // Logged-in user
//         const userRes = await fetch("/api/auth/me", {
//           cache: "no-store",
//         });

//         const userData = await userRes.json();

//         if (!userData.success || !userData.user) {
//           setLoading(false);
//           return;
//         }

//         const currentStaff = userData.user;

//         setStaff(currentStaff);

//         // Admin ki testing assignment
//         const savedAssignments =
//           localStorage.getItem("dailyDeskAssignments");

//         if (!savedAssignments) {
//           setNumbers([]);
//           setLoading(false);
//           return;
//         }

//         const assignments = JSON.parse(savedAssignments);

//         const staffId =
//           currentStaff.id || currentStaff._id;

//         // Sirf isi staff ke numbers
//         const myNumbers = assignments[staffId] || [];

//         setNumbers(myNumbers);
//       } catch (error) {
//         console.error("Staff dashboard error:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadStaffData();
//   }, []);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-50">
//         <Loader2
//           size={30}
//           className="animate-spin text-blue-600"
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
//       <div className="max-w-7xl mx-auto">

//         {/* HEADER */}
//         <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">

//           <div className="flex items-center gap-4">

//             <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center">
//               <User size={22} />
//             </div>

//             <div>
//               <h1 className="text-2xl font-black text-slate-900">
//                 Staff Daily Desk
//               </h1>

//               <p className="text-sm text-slate-500 mt-1">
//                 Welcome, {staff?.name || "Staff"}
//               </p>

//               <p className="text-xs text-slate-400">
//                 Staff ID: {staff?.id || staff?._id || "N/A"}
//               </p>
//             </div>

//           </div>

//         </div>

//         {/* STATS */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

//           <div className="bg-white border border-slate-200 rounded-2xl p-5">
//             <div className="flex items-center gap-3">

//               <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
//                 <Phone size={20} />
//               </div>

//               <div>
//                 <p className="text-xs text-slate-400">
//                   My Numbers
//                 </p>

//                 <p className="text-2xl font-black text-slate-900">
//                   {numbers.length}
//                 </p>
//               </div>

//             </div>
//           </div>

//           <div className="bg-white border border-slate-200 rounded-2xl p-5">
//             <div className="flex items-center gap-3">

//               <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
//                 <Clock size={20} />
//               </div>

//               <div>
//                 <p className="text-xs text-slate-400">
//                   Pending
//                 </p>

//                 <p className="text-2xl font-black text-slate-900">
//                   {numbers.length}
//                 </p>
//               </div>

//             </div>
//           </div>

//           <div className="bg-white border border-slate-200 rounded-2xl p-5">
//             <div className="flex items-center gap-3">

//               <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
//                 <CheckCircle2 size={20} />
//               </div>

//               <div>
//                 <p className="text-xs text-slate-400">
//                   Completed
//                 </p>

//                 <p className="text-2xl font-black text-slate-900">
//                   0
//                 </p>
//               </div>

//             </div>
//           </div>

//         </div>

//         {/* DAILY NUMBERS */}
//         <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">

//           <div className="p-6 border-b border-slate-100">
//             <h2 className="font-bold text-slate-900">
//               Today's Assigned Numbers
//             </h2>

//             <p className="text-xs text-slate-400 mt-1">
//               Admin ne aapko jo numbers assign kiye hain
//             </p>
//           </div>

//           <div className="p-6">

//             {numbers.length === 0 ? (

//               <div className="text-center py-12">

//                 <Phone
//                   size={35}
//                   className="mx-auto text-slate-300"
//                 />

//                 <p className="mt-3 text-sm font-bold text-slate-600">
//                   No numbers assigned
//                 </p>

//                 <p className="text-xs text-slate-400 mt-1">
//                   Admin se daily call list ka wait karein.
//                 </p>

//               </div>

//             ) : (

//               <div className="space-y-3">

//                 {numbers.map((number, index) => (

//                   <div
//                     key={`${number}-${index}`}
//                     className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50 transition"
//                   >

//                     <div className="flex items-center gap-4">

//                       <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
//                         {index + 1}
//                       </div>

//                       <div>

//                         <p className="text-xs text-slate-400">
//                           Phone Number
//                         </p>

//                         <p className="text-base font-black text-slate-800">
//                           {number}
//                         </p>

//                       </div>

//                     </div>

//                     <button
//                       className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2"
//                     >
//                       <Phone size={14} />
//                       Call
//                     </button>

//                   </div>

//                 ))}

//               </div>

//             )}

//           </div>

//         </div>

//       </div>
//     </div>
//   );
// }



// "use client";

// import { useEffect, useState } from "react";

// import Sidebar from "@/components/Sidebar";
// import { useRouter } from "next/navigation";
// import {
//   Phone,
//   User,
//   CheckCircle2,
//     AlertTriangle,
//   Clock,
//   Loader2,
//   Tag,
// } from "lucide-react";

// export default function StaffDashboardPage() {
//     const router = useRouter();

//   const [numbers, setNumbers] = useState([]);

//   const [staff, setStaff] = useState(null);
//   const [loading, setLoading] = useState(true);
  
//     const [sidebarOpen, setSidebarOpen] = useState(false);
//     const [loggingOut, setLoggingOut] = useState(false);
//     const [showLogoutModal, setShowLogoutModal] = useState(false);
  

// useEffect(() => {
//   const loadStaffData = async () => {
//     try {
//       const userRes = await fetch("/api/auth/me", {
//         cache: "no-store",
//       });

//       const userData = await userRes.json();

//       if (!userData.success || !userData.user) {
//         setLoading(false);
//         return;
//       }

//       const currentStaff = userData.user;

//       setStaff(currentStaff);

//       // MySQL se today's assignments fetch
//       const res = await fetch("/api/staff/daily-desk", {
//         cache: "no-store",
//       });

//       const data = await res.json();

//       if (!res.ok || !data.success) {
//         throw new Error(
//           data.message || "Daily Desk data fetch nahi hua"
//         );
//       }

//       setNumbers(data.data || []);
//     } catch (error) {
//       console.error("Staff dashboard error:", error);
//       setNumbers([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   loadStaffData();
// }, []);
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-50">
//         <Loader2 size={30} className="animate-spin text-blue-600" />
//       </div>
//     );
//   }

//     const handleConfirmLogout = async () => {
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
//     <div className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">
//           <Sidebar
//               sidebarOpen={sidebarOpen}
//               setSidebarOpen={setSidebarOpen}
//               setShowLogoutModal={setShowLogoutModal}
//             />
      
//       <div className="max-w-7xl mx-auto">
//         {/* HEADER */}
//         <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
//           <div className="flex items-center gap-4">
//             <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center">
//               <User size={22} />
//             </div>
//             <div>
//               <h1 className="text-2xl font-black text-slate-900">
//                 Staff Daily Desk
//               </h1>
//               <p className="text-sm text-slate-500 mt-1">
//                 Welcome, {staff?.name || "Staff"}
//               </p>
//               <p className="text-xs text-slate-400">
//                 Staff ID: {staff?.id || staff?._id || "N/A"}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* STATS */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
//           <div className="bg-white border border-slate-200 rounded-2xl p-5">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
//                 <Phone size={20} />
//               </div>
//               <div>
//                 <p className="text-xs text-slate-400">My Tasks</p>
//                 <p className="text-2xl font-black text-slate-900">
//                   {numbers.length}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white border border-slate-200 rounded-2xl p-5">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
//                 <Clock size={20} />
//               </div>
//               <div>
//                 <p className="text-xs text-slate-400">Pending</p>
//                 <p className="text-2xl font-black text-slate-900">
//                   {numbers.length}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white border border-slate-200 rounded-2xl p-5">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
//                 <CheckCircle2 size={20} />
//               </div>
//               <div>
//                 <p className="text-xs text-slate-400">Completed</p>
//                 <p className="text-2xl font-black text-slate-900">0</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* DAILY NUMBERS LIST */}
//         <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
//           <div className="p-6 border-b border-slate-100">
//             <h2 className="font-bold text-slate-900">
//               Today's Assigned Call Tasks
//             </h2>
//             <p className="text-xs text-slate-400 mt-1">
//               Task IDs and phone numbers assigned to you today
//             </p>
//           </div>

//           <div className="p-6">
//             {numbers.length === 0 ? (
//               <div className="text-center py-12">
//                 <Phone size={35} className="mx-auto text-slate-300" />
//                 <p className="mt-3 text-sm font-bold text-slate-600">
//                   No numbers assigned
//                 </p>
//                 <p className="text-xs text-slate-400 mt-1">
//                   Admin se daily call list ka wait karein.
//                 </p>
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {numbers.map((item, index) => {
//                   // Fallback for older string array format
//                const taskId =
//   typeof item === "object"
//     ? item.task_id
//     : `TSK-${1001 + index}`;

// const phoneNumber =
//   typeof item === "object"
//     ? item.phone
//     : item;

//                   return (
//                     <div
//                       key={`${phoneNumber}-${index}`}
//                       className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50/50 transition"
//                     >
//                       <div className="flex items-center gap-4">
//                         <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
//                           {index + 1}
//                         </div>

//                         <div>
//                           {/* TASK ID BADGE */}
//                           <div className="flex items-center gap-1.5 mb-1">
//                             <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 font-extrabold rounded text-[11px]">
//                               <Tag size={10} />
//                               {taskId}
//                             </span>
//                           </div>

//                           <p className="text-xs text-slate-400">Phone Number</p>
//                           <p className="text-base font-black text-slate-800">
//                             {phoneNumber}
//                           </p>
//                         </div>
//                       </div>

//                       <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition">
//                         <Phone size={14} />
//                         Call
//                       </button>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//            {/* LOGOUT CONFIRMATION MODAL */}
//             {showLogoutModal && (
//               <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
//                 <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
//                   <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
//                     <AlertTriangle size={24} />
//                   </div>
      
//                   <div className="text-center space-y-1">
//                     <h3 className="text-lg font-bold text-slate-900">Log Out?</h3>
//                     <p className="text-sm text-slate-500">
//                       Are you sure you want to log out of your account?
//                     </p>
//                   </div>
      
//                   <div className="flex items-center gap-3 pt-2">
//                     <button
//                       type="button"
//                       disabled={loggingOut}
//                       onClick={() => setShowLogoutModal(false)}
//                       className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition disabled:opacity-50 cursor-pointer"
//                     >
//                       Cancel
//                     </button>
      
//                     <button
//                       type="button"
//                       disabled={loggingOut}
//                       onClick={handleConfirmLogout}
//                       className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
//                     >
//                       {loggingOut ? (
//                         <>
//                           <Loader2 size={16} className="animate-spin" />
//                           <span>Logging out...</span>
//                         </>
//                       ) : (
//                         <span>Yes, Logout</span>
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//     </div>
//   );
// }
"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import {
  Phone,
  User,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Loader2,
  Tag,
  RefreshCw,
} from "lucide-react";

export default function StaffDashboardPage() {
  const router = useRouter();

  const [numbers, setNumbers] = useState([]);
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [rawApiResponse, setRawApiResponse] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const loadStaffData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      // 1. Fetch Auth Details
      const userRes = await fetch("/api/auth/me", { cache: "no-store" });
      const userData = await userRes.json();

      if (!userRes.ok || !userData?.success || !userData?.user) {
        setErrorMessage("Authentication failed. Please login again.");
        setLoading(false);
        return;
      }

      setStaff(userData.user);

      // 2. Fetch Daily Desk Data
      const res = await fetch("/api/staff/daily-desk", { cache: "no-store" });
      const data = await res.json();

      setRawApiResponse(data);

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to load Daily Desk data.");
      }

      // Safe extraction across various API responses
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
      console.error("Staff dashboard fetch error:", error);
      setErrorMessage(error.message || "Failed to fetch daily assignments.");
      setNumbers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaffData();
  }, [loadStaffData]);

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      localStorage.removeItem("crm_login_time");
      const response = await fetch("/api/logout", { method: "POST" });
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
      alert("Something went wrong during logout.");
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={30} className="animate-spin text-blue-600" />
      </div>
    );
  }

  // Task Status Logic
  const completedTasks = numbers.filter((item) => {
    if (typeof item !== "object" || !item) return false;
    const status = (item.status || "").toLowerCase();
    return status === "completed" || status === "done" || status === "called";
  }).length;

  const pendingTasks = numbers.length - completedTasks;

  return (
    <div className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setShowLogoutModal={setShowLogoutModal}
      />

      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <User size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">
                Staff Daily Desk
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Welcome back,{" "}
                <span className="font-semibold text-slate-700">
                  {staff?.name || "Staff"}
                </span>
              </p>
              <p className="text-xs text-slate-400">
                Staff ID: {staff?.id || staff?._id || "N/A"}
              </p>
            </div>
          </div>

          <button
            onClick={loadStaffData}
            className="self-start sm:self-auto p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition flex items-center gap-2 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* ERROR ALERT */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertTriangle size={18} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400">My Tasks</p>
                <p className="text-2xl font-black text-slate-900">
                  {numbers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Pending</p>
                <p className="text-2xl font-black text-slate-900">
                  {pendingTasks}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Completed</p>
                <p className="text-2xl font-black text-slate-900">
                  {completedTasks}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DAILY NUMBERS LIST */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">
              Today's Assigned Call Tasks
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Task IDs and phone numbers assigned to you today
            </p>
          </div>

          <div className="p-6">
            {numbers.length === 0 ? (
              <div className="text-center py-10">
                <Phone size={35} className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-600">
                  No numbers assigned
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Admin se daily call list ka wait karein.
                </p>

                {/* DEBUG PRINT FOR API RESPONSE */}
                {rawApiResponse && (
                  <div className="mt-6 p-4 bg-slate-900 text-emerald-400 font-mono text-left text-xs rounded-xl overflow-x-auto max-w-2xl mx-auto">
                    <p className="text-slate-400 border-b border-slate-700 pb-1 mb-2 font-sans font-bold">
                      🔍 Backend API Raw Response (Debug Info):
                    </p>
                    <pre>{JSON.stringify(rawApiResponse, null, 2)}</pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {numbers.map((item, index) => {
                  const taskId =
                    typeof item === "object" && item !== null
                      ? item.task_id || item.id || item.taskId || `TSK-${1001 + index}`
                      : `TSK-${1001 + index}`;

                  const phoneNumber =
                    typeof item === "object" && item !== null
                      ? item.phone || item.phone_number || item.phoneNumber || item.mobile || "N/A"
                      : String(item);

                  return (
                    <div
                      key={`${phoneNumber}-${index}`}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50/50 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {index + 1}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 font-extrabold rounded text-[11px]">
                              <Tag size={10} />
                              {taskId}
                            </span>
                          </div>

                          <p className="text-xs text-slate-400">Phone Number</p>
                          <p className="text-base font-black text-slate-800">
                            {phoneNumber}
                          </p>
                        </div>
                      </div>

                      <a
                        href={`tel:${phoneNumber}`}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition"
                      >
                        <Phone size={14} />
                        Call
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
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