






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
//   Pencil,
//   Trash2,
//   Plus,
//   Save,
//   Loader2,
//   AlertTriangle,
// } from "lucide-react";

// export default function Attendance() {
//   // =========================================================
//   // STATES
//   // =========================================================

//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [downloading, setDownloading] = useState(false);
//   const [error, setError] = useState("");

//   const [search, setSearch] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");

//   const [showAttendanceModal, setShowAttendanceModal] =
//     useState(false);

//   const [modalMode, setModalMode] = useState("add");

//   const [selectedAttendance, setSelectedAttendance] =
//     useState(null);

//   const [savingAttendance, setSavingAttendance] =
//     useState(false);

//   const [deletingAttendanceId, setDeletingAttendanceId] =
//     useState(null);

//   const [attendanceForm, setAttendanceForm] = useState({
//     id: null,
//     user_id: "",
//     date: "",
//     login_time: "",
//     logout_time: "",
//   });

//   // =========================================================
//   // HELPERS
//   // =========================================================

//   const getUserId = (row) => {
//     return (
//       row?.user_id ??
//       row?.userId ??
//       row?.user?.id ??
//       row?.employee_id ??
//       row?.employeeId ??
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
//       row?.employee?.name ||
//       "Unknown User"
//     );
//   };

//   const getEmail = (row) => {
//     return (
//       row?.email ||
//       row?.user_email ||
//       row?.userEmail ||
//       row?.user?.email ||
//       row?.employee?.email ||
//       "-"
//     );
//   };

//   const getRole = (row) => {
//     return (
//       row?.role ||
//       row?.user_role ||
//       row?.userRole ||
//       row?.user?.role ||
//       row?.employee?.role ||
//       "-"
//     );
//   };

//   const getTeam = (row) => {
//     return (
//       row?.team ||
//       row?.user_team ||
//       row?.userTeam ||
//       row?.user?.team ||
//       row?.employee?.team ||
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
//     if (!value) return "-";

//     const date =
//       typeof value === "string" &&
//       /^\d{4}-\d{2}-\d{2}$/.test(value)
//         ? new Date(`${value}T00:00:00`)
//         : parseDate(value);

//     if (!date) return "-";

//     return date.toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     });
//   };

//   const formatTime = (value) => {
//     if (!value) return "-";

//     const date = parseDate(value);

//     if (!date) {
//       // Handles MySQL TIME values like 09:30:00
//       if (
//         typeof value === "string" &&
//         /^\d{2}:\d{2}/.test(value)
//       ) {
//         return value.slice(0, 5);
//       }

//       return "-";
//     }

//     return date.toLocaleTimeString("en-US", {
//       timeZone: "America/Los_Angeles",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const formatDateTime = (value) => {
//     if (!value) return "-";

//     const date = parseDate(value);

//     if (!date) return "-";

//     return `${date.toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     })} ${date.toLocaleTimeString("en-US", {
//       timeZone: "America/Los_Angeles",
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//     })}`;
//   };

//   // =========================================================
//   // FETCH LOGIN HISTORY
//   // =========================================================

//   const fetchAttendance = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const res = await fetch(
//         "/api/login-history",
//         {
//           method: "GET",
//           credentials: "include",
//           cache: "no-store",
//         }
//       );

//       if (!res.ok) {
//         throw new Error(
//           `Failed to load login history (${res.status})`
//         );
//       }

//       const data = await res.json();

//       console.log(
//         "LOGIN HISTORY API RESPONSE:",
//         data
//       );

//       // =====================================================
//       // SUPPORT MULTIPLE API RESPONSE FORMATS
//       // =====================================================

//       let apiRecords = [];

//       if (Array.isArray(data)) {
//         apiRecords = data;
//       } else if (
//         Array.isArray(data?.history)
//       ) {
//         apiRecords = data.history;
//       } else if (
//         Array.isArray(data?.data)
//       ) {
//         apiRecords = data.data;
//       } else if (
//         Array.isArray(data?.records)
//       ) {
//         apiRecords = data.records;
//       } else if (
//         Array.isArray(data?.loginHistory)
//       ) {
//         apiRecords = data.loginHistory;
//       } else if (
//         Array.isArray(data?.login_history)
//       ) {
//         apiRecords = data.login_history;
//       }

//       console.log(
//         "NORMALIZED ATTENDANCE RECORDS:",
//         apiRecords
//       );

//       setRecords(apiRecords);

//     } catch (err) {
//       console.error(
//         "Attendance fetch error:",
//         err
//       );

//       setError(
//         err?.message ||
//           "Unable to load attendance records."
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
//       a.name.localeCompare(b.name)
//     );
//   }, [records]);

//   // =========================================================
//   // AVAILABLE DATE RANGE
//   // =========================================================

//   const availableDateRange = useMemo(() => {
//     const dates = records
//       .map((row) =>
//         getRecordDate(row)
//       )
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

//   const addDays = (
//     dateKey,
//     amount
//   ) => {
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

//     const result = [];

//     users.forEach((user) => {
//       dates.forEach((dateKey) => {
//         const groupKey =
//           `${user.key}__${dateKey}`;

//         const dayRecords =
//           grouped.get(
//             groupKey
//           ) || [];

//         // ===================================================
//         // ABSENT
//         // ===================================================

//         if (!dayRecords.length) {
//           result.push({
//             id: `missing-${user.key}-${dateKey}`,
//             sourceRecordId: null,

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

//         // ===================================================
//         // EARLIEST LOGIN
//         // ===================================================

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

//         // ===================================================
//         // LATEST LOGOUT
//         // ===================================================

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

//         let earliestLogin = null;

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

//         let latestLogout = null;

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

//         const loginSourceRow =
//           earliestLogin?.row ||
//           firstRow;

//         const logoutSourceRow =
//           latestLogout?.row ||
//           firstRow;

//         const sourceRecordId =
//           loginSourceRow?.id ||
//           logoutSourceRow?.id ||
//           null;

//         // ===================================================
//         // STATUS
//         // ===================================================

//         // let status = "Absent";

//         // ===================================================
// // ATTENDANCE STATUS
// // =========================================================

// let status = "Absent";

// // API / DATABASE se saved attendance status
// const databaseAttendanceStatus =
//   firstRow?.attendance_status ||
//   firstRow?.attendanceStatus ||
//   null;

// if (databaseAttendanceStatus) {
//   status = databaseAttendanceStatus;
// } else if (loginValue && logoutValue) {
//   status = "Completed";
// } else if (loginValue && !logoutValue) {
//   status = "Working";
// }

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

//           sourceRecordId,

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

//     // =======================================================
//     // SEARCH
//     // =======================================================

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
//           getUserName(row)
//             .toLowerCase();

//         const email =
//           getEmail(row)
//             .toLowerCase();

//         const role =
//           getRole(row)
//             .toLowerCase();

//         const team =
//           getTeam(row)
//             .toLowerCase();

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

//     // =======================================================
//     // SORT
//     // =======================================================

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

//   // const getStatus = (row) => {
//   //   if (
//   //     row?.status ===
//   //       "Completed" ||
//   //     row?.status ===
//   //       "Working" ||
//   //     row?.status ===
//   //       "Absent"
//   //   ) {
//   //     return row.status;
//   //   }

//   //   const login =
//   //     getLoginTime(row);

//   //   const logout =
//   //     getLogoutTime(row);

//   //   if (login && logout) {
//   //     return "Completed";
//   //   }

//   //   if (login && !logout) {
//   //     return "Working";
//   //   }

//   //   return "Absent";
//   // };

//   const getStatus = (row) => {
//   // Database/API saved attendance status
//   const databaseStatus =
//     row?.attendance_status ||
//     row?.attendanceStatus;

//   if (
//     databaseStatus === "Late" ||
//     databaseStatus === "On Time"
//   ) {
//     return databaseStatus;
//   }

//   // Existing attendance status
//   if (
//     row?.status === "Completed" ||
//     row?.status === "Working" ||
//     row?.status === "Absent"
//   ) {
//     return row.status;
//   }

//   const login = getLoginTime(row);
//   const logout = getLogoutTime(row);

//   if (login && logout) {
//     return "Completed";
//   }

//   if (login && !logout) {
//     return "Working";
//   }

//   return "Absent";
// };

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

//     const lateCount =
//   filteredRecords.filter(
//     (row) =>
//       getStatus(row) === "Late"
//   ).length;

// const onTimeCount =
//   filteredRecords.filter(
//     (row) =>
//       getStatus(row) === "On Time"
//   ).length;
//   // =========================================================
//   // CLEAR FILTERS
//   // =========================================================

//   const clearFilters = () => {
//     setSearch("");
//     setFromDate("");
//     setToDate("");
//   };

//   // =========================================================
//   // FORM DATE HELPERS
//   // =========================================================

//   const toDateTimeLocalValue = (
//     value
//   ) => {
//     if (!value) return "";

//     const date =
//       parseDate(value);

//     if (!date) return "";

//     const year =
//       date.getFullYear();

//     const month = String(
//       date.getMonth() + 1
//     ).padStart(2, "0");

//     const day = String(
//       date.getDate()
//     ).padStart(2, "0");

//     const hours = String(
//       date.getHours()
//     ).padStart(2, "0");

//     const minutes = String(
//       date.getMinutes()
//     ).padStart(2, "0");

//     return `${year}-${month}-${day}T${hours}:${minutes}`;
//   };

//   const dateTimeLocalToMySQL = (
//     value
//   ) => {
//     if (!value) return null;

//     return (
//       value.replace("T", " ") +
//       ":00"
//     );
//   };

//   // =========================================================
//   // OPEN ADD
//   // =========================================================

//   const openAddAttendance = () => {
//     const defaultDate =
//       fromDate ||
//       toDate ||
//       availableDateRange.max ||
//       dateToKey(new Date());

//     setModalMode("add");

//     setSelectedAttendance(null);

//     setAttendanceForm({
//       id: null,
//       user_id:
//         users.length === 1
//           ? String(
//               users[0].user_id
//             )
//           : "",
//       date: defaultDate,
//       login_time: "",
//       logout_time: "",
//     });

//     setShowAttendanceModal(true);
//   };

//   // =========================================================
//   // OPEN ADD FOR ABSENT
//   // =========================================================

//   const openAddAttendanceForRow = (
//     row
//   ) => {
//     setModalMode("add");

//     setSelectedAttendance(row);

//     setAttendanceForm({
//       id: null,

//       user_id:
//         row?.user_id !== null &&
//         row?.user_id !== undefined
//           ? String(row.user_id)
//           : "",

//       date:
//         row?.attendance_date ||
//         dateToKey(new Date()),

//       login_time: "",
//       logout_time: "",
//     });

//     setShowAttendanceModal(true);
//   };

//   // =========================================================
//   // OPEN EDIT
//   // =========================================================

//   const openEditAttendance = (
//     row
//   ) => {
//     if (!row?.sourceRecordId) {
//       alert(
//         "Original database record was not found."
//       );
//       return;
//     }

//     setModalMode("edit");

//     setSelectedAttendance(row);

//     setAttendanceForm({
//       id:
//         row.sourceRecordId,

//       user_id:
//         row?.user_id !== null &&
//         row?.user_id !== undefined
//           ? String(row.user_id)
//           : "",

//       date:
//         row?.attendance_date ||
//         dateToKey(
//           parseDate(
//             row?.login_time
//           )
//         ),

//       login_time:
//         toDateTimeLocalValue(
//           row?.login_time
//         ),

//       logout_time:
//         toDateTimeLocalValue(
//           row?.logout_time
//         ),
//     });

//     setShowAttendanceModal(true);
//   };

//   // =========================================================
//   // CLOSE MODAL
//   // =========================================================

//   const closeAttendanceModal = () => {
//     if (savingAttendance) {
//       return;
//     }

//     setShowAttendanceModal(false);

//     setSelectedAttendance(null);

//     setAttendanceForm({
//       id: null,
//       user_id: "",
//       date: "",
//       login_time: "",
//       logout_time: "",
//     });
//   };

//   // =========================================================
//   // UPDATE FORM
//   // =========================================================

//   const updateAttendanceForm = (
//     field,
//     value
//   ) => {
//     setAttendanceForm(
//       (prev) => ({
//         ...prev,
//         [field]: value,
//       })
//     );
//   };

//   // =========================================================
//   // SAVE ATTENDANCE
//   // =========================================================

//   const saveAttendance = async () => {
//     try {
//       setSavingAttendance(true);
//       setError("");

//       if (
//         !attendanceForm.user_id
//       ) {
//         alert(
//           "Please select an employee."
//         );
//         return;
//       }

//       if (
//         !attendanceForm.date
//       ) {
//         alert(
//           "Please select attendance date."
//         );
//         return;
//       }

//       if (
//         !attendanceForm.login_time
//       ) {
//         alert(
//           "Please enter In Time."
//         );
//         return;
//       }

//       const loginDateKey =
//         attendanceForm.login_time.split(
//           "T"
//         )[0];

//       if (
//         loginDateKey !==
//         attendanceForm.date
//       ) {
//         alert(
//           "In Time date must match the attendance date."
//         );
//         return;
//       }

//       let logoutTimeValue =
//         attendanceForm.logout_time ||
//         "";

//       if (logoutTimeValue) {
//         const loginDateTime =
//           new Date(
//             attendanceForm.login_time
//           );

//         let logoutDateTime =
//           new Date(
//             logoutTimeValue
//           );

//         if (
//           Number.isNaN(
//             loginDateTime.getTime()
//           ) ||
//           Number.isNaN(
//             logoutDateTime.getTime()
//           )
//         ) {
//           alert(
//             "Invalid In Time or Out Time."
//           );
//           return;
//         }

//         // Overnight shift
//         if (
//           logoutDateTime <=
//           loginDateTime
//         ) {
//           const [
//             datePart,
//             timePart,
//           ] =
//             logoutTimeValue.split(
//               "T"
//             );

//           const nextDay =
//             new Date(
//               `${datePart}T00:00:00`
//             );

//           nextDay.setDate(
//             nextDay.getDate() + 1
//           );

//           const nextYear =
//             nextDay.getFullYear();

//           const nextMonth =
//             String(
//               nextDay.getMonth() + 1
//             ).padStart(2, "0");

//           const nextDate =
//             String(
//               nextDay.getDate()
//             ).padStart(2, "0");

//           logoutTimeValue =
//             `${nextYear}-${nextMonth}-${nextDate}T${timePart}`;

//           logoutDateTime =
//             new Date(
//               logoutTimeValue
//             );
//         }

//         const logoutDateKey =
//           logoutTimeValue.split(
//             "T"
//           )[0];

//         const attendanceDate =
//           new Date(
//             `${attendanceForm.date}T00:00:00`
//           );

//         const expectedNextDate =
//           new Date(
//             attendanceDate
//           );

//         expectedNextDate.setDate(
//           expectedNextDate.getDate() +
//             1
//         );

//         const expectedNextDateKey =
//           `${expectedNextDate.getFullYear()}-${String(
//             expectedNextDate.getMonth() + 1
//           ).padStart(2, "0")}-${String(
//             expectedNextDate.getDate()
//           ).padStart(2, "0")}`;

//         if (
//           logoutDateKey !==
//             attendanceForm.date &&
//           logoutDateKey !==
//             expectedNextDateKey
//         ) {
//           alert(
//             "Out Time must be on the attendance date or the next day."
//           );
//           return;
//         }

//         if (
//           logoutDateTime <=
//           loginDateTime
//         ) {
//           alert(
//             "Out Time must be later than In Time."
//           );
//           return;
//         }
//       }

//       const payload = {
//         user_id: Number(
//           attendanceForm.user_id
//         ),

//         login_time:
//           dateTimeLocalToMySQL(
//             attendanceForm.login_time
//           ),

//         logout_time:
//           logoutTimeValue
//             ? dateTimeLocalToMySQL(
//                 logoutTimeValue
//               )
//             : null,
//       };

//       console.log(
//         "ATTENDANCE PAYLOAD:",
//         payload
//       );

//       // =====================================================
//       // ADD
//       // =====================================================

//       if (
//         modalMode === "add"
//       ) {
//         const res =
//           await fetch(
//             "/api/login-history",
//             {
//               method: "POST",
//               headers: {
//                 "Content-Type":
//                   "application/json",
//               },
//               credentials: "include",
//               body: JSON.stringify(
//                 payload
//               ),
//             }
//           );

//         const data =
//           await res.json();

//         if (
//           !res.ok ||
//           !data.success
//         ) {
//           throw new Error(
//             data.message ||
//               "Failed to add attendance."
//           );
//         }

//         alert(
//           "Attendance added successfully."
//         );
//       }

//       // =====================================================
//       // EDIT
//       // =====================================================

//       else {
//         if (
//           !attendanceForm.id
//         ) {
//           throw new Error(
//             "Original attendance record ID was not found."
//           );
//         }

//         const res =
//           await fetch(
//             "/api/login-history",
//             {
//               method: "PUT",
//               headers: {
//                 "Content-Type":
//                   "application/json",
//               },
//               credentials: "include",
//               body: JSON.stringify({
//                 id:
//                   attendanceForm.id,
//                 ...payload,
//               }),
//             }
//           );

//         const data =
//           await res.json();

//         if (
//           !res.ok ||
//           !data.success
//         ) {
//           throw new Error(
//             data.message ||
//               "Failed to update attendance."
//           );
//         }

//         alert(
//           "Attendance updated successfully."
//         );
//       }

//       closeAttendanceModal();

//       await fetchAttendance();

//     } catch (err) {
//       console.error(
//         "SAVE ATTENDANCE ERROR:",
//         err
//       );

//       alert(
//         err?.message ||
//           "Failed to save attendance."
//       );
//     } finally {
//       setSavingAttendance(false);
//     }
//   };

//   // =========================================================
//   // DELETE
//   // =========================================================

//   const deleteAttendance = async (
//     row
//   ) => {
//     if (
//       !row?.sourceRecordId
//     ) {
//       alert(
//         "This attendance row does not have a database record to delete."
//       );
//       return;
//     }

//     const employeeName =
//       getUserName(row);

//     const confirmed =
//       window.confirm(
//         `Delete attendance for ${employeeName} on ${formatDate(
//           row.attendance_date
//         )}?\n\nThis will permanently remove the database record.`
//       );

//     if (!confirmed) {
//       return;
//     }

//     try {
//       setDeletingAttendanceId(
//         row.sourceRecordId
//       );

//       setError("");

//       const res =
//         await fetch(
//           `/api/login-history?id=${row.sourceRecordId}`,
//           {
//             method: "DELETE",
//             credentials: "include",
//           }
//         );

//       const data =
//         await res.json();

//       if (
//         !res.ok ||
//         !data.success
//       ) {
//         throw new Error(
//           data.message ||
//             "Failed to delete attendance."
//         );
//       }

//       alert(
//         "Attendance deleted successfully."
//       );

//       await fetchAttendance();

//     } catch (err) {
//       console.error(
//         "DELETE ATTENDANCE ERROR:",
//         err
//       );

//       alert(
//         err?.message ||
//           "Failed to delete attendance."
//       );
//     } finally {
//       setDeletingAttendanceId(
//         null
//       );
//     }
//   };

//   // =========================================================
//   // EXCEL
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
//           await import("xlsx");

//         const excelData =
//           filteredRecords.map(
//             (row, index) => ({
//               "#": index + 1,

//               "Employee Name":
//                 getUserName(row),

//               Email:
//                 getEmail(row),

//               Role:
//                 getRole(row),

//               Team:
//                 getTeam(row),

//               Date:
//                 formatDate(
//                   row.attendance_date
//                 ),

//               "In Time":
//                 formatTime(
//                   getLoginTime(row)
//                 ),

//               "Out Time":
//                 formatTime(
//                   getLogoutTime(row)
//                 ),

//               "Login Date & Time":
//                 formatDateTime(
//                   getLoginTime(row)
//                 ),

//               "Logout Date & Time":
//                 formatDateTime(
//                   getLogoutTime(row)
//                 ),

//               Status:
//                 getStatus(row),
//             })
//           );

//         const worksheet =
//           XLSX.utils.json_to_sheet(
//             excelData
//           );

//         worksheet["!cols"] = [
//           { wch: 7 },
//           { wch: 25 },
//           { wch: 35 },
//           { wch: 15 },
//           { wch: 18 },
//           { wch: 16 },
//           { wch: 16 },
//           { wch: 16 },
//           { wch: 25 },
//           { wch: 25 },
//           { wch: 14 },
//         ];

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
//   // PDF
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

//         doc.setFontSize(18);

//         doc.text(
//           "Attendance Report",
//           14,
//           15
//         );

//         doc.setFontSize(9);

//         doc.text(
//           `Total Rows: ${totalRecords}`,
//           14,
//           22
//         );

//         doc.text(
//           `Completed: ${completedCount}`,
//           70,
//           22
//         );

//         doc.text(
//           `Working: ${workingCount}`,
//           125,
//           22
//         );

//         doc.text(
//           `Absent: ${absentCount}`,
//           175,
//           22
//         );

//         const tableData =
//           filteredRecords.map(
//             (row, index) => [
//               index + 1,
//               getUserName(row),
//               getEmail(row),
//               getRole(row),
//               getTeam(row),
//               formatDate(
//                 row.attendance_date
//               ),
//               formatTime(
//                 getLoginTime(row)
//               ),
//               formatTime(
//                 getLogoutTime(row)
//               ),
//               getStatus(row),
//             ]
//           );

//         autoTable(doc, {
//           startY: 30,

//           head: [
//             [
//               "#",
//               "Employee",
//               "Email",
//               "Role",
//               "Team",
//               "Date",
//               "In Time",
//               "Out Time",
//               "Status",
//             ],
//           ],

//           body: tableData,

//           theme: "grid",

//           styles: {
//             fontSize: 7.5,
//             cellPadding: 2.5,
//           },

//           headStyles: {
//             fontSize: 7.5,
//             fontStyle: "bold",
//           },

//           columnStyles: {
//             0: {
//               cellWidth: 8,
//             },
//             1: {
//               cellWidth: 35,
//             },
//             2: {
//               cellWidth: 52,
//             },
//             3: {
//               cellWidth: 22,
//             },
//             4: {
//               cellWidth: 25,
//             },
//             5: {
//               cellWidth: 27,
//             },
//             6: {
//               cellWidth: 24,
//             },
//             7: {
//               cellWidth: 24,
//             },
//             8: {
//               cellWidth: 27,
//             },
//           },
//         });

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

//   // const renderStatus = (
//   //   status
//   // ) => {
//   //   if (
//   //     status === "Completed"
//   //   ) {
//   //     return (
//   //       <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
//   //         <CheckCircle2 size={13} />
//   //         Completed
//   //       </span>
//   //     );
//   //   }

//   //   if (
//   //     status === "Working"
//   //   ) {
//   //     return (
//   //       <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700">
//   //         <Clock3 size={13} />
//   //         Working
//   //       </span>
//   //     );
//   //   }

//   //   return (
//   //     <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-500">
//   //       <UserX size={13} />
//   //       Absent
//   //     </span>
//   //   );
//   // };


//   const renderStatus = (status) => {
//   if (status === "Late") {
//     return (
//       <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-700">
//         <AlertTriangle size={13} />
//         Late
//       </span>
//     );
//   }

//   if (status === "On Time") {
//     return (
//       <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
//         <CheckCircle2 size={13} />
//         On Time
//       </span>
//     );
//   }

//   if (status === "Completed") {
//     return (
//       <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
//         <CheckCircle2 size={13} />
//         Completed
//       </span>
//     );
//   }

//   if (status === "Working") {
//     return (
//       <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700">
//         <Clock3 size={13} />
//         Working
//       </span>
//     );
//   }

//   return (
//     <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-500">
//       <UserX size={13} />
//       Absent
//     </span>
//   );
// };
//   // =========================================================
//   // UI
//   // =========================================================

//   return (
//     <div className="min-h-screen bg-[#F5F7FB] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

//       {/* HEADER */}

//       <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

//         <div>
//           <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
//             <CalendarDays size={15} />
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

//         <div className="flex flex-wrap items-center gap-2">

//           <button
//             type="button"
//             onClick={
//               openAddAttendance
//             }
//             className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#050B1E] px-5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
//           >
//             <Plus size={16} />
//             Add Attendance
//           </button>

//           <button
//             type="button"
//             onClick={
//               fetchAttendance
//             }
//             disabled={loading}
//             className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             <RefreshCw
//               size={16}
//               className={
//                 loading
//                   ? "animate-spin"
//                   : ""
//               }
//             />

//             Refresh Data
//           </button>

//         </div>
//       </div>

//       {/* ERROR */}

//       {error && (
//         <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">

//           <div>
//             <p className="font-bold">
//               Attendance API Error
//             </p>

//             <p className="mt-1">
//               {error}
//             </p>
//           </div>

//           <button
//             type="button"
//             onClick={() =>
//               setError("")
//             }
//             className="rounded-lg p-1 text-red-400 hover:bg-red-100"
//           >
//             <X size={17} />
//           </button>

//         </div>
//       )}

//       {/* STATS */}

//       <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

//         <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//           <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
//             Total Rows
//           </p>

//           <p className="mt-2 text-3xl font-extrabold text-[#050B1E]">
//             {totalRecords}
//           </p>

//           <p className="mt-1 text-xs text-slate-400">
//             Attendance entries
//           </p>
//         </div>

//         <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//           <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
//             Completed
//           </p>

//           <p className="mt-2 text-3xl font-extrabold text-[#050B1E]">
//             {completedCount}
//           </p>

//           <p className="mt-1 text-xs text-slate-400">
//             Login + logout
//           </p>
//         </div>

//         <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//           <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
//             Currently Working
//           </p>

//           <p className="mt-2 text-3xl font-extrabold text-[#050B1E]">
//             {workingCount}
//           </p>

//           <p className="mt-1 text-xs text-slate-400">
//             No logout yet
//           </p>
//         </div>
//          {/* Late */}
//   <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
//     <p className="text-[11px] font-bold uppercase tracking-wider text-red-400">
//       Late
//     </p>

//     <p className="mt-2 text-3xl font-extrabold text-red-600">
//       {lateCount}
//     </p>

//     <p className="mt-1 text-xs text-slate-400">
//       After 08:15 AM
//     </p>
//   </div>

//         <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//           <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
//             Absent
//           </p>

//           <p className="mt-2 text-3xl font-extrabold text-[#050B1E]">
//             {absentCount}
//           </p>

//           <p className="mt-1 text-xs text-slate-400">
//             No attendance record
//           </p>
//         </div>

//       </div>

//       {/* FILTERS */}

//       <div className="mb-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

//         <div className="border-b border-slate-100 px-5 py-4">

//           <div className="flex items-center gap-3">

//             <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#050B1E] text-white">
//               <Filter size={16} />
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

//         </div>

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
//                   value={search}
//                   onChange={(e) =>
//                     setSearch(
//                       e.target.value
//                     )
//                   }
//                   placeholder="Name, email, role or team..."
//                   className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-[#050B1E] focus:bg-white"
//                 />

//               </div>

//             </div>

//             {/* FROM */}

//             <div>

//               <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
//                 From Date
//               </label>

//               <input
//                 type="date"
//                 value={fromDate}
//                 onChange={(e) =>
//                   setFromDate(
//                     e.target.value
//                   )
//                 }
//                 className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none focus:border-[#050B1E]"
//               />

//             </div>

//             {/* TO */}

//             <div>

//               <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
//                 To Date
//               </label>

//               <input
//                 type="date"
//                 value={toDate}
//                 onChange={(e) =>
//                   setToDate(
//                     e.target.value
//                   )
//                 }
//                 className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none focus:border-[#050B1E]"
//               />

//             </div>

//             {/* RESET */}

//             <div className="flex items-end">

//               <button
//                 type="button"
//                 onClick={
//                   clearFilters
//                 }
//                 className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 hover:bg-slate-50 lg:w-auto"
//               >
//                 <RefreshCw size={15} />
//                 Reset
//               </button>

//             </div>

//           </div>

//           {/* DOWNLOAD */}

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
//               className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
//             >
//               <FileSpreadsheet size={17} />
//               Download Excel
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
//               className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#050B1E] px-5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
//             >
//               <FileText size={17} />
//               Download PDF
//             </button>

//           </div>

//         </div>
//       </div>

//       {/* TABLE */}

//       <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

//         <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">

//           <div className="flex items-center gap-3">

//             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#050B1E]">
//               <Users size={18} />
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

//           <span className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-400">
//             {filteredRecords.length} Records
//           </span>

//         </div>

//         <div className="overflow-x-auto">

//           <table className="w-full min-w-[1250px]">

//             <thead>
//               <tr className="border-b border-slate-200 bg-[#F8FAFC]">

//                 <th className="px-5 py-3 text-left text-[10px] font-extrabold uppercase text-slate-400">
//                   #
//                 </th>

//                 <th className="px-5 py-3 text-left text-[10px] font-extrabold uppercase text-slate-400">
//                   Employee
//                 </th>

//                 <th className="px-5 py-3 text-left text-[10px] font-extrabold uppercase text-slate-400">
//                   Role
//                 </th>

//                 <th className="px-5 py-3 text-left text-[10px] font-extrabold uppercase text-slate-400">
//                   Team
//                 </th>

//                 <th className="px-5 py-3 text-left text-[10px] font-extrabold uppercase text-slate-400">
//                   Date
//                 </th>

//                 <th className="px-5 py-3 text-left text-[10px] font-extrabold uppercase text-slate-400">
//                   In Time
//                 </th>

//                 <th className="px-5 py-3 text-left text-[10px] font-extrabold uppercase text-slate-400">
//                   Out Time
//                 </th>

//                 <th className="px-5 py-3 text-left text-[10px] font-extrabold uppercase text-slate-400">
//                   Status
//                 </th>

//                 <th className="px-5 py-3 text-right text-[10px] font-extrabold uppercase text-slate-400">
//                   Actions
//                 </th>

//               </tr>
//             </thead>

//             <tbody>

//               {/* LOADING */}

//               {loading ? (
//                 <tr>
//                   <td
//                     colSpan={9}
//                     className="px-5 py-20 text-center"
//                   >

//                     <RefreshCw
//                       size={28}
//                       className="mx-auto animate-spin text-slate-400"
//                     />

//                     <p className="mt-4 text-sm font-bold text-slate-600">
//                       Loading attendance...
//                     </p>

//                   </td>
//                 </tr>
//               ) : filteredRecords.length ===
//                 0 ? (
//                 <tr>
//                   <td
//                     colSpan={9}
//                     className="px-5 py-20 text-center"
//                   >

//                     <CalendarDays
//                       size={30}
//                       className="mx-auto text-slate-400"
//                     />

//                     <p className="mt-4 text-sm font-bold text-slate-600">
//                       No attendance records found
//                     </p>

//                     <p className="mt-1 text-xs text-slate-400">
//                       Try changing your search or date filters.
//                     </p>

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
//                         className="border-b border-slate-100 hover:bg-[#F8FAFC]"
//                       >

//                         {/* NUMBER */}

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

//                             <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#050B1E] text-sm font-extrabold text-white">
//                               {name
//                                 .charAt(
//                                   0
//                                 )
//                                 .toUpperCase()}
//                             </div>

//                             <div>

//                               <p className="text-sm font-bold text-[#050B1E]">
//                                 {name}
//                               </p>

//                               <p className="mt-0.5 text-xs text-slate-400">
//                                 {getEmail(
//                                   row
//                                 )}
//                               </p>

//                             </div>

//                           </div>

//                         </td>

//                         {/* ROLE */}

//                         <td className="px-5 py-4">

//                           <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-600">
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

//                         {/* IN TIME */}

//                         <td className="px-5 py-4">

//                           <div
//                             className={`flex items-center gap-2 ${
//                               login
//                                 ? "text-emerald-600"
//                                 : "text-slate-300"
//                             }`}
//                           >

//                             <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
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

//                         {/* OUT TIME */}

//                         <td className="px-5 py-4">

//                           <div
//                             className={`flex items-center gap-2 ${
//                               logout
//                                 ? "text-rose-600"
//                                 : "text-slate-300"
//                             }`}
//                           >

//                             <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50">
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

//                         {/* ACTIONS */}

//                         <td className="px-5 py-4">

//                           <div className="flex items-center justify-end gap-2">

//                             {hasRecord ? (
//                               <>
//                                 <button
//                                   type="button"
//                                   onClick={() =>
//                                     openEditAttendance(
//                                       row
//                                     )
//                                   }
//                                   className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
//                                   title="Edit attendance"
//                                 >
//                                   <Pencil
//                                     size={15}
//                                   />
//                                 </button>

//                                 <button
//                                   type="button"
//                                   onClick={() =>
//                                     deleteAttendance(
//                                       row
//                                     )
//                                   }
//                                   disabled={
//                                     deletingAttendanceId ===
//                                     row.sourceRecordId
//                                   }
//                                   className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-white text-red-400 hover:bg-red-50 disabled:opacity-50"
//                                   title="Delete attendance"
//                                 >

//                                   {deletingAttendanceId ===
//                                   row.sourceRecordId ? (
//                                     <Loader2
//                                       size={15}
//                                       className="animate-spin"
//                                     />
//                                   ) : (
//                                     <Trash2
//                                       size={15}
//                                     />
//                                   )}

//                                 </button>
//                               </>
//                             ) : (
//                               <button
//                                 type="button"
//                                 onClick={() =>
//                                   openAddAttendanceForRow(
//                                     row
//                                   )
//                                 }
//                                 className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#050B1E] px-3 text-xs font-bold text-white hover:bg-slate-800"
//                               >
//                                 <Plus
//                                   size={14}
//                                 />
//                                 Add
//                               </button>
//                             )}

//                           </div>

//                         </td>

//                       </tr>
//                     );
//                   }
//                 )
//               )}

//             </tbody>

//           </table>

//         </div>

//       </div>

//       {/* =====================================================
//           MODAL
//       ====================================================== */}

//       {showAttendanceModal && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

//           <div
//             className="absolute inset-0 bg-[#050B1E]/50 backdrop-blur-sm"
//             onClick={
//               closeAttendanceModal
//             }
//           />

//           <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">

//             {/* HEADER */}

//             <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

//               <div className="flex items-center gap-3">

//                 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#050B1E] text-white">
//                   {modalMode ===
//                   "edit" ? (
//                     <Pencil size={18} />
//                   ) : (
//                     <Plus size={19} />
//                   )}
//                 </div>

//                 <div>

//                   <h2 className="text-base font-extrabold text-[#050B1E]">
//                     {modalMode ===
//                     "edit"
//                       ? "Edit Attendance"
//                       : "Add Attendance"}
//                   </h2>

//                   <p className="mt-0.5 text-xs text-slate-400">
//                     {modalMode ===
//                     "edit"
//                       ? "Update employee attendance details"
//                       : "Create a new attendance record"}
//                   </p>

//                 </div>

//               </div>

//               <button
//                 type="button"
//                 onClick={
//                   closeAttendanceModal
//                 }
//                 disabled={
//                   savingAttendance
//                 }
//                 className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
//               >
//                 <X size={18} />
//               </button>

//             </div>

//             {/* BODY */}

//             <div className="space-y-5 p-6">

//               {/* EMPLOYEE */}

//               <div>

//                 <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
//                   Employee
//                 </label>

//                 <div className="relative">

//                   <Users
//                     size={16}
//                     className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
//                   />

//                   <select
//                     value={
//                       attendanceForm.user_id
//                     }
//                     onChange={(e) =>
//                       updateAttendanceForm(
//                         "user_id",
//                         e.target.value
//                       )
//                     }
//                     className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-semibold text-slate-700 outline-none"
//                   >

//                     <option value="">
//                       Select employee
//                     </option>

//                     {users.map(
//                       (user) => (
//                         <option
//                           key={
//                             user.user_id
//                           }
//                           value={
//                             user.user_id
//                           }
//                         >
//                           {user.name} —{" "}
//                           {
//                             user.email
//                           }
//                         </option>
//                       )
//                     )}

//                   </select>

//                   <ChevronDown
//                     size={16}
//                     className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
//                   />

//                 </div>

//               </div>

//               {/* DATE */}

//               <div>

//                 <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
//                   Attendance Date
//                 </label>

//                 <input
//                   type="date"
//                   value={
//                     attendanceForm.date
//                   }
//                   onChange={(e) =>
//                     updateAttendanceForm(
//                       "date",
//                       e.target.value
//                     )
//                   }
//                   className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none"
//                 />

//               </div>

//               {/* TIMES */}

//               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

//                 <div>

//                   <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
//                     In Time
//                   </label>

//                   <input
//                     type="datetime-local"
//                     value={
//                       attendanceForm.login_time
//                     }
//                     onChange={(e) =>
//                       updateAttendanceForm(
//                         "login_time",
//                         e.target.value
//                       )
//                     }
//                     className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none"
//                   />

//                 </div>

//                 <div>

//                   <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
//                     Out Time
//                   </label>

//                   <input
//                     type="datetime-local"
//                     value={
//                       attendanceForm.logout_time
//                     }
//                     onChange={(e) =>
//                       updateAttendanceForm(
//                         "logout_time",
//                         e.target.value
//                       )
//                     }
//                     className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none"
//                   />

//                   <p className="mt-1.5 text-[10px] text-slate-400">
//                     Leave empty if employee is still working.
//                   </p>

//                 </div>

//               </div>

//               {/* INFO */}

//               <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">

//                 <AlertTriangle
//                   size={17}
//                   className="mt-0.5 shrink-0 text-blue-500"
//                 />

//                 <div>

//                   <p className="text-xs font-bold text-blue-700">
//                     Attendance status
//                   </p>

//                   <p className="mt-0.5 text-[11px] leading-5 text-blue-600">
//                     Status is automatically calculated from In Time and Out Time.
//                   </p>

//                 </div>

//               </div>

//             </div>

//             {/* FOOTER */}

//             <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row sm:justify-end">

//               <button
//                 type="button"
//                 onClick={
//                   closeAttendanceModal
//                 }
//                 disabled={
//                   savingAttendance
//                 }
//                 className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 hover:bg-slate-100"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 onClick={
//                   saveAttendance
//                 }
//                 disabled={
//                   savingAttendance
//                 }
//                 className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#050B1E] px-6 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
//               >

//                 {savingAttendance ? (
//                   <>
//                     <Loader2
//                       size={16}
//                       className="animate-spin"
//                     />
//                     Saving...
//                   </>
//                 ) : (
//                   <>
//                     <Save size={16} />

//                     {modalMode ===
//                     "edit"
//                       ? "Save Changes"
//                       : "Add Attendance"}
//                   </>
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

// import { useEffect, useMemo, useState } from "react";
// import {
//   CalendarDays,
//   Search,
//   Download,
//   UserCheck,
//   Clock3,
//   AlertCircle,
//   ChevronDown,
//   RefreshCw,
//   FileText,
//   Users,
//   Timer,
// } from "lucide-react";

// const CALIFORNIA_TIMEZONE = "America/Los_Angeles";

// export default function AttendancePage() {
//   // ============================================================
//   // USER
//   // ============================================================

//   const [currentUser, setCurrentUser] = useState(null);
//   const [loadingUser, setLoadingUser] = useState(true);

//   // ============================================================
//   // ATTENDANCE
//   // ============================================================

//   const [attendance, setAttendance] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // ============================================================
//   // FILTERS
//   // ============================================================

//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All");

//   const [fromDate, setFromDate] = useState(
//     getCaliforniaMonthStart()
//   );

//   const [toDate, setToDate] = useState(
//     getCaliforniaToday()
//   );

//   // ============================================================
//   // PDF
//   // ============================================================

//   const [pdfLoading, setPdfLoading] = useState(false);

//   // ============================================================
//   // ADMIN
//   // ============================================================

//   const isAdmin =
//     String(currentUser?.role || "").toLowerCase() === "admin";

//   // ============================================================
//   // CALIFORNIA DATE HELPERS
//   // ============================================================

//   function getCaliforniaParts() {
//     const now = new Date();

//     const parts = new Intl.DateTimeFormat("en-US", {
//       timeZone: CALIFORNIA_TIMEZONE,
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//     }).formatToParts(now);

//     const result = {};

//     for (const part of parts) {
//       if (part.type !== "literal") {
//         result[part.type] = part.value;
//       }
//     }

//     return result;
//   }

//   function getCaliforniaToday() {
//     const parts = getCaliforniaParts();

//     return `${parts.year}-${parts.month}-${parts.day}`;
//   }

//   function getCaliforniaMonthStart() {
//     const parts = getCaliforniaParts();

//     return `${parts.year}-${parts.month}-01`;
//   }

//   // ============================================================
//   // MYSQL DATETIME PARSER
//   // ============================================================
//   //
//   // IMPORTANT:
//   //
//   // Database values are California wall-clock values:
//   //
//   // 2026-09-16 08:10:00
//   //
//   // We DO NOT use new Date(value) here.
//   //
//   // ============================================================

//   function parseMySQLDateTime(value) {
//     if (!value) return null;

//     const input = String(value).trim();

//     const match = input.match(
//       /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/
//     );

//     if (!match) {
//       return null;
//     }

//     return {
//       year: Number(match[1]),
//       month: Number(match[2]),
//       day: Number(match[3]),
//       hour: Number(match[4]),
//       minute: Number(match[5]),
//       second: Number(match[6] || 0),
//     };
//   }

//   // ============================================================
//   // FORMAT DATE
//   // ============================================================

//   function formatCaliforniaDate(value) {
//     const parts = parseMySQLDateTime(value);

//     if (!parts) return "-";

//     const monthName = new Intl.DateTimeFormat("en-US", {
//       month: "short",
//     }).format(
//       new Date(
//         Date.UTC(
//           parts.year,
//           parts.month - 1,
//           parts.day
//         )
//       )
//     );

//     return `${monthName} ${String(parts.day).padStart(
//       2,
//       "0"
//     )}, ${parts.year}`;
//   }

//   // ============================================================
//   // FORMAT TIME
//   // ============================================================

//   function formatCaliforniaTime(value) {
//     const parts = parseMySQLDateTime(value);

//     if (!parts) return "-";

//     const hour12 =
//       parts.hour % 12 || 12;

//     const suffix =
//       parts.hour >= 12 ? "PM" : "AM";

//     return `${hour12}:${String(
//       parts.minute
//     ).padStart(2, "0")}:${String(
//       parts.second
//     ).padStart(2, "0")} ${suffix}`;
//   }

//   // ============================================================
//   // FORMAT SHORT DATETIME
//   // ============================================================

//   function formatCaliforniaDateTime(value) {
//     if (!value) return "-";

//     return `${formatCaliforniaDate(
//       value
//     )} ${formatCaliforniaTime(value)}`;
//   }

//   // ============================================================
//   // DURATION
//   // ============================================================

//   function formatDuration(seconds) {
//     const total = Math.max(
//       0,
//       Number(seconds) || 0
//     );

//     const hours = Math.floor(
//       total / 3600
//     );

//     const minutes = Math.floor(
//       (total % 3600) / 60
//     );

//     const remainingSeconds =
//       total % 60;

//     if (hours > 0) {
//       return `${hours}h ${minutes}m`;
//     }

//     if (minutes > 0) {
//       return `${minutes}m ${remainingSeconds}s`;
//     }

//     return `${remainingSeconds}s`;
//   }

//   // ============================================================
//   // DURATION SECONDS
//   // ============================================================
//   //
//   // If API already sends duration_seconds, use it.
//   //
//   // Otherwise calculate from California wall-clock values.
//   //
//   // ============================================================

//   function getDurationSeconds(row) {
//     if (
//       row.duration_seconds !==
//         undefined &&
//       row.duration_seconds !== null
//     ) {
//       return Math.max(
//         0,
//         Number(row.duration_seconds) || 0
//       );
//     }

//     if (
//       !row.login_time ||
//       !row.logout_time
//     ) {
//       return 0;
//     }

//     const login =
//       parseMySQLDateTime(
//         row.login_time
//       );

//     const logout =
//       parseMySQLDateTime(
//         row.logout_time
//       );

//     if (!login || !logout) {
//       return 0;
//     }

//     // Use UTC only as a neutral arithmetic container.
//     // The values themselves are California wall-clock values.
//     const start = Date.UTC(
//       login.year,
//       login.month - 1,
//       login.day,
//       login.hour,
//       login.minute,
//       login.second
//     );

//     const end = Date.UTC(
//       logout.year,
//       logout.month - 1,
//       logout.day,
//       logout.hour,
//       logout.minute,
//       logout.second
//     );

//     if (end < start) {
//       return 0;
//     }

//     return Math.floor(
//       (end - start) / 1000
//     );
//   }

//   // ============================================================
//   // STATUS
//   // ============================================================

//   function getStatus(row) {
//     const value = String(
//       row.attendance_status ||
//         row.status ||
//         row.login_status ||
//         ""
//     ).toLowerCase();

//     if (value.includes("late")) {
//       return "Late";
//     }

//     if (value.includes("absent")) {
//       return "Absent";
//     }

//     if (value.includes("leave")) {
//       return "Leave";
//     }

//     // API returns "On Time"
//     // UI shows "Present"
//     if (
//       value.includes("on time") ||
//       value.includes("present")
//     ) {
//       return "Present";
//     }

//     return row.login_time
//       ? "Present"
//       : "Absent";
//   }

//   // ============================================================
//   // STATUS STYLE
//   // ============================================================

//   function statusClasses(status) {
//     switch (status) {
//       case "Present":
//         return "border-emerald-200 bg-emerald-50 text-emerald-700";

//       case "Late":
//         return "border-amber-200 bg-amber-50 text-amber-700";

//       case "Absent":
//         return "border-red-200 bg-red-50 text-red-700";

//       case "Leave":
//         return "border-purple-200 bg-purple-50 text-purple-700";

//       default:
//         return "border-slate-200 bg-slate-50 text-slate-600";
//     }
//   }

//   // ============================================================
//   // LOAD USER
//   // ============================================================

//   useEffect(() => {
//     let mounted = true;

//     async function loadUser() {
//       try {
//         const res = await fetch(
//           "/api/auth/me",
//           {
//             cache: "no-store",
//             credentials: "include",
//           }
//         );

//         const data =
//           await res.json();

//         if (
//           !res.ok ||
//           !data?.user
//         ) {
//           window.location.href =
//             "/login";
//           return;
//         }

//         if (mounted) {
//           setCurrentUser(
//             data.user
//           );
//         }
//       } catch (error) {
//         console.error(
//           "USER LOAD ERROR:",
//           error
//         );

//         window.location.href =
//           "/login";
//       } finally {
//         if (mounted) {
//           setLoadingUser(false);
//         }
//       }
//     }

//     loadUser();

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   // ============================================================
//   // LOAD ATTENDANCE
//   // ============================================================

//   async function loadAttendance() {
//     try {
//       setLoading(true);

//       const params =
//         new URLSearchParams();

//       if (fromDate) {
//         params.set(
//           "from",
//           fromDate
//         );
//       }

//       if (toDate) {
//         params.set(
//           "to",
//           toDate
//         );
//       }

//       const query =
//         params.toString();

//       const res = await fetch(
//         `/api/login-history${
//           query
//             ? `?${query}`
//             : ""
//         }`,
//         {
//           cache: "no-store",
//           credentials: "include",
//           headers: {
//             Accept:
//               "application/json",
//           },
//         }
//       );

//       const data =
//         await res.json();

//       if (
//         !res.ok ||
//         !data?.success
//       ) {
//         throw new Error(
//           data?.message ||
//             "Failed to load attendance"
//         );
//       }

//       // IMPORTANT:
//       //
//       // Your API returns:
//       //
//       // history: [...]
//       //
//       // NOT:
//       //
//       // attendance: [...]
//       //

//       setAttendance(
//         Array.isArray(
//           data.history
//         )
//           ? data.history
//           : []
//       );
//     } catch (error) {
//       console.error(
//         "ATTENDANCE LOAD ERROR:",
//         error
//       );

//       setAttendance([]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   // ============================================================
//   // FETCH ATTENDANCE WHEN USER IS READY
//   // ============================================================

//   useEffect(() => {
//     if (
//       !loadingUser &&
//       currentUser
//     ) {
//       loadAttendance();
//     }
//   }, [
//     loadingUser,
//     currentUser,
//     fromDate,
//     toDate,
//   ]);

//   // ============================================================
//   // FILTERED DATA
//   // ============================================================

//   const filteredAttendance =
//     useMemo(() => {
//       const query =
//         search
//           .trim()
//           .toLowerCase();

//       return attendance.filter(
//         (row) => {
//           const status =
//             getStatus(row);

//           if (
//             statusFilter !==
//               "All" &&
//             status !==
//               statusFilter
//           ) {
//             return false;
//           }

//           if (!query) {
//             return true;
//           }

//           const searchableText =
//             [
//               row.name,
//               row.email,
//               row.team,
//               row.role,
//               row.user_name,
//               row.user_email,
//               row.user_id,
//               status,
//             ]
//               .filter(
//                 Boolean
//               )
//               .join(" ")
//               .toLowerCase();

//           return searchableText.includes(
//             query
//           );
//         }
//       );
//     }, [
//       attendance,
//       search,
//       statusFilter,
//     ]);

//   // ============================================================
//   // STATS
//   // ============================================================

//   const stats = useMemo(() => {
//     const total =
//       filteredAttendance.length;

//     const present =
//       filteredAttendance.filter(
//         (row) =>
//           getStatus(row) ===
//           "Present"
//       ).length;

//     const late =
//       filteredAttendance.filter(
//         (row) =>
//           getStatus(row) ===
//           "Late"
//       ).length;

//     const absent =
//       filteredAttendance.filter(
//         (row) =>
//           getStatus(row) ===
//           "Absent"
//       ).length;

//     const totalSeconds =
//       filteredAttendance.reduce(
//         (sum, row) =>
//           sum +
//           getDurationSeconds(
//             row
//           ),
//         0
//       );

//     return {
//       total,
//       present,
//       late,
//       absent,
//       totalSeconds,
//     };
//   }, [filteredAttendance]);

//   // ============================================================
//   // DOWNLOAD PDF
//   // ============================================================

//   async function downloadPDF() {
//     if (
//       filteredAttendance.length ===
//       0
//     ) {
//       return;
//     }

//     try {
//       setPdfLoading(true);

//       const {
//         jsPDF,
//       } = await import(
//         "jspdf"
//       );

//       const {
//         autoTable,
//       } = await import(
//         "jspdf-autotable"
//       );

//       const doc =
//         new jsPDF({
//           orientation:
//             isAdmin
//               ? "landscape"
//               : "portrait",
//           unit: "mm",
//           format: "a4",
//         });

//       const title = isAdmin
//         ? "Attendance Report"
//         : "My Attendance Report";

//       // ========================================================
//       // TITLE
//       // ========================================================

//       doc.setFont(
//         "helvetica",
//         "bold"
//       );

//       doc.setFontSize(18);

//       doc.text(
//         title,
//         14,
//         18
//       );

//       // ========================================================
//       // META
//       // ========================================================

//       doc.setFont(
//         "helvetica",
//         "normal"
//       );

//       doc.setFontSize(9);

//       doc.text(
//         "Timezone: America/Los_Angeles",
//         14,
//         25
//       );

//       doc.text(
//         `Period: ${
//           fromDate || "-"
//         } to ${
//           toDate || "-"
//         }`,
//         14,
//         31
//       );

//       if (currentUser?.name) {
//         doc.text(
//           `Generated for: ${currentUser.name}`,
//           14,
//           37
//         );
//       }

//       // ========================================================
//       // TABLE HEADERS
//       // ========================================================

//       const headers = isAdmin
//         ? [
//             "Staff",
//             "Email",
//             "Date",
//             "Login",
//             "Logout",
//             "Duration",
//             "Status",
//           ]
//         : [
//             "Date",
//             "Login",
//             "Logout",
//             "Duration",
//             "Status",
//           ];

//       // ========================================================
//       // TABLE ROWS
//       // ========================================================

//       const rows =
//         filteredAttendance.map(
//           (row) => {
//             const status =
//               getStatus(row);

//             const name =
//               row.name ||
//               row.user_name ||
//               "-";

//             const email =
//               row.email ||
//               row.user_email ||
//               "-";

//             const duration =
//               formatDuration(
//                 getDurationSeconds(
//                   row
//                 )
//               );

//             if (isAdmin) {
//               return [
//                 name,
//                 email,
//                 formatCaliforniaDate(
//                   row.login_time
//                 ),
//                 formatCaliforniaTime(
//                   row.login_time
//                 ),
//                 formatCaliforniaTime(
//                   row.logout_time
//                 ),
//                 duration,
//                 status,
//               ];
//             }

//             return [
//               formatCaliforniaDate(
//                 row.login_time
//               ),
//               formatCaliforniaTime(
//                 row.login_time
//               ),
//               formatCaliforniaTime(
//                 row.logout_time
//               ),
//               duration,
//               status,
//             ];
//           }
//         );

//       // ========================================================
//       // TABLE
//       // ========================================================

//       autoTable(doc, {
//         head: [headers],
//         body: rows,
//         startY: 43,

//         theme: "grid",

//         styles: {
//           font:
//             "helvetica",
//           fontSize: 8,
//           cellPadding: 3,
//           valign: "middle",
//         },

//         headStyles: {
//           fontStyle:
//             "bold",
//           textColor: [
//             255,
//             255,
//             255,
//           ],
//           fillColor: [
//             116,
//             28,
//             41,
//           ],
//         },

//         alternateRowStyles: {
//           fillColor: [
//             248,
//             250,
//             252,
//           ],
//         },

//         columnStyles:
//           isAdmin
//             ? {
//                 0: {
//                   cellWidth: 32,
//                 },
//                 1: {
//                   cellWidth: 48,
//                 },
//                 2: {
//                   cellWidth: 29,
//                 },
//                 3: {
//                   cellWidth: 28,
//                 },
//                 4: {
//                   cellWidth: 28,
//                 },
//                 5: {
//                   cellWidth: 25,
//                 },
//                 6: {
//                   cellWidth: 25,
//                 },
//               }
//             : {
//                 0: {
//                   cellWidth: 32,
//                 },
//                 1: {
//                   cellWidth: 32,
//                 },
//                 2: {
//                   cellWidth: 32,
//                 },
//                 3: {
//                   cellWidth: 30,
//                 },
//                 4: {
//                   cellWidth: 28,
//                 },
//               },
//       });

//       // ========================================================
//       // SUMMARY
//       // ========================================================

//       const finalY =
//         doc.lastAutoTable?.finalY ||
//         43;

//       let summaryY =
//         finalY + 12;

//       // Prevent summary from going off page.
//       if (summaryY > 270) {
//         doc.addPage();
//         summaryY = 20;
//       }

//       doc.setFont(
//         "helvetica",
//         "bold"
//       );

//       doc.setFontSize(10);

//       doc.text(
//         "Attendance Summary",
//         14,
//         summaryY
//       );

//       doc.setFont(
//         "helvetica",
//         "normal"
//       );

//       doc.setFontSize(9);

//       doc.text(
//         `Total Records: ${stats.total}`,
//         14,
//         summaryY + 7
//       );

//       doc.text(
//         `Present: ${stats.present}`,
//         14,
//         summaryY + 14
//       );

//       doc.text(
//         `Late: ${stats.late}`,
//         14,
//         summaryY + 21
//       );

//       doc.text(
//         `Absent: ${stats.absent}`,
//         14,
//         summaryY + 28
//       );

//       doc.text(
//         `Total Hours: ${formatDuration(
//           stats.totalSeconds
//         )}`,
//         14,
//         summaryY + 35
//       );

//       doc.text(
//         "Attendance cutoff: 08:15:00 AM California Time",
//         14,
//         summaryY + 42
//       );

//       // ========================================================
//       // FOOTER
//       // ========================================================

//       const pageCount =
//         doc.getNumberOfPages();

//       for (
//         let page = 1;
//         page <= pageCount;
//         page++
//       ) {
//         doc.setPage(page);

//         doc.setFontSize(7);

//         doc.setFont(
//           "helvetica",
//           "normal"
//         );

//         doc.text(
//           `California Time · America/Los_Angeles · Page ${page} of ${pageCount}`,
//           14,
//           290
//         );
//       }

//       // ========================================================
//       // SAVE
//       // ========================================================

//       const filename =
//         isAdmin
//           ? `attendance-report-${fromDate || "all"}-${toDate || "all"}.pdf`
//           : `my-attendance-${fromDate || "all"}-${toDate || "all"}.pdf`;

//       doc.save(filename);
//     } catch (error) {
//       console.error(
//         "PDF ERROR:",
//         error
//       );

//       alert(
//         "PDF generate nahi ho saki. Check karo ke jspdf aur jspdf-autotable installed hain."
//       );
//     } finally {
//       setPdfLoading(false);
//     }
//   }

//   // ============================================================
//   // CLEAR FILTERS
//   // ============================================================

//   function resetFilters() {
//     setSearch("");
//     setStatusFilter("All");
//     setFromDate(
//       getCaliforniaMonthStart()
//     );
//     setToDate(
//       getCaliforniaToday()
//     );
//   }

//   // ============================================================
//   // LOADING USER
//   // ============================================================

//   if (loadingUser) {
//     return (
//       <div className="min-h-[70vh] flex items-center justify-center bg-[#f8fafc]">
//         <div className="flex items-center gap-3 text-slate-500">
//           <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#741C29]" />

//           <span className="text-sm font-semibold">
//             Loading attendance...
//           </span>
//         </div>
//       </div>
//     );
//   }

//   // ============================================================
//   // UI
//   // ============================================================

//   return (
//     <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-8">

//       {/* ======================================================
//           HEADER
//       ======================================================= */}

//       <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

//         <div>
//           <div className="flex items-start gap-3">

//             <div className="mt-1 h-10 w-1 rounded-full bg-[#741C29]" />

//             <div>
//               <div className="flex flex-wrap items-center gap-3">

//                 <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
//                   Attendance
//                 </h1>

//                 {isAdmin && (
//                   <span className="rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-purple-700">
//                     Admin View
//                   </span>
//                 )}

//               </div>

//               <p className="mt-1 text-sm font-medium text-slate-500">
//                 {isAdmin
//                   ? "Monitor staff login and attendance history"
//                   : "View your login and attendance history"}
//               </p>

//               <div className="mt-2 flex flex-wrap items-center gap-2">

//                 <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500">
//                   <Clock3 size={12} />
//                   California Time
//                 </span>

//                 <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500">
//                   08:15 AM Cutoff
//                 </span>

//               </div>
//             </div>
//           </div>
//         </div>

//         {/* PDF BUTTON */}

//         <button
//           type="button"
//           onClick={downloadPDF}
//           disabled={
//             pdfLoading ||
//             filteredAttendance.length === 0
//           }
//           className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#741C29] px-5 text-sm font-bold text-white shadow-lg shadow-[#741C29]/15 transition hover:bg-[#5f1621] disabled:cursor-not-allowed disabled:opacity-50"
//         >
//           {pdfLoading ? (
//             <>
//               <RefreshCw
//                 size={16}
//                 className="animate-spin"
//               />
//               Generating...
//             </>
//           ) : (
//             <>
//               <Download size={16} />
//               Download PDF
//             </>
//           )}
//         </button>
//       </div>

//       {/* ======================================================
//           STAT CARDS
//       ======================================================= */}

//       <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

//         <StatCard
//           title={
//             isAdmin
//               ? "Total Records"
//               : "My Records"
//           }
//           value={stats.total}
//           subtitle={
//             isAdmin
//               ? "Attendance records"
//               : "Login records"
//           }
//           icon={
//             isAdmin
//               ? Users
//               : CalendarDays
//           }
//         />

//         <StatCard
//           title="Present"
//           value={stats.present}
//           subtitle="On time arrivals"
//           icon={UserCheck}
//           iconClass="text-emerald-600"
//           bgClass="bg-emerald-50"
//         />

//         <StatCard
//           title="Late"
//           value={stats.late}
//           subtitle="Late arrivals"
//           icon={Clock3}
//           iconClass="text-amber-600"
//           bgClass="bg-amber-50"
//         />

//         <StatCard
//           title="Absent"
//           value={stats.absent}
//           subtitle="No attendance"
//           icon={AlertCircle}
//           iconClass="text-red-600"
//           bgClass="bg-red-50"
//         />

//         <StatCard
//           title="Total Hours"
//           value={formatDuration(
//             stats.totalSeconds
//           )}
//           subtitle="Logged hours"
//           icon={Timer}
//           iconClass="text-blue-600"
//           bgClass="bg-blue-50"
//         />

//       </div>

//       {/* ======================================================
//           FILTERS
//       ======================================================= */}

//       <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

//         <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

//           <div className="flex items-center gap-2">

//             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
//               <Search
//                 size={15}
//                 className="text-slate-600"
//               />
//             </div>

//             <div>
//               <h2 className="text-sm font-extrabold text-slate-900">
//                 Filters
//               </h2>

//               <p className="text-[11px] font-medium text-slate-400">
//                 Find attendance records quickly
//               </p>
//             </div>

//           </div>

//           <button
//             type="button"
//             onClick={resetFilters}
//             className="text-xs font-bold text-[#741C29] transition hover:underline"
//           >
//             Reset Filters
//           </button>

//         </div>

//         <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">

//           {/* SEARCH */}

//           <div className="relative">

//             <Search
//               size={16}
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//             />

//             <input
//               type="text"
//               value={search}
//               onChange={(e) =>
//                 setSearch(
//                   e.target.value
//                 )
//               }
//               placeholder={
//                 isAdmin
//                   ? "Search staff, email..."
//                   : "Search..."
//               }
//               className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#741C29] focus:bg-white focus:ring-4 focus:ring-[#741C29]/10"
//             />

//           </div>

//           {/* FROM */}

//           <div className="relative">

//             <CalendarDays
//               size={16}
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//             />

//             <input
//               type="date"
//               value={fromDate}
//               max={
//                 toDate ||
//                 undefined
//               }
//               onChange={(e) =>
//                 setFromDate(
//                   e.target.value
//                 )
//               }
//               className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#741C29] focus:bg-white focus:ring-4 focus:ring-[#741C29]/10"
//             />

//           </div>

//           {/* TO */}

//           <div className="relative">

//             <CalendarDays
//               size={16}
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//             />

//             <input
//               type="date"
//               value={toDate}
//               min={
//                 fromDate ||
//                 undefined
//               }
//               onChange={(e) =>
//                 setToDate(
//                   e.target.value
//                 )
//               }
//               className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#741C29] focus:bg-white focus:ring-4 focus:ring-[#741C29]/10"
//             />

//           </div>

//           {/* STATUS */}

//           <div className="relative">

//             <select
//               value={statusFilter}
//               onChange={(e) =>
//                 setStatusFilter(
//                   e.target.value
//                 )
//               }
//               className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-[#741C29] focus:bg-white focus:ring-4 focus:ring-[#741C29]/10"
//             >
//               <option value="All">
//                 All Status
//               </option>

//               <option value="Present">
//                 Present
//               </option>

//               <option value="Late">
//                 Late
//               </option>

//               <option value="Absent">
//                 Absent
//               </option>

//               <option value="Leave">
//                 Leave
//               </option>
//             </select>

//             <ChevronDown
//               size={15}
//               className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
//             />

//           </div>

//         </div>
//       </div>

//       {/* ======================================================
//           TABLE
//       ======================================================= */}

//       <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

//         {/* TABLE TOP */}

//         <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

//           <div>

//             <h2 className="text-sm font-extrabold text-slate-900">
//               {isAdmin
//                 ? "Staff Attendance"
//                 : "My Attendance"}
//             </h2>

//             <p className="mt-0.5 text-xs font-medium text-slate-400">
//               All times shown in California · America/Los_Angeles
//             </p>

//           </div>

//           <div className="flex items-center gap-2">

//             <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">
//               {filteredAttendance.length}{" "}
//               Records
//             </span>

//             <button
//               type="button"
//               onClick={loadAttendance}
//               disabled={loading}
//               className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-[#741C29] disabled:opacity-50"
//               title="Refresh"
//             >
//               <RefreshCw
//                 size={14}
//                 className={
//                   loading
//                     ? "animate-spin"
//                     : ""
//                 }
//               />
//             </button>

//           </div>

//         </div>

//         {/* TABLE */}

//         <div className="overflow-x-auto">

//           <table className="min-w-[950px] w-full">

//             <thead>
//               <tr className="border-b border-slate-100 bg-slate-50/80">

//                 {isAdmin && (
//                   <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
//                     Staff
//                   </th>
//                 )}

//                 <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
//                   Date
//                 </th>

//                 <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
//                   Login
//                 </th>

//                 <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
//                   Logout
//                 </th>

//                 <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
//                   Duration
//                 </th>

//                 <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
//                   Status
//                 </th>

//                 {isAdmin && (
//                   <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
//                     Email
//                   </th>
//                 )}

//               </tr>
//             </thead>

//             <tbody className="divide-y divide-slate-100">

//               {/* LOADING */}

//               {loading ? (
//                 <tr>
//                   <td
//                     colSpan={
//                       isAdmin
//                         ? 7
//                         : 5
//                     }
//                     className="px-5 py-16 text-center"
//                   >
//                     <div className="flex items-center justify-center gap-3 text-sm font-medium text-slate-400">

//                       <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#741C29]" />

//                       Loading attendance...

//                     </div>
//                   </td>
//                 </tr>
//               ) : filteredAttendance.length === 0 ? (

//                 /* EMPTY */

//                 <tr>
//                   <td
//                     colSpan={
//                       isAdmin
//                         ? 7
//                         : 5
//                     }
//                     className="px-5 py-16 text-center"
//                   >

//                     <div className="mx-auto flex max-w-sm flex-col items-center">

//                       <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
//                         <FileText
//                           size={21}
//                           className="text-slate-400"
//                         />
//                       </div>

//                       <p className="text-sm font-bold text-slate-700">
//                         No attendance found
//                       </p>

//                       <p className="mt-1 text-xs font-medium text-slate-400">
//                         Try changing your date, search, or status filters.
//                       </p>

//                     </div>

//                   </td>
//                 </tr>

//               ) : (

//                 /* DATA */

//                 filteredAttendance.map(
//                   (row, index) => {
//                     const status =
//                       getStatus(row);

//                     const name =
//                       row.name ||
//                       row.user_name ||
//                       "-";

//                     const email =
//                       row.email ||
//                       row.user_email ||
//                       "-";

//                     const duration =
//                       getDurationSeconds(
//                         row
//                       );

//                     return (
//                       <tr
//                         key={
//                           row.id ||
//                           `${row.user_id}-${row.login_time}-${index}`
//                         }
//                         className="group transition hover:bg-slate-50/70"
//                       >

//                         {/* STAFF */}

//                         {isAdmin && (
//                           <td className="px-5 py-4">

//                             <div className="flex items-center gap-3">

//                               <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-black uppercase text-white">
//                                 {name
//                                   .trim()
//                                   .charAt(
//                                     0
//                                   ) ||
//                                   "U"}
//                               </div>

//                               <div>

//                                 <p className="text-xs font-extrabold text-slate-800">
//                                   {name}
//                                 </p>

//                                 <p className="mt-0.5 text-[10px] font-medium text-slate-400">
//                                   ID:{" "}
//                                   {row.user_id ||
//                                     "-"}
//                                 </p>

//                               </div>

//                             </div>

//                           </td>
//                         )}

//                         {/* DATE */}

//                         <td className="px-5 py-4 whitespace-nowrap text-xs font-bold text-slate-700">
//                           {formatCaliforniaDate(
//                             row.login_time
//                           )}
//                         </td>

//                         {/* LOGIN */}

//                         <td className="px-5 py-4 whitespace-nowrap">

//                           <span className="text-xs font-semibold text-slate-600">
//                             {formatCaliforniaTime(
//                               row.login_time
//                             )}
//                           </span>

//                         </td>

//                         {/* LOGOUT */}

//                         <td className="px-5 py-4 whitespace-nowrap">

//                           {row.logout_time ? (
//                             <span className="text-xs font-semibold text-slate-600">
//                               {formatCaliforniaTime(
//                                 row.logout_time
//                               )}
//                             </span>
//                           ) : (
//                             <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700">
//                               <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600" />
//                               Online
//                             </span>
//                           )}

//                         </td>

//                         {/* DURATION */}

//                         <td className="px-5 py-4 whitespace-nowrap">

//                           <span className="font-mono text-xs font-bold tabular-nums text-slate-700">
//                             {duration > 0
//                               ? formatDuration(
//                                   duration
//                                 )
//                               : row.logout_time
//                               ? "0s"
//                               : "Running"}
//                           </span>

//                         </td>

//                         {/* STATUS */}

//                         <td className="px-5 py-4">

//                           <span
//                             className={`inline-flex rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${statusClasses(
//                               status
//                             )}`}
//                           >
//                             {status}
//                           </span>

//                         </td>

//                         {/* EMAIL */}

//                         {isAdmin && (
//                           <td className="px-5 py-4 text-xs font-medium text-slate-500">
//                             {email}
//                           </td>
//                         )}

//                       </tr>
//                     );
//                   }
//                 )
//               )}

//             </tbody>

//           </table>

//         </div>
//       </div>

//       {/* ======================================================
//           FOOTER
//       ======================================================= */}

//       <div className="mt-4 flex flex-col gap-2 text-[10px] font-medium text-slate-400 sm:flex-row sm:items-center sm:justify-between">

//         <span>
//           All attendance times are displayed in California Time.
//         </span>

//         <span>
//           America/Los_Angeles · PST / PDT
//         </span>

//       </div>

//     </div>
//   );
// }

// // ============================================================
// // STAT CARD
// // ============================================================

// function StatCard({
//   title,
//   value,
//   subtitle,
//   icon: Icon,
//   iconClass = "text-[#741C29]",
//   bgClass = "bg-[#741C29]/5",
// }) {
//   return (
//     <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

//       <div className="flex items-start justify-between">

//         <div>

//           <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
//             {title}
//           </p>

//           <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">
//             {value}
//           </p>

//           <p className="mt-1 text-[10px] font-medium text-slate-400">
//             {subtitle}
//           </p>

//         </div>

//         <div
//           className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgClass} ${iconClass}`}
//         >
//           <Icon size={18} />
//         </div>

//       </div>

//     </div>
//   );
// }










"use client";

import {
  CalendarDays,
  Search,
  Download,
  Users,
  UserCheck,
  Clock3,
  AlertCircle,
  ChevronDown,
  RefreshCw,
  FileText,
  Plus,
  Pencil,
  X,
  Save,
} from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";

/* =========================================================
   CONSTANTS
========================================================= */

const CALIFORNIA_TIMEZONE = "America/Los_Angeles";

/* =========================================================
   CALIFORNIA DATE
========================================================= */

function getCaliforniaDateInput() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CALIFORNIA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = {};

  parts.forEach((part) => {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  });

  return `${values.year}-${values.month}-${values.day}`;
}

function getCaliforniaMonthStart() {
  const today = getCaliforniaDateInput();

  return `${today.slice(0, 8)}01`;
}

/* =========================================================
   DB DATE PARSER
========================================================= */

function parseDbDateTime(value) {
  const match = String(value ?? "")
    .trim()
    .match(
      /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/
    );

  if (!match) {
    return null;
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: Number(match[6] || 0),
  };
}

/* =========================================================
   DISPLAY DATE
========================================================= */

function formatCaliforniaDate(value) {
  const p = parseDbDateTime(value);

  if (!p) return "-";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(
    new Date(
      p.year,
      p.month - 1,
      p.day
    )
  );
}

/* =========================================================
   DISPLAY TIME
========================================================= */

function formatCaliforniaTime(value) {
  const p = parseDbDateTime(value);

  if (!p) return "-";

  const hour = p.hour;

  const suffix = hour >= 12 ? "PM" : "AM";

  const hour12 = hour % 12 || 12;

  return `${hour12}:${String(p.minute).padStart(
    2,
    "0"
  )}:${String(p.second).padStart(2, "0")} ${suffix}`;
}

/* =========================================================
   DATETIME LOCAL VALUE
========================================================= */

function toDateTimeLocal(value) {
  const p = parseDbDateTime(value);

  if (!p) return "";

  return [
    String(p.year).padStart(4, "0"),
    "-",
    String(p.month).padStart(2, "0"),
    "-",
    String(p.day).padStart(2, "0"),
    "T",
    String(p.hour).padStart(2, "0"),
    ":",
    String(p.minute).padStart(2, "0"),
    ":",
    String(p.second).padStart(2, "0"),
  ].join("");
}

/* =========================================================
   DURATION
========================================================= */

function formatDuration(seconds) {
  if (
    seconds === null ||
    seconds === undefined ||
    Number.isNaN(Number(seconds))
  ) {
    return "-";
  }

  const total = Math.max(0, Number(seconds));

  const hours = Math.floor(total / 3600);

  const minutes = Math.floor(
    (total % 3600) / 60
  );

  const secs = total % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }

  return `${secs}s`;
}

/* =========================================================
   STATUS
========================================================= */

function getStatus(row) {
  const raw = String(
    row.attendance_status ||
      row.status ||
      ""
  )
    .trim()
    .toLowerCase();

  if (
    raw === "late" ||
    raw.includes("late")
  ) {
    return "Late";
  }

  if (
    raw === "on time" ||
    raw === "present" ||
    raw === "ontime"
  ) {
    return "Present";
  }

  return "Present";
}

/* =========================================================
   FORM DEFAULT
========================================================= */

function getDefaultForm() {
  const today = getCaliforniaDateInput();

  return {
    user_id: "",
    login_time: `${today}T08:00:00`,
    logout_time: "",
    ip_address: "",
    user_agent: "",
  };
}

/* =========================================================
   COMPONENT
========================================================= */

export default function AttendancePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
   const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [attendance, setAttendance] = useState([]);

  const [currentUser, setCurrentUser] =
    useState(null);

  const [staff, setStaff] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [fromDate, setFromDate] =
    useState(getCaliforniaMonthStart());

  const [toDate, setToDate] =
    useState(getCaliforniaDateInput());

  const [showModal, setShowModal] =
    useState(false);

  const [editingRecord, setEditingRecord] =
    useState(null);

  const [form, setForm] =
    useState(getDefaultForm());

  const [saving, setSaving] =
    useState(false);

  /* =======================================================
     ADMIN
  ======================================================= */

  const isAdmin =
    String(currentUser?.role || "")
      .toLowerCase() === "admin";

  /* =======================================================
     LOAD CURRENT USER
  ======================================================= */

  const loadCurrentUser = useCallback(
    async () => {
      try {
        const response = await fetch(
          "/api/auth/me",
          {
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data?.user) {
          window.location.href = "/login";
          return null;
        }

        setCurrentUser(data.user);

        return data.user;
      } catch (err) {
        console.error(err);

        window.location.href = "/login";

        return null;
      }
    },
    []
  );

  /* =======================================================
     LOAD STAFF
  ======================================================= */

  const loadStaff = useCallback(
    async () => {
      try {
        const response = await fetch(
          "/api/staffes/list",
          {
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!response.ok) return;

        const data = await response.json();

        const list =
          Array.isArray(data?.staffes)
            ? data.staffes
            : Array.isArray(data?.staff)
            ? data.staff
            : Array.isArray(data?.users)
            ? data.users
            : Array.isArray(data?.data)
            ? data.data
            : [];

        const normalized = list
          .map((item) => ({
            id: item.id,
            name:
              item.name ||
              item.full_name ||
              item.fullName ||
              "Unknown",
            email:
              item.email || "",
          }))
          .filter((item) => item.id);

        setStaff(normalized);
      } catch (err) {
        console.error(
          "STAFF LOAD ERROR:",
          err
        );
      }
    },
    []
  );

  /* =======================================================
     LOAD ATTENDANCE
  ======================================================= */

  const loadAttendance = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const params = new URLSearchParams();

        if (fromDate) {
          params.set("from", fromDate);
        }

        if (toDate) {
          params.set("to", toDate);
        }

        params.set("_", Date.now());

        const response = await fetch(
          `/api/login-history?${params.toString()}`,
          {
            credentials: "include",
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to load attendance"
          );
        }

        setAttendance(
          Array.isArray(data?.history)
            ? data.history
            : []
        );
      } catch (err) {
        console.error(err);

        setError(
          err?.message ||
            "Failed to load attendance"
        );

        setAttendance([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fromDate, toDate]
  );

  /* =======================================================
     INITIAL
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function init() {
      const user =
        await loadCurrentUser();

      if (!mounted || !user) return;

      await loadAttendance(true);

      if (
        String(user.role || "")
          .toLowerCase() === "admin"
      ) {
        await loadStaff();
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [
    loadCurrentUser,
    loadAttendance,
    loadStaff,
  ]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredAttendance = useMemo(() => {
    const term =
      search.trim().toLowerCase();

    return attendance.filter((row) => {
      const status = getStatus(row);

      const matchesSearch =
        !term ||
        String(row.name || "")
          .toLowerCase()
          .includes(term) ||
        String(row.email || "")
          .toLowerCase()
          .includes(term) ||
        String(row.team || "")
          .toLowerCase()
          .includes(term);

      const matchesStatus =
        statusFilter === "All" ||
        status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    attendance,
    search,
    statusFilter,
  ]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    let present = 0;
    let late = 0;
    let totalSeconds = 0;

    attendance.forEach((row) => {
      const status = getStatus(row);

      if (status === "Late") {
        late++;
      } else {
        present++;
      }

      if (
        row.duration_seconds !== null &&
        row.duration_seconds !== undefined
      ) {
        totalSeconds += Number(
          row.duration_seconds
        ) || 0;
      }
    });

    return {
      total: attendance.length,
      present,
      late,
      absent: 0,
      totalHours:
        Math.round(
          (totalSeconds / 3600) * 10
        ) / 10,
    };
  }, [attendance]);

  /* =======================================================
     OPEN ADD
  ======================================================= */

  function openAddModal() {
    setEditingRecord(null);

    setForm({
      ...getDefaultForm(),
      user_id:
        staff.length > 0
          ? String(staff[0].id)
          : "",
    });

    setError("");

    setSuccess("");

    setShowModal(true);
  }

  /* =======================================================
     OPEN EDIT
  ======================================================= */

 function openEditModal(row) {
  const employeeId = String(row.user_id || "");

  /*
   * Make sure the employee being edited
   * exists inside the select options.
   */
  if (employeeId) {
    setStaff((prev) => {
      const alreadyExists = prev.some(
        (employee) =>
          String(employee.id) === employeeId
      );

      if (alreadyExists) {
        return prev;
      }

      return [
        {
          id: row.user_id,
          name: row.name || "Current Employee",
          email: row.email || "",
        },
        ...prev,
      ];
    });
  }

  setEditingRecord(row);

  setForm({
    user_id: employeeId,

    login_time: toDateTimeLocal(
      row.login_time
    ),

    logout_time: row.logout_time
      ? toDateTimeLocal(row.logout_time)
      : "",

    ip_address:
      row.ip_address || "",

    user_agent:
      row.user_agent || "",
  });

  setError("");
  setSuccess("");

  setShowModal(true);
}

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  function closeModal() {
    if (saving) return;

    setShowModal(false);

    setEditingRecord(null);

    setForm(getDefaultForm());
  }

  /* =======================================================
     CHANGE FORM
  ======================================================= */

  function updateForm(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  /* =======================================================
     SAVE
  ======================================================= */

  async function handleSave(e) {
    e.preventDefault();

    if (!isAdmin) return;

    if (!form.user_id) {
      setError("Please select employee.");
      return;
    }

    if (!form.login_time) {
      setError("Please select login time.");
      return;
    }

    if (
      form.logout_time &&
      form.logout_time < form.login_time
    ) {
      setError(
        "Logout time cannot be before login time."
      );
      return;
    }

    try {
      setSaving(true);

      setError("");

      setSuccess("");

      const payload = {
        user_id: Number(form.user_id),

        login_time:
          form.login_time.replace(
            "T",
            " "
          ),

        logout_time:
          form.logout_time
            ? form.logout_time.replace(
                "T",
                " "
              )
            : null,

        ip_address:
          form.ip_address || null,

        user_agent:
          form.user_agent || null,
      };

      let response;

      if (editingRecord) {
        response = await fetch(
          "/api/login-history",
          {
            method: "PUT",

            credentials: "include",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              ...payload,
              id: Number(
                editingRecord.id
              ),
            }),
          }
        );
      } else {
        response = await fetch(
          "/api/login-history",
          {
            method: "POST",

            credentials: "include",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              payload
            ),
          }
        );
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to save attendance"
        );
      }

      setSuccess(
        editingRecord
          ? "Attendance updated successfully."
          : "Attendance added successfully."
      );

      setShowModal(false);

      setEditingRecord(null);

      await loadAttendance(false);
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Failed to save attendance"
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     PDF
  ======================================================= */

  async function exportPDF() {
    try {
      const jsPDFModule =
        await import("jspdf");

      const autoTableModule =
        await import(
          "jspdf-autotable"
        );

      const jsPDF =
        jsPDFModule.default;

      const autoTable =
        autoTableModule.default;

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      /*
        Screenshot-style header
      */

      const red = [210, 0, 0];

      doc.setFillColor(
        red[0],
        red[1],
        red[2]
      );

      doc.rect(
        8,
        8,
        281,
        8,
        "F"
      );

      doc.setTextColor(
        255,
        255,
        255
      );

      doc.setFontSize(9);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        "EMP ID",
        12,
        13.5
      );

      doc.text(
        "Employee Name",
        55,
        13.5
      );

      doc.text(
        "Payroll",
        105,
        13.5
      );

      doc.text(
        "Campaign",
        145,
        13.5
      );

      doc.text(
        "Agent WD",
        210,
        13.5
      );

      /*
        Employee/date attendance table
      */

      const rows = filteredAttendance;

      const uniqueDates = [
        ...new Set(
          rows.map((row) => {
            const parsed =
              parseDbDateTime(
                row.login_time
              );

            if (!parsed) return "";

            return `${parsed.year}-${String(
              parsed.month
            ).padStart(2, "0")}-${String(
              parsed.day
            ).padStart(2, "0")}`;
          })
        ),
      ]
        .filter(Boolean)
        .sort();

      /*
        Limit date columns so PDF stays clean.
      */

      const dates =
        uniqueDates.slice(0, 14);

      const firstEmployee =
        rows[0];

      const employeeId =
        firstEmployee?.user_id ||
        "-";

      const employeeName =
        firstEmployee?.name ||
        "-";

      const payroll =
        firstEmployee?.payroll ||
        "-";

      const campaign =
        firstEmployee?.campaign ||
        "-";

      const agentWD =
        firstEmployee?.agent_wd ||
        "-";

      const headerDates = dates.map(
        (date) => {
          const d = new Date(
            `${date}T00:00:00`
          );

          return d.toLocaleDateString(
            "en-US",
            {
              weekday: "short",
              month: "short",
              day: "numeric",
            }
          );
        }
      );

      const bodyRow = [
        employeeId,
        employeeName,
        payroll,
        campaign,
        agentWD,
        ...headerDates,
      ];

      autoTable(doc, {
        startY: 17,

        head: [
          [
            "EMP ID",
            "Employee Name",
            "Payroll",
            "Campaign",
            "Agent WD",
            ...headerDates,
          ],
        ],

        body: [
          bodyRow,
        ],

        theme: "grid",

        styles: {
          fontSize: 6.5,
          cellPadding: 1.5,
          halign: "center",
          valign: "middle",
          lineColor: [
            255,
            255,
            255,
          ],
          lineWidth: 0.25,
        },

        headStyles: {
          fillColor: red,
          textColor: [
            255,
            255,
            255,
          ],
          fontStyle: "bold",
          fontSize: 6.5,
        },
      });

      /*
        Attendance status rows
      */

      let startY =
        doc.lastAutoTable
          ?.finalY || 30;

      const statusRows = [
        "Attendance",
        "Login",
        "Logout",
        "Duration",
      ];

      const attendanceBody =
        statusRows.map(
          (type) => {
            const values = dates.map(
              (date) => {
                const record =
                  rows.find((row) => {
                    const parsed =
                      parseDbDateTime(
                        row.login_time
                      );

                    if (!parsed)
                      return false;

                    const rowDate =
                      `${parsed.year}-${String(
                        parsed.month
                      ).padStart(
                        2,
                        "0"
                      )}-${String(
                        parsed.day
                      ).padStart(
                        2,
                        "0"
                      )}`;

                    return (
                      rowDate ===
                        date &&
                      String(
                        row.user_id
                      ) ===
                        String(
                          employeeId
                        )
                    );
                  });

                if (!record) {
                  return "Off";
                }

                if (
                  type ===
                  "Attendance"
                ) {
                  return getStatus(
                    record
                  );
                }

                if (
                  type === "Login"
                ) {
                  return formatCaliforniaTime(
                    record.login_time
                  );
                }

                if (
                  type === "Logout"
                ) {
                  return formatCaliforniaTime(
                    record.logout_time
                  );
                }

                if (
                  type ===
                  "Duration"
                ) {
                  return formatDuration(
                    record.duration_seconds
                  );
                }

                return "";
              }
            );

            return [
              type,
              ...values,
            ];
          }
        );

      autoTable(doc, {
        startY,

        head: [
          [
            "Status",
            ...headerDates,
          ],
        ],

        body: attendanceBody,

        theme: "grid",

        styles: {
          fontSize: 6.5,
          cellPadding: 1.5,
          halign: "center",
          valign: "middle",
          lineColor: [
            255,
            255,
            255,
          ],
          lineWidth: 0.25,
        },

        headStyles: {
          fillColor: red,
          textColor: [
            255,
            255,
            255,
          ],
          fontStyle: "bold",
        },

        columnStyles: {
          0: {
            fontStyle: "bold",
          },
        },
      });

      /*
        Summary
      */

      startY =
        doc.lastAutoTable
          ?.finalY + 6 || 50;

      doc.setFillColor(
        red[0],
        red[1],
        red[2]
      );

      doc.rect(
        8,
        startY,
        281,
        7,
        "F"
      );

      doc.setTextColor(
        255,
        255,
        255
      );

      doc.setFontSize(7);

      doc.text(
        `Present: ${stats.present}`,
        15,
        startY + 4.8
      );

      doc.text(
        `Late: ${stats.late}`,
        70,
        startY + 4.8
      );

      doc.text(
        `Absent: ${stats.absent}`,
        115,
        startY + 4.8
      );

      doc.text(
        `Total Hours: ${stats.totalHours}`,
        175,
        startY + 4.8
      );

      doc.save(
        `attendance-${fromDate}-${toDate}.pdf`
      );
    } catch (error) {
      console.error(
        "PDF ERROR:",
        error
      );

      setError(
        "Unable to generate PDF. Please make sure jspdf and jspdf-autotable are installed."
      );
    }
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#741C29]/20 border-t-[#741C29] rounded-full animate-spin" />

          <p className="text-sm text-slate-500">
            Loading attendance...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen lg:pl-[270px]">
      <div className="p-4 sm:p-6 lg:p-8">

  <div
        className={`
          fixed inset-y-0 left-0 z-50
          w-[270px]
          transform
          bg-white
          shadow-xl
          transition-transform
          duration-300
          lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setShowLogoutModal={setShowLogoutModal}
        />
      </div>
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">

          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#741C29] flex items-center justify-center shadow-sm">
                <CalendarDays
                  className="w-5 h-5 text-white"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Attendance
                </h1>

                <p className="text-sm text-slate-500">
                  Employee attendance and login history
                </p>
              </div>

              {isAdmin && (
                <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#741C29]/10 text-[#741C29]">
                  Admin View
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">

            {/* REFRESH */}

            <button
              type="button"
              onClick={() =>
                loadAttendance(false)
              }
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-60"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>

            {/* PDF */}

            <button
              type="button"
              onClick={exportPDF}
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <Download className="w-4 h-4" />

              Export PDF
            </button>

            {/* ADMIN ADD */}

            {isAdmin && (
              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#741C29] text-white text-sm font-semibold shadow-sm hover:bg-[#611621] transition"
              >
                <Plus className="w-4 h-4" />

                Add Attendance
              </button>
            )}
          </div>
        </div>

        {/* =================================================
            ALERTS
        ================================================= */}

        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />

            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="ml-auto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <UserCheck className="w-5 h-5" />

            <span>{success}</span>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
              className="ml-auto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">

          <StatCard
            icon={Users}
            title="Total Records"
            value={stats.total}
            subtitle="Attendance records"
          />

          <StatCard
            icon={UserCheck}
            title="Present"
            value={stats.present}
            subtitle="On time attendance"
          />

          <StatCard
            icon={AlertCircle}
            title="Late"
            value={stats.late}
            subtitle="Late arrivals"
          />

          <StatCard
            icon={Clock3}
            title="Total Hours"
            value={stats.totalHours}
            subtitle="Logged working hours"
          />

          <StatCard
            icon={FileText}
            title="Absent"
            value={stats.absent}
            subtitle="No attendance record"
          />
        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 mb-5">

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">

            {/* SEARCH */}

            <div className="xl:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search employee, email or team..."
                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none focus:bg-white focus:border-[#741C29] focus:ring-4 focus:ring-[#741C29]/10"
              />
            </div>

            {/* FROM */}

            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

              <input
                type="date"
                value={fromDate}
                onChange={(e) =>
                  setFromDate(
                    e.target.value
                  )
                }
                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none focus:bg-white focus:border-[#741C29] focus:ring-4 focus:ring-[#741C29]/10"
              />
            </div>

            {/* TO */}

            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

              <input
                type="date"
                value={toDate}
                onChange={(e) =>
                  setToDate(
                    e.target.value
                  )
                }
                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none focus:bg-white focus:border-[#741C29] focus:ring-4 focus:ring-[#741C29]/10"
              />
            </div>

            {/* STATUS */}

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="appearance-none w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm text-slate-700 outline-none focus:bg-white focus:border-[#741C29] focus:ring-4 focus:ring-[#741C29]/10"
              >
                <option value="All">
                  All Status
                </option>

                <option value="Present">
                  Present
                </option>

                <option value="Late">
                  Late
                </option>
              </select>

              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">

              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">

                  {isAdmin && (
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Staff
                    </th>
                  )}

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Date
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Login
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Logout
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Duration
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  {isAdmin && (
                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  )}

                  {!isAdmin && (
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Email
                    </th>
                  )}

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredAttendance.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={
                        isAdmin
                          ? 7
                          : 6
                      }
                      className="px-5 py-14 text-center"
                    >
                      <div className="flex flex-col items-center">
                        <FileText className="w-10 h-10 text-slate-300 mb-3" />

                        <p className="font-semibold text-slate-700">
                          No attendance found
                        </p>

                        <p className="text-sm text-slate-400 mt-1">
                          Try changing the filters or date range.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map(
                    (row) => {
                      const status =
                        getStatus(row);

                      return (
                        <tr
                          key={row.id}
                          className="hover:bg-slate-50/70 transition"
                        >

                          {isAdmin && (
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">

                                <div className="w-9 h-9 rounded-full bg-[#741C29]/10 text-[#741C29] flex items-center justify-center font-bold text-xs">
                                  {String(
                                    row.name ||
                                      "U"
                                  )
                                    .slice(
                                      0,
                                      1
                                    )
                                    .toUpperCase()}
                                </div>

                                <div>
                                  <div className="font-semibold text-sm text-slate-800">
                                    {row.name ||
                                      "-"}
                                  </div>

                                  <div className="text-xs text-slate-400">
                                    {row.team ||
                                      "Staff"}
                                  </div>
                                </div>

                              </div>
                            </td>
                          )}

                          <td className="px-5 py-4 text-sm text-slate-700 whitespace-nowrap">
                            {formatCaliforniaDate(
                              row.login_time
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm font-medium text-slate-700 whitespace-nowrap">
                            {formatCaliforniaTime(
                              row.login_time
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm font-medium text-slate-700 whitespace-nowrap">
                            {formatCaliforniaTime(
                              row.logout_time
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">
                            {formatDuration(
                              row.duration_seconds
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {status ===
                            "Late" ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                                Late
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                Present
                              </span>
                            )}
                          </td>

                          {isAdmin && (
                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(
                                    row
                                  )
                                }
                                className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:border-[#741C29] hover:text-[#741C29] transition"
                              >
                                <Pencil className="w-3.5 h-3.5" />

                                Edit
                              </button>
                            </td>
                          )}

                          {!isAdmin && (
                            <td className="px-5 py-4 text-sm text-slate-500">
                              {row.email ||
                                "-"}
                            </td>
                          )}

                        </tr>
                      );
                    }
                  )
                )}

              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredAttendance.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {attendance.length}
            </span>{" "}
            attendance records
          </div>
        </div>
      </div>

      {/* ===================================================
          ADMIN ADD / EDIT MODAL
      =================================================== */}

      {showModal && isAdmin && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">

          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
            onClick={closeModal}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-[#741C29]/10 flex items-center justify-center">
                  {editingRecord ? (
                    <Pencil className="w-5 h-5 text-[#741C29]" />
                  ) : (
                    <Plus className="w-5 h-5 text-[#741C29]" />
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingRecord
                      ? "Edit Attendance"
                      : "Add Attendance"}
                  </h2>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Time is saved using California timezone
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSave}
              className="p-6"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* EMPLOYEE */}
<div className="md:col-span-2">
  <label className="block text-sm font-semibold text-slate-700 mb-2">
    Employee
  </label>

  <div className="relative">
    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

    <select
      value={form.user_id}
      onChange={(e) =>
        updateForm(
          "user_id",
          e.target.value
        )
      }
      required
      className="appearance-none w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-700 outline-none focus:bg-white focus:border-[#741C29] focus:ring-4 focus:ring-[#741C29]/10"
    >
      <option value="">
        Select employee
      </option>

      {staff.map((employee) => (
        <option
          key={employee.id}
          value={employee.id}
        >
          {employee.name}
          {employee.email
            ? ` — ${employee.email}`
            : ""}
        </option>
      ))}
    </select>

    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
  </div>
</div>

                {/* LOGIN */}

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Login Time
                  </label>

                  <input
                    type="datetime-local"
                    step="1"
                    value={
                      form.login_time
                    }
                    onChange={(e) =>
                      updateForm(
                        "login_time",
                        e.target.value
                      )
                    }
                    required
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:bg-white focus:border-[#741C29] focus:ring-4 focus:ring-[#741C29]/10"
                  />

                </div>

                {/* LOGOUT */}

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Logout Time
                  </label>

                  <input
                    type="datetime-local"
                    step="1"
                    value={
                      form.logout_time
                    }
                    onChange={(e) =>
                      updateForm(
                        "logout_time",
                        e.target.value
                      )
                    }
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:bg-white focus:border-[#741C29] focus:ring-4 focus:ring-[#741C29]/10"
                  />

                  <p className="text-xs text-slate-400 mt-1.5">
                    Leave empty if employee is still logged in.
                  </p>

                </div>

                {/* IP */}

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    IP Address
                  </label>

                  <input
                    type="text"
                    value={
                      form.ip_address
                    }
                    onChange={(e) =>
                      updateForm(
                        "ip_address",
                        e.target.value
                      )
                    }
                    placeholder="Optional"
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:bg-white focus:border-[#741C29] focus:ring-4 focus:ring-[#741C29]/10"
                  />

                </div>

                {/* USER AGENT */}

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    User Agent
                  </label>

                  <input
                    type="text"
                    value={
                      form.user_agent
                    }
                    onChange={(e) =>
                      updateForm(
                        "user_agent",
                        e.target.value
                      )
                    }
                    placeholder="Optional"
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:bg-white focus:border-[#741C29] focus:ring-4 focus:ring-[#741C29]/10"
                  />

                </div>

              </div>

              {/* ERROR */}

              {error && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />

                  <span>{error}</span>
                </div>
              )}

              {/* FOOTER */}

              <div className="flex items-center justify-end gap-3 mt-7 pt-5 border-t border-slate-100">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="h-11 px-5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 px-5 rounded-xl bg-[#741C29] text-white text-sm font-semibold hover:bg-[#611621] transition disabled:opacity-60 inline-flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />

                      {editingRecord
                        ? "Update Attendance"
                        : "Add Attendance"}
                    </>
                  )}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="text-2xl font-bold text-slate-900 mt-1">
            {value}
          </p>

          <p className="text-xs text-slate-400 mt-1">
            {subtitle}
          </p>
        </div>

        <div className="w-10 h-10 rounded-xl bg-[#741C29]/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#741C29]" />
        </div>

      </div>
    </div>
  );
}