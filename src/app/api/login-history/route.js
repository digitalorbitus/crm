import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "../../lib/db";

export const runtime = "nodejs";

const CALIFORNIA_TIMEZONE = "America/Los_Angeles";
const ATTENDANCE_CUTOFF = "08:15:00";

/* =========================================================
   AUTH
========================================================= */

async function getCurrentUser() {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded?.id ?? decoded?._id ?? decoded?.userId;
    if (!userId) return null;

    const [rows] = await db.query(
      `
      SELECT id, name, email, phone, role, team, status
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [userId]
    );

    if (!rows || !rows.length) return null;

    return rows[0];
  } catch (error) {
    console.error("AUTH ERROR:", error);
    return null;
  }
}

function isAdmin(user) {
  return String(user?.role || "").trim().toLowerCase() === "admin";
}

/* =========================================================
   DATE HELPERS
========================================================= */

function isValidDate(value) {
  const input = String(value || "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return false;

  const [year, month, day] = input.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function getCaliforniaToday() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CALIFORNIA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = {};

  for (const part of parts) {
    if (part.type !== "literal") values[part.type] = part.value;
  }

  return `${values.year}-${values.month}-${values.day}`;
}

function shiftDate(dateString, days) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getNextDate(dateString) {
  return shiftDate(dateString, 1);
}

function getPreviousDate(dateString) {
  return shiftDate(dateString, -1);
}

function getDayInfo(dateString) {
  const date = new Date(`${dateString}T00:00:00Z`);
  const dayNumber = date.getUTCDay();

  const names = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return {
    dayNumber,
    dayName: names[dayNumber],
    isWeekend: dayNumber === 0 || dayNumber === 6,
  };
}

/* =========================================================
   DATETIME HELPERS
========================================================= */

function normalizeLocalDateTime(value) {
  if (!value) return null;

  const input = String(value).trim().replace("T", " ");

  const match = input.match(
    /^(\d{4})-(\d{2})-(\d{2})[ ](\d{2}):(\d{2})(?::(\d{2}))?$/
  );

  if (!match) return null;

  const [, year, month, day, hour, minute, second = "00"] = match;

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function isValidDateTime(value) {
  return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(String(value || ""));
}

function timeToSeconds(time) {
  const match = String(time || "").match(/^(\d{2}):(\d{2}):(\d{2})$/);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = Number(match[3]);

  if (hour > 23 || minute > 59 || second > 59) return null;

  return hour * 3600 + minute * 60 + second;
}

function getAttendanceStatus(loginTime) {
  if (!loginTime) return "Absent";

  const normalized = normalizeLocalDateTime(loginTime);
  if (!normalized) return "Absent";

  const loginSeconds = timeToSeconds(normalized.slice(11, 19));
  const cutoffSeconds = timeToSeconds(ATTENDANCE_CUTOFF);

  if (loginSeconds === null || cutoffSeconds === null) return "Absent";

  return loginSeconds <= cutoffSeconds ? "On Time" : "Late";
}

function getDurationSeconds(loginTime, logoutTime) {
  if (!loginTime || !logoutTime) return null;

  const login = normalizeLocalDateTime(loginTime);
  const logout = normalizeLocalDateTime(logoutTime);

  if (!login || !logout) return null;

  const startDay = new Date(`${login.slice(0, 10)}T00:00:00Z`);
  const endDay = new Date(`${logout.slice(0, 10)}T00:00:00Z`);

  const startTime = timeToSeconds(login.slice(11, 19));
  const endTime = timeToSeconds(logout.slice(11, 19));

  if (
    Number.isNaN(startDay.getTime()) ||
    Number.isNaN(endDay.getTime()) ||
    startTime === null ||
    endTime === null
  ) {
    return null;
  }

  const startSeconds = Math.floor(startDay.getTime() / 1000) + startTime;
  const endSeconds = Math.floor(endDay.getTime() / 1000) + endTime;

  return Math.max(0, endSeconds - startSeconds);
}

/* =========================================================
   GET - ATTENDANCE

   ADMIN:   all users / specific user / team / absent included
   NORMAL:  own user only
   WEEKEND: OFF, never Absent

   Every employee row also carries:
   - basic_salary
   - attendance_allowance
========================================================= */

export async function GET(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const admin = isAdmin(user);

    const { searchParams } = new URL(request.url);

    let from = searchParams.get("from");
    let to = searchParams.get("to");

    const requestedUserId = searchParams.get("user_id");
    const requestedTeam = searchParams.get("team");

    /* ---------- default date ---------- */

    if (!from && !to) {
      from = getCaliforniaToday();
      to = from;
    }

    if (!from) from = to;
    if (!to) to = from;

    /* ---------- date validation ---------- */

    if (!isValidDate(from) || !isValidDate(to)) {
      return NextResponse.json(
        { success: false, message: "Invalid date. Use YYYY-MM-DD." },
        { status: 400 }
      );
    }

    if (from > to) {
      return NextResponse.json(
        {
          success: false,
          message: "From date cannot be greater than to date.",
        },
        { status: 400 }
      );
    }

    /* ---------- user filter ---------- */

    let selectedUserId = null;

    if (admin) {
      if (
        requestedUserId &&
        requestedUserId !== "all" &&
        requestedUserId !== "All Users"
      ) {
        const parsed = Number(requestedUserId);

        if (!Number.isInteger(parsed) || parsed <= 0) {
          return NextResponse.json(
            { success: false, message: "Invalid user_id." },
            { status: 400 }
          );
        }

        selectedUserId = parsed;
      }
    } else {
      selectedUserId = Number(user.id);
    }

    /* ---------- team filter ---------- */

    let selectedTeam = null;

    if (admin) {
      const teamValue = String(requestedTeam || "").trim();

      if (
        teamValue &&
        teamValue.toLowerCase() !== "all" &&
        teamValue.toLowerCase() !== "all teams"
      ) {
        selectedTeam = teamValue;
      }
    }

    /* ---------- employees (with salary) ---------- */

    let employeeSql = `
      SELECT
        id,
        name,
        email,
        phone,
        role,
        team,
        status,
        basic_salary,
        attendance_allowance
      FROM users
      WHERE (
        status IS NULL
        OR LOWER(TRIM(status)) <> 'deleted'
      )
    `;

    const employeeParams = [];

    if (selectedUserId) {
      employeeSql += ` AND id = ? `;
      employeeParams.push(selectedUserId);
    }

    if (selectedTeam) {
      employeeSql += `
        AND LOWER(TRIM(COALESCE(team, ''))) = LOWER(TRIM(?))
      `;
      employeeParams.push(selectedTeam);
    }

    employeeSql += ` ORDER BY id ASC `;

    const [employeesRows] = await db.query(employeeSql, employeeParams);

    const employees = employeesRows || [];

    if (admin && selectedUserId && !employees.length) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected user not found or does not belong to selected team.",
        },
        { status: 404 }
      );
    }

    /* ---------- no employees ---------- */

    if (!employees.length) {
      return NextResponse.json({
        success: true,
        from,
        to,
        timezone: CALIFORNIA_TIMEZONE,
        cutoff: ATTENDANCE_CUTOFF,

        current_user: {
          id: Number(user.id),
          name: user.name || "",
          role: user.role || "",
        },

        admin_view: admin,
        selected_user_id: selectedUserId,
        selected_team: selectedTeam,
        selected_user: null,

        attendance_users: [],

        weekends_off: true,
        off_days: [],

        counts: {
          total: 0,
          present: 0,
          on_time: 0,
          late: 0,
          absent: 0,
          off: 0,
        },

        date_counts: {},
        history: [],
      });
    }

    const selectedEmployee = selectedUserId
      ? employees.find((e) => Number(e.id) === Number(selectedUserId))
      : null;

    const employeeIds = employees
      .map((e) => Number(e.id))
      .filter((id) => Number.isInteger(id) && id > 0);

    const placeholders = employeeIds.map(() => "?").join(",");

    /* ---------- query range (1 day before / after) ---------- */

    const queryFrom = getPreviousDate(from);
    const queryTo = getNextDate(to);

    /* ---------- login history ---------- */

    const [loginRows] = await db.query(
      `
      SELECT
        lh.id,
        lh.user_id,

        DATE_FORMAT(lh.login_time, '%Y-%m-%d %H:%i:%s') AS login_time,

        CASE
          WHEN lh.logout_time IS NULL THEN NULL
          ELSE DATE_FORMAT(lh.logout_time, '%Y-%m-%d %H:%i:%s')
        END AS logout_time,

        lh.ip_address,
        lh.user_agent

      FROM login_history lh

      WHERE
        lh.user_id IN (${placeholders})
        AND lh.login_time >= ?
        AND lh.login_time < ?

      ORDER BY
        lh.user_id ASC,
        lh.login_time ASC,
        lh.id ASC
      `,
      [...employeeIds, `${queryFrom} 00:00:00`, `${queryTo} 00:00:00`]
    );

    /* ---------- attendance users ---------- */

    const attendanceUserIds = new Set();

    for (const row of loginRows || []) {
      const userId = Number(row.user_id);
      const loginTime = normalizeLocalDateTime(row.login_time);

      if (Number.isInteger(userId) && userId > 0 && loginTime) {
        const date = loginTime.slice(0, 10);

        if (date >= from && date <= to) {
          attendanceUserIds.add(userId);
        }
      }
    }

    const attendance_users = employees.map((employee) => ({
      id: Number(employee.id),
      name: employee.name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      role: employee.role || "",
      team: employee.team || "",
      status: employee.status || "",

      basic_salary: Number(employee.basic_salary || 0),
      attendance_allowance: Number(employee.attendance_allowance || 0),

      has_attendance: attendanceUserIds.has(Number(employee.id)),
    }));

    /* ---------- group login records (first login / last logout) ---------- */

    const attendanceMap = new Map();

    for (const row of loginRows || []) {
      const loginTime = normalizeLocalDateTime(row.login_time);
      if (!loginTime) continue;

      const attendanceDate = loginTime.slice(0, 10);

      if (attendanceDate < from || attendanceDate > to) continue;

      const dayInfo = getDayInfo(attendanceDate);

      /* weekends are OFF */
      if (dayInfo.isWeekend) continue;

      const logoutTime = row.logout_time
        ? normalizeLocalDateTime(row.logout_time)
        : null;

      const userId = Number(row.user_id);
      const key = `${userId}_${attendanceDate}`;

      if (!attendanceMap.has(key)) {
        attendanceMap.set(key, {
          id: Number(row.id),
          user_id: userId,
          login_time: loginTime,
          logout_time: logoutTime,
          ip_address: row.ip_address || null,
          user_agent: row.user_agent || null,
        });

        continue;
      }

      const existing = attendanceMap.get(key);

      /* earliest login */
      if (loginTime < existing.login_time) {
        existing.login_time = loginTime;
        existing.id = Number(row.id);
        existing.ip_address = row.ip_address || null;
        existing.user_agent = row.user_agent || null;
      }

      /* latest logout */
      if (
        logoutTime &&
        (!existing.logout_time || logoutTime > existing.logout_time)
      ) {
        existing.logout_time = logoutTime;
      }
    }

    /* ---------- build history ---------- */

    const history = [];
    const offDays = [];

    let currentDate = from;

    while (currentDate <= to) {
      const dayInfo = getDayInfo(currentDate);

      /* weekend = OFF */
      if (dayInfo.isWeekend) {
        offDays.push({
          date: currentDate,
          day: dayInfo.dayName,
          status: "OFF",
        });

        currentDate = getNextDate(currentDate);
        continue;
      }

      /* weekday: every user gets a row, even if absent */
      for (const employee of employees) {
        const employeeId = Number(employee.id);
        const key = `${employeeId}_${currentDate}`;
        const record = attendanceMap.get(key);

        const base = {
          user_id: employeeId,
          name: employee.name || "",
          email: employee.email || "",
          phone: employee.phone || "",
          role: employee.role || "",
          team: employee.team || "",

          basic_salary: Number(employee.basic_salary || 0),
          attendance_allowance: Number(employee.attendance_allowance || 0),

          attendance_date: currentDate,
          day_name: dayInfo.dayName,
        };

        /* ABSENT: id = null because no DB record exists */
        if (!record) {
          history.push({
            ...base,
            id: null,
            login_time: null,
            logout_time: null,
            ip_address: null,
            user_agent: null,
            duration_seconds: null,
            attendance_status: "Absent",
          });

          continue;
        }

        /* PRESENT */
        history.push({
          ...base,
          id: record.id,
          login_time: record.login_time,
          logout_time: record.logout_time,
          ip_address: record.ip_address,
          user_agent: record.user_agent,
          duration_seconds: getDurationSeconds(
            record.login_time,
            record.logout_time
          ),
          attendance_status: getAttendanceStatus(record.login_time),
        });
      }

      currentDate = getNextDate(currentDate);
    }

    /* ---------- sort: date DESC, user id ASC ---------- */

    history.sort((a, b) => {
      if (a.attendance_date !== b.attendance_date) {
        return a.attendance_date < b.attendance_date ? 1 : -1;
      }

      return Number(a.user_id) - Number(b.user_id);
    });

    /* ---------- counts ---------- */

    const counts = {
      total: history.length,
      present: 0,
      on_time: 0,
      late: 0,
      absent: 0,
      off: offDays.length,
    };

    const dateCounts = {};

    for (const row of history) {
      if (!dateCounts[row.attendance_date]) {
        dateCounts[row.attendance_date] = {
          date: row.attendance_date,
          day: row.day_name,
          total: 0,
          present: 0,
          on_time: 0,
          late: 0,
          absent: 0,
          off: false,
        };
      }

      const current = dateCounts[row.attendance_date];

      current.total++;

      if (row.attendance_status === "On Time") {
        counts.present++;
        counts.on_time++;
        current.present++;
        current.on_time++;
      } else if (row.attendance_status === "Late") {
        counts.present++;
        counts.late++;
        current.present++;
        current.late++;
      } else if (row.attendance_status === "Absent") {
        counts.absent++;
        current.absent++;
      }
    }

    for (const offDay of offDays) {
      dateCounts[offDay.date] = {
        date: offDay.date,
        day: offDay.day,
        total: 0,
        present: 0,
        on_time: 0,
        late: 0,
        absent: 0,
        off: true,
      };
    }

    /* ---------- response ---------- */

    return NextResponse.json({
      success: true,

      from,
      to,

      timezone: CALIFORNIA_TIMEZONE,
      cutoff: ATTENDANCE_CUTOFF,

      current_user: {
        id: Number(user.id),
        name: user.name || "",
        role: user.role || "",
      },

      admin_view: admin,

      selected_user_id: selectedUserId,
      selected_team: selectedTeam,

      selected_user: selectedEmployee
        ? {
            id: Number(selectedEmployee.id),
            name: selectedEmployee.name || "",
            email: selectedEmployee.email || "",
            phone: selectedEmployee.phone || "",
            role: selectedEmployee.role || "",
            team: selectedEmployee.team || "",
            status: selectedEmployee.status || "",
            basic_salary: Number(selectedEmployee.basic_salary || 0),
            attendance_allowance: Number(
              selectedEmployee.attendance_allowance || 0
            ),
          }
        : null,

      attendance_users,

      weekends_off: true,
      off_days: offDays,

      counts,
      date_counts: dateCounts,

      history,
    });
  } catch (error) {
    console.error("LOGIN HISTORY GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to load attendance",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   SHARED: validate times + employee for POST / PUT
========================================================= */

async function findActiveEmployee(employeeId) {
  const [rows] = await db.query(
    `
    SELECT id, name, status
    FROM users
    WHERE id = ?
    AND (
      status IS NULL
      OR LOWER(TRIM(status)) <> 'deleted'
    )
    LIMIT 1
    `,
    [employeeId]
  );

  return rows && rows.length ? rows[0] : null;
}

function badRequest(message, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

/* =========================================================
   POST - ADMIN ADD ATTENDANCE
========================================================= */

export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) return badRequest("Unauthorized", 401);

    if (!isAdmin(user)) {
      return badRequest("Only admin can add attendance", 403);
    }

    const body = await request.json();

    const { user_id, login_time, logout_time, ip_address, user_agent } = body;

    const employeeId = Number(user_id);

    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      return badRequest("Valid employee is required");
    }

    const californiaLoginTime = normalizeLocalDateTime(login_time);

    const californiaLogoutTime = logout_time
      ? normalizeLocalDateTime(logout_time)
      : null;

    if (!californiaLoginTime || !isValidDateTime(californiaLoginTime)) {
      return badRequest("Invalid login time");
    }

    if (californiaLogoutTime && !isValidDateTime(californiaLogoutTime)) {
      return badRequest("Invalid logout time");
    }

    if (californiaLogoutTime && californiaLogoutTime < californiaLoginTime) {
      return badRequest("Logout time cannot be before login time");
    }

    const employee = await findActiveEmployee(employeeId);

    if (!employee) return badRequest("Employee not found", 404);

    const [result] = await db.query(
      `
      INSERT INTO login_history
      (user_id, login_time, logout_time, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        employeeId,
        californiaLoginTime,
        californiaLogoutTime,
        ip_address || null,
        user_agent || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Attendance added successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("LOGIN HISTORY POST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to add attendance",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   PUT - ADMIN EDIT / CONVERT ABSENT TO PRESENT

   CASE 1: existing id  -> UPDATE
   CASE 2: id = null    -> Absent row -> INSERT (or update same-day record)
========================================================= */

export async function PUT(request) {
  try {
    const user = await getCurrentUser();

    if (!user) return badRequest("Unauthorized", 401);

    if (!isAdmin(user)) {
      return badRequest("Only admin can edit attendance", 403);
    }

    const body = await request.json();

    const {
      id,
      user_id,
      attendance_date,
      login_time,
      logout_time,
      ip_address,
      user_agent,
    } = body;

    const employeeId = Number(user_id);

    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      return badRequest("Valid employee is required");
    }

    const californiaLoginTime = normalizeLocalDateTime(login_time);

    const californiaLogoutTime = logout_time
      ? normalizeLocalDateTime(logout_time)
      : null;

    if (!californiaLoginTime || !isValidDateTime(californiaLoginTime)) {
      return badRequest("Valid login time is required");
    }

    if (californiaLogoutTime && !isValidDateTime(californiaLogoutTime)) {
      return badRequest("Invalid logout time");
    }

    if (californiaLogoutTime && californiaLogoutTime < californiaLoginTime) {
      return badRequest("Logout time cannot be before login time");
    }

    const employee = await findActiveEmployee(employeeId);

    if (!employee) return badRequest("Employee not found", 404);

    /* ---------- CASE 1: existing attendance -> UPDATE ---------- */

    const attendanceId = Number(id);

    if (Number.isInteger(attendanceId) && attendanceId > 0) {
      const [existingRows] = await db.query(
        `
        SELECT id, user_id, login_time
        FROM login_history
        WHERE id = ?
        LIMIT 1
        `,
        [attendanceId]
      );

      if (!existingRows || !existingRows.length) {
        return badRequest("Attendance record not found", 404);
      }

      await db.query(
        `
        UPDATE login_history
        SET
          user_id = ?,
          login_time = ?,
          logout_time = ?,
          ip_address = ?,
          user_agent = ?
        WHERE id = ?
        `,
        [
          employeeId,
          californiaLoginTime,
          californiaLogoutTime,
          ip_address || null,
          user_agent || null,
          attendanceId,
        ]
      );

      return NextResponse.json({
        success: true,
        action: "updated",
        message: "Attendance updated successfully",
        id: attendanceId,
      });
    }

    /* ---------- CASE 2: absent row -> CREATE ---------- */

    if (!attendance_date || !isValidDate(attendance_date)) {
      return badRequest(
        "Valid attendance_date is required when editing an Absent record"
      );
    }

    if (getDayInfo(attendance_date).isWeekend) {
      return badRequest(
        "Saturday and Sunday are OFF days. Attendance cannot be added."
      );
    }

    if (californiaLoginTime.slice(0, 10) !== attendance_date) {
      return badRequest("Login date must match attendance date.");
    }

    const nextDate = getNextDate(attendance_date);

    const [existingDateRows] = await db.query(
      `
      SELECT id
      FROM login_history
      WHERE
        user_id = ?
        AND login_time >= ?
        AND login_time < ?
      ORDER BY login_time ASC, id ASC
      LIMIT 1
      `,
      [employeeId, `${attendance_date} 00:00:00`, `${nextDate} 00:00:00`]
    );

    /* record already exists for that day -> update, never duplicate */

    if (existingDateRows && existingDateRows.length) {
      const existingId = Number(existingDateRows[0].id);

      await db.query(
        `
        UPDATE login_history
        SET
          login_time = ?,
          logout_time = ?,
          ip_address = ?,
          user_agent = ?
        WHERE id = ?
        `,
        [
          californiaLoginTime,
          californiaLogoutTime,
          ip_address || null,
          user_agent || null,
          existingId,
        ]
      );

      return NextResponse.json({
        success: true,
        action: "updated_absent_existing",
        message: "Absent attendance updated successfully",
        id: existingId,
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO login_history
      (user_id, login_time, logout_time, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        employeeId,
        californiaLoginTime,
        californiaLogoutTime,
        ip_address || null,
        user_agent || null,
      ]
    );

    return NextResponse.json({
      success: true,
      action: "created_from_absent",
      message: "Absent attendance added successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("LOGIN HISTORY PUT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to update attendance",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   DELETE - ADMIN ONLY
========================================================= */

export async function DELETE(request) {
  try {
    const user = await getCurrentUser();

    if (!user) return badRequest("Unauthorized", 401);

    if (!isAdmin(user)) {
      return badRequest("Only admin can delete attendance", 403);
    }

    const { searchParams } = new URL(request.url);

    const attendanceId = Number(searchParams.get("id"));

    if (!Number.isInteger(attendanceId) || attendanceId <= 0) {
      return badRequest("Valid attendance ID is required");
    }

    const [beforeDelete] = await db.query(
      `
      SELECT id, user_id, login_time
      FROM login_history
      WHERE id = ?
      LIMIT 1
      `,
      [attendanceId]
    );

    if (!beforeDelete || !beforeDelete.length) {
      return badRequest("Attendance record not found", 404);
    }

    const [result] = await db.query(
      `
      DELETE FROM login_history
      WHERE id = ?
      LIMIT 1
      `,
      [attendanceId]
    );

    if (result.affectedRows !== 1) {
      return badRequest("Attendance was not deleted", 500);
    }

    const [afterDelete] = await db.query(
      `
      SELECT id
      FROM login_history
      WHERE id = ?
      LIMIT 1
      `,
      [attendanceId]
    );

    if (afterDelete && afterDelete.length) {
      return badRequest("Delete verification failed", 500);
    }

    return NextResponse.json({
      success: true,
      message: "Attendance deleted permanently",
      deletedId: attendanceId,
    });
  } catch (error) {
    console.error("LOGIN HISTORY DELETE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to delete attendance",
      },
      { status: 500 }
    );
  }
}
