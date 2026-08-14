// "use client";

// import { useState, useEffect } from "react";
// import { Calendar, ChevronDown } from "lucide-react";

// export default function DashboardTopBar() {
//   const [currentUser, setCurrentUser] = useState({
//     name: "",
//     email: "",
//     role: "",
//     avatar: null,
//   });

//   const [loading, setLoading] = useState(true);

//   const [loginDetails, setLoginDetails] = useState({
//     day: "Today",
//     date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
//     time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
//   });

//   // Fetch Fully Dynamic User Profile from DB via API
//   useEffect(() => {
//     async function fetchUserData() {
//       try {
//         const res = await fetch("/api/auth/me");
//         const data = await res.json();

//         if (data.success && data.user) {
//           setCurrentUser({
//             name: data.user.name || "User",
//             email: data.user.email, // Dynamic Email from DB
//             role: data.user.role || "user", // Dynamic Role from DB
//             avatar: data.user.avatar || null,
//           });
//         }
//       } catch (err) {
//         console.error("Failed to fetch logged in user details:", err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchUserData();
//   }, []);

//   const userInitial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U";
//   const isAdmin = currentUser.role?.toLowerCase() === "admin";

//   return (
//     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
//       <div>
//         <h1 className="text-xl font-extrabold text-slate-900">Dashboard</h1>
//         <p className="text-xs text-slate-500 mt-0.5">Call Activity & Performance Analytics</p>
//       </div>

//       <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
//         {/* LOGIN DAY, DATE & TIME BADGE */}
//         <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700 font-medium shadow-sm">
//           <Calendar size={14} className="text-blue-600 shrink-0" />
//           <span>
//             Logged in: <strong>{loginDetails.day}</strong>, {loginDetails.date} at {loginDetails.time}
//           </span>
//         </div>

//         {/* DYNAMIC LOGGED IN USER PROFILE */}
//         <div className="flex items-center gap-3 shrink-0">
//           {/* AVATAR IMAGE OR INITIAL */}
//           <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-md overflow-hidden">
//             {currentUser.avatar ? (
//               <img
//                 src={currentUser.avatar}
//                 alt={currentUser.name}
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <span className="bg-gradient-to-tr from-amber-500 to-rose-500 w-full h-full rounded-full flex items-center justify-center uppercase">
//                 {userInitial}
//               </span>
//             )}
//           </div>

//           <div className="text-left hidden md:block">
//             <div className="flex items-center gap-2">
//               {/* DYNAMIC USER NAME */}
//               <p className="text-xs sm:text-sm font-bold text-slate-900 leading-none capitalize">
//                 {loading ? "Loading..." : currentUser.name}
//               </p>

//               {/* DYNAMIC ROLE BADGE */}
//               {!loading && (
//                 <span
//                   className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md border ${
//                     isAdmin
//                       ? "bg-purple-50 text-purple-700 border-purple-200"
//                       : "bg-emerald-50 text-emerald-700 border-emerald-200"
//                   }`}
//                 >
//                   {currentUser.role}
//                 </span>
//               )}

//               <ChevronDown size={13} className="text-slate-400" />
//             </div>

//             {/* DYNAMIC LOGGED IN EMAIL FROM DB */}
//             <p className="text-[11px] text-slate-400 font-medium mt-1">
//               {loading ? "fetching email..." : currentUser.email}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { Calendar, ChevronDown, User } from "lucide-react";

export default function DashboardTopBar() {
  const [currentUser, setCurrentUser] = useState({
    name: "",
    email: "",
    role: "",
    avatar: null,
  });

  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false); // Image load failure tracker

  const [loginDetails] = useState(() => {
    const now = new Date();
    return {
      day: now.toLocaleDateString("en-US", { weekday: "long" }),
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

  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        // Check both data.user and direct data properties
        const userObj = data.user || data.data || data;

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
        }
      } catch (err) {
        console.error("Failed to fetch user details:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  const userInitial = currentUser.name
    ? currentUser.name.trim().charAt(0).toUpperCase()
    : "";

  const isAdmin = currentUser.role?.toLowerCase() === "admin";

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Dashboard</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Call Activity & Performance Analytics
        </p>
      </div>

      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
        {/* LOGIN BADGE */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700 font-medium shadow-sm">
          <Calendar size={14} className="text-blue-600 shrink-0" />
          <span>
            Logged in: <strong>{loginDetails.day}</strong>, {loginDetails.date}{" "}
            at {loginDetails.time}
          </span>
        </div>

        {/* PROFILE SECTION */}
        <div className="flex items-center gap-3 shrink-0">
          {/* AVATAR WRAPPER */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-md overflow-hidden shrink-0 relative">
            {loading ? (
              <div className="w-full h-full bg-slate-200 animate-pulse flex items-center justify-center">
                <User size={18} className="text-slate-400" />
              </div>
            ) : currentUser.avatar && !imageError ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name || "User Avatar"}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)} // Falls back gracefully on broken URL
              />
            ) : userInitial ? (
              <span className="bg-gradient-to-tr from-amber-500 to-rose-500 w-full h-full rounded-full flex items-center justify-center uppercase font-black text-white">
                {userInitial}
              </span>
            ) : (
              <div className="bg-slate-800 w-full h-full flex items-center justify-center">
                <User size={18} className="text-slate-300" />
              </div>
            )}
          </div>

          {/* USER TEXT DETAILS */}
          <div className="text-left hidden md:block">
            <div className="flex items-center gap-2">
              <p className="text-xs sm:text-sm font-bold text-slate-900 leading-none capitalize">
                {loading
                  ? "Loading..."
                  : currentUser.name || "Guest User"}
              </p>

              {!loading && currentUser.role && (
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

              <ChevronDown size={13} className="text-slate-400" />
            </div>

            <p className="text-[11px] text-slate-400 font-medium mt-1">
              {loading
                ? "fetching email..."
                : currentUser.email || "No email available"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}