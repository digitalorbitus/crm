






// "use client";

// import { useEffect, useMemo, useState } from "react";

// import {
//   CalendarDays,
//   Search,
//   FileSpreadsheet,
//   FileText,
//   RefreshCw,
//   Clock3,
//   LogIn,
//   LogOut,
//   Users,
//   X,
//   UsersRound,
//   CheckCircle2,
//   UserX,
//   Filter,
//   ChevronDown,
// } from "lucide-react";

// export default function Attendance() {
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [downloading, setDownloading] = useState(false);
//   const [error, setError] = useState("");

//   const [search, setSearch] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");

//   // =========================================================
//   // FETCH LOGIN HISTORY
//   // =========================================================

//   const fetchAttendance = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const res = await fetch("/api/login-history", {
//         method: "GET",
//         credentials: "include",
//         cache: "no-store",
//       });

//       if (!res.ok) {
//         throw new Error(
//           `Failed to load login history (${res.status})`
//         );
//       }

//       const data = await res.json();

//       console.log("LOGIN HISTORY API RESPONSE:", data);

//       const apiRecords = Array.isArray(data)
//         ? data
//         : Array.isArray(data?.history)
//         ? data.history
//         : Array.isArray(data?.data)
//         ? data.data
//         : Array.isArray(data?.records)
//         ? data.records
//         : Array.isArray(data?.loginHistory)
//         ? data.loginHistory
//         : [];

//       console.log("ATTENDANCE RECORDS:", apiRecords);

//       setRecords(apiRecords);
//     } catch (err) {
//       console.error("Attendance fetch error:", err);

//       setError(
//         err?.message || "Unable to load attendance records."
//       );

//       setRecords([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAttendance();
//   }, []);

//   // =========================================================
//   // HELPERS
//   // =========================================================

//   const getUserId = (row) => {
//     return (
//       row?.user_id ??
//       row?.userId ??
//       row?.user?.id ??
//       null
//     );
//   };

//   const getUserName = (row) => {
//     return (
//       row?.name ||
//       row?.user_name ||
//       row?.userName ||
//       row?.employee_name ||
//       row?.employeeName ||
//       row?.user?.name ||
//       "Unknown User"
//     );
//   };

//   const getEmail = (row) => {
//     return (
//       row?.email ||
//       row?.user_email ||
//       row?.userEmail ||
//       row?.user?.email ||
//       "-"
//     );
//   };

//   const getRole = (row) => {
//     return (
//       row?.role ||
//       row?.user_role ||
//       row?.userRole ||
//       row?.user?.role ||
//       "-"
//     );
//   };

//   const getTeam = (row) => {
//     return (
//       row?.team ||
//       row?.user_team ||
//       row?.userTeam ||
//       row?.user?.team ||
//       "-"
//     );
//   };

//   const getLoginTime = (row) => {
//     return (
//       row?.login_time ||
//       row?.loginTime ||
//       row?.login_at ||
//       row?.loginAt ||
//       row?.in_time ||
//       row?.inTime ||
//       null
//     );
//   };

//   const getLogoutTime = (row) => {
//     return (
//       row?.logout_time ||
//       row?.logoutTime ||
//       row?.logout_at ||
//       row?.logoutAt ||
//       row?.out_time ||
//       row?.outTime ||
//       null
//     );
//   };

//   // =========================================================
//   // DATE HELPERS
//   // =========================================================

//   const parseDate = (value) => {
//     if (!value) return null;

//     const date = new Date(value);

//     if (Number.isNaN(date.getTime())) {
//       return null;
//     }

//     return date;
//   };

//   const dateToKey = (date) => {
//     if (!date || Number.isNaN(date.getTime())) {
//       return "";
//     }

//     const year = date.getFullYear();
//     const month = String(
//       date.getMonth() + 1
//     ).padStart(2, "0");

//     const day = String(
//       date.getDate()
//     ).padStart(2, "0");

//     return `${year}-${month}-${day}`;
//   };

//   const getRecordDate = (row) => {
//     const login = parseDate(
//       getLoginTime(row)
//     );

//     if (login) {
//       return dateToKey(login);
//     }

//     const possibleDate =
//       row?.date ||
//       row?.attendance_date ||
//       row?.attendanceDate ||
//       row?.created_at ||
//       row?.createdAt;

//     const fallbackDate =
//       parseDate(possibleDate);

//     if (fallbackDate) {
//       return dateToKey(fallbackDate);
//     }

//     return "";
//   };

//   const formatDate = (value) => {
//     if (!value) return "null";

//     const date =
//       typeof value === "string" &&
//       /^\d{4}-\d{2}-\d{2}$/.test(value)
//         ? new Date(`${value}T00:00:00`)
//         : parseDate(value);

//     if (!date) return "null";

//     return date.toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     });
//   };

//   const formatTime = (value) => {
//     if (!value) return "null";

//     const date = parseDate(value);

//     if (!date) return "null";

//     return date.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const formatDateTime = (value) => {
//     if (!value) return "null";

//     const date = parseDate(value);

//     if (!date) return "null";

//     return `${date.toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     })} ${date.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//     })}`;
//   };

//   // =========================================================
//   // AVAILABLE DATE RANGE
//   // =========================================================

//   const availableDateRange = useMemo(() => {
//     const dates = records
//       .map((row) => getRecordDate(row))
//       .filter(Boolean)
//       .sort();

//     if (!dates.length) {
//       return {
//         min: "",
//         max: "",
//       };
//     }

//     return {
//       min: dates[0],
//       max: dates[dates.length - 1],
//     };
//   }, [records]);

//   // =========================================================
//   // ADD DAYS
//   // =========================================================

//   const addDays = (dateKey, amount) => {
//     const date = new Date(
//       `${dateKey}T00:00:00`
//     );

//     date.setDate(
//       date.getDate() + amount
//     );

//     return dateToKey(date);
//   };

//   // =========================================================
//   // GENERATE DATE RANGE
//   // =========================================================

//   const generateDateRange = (
//     startDate,
//     endDate
//   ) => {
//     if (!startDate || !endDate) {
//       return [];
//     }

//     if (startDate > endDate) {
//       return [];
//     }

//     const dates = [];

//     let current = startDate;

//     let counter = 0;

//     while (
//       current <= endDate &&
//       counter < 3660
//     ) {
//       dates.push(current);

//       current = addDays(
//         current,
//         1
//       );

//       counter++;
//     }

//     return dates;
//   };

//   // =========================================================
//   // USER KEY
//   // =========================================================

//   const getUserKey = (row) => {
//     const id = getUserId(row);

//     if (
//       id !== null &&
//       id !== undefined
//     ) {
//       return `user-${id}`;
//     }

//     return `email-${getEmail(
//       row
//     ).toLowerCase()}`;
//   };

//   // =========================================================
//   // UNIQUE USERS
//   // =========================================================

//   const users = useMemo(() => {
//     const map = new Map();

//     records.forEach((row) => {
//       const key = getUserKey(row);

//       if (!map.has(key)) {
//         map.set(key, {
//           key,
//           user_id: getUserId(row),
//           name: getUserName(row),
//           email: getEmail(row),
//           role: getRole(row),
//           team: getTeam(row),
//         });
//       }
//     });

//     return Array.from(
//       map.values()
//     ).sort((a, b) =>
//       a.name.localeCompare(
//         b.name
//       )
//     );
//   }, [records]);

//   // =========================================================
//   // ATTENDANCE MATRIX
//   // =========================================================

//   const attendanceMatrix = useMemo(() => {
//     if (!records.length) {
//       return [];
//     }

//     const startDate =
//       fromDate ||
//       availableDateRange.min;

//     const endDate =
//       toDate ||
//       availableDateRange.max;

//     const dates =
//       generateDateRange(
//         startDate,
//         endDate
//       );

//     if (!dates.length) {
//       return [];
//     }

//     // -------------------------------------------------------
//     // GROUP RECORDS BY USER + DATE
//     // -------------------------------------------------------

//     const grouped = new Map();

//     records.forEach((row) => {
//       const dateKey =
//         getRecordDate(row);

//       if (!dateKey) return;

//       if (
//         fromDate &&
//         dateKey < fromDate
//       ) {
//         return;
//       }

//       if (
//         toDate &&
//         dateKey > toDate
//       ) {
//         return;
//       }

//       const userKey =
//         getUserKey(row);

//       const groupKey =
//         `${userKey}__${dateKey}`;

//       if (!grouped.has(groupKey)) {
//         grouped.set(
//           groupKey,
//           []
//         );
//       }

//       grouped
//         .get(groupKey)
//         .push(row);
//     });

//     // -------------------------------------------------------
//     // CREATE USER + EVERY DATE
//     // -------------------------------------------------------

//     const result = [];

//     users.forEach((user) => {
//       dates.forEach((dateKey) => {
//         const groupKey =
//           `${user.key}__${dateKey}`;

//         const dayRecords =
//           grouped.get(
//             groupKey
//           ) || [];

//         // ---------------------------------------------------
//         // ABSENT
//         // ---------------------------------------------------

//         if (!dayRecords.length) {
//           result.push({
//             id: `missing-${user.key}-${dateKey}`,

//             user_id:
//               user.user_id,

//             name: user.name,
//             email: user.email,
//             role: user.role,
//             team: user.team,

//             attendance_date:
//               dateKey,

//             login_time: null,
//             logout_time: null,

//             hasRecord: false,

//             status: "Absent",
//           });

//           return;
//         }

//         // ---------------------------------------------------
//         // EARLIEST LOGIN
//         // ---------------------------------------------------

//         const loginRecords =
//           dayRecords
//             .map((row) => ({
//               row,
//               date: parseDate(
//                 getLoginTime(row)
//               ),
//             }))
//             .filter(
//               (item) =>
//                 item.date
//             );

//         const logoutRecords =
//           dayRecords
//             .map((row) => ({
//               row,
//               date: parseDate(
//                 getLogoutTime(row)
//               ),
//             }))
//             .filter(
//               (item) =>
//                 item.date
//             );

//         let earliestLogin =
//           null;

//         if (
//           loginRecords.length
//         ) {
//           earliestLogin =
//             loginRecords.reduce(
//               (
//                 earliest,
//                 current
//               ) =>
//                 current.date <
//                 earliest.date
//                   ? current
//                   : earliest
//             );
//         }

//         // ---------------------------------------------------
//         // LATEST LOGOUT
//         // ---------------------------------------------------

//         let latestLogout =
//           null;

//         if (
//           logoutRecords.length
//         ) {
//           latestLogout =
//             logoutRecords.reduce(
//               (
//                 latest,
//                 current
//               ) =>
//                 current.date >
//                 latest.date
//                   ? current
//                   : latest
//             );
//         }

//         const firstRow =
//           dayRecords[0];

//         const loginValue =
//           earliestLogin
//             ? getLoginTime(
//                 earliestLogin.row
//               )
//             : null;

//         const logoutValue =
//           latestLogout
//             ? getLogoutTime(
//                 latestLogout.row
//               )
//             : null;

//         let status = "Absent";

//         if (
//           loginValue &&
//           logoutValue
//         ) {
//           status = "Completed";
//         } else if (
//           loginValue &&
//           !logoutValue
//         ) {
//           status = "Working";
//         }

//         result.push({
//           id: `attendance-${user.key}-${dateKey}`,

//           user_id:
//             user.user_id,

//           name:
//             getUserName(
//               firstRow
//             ) || user.name,

//           email:
//             getEmail(
//               firstRow
//             ) || user.email,

//           role:
//             getRole(
//               firstRow
//             ) || user.role,

//           team:
//             getTeam(
//               firstRow
//             ) || user.team,

//           attendance_date:
//             dateKey,

//           login_time:
//             loginValue,

//           logout_time:
//             logoutValue,

//           hasRecord: true,

//           status,
//         });
//       });
//     });

//     // -------------------------------------------------------
//     // SEARCH
//     // -------------------------------------------------------

//     const searchValue =
//       search
//         .trim()
//         .toLowerCase();

//     const searched =
//       result.filter((row) => {
//         if (!searchValue) {
//           return true;
//         }

//         const name =
//           getUserName(
//             row
//           ).toLowerCase();

//         const email =
//           getEmail(
//             row
//           ).toLowerCase();

//         const role =
//           getRole(
//             row
//           ).toLowerCase();

//         const team =
//           getTeam(
//             row
//           ).toLowerCase();

//         return (
//           name.includes(
//             searchValue
//           ) ||
//           email.includes(
//             searchValue
//           ) ||
//           role.includes(
//             searchValue
//           ) ||
//           team.includes(
//             searchValue
//           )
//         );
//       });

//     // -------------------------------------------------------
//     // SORT
//     // -------------------------------------------------------

//     searched.sort((a, b) => {
//       if (
//         a.attendance_date <
//         b.attendance_date
//       ) {
//         return 1;
//       }

//       if (
//         a.attendance_date >
//         b.attendance_date
//       ) {
//         return -1;
//       }

//       return getUserName(
//         a
//       ).localeCompare(
//         getUserName(b)
//       );
//     });

//     return searched;
//   }, [
//     records,
//     users,
//     fromDate,
//     toDate,
//     search,
//     availableDateRange,
//   ]);

//   const filteredRecords =
//     attendanceMatrix;

//   // =========================================================
//   // STATUS
//   // =========================================================

//   const getStatus = (row) => {
//     if (
//       row?.status ===
//         "Completed" ||
//       row?.status ===
//         "Working" ||
//       row?.status ===
//         "Absent"
//     ) {
//       return row.status;
//     }

//     const login =
//       getLoginTime(row);

//     const logout =
//       getLogoutTime(row);

//     if (login && logout) {
//       return "Completed";
//     }

//     if (login && !logout) {
//       return "Working";
//     }

//     return "Absent";
//   };

//   // =========================================================
//   // STATS
//   // =========================================================

//   const totalRecords =
//     filteredRecords.length;

//   const completedCount =
//     filteredRecords.filter(
//       (row) =>
//         getStatus(row) ===
//         "Completed"
//     ).length;

//   const workingCount =
//     filteredRecords.filter(
//       (row) =>
//         getStatus(row) ===
//         "Working"
//     ).length;

//   const absentCount =
//     filteredRecords.filter(
//       (row) =>
//         getStatus(row) ===
//         "Absent"
//     ).length;

//   // =========================================================
//   // CLEAR FILTERS
//   // =========================================================

//   const clearFilters = () => {
//     setSearch("");
//     setFromDate("");
//     setToDate("");
//   };

//   // =========================================================
//   // EXCEL DOWNLOAD
//   // =========================================================

//   const downloadExcel =
//     async () => {
//       if (
//         !filteredRecords.length
//       ) {
//         alert(
//           "No attendance data available to download."
//         );
//         return;
//       }

//       try {
//         setDownloading(true);

//         const XLSX =
//           await import(
//             "xlsx"
//           );

//         const excelData =
//           filteredRecords.map(
//             (
//               row,
//               index
//             ) => {
//               const login =
//                 getLoginTime(
//                   row
//                 );

//               const logout =
//                 getLogoutTime(
//                   row
//                 );

//               return {
//                 "#":
//                   index + 1,

//                 "Employee Name":
//                   getUserName(
//                     row
//                   ),

//                 Email:
//                   getEmail(
//                     row
//                   ),

//                 Role:
//                   getRole(
//                     row
//                   ),

//                 Team:
//                   getTeam(
//                     row
//                   ),

//                 Date:
//                   formatDate(
//                     row.attendance_date
//                   ),

//                 "In Time":
//                   formatTime(
//                     login
//                   ),

//                 "Out Time":
//                   formatTime(
//                     logout
//                   ),

//                 "Login Date & Time":
//                   formatDateTime(
//                     login
//                   ),

//                 "Logout Date & Time":
//                   formatDateTime(
//                     logout
//                   ),

//                 Status:
//                   getStatus(
//                     row
//                   ),
//               };
//             }
//           );

//         // ---------------------------------------------------
//         // SUMMARY ROWS
//         // ---------------------------------------------------

//         const summaryData = [
//           {
//             "#": "",
//             "Employee Name":
//               "ATTENDANCE SUMMARY",
//             Email: "",
//             Role: "",
//             Team: "",
//             Date: "",
//             "In Time": "",
//             "Out Time": "",
//             "Login Date & Time":
//               "",
//             "Logout Date & Time":
//               "",
//             Status: "",
//           },

//           {
//             "#": "",
//             "Employee Name":
//               "Total Rows",
//             Email:
//               filteredRecords.length,
//             Role: "",
//             Team: "",
//             Date: "",
//             "In Time": "",
//             "Out Time": "",
//             "Login Date & Time":
//               "",
//             "Logout Date & Time":
//               "",
//             Status: "",
//           },

//           {
//             "#": "",
//             "Employee Name":
//               "Completed",
//             Email:
//               completedCount,
//             Role: "",
//             Team: "",
//             Date: "",
//             "In Time": "",
//             "Out Time": "",
//             "Login Date & Time":
//               "",
//             "Logout Date & Time":
//               "",
//             Status: "",
//           },

//           {
//             "#": "",
//             "Employee Name":
//               "Working",
//             Email:
//               workingCount,
//             Role: "",
//             Team: "",
//             Date: "",
//             "In Time": "",
//             "Out Time": "",
//             "Login Date & Time":
//               "",
//             "Logout Date & Time":
//               "",
//             Status: "",
//           },

//           {
//             "#": "",
//             "Employee Name":
//               "Absent",
//             Email:
//               absentCount,
//             Role: "",
//             Team: "",
//             Date: "",
//             "In Time": "",
//             "Out Time": "",
//             "Login Date & Time":
//               "",
//             "Logout Date & Time":
//               "",
//             Status: "",
//           },
//         ];

//         const worksheet =
//           XLSX.utils.json_to_sheet(
//             [
//               ...summaryData,
//               ...excelData,
//             ]
//           );

//         worksheet["!cols"] =
//           [
//             { wch: 7 },
//             { wch: 25 },
//             { wch: 35 },
//             { wch: 15 },
//             { wch: 18 },
//             { wch: 16 },
//             { wch: 16 },
//             { wch: 16 },
//             { wch: 25 },
//             { wch: 25 },
//             { wch: 14 },
//           ];

//         const workbook =
//           XLSX.utils.book_new();

//         XLSX.utils.book_append_sheet(
//           workbook,
//           worksheet,
//           "Attendance"
//         );

//         XLSX.writeFile(
//           workbook,
//           `attendance-${fromDate || "all"}-${toDate || "all"}.xlsx`
//         );
//       } catch (err) {
//         console.error(
//           "Excel download error:",
//           err
//         );

//         alert(
//           "Failed to download Excel file."
//         );
//       } finally {
//         setDownloading(false);
//       }
//     };

//   // =========================================================
//   // PDF DOWNLOAD
//   // =========================================================

//   const downloadPDF =
//     async () => {
//       if (
//         !filteredRecords.length
//       ) {
//         alert(
//           "No attendance data available to download."
//         );
//         return;
//       }

//       try {
//         setDownloading(true);

//         const {
//           default: jsPDF,
//         } = await import(
//           "jspdf"
//         );

//         const {
//           default: autoTable,
//         } = await import(
//           "jspdf-autotable"
//         );

//         const doc =
//           new jsPDF({
//             orientation:
//               "landscape",
//             unit: "mm",
//             format: "a4",
//           });

//         // ---------------------------------------------------
//         // TITLE
//         // ---------------------------------------------------

//         doc.setFontSize(18);

//         doc.text(
//           "Attendance Report",
//           14,
//           15
//         );

//         doc.setFontSize(9);

//         let filterText =
//           "All Dates";

//         if (
//           fromDate &&
//           toDate
//         ) {
//           filterText =
//             `${formatDate(
//               fromDate
//             )} to ${formatDate(
//               toDate
//             )}`;
//         } else if (
//           fromDate
//         ) {
//           filterText =
//             `From ${formatDate(
//               fromDate
//             )}`;
//         } else if (
//           toDate
//         ) {
//           filterText =
//             `Until ${formatDate(
//               toDate
//             )}`;
//         } else if (
//           availableDateRange.min &&
//           availableDateRange.max
//         ) {
//           filterText =
//             `${formatDate(
//               availableDateRange.min
//             )} to ${formatDate(
//               availableDateRange.max
//             )}`;
//         }

//         doc.text(
//           `Date Range: ${filterText}`,
//           14,
//           22
//         );

//         doc.text(
//           `Total Rows: ${totalRecords}`,
//           14,
//           28
//         );

//         doc.text(
//           `Completed: ${completedCount}`,
//           75,
//           28
//         );

//         doc.text(
//           `Working: ${workingCount}`,
//           130,
//           28
//         );

//         doc.text(
//           `Absent: ${absentCount}`,
//           180,
//           28
//         );

//         // ---------------------------------------------------
//         // TABLE
//         // ---------------------------------------------------

//         const tableData =
//           filteredRecords.map(
//             (
//               row,
//               index
//             ) => {
//               const login =
//                 getLoginTime(
//                   row
//                 );

//               const logout =
//                 getLogoutTime(
//                   row
//                 );

//               return [
//                 index + 1,
//                 getUserName(
//                   row
//                 ),
//                 getEmail(
//                   row
//                 ),
//                 getRole(
//                   row
//                 ),
//                 getTeam(
//                   row
//                 ),
//                 formatDate(
//                   row.attendance_date
//                 ),
//                 formatTime(
//                   login
//                 ),
//                 formatTime(
//                   logout
//                 ),
//                 getStatus(
//                   row
//                 ),
//               ];
//             }
//           );

//         autoTable(
//           doc,
//           {
//             startY: 34,

//             head: [
//               [
//                 "#",
//                 "Employee",
//                 "Email",
//                 "Role",
//                 "Team",
//                 "Date",
//                 "In Time",
//                 "Out Time",
//                 "Status",
//               ],
//             ],

//             body:
//               tableData,

//             theme:
//               "grid",

//             styles: {
//               fontSize: 7.5,
//               cellPadding: 2.5,
//             },

//             headStyles: {
//               fontSize: 7.5,
//               fontStyle:
//                 "bold",
//             },

//             columnStyles: {
//               0: {
//                 cellWidth: 8,
//               },

//               1: {
//                 cellWidth: 35,
//               },

//               2: {
//                 cellWidth: 52,
//               },

//               3: {
//                 cellWidth: 22,
//               },

//               4: {
//                 cellWidth: 25,
//               },

//               5: {
//                 cellWidth: 27,
//               },

//               6: {
//                 cellWidth: 24,
//               },

//               7: {
//                 cellWidth: 24,
//               },

//               8: {
//                 cellWidth: 27,
//               },
//             },

//             didParseCell:
//               (data) => {
//                 if (
//                   data.section ===
//                     "body" &&
//                   data.column.index ===
//                     8
//                 ) {
//                   const value =
//                     data.cell.raw;

//                   if (
//                     value ===
//                     "Completed"
//                   ) {
//                     data.cell.styles.textColor =
//                       [16, 185, 129];
//                   }

//                   if (
//                     value ===
//                     "Working"
//                   ) {
//                     data.cell.styles.textColor =
//                       [217, 119, 6];
//                   }

//                   if (
//                     value ===
//                     "Absent"
//                   ) {
//                     data.cell.styles.textColor =
//                       [100, 116, 139];
//                   }
//                 }
//               },
//           }
//         );

//         doc.save(
//           `attendance-${fromDate || "all"}-${toDate || "all"}.pdf`
//         );
//       } catch (err) {
//         console.error(
//           "PDF download error:",
//           err
//         );

//         alert(
//           "Failed to download PDF file."
//         );
//       } finally {
//         setDownloading(false);
//       }
//     };

//   // =========================================================
//   // STATUS UI
//   // =========================================================

//   const renderStatus =
//     (status) => {
//       if (
//         status ===
//         "Completed"
//       ) {
//         return (
//           <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
//             <CheckCircle2
//               size={13}
//             />
//             Completed
//           </span>
//         );
//       }

//       if (
//         status ===
//         "Working"
//       ) {
//         return (
//           <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700">
//             <Clock3
//               size={13}
//             />
//             Working
//           </span>
//         );
//       }

//       return (
//         <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-500">
//           <UserX
//             size={13}
//           />
//           Absent
//         </span>
//       );
//     };

//   // =========================================================
//   // UI
//   // =========================================================

//   return (
//     <div className="min-h-screen bg-[#F5F7FB] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

//       {/* =====================================================
//           TOP HEADER
//       ====================================================== */}

//       <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

//         <div>
//           <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
//             <CalendarDays
//               size={15}
//             />
//             Employee Management
//           </div>

//           <h1 className="text-3xl font-extrabold tracking-tight text-[#050B1E] sm:text-4xl">
//             Attendance
//           </h1>

//           <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-500">
//             Monitor daily employee attendance,
//             login activity and working status
//             from one place.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={
//             fetchAttendance
//           }
//           disabled={loading}
//           className="group inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 xl:self-auto"
//         >
//           <RefreshCw
//             size={16}
//             className={
//               loading
//                 ? "animate-spin"
//                 : "transition-transform duration-300 group-hover:rotate-180"
//             }
//           />

//           Refresh Data
//         </button>
//       </div>

//       {/* =====================================================
//           ERROR
//       ====================================================== */}

//       {error && (
//         <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">

//           <div>
//             <p className="font-bold">
//               Attendance API Error
//             </p>

//             <p className="mt-1 text-red-600">
//               {error}
//             </p>
//           </div>

//           <button
//             type="button"
//             onClick={() =>
//               setError("")
//             }
//             className="rounded-lg p-1 text-red-400 transition hover:bg-red-100 hover:text-red-700"
//           >
//             <X
//               size={17}
//             />
//           </button>
//         </div>
//       )}

//       {/* =====================================================
//           STATS
//       ====================================================== */}

//       <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

//         {/* TOTAL */}

//         <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

//           <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-blue-50 opacity-70" />

//           <div className="relative flex items-start justify-between">

//             <div>
//               <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
//                 Total Rows
//               </p>

//               <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#050B1E]">
//                 {totalRecords}
//               </p>

//               <p className="mt-1 text-xs text-slate-400">
//                 Attendance entries
//               </p>
//             </div>

//             <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
//               <Users
//                 size={20}
//               />
//             </div>
//           </div>
//         </div>

//         {/* COMPLETED */}

//         <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

//           <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-emerald-50 opacity-70" />

//           <div className="relative flex items-start justify-between">

//             <div>
//               <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
//                 Completed
//               </p>

//               <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#050B1E]">
//                 {completedCount}
//               </p>

//               <p className="mt-1 text-xs text-slate-400">
//                 Login + logout
//               </p>
//             </div>

//             <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
//               <CheckCircle2
//                 size={20}
//               />
//             </div>
//           </div>
//         </div>

//         {/* WORKING */}

//         <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

//           <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-amber-50 opacity-70" />

//           <div className="relative flex items-start justify-between">

//             <div>
//               <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
//                 Currently Working
//               </p>

//               <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#050B1E]">
//                 {workingCount}
//               </p>

//               <p className="mt-1 text-xs text-slate-400">
//                 No logout yet
//               </p>
//             </div>

//             <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
//               <Clock3
//                 size={20}
//               />
//             </div>
//           </div>
//         </div>

//         {/* ABSENT */}

//         <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

//           <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-slate-100 opacity-80" />

//           <div className="relative flex items-start justify-between">

//             <div>
//               <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
//                 Absent
//               </p>

//               <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#050B1E]">
//                 {absentCount}
//               </p>

//               <p className="mt-1 text-xs text-slate-400">
//                 No attendance record
//               </p>
//             </div>

//             <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
//               <UserX
//                 size={20}
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* =====================================================
//           FILTER / ACTION CARD
//       ====================================================== */}

//       <div className="mb-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

//         {/* CARD HEADER */}

//         <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

//           <div className="flex items-center gap-3">

//             <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#050B1E] text-white">
//               <Filter
//                 size={16}
//               />
//             </div>

//             <div>
//               <h2 className="text-sm font-bold text-[#050B1E]">
//                 Attendance Filters
//               </h2>

//               <p className="text-xs text-slate-400">
//                 Search and filter attendance records
//               </p>
//             </div>
//           </div>

//           {(search ||
//             fromDate ||
//             toDate) && (
//             <button
//               type="button"
//               onClick={
//                 clearFilters
//               }
//               className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-[#050B1E]"
//             >
//               <X
//                 size={14}
//               />
//               Clear all
//             </button>
//           )}
//         </div>

//         {/* FILTER BODY */}

//         <div className="p-5">

//           <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr_1fr_auto]">

//             {/* SEARCH */}

//             <div>
//               <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
//                 Search Employee
//               </label>

//               <div className="relative">

//                 <Search
//                   size={17}
//                   className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
//                 />

//                 <input
//                   type="text"
//                   value={
//                     search
//                   }
//                   onChange={(
//                     e
//                   ) =>
//                     setSearch(
//                       e.target.value
//                     )
//                   }
//                   placeholder="Name, email, role or team..."
//                   className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-[#050B1E] focus:bg-white focus:ring-4 focus:ring-slate-100"
//                 />

//                 {search && (
//                   <button
//                     type="button"
//                     onClick={() =>
//                       setSearch(
//                         ""
//                       )
//                     }
//                     className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
//                   >
//                     <X
//                       size={15}
//                     />
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* FROM */}

//             <div>
//               <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
//                 From Date
//               </label>

//               <div className="relative">
//                 <CalendarDays
//                   size={16}
//                   className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
//                 />

//                 <input
//                   type="date"
//                   value={
//                     fromDate
//                   }
//                   onChange={(
//                     e
//                   ) =>
//                     setFromDate(
//                       e.target.value
//                     )
//                   }
//                   className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 pl-10 text-sm font-medium text-slate-700 outline-none transition focus:border-[#050B1E] focus:bg-white focus:ring-4 focus:ring-slate-100"
//                 />
//               </div>
//             </div>

//             {/* TO */}

//             <div>
//               <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
//                 To Date
//               </label>

//               <div className="relative">
//                 <CalendarDays
//                   size={16}
//                   className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
//                 />

//                 <input
//                   type="date"
//                   value={
//                     toDate
//                   }
//                   onChange={(
//                     e
//                   ) =>
//                     setToDate(
//                       e.target.value
//                     )
//                   }
//                   className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 pl-10 text-sm font-medium text-slate-700 outline-none transition focus:border-[#050B1E] focus:bg-white focus:ring-4 focus:ring-slate-100"
//                 />
//               </div>
//             </div>

//             {/* CLEAR */}

//             <div className="flex items-end">
//               <button
//                 type="button"
//                 onClick={
//                   clearFilters
//                 }
//                 className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 lg:w-auto"
//               >
//                 <RefreshCw
//                   size={15}
//                 />
//                 Reset
//               </button>
//             </div>
//           </div>

//           {/* RANGE INFO */}

//           <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

//             <div className="flex items-center gap-2 text-xs text-slate-500">
//               <CalendarDays
//                 size={14}
//                 className="text-slate-400"
//               />

//               <span>
//                 Showing{" "}
//                 <strong className="text-slate-700">
//                   {filteredRecords.length}
//                 </strong>{" "}
//                 rows
//               </span>

//               {(fromDate ||
//                 toDate) && (
//                 <>
//                   <span className="text-slate-300">
//                     •
//                   </span>

//                   <span>
//                     Filtered date range
//                   </span>
//                 </>
//               )}
//             </div>

//             <div className="flex flex-wrap gap-2">

//               <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
//                 <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
//                 {completedCount} Completed
//               </span>

//               <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700">
//                 <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
//                 {workingCount} Working
//               </span>

//               <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-500">
//                 <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
//                 {absentCount} Absent
//               </span>
//             </div>
//           </div>

//           {/* DOWNLOAD BUTTONS */}

//           <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

//             <button
//               type="button"
//               onClick={
//                 downloadExcel
//               }
//               disabled={
//                 downloading ||
//                 !filteredRecords.length
//               }
//               className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               <FileSpreadsheet
//                 size={17}
//               />

//               {downloading
//                 ? "Preparing..."
//                 : "Download Excel"}
//             </button>

//             <button
//               type="button"
//               onClick={
//                 downloadPDF
//               }
//               disabled={
//                 downloading ||
//                 !filteredRecords.length
//               }
//               className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#050B1E] px-5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               <FileText
//                 size={17}
//               />

//               {downloading
//                 ? "Preparing..."
//                 : "Download PDF"}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* =====================================================
//           ATTENDANCE TABLE
//       ====================================================== */}

//       <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

//         {/* TABLE TOP */}

//         <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">

//           <div className="flex items-center gap-3">

//             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#050B1E]">
//               <Users
//                 size={18}
//               />
//             </div>

//             <div>
//               <h2 className="text-sm font-bold text-[#050B1E]">
//                 Attendance Records
//               </h2>

//               <p className="mt-0.5 text-xs text-slate-400">
//                 Daily login and logout history
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
//             <span className="rounded-lg bg-slate-50 px-3 py-2">
//               {filteredRecords.length} Records
//             </span>
//           </div>
//         </div>

//         {/* TABLE */}

//         <div className="overflow-x-auto">

//           <table className="w-full min-w-[1180px] border-collapse">

//             <thead className="sticky top-0 z-10">

//               <tr className="border-b border-slate-200 bg-[#F8FAFC]">

//                 <th className="px-5 py-3.5 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
//                   #
//                 </th>

//                 <th className="px-5 py-3.5 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
//                   Employee
//                 </th>

//                 <th className="px-5 py-3.5 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
//                   Role
//                 </th>

//                 <th className="px-5 py-3.5 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
//                   Team
//                 </th>

//                 <th className="px-5 py-3.5 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
//                   Date
//                 </th>

//                 <th className="px-5 py-3.5 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
//                   In Time
//                 </th>

//                 <th className="px-5 py-3.5 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
//                   Out Time
//                 </th>

//                 <th className="px-5 py-3.5 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
//                   Status
//                 </th>
//               </tr>
//             </thead>

//             <tbody>

//               {/* LOADING */}

//               {loading ? (
//                 <tr>
//                   <td
//                     colSpan={8}
//                     className="px-5 py-20 text-center"
//                   >
//                     <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
//                       <RefreshCw
//                         size={24}
//                         className="animate-spin text-slate-400"
//                       />
//                     </div>

//                     <p className="mt-4 text-sm font-bold text-slate-600">
//                       Loading attendance...
//                     </p>

//                     <p className="mt-1 text-xs text-slate-400">
//                       Please wait while we fetch the latest records.
//                     </p>
//                   </td>
//                 </tr>
//               ) : filteredRecords.length ===
//                 0 ? (
//                 <tr>
//                   <td
//                     colSpan={8}
//                     className="px-5 py-20 text-center"
//                   >
//                     <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
//                       <CalendarDays
//                         size={24}
//                         className="text-slate-400"
//                       />
//                     </div>

//                     <p className="mt-4 text-sm font-bold text-slate-600">
//                       No attendance records found
//                     </p>

//                     <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
//                       Try changing your search or date filters to find attendance records.
//                     </p>

//                     {(search ||
//                       fromDate ||
//                       toDate) && (
//                       <button
//                         type="button"
//                         onClick={
//                           clearFilters
//                         }
//                         className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#050B1E] px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
//                       >
//                         <RefreshCw
//                           size={13}
//                         />
//                         Clear Filters
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ) : (
//                 filteredRecords.map(
//                   (
//                     row,
//                     index
//                   ) => {
//                     const login =
//                       getLoginTime(
//                         row
//                       );

//                     const logout =
//                       getLogoutTime(
//                         row
//                       );

//                     const status =
//                       getStatus(
//                         row
//                       );

//                     const name =
//                       getUserName(
//                         row
//                       );

//                     const hasRecord =
//                       row?.hasRecord;

//                     return (
//                       <tr
//                         key={
//                           row?.id ||
//                           `${name}-${row?.attendance_date}-${index}`
//                         }
//                         className={`group border-b border-slate-100 transition-colors duration-150 ${
//                           status ===
//                           "Absent"
//                             ? "bg-slate-50/30 hover:bg-slate-50"
//                             : "hover:bg-[#F8FAFC]"
//                         }`}
//                       >

//                         {/* # */}

//                         <td className="px-5 py-4 text-xs font-bold text-slate-300">
//                           {String(
//                             index + 1
//                           ).padStart(
//                             2,
//                             "0"
//                           )}
//                         </td>

//                         {/* EMPLOYEE */}

//                         <td className="px-5 py-4">

//                           <div className="flex items-center gap-3">

//                             <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#050B1E] text-sm font-extrabold text-white shadow-sm">
//                               {name
//                                 .charAt(
//                                   0
//                                 )
//                                 .toUpperCase()}
//                             </div>

//                             <div className="min-w-0">

//                               <p className="truncate text-sm font-bold text-[#050B1E]">
//                                 {name}
//                               </p>

//                               <p className="mt-0.5 max-w-[240px] truncate text-xs text-slate-400">
//                                 {getEmail(
//                                   row
//                                 )}
//                               </p>
//                             </div>
//                           </div>
//                         </td>

//                         {/* ROLE */}

//                         <td className="px-5 py-4">

//                           <span className="inline-flex rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold capitalize text-slate-600">
//                             {getRole(
//                               row
//                             )}
//                           </span>
//                         </td>

//                         {/* TEAM */}

//                         <td className="px-5 py-4">

//                           <div className="flex items-center gap-2 text-sm font-medium text-slate-600">

//                             <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
//                               <UsersRound
//                                 size={13}
//                                 className="text-slate-400"
//                               />
//                             </div>

//                             {getTeam(
//                               row
//                             )}
//                           </div>
//                         </td>

//                         {/* DATE */}

//                         <td className="px-5 py-4">

//                           <div className="flex items-center gap-2">

//                             <CalendarDays
//                               size={14}
//                               className="text-slate-400"
//                             />

//                             <span className="text-sm font-semibold text-slate-600">
//                               {formatDate(
//                                 row.attendance_date
//                               )}
//                             </span>
//                           </div>
//                         </td>

//                         {/* IN */}

//                         <td className="px-5 py-4">

//                           <div
//                             className={`flex items-center gap-2 ${
//                               hasRecord
//                                 ? "text-emerald-600"
//                                 : "text-slate-300"
//                             }`}
//                           >

//                             <span
//                               className={`flex h-8 w-8 items-center justify-center rounded-lg ${
//                                 hasRecord
//                                   ? "bg-emerald-50"
//                                   : "bg-slate-100"
//                               }`}
//                             >
//                               <LogIn
//                                 size={14}
//                               />
//                             </span>

//                             <span className="text-sm font-bold">
//                               {formatTime(
//                                 login
//                               )}
//                             </span>
//                           </div>
//                         </td>

//                         {/* OUT */}

//                         <td className="px-5 py-4">

//                           <div
//                             className={`flex items-center gap-2 ${
//                               hasRecord
//                                 ? "text-rose-600"
//                                 : "text-slate-300"
//                             }`}
//                           >

//                             <span
//                               className={`flex h-8 w-8 items-center justify-center rounded-lg ${
//                                 hasRecord
//                                   ? "bg-rose-50"
//                                   : "bg-slate-100"
//                               }`}
//                             >
//                               <LogOut
//                                 size={14}
//                               />
//                             </span>

//                             <span className="text-sm font-bold">
//                               {formatTime(
//                                 logout
//                               )}
//                             </span>
//                           </div>
//                         </td>

//                         {/* STATUS */}

//                         <td className="px-5 py-4">
//                           {renderStatus(
//                             status
//                           )}
//                         </td>
//                       </tr>
//                     );
//                   }
//                 )
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* TABLE FOOTER */}

//         {!loading &&
//           filteredRecords.length >
//             0 && (
//             <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3.5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

//               <span>
//                 Showing{" "}
//                 <strong className="text-slate-600">
//                   {filteredRecords.length}
//                 </strong>{" "}
//                 attendance rows
//               </span>

//               <div className="flex items-center gap-4">

//                 <span className="flex items-center gap-1.5">
//                   <span className="h-2 w-2 rounded-full bg-emerald-500" />
//                   Completed
//                 </span>

//                 <span className="flex items-center gap-1.5">
//                   <span className="h-2 w-2 rounded-full bg-amber-500" />
//                   Working
//                 </span>

//                 <span className="flex items-center gap-1.5">
//                   <span className="h-2 w-2 rounded-full bg-slate-400" />
//                   Absent
//                 </span>
//               </div>
//             </div>
//           )}
//       </div>
//     </div>
//   );
// }





























"use client";

import { useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  Search,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Clock3,
  LogIn,
  LogOut,
  Users,
  X,
  UsersRound,
  CheckCircle2,
  UserX,
  Filter,
  ChevronDown,
  Pencil,
  Trash2,
  Plus,
  Save,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // =========================================================
  // ADD / EDIT / DELETE STATES
  // =========================================================

  const [showAttendanceModal, setShowAttendanceModal] =
    useState(false);

  const [modalMode, setModalMode] = useState("add");

  const [selectedAttendance, setSelectedAttendance] =
    useState(null);

  const [savingAttendance, setSavingAttendance] =
    useState(false);

  const [deletingAttendanceId, setDeletingAttendanceId] =
    useState(null);

  const [attendanceForm, setAttendanceForm] = useState({
    id: null,
    user_id: "",
    date: "",
    login_time: "",
    logout_time: "",
  });

  // =========================================================
  // FETCH LOGIN HISTORY
  // =========================================================

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/login-history", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(
          `Failed to load login history (${res.status})`
        );
      }

      const data = await res.json();

      console.log("LOGIN HISTORY API RESPONSE:", data);

      const apiRecords = Array.isArray(data)
        ? data
        : Array.isArray(data?.history)
        ? data.history
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.records)
        ? data.records
        : Array.isArray(data?.loginHistory)
        ? data.loginHistory
        : [];

      console.log("ATTENDANCE RECORDS:", apiRecords);

      setRecords(apiRecords);
    } catch (err) {
      console.error("Attendance fetch error:", err);

      setError(
        err?.message || "Unable to load attendance records."
      );

      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // =========================================================
  // HELPERS
  // =========================================================

  const getUserId = (row) => {
    return (
      row?.user_id ??
      row?.userId ??
      row?.user?.id ??
      null
    );
  };

  const getUserName = (row) => {
    return (
      row?.name ||
      row?.user_name ||
      row?.userName ||
      row?.employee_name ||
      row?.employeeName ||
      row?.user?.name ||
      "Unknown User"
    );
  };

  const getEmail = (row) => {
    return (
      row?.email ||
      row?.user_email ||
      row?.userEmail ||
      row?.user?.email ||
      "-"
    );
  };

  const getRole = (row) => {
    return (
      row?.role ||
      row?.user_role ||
      row?.userRole ||
      row?.user?.role ||
      "-"
    );
  };

  const getTeam = (row) => {
    return (
      row?.team ||
      row?.user_team ||
      row?.userTeam ||
      row?.user?.team ||
      "-"
    );
  };

  const getLoginTime = (row) => {
    return (
      row?.login_time ||
      row?.loginTime ||
      row?.login_at ||
      row?.loginAt ||
      row?.in_time ||
      row?.inTime ||
      null
    );
  };

  const getLogoutTime = (row) => {
    return (
      row?.logout_time ||
      row?.logoutTime ||
      row?.logout_at ||
      row?.logoutAt ||
      row?.out_time ||
      row?.outTime ||
      null
    );
  };

  // =========================================================
  // DATE HELPERS
  // =========================================================

  const parseDate = (value) => {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  };

  const dateToKey = (date) => {
    if (!date || Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getRecordDate = (row) => {
    const login = parseDate(
      getLoginTime(row)
    );

    if (login) {
      return dateToKey(login);
    }

    const possibleDate =
      row?.date ||
      row?.attendance_date ||
      row?.attendanceDate ||
      row?.created_at ||
      row?.createdAt;

    const fallbackDate =
      parseDate(possibleDate);

    if (fallbackDate) {
      return dateToKey(fallbackDate);
    }

    return "";
  };

  const formatDate = (value) => {
    if (!value) return "null";

    const date =
      typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(`${value}T00:00:00`)
        : parseDate(value);

    if (!date) return "null";

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (value) => {
    if (!value) return "null";

    const date = parseDate(value);

    if (!date) return "null";

    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTime = (value) => {
    if (!value) return "null";

    const date = parseDate(value);

    if (!date) return "null";

    return `${date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })} ${date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })}`;
  };

  // =========================================================
  // FORM DATE HELPERS
  // =========================================================

  const toDateTimeLocalValue = (value) => {
    if (!value) return "";

    const date = parseDate(value);

    if (!date) return "";

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

  const dateTimeLocalToMySQL = (value) => {
    if (!value) return null;

    return value.replace("T", " ") + ":00";
  };

  // =========================================================
  // AVAILABLE DATE RANGE
  // =========================================================

  const availableDateRange = useMemo(() => {
    const dates = records
      .map((row) => getRecordDate(row))
      .filter(Boolean)
      .sort();

    if (!dates.length) {
      return {
        min: "",
        max: "",
      };
    }

    return {
      min: dates[0],
      max: dates[dates.length - 1],
    };
  }, [records]);

  // =========================================================
  // ADD DAYS
  // =========================================================

  const addDays = (dateKey, amount) => {
    const date = new Date(
      `${dateKey}T00:00:00`
    );

    date.setDate(
      date.getDate() + amount
    );

    return dateToKey(date);
  };

  // =========================================================
  // GENERATE DATE RANGE
  // =========================================================

  const generateDateRange = (
    startDate,
    endDate
  ) => {
    if (!startDate || !endDate) {
      return [];
    }

    if (startDate > endDate) {
      return [];
    }

    const dates = [];

    let current = startDate;

    let counter = 0;

    while (
      current <= endDate &&
      counter < 3660
    ) {
      dates.push(current);

      current = addDays(
        current,
        1
      );

      counter++;
    }

    return dates;
  };

  // =========================================================
  // USER KEY
  // =========================================================

  const getUserKey = (row) => {
    const id = getUserId(row);

    if (
      id !== null &&
      id !== undefined
    ) {
      return `user-${id}`;
    }

    return `email-${getEmail(
      row
    ).toLowerCase()}`;
  };

  // =========================================================
  // UNIQUE USERS
  // =========================================================

  const users = useMemo(() => {
    const map = new Map();

    records.forEach((row) => {
      const key = getUserKey(row);

      if (!map.has(key)) {
        map.set(key, {
          key,
          user_id: getUserId(row),
          name: getUserName(row),
          email: getEmail(row),
          role: getRole(row),
          team: getTeam(row),
        });
      }
    });

    return Array.from(
      map.values()
    ).sort((a, b) =>
      a.name.localeCompare(
        b.name
      )
    );
  }, [records]);

  // =========================================================
  // ATTENDANCE MATRIX
  // =========================================================

  const attendanceMatrix = useMemo(() => {
    if (!records.length) {
      return [];
    }

    const startDate =
      fromDate ||
      availableDateRange.min;

    const endDate =
      toDate ||
      availableDateRange.max;

    const dates =
      generateDateRange(
        startDate,
        endDate
      );

    if (!dates.length) {
      return [];
    }

    const grouped = new Map();

    records.forEach((row) => {
      const dateKey =
        getRecordDate(row);

      if (!dateKey) return;

      if (
        fromDate &&
        dateKey < fromDate
      ) {
        return;
      }

      if (
        toDate &&
        dateKey > toDate
      ) {
        return;
      }

      const userKey =
        getUserKey(row);

      const groupKey =
        `${userKey}__${dateKey}`;

      if (!grouped.has(groupKey)) {
        grouped.set(
          groupKey,
          []
        );
      }

      grouped
        .get(groupKey)
        .push(row);
    });

    const result = [];

    users.forEach((user) => {
      dates.forEach((dateKey) => {
        const groupKey =
          `${user.key}__${dateKey}`;

        const dayRecords =
          grouped.get(
            groupKey
          ) || [];

        // ===================================================
        // ABSENT
        // ===================================================

        if (!dayRecords.length) {
          result.push({
            id: `missing-${user.key}-${dateKey}`,

            sourceRecordId: null,

            user_id:
              user.user_id,

            name: user.name,
            email: user.email,
            role: user.role,
            team: user.team,

            attendance_date:
              dateKey,

            login_time: null,
            logout_time: null,

            hasRecord: false,

            status: "Absent",
          });

          return;
        }

        // ===================================================
        // EARLIEST LOGIN
        // ===================================================

        const loginRecords =
          dayRecords
            .map((row) => ({
              row,
              date: parseDate(
                getLoginTime(row)
              ),
            }))
            .filter(
              (item) =>
                item.date
            );

        const logoutRecords =
          dayRecords
            .map((row) => ({
              row,
              date: parseDate(
                getLogoutTime(row)
              ),
            }))
            .filter(
              (item) =>
                item.date
            );

        let earliestLogin =
          null;

        if (
          loginRecords.length
        ) {
          earliestLogin =
            loginRecords.reduce(
              (
                earliest,
                current
              ) =>
                current.date <
                earliest.date
                  ? current
                  : earliest
            );
        }

        // ===================================================
        // LATEST LOGOUT
        // ===================================================

        let latestLogout =
          null;

        if (
          logoutRecords.length
        ) {
          latestLogout =
            logoutRecords.reduce(
              (
                latest,
                current
              ) =>
                current.date >
                latest.date
                  ? current
                  : latest
            );
        }

        const firstRow =
          dayRecords[0];

        const loginValue =
          earliestLogin
            ? getLoginTime(
                earliestLogin.row
              )
            : null;

        const logoutValue =
          latestLogout
            ? getLogoutTime(
                latestLogout.row
              )
            : null;

        // ===================================================
        // SOURCE DATABASE RECORD
        // ===================================================

        const loginSourceRow =
          earliestLogin?.row ||
          firstRow;

        const logoutSourceRow =
          latestLogout?.row ||
          firstRow;

        /*
         * Prefer the login source because PUT needs
         * one actual login_history ID.
         *
         * For normal attendance there is one row,
         * so this is the correct DB ID.
         */

        const sourceRecordId =
          loginSourceRow?.id ||
          logoutSourceRow?.id ||
          null;

        // ===================================================
        // STATUS
        // ===================================================

        let status = "Absent";

        if (
          loginValue &&
          logoutValue
        ) {
          status = "Completed";
        } else if (
          loginValue &&
          !logoutValue
        ) {
          status = "Working";
        }

        result.push({
          id: `attendance-${user.key}-${dateKey}`,

          sourceRecordId,

          user_id:
            user.user_id,

          name:
            getUserName(
              firstRow
            ) || user.name,

          email:
            getEmail(
              firstRow
            ) || user.email,

          role:
            getRole(
              firstRow
            ) || user.role,

          team:
            getTeam(
              firstRow
            ) || user.team,

          attendance_date:
            dateKey,

          login_time:
            loginValue,

          logout_time:
            logoutValue,

          hasRecord: true,

          status,
        });
      });
    });

    // =======================================================
    // SEARCH
    // =======================================================

    const searchValue =
      search
        .trim()
        .toLowerCase();

    const searched =
      result.filter((row) => {
        if (!searchValue) {
          return true;
        }

        const name =
          getUserName(
            row
          ).toLowerCase();

        const email =
          getEmail(
            row
          ).toLowerCase();

        const role =
          getRole(
            row
          ).toLowerCase();

        const team =
          getTeam(
            row
          ).toLowerCase();

        return (
          name.includes(
            searchValue
          ) ||
          email.includes(
            searchValue
          ) ||
          role.includes(
            searchValue
          ) ||
          team.includes(
            searchValue
          )
        );
      });

    // =======================================================
    // SORT
    // =======================================================

    searched.sort((a, b) => {
      if (
        a.attendance_date <
        b.attendance_date
      ) {
        return 1;
      }

      if (
        a.attendance_date >
        b.attendance_date
      ) {
        return -1;
      }

      return getUserName(
        a
      ).localeCompare(
        getUserName(b)
      );
    });

    return searched;
  }, [
    records,
    users,
    fromDate,
    toDate,
    search,
    availableDateRange,
  ]);

  const filteredRecords =
    attendanceMatrix;

  // =========================================================
  // STATUS
  // =========================================================

  const getStatus = (row) => {
    if (
      row?.status ===
        "Completed" ||
      row?.status ===
        "Working" ||
      row?.status ===
        "Absent"
    ) {
      return row.status;
    }

    const login =
      getLoginTime(row);

    const logout =
      getLogoutTime(row);

    if (login && logout) {
      return "Completed";
    }

    if (login && !logout) {
      return "Working";
    }

    return "Absent";
  };

  // =========================================================
  // STATS
  // =========================================================

  const totalRecords =
    filteredRecords.length;

  const completedCount =
    filteredRecords.filter(
      (row) =>
        getStatus(row) ===
        "Completed"
    ).length;

  const workingCount =
    filteredRecords.filter(
      (row) =>
        getStatus(row) ===
        "Working"
    ).length;

  const absentCount =
    filteredRecords.filter(
      (row) =>
        getStatus(row) ===
        "Absent"
    ).length;

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
  };

  // =========================================================
  // OPEN ADD MODAL
  // =========================================================

  const openAddAttendance = () => {
    const defaultDate =
      fromDate ||
      toDate ||
      availableDateRange.max ||
      dateToKey(new Date());

    setModalMode("add");

    setSelectedAttendance(null);

    setAttendanceForm({
      id: null,
      user_id:
        users.length === 1
          ? String(users[0].user_id)
          : "",
      date: defaultDate,
      login_time: "",
      logout_time: "",
    });

    setShowAttendanceModal(true);
  };

  // =========================================================
  // OPEN ADD MODAL FOR ABSENT ROW
  // =========================================================

  const openAddAttendanceForRow = (
    row
  ) => {
    setModalMode("add");

    setSelectedAttendance(row);

    setAttendanceForm({
      id: null,

      user_id:
        row?.user_id !== null &&
        row?.user_id !== undefined
          ? String(row.user_id)
          : "",

      date:
        row?.attendance_date ||
        dateToKey(new Date()),

      login_time: "",
      logout_time: "",
    });

    setShowAttendanceModal(true);
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const openEditAttendance = (
    row
  ) => {
    if (!row?.sourceRecordId) {
      alert(
        "Original database record was not found."
      );
      return;
    }

    setModalMode("edit");

    setSelectedAttendance(row);

    setAttendanceForm({
      id:
        row.sourceRecordId,

      user_id:
        row?.user_id !== null &&
        row?.user_id !== undefined
          ? String(row.user_id)
          : "",

      date:
        row?.attendance_date ||
        dateToKey(
          parseDate(
            row?.login_time
          )
        ),

      login_time:
        toDateTimeLocalValue(
          row?.login_time
        ),

      logout_time:
        toDateTimeLocalValue(
          row?.logout_time
        ),
    });

    setShowAttendanceModal(true);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeAttendanceModal = () => {
    if (savingAttendance) {
      return;
    }

    setShowAttendanceModal(false);

    setSelectedAttendance(null);

    setAttendanceForm({
      id: null,
      user_id: "",
      date: "",
      login_time: "",
      logout_time: "",
    });
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const updateAttendanceForm = (
    field,
    value
  ) => {
    setAttendanceForm(
      (prev) => ({
        ...prev,
        [field]: value,
      })
    );
  };

  // =========================================================
// SAVE ATTENDANCE
// =========================================================

const saveAttendance = async () => {
  try {
    setSavingAttendance(true);
    setError("");

    // =====================================================
    // BASIC VALIDATION
    // =====================================================

    if (!attendanceForm.user_id) {
      alert("Please select an employee.");
      return;
    }

    if (!attendanceForm.date) {
      alert("Please select attendance date.");
      return;
    }

    if (!attendanceForm.login_time) {
      alert("Please enter In Time.");
      return;
    }

    // =====================================================
    // IN TIME DATE
    // =====================================================

    const loginDateKey =
      attendanceForm.login_time.split("T")[0];

    // In Time date must equal Attendance Date
    if (loginDateKey !== attendanceForm.date) {
      alert(
        "In Time date must match the attendance date."
      );
      return;
    }

    // =====================================================
    // HANDLE OUT TIME
    // =====================================================

    let logoutTimeValue =
      attendanceForm.logout_time || "";

    if (logoutTimeValue) {
      const loginDateTime =
        new Date(attendanceForm.login_time);

      let logoutDateTime =
        new Date(logoutTimeValue);

      if (
        Number.isNaN(loginDateTime.getTime()) ||
        Number.isNaN(logoutDateTime.getTime())
      ) {
        alert("Invalid In Time or Out Time.");
        return;
      }

      // ===================================================
      // OVERNIGHT SHIFT
      // Example:
      // In  = 2026-09-12 20:00
      // Out = 2026-09-12 05:00
      //
      // Automatically becomes:
      // Out = 2026-09-13 05:00
      // ===================================================

      if (logoutDateTime <= loginDateTime) {
        const [datePart, timePart] =
          logoutTimeValue.split("T");

        const nextDay =
          new Date(`${datePart}T00:00:00`);

        nextDay.setDate(
          nextDay.getDate() + 1
        );

        const nextYear =
          nextDay.getFullYear();

        const nextMonth = String(
          nextDay.getMonth() + 1
        ).padStart(2, "0");

        const nextDate = String(
          nextDay.getDate()
        ).padStart(2, "0");

        logoutTimeValue =
          `${nextYear}-${nextMonth}-${nextDate}T${timePart}`;

        // Recalculate after moving to next day
        logoutDateTime =
          new Date(logoutTimeValue);
      }

      // ===================================================
      // OUT DATE VALIDATION
      // ===================================================

      const logoutDateKey =
        logoutTimeValue.split("T")[0];

      const attendanceDate =
        new Date(`${attendanceForm.date}T00:00:00`);

      const expectedNextDate =
        new Date(attendanceDate);

      expectedNextDate.setDate(
        expectedNextDate.getDate() + 1
      );

      const expectedNextDateKey =
        `${expectedNextDate.getFullYear()}-${String(
          expectedNextDate.getMonth() + 1
        ).padStart(2, "0")}-${String(
          expectedNextDate.getDate()
        ).padStart(2, "0")}`;

      // Out can be:
      // 1. Same attendance date
      // 2. Next day for overnight shift

      if (
        logoutDateKey !== attendanceForm.date &&
        logoutDateKey !== expectedNextDateKey
      ) {
        alert(
          "Out Time must be on the attendance date or the next day."
        );
        return;
      }

      // ===================================================
      // FINAL TIME VALIDATION
      // ===================================================

      if (logoutDateTime <= loginDateTime) {
        alert(
          "Out Time must be later than In Time."
        );
        return;
      }
    }

    // =====================================================
    // PAYLOAD
    // IMPORTANT:
    // logoutTimeValue use ho raha hai, not original
    // attendanceForm.logout_time
    // =====================================================

    const payload = {
      user_id: Number(
        attendanceForm.user_id
      ),

      login_time:
        dateTimeLocalToMySQL(
          attendanceForm.login_time
        ),

      logout_time:
        logoutTimeValue
          ? dateTimeLocalToMySQL(
              logoutTimeValue
            )
          : null,
    };

    console.log(
      "ATTENDANCE PAYLOAD:",
      payload
    );

    // =====================================================
    // ADD
    // =====================================================

    if (modalMode === "add") {
      const res = await fetch(
        "/api/login-history",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials: "include",

          body: JSON.stringify(
            payload
          ),
        }
      );

      const data =
        await res.json();

      if (
        !res.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to add attendance."
        );
      }

      alert(
        "Attendance added successfully."
      );
    }

    // =====================================================
    // EDIT
    // =====================================================

    else {
      if (!attendanceForm.id) {
        throw new Error(
          "Original attendance record ID was not found."
        );
      }

      const res = await fetch(
        "/api/login-history",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            id: attendanceForm.id,
            ...payload,
          }),
        }
      );

      const data =
        await res.json();

      if (
        !res.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to update attendance."
        );
      }

      alert(
        "Attendance updated successfully."
      );
    }

    // =====================================================
    // CLOSE + REFRESH
    // =====================================================

    closeAttendanceModal();

    await fetchAttendance();

  } catch (err) {
    console.error(
      "SAVE ATTENDANCE ERROR:",
      err
    );

    alert(
      err?.message ||
        "Failed to save attendance."
    );
  } finally {
    setSavingAttendance(false);
  }
};

  // =========================================================
  // DELETE ATTENDANCE
  // =========================================================

  const deleteAttendance = async (
    row
  ) => {
    if (
      !row?.sourceRecordId
    ) {
      alert(
        "This attendance row does not have a database record to delete."
      );
      return;
    }

    const employeeName =
      getUserName(row);

    const confirmed =
      window.confirm(
        `Delete attendance for ${employeeName} on ${formatDate(
          row.attendance_date
        )}?\n\nThis will permanently remove the database record.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingAttendanceId(
        row.sourceRecordId
      );

      setError("");

      const res =
        await fetch(
          `/api/login-history?id=${row.sourceRecordId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

      const data =
        await res.json();

      if (
        !res.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to delete attendance."
        );
      }

      alert(
        "Attendance deleted successfully."
      );

      await fetchAttendance();

    } catch (err) {
      console.error(
        "DELETE ATTENDANCE ERROR:",
        err
      );

      alert(
        err?.message ||
          "Failed to delete attendance."
      );
    } finally {
      setDeletingAttendanceId(
        null
      );
    }
  };

  // =========================================================
  // EXCEL DOWNLOAD
  // =========================================================

  const downloadExcel =
    async () => {
      if (
        !filteredRecords.length
      ) {
        alert(
          "No attendance data available to download."
        );
        return;
      }

      try {
        setDownloading(true);

        const XLSX =
          await import(
            "xlsx"
          );

        const excelData =
          filteredRecords.map(
            (
              row,
              index
            ) => {
              const login =
                getLoginTime(
                  row
                );

              const logout =
                getLogoutTime(
                  row
                );

              return {
                "#":
                  index + 1,

                "Employee Name":
                  getUserName(
                    row
                  ),

                Email:
                  getEmail(
                    row
                  ),

                Role:
                  getRole(
                    row
                  ),

                Team:
                  getTeam(
                    row
                  ),

                Date:
                  formatDate(
                    row.attendance_date
                  ),

                "In Time":
                  formatTime(
                    login
                  ),

                "Out Time":
                  formatTime(
                    logout
                  ),

                "Login Date & Time":
                  formatDateTime(
                    login
                  ),

                "Logout Date & Time":
                  formatDateTime(
                    logout
                  ),

                Status:
                  getStatus(
                    row
                  ),
              };
            }
          );

        const summaryData = [
          {
            "#": "",
            "Employee Name":
              "ATTENDANCE SUMMARY",
            Email: "",
            Role: "",
            Team: "",
            Date: "",
            "In Time": "",
            "Out Time": "",
            "Login Date & Time":
              "",
            "Logout Date & Time":
              "",
            Status: "",
          },

          {
            "#": "",
            "Employee Name":
              "Total Rows",
            Email:
              filteredRecords.length,
            Role: "",
            Team: "",
            Date: "",
            "In Time": "",
            "Out Time": "",
            "Login Date & Time":
              "",
            "Logout Date & Time":
              "",
            Status: "",
          },

          {
            "#": "",
            "Employee Name":
              "Completed",
            Email:
              completedCount,
            Role: "",
            Team: "",
            Date: "",
            "In Time": "",
            "Out Time": "",
            "Login Date & Time":
              "",
            "Logout Date & Time":
              "",
            Status: "",
          },

          {
            "#": "",
            "Employee Name":
              "Working",
            Email:
              workingCount,
            Role: "",
            Team: "",
            Date: "",
            "In Time": "",
            "Out Time": "",
            "Login Date & Time":
              "",
            "Logout Date & Time":
              "",
            Status: "",
          },

          {
            "#": "",
            "Employee Name":
              "Absent",
            Email:
              absentCount,
            Role: "",
            Team: "",
            Date: "",
            "In Time": "",
            "Out Time": "",
            "Login Date & Time":
              "",
            "Logout Date & Time":
              "",
            Status: "",
          },
        ];

        const worksheet =
          XLSX.utils.json_to_sheet(
            [
              ...summaryData,
              ...excelData,
            ]
          );

        worksheet["!cols"] =
          [
            { wch: 7 },
            { wch: 25 },
            { wch: 35 },
            { wch: 15 },
            { wch: 18 },
            { wch: 16 },
            { wch: 16 },
            { wch: 16 },
            { wch: 25 },
            { wch: 25 },
            { wch: 14 },
          ];

        const workbook =
          XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          "Attendance"
        );

        XLSX.writeFile(
          workbook,
          `attendance-${fromDate || "all"}-${toDate || "all"}.xlsx`
        );
      } catch (err) {
        console.error(
          "Excel download error:",
          err
        );

        alert(
          "Failed to download Excel file."
        );
      } finally {
        setDownloading(false);
      }
    };

  // =========================================================
  // PDF DOWNLOAD
  // =========================================================

  const downloadPDF =
    async () => {
      if (
        !filteredRecords.length
      ) {
        alert(
          "No attendance data available to download."
        );
        return;
      }

      try {
        setDownloading(true);

        const {
          default: jsPDF,
        } = await import(
          "jspdf"
        );

        const {
          default: autoTable,
        } = await import(
          "jspdf-autotable"
        );

        const doc =
          new jsPDF({
            orientation:
              "landscape",
            unit: "mm",
            format: "a4",
          });

        doc.setFontSize(18);

        doc.text(
          "Attendance Report",
          14,
          15
        );

        doc.setFontSize(9);

        let filterText =
          "All Dates";

        if (
          fromDate &&
          toDate
        ) {
          filterText =
            `${formatDate(
              fromDate
            )} to ${formatDate(
              toDate
            )}`;
        } else if (
          fromDate
        ) {
          filterText =
            `From ${formatDate(
              fromDate
            )}`;
        } else if (
          toDate
        ) {
          filterText =
            `Until ${formatDate(
              toDate
            )}`;
        } else if (
          availableDateRange.min &&
          availableDateRange.max
        ) {
          filterText =
            `${formatDate(
              availableDateRange.min
            )} to ${formatDate(
              availableDateRange.max
            )}`;
        }

        doc.text(
          `Date Range: ${filterText}`,
          14,
          22
        );

        doc.text(
          `Total Rows: ${totalRecords}`,
          14,
          28
        );

        doc.text(
          `Completed: ${completedCount}`,
          75,
          28
        );

        doc.text(
          `Working: ${workingCount}`,
          130,
          28
        );

        doc.text(
          `Absent: ${absentCount}`,
          180,
          28
        );

        const tableData =
          filteredRecords.map(
            (
              row,
              index
            ) => {
              const login =
                getLoginTime(
                  row
                );

              const logout =
                getLogoutTime(
                  row
                );

              return [
                index + 1,
                getUserName(
                  row
                ),
                getEmail(
                  row
                ),
                getRole(
                  row
                ),
                getTeam(
                  row
                ),
                formatDate(
                  row.attendance_date
                ),
                formatTime(
                  login
                ),
                formatTime(
                  logout
                ),
                getStatus(
                  row
                ),
              ];
            }
          );

        autoTable(
          doc,
          {
            startY: 34,

            head: [
              [
                "#",
                "Employee",
                "Email",
                "Role",
                "Team",
                "Date",
                "In Time",
                "Out Time",
                "Status",
              ],
            ],

            body:
              tableData,

            theme:
              "grid",

            styles: {
              fontSize: 7.5,
              cellPadding: 2.5,
            },

            headStyles: {
              fontSize: 7.5,
              fontStyle:
                "bold",
            },

            columnStyles: {
              0: {
                cellWidth: 8,
              },

              1: {
                cellWidth: 35,
              },

              2: {
                cellWidth: 52,
              },

              3: {
                cellWidth: 22,
              },

              4: {
                cellWidth: 25,
              },

              5: {
                cellWidth: 27,
              },

              6: {
                cellWidth: 24,
              },

              7: {
                cellWidth: 24,
              },

              8: {
                cellWidth: 27,
              },
            },

            didParseCell:
              (data) => {
                if (
                  data.section ===
                    "body" &&
                  data.column.index ===
                    8
                ) {
                  const value =
                    data.cell.raw;

                  if (
                    value ===
                    "Completed"
                  ) {
                    data.cell.styles.textColor =
                      [16, 185, 129];
                  }

                  if (
                    value ===
                    "Working"
                  ) {
                    data.cell.styles.textColor =
                      [217, 119, 6];
                  }

                  if (
                    value ===
                    "Absent"
                  ) {
                    data.cell.styles.textColor =
                      [100, 116, 139];
                  }
                }
              },
          }
        );

        doc.save(
          `attendance-${fromDate || "all"}-${toDate || "all"}.pdf`
        );
      } catch (err) {
        console.error(
          "PDF download error:",
          err
        );

        alert(
          "Failed to download PDF file."
        );
      } finally {
        setDownloading(false);
      }
    };

  // =========================================================
  // STATUS UI
  // =========================================================

  const renderStatus =
    (status) => {
      if (
        status ===
        "Completed"
      ) {
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
            <CheckCircle2
              size={13}
            />
            Completed
          </span>
        );
      }

      if (
        status ===
        "Working"
      ) {
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700">
            <Clock3
              size={13}
            />
            Working
          </span>
        );
      }

      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-500">
          <UserX
            size={13}
          />
          Absent
        </span>
      );
    };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

      {/* =====================================================
          TOP HEADER
      ====================================================== */}

      <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            <CalendarDays
              size={15}
            />
            Employee Management
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-[#050B1E] sm:text-4xl">
            Attendance
          </h1>

          <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-500">
            Monitor daily employee attendance,
            login activity and working status
            from one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start xl:self-auto">

          {/* ADD */}

          <button
            type="button"
            onClick={
              openAddAttendance
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#050B1E] px-5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
          >
            <Plus
              size={16}
            />

            Add Attendance
          </button>

          {/* REFRESH */}

          <button
            type="button"
            onClick={
              fetchAttendance
            }
            disabled={loading}
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : "transition-transform duration-300 group-hover:rotate-180"
              }
            />

            Refresh Data
          </button>

        </div>
      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">

          <div>
            <p className="font-bold">
              Attendance API Error
            </p>

            <p className="mt-1 text-red-600">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="rounded-lg p-1 text-red-400 transition hover:bg-red-100 hover:text-red-700"
          >
            <X
              size={17}
            />
          </button>
        </div>
      )}

      {/* =====================================================
          STATS
      ====================================================== */}

      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* TOTAL */}

        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

          <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-blue-50 opacity-70" />

          <div className="relative flex items-start justify-between">

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Total Rows
              </p>

              <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#050B1E]">
                {totalRecords}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Attendance entries
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users
                size={20}
              />
            </div>

          </div>
        </div>

        {/* COMPLETED */}

        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

          <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-emerald-50 opacity-70" />

          <div className="relative flex items-start justify-between">

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Completed
              </p>

              <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#050B1E]">
                {completedCount}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Login + logout
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2
                size={20}
              />
            </div>

          </div>
        </div>

        {/* WORKING */}

        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

          <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-amber-50 opacity-70" />

          <div className="relative flex items-start justify-between">

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Currently Working
              </p>

              <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#050B1E]">
                {workingCount}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                No logout yet
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock3
                size={20}
              />
            </div>

          </div>
        </div>

        {/* ABSENT */}

        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

          <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-slate-100 opacity-80" />

          <div className="relative flex items-start justify-between">

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Absent
              </p>

              <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#050B1E]">
                {absentCount}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                No attendance record
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <UserX
                size={20}
              />
            </div>

          </div>
        </div>

      </div>

      {/* =====================================================
          FILTER / ACTION CARD
      ====================================================== */}

      <div className="mb-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#050B1E] text-white">
              <Filter
                size={16}
              />
            </div>

            <div>
              <h2 className="text-sm font-bold text-[#050B1E]">
                Attendance Filters
              </h2>

              <p className="text-xs text-slate-400">
                Search and filter attendance records
              </p>
            </div>

          </div>

          {(search ||
            fromDate ||
            toDate) && (
            <button
              type="button"
              onClick={
                clearFilters
              }
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-[#050B1E]"
            >
              <X
                size={14}
              />
              Clear all
            </button>
          )}

        </div>

        <div className="p-5">

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr_1fr_auto]">

            {/* SEARCH */}

            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Search Employee
              </label>

              <div className="relative">

                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={
                    search
                  }
                  onChange={(
                    e
                  ) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Name, email, role or team..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-[#050B1E] focus:bg-white focus:ring-4 focus:ring-slate-100"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch(
                        ""
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X
                      size={15}
                    />
                  </button>
                )}

              </div>
            </div>

            {/* FROM */}

            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                From Date
              </label>

              <div className="relative">

                <CalendarDays
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="date"
                  value={
                    fromDate
                  }
                  onChange={(
                    e
                  ) =>
                    setFromDate(
                      e.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 pl-10 text-sm font-medium text-slate-700 outline-none transition focus:border-[#050B1E] focus:bg-white focus:ring-4 focus:ring-slate-100"
                />

              </div>
            </div>

            {/* TO */}

            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                To Date
              </label>

              <div className="relative">

                <CalendarDays
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="date"
                  value={
                    toDate
                  }
                  onChange={(
                    e
                  ) =>
                    setToDate(
                      e.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 pl-10 text-sm font-medium text-slate-700 outline-none transition focus:border-[#050B1E] focus:bg-white focus:ring-4 focus:ring-slate-100"
                />

              </div>
            </div>

            {/* RESET */}

            <div className="flex items-end">

              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 lg:w-auto"
              >
                <RefreshCw
                  size={15}
                />
                Reset
              </button>

            </div>

          </div>

          {/* RANGE INFO */}

          <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-2 text-xs text-slate-500">

              <CalendarDays
                size={14}
                className="text-slate-400"
              />

              <span>
                Showing{" "}
                <strong className="text-slate-700">
                  {filteredRecords.length}
                </strong>{" "}
                rows
              </span>

              {(fromDate ||
                toDate) && (
                <>
                  <span className="text-slate-300">
                    •
                  </span>

                  <span>
                    Filtered date range
                  </span>
                </>
              )}

            </div>

            <div className="flex flex-wrap gap-2">

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {completedCount} Completed
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {workingCount} Working
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                {absentCount} Absent
              </span>

            </div>
          </div>

          {/* DOWNLOAD BUTTONS */}

          <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={
                downloadExcel
              }
              disabled={
                downloading ||
                !filteredRecords.length
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileSpreadsheet
                size={17}
              />

              {downloading
                ? "Preparing..."
                : "Download Excel"}
            </button>

            <button
              type="button"
              onClick={
                downloadPDF
              }
              disabled={
                downloading ||
                !filteredRecords.length
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#050B1E] px-5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileText
                size={17}
              />

              {downloading
                ? "Preparing..."
                : "Download PDF"}
            </button>

          </div>

        </div>
      </div>

      {/* =====================================================
          ATTENDANCE TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* TABLE TOP */}

        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#050B1E]">
              <Users
                size={18}
              />
            </div>

            <div>
              <h2 className="text-sm font-bold text-[#050B1E]">
                Attendance Records
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                Daily login and logout history
              </p>
            </div>

          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span className="rounded-lg bg-slate-50 px-3 py-2">
              {filteredRecords.length} Records
            </span>
          </div>

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1350px] border-collapse">

            <thead className="sticky top-0 z-10">

              <tr className="border-b border-slate-200 bg-[#F8FAFC]">

                <th className="px-5 py-3.5 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                  #
                </th>

                <th className="px-5 py-3.5 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                  Employee
                </th>

                <th className="px-5 py-3.5 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                  Role
                </th>

                <th className="px-5 py-3.5 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                  Team
                </th>

                <th className="px-5 py-3.5 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                  Date
                </th>

                <th className="px-5 py-3.5 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                  In Time
                </th>

                <th className="px-5 py-3.5 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                  Out Time
                </th>

                <th className="px-5 py-3.5 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                  Status
                </th>

                <th className="px-5 py-3.5 text-right text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {/* LOADING */}

              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-20 text-center"
                  >

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                      <RefreshCw
                        size={24}
                        className="animate-spin text-slate-400"
                      />
                    </div>

                    <p className="mt-4 text-sm font-bold text-slate-600">
                      Loading attendance...
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Please wait while we fetch the latest records.
                    </p>

                  </td>
                </tr>
              ) : filteredRecords.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-20 text-center"
                  >

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                      <CalendarDays
                        size={24}
                        className="text-slate-400"
                      />
                    </div>

                    <p className="mt-4 text-sm font-bold text-slate-600">
                      No attendance records found
                    </p>

                    <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
                      Try changing your search or date filters to find attendance records.
                    </p>

                    {(search ||
                      fromDate ||
                      toDate) && (
                      <button
                        type="button"
                        onClick={
                          clearFilters
                        }
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#050B1E] px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                      >
                        <RefreshCw
                          size={13}
                        />
                        Clear Filters
                      </button>
                    )}

                  </td>
                </tr>
              ) : (
                filteredRecords.map(
                  (
                    row,
                    index
                  ) => {

                    const login =
                      getLoginTime(
                        row
                      );

                    const logout =
                      getLogoutTime(
                        row
                      );

                    const status =
                      getStatus(
                        row
                      );

                    const name =
                      getUserName(
                        row
                      );

                    const hasRecord =
                      row?.hasRecord;

                    return (
                      <tr
                        key={
                          row?.id ||
                          `${name}-${row?.attendance_date}-${index}`
                        }
                        className={`group border-b border-slate-100 transition-colors duration-150 ${
                          status ===
                          "Absent"
                            ? "bg-slate-50/30 hover:bg-slate-50"
                            : "hover:bg-[#F8FAFC]"
                        }`}
                      >

                        {/* # */}

                        <td className="px-5 py-4 text-xs font-bold text-slate-300">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </td>

                        {/* EMPLOYEE */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#050B1E] text-sm font-extrabold text-white shadow-sm">
                              {name
                                .charAt(
                                  0
                                )
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">

                              <p className="truncate text-sm font-bold text-[#050B1E]">
                                {name}
                              </p>

                              <p className="mt-0.5 max-w-[240px] truncate text-xs text-slate-400">
                                {getEmail(
                                  row
                                )}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* ROLE */}

                        <td className="px-5 py-4">

                          <span className="inline-flex rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold capitalize text-slate-600">
                            {getRole(
                              row
                            )}
                          </span>

                        </td>

                        {/* TEAM */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">

                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                              <UsersRound
                                size={13}
                                className="text-slate-400"
                              />
                            </div>

                            {getTeam(
                              row
                            )}

                          </div>

                        </td>

                        {/* DATE */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">

                            <CalendarDays
                              size={14}
                              className="text-slate-400"
                            />

                            <span className="text-sm font-semibold text-slate-600">
                              {formatDate(
                                row.attendance_date
                              )}
                            </span>

                          </div>

                        </td>

                        {/* IN */}

                        <td className="px-5 py-4">

                          <div
                            className={`flex items-center gap-2 ${
                              hasRecord
                                ? "text-emerald-600"
                                : "text-slate-300"
                            }`}
                          >

                            <span
                              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                hasRecord
                                  ? "bg-emerald-50"
                                  : "bg-slate-100"
                              }`}
                            >
                              <LogIn
                                size={14}
                              />
                            </span>

                            <span className="text-sm font-bold">
                              {formatTime(
                                login
                              )}
                            </span>

                          </div>

                        </td>

                        {/* OUT */}

                        <td className="px-5 py-4">

                          <div
                            className={`flex items-center gap-2 ${
                              hasRecord
                                ? "text-rose-600"
                                : "text-slate-300"
                            }`}
                          >

                            <span
                              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                hasRecord
                                  ? "bg-rose-50"
                                  : "bg-slate-100"
                              }`}
                            >
                              <LogOut
                                size={14}
                              />
                            </span>

                            <span className="text-sm font-bold">
                              {formatTime(
                                logout
                              )}
                            </span>

                          </div>

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">
                          {renderStatus(
                            status
                          )}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4">

                          <div className="flex items-center justify-end gap-2">

                            {hasRecord ? (
                              <>
                                {/* EDIT */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditAttendance(
                                      row
                                    )
                                  }
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                  title="Edit attendance"
                                >
                                  <Pencil
                                    size={15}
                                  />
                                </button>

                                {/* DELETE */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteAttendance(
                                      row
                                    )
                                  }
                                  disabled={
                                    deletingAttendanceId ===
                                    row.sourceRecordId
                                  }
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-white text-red-400 shadow-sm transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                  title="Delete attendance"
                                >
                                  {deletingAttendanceId ===
                                  row.sourceRecordId ? (
                                    <Loader2
                                      size={15}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Trash2
                                      size={15}
                                    />
                                  )}
                                </button>
                              </>
                            ) : (
                              /* ADD ABSENT */

                              <button
                                type="button"
                                onClick={() =>
                                  openAddAttendanceForRow(
                                    row
                                  )
                                }
                                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#050B1E] px-3 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800"
                                title="Add attendance"
                              >
                                <Plus
                                  size={14}
                                />

                                Add
                              </button>
                            )}

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )
              )}

            </tbody>

          </table>

        </div>

        {/* TABLE FOOTER */}

        {!loading &&
          filteredRecords.length >
            0 && (
            <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3.5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

              <span>
                Showing{" "}
                <strong className="text-slate-600">
                  {filteredRecords.length}
                </strong>{" "}
                attendance rows
              </span>

              <div className="flex items-center gap-4">

                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Completed
                </span>

                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Working
                </span>

                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  Absent
                </span>

              </div>

            </div>
          )}

      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ====================================================== */}

      {showAttendanceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

          {/* BACKDROP */}

          <div
            className="absolute inset-0 bg-[#050B1E]/50 backdrop-blur-sm"
            onClick={
              closeAttendanceModal
            }
          />

          {/* MODAL */}

          <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#050B1E] text-white">
                  {modalMode ===
                  "edit" ? (
                    <Pencil
                      size={18}
                    />
                  ) : (
                    <Plus
                      size={19}
                    />
                  )}
                </div>

                <div>

                  <h2 className="text-base font-extrabold text-[#050B1E]">
                    {modalMode ===
                    "edit"
                      ? "Edit Attendance"
                      : "Add Attendance"}
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {modalMode ===
                    "edit"
                      ? "Update employee attendance details"
                      : "Create a new attendance record"}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={
                  closeAttendanceModal
                }
                disabled={
                  savingAttendance
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X
                  size={18}
                />
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="space-y-5 p-6">

              {/* EMPLOYEE */}

              <div>

                <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Employee
                </label>

                <div className="relative">

                  <Users
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={
                      attendanceForm.user_id
                    }
                    onChange={(e) =>
                      updateAttendanceForm(
                        "user_id",
                        e.target.value
                      )
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#050B1E] focus:bg-white focus:ring-4 focus:ring-slate-100"
                  >

                    <option value="">
                      Select employee
                    </option>

                    {users.map(
                      (user) => (
                        <option
                          key={
                            user.user_id
                          }
                          value={
                            user.user_id
                          }
                        >
                          {user.name} —{" "}
                          {
                            user.email
                          }
                        </option>
                      )
                    )}

                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                </div>

              </div>

              {/* DATE */}

              <div>

                <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Attendance Date
                </label>

                <div className="relative">

                  <CalendarDays
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="date"
                    value={
                      attendanceForm.date
                    }
                    onChange={(e) =>
                      updateAttendanceForm(
                        "date",
                        e.target.value
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#050B1E] focus:bg-white focus:ring-4 focus:ring-slate-100"
                  />

                </div>

              </div>

              {/* TIMES */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* IN TIME */}

                <div>

                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    In Time
                  </label>

                  <div className="relative">

                    <LogIn
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500"
                    />

                    <input
                      type="datetime-local"
                      value={
                        attendanceForm.login_time
                      }
                      onChange={(e) =>
                        updateAttendanceForm(
                          "login_time",
                          e.target.value
                        )
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                    />

                  </div>

                </div>

                {/* OUT TIME */}

                <div>

                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Out Time
                  </label>

                  <div className="relative">

                    <LogOut
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-500"
                    />

                    <input
                      type="datetime-local"
                      value={
                        attendanceForm.logout_time
                      }
                      onChange={(e) =>
                        updateAttendanceForm(
                          "logout_time",
                          e.target.value
                        )
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-50"
                    />

                  </div>

                  <p className="mt-1.5 text-[10px] text-slate-400">
                    Leave empty if employee is still working.
                  </p>

                </div>

              </div>

              {/* INFO */}

              <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">

                <AlertTriangle
                  size={17}
                  className="mt-0.5 shrink-0 text-blue-500"
                />

                <div>

                  <p className="text-xs font-bold text-blue-700">
                    Attendance status
                  </p>

                  <p className="mt-0.5 text-[11px] leading-5 text-blue-600">
                    Status is automatically calculated from
                    In Time and Out Time.
                  </p>

                </div>

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={
                  closeAttendanceModal
                }
                disabled={
                  savingAttendance
                }
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  saveAttendance
                }
                disabled={
                  savingAttendance
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#050B1E] px-6 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {savingAttendance ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />

                    Saving...
                  </>
                ) : (
                  <>
                    <Save
                      size={16}
                    />

                    {modalMode ===
                    "edit"
                      ? "Save Changes"
                      : "Add Attendance"}
                  </>
                )}

              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}