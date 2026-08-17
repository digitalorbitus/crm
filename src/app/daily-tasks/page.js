// "use client";

// import { useEffect, useState } from "react";
// import {
//   Upload,
//   Users,
//   Phone,
//   CheckCircle2,
//   Loader2,
//   FileSpreadsheet,
//   ShieldCheck,
// } from "lucide-react";

// export default function AdminDailyDeskPage() {
//   const [file, setFile] = useState(null);
//   const [staff, setStaff] = useState([]);
//   const [selectedStaff, setSelectedStaff] = useState([]);
//   const [numbers, setNumbers] = useState([]);
//   const [distribution, setDistribution] = useState("equal");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   // Get staff
//   useEffect(() => {
//     const fetchStaff = async () => {
//       try {
//         const res = await fetch("/api/new-users", {
//           cache: "no-store",
//         });

//         const data = await res.json();

//         const users = data.users || data.data || [];

//         // Sirf staff/agent
//         const staffUsers = users.filter((user) => {
//           const role = (user.role || "").toLowerCase();

//           return role === "staff" || role === "agent";
//         });

//         setStaff(staffUsers);
//       } catch (error) {
//         console.error(error);
//       }
//     };

//     fetchStaff();
//   }, []);

//   // Excel read
//   const handleExcelUpload = async (e) => {
//     const selectedFile = e.target.files?.[0];

//     if (!selectedFile) return;

//     setFile(selectedFile);

//     try {
//       const XLSX = await import("xlsx");

//       const buffer = await selectedFile.arrayBuffer();

//       const workbook = XLSX.read(buffer, {
//         type: "array",
//       });

//       const sheetName = workbook.SheetNames[0];

//       const worksheet = workbook.Sheets[sheetName];

//       const rows = XLSX.utils.sheet_to_json(worksheet, {
//         defval: "",
//       });

//       /*
//         Excel example:

//         name          phone
//         Ali           03001234567
//         Ahmed         03111234567
//         Usman         03221234567

//         Agar sirf phone column hai tab bhi chalega.
//       */

//       const extractedNumbers = rows
//         .map((row) => {
//           const phone =
//             row.phone ||
//             row.Phone ||
//             row.PHONE ||
//             row.number ||
//             row.Number ||
//             row.mobile ||
//             row.Mobile;

//           return String(phone || "").trim();
//         })
//         .filter(Boolean);

//       // Duplicate numbers remove
//       const uniqueNumbers = [...new Set(extractedNumbers)];

//       setNumbers(uniqueNumbers);

//       setMessage(
//         `${uniqueNumbers.length} unique phone numbers loaded successfully.`
//       );
//     } catch (error) {
//       console.error("Excel error:", error);
//       setMessage("Excel file read nahi ho saki.");
//     }
//   };

//   const toggleStaff = (id) => {
//     setSelectedStaff((prev) =>
//       prev.includes(id)
//         ? prev.filter((staffId) => staffId !== id)
//         : [...prev, id]
//     );
//   };

//   const selectAllStaff = () => {
//     if (selectedStaff.length === staff.length) {
//       setSelectedStaff([]);
//     } else {
//       setSelectedStaff(
//         staff.map((user) => user.id || user._id)
//       );
//     }
//   };

//   // Numbers distribution
//   const distributeNumbers = () => {
//     if (!numbers.length) {
//       setMessage("Pehle Excel upload karo.");
//       return;
//     }

//     if (!selectedStaff.length) {
//       setMessage("Kam az kam 1 staff select karo.");
//       return;
//     }

//     const assignments = {};

//     selectedStaff.forEach((staffId) => {
//       assignments[staffId] = [];
//     });

//     /*
//       Round-robin distribution.

//       Example:

//       100 numbers
//       4 staff

//       Staff 1 = 25
//       Staff 2 = 25
//       Staff 3 = 25
//       Staff 4 = 25
//     */

//     numbers.forEach((number, index) => {
//       const staffId =
//         selectedStaff[index % selectedStaff.length];

//       assignments[staffId].push(number);
//     });

//     console.log("ASSIGNMENTS:", assignments);

//     return assignments;
//   };

//   // const handleAssign = async () => {
//   //   const assignments = distributeNumbers();

//   //   if (!assignments) return;

//   //   setLoading(true);
//   //   setMessage("");

//   //   try {
//   //     const response = await fetch(
//   //       "/api/admin/daily-desk/assign",
//   //       {
//   //         method: "POST",
//   //         headers: {
//   //           "Content-Type": "application/json",
//   //         },
//   //         body: JSON.stringify({
//   //           assignments,
//   //         }),
//   //       }
//   //     );

//   //     const data = await response.json();

//   //     if (!response.ok) {
//   //       throw new Error(
//   //         data.message || "Assignment failed"
//   //       );
//   //     }

//   //     setMessage(
//   //       "Phone numbers successfully staff ko assign ho gaye."
//   //     );
//   //   } catch (error) {
//   //     console.error(error);

//   //     setMessage(
//   //       error.message || "Numbers assign nahi ho sake."
//   //     );
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const handleAssign = async () => {
//   const assignments = distributeNumbers();

//   if (!assignments) return;

//   setLoading(true);
//   setMessage("");

//   try {
//     localStorage.setItem(
//       "dailyDeskAssignments",
//       JSON.stringify(assignments)
//     );

//     console.log("ASSIGNMENTS SAVED:", assignments);

//     setMessage(
//       "Phone numbers successfully staff ko assign ho gaye."
//     );
//   } catch (error) {
//     console.error(error);

//     setMessage("Numbers assign nahi ho sake.");
//   } finally {
//     setLoading(false);
//   }
// };
//   return (
//     <div className="min-h-screen  bg-[#F8FAFC] p-6 lg:p-10">
//       <div className="max-w-7xl mx-auto">

//         {/* HEADER */}
//         <div className="mb-8">
//           <div className="flex items-center gap-3">

//             <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
//               <ShieldCheck size={22} />
//             </div>

//             <div>
//               <h1 className="text-2xl font-black text-slate-900">
//                 Daily Desk
//               </h1>

//               <p className="text-xs text-slate-500 mt-1">
//                 Admin • Daily Call List Management
//               </p>
//             </div>

//           </div>
//         </div>

//         {/* GRID */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

//           {/* EXCEL UPLOAD */}
//           <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

//             <div className="flex items-center gap-3 mb-5">
//               <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
//                 <FileSpreadsheet size={20} />
//               </div>

//               <div>
//                 <h2 className="font-bold text-slate-900">
//                   Upload Daily Call List
//                 </h2>

//                 <p className="text-xs text-slate-400">
//                   Excel se phone numbers import karein
//                 </p>
//               </div>
//             </div>

//             <label className="block cursor-pointer">

//               <input
//                 type="file"
//                 accept=".xlsx,.xls,.csv"
//                 onChange={handleExcelUpload}
//                 className="hidden"
//               />

//               <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 rounded-2xl p-10 text-center transition">

//                 <Upload
//                   size={30}
//                   className="mx-auto text-blue-600"
//                 />

//                 <p className="mt-3 text-sm font-bold text-slate-700">
//                   {file
//                     ? file.name
//                     : "Click to upload Excel file"}
//                 </p>

//                 <p className="text-xs text-slate-400 mt-1">
//                   XLSX, XLS or CSV
//                 </p>

//               </div>
//             </label>

//             {/* LOADED NUMBERS */}
//             <div className="mt-5 flex items-center justify-between bg-slate-50 rounded-xl p-4">

//               <div className="flex items-center gap-3">

//                 <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
//                   <Phone size={17} />
//                 </div>

//                 <div>
//                   <p className="text-xs font-bold text-slate-800">
//                     Phone Numbers
//                   </p>

//                   <p className="text-[11px] text-slate-400">
//                     Unique numbers loaded
//                   </p>
//                 </div>

//               </div>

//               <span className="text-xl font-black text-blue-600">
//                 {numbers.length}
//               </span>

//             </div>

//           </div>

//           {/* STAFF */}
//           <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

//             <div className="flex items-center justify-between mb-5">

//               <div className="flex items-center gap-3">

//                 <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
//                   <Users size={20} />
//                 </div>

//                 <div>
//                   <h2 className="font-bold text-slate-900">
//                     Staff
//                   </h2>

//                   <p className="text-xs text-slate-400">
//                     Select staff
//                   </p>
//                 </div>

//               </div>

//               <button
//                 onClick={selectAllStaff}
//                 className="text-[11px] font-bold text-blue-600"
//               >
//                 {selectedStaff.length === staff.length
//                   ? "Unselect"
//                   : "Select All"}
//               </button>

//             </div>

//             <div className="space-y-2 max-h-[320px] overflow-y-auto">

//               {staff.map((user) => {
//                 const id = user.id || user._id;

//                 const selected =
//                   selectedStaff.includes(id);

//                 return (
//                   <button
//                     key={id}
//                     onClick={() => toggleStaff(id)}
//                     className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition ${
//                       selected
//                         ? "border-blue-300 bg-blue-50"
//                         : "border-slate-100 hover:bg-slate-50"
//                     }`}
//                   >

//                     <div
//                       className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
//                         selected
//                           ? "bg-blue-600 text-white"
//                           : "bg-slate-100 text-slate-600"
//                       }`}
//                     >
//                       {(user.name || "U")
//                         .charAt(0)
//                         .toUpperCase()}
//                     </div>

//                     <div className="flex-1">

//                       <p className="text-xs font-bold text-slate-800">
//                         {user.name || user.fullName}
//                       </p>

//                       <p className="text-[10px] text-slate-400">
//                         {user.email}
//                       </p>

//                     </div>

//                     {selected && (
//                       <CheckCircle2
//                         size={17}
//                         className="text-blue-600"
//                       />
//                     )}

//                   </button>
//                 );
//               })}

//             </div>

//           </div>

//         </div>

//         {/* DISTRIBUTION */}
//         <div className="mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

//           <h2 className="font-bold text-slate-900">
//             Number Distribution
//           </h2>

//           <p className="text-xs text-slate-400 mt-1">
//             Phone numbers selected staff mein divide honge.
//           </p>

//           <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">

//             <button
//               onClick={() => setDistribution("equal")}
//               className={`p-4 rounded-xl border text-left ${
//                 distribution === "equal"
//                   ? "border-blue-400 bg-blue-50"
//                   : "border-slate-200"
//               }`}
//             >
//               <p className="text-sm font-bold">
//                 Equal Distribution
//               </p>

//               <p className="text-xs text-slate-400 mt-1">
//                 Har staff ko approximately equal numbers
//                 milenge.
//               </p>
//             </button>

//             <button
//               onClick={() => setDistribution("round")}
//               className={`p-4 rounded-xl border text-left ${
//                 distribution === "round"
//                   ? "border-blue-400 bg-blue-50"
//                   : "border-slate-200"
//               }`}
//             >
//               <p className="text-sm font-bold">
//                 Round Robin
//               </p>

//               <p className="text-xs text-slate-400 mt-1">
//                 Number 1 → Staff 1, Number 2 → Staff 2...
//               </p>
//             </button>

//           </div>

//           {/* ACTION */}
//           <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">

//             <div>
//               {message && (
//                 <p className="text-xs font-semibold text-blue-600">
//                   {message}
//                 </p>
//               )}
//             </div>

//             <button
//               onClick={handleAssign}
//               disabled={
//                 loading ||
//                 !numbers.length ||
//                 !selectedStaff.length
//               }
//               className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold flex items-center gap-2 transition"
//             >
//               {loading ? (
//                 <>
//                   <Loader2
//                     size={15}
//                     className="animate-spin"
//                   />
//                   Assigning...
//                 </>
//               ) : (
//                 <>
//                   <CheckCircle2 size={15} />
//                   Assign Numbers
//                 </>
//               )}
//             </button>

//           </div>

//         </div>

//         {/* PREVIEW */}
//         {numbers.length > 0 && selectedStaff.length > 0 && (
//           <div className="mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

//             <h2 className="font-bold text-slate-900 mb-5">
//               Assignment Preview
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

//               {selectedStaff.map((staffId) => {

//                 const user = staff.find(
//                   (s) => (s.id || s._id) === staffId
//                 );

//                 const staffIndex =
//                   selectedStaff.indexOf(staffId);

//                 const count =
//                   Math.floor(
//                     numbers.length /
//                       selectedStaff.length
//                   ) +
//                   (staffIndex <
//                   numbers.length %
//                     selectedStaff.length
//                     ? 1
//                     : 0);

//                 return (
//                   <div
//                     key={staffId}
//                     className="border border-slate-100 rounded-xl p-4 bg-slate-50"
//                   >

//                     <div className="flex items-center justify-between">

//                       <p className="text-xs font-bold text-slate-800">
//                         {user?.name || "Staff"}
//                       </p>

//                       <span className="text-sm font-black text-blue-600">
//                         {count}
//                       </span>

//                     </div>

//                     <p className="text-[10px] text-slate-400 mt-1">
//                       Phone numbers assigned
//                     </p>

//                   </div>
//                 );
//               })}

//             </div>

//           </div>
//         )}

//       </div>
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
//     const [loggingOut, setLoggingOut] = useState(false);
//     const [showLogoutModal, setShowLogoutModal] = useState(false);
  

//   // Custom Alert Modal / Toast State
//   const [alertConfig, setAlertConfig] = useState({
//     show: false,
//     title: "",
//     message: "",
//     type: "success", // 'success' | 'error'
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

//   const handleAssign = async () => {
//     const assignments = distributeNumbers();
//     if (!assignments) return;

//     setLoading(true);
//     setMessage("");

//     try {
//       localStorage.setItem("dailyDeskAssignments", JSON.stringify(assignments));

//       const successMsg = `${numbers.length} tasks successfully assigned to ${selectedStaff.length} staff members!`;
//       setMessage(successMsg);

//       // Trigger Custom Alert UI
//       showAlert("Success!", successMsg, "success");
//     } catch (error) {
//       console.error(error);
//       const failMsg = "Numbers assign nahi ho sake. Try again!";
//       setMessage(failMsg);
//       showAlert("Assignment Failed", failMsg, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 relative">
//       {/* CUSTOM FLOATING ALERT POPUP */}
//       {alertConfig.show && (
//         <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
//           <div
//             className={`flex items-start gap-4 p-4 rounded-2xl shadow-xl border max-w-md ${
//               alertConfig.type === "success"
//                 ? "bg-emerald-50 border-emerald-200 text-emerald-900"
//                 : "bg-red-50 border-red-200 text-red-900"
//             }`}
//           >
      
//             <div
//               className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
//                 alertConfig.type === "success"
//                   ? "bg-emerald-500 text-white"
//                   : "bg-red-500 text-white"
//               }`}
//             >
//               {alertConfig.type === "success" ? (
//                 <CheckCircle2 size={22} />
//               ) : (
//                 <XCircle size={22} />
//               )}
//             </div>

//             <div className="flex-1">
//               <h3 className="font-extrabold text-sm">{alertConfig.title}</h3>
//               <p className="text-xs mt-1 text-slate-600">{alertConfig.message}</p>
//             </div>

//             <button
//               onClick={closeAlert}
//               className="text-slate-400 hover:text-slate-600 transition"
//             >
//               <X size={18} />
//             </button>
//           </div>
//         </div>
//       )}

//                   {/* EXACT MATCH SIDEBAR COMPONENT */}
//                   <Sidebar
//                     sidebarOpen={sidebarOpen}
//                     setSidebarOpen={setSidebarOpen}
//                     setShowLogoutModal={setShowLogoutModal}
//                   />

//       <div className="max-w-7xl mx-auto">
//         {/* HEADER */}
//         <div className="mb-8">
//           <div className="flex items-center gap-3">
//             <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
//               <ShieldCheck size={22} />
//             </div>
//             <div>
//               <h1 className="text-2xl font-black text-slate-900">
//                 Daily Desk Admin
//               </h1>
//               <p className="text-xs text-slate-500 mt-1">
//                 Admin • Call List & Task Assignment
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* GRID */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* EXCEL UPLOAD */}
//           <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
//             <div className="flex items-center gap-3 mb-5">
//               <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
//                 <FileSpreadsheet size={20} />
//               </div>
//               <div>
//                 <h2 className="font-bold text-slate-900">
//                   Upload Daily Call List
//                 </h2>
//                 <p className="text-xs text-slate-400">
//                   Excel se phone numbers import karein
//                 </p>
//               </div>
//             </div>

//             <label className="block cursor-pointer">
//               <input
//                 type="file"
//                 accept=".xlsx,.xls,.csv"
//                 onChange={handleExcelUpload}
//                 className="hidden"
//               />
//               <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 rounded-2xl p-10 text-center transition">
//                 <Upload size={30} className="mx-auto text-blue-600" />
//                 <p className="mt-3 text-sm font-bold text-slate-700">
//                   {file ? file.name : "Click to upload Excel file"}
//                 </p>
//                 <p className="text-xs text-slate-400 mt-1">XLSX, XLS or CSV</p>
//               </div>
//             </label>

//             {/* LOADED NUMBERS COUNTER */}
//             <div className="mt-5 flex items-center justify-between bg-slate-50 rounded-xl p-4">
//               <div className="flex items-center gap-3">
//                 <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
//                   <Phone size={17} />
//                 </div>
//                 <div>
//                   <p className="text-xs font-bold text-slate-800">
//                     Phone Records Loaded
//                   </p>
//                   <p className="text-[11px] text-slate-400">
//                     Unique numbers with Task IDs
//                   </p>
//                 </div>
//               </div>
//               <span className="text-xl font-black text-blue-600">
//                 {numbers.length}
//               </span>
//             </div>
//           </div>

//           {/* STAFF SELECTION */}
//           <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
//             <div className="flex items-center justify-between mb-5">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
//                   <Users size={20} />
//                 </div>
//                 <div>
//                   <h2 className="font-bold text-slate-900">Select Staff</h2>
//                   <p className="text-xs text-slate-400">Active team members</p>
//                 </div>
//               </div>
//               <button
//                 onClick={selectAllStaff}
//                 className="text-[11px] font-bold text-blue-600"
//               >
//                 {selectedStaff.length === staff.length
//                   ? "Unselect"
//                   : "Select All"}
//               </button>
//             </div>

//             <div className="space-y-2 max-h-[320px] overflow-y-auto">
//               {staff.map((user) => {
//                 const id = user.id || user._id;
//                 const selected = selectedStaff.includes(id);

//                 return (
//                   <button
//                     key={id}
//                     onClick={() => toggleStaff(id)}
//                     className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition ${
//                       selected
//                         ? "border-blue-300 bg-blue-50"
//                         : "border-slate-100 hover:bg-slate-50"
//                     }`}
//                   >
//                     <div
//                       className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
//                         selected
//                           ? "bg-blue-600 text-white"
//                           : "bg-slate-100 text-slate-600"
//                       }`}
//                     >
//                       {(user.name || "U").charAt(0).toUpperCase()}
//                     </div>
//                     <div className="flex-1">
//                       <p className="text-xs font-bold text-slate-800">
//                         {user.name || user.fullName}
//                       </p>
//                       <p className="text-[10px] text-slate-400">{user.email}</p>
//                     </div>
//                     {selected && (
//                       <CheckCircle2 size={17} className="text-blue-600" />
//                     )}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         </div>

//         {/* DISTRIBUTION MODE & SUBMIT */}
//         <div className="mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
//           <h2 className="font-bold text-slate-900">Number Distribution</h2>
//           <p className="text-xs text-slate-400 mt-1">
//             Task distribution mechanism for selected staff.
//           </p>

//           <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
//             <button
//               onClick={() => setDistribution("equal")}
//               className={`p-4 rounded-xl border text-left ${
//                 distribution === "equal"
//                   ? "border-blue-400 bg-blue-50"
//                   : "border-slate-200"
//               }`}
//             >
//               <p className="text-sm font-bold">Equal Distribution</p>
//               <p className="text-xs text-slate-400 mt-1">
//                 Approximately equal numbers each.
//               </p>
//             </button>

//             <button
//               onClick={() => setDistribution("round")}
//               className={`p-4 rounded-xl border text-left ${
//                 distribution === "round"
//                   ? "border-blue-400 bg-blue-50"
//                   : "border-slate-200"
//               }`}
//             >
//               <p className="text-sm font-bold">Round Robin</p>
//               <p className="text-xs text-slate-400 mt-1">
//                 Sequence rotation per staff member.
//               </p>
//             </button>
//           </div>

//           <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
//             <div>
//               {message && (
//                 <p className="text-xs font-semibold text-blue-600">{message}</p>
//               )}
//             </div>

//             <button
//               onClick={handleAssign}
//               disabled={loading || !numbers.length || !selectedStaff.length}
//               className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold flex items-center gap-2 transition"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 size={15} className="animate-spin" />
//                   Assigning...
//                 </>
//               ) : (
//                 <>
//                   <CheckCircle2 size={15} />
//                   Assign Numbers
//                 </>
//               )}
//             </button>
//           </div>
//         </div>

//         {/* ASSIGNMENT PREVIEW */}
//         {numbers.length > 0 && selectedStaff.length > 0 && (
//           <div className="mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
//             <h2 className="font-bold text-slate-900 mb-5">
//               Assignment Preview
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
//               {selectedStaff.map((staffId) => {
//                 const user = staff.find((s) => (s.id || s._id) === staffId);
//                 const staffIndex = selectedStaff.indexOf(staffId);
//                 const count =
//                   Math.floor(numbers.length / selectedStaff.length) +
//                   (staffIndex < numbers.length % selectedStaff.length ? 1 : 0);

//                 return (
//                   <div
//                     key={staffId}
//                     className="border border-slate-100 rounded-xl p-4 bg-slate-50"
//                   >
//                     <div className="flex items-center justify-between">
//                       <p className="text-xs font-bold text-slate-800">
//                         {user?.name || "Staff"}
//                       </p>
//                       <span className="text-sm font-black text-blue-600">
//                         {count} tasks
//                       </span>
//                     </div>
//                     <p className="text-[10px] text-slate-400 mt-1">
//                       Tasks allocated
//                     </p>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
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
} from "lucide-react";

export default function AdminDailyDeskPage() {
  const [file, setFile] = useState(null);
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [numbers, setNumbers] = useState([]);
  const [distribution, setDistribution] = useState("equal");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Custom Alert Modal / Toast State
  const [alertConfig, setAlertConfig] = useState({
    show: false,
    title: "",
    message: "",
    type: "success",
  });

  const showAlert = (title, message, type = "success") => {
    setAlertConfig({ show: true, title, message, type });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, show: false }));
  };

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
          const phone =
            row.phone ||
            row.Phone ||
            row.PHONE ||
            row.number ||
            row.Number ||
            row.mobile ||
            row.Mobile;

          const rawPhone = String(phone || "").trim();
          if (!rawPhone) return null;

          const rawTaskId =
            row.taskId ||
            row.TaskId ||
            row["Task ID"] ||
            row["task_id"] ||
            row.id ||
            row.ID ||
            `TSK-${1001 + index}`;

          return {
            taskId: String(rawTaskId).trim(),
            phone: rawPhone,
          };
        })
        .filter(Boolean);

      const uniqueItems = extracted.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.phone === item.phone)
      );

      setNumbers(uniqueItems);
      setMessage(
        `${uniqueItems.length} unique phone records loaded successfully.`
      );
      showAlert(
        "Excel Loaded",
        `${uniqueItems.length} records processed successfully.`,
        "success"
      );
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

    numbers.forEach((item, index) => {
      const staffId = selectedStaff[index % selectedStaff.length];
      assignments[staffId].push(item);
    });

    return assignments;
  };



  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      // Add your logout logic here (e.g. clear session/cookies or hit endpoint)
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
      setLoggingOut(false);
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
        sourceFile: file?.name || null,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Numbers assign nahi ho sake."
      );
    }

    const successMsg =
      `${data.data.tasksSaved} tasks successfully ` +
      `assigned to ${data.data.staffCount} staff members!`;

    setMessage(successMsg);

    showAlert(
      "Success!",
      successMsg,
      "success"
    );
  } catch (error) {
    console.error("Assignment error:", error);

    const errorMsg =
      error.message || "Numbers assign nahi ho sake.";

    setMessage(errorMsg);

    showAlert(
      "Assignment Failed",
      errorMsg,
      "error"
    );
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen bg-slate-50 flex relative">
      {/* SIDEBAR COMPONENT */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setShowLogoutModal={setShowLogoutModal}
      />

      {/* MAIN CONTENT CONTAINER */}
      <div className="flex-1 lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">
        {/* CUSTOM FLOATING ALERT POPUP */}
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

        <div className="max-w-7xl mx-auto">
          {/* TOP BAR / HEADER */}
          <div className="mb-8 flex items-center justify-between">
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
                  Call List Distribution & Task Assignment
                </p>
              </div>
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* EXCEL UPLOAD */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">
                    Upload Daily Call List
                  </h2>
                  <p className="text-xs text-slate-500">
                    Import phone records via Excel file
                  </p>
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

              {/* LOADED NUMBERS COUNTER */}
              <div className="mt-5 flex items-center justify-between bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Phone size={17} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Phone Records Loaded
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Unique numbers with Task IDs
                    </p>
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
                  {selectedStaff.length === staff.length
                    ? "Unselect All"
                    : "Select All"}
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

          {/* DISTRIBUTION MODE & SUBMIT */}
          <div className="mt-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
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
                <p className="text-xs text-slate-500 mt-1">
                  Divides records as evenly as possible.
                </p>
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
                <p className="text-xs text-slate-500 mt-1">
                  Sequential rotation through selected staff.
                </p>
              </button>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-5">
              <div>
                {message && (
                  <p className="text-xs font-semibold text-blue-600">{message}</p>
                )}
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

          {/* ASSIGNMENT PREVIEW */}
          {numbers.length > 0 && selectedStaff.length > 0 && (
            <div className="mt-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-slate-900 mb-4">
                Assignment Preview
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {selectedStaff.map((staffId) => {
                  const user = staff.find((s) => (s.id || s._id) === staffId);
                  const staffIndex = selectedStaff.indexOf(staffId);
                  const count =
                    Math.floor(numbers.length / selectedStaff.length) +
                    (staffIndex < numbers.length % selectedStaff.length ? 1 : 0);

                  return (
                    <div
                      key={staffId}
                      className="border border-slate-100 rounded-xl p-4 bg-slate-50/70 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {user?.name || user?.fullName || "Staff"}
                        </p>
                        <span className="text-xs font-black text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded-md">
                          {count} tasks
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Allocated workload
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <LogOut size={22} />
            </div>

            <h3 className="text-base font-bold text-slate-900 text-center">
              Confirm Logout
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              Kya aap sach me account se log out karna chahte hain?
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={loggingOut}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                disabled={loggingOut}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white flex items-center justify-center gap-2 transition shadow-md shadow-red-500/20"
              >
                {loggingOut ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  "Logout"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}