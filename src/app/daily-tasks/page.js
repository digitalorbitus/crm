

// "use client";

// import { useEffect, useState } from "react";
// import Sidebar from "@/components/Sidebar";
// import {
//   Upload,
//   Users,
//   Phone,
//   CheckCircle2,
//   Loader2,
//   FileSpreadsheet,
//   ShieldCheck,
//   XCircle,
//   X,
//   LogOut,
//   Menu,
// } from "lucide-react";

// export default function AdminDailyDeskPage() {
//   const [file, setFile] = useState(null);
//   const [staff, setStaff] = useState([]);
//   const [selectedStaff, setSelectedStaff] = useState([]);
//   const [numbers, setNumbers] = useState([]);
//   const [distribution, setDistribution] = useState("equal");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [loggingOut, setLoggingOut] = useState(false);
//   const [showLogoutModal, setShowLogoutModal] = useState(false);

//   // Custom Alert Modal / Toast State
//   const [alertConfig, setAlertConfig] = useState({
//     show: false,
//     title: "",
//     message: "",
//     type: "success",
//   });

//   const showAlert = (title, message, type = "success") => {
//     setAlertConfig({ show: true, title, message, type });
//   };

//   const closeAlert = () => {
//     setAlertConfig((prev) => ({ ...prev, show: false }));
//   };

//   useEffect(() => {
//     const fetchStaff = async () => {
//       try {
//         const res = await fetch("/api/new-users", { cache: "no-store" });
//         const data = await res.json();
//         const users = data.users || data.data || [];

//         const staffUsers = users.filter((user) => {
//           const role = (user.role || "").toLowerCase();
//           return role === "staff" || role === "agent";
//         });

//         setStaff(staffUsers);
//       } catch (error) {
//         console.error("Fetch staff error:", error);
//       }
//     };

//     fetchStaff();
//   }, []);

//   const handleExcelUpload = async (e) => {
//     const selectedFile = e.target.files?.[0];
//     if (!selectedFile) return;

//     setFile(selectedFile);

//     try {
//       const XLSX = await import("xlsx");
//       const buffer = await selectedFile.arrayBuffer();
//       const workbook = XLSX.read(buffer, { type: "array" });
//       const sheetName = workbook.SheetNames[0];
//       const worksheet = workbook.Sheets[sheetName];
//       const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

//       const extracted = rows
//         .map((row, index) => {
//           const phone =
//             row.phone ||
//             row.Phone ||
//             row.PHONE ||
//             row.number ||
//             row.Number ||
//             row.mobile ||
//             row.Mobile;

//           const rawPhone = String(phone || "").trim();
//           if (!rawPhone) return null;

//           const rawTaskId =
//             row.taskId ||
//             row.TaskId ||
//             row["Task ID"] ||
//             row["task_id"] ||
//             row.id ||
//             row.ID ||
//             `TSK-${1001 + index}`;

//           return {
//             taskId: String(rawTaskId).trim(),
//             phone: rawPhone,
//           };
//         })
//         .filter(Boolean);

//       const uniqueItems = extracted.filter(
//         (item, index, self) =>
//           index === self.findIndex((t) => t.phone === item.phone)
//       );

//       setNumbers(uniqueItems);
//       setMessage(
//         `${uniqueItems.length} unique phone records loaded successfully.`
//       );
//       showAlert(
//         "Excel Loaded",
//         `${uniqueItems.length} records processed successfully.`,
//         "success"
//       );
//     } catch (error) {
//       console.error("Excel error:", error);
//       setMessage("Excel file read nahi ho saki.");
//       showAlert("Upload Error", "Excel file read nahi ho saki.", "error");
//     }
//   };

//   const toggleStaff = (id) => {
//     setSelectedStaff((prev) =>
//       prev.includes(id) ? prev.filter((staffId) => staffId !== id) : [...prev, id]
//     );
//   };

//   const selectAllStaff = () => {
//     if (selectedStaff.length === staff.length) {
//       setSelectedStaff([]);
//     } else {
//       setSelectedStaff(staff.map((user) => user.id || user._id));
//     }
//   };

//   const distributeNumbers = () => {
//     if (!numbers.length) {
//       showAlert("Error", "Pehle Excel file upload karein!", "error");
//       return null;
//     }

//     if (!selectedStaff.length) {
//       showAlert("Error", "Kam az kam 1 staff member select karein!", "error");
//       return null;
//     }

//     const assignments = {};
//     selectedStaff.forEach((staffId) => {
//       assignments[staffId] = [];
//     });

//     numbers.forEach((item, index) => {
//       const staffId = selectedStaff[index % selectedStaff.length];
//       assignments[staffId].push(item);
//     });

//     return assignments;
//   };



//   const handleConfirmLogout = async () => {
//     setLoggingOut(true);
//     try {
//       // Add your logout logic here (e.g. clear session/cookies or hit endpoint)
//       window.location.href = "/login";
//     } catch (err) {
//       console.error("Logout failed:", err);
//       setLoggingOut(false);
//     }
//   };
// const handleAssign = async () => {
//   const assignments = distributeNumbers();

//   if (!assignments) return;

//   setLoading(true);
//   setMessage("");

//   try {
//     const response = await fetch("/api/admin/daily-desk/assign", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         numbers,
//         selectedStaff,
//         distribution,
//         sourceFile: file?.name || null,
//       }),
//     });

//     const data = await response.json();

//     if (!response.ok || !data.success) {
//       throw new Error(
//         data.message || "Numbers assign nahi ho sake."
//       );
//     }

//     const successMsg =
//       `${data.data.tasksSaved} tasks successfully ` +
//       `assigned to ${data.data.staffCount} staff members!`;

//     setMessage(successMsg);

//     showAlert(
//       "Success!",
//       successMsg,
//       "success"
//     );
//   } catch (error) {
//     console.error("Assignment error:", error);

//     const errorMsg =
//       error.message || "Numbers assign nahi ho sake.";

//     setMessage(errorMsg);

//     showAlert(
//       "Assignment Failed",
//       errorMsg,
//       "error"
//     );
//   } finally {
//     setLoading(false);
//   }
// };
//   return (
//     <div className="min-h-screen bg-slate-50 flex relative">
//       {/* SIDEBAR COMPONENT */}
//       <Sidebar
//         sidebarOpen={sidebarOpen}
//         setSidebarOpen={setSidebarOpen}
//         setShowLogoutModal={setShowLogoutModal}
//       />

//       {/* MAIN CONTENT CONTAINER */}
//       <div className="flex-1 lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">
//         {/* CUSTOM FLOATING ALERT POPUP */}
//         {alertConfig.show && (
//           <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
//             <div
//               className={`flex items-start gap-4 p-4 rounded-2xl shadow-xl border max-w-md ${
//                 alertConfig.type === "success"
//                   ? "bg-emerald-50 border-emerald-200 text-emerald-900"
//                   : "bg-red-50 border-red-200 text-red-900"
//               }`}
//             >
//               <div
//                 className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
//                   alertConfig.type === "success"
//                     ? "bg-emerald-500 text-white"
//                     : "bg-red-500 text-white"
//                 }`}
//               >
//                 {alertConfig.type === "success" ? (
//                   <CheckCircle2 size={22} />
//                 ) : (
//                   <XCircle size={22} />
//                 )}
//               </div>

//               <div className="flex-1">
//                 <h3 className="font-extrabold text-sm">{alertConfig.title}</h3>
//                 <p className="text-xs mt-1 text-slate-600">{alertConfig.message}</p>
//               </div>

//               <button
//                 onClick={closeAlert}
//                 className="text-slate-400 hover:text-slate-600 transition"
//               >
//                 <X size={18} />
//               </button>
//             </div>
//           </div>
//         )}

//         <div className="max-w-7xl mx-auto">
//           {/* TOP BAR / HEADER */}
//           <div className="mb-8 flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => setSidebarOpen(true)}
//                 className="lg:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
//               >
//                 <Menu size={20} />
//               </button>
//               <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
//                 <ShieldCheck size={24} />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-black text-slate-900 tracking-tight">
//                   Daily Desk Admin
//                 </h1>
//                 <p className="text-xs font-medium text-slate-500 mt-0.5">
//                   Call List Distribution & Task Assignment
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* MAIN GRID */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* EXCEL UPLOAD */}
//             <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
//               <div className="flex items-center gap-3 mb-5">
//                 <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
//                   <FileSpreadsheet size={20} />
//                 </div>
//                 <div>
//                   <h2 className="font-bold text-slate-900">
//                     Upload Daily Call List
//                   </h2>
//                   <p className="text-xs text-slate-500">
//                     Import phone records via Excel file
//                   </p>
//                 </div>
//               </div>

//               <label className="block cursor-pointer">
//                 <input
//                   type="file"
//                   accept=".xlsx,.xls,.csv"
//                   onChange={handleExcelUpload}
//                   className="hidden"
//                 />
//                 <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 rounded-2xl p-8 text-center transition group">
//                   <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto group-hover:scale-110 transition duration-200">
//                     <Upload size={24} />
//                   </div>
//                   <p className="mt-3 text-sm font-bold text-slate-700">
//                     {file ? file.name : "Click to upload Excel file"}
//                   </p>
//                   <p className="text-xs text-slate-400 mt-1">XLSX, XLS or CSV</p>
//                 </div>
//               </label>

//               {/* LOADED NUMBERS COUNTER */}
//               <div className="mt-5 flex items-center justify-between bg-slate-50 rounded-xl p-4 border border-slate-100">
//                 <div className="flex items-center gap-3">
//                   <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
//                     <Phone size={17} />
//                   </div>
//                   <div>
//                     <p className="text-xs font-bold text-slate-800">
//                       Phone Records Loaded
//                     </p>
//                     <p className="text-[11px] text-slate-400">
//                       Unique numbers with Task IDs
//                     </p>
//                   </div>
//                 </div>
//                 <span className="text-xl font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
//                   {numbers.length}
//                 </span>
//               </div>
//             </div>

//             {/* STAFF SELECTION */}
//             <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 flex flex-col">
//               <div className="flex items-center justify-between mb-5">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
//                     <Users size={20} />
//                   </div>
//                   <div>
//                     <h2 className="font-bold text-slate-900">Select Staff</h2>
//                     <p className="text-xs text-slate-500">Active team members</p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={selectAllStaff}
//                   className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition"
//                 >
//                   {selectedStaff.length === staff.length
//                     ? "Unselect All"
//                     : "Select All"}
//                 </button>
//               </div>

//               <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 flex-1">
//                 {staff.map((user) => {
//                   const id = user.id || user._id;
//                   const selected = selectedStaff.includes(id);

//                   return (
//                     <button
//                       key={id}
//                       onClick={() => toggleStaff(id)}
//                       className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition duration-150 ${
//                         selected
//                           ? "border-blue-300 bg-blue-50/60 shadow-sm"
//                           : "border-slate-100 hover:bg-slate-50"
//                       }`}
//                     >
//                       <div
//                         className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
//                           selected
//                             ? "bg-blue-600 text-white"
//                             : "bg-slate-100 text-slate-600"
//                         }`}
//                       >
//                         {(user.name || user.fullName || "U").charAt(0).toUpperCase()}
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className="text-xs font-bold text-slate-800 truncate">
//                           {user.name || user.fullName}
//                         </p>
//                         <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
//                       </div>
//                       {selected && (
//                         <CheckCircle2 size={18} className="text-blue-600 shrink-0" />
//                       )}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           {/* DISTRIBUTION MODE & SUBMIT */}
//           <div className="mt-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
//             <h2 className="font-bold text-slate-900">Number Distribution</h2>
//             <p className="text-xs text-slate-500 mt-0.5">
//               Select how tasks should be distributed among chosen staff members.
//             </p>

//             <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
//               <button
//                 onClick={() => setDistribution("equal")}
//                 className={`p-4 rounded-xl border text-left transition ${
//                   distribution === "equal"
//                     ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20"
//                     : "border-slate-200 hover:bg-slate-50"
//                 }`}
//               >
//                 <p className="text-sm font-bold text-slate-800">Equal Distribution</p>
//                 <p className="text-xs text-slate-500 mt-1">
//                   Divides records as evenly as possible.
//                 </p>
//               </button>

//               <button
//                 onClick={() => setDistribution("round")}
//                 className={`p-4 rounded-xl border text-left transition ${
//                   distribution === "round"
//                     ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20"
//                     : "border-slate-200 hover:bg-slate-50"
//                 }`}
//               >
//                 <p className="text-sm font-bold text-slate-800">Round Robin</p>
//                 <p className="text-xs text-slate-500 mt-1">
//                   Sequential rotation through selected staff.
//                 </p>
//               </button>
//             </div>

//             <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-5">
//               <div>
//                 {message && (
//                   <p className="text-xs font-semibold text-blue-600">{message}</p>
//                 )}
//               </div>

//               <button
//                 onClick={handleAssign}
//                 disabled={loading || !numbers.length || !selectedStaff.length}
//                 className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-blue-500/20"
//               >
//                 {loading ? (
//                   <>
//                     <Loader2 size={16} className="animate-spin" />
//                     Assigning Tasks...
//                   </>
//                 ) : (
//                   <>
//                     <CheckCircle2 size={16} />
//                     Assign Numbers
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* ASSIGNMENT PREVIEW */}
//           {numbers.length > 0 && selectedStaff.length > 0 && (
//             <div className="mt-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
//               <h2 className="font-bold text-slate-900 mb-4">
//                 Assignment Preview
//               </h2>

//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
//                 {selectedStaff.map((staffId) => {
//                   const user = staff.find((s) => (s.id || s._id) === staffId);
//                   const staffIndex = selectedStaff.indexOf(staffId);
//                   const count =
//                     Math.floor(numbers.length / selectedStaff.length) +
//                     (staffIndex < numbers.length % selectedStaff.length ? 1 : 0);

//                   return (
//                     <div
//                       key={staffId}
//                       className="border border-slate-100 rounded-xl p-4 bg-slate-50/70 hover:bg-slate-50 transition"
//                     >
//                       <div className="flex items-center justify-between">
//                         <p className="text-xs font-bold text-slate-800 truncate">
//                           {user?.name || user?.fullName || "Staff"}
//                         </p>
//                         <span className="text-xs font-black text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded-md">
//                           {count} tasks
//                         </span>
//                       </div>
//                       <p className="text-[10px] text-slate-400 mt-1">
//                         Allocated workload
//                       </p>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* LOGOUT CONFIRMATION MODAL */}
//       {showLogoutModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
//           <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
//             <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
//               <LogOut size={22} />
//             </div>

//             <h3 className="text-base font-bold text-slate-900 text-center">
//               Confirm Logout
//             </h3>
//             <p className="text-xs text-slate-500 text-center mt-1">
//               Kya aap sach me account se log out karna chahte hain?
//             </p>

//             <div className="mt-6 flex items-center gap-3">
//               <button
//                 onClick={() => setShowLogoutModal(false)}
//                 disabled={loggingOut}
//                 className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleConfirmLogout}
//                 disabled={loggingOut}
//                 className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white flex items-center justify-center gap-2 transition shadow-md shadow-red-500/20"
//               >
//                 {loggingOut ? (
//                   <Loader2 size={15} className="animate-spin" />
//                 ) : (
//                   "Logout"
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

// import { useEffect, useState } from "react";
// import Sidebar from "@/components/Sidebar";
// import {
//   Upload,
//   Users,
//   Phone,
//   CheckCircle2,
//   Loader2,
//   FileSpreadsheet,
//   ShieldCheck,
//   XCircle,
//   X,
//   LogOut,
//   Menu,
//   Calendar,
//   Search,
//   RefreshCw,
// } from "lucide-react";

// export default function AdminDailyDeskPage() {
//   const [file, setFile] = useState(null);
//   const [staff, setStaff] = useState([]);
//   const [selectedStaff, setSelectedStaff] = useState([]);
//   const [numbers, setNumbers] = useState([]);
//   const [distribution, setDistribution] = useState("equal");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [loggingOut, setLoggingOut] = useState(false);
//   const [showLogoutModal, setShowLogoutModal] = useState(false);

//   // Date-wise History State
//   const [selectedDate, setSelectedDate] = useState(
//     new Date().toISOString().split("T")[0]
//   );
//   const [historyRecords, setHistoryRecords] = useState([]);
//   const [fetchingHistory, setFetchingHistory] = useState(false);

//   // Custom Alert Modal / Toast State
//   const [alertConfig, setAlertConfig] = useState({
//     show: false,
//     title: "",
//     message: "",
//     type: "success",
//   });

//   const showAlert = (title, message, type = "success") => {
//     setAlertConfig({ show: true, title, message, type });
//   };

//   const closeAlert = () => {
//     setAlertConfig((prev) => ({ ...prev, show: false }));
//   };

//   // Fetch Active Staff Members
//   useEffect(() => {
//     const fetchStaff = async () => {
//       try {
//         const res = await fetch("/api/new-users", { cache: "no-store" });
//         const data = await res.json();
//         const users = data.users || data.data || [];

//         const staffUsers = users.filter((user) => {
//           const role = (user.role || "").toLowerCase();
//           return role === "staff" || role === "agent";
//         });

//         setStaff(staffUsers);
//       } catch (error) {
//         console.error("Fetch staff error:", error);
//       }
//     };

//     fetchStaff();
//   }, []);

//   // Fetch Historical Tasks based on Selected Date
//   const fetchDateWiseTasks = async (dateStr) => {
//     setFetchingHistory(true);
//     try {
//       const res = await fetch(`/api/admin/daily-desk/history?date=${dateStr}`, {
//         cache: "no-store",
//       });
//       const data = await res.json();

//       if (data.success) {
//         setHistoryRecords(data.data || []);
//       } else {
//         setHistoryRecords([]);
//       }
//     } catch (error) {
//       console.error("Error fetching history:", error);
//       setHistoryRecords([]);
//     } finally {
//       setFetchingHistory(false);
//     }
//   };

//   useEffect(() => {
//     if (selectedDate) {
//       fetchDateWiseTasks(selectedDate);
//     }
//   }, [selectedDate]);

//   const handleExcelUpload = async (e) => {
//     const selectedFile = e.target.files?.[0];
//     if (!selectedFile) return;

//     setFile(selectedFile);

//     try {
//       const XLSX = await import("xlsx");
//       const buffer = await selectedFile.arrayBuffer();
//       const workbook = XLSX.read(buffer, { type: "array" });
//       const sheetName = workbook.SheetNames[0];
//       const worksheet = workbook.Sheets[sheetName];
//       const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

//       const extracted = rows
//         .map((row, index) => {
//           const phone =
//             row.phone ||
//             row.Phone ||
//             row.PHONE ||
//             row.number ||
//             row.Number ||
//             row.mobile ||
//             row.Mobile;

//           const rawPhone = String(phone || "").trim();
//           if (!rawPhone) return null;

//           const rawTaskId =
//             row.taskId ||
//             row.TaskId ||
//             row["Task ID"] ||
//             row["task_id"] ||
//             row.id ||
//             row.ID ||
//             `TSK-${1001 + index}`;

//           return {
//             taskId: String(rawTaskId).trim(),
//             phone: rawPhone,
//           };
//         })
//         .filter(Boolean);

//       const uniqueItems = extracted.filter(
//         (item, index, self) =>
//           index === self.findIndex((t) => t.phone === item.phone)
//       );

//       setNumbers(uniqueItems);
//       setMessage(
//         `${uniqueItems.length} unique phone records loaded successfully.`
//       );
//       showAlert(
//         "Excel Loaded",
//         `${uniqueItems.length} records processed successfully.`,
//         "success"
//       );
//     } catch (error) {
//       console.error("Excel error:", error);
//       setMessage("Excel file read nahi ho saki.");
//       showAlert("Upload Error", "Excel file read nahi ho saki.", "error");
//     }
//   };

//   const toggleStaff = (id) => {
//     setSelectedStaff((prev) =>
//       prev.includes(id) ? prev.filter((staffId) => staffId !== id) : [...prev, id]
//     );
//   };

//   const selectAllStaff = () => {
//     if (selectedStaff.length === staff.length) {
//       setSelectedStaff([]);
//     } else {
//       setSelectedStaff(staff.map((user) => user.id || user._id));
//     }
//   };

//   const distributeNumbers = () => {
//     if (!numbers.length) {
//       showAlert("Error", "Pehle Excel file upload karein!", "error");
//       return null;
//     }

//     if (!selectedStaff.length) {
//       showAlert("Error", "Kam az kam 1 staff member select karein!", "error");
//       return null;
//     }

//     const assignments = {};
//     selectedStaff.forEach((staffId) => {
//       assignments[staffId] = [];
//     });

//     numbers.forEach((item, index) => {
//       const staffId = selectedStaff[index % selectedStaff.length];
//       assignments[staffId].push(item);
//     });

//     return assignments;
//   };

//   const handleConfirmLogout = async () => {
//     setLoggingOut(true);
//     try {
//       window.location.href = "/login";
//     } catch (err) {
//       console.error("Logout failed:", err);
//       setLoggingOut(false);
//     }
//   };

//   const handleAssign = async () => {
//     const assignments = distributeNumbers();
//     if (!assignments) return;

//     setLoading(true);
//     setMessage("");

//     try {
//       const response = await fetch("/api/admin/daily-desk/assign", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           numbers,
//           selectedStaff,
//           distribution,
//           sourceFile: file?.name || null,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok || !data.success) {
//         throw new Error(data.message || "Numbers assign nahi ho sake.");
//       }

//       const successMsg = `${data.data.tasksSaved} tasks successfully assigned to ${data.data.staffCount} staff members!`;

//       setMessage(successMsg);
//       showAlert("Success!", successMsg, "success");

//       // Refresh date wise table after assignment
//       fetchDateWiseTasks(selectedDate);
//     } catch (error) {
//       console.error("Assignment error:", error);
//       const errorMsg = error.message || "Numbers assign nahi ho sake.";
//       setMessage(errorMsg);
//       showAlert("Assignment Failed", errorMsg, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 flex relative">
//       <Sidebar
//         sidebarOpen={sidebarOpen}
//         setSidebarOpen={setSidebarOpen}
//         setShowLogoutModal={setShowLogoutModal}
//       />

//       <div className="flex-1 lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">
//         {/* CUSTOM ALERT */}
//         {alertConfig.show && (
//           <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
//             <div
//               className={`flex items-start gap-4 p-4 rounded-2xl shadow-xl border max-w-md ${
//                 alertConfig.type === "success"
//                   ? "bg-emerald-50 border-emerald-200 text-emerald-900"
//                   : "bg-red-50 border-red-200 text-red-900"
//               }`}
//             >
//               <div
//                 className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
//                   alertConfig.type === "success"
//                     ? "bg-emerald-500 text-white"
//                     : "bg-red-500 text-white"
//                 }`}
//               >
//                 {alertConfig.type === "success" ? (
//                   <CheckCircle2 size={22} />
//                 ) : (
//                   <XCircle size={22} />
//                 )}
//               </div>

//               <div className="flex-1">
//                 <h3 className="font-extrabold text-sm">{alertConfig.title}</h3>
//                 <p className="text-xs mt-1 text-slate-600">{alertConfig.message}</p>
//               </div>

//               <button
//                 onClick={closeAlert}
//                 className="text-slate-400 hover:text-slate-600 transition"
//               >
//                 <X size={18} />
//               </button>
//             </div>
//           </div>
//         )}

//         <div className="max-w-7xl mx-auto space-y-6">
//           {/* HEADER */}
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => setSidebarOpen(true)}
//                 className="lg:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
//               >
//                 <Menu size={20} />
//               </button>
//               <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
//                 <ShieldCheck size={24} />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-black text-slate-900 tracking-tight">
//                   Daily Desk Admin
//                 </h1>
//                 <p className="text-xs font-medium text-slate-500 mt-0.5">
//                   Call List Distribution & Historical Records
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* MAIN FORM GRID */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
//               <div className="flex items-center gap-3 mb-5">
//                 <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
//                   <FileSpreadsheet size={20} />
//                 </div>
//                 <div>
//                   <h2 className="font-bold text-slate-900">Upload Daily Call List</h2>
//                   <p className="text-xs text-slate-500">Import phone records via Excel file</p>
//                 </div>
//               </div>

//               <label className="block cursor-pointer">
//                 <input
//                   type="file"
//                   accept=".xlsx,.xls,.csv"
//                   onChange={handleExcelUpload}
//                   className="hidden"
//                 />
//                 <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 rounded-2xl p-8 text-center transition group">
//                   <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto group-hover:scale-110 transition duration-200">
//                     <Upload size={24} />
//                   </div>
//                   <p className="mt-3 text-sm font-bold text-slate-700">
//                     {file ? file.name : "Click to upload Excel file"}
//                   </p>
//                   <p className="text-xs text-slate-400 mt-1">XLSX, XLS or CSV</p>
//                 </div>
//               </label>

//               <div className="mt-5 flex items-center justify-between bg-slate-50 rounded-xl p-4 border border-slate-100">
//                 <div className="flex items-center gap-3">
//                   <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
//                     <Phone size={17} />
//                   </div>
//                   <div>
//                     <p className="text-xs font-bold text-slate-800">Phone Records Loaded</p>
//                     <p className="text-[11px] text-slate-400">Unique numbers with Task IDs</p>
//                   </div>
//                 </div>
//                 <span className="text-xl font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
//                   {numbers.length}
//                 </span>
//               </div>
//             </div>

//             {/* STAFF SELECTION */}
//             <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 flex flex-col">
//               <div className="flex items-center justify-between mb-5">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
//                     <Users size={20} />
//                   </div>
//                   <div>
//                     <h2 className="font-bold text-slate-900">Select Staff</h2>
//                     <p className="text-xs text-slate-500">Active team members</p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={selectAllStaff}
//                   className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition"
//                 >
//                   {selectedStaff.length === staff.length ? "Unselect All" : "Select All"}
//                 </button>
//               </div>

//               <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 flex-1">
//                 {staff.map((user) => {
//                   const id = user.id || user._id;
//                   const selected = selectedStaff.includes(id);

//                   return (
//                     <button
//                       key={id}
//                       onClick={() => toggleStaff(id)}
//                       className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition duration-150 ${
//                         selected
//                           ? "border-blue-300 bg-blue-50/60 shadow-sm"
//                           : "border-slate-100 hover:bg-slate-50"
//                       }`}
//                     >
//                       <div
//                         className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
//                           selected
//                             ? "bg-blue-600 text-white"
//                             : "bg-slate-100 text-slate-600"
//                         }`}
//                       >
//                         {(user.name || user.fullName || "U").charAt(0).toUpperCase()}
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className="text-xs font-bold text-slate-800 truncate">
//                           {user.name || user.fullName}
//                         </p>
//                         <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
//                       </div>
//                       {selected && (
//                         <CheckCircle2 size={18} className="text-blue-600 shrink-0" />
//                       )}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           {/* DISTRIBUTION OPTIONS & SUBMIT */}
//           <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
//             <h2 className="font-bold text-slate-900">Number Distribution</h2>
//             <p className="text-xs text-slate-500 mt-0.5">
//               Select how tasks should be distributed among chosen staff members.
//             </p>

//             <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
//               <button
//                 onClick={() => setDistribution("equal")}
//                 className={`p-4 rounded-xl border text-left transition ${
//                   distribution === "equal"
//                     ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20"
//                     : "border-slate-200 hover:bg-slate-50"
//                 }`}
//               >
//                 <p className="text-sm font-bold text-slate-800">Equal Distribution</p>
//                 <p className="text-xs text-slate-500 mt-1">Divides records as evenly as possible.</p>
//               </button>

//               <button
//                 onClick={() => setDistribution("round")}
//                 className={`p-4 rounded-xl border text-left transition ${
//                   distribution === "round"
//                     ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20"
//                     : "border-slate-200 hover:bg-slate-50"
//                 }`}
//               >
//                 <p className="text-sm font-bold text-slate-800">Round Robin</p>
//                 <p className="text-xs text-slate-500 mt-1">Sequential rotation through selected staff.</p>
//               </button>
//             </div>

//             <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-5">
//               <div>
//                 {message && <p className="text-xs font-semibold text-blue-600">{message}</p>}
//               </div>

//               <button
//                 onClick={handleAssign}
//                 disabled={loading || !numbers.length || !selectedStaff.length}
//                 className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-blue-500/20"
//               >
//                 {loading ? (
//                   <>
//                     <Loader2 size={16} className="animate-spin" />
//                     Assigning Tasks...
//                   </>
//                 ) : (
//                   <>
//                     <CheckCircle2 size={16} />
//                     Assign Numbers
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* DATE-WISE HISTORY / RECORDS VIEW SECTION */}
//           <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-4">
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
//                   <Calendar size={20} />
//                 </div>
//                 <div>
//                   <h2 className="font-bold text-slate-900">Date-wise Assigned History</h2>
//                   <p className="text-xs text-slate-500">Check tasks assigned on a specific date</p>
//                 </div>
//               </div>

//               {/* Date Filter Input */}
//               <div className="flex items-center gap-3">
//                 <input
//                   type="date"
//                   value={selectedDate}
//                   onChange={(e) => setSelectedDate(e.target.value)}
//                   className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 <button
//                   onClick={() => fetchDateWiseTasks(selectedDate)}
//                   className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
//                   title="Refresh Data"
//                 >
//                   <RefreshCw size={16} className={fetchingHistory ? "animate-spin" : ""} />
//                 </button>
//               </div>
//             </div>

//             {/* History Table */}
//             {fetchingHistory ? (
//               <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
//                 <Loader2 size={24} className="animate-spin text-blue-600" />
//                 <span className="text-xs">Loading records for {selectedDate}...</span>
//               </div>
//             ) : historyRecords.length > 0 ? (
//               <div className="overflow-x-auto">
//                 <table className="w-full text-left text-xs">
//                   <thead>
//                     <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
//                       <th className="p-3">Task ID</th>
//                       <th className="p-3">Phone Number</th>
//                       <th className="p-3">Assigned Staff</th>
//                       <th className="p-3">Status</th>
//                       <th className="p-3 text-right">Time</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-slate-100">
//                     {historyRecords.map((item, idx) => (
//                       <tr key={item._id || item.id || idx} className="hover:bg-slate-50/50">
//                         <td className="p-3 font-mono font-bold text-slate-800">
//                           {item.taskId || "N/A"}
//                         </td>
//                         <td className="p-3 font-semibold text-slate-700">{item.phone}</td>
//                         <td className="p-3">
//                           <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-bold">
//                             {item.assignedToName || item.assignedTo || "Staff Member"}
//                           </span>
//                         </td>
//                         <td className="p-3">
//                           <span
//                             className={`px-2 py-1 rounded-md font-bold text-[10px] ${
//                               item.status === "completed"
//                                 ? "bg-emerald-50 text-emerald-700"
//                                 : "bg-amber-50 text-amber-700"
//                             }`}
//                           >
//                             {(item.status || "Pending").toUpperCase()}
//                           </span>
//                         </td>
//                         <td className="p-3 text-right text-slate-400">
//                           {item.createdAt
//                             ? new Date(item.createdAt).toLocaleTimeString([], {
//                                 hour: "2-digit",
//                                 minute: "2-digit",
//                               })
//                             : "-"}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             ) : (
//               <div className="py-8 text-center text-slate-400 text-xs">
//                 Is date (<b>{selectedDate}</b>) ke liye koi assigned tasks nahi mile.
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* LOGOUT MODAL */}
//       {showLogoutModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
//           <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
//             <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
//               <LogOut size={22} />
//             </div>

//             <h3 className="text-base font-bold text-slate-900 text-center">Confirm Logout</h3>
//             <p className="text-xs text-slate-500 text-center mt-1">
//               Kya aap sach me account se log out karna chahte hain?
//             </p>

//             <div className="mt-6 flex items-center gap-3">
//               <button
//                 onClick={() => setShowLogoutModal(false)}
//                 disabled={loggingOut}
//                 className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleConfirmLogout}
//                 disabled={loggingOut}
//                 className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white flex items-center justify-center gap-2 transition shadow-md shadow-red-500/20"
//               >
//                 {loggingOut ? <Loader2 size={15} className="animate-spin" /> : "Logout"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// "use client";

// import { useEffect, useState, useMemo } from "react";
// import Sidebar from "@/components/Sidebar";
// import {
//   Upload,
//   Users,
//   Phone,
//   CheckCircle2,
//   Loader2,
//   FileSpreadsheet,
//   ShieldCheck,
//   XCircle,
//   X,
//   LogOut,
//   Menu,
//   Calendar,
//   Search,
//   RefreshCw,
//   Filter,
// } from "lucide-react";

// export default function AdminDailyDeskPage() {
//   const [file, setFile] = useState(null);
//   const [staff, setStaff] = useState([]);
//   const [selectedStaff, setSelectedStaff] = useState([]);
//   const [numbers, setNumbers] = useState([]);
//   const [distribution, setDistribution] = useState("equal");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [loggingOut, setLoggingOut] = useState(false);
//   const [showLogoutModal, setShowLogoutModal] = useState(false);

//   // Date-wise History & Search State
//   const todayStr = new Date().toISOString().split("T")[0];
//   const [selectedDate, setSelectedDate] = useState(todayStr);
//   const [historyRecords, setHistoryRecords] = useState([]);
//   const [fetchingHistory, setFetchingHistory] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'pending' | 'completed'

//   // Custom Alert Modal / Toast State
//   const [alertConfig, setAlertConfig] = useState({
//     show: false,
//     title: "",
//     message: "",
//     type: "success",
//   });

//   const showAlert = (title, message, type = "success") => {
//     setAlertConfig({ show: true, title, message, type });
//   };

//   const closeAlert = () => {
//     setAlertConfig((prev) => ({ ...prev, show: false }));
//   };

//   // Fetch Active Staff Members
//   useEffect(() => {
//     const fetchStaff = async () => {
//       try {
//         const res = await fetch("/api/new-users", { cache: "no-store" });
//         const data = await res.json();
//         const users = data.users || data.data || [];

//         const staffUsers = users.filter((user) => {
//           const role = (user.role || "").toLowerCase();
//           return role === "staff" || role === "agent";
//         });

//         setStaff(staffUsers);
//       } catch (error) {
//         console.error("Fetch staff error:", error);
//       }
//     };

//     fetchStaff();
//   }, []);

//   // Fetch Historical Tasks based on Selected Date
//   const fetchDateWiseTasks = async (dateStr) => {
//     setFetchingHistory(true);
//     try {
//       const res = await fetch(`/api/admin/history?date=${dateStr}`, {
//         cache: "no-store",
//       });
//       const data = await res.json();

//       if (data.success) {
//         setHistoryRecords(data.data || []);
//       } else {
//         setHistoryRecords([]);
//       }
//     } catch (error) {
//       console.error("Error fetching history:", error);
//       setHistoryRecords([]);
//     } finally {
//       setFetchingHistory(false);
//     }
//   };

//   useEffect(() => {
//     if (selectedDate) {
//       fetchDateWiseTasks(selectedDate);
//     }
//   }, [selectedDate]);

//   // Client-side Filtering for History Records (Date + Search + Status)
//   const filteredRecords = useMemo(() => {
//     return historyRecords.filter((item) => {
//       const matchesSearch =
//         (item.taskId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
//         (item.phone || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
//         (item.assignedToName || item.assignedTo || "")
//           .toLowerCase()
//           .includes(searchQuery.toLowerCase());

//       const matchesStatus =
//         statusFilter === "all"
//           ? true
//           : (item.status || "pending").toLowerCase() === statusFilter.toLowerCase();

//       return matchesSearch && matchesStatus;
//     });
//   }, [historyRecords, searchQuery, statusFilter]);

//   const handleExcelUpload = async (e) => {
//     const selectedFile = e.target.files?.[0];
//     if (!selectedFile) return;

//     setFile(selectedFile);

//     try {
//       const XLSX = await import("xlsx");
//       const buffer = await selectedFile.arrayBuffer();
//       const workbook = XLSX.read(buffer, { type: "array" });
//       const sheetName = workbook.SheetNames[0];
//       const worksheet = workbook.Sheets[sheetName];
//       const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

//       const extracted = rows
//         .map((row, index) => {
//           const phone =
//             row.phone ||
//             row.Phone ||
//             row.PHONE ||
//             row.number ||
//             row.Number ||
//             row.mobile ||
//             row.Mobile;

//           const rawPhone = String(phone || "").trim();
//           if (!rawPhone) return null;

//           const rawTaskId =
//             row.taskId ||
//             row.TaskId ||
//             row["Task ID"] ||
//             row["task_id"] ||
//             row.id ||
//             row.ID ||
//             `TSK-${1001 + index}`;

//           return {
//             taskId: String(rawTaskId).trim(),
//             phone: rawPhone,
//           };
//         })
//         .filter(Boolean);

//       const uniqueItems = extracted.filter(
//         (item, index, self) =>
//           index === self.findIndex((t) => t.phone === item.phone)
//       );

//       setNumbers(uniqueItems);
//       setMessage(
//         `${uniqueItems.length} unique phone records loaded successfully.`
//       );
//       showAlert(
//         "Excel Loaded",
//         `${uniqueItems.length} records processed successfully.`,
//         "success"
//       );
//     } catch (error) {
//       console.error("Excel error:", error);
//       setMessage("Excel file read nahi ho saki.");
//       showAlert("Upload Error", "Excel file read nahi ho saki.", "error");
//     }
//   };

//   const toggleStaff = (id) => {
//     setSelectedStaff((prev) =>
//       prev.includes(id) ? prev.filter((staffId) => staffId !== id) : [...prev, id]
//     );
//   };

//   const selectAllStaff = () => {
//     if (selectedStaff.length === staff.length) {
//       setSelectedStaff([]);
//     } else {
//       setSelectedStaff(staff.map((user) => user.id || user._id));
//     }
//   };

//   const distributeNumbers = () => {
//     if (!numbers.length) {
//       showAlert("Error", "Pehle Excel file upload karein!", "error");
//       return null;
//     }

//     if (!selectedStaff.length) {
//       showAlert("Error", "Kam az kam 1 staff member select karein!", "error");
//       return null;
//     }

//     const assignments = {};
//     selectedStaff.forEach((staffId) => {
//       assignments[staffId] = [];
//     });

//     numbers.forEach((item, index) => {
//       const staffId = selectedStaff[index % selectedStaff.length];
//       assignments[staffId].push(item);
//     });

//     return assignments;
//   };

//   const handleConfirmLogout = async () => {
//     setLoggingOut(true);
//     try {
//       window.location.href = "/login";
//     } catch (err) {
//       console.error("Logout failed:", err);
//       setLoggingOut(false);
//     }
//   };

// const handleAssign = async () => {
//     const assignments = distributeNumbers();
//     if (!assignments) return;

//     setLoading(true);
//     setMessage("");

//     try {
//       const response = await fetch("/api/admin/daily-desk/assign", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           numbers,
//           selectedStaff,
//           distribution,
//           sourceFile: file?.name || null,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok || !data.success) {
//         throw new Error(data.message || "Numbers assign nahi ho sake.");
//       }

//       const successMsg = `${data.data.tasksSaved} tasks successfully assigned to ${data.data.staffCount} staff members!`;

//       setMessage(successMsg);
//       showAlert("Success!", successMsg, "success");

//       fetchDateWiseTasks(selectedDate);
//     } catch (error) {
//       console.error("Assignment error:", error);
//       const errorMsg = error.message || "Numbers assign nahi ho sake.";
//       setMessage(errorMsg);
//       showAlert("Assignment Failed", errorMsg, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 flex relative">
//       <Sidebar
//         sidebarOpen={sidebarOpen}
//         setSidebarOpen={setSidebarOpen}
//         setShowLogoutModal={setShowLogoutModal}
//       />

//       <div className="flex-1 lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">
//         {/* CUSTOM ALERT */}
//         {alertConfig.show && (
//           <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
//             <div
//               className={`flex items-start gap-4 p-4 rounded-2xl shadow-xl border max-w-md ${
//                 alertConfig.type === "success"
//                   ? "bg-emerald-50 border-emerald-200 text-emerald-900"
//                   : "bg-red-50 border-red-200 text-red-900"
//               }`}
//             >
//               <div
//                 className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
//                   alertConfig.type === "success"
//                     ? "bg-emerald-500 text-white"
//                     : "bg-red-500 text-white"
//                 }`}
//               >
//                 {alertConfig.type === "success" ? (
//                   <CheckCircle2 size={22} />
//                 ) : (
//                   <XCircle size={22} />
//                 )}
//               </div>

//               <div className="flex-1">
//                 <h3 className="font-extrabold text-sm">{alertConfig.title}</h3>
//                 <p className="text-xs mt-1 text-slate-600">{alertConfig.message}</p>
//               </div>

//               <button
//                 onClick={closeAlert}
//                 className="text-slate-400 hover:text-slate-600 transition"
//               >
//                 <X size={18} />
//               </button>
//             </div>
//           </div>
//         )}

//         <div className="max-w-7xl mx-auto space-y-6">
//           {/* HEADER */}
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => setSidebarOpen(true)}
//                 className="lg:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
//               >
//                 <Menu size={20} />
//               </button>
//               <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
//                 <ShieldCheck size={24} />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-black text-slate-900 tracking-tight">
//                   Daily Desk Admin
//                 </h1>
//                 <p className="text-xs font-medium text-slate-500 mt-0.5">
//                   Call List Distribution & Historical Records
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* MAIN FORM GRID */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
//               <div className="flex items-center gap-3 mb-5">
//                 <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
//                   <FileSpreadsheet size={20} />
//                 </div>
//                 <div>
//                   <h2 className="font-bold text-slate-900">Upload Daily Call List</h2>
//                   <p className="text-xs text-slate-500">Import phone records via Excel file</p>
//                 </div>
//               </div>

//               <label className="block cursor-pointer">
//                 <input
//                   type="file"
//                   accept=".xlsx,.xls,.csv"
//                   onChange={handleExcelUpload}
//                   className="hidden"
//                 />
//                 <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 rounded-2xl p-8 text-center transition group">
//                   <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto group-hover:scale-110 transition duration-200">
//                     <Upload size={24} />
//                   </div>
//                   <p className="mt-3 text-sm font-bold text-slate-700">
//                     {file ? file.name : "Click to upload Excel file"}
//                   </p>
//                   <p className="text-xs text-slate-400 mt-1">XLSX, XLS or CSV</p>
//                 </div>
//               </label>

//               <div className="mt-5 flex items-center justify-between bg-slate-50 rounded-xl p-4 border border-slate-100">
//                 <div className="flex items-center gap-3">
//                   <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
//                     <Phone size={17} />
//                   </div>
//                   <div>
//                     <p className="text-xs font-bold text-slate-800">Phone Records Loaded</p>
//                     <p className="text-[11px] text-slate-400">Unique numbers with Task IDs</p>
//                   </div>
//                 </div>
//                 <span className="text-xl font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
//                   {numbers.length}
//                 </span>
//               </div>
//             </div>

//             {/* STAFF SELECTION */}
//             <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 flex flex-col">
//               <div className="flex items-center justify-between mb-5">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
//                     <Users size={20} />
//                   </div>
//                   <div>
//                     <h2 className="font-bold text-slate-900">Select Staff</h2>
//                     <p className="text-xs text-slate-500">Active team members</p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={selectAllStaff}
//                   className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition"
//                 >
//                   {selectedStaff.length === staff.length ? "Unselect All" : "Select All"}
//                 </button>
//               </div>

//               <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 flex-1">
//                 {staff.map((user) => {
//                   const id = user.id || user._id;
//                   const selected = selectedStaff.includes(id);

//                   return (
//                     <button
//                       key={id}
//                       onClick={() => toggleStaff(id)}
//                       className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition duration-150 ${
//                         selected
//                           ? "border-blue-300 bg-blue-50/60 shadow-sm"
//                           : "border-slate-100 hover:bg-slate-50"
//                       }`}
//                     >
//                       <div
//                         className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
//                           selected
//                             ? "bg-blue-600 text-white"
//                             : "bg-slate-100 text-slate-600"
//                         }`}
//                       >
//                         {(user.name || user.fullName || "U").charAt(0).toUpperCase()}
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className="text-xs font-bold text-slate-800 truncate">
//                           {user.name || user.fullName}
//                         </p>
//                         <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
//                       </div>
//                       {selected && (
//                         <CheckCircle2 size={18} className="text-blue-600 shrink-0" />
//                       )}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           {/* DISTRIBUTION OPTIONS & SUBMIT */}
//           <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
//             <h2 className="font-bold text-slate-900">Number Distribution</h2>
//             <p className="text-xs text-slate-500 mt-0.5">
//               Select how tasks should be distributed among chosen staff members.
//             </p>

//             <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
//               <button
//                 onClick={() => setDistribution("equal")}
//                 className={`p-4 rounded-xl border text-left transition ${
//                   distribution === "equal"
//                     ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20"
//                     : "border-slate-200 hover:bg-slate-50"
//                 }`}
//               >
//                 <p className="text-sm font-bold text-slate-800">Equal Distribution</p>
//                 <p className="text-xs text-slate-500 mt-1">Divides records as evenly as possible.</p>
//               </button>

//               <button
//                 onClick={() => setDistribution("round")}
//                 className={`p-4 rounded-xl border text-left transition ${
//                   distribution === "round"
//                     ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20"
//                     : "border-slate-200 hover:bg-slate-50"
//                 }`}
//               >
//                 <p className="text-sm font-bold text-slate-800">Round Robin</p>
//                 <p className="text-xs text-slate-500 mt-1">Sequential rotation through selected staff.</p>
//               </button>
//             </div>

//             <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-5">
//               <div>
//                 {message && <p className="text-xs font-semibold text-blue-600">{message}</p>}
//               </div>

//               <button
//                 onClick={handleAssign}
//                 disabled={loading || !numbers.length || !selectedStaff.length}
//                 className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-blue-500/20"
//               >
//                 {loading ? (
//                   <>
//                     <Loader2 size={16} className="animate-spin" />
//                     Assigning Tasks...
//                   </>
//                 ) : (
//                   <>
//                     <CheckCircle2 size={16} />
//                     Assign Numbers
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* DATE-WISE HISTORY / RECORDS VIEW SECTION */}
//           <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-4">
//             <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
//                   <Calendar size={20} />
//                 </div>
//                 <div>
//                   <h2 className="font-bold text-slate-900">Date-wise Assigned History</h2>
//                   <p className="text-xs text-slate-500">Check and filter tasks assigned on a specific date</p>
//                 </div>
//               </div>

//               {/* Date Filter & Actions */}
//               <div className="flex flex-wrap items-center gap-3">
//                 <div className="relative flex items-center">
//                   <input
//                     type="date"
//                     value={selectedDate}
//                     onChange={(e) => setSelectedDate(e.target.value)}
//                     className="pl-3 pr-2 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                   {selectedDate !== todayStr && (
//                     <button
//                       onClick={() => setSelectedDate(todayStr)}
//                       className="ml-2 text-[11px] font-semibold text-blue-600 hover:underline"
//                     >
//                       Today
//                     </button>
//                   )}
//                 </div>

//                 <button
//                   onClick={() => fetchDateWiseTasks(selectedDate)}
//                   className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
//                   title="Refresh Data"
//                 >
//                   <RefreshCw size={16} className={fetchingHistory ? "animate-spin" : ""} />
//                 </button>
//               </div>
//             </div>

//             {/* Search and Status Filters Sub-Bar */}
//             <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
//               <div className="relative w-full sm:w-72">
//                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//                 <input
//                   type="text"
//                   placeholder="Search Task ID, Phone, Staff..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               {/* Status Filter Tabs */}
//               <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 w-full sm:w-auto justify-center">
//                 {["all", "pending", "completed"].map((st) => (
//                   <button
//                     key={st}
//                     onClick={() => setStatusFilter(st)}
//                     className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
//                       statusFilter === st
//                         ? "bg-white text-slate-900 shadow-sm"
//                         : "text-slate-500 hover:text-slate-700"
//                     }`}
//                   >
//                     {st}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* History Table */}
//             {fetchingHistory ? (
//               <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
//                 <Loader2 size={24} className="animate-spin text-blue-600" />
//                 <span className="text-xs">Loading records for {selectedDate}...</span>
//               </div>
//             ) : filteredRecords.length > 0 ? (
//               <div className="overflow-x-auto">
//                 <table className="w-full text-left text-xs">
//                   <thead>
//                     <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
//                       <th className="p-3">Task ID</th>
//                       <th className="p-3">Phone Number</th>
//                       <th className="p-3">Assigned Staff</th>
//                       <th className="p-3">Status</th>
//                       <th className="p-3 text-right">Time</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-slate-100">
//                     {filteredRecords.map((item, idx) => (
//                       <tr key={item._id || item.id || idx} className="hover:bg-slate-50/50">
//                         <td className="p-3 font-mono font-bold text-slate-800">
//                           {item.taskId || "N/A"}
//                         </td>
//                         <td className="p-3 font-semibold text-slate-700">{item.phone}</td>
//                         <td className="p-3">
//                           <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-bold">
//                             {item.assignedToName || item.assignedTo || "Staff Member"}
//                           </span>
//                         </td>
//                         <td className="p-3">
//                           <span
//                             className={`px-2 py-1 rounded-md font-bold text-[10px] ${
//                               item.status === "completed"
//                                 ? "bg-emerald-50 text-emerald-700"
//                                 : "bg-amber-50 text-amber-700"
//                             }`}
//                           >
//                             {(item.status || "Pending").toUpperCase()}
//                           </span>
//                         </td>
//                         <td className="p-3 text-right text-slate-400">
//                           {item.createdAt
//                             ? new Date(item.createdAt).toLocaleTimeString([], {
//                                 hour: "2-digit",
//                                 minute: "2-digit",
//                               })
//                             : "-"}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             ) : (
//               <div className="py-12 text-center text-slate-400 text-xs">
//                 Is date (<b>{selectedDate}</b>) ke liye koi assigned tasks nahi meil ya search result empty hai.
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* LOGOUT MODAL */}
//       {showLogoutModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
//           <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
//             <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
//               <LogOut size={22} />
//             </div>

//             <h3 className="text-base font-bold text-slate-900 text-center">Confirm Logout</h3>
//             <p className="text-xs text-slate-500 text-center mt-1">
//               Kya aap sach me account se log out karna chahte hain?
//             </p>

//             <div className="mt-6 flex items-center gap-3">
//               <button
//                 onClick={() => setShowLogoutModal(false)}
//                 disabled={loggingOut}
//                 className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleConfirmLogout}
//                 disabled={loggingOut}
//                 className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white flex items-center justify-center gap-2 transition shadow-md shadow-red-500/20"
//               >
//                 {loggingOut ? <Loader2 size={15} className="animate-spin" /> : "Logout"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import {
  Upload,
  Users,
  Phone,
  CheckCircle2,
  Loader2,
  FileSpreadsheet,
  ShieldCheck,
  XCircle,
  X,
  LogOut,
  Menu,
  Calendar,
  Search,
  RefreshCw,
} from "lucide-react";
import LogoutModal from "@/components/LogoutModal";

export default function AdminDailyDeskPage() {
    const router = useRouter();
  const [file, setFile] = useState(null);
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [numbers, setNumbers] = useState([]);
  const [distribution, setDistribution] = useState("equal"); // 'equal' | 'round'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Helper: Get local YYYY-MM-DD date string safely without UTC offset shift
  const getLocalDateString = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStr = useMemo(() => getLocalDateString(), []);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'pending' | 'completed'

  // Custom Alert Modal / Toast State
  const [alertConfig, setAlertConfig] = useState({
    show: false,
    title: "",
    message: "",
    type: "success",
  });

  const showAlert = useCallback((title, message, type = "success") => {
    setAlertConfig({ show: true, title, message, type });
  }, []);

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, show: false }));
  };

  // Fetch Active Staff Members
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await fetch("/api/new-users", { cache: "no-store" });
        const data = await res.json();
        const users = data.users || data.data || [];

        const staffUsers = users.filter((user) => {
          const role = (user.role || "").toLowerCase();
          return role === "staff" || role === "agent";
        });

        setStaff(staffUsers);
      } catch (error) {
        console.error("Fetch staff error:", error);
      }
    };

    fetchStaff();
  }, []);

  // Fetch Historical Tasks based on Selected Date
  const fetchDateWiseTasks = useCallback(
    async (dateStr) => {
      setFetchingHistory(true);
      try {
        const res = await fetch(`/api/admin/history?date=${dateStr}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (data.success) {
          setHistoryRecords(data.data || []);
        } else {
          setHistoryRecords([]);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
        setHistoryRecords([]);
      } finally {
        setFetchingHistory(false);
      }
    },
    []
  );

  useEffect(() => {
    if (selectedDate) {
      fetchDateWiseTasks(selectedDate);
    }
  }, [selectedDate, fetchDateWiseTasks]);

  // Client-side Filtering for History Records (Date + Search + Status)
  const filteredRecords = useMemo(() => {
    return historyRecords.filter((item) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        (item.taskId || "").toLowerCase().includes(query) ||
        (item.phone || "").toLowerCase().includes(query) ||
        (item.assignedToName || item.assignedTo || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all"
          ? true
          : (item.status || "pending").toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [historyRecords, searchQuery, statusFilter]);

  const handleExcelUpload = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    try {
      const XLSX = await import("xlsx");
      const buffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      const extracted = rows
        .map((row, index) => {
          // Flexible key lookup for phone
          const phoneKey = Object.keys(row).find((k) =>
            /phone|mobile|number|contact/i.test(k.trim())
          );
          const phone = phoneKey ? row[phoneKey] : null;
          const rawPhone = String(phone || "").trim();

          if (!rawPhone) return null;

          // Flexible key lookup for Task ID
          const taskKey = Object.keys(row).find((k) =>
            /task\s*id|id|tsk/i.test(k.trim())
          );
          const rawTaskId = taskKey ? row[taskKey] : `TSK-${1001 + index}`;

          return {
            taskId: String(rawTaskId || `TSK-${1001 + index}`).trim(),
            phone: rawPhone,
          };
        })
        .filter(Boolean);

      const uniqueItems = extracted.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.phone === item.phone)
      );

      setNumbers(uniqueItems);
      setMessage(`${uniqueItems.length} unique phone records loaded successfully.`);
      showAlert("Excel Loaded", `${uniqueItems.length} records processed successfully.`, "success");
    } catch (error) {
      console.error("Excel error:", error);
      setMessage("Excel file read nahi ho saki.");
      showAlert("Upload Error", "Excel file read nahi ho saki.", "error");
    }
  };

  const toggleStaff = (id) => {
    setSelectedStaff((prev) =>
      prev.includes(id) ? prev.filter((staffId) => staffId !== id) : [...prev, id]
    );
  };

  const selectAllStaff = () => {
    if (selectedStaff.length === staff.length) {
      setSelectedStaff([]);
    } else {
      setSelectedStaff(staff.map((user) => user.id || user._id));
    }
  };

  const distributeNumbers = () => {
    if (!numbers.length) {
      showAlert("Error", "Pehle Excel file upload karein!", "error");
      return null;
    }

    if (!selectedStaff.length) {
      showAlert("Error", "Kam az kam 1 staff member select karein!", "error");
      return null;
    }

    const assignments = {};
    selectedStaff.forEach((staffId) => {
      assignments[staffId] = [];
    });

    if (distribution === "equal") {
      const chunkSize = Math.ceil(numbers.length / selectedStaff.length);
      selectedStaff.forEach((staffId, index) => {
        const start = index * chunkSize;
        const end = start + chunkSize;
        assignments[staffId] = numbers.slice(start, end);
      });
    } else {
      // Round Robin distribution
      numbers.forEach((item, index) => {
        const staffId = selectedStaff[index % selectedStaff.length];
        assignments[staffId].push(item);
      });
    }

    return assignments;
  };

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

  const handleAssign = async () => {
    const assignments = distributeNumbers();
    if (!assignments) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/daily-desk/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numbers,
          selectedStaff,
          distribution,
          assignments,
          sourceFile: file?.name || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Numbers assign nahi ho sake.");
      }

      const successMsg = `${data.data?.tasksSaved || numbers.length} tasks successfully assigned to ${
        data.data?.staffCount || selectedStaff.length
      } staff members!`;

      setMessage(successMsg);
      showAlert("Success!", successMsg, "success");

      fetchDateWiseTasks(selectedDate);
    } catch (error) {
      console.error("Assignment error:", error);
      const errorMsg = error.message || "Numbers assign nahi ho sake.";
      setMessage(errorMsg);
      showAlert("Assignment Failed", errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex relative">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setShowLogoutModal={setShowLogoutModal}
      />

      <div className="flex-1 lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">
        {/* CUSTOM ALERT */}
        {alertConfig.show && (
          <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div
              className={`flex items-start gap-4 p-4 rounded-2xl shadow-xl border max-w-md ${
                alertConfig.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-red-50 border-red-200 text-red-900"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  alertConfig.type === "success"
                    ? "bg-emerald-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {alertConfig.type === "success" ? (
                  <CheckCircle2 size={22} />
                ) : (
                  <XCircle size={22} />
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-extrabold text-sm">{alertConfig.title}</h3>
                <p className="text-xs mt-1 text-slate-600">{alertConfig.message}</p>
              </div>

              <button
                onClick={closeAlert}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto space-y-6">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <Menu size={20} />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Daily Desk Admin
                </h1>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Call List Distribution & Historical Records
                </p>
              </div>
            </div>
          </div>

          {/* MAIN FORM GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Upload Daily Call List</h2>
                  <p className="text-xs text-slate-500">Import phone records via Excel file</p>
                </div>
              </div>

              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleExcelUpload}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 rounded-2xl p-8 text-center transition group">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto group-hover:scale-110 transition duration-200">
                    <Upload size={24} />
                  </div>
                  <p className="mt-3 text-sm font-bold text-slate-700">
                    {file ? file.name : "Click to upload Excel file"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">XLSX, XLS or CSV</p>
                </div>
              </label>

              <div className="mt-5 flex items-center justify-between bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Phone size={17} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Phone Records Loaded</p>
                    <p className="text-[11px] text-slate-400">Unique numbers with Task IDs</p>
                  </div>
                </div>
                <span className="text-xl font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                  {numbers.length}
                </span>
              </div>
            </div>

            {/* STAFF SELECTION */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">Select Staff</h2>
                    <p className="text-xs text-slate-500">Active team members</p>
                  </div>
                </div>
                <button
                  onClick={selectAllStaff}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition"
                >
                  {selectedStaff.length === staff.length ? "Unselect All" : "Select All"}
                </button>
              </div>

              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 flex-1">
                {staff.map((user) => {
                  const id = user.id || user._id;
                  const selected = selectedStaff.includes(id);

                  return (
                    <button
                      key={id}
                      onClick={() => toggleStaff(id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition duration-150 ${
                        selected
                          ? "border-blue-300 bg-blue-50/60 shadow-sm"
                          : "border-slate-100 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                          selected
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {(user.name || user.fullName || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {user.name || user.fullName}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                      </div>
                      {selected && (
                        <CheckCircle2 size={18} className="text-blue-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* DISTRIBUTION OPTIONS & SUBMIT */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-slate-900">Number Distribution</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select how tasks should be distributed among chosen staff members.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setDistribution("equal")}
                className={`p-4 rounded-xl border text-left transition ${
                  distribution === "equal"
                    ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <p className="text-sm font-bold text-slate-800">Equal Distribution</p>
                <p className="text-xs text-slate-500 mt-1">Divides records in continuous blocks evenly.</p>
              </button>

              <button
                onClick={() => setDistribution("round")}
                className={`p-4 rounded-xl border text-left transition ${
                  distribution === "round"
                    ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <p className="text-sm font-bold text-slate-800">Round Robin</p>
                <p className="text-xs text-slate-500 mt-1">Sequential rotation through selected staff.</p>
              </button>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-5">
              <div>
                {message && <p className="text-xs font-semibold text-blue-600">{message}</p>}
              </div>

              <button
                onClick={handleAssign}
                disabled={loading || !numbers.length || !selectedStaff.length}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-blue-500/20"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Assigning Tasks...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Assign Numbers
                  </>
                )}
              </button>
            </div>
          </div>

          {/* DATE-WISE HISTORY / RECORDS VIEW SECTION */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Date-wise Assigned History</h2>
                  <p className="text-xs text-slate-500">Check and filter tasks assigned on a specific date</p>
                </div>
              </div>

              {/* Date Filter & Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex items-center">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pl-3 pr-2 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {selectedDate !== todayStr && (
                    <button
                      onClick={() => setSelectedDate(todayStr)}
                      className="ml-2 text-[11px] font-semibold text-blue-600 hover:underline"
                    >
                      Today
                    </button>
                  )}
                </div>

                <button
                  onClick={() => fetchDateWiseTasks(selectedDate)}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  title="Refresh Data"
                >
                  <RefreshCw size={16} className={fetchingHistory ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            {/* Search and Status Filters Sub-Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Task ID, Phone, Staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 w-full sm:w-auto justify-center">
                {["all", "pending", "completed"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                      statusFilter === st
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* History Table */}
            {fetchingHistory ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 size={24} className="animate-spin text-blue-600" />
                <span className="text-xs">Loading records for {selectedDate}...</span>
              </div>
            ) : filteredRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3">Task ID</th>
                      <th className="p-3">Phone Number</th>
                      <th className="p-3">Assigned Staff</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecords.map((item, idx) => (
                      <tr key={item._id || item.id || idx} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-slate-800">
                          {item.taskId || "N/A"}
                        </td>
                        <td className="p-3 font-semibold text-slate-700">{item.phone}</td>
                        <td className="p-3">
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-bold">
                            {item.assignedToName || item.assignedTo || "Staff Member"}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-md font-bold text-[10px] ${
                              item.status === "completed"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {(item.status || "Pending").toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 text-right text-slate-400">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Is date (<b>{selectedDate}</b>) ke liye koi assigned tasks nahi mile ya search result empty hai.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LOGOUT MODAL */}
    <LogoutModal
  show={showLogoutModal}
  loggingOut={loggingOut}
  onCancel={() => setShowLogoutModal(false)}
  onConfirm={handleConfirmLogout}
/>
    </div>
  );
}