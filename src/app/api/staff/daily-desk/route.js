import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =====================================================
// CONFIG
// =====================================================

const CALIFORNIA_TIMEZONE = "America/Los_Angeles";
const DAILY_TASK_LIMIT = 500;

// =====================================================
// GET CALIFORNIA DATE/TIME PARTS
// =====================================================

function getCaliforniaParts() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CALIFORNIA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const values = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }

  return values;
}

// =====================================================
// OPERATIONAL DATE
//
// California:
// 08:00 AM -> new operational day
// Before 08:00 AM -> previous operational day
//
// Example:
//
// Oct 8 07:59 AM -> Oct 7
// Oct 8 08:00 AM -> Oct 8
// Oct 9 07:59 AM -> Oct 8
// Oct 9 08:00 AM -> Oct 9
// =====================================================

function getOperationalDate() {
  const values = getCaliforniaParts();

  let year = Number(values.year);
  let month = Number(values.month);
  let day = Number(values.day);

  const hour = Number(values.hour);

  if (hour < 8) {
    const previousDay = new Date(
      Date.UTC(year, month - 1, day)
    );

    previousDay.setUTCDate(
      previousDay.getUTCDate() - 1
    );

    year = previousDay.getUTCFullYear();
    month = previousDay.getUTCMonth() + 1;
    day = previousDay.getUTCDate();
  }

  return `${year}-${String(month).padStart(
    2,
    "0"
  )}-${String(day).padStart(2, "0")}`;
}

// =====================================================
// CALIFORNIA CURRENT DATE
// =====================================================

function getCaliforniaDate() {
  const values = getCaliforniaParts();

  return `${values.year}-${values.month}-${values.day}`;
}

// =====================================================
// CALIFORNIA CURRENT DATE/TIME
// =====================================================

function getCaliforniaDateTime() {
  const values = getCaliforniaParts();

  return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}:${values.second}`;
}

// =====================================================
// DATE VALIDATION
// =====================================================

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

// =====================================================
// GET
// =====================================================

export async function GET(request) {
  try {
    // ===================================================
    // LOGIN TOKEN
    // ===================================================

    const token =
      request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Login token nahi mila",
        },
        { status: 401 }
      );
    }

    // ===================================================
    // VERIFY JWT
    // ===================================================

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (jwtError) {
      console.error(
        "DAILY DESK JWT ERROR:",
        jwtError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid ya expired login token",
        },
        { status: 401 }
      );
    }

    // ===================================================
    // STAFF ID
    // ===================================================

    const staffId =
      decoded.id ||
      decoded._id ||
      decoded.userId;

    if (!staffId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Staff ID token mein nahi mili",
        },
        { status: 401 }
      );
    }

    // ===================================================
    // URL
    // ===================================================

    const { searchParams } =
      new URL(request.url);

    const requestedDate =
      searchParams.get("date");

    // ===================================================
    // CURRENT CALIFORNIA DATA
    // ===================================================

    const californiaDate =
      getCaliforniaDate();

    const californiaDateTime =
      getCaliforniaDateTime();

    const operationalDate =
      getOperationalDate();

    // ===================================================
    // DATE MODE
    //
    // NO DATE:
    // Active Daily Desk
    //
    // WITH DATE:
    // Historical date
    // ===================================================

    let rows;

    // ===================================================
    // ACTIVE DAILY DESK
    //
    // IMPORTANT:
    //
    // Pending / In Progress:
    // Keep showing even after 8 AM next day.
    //
    // Completed:
    // Do NOT show in active Daily Desk.
    // ===================================================

    if (!requestedDate) {
      const [activeRows] =
        await pool.query(
          `
          SELECT
            dda.id AS assignment_id,

            ddt.task_id,
            ddt.phone,
            ddt.source_file,

            dda.staff_id,
            dda.assigned_date,
            dda.assigned_at,
            dda.completed_at,
            dda.status

          FROM daily_desk_assignments dda

          INNER JOIN daily_desk_tasks ddt
            ON dda.task_id = ddt.id

          WHERE dda.staff_id = ?

            AND LOWER(
              TRIM(
                COALESCE(
                  dda.status,
                  'pending'
                )
              )
            ) <> 'completed'

          ORDER BY
            dda.id ASC

          LIMIT ${DAILY_TASK_LIMIT}
          `,
          [staffId]
        );

      rows = activeRows;
    }

    // ===================================================
    // HISTORICAL DATE
    //
    // /api/staff/daily-desk?date=2026-10-07
    //
    // This returns all assignments from that date.
    // ===================================================

    else {
      if (!isValidDate(requestedDate)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid date format. Use YYYY-MM-DD",
          },
          { status: 400 }
        );
      }

      const [historyRows] =
        await pool.query(
          `
          SELECT
            dda.id AS assignment_id,

            ddt.task_id,
            ddt.phone,
            ddt.source_file,

            dda.staff_id,
            dda.assigned_date,
            dda.assigned_at,
            dda.completed_at,
            dda.status

          FROM daily_desk_assignments dda

          INNER JOIN daily_desk_tasks ddt
            ON dda.task_id = ddt.id

          WHERE dda.staff_id = ?

            AND DATE(
              dda.assigned_date
            ) = ?

          ORDER BY
            dda.id ASC

          LIMIT ${DAILY_TASK_LIMIT}
          `,
          [
            staffId,
            requestedDate,
          ]
        );

      rows = historyRows;
    }

    // ===================================================
    // CHECK ZOOM CALL HISTORY
    //
    // Only pending/in-progress assignments
    // ===================================================

    for (const assignment of rows) {
      try {
        // ===============================================
        // ALREADY COMPLETED
        // ===============================================

        if (
          String(assignment.status)
            .toLowerCase()
            .trim() === "completed"
        ) {
          continue;
        }

        // ===============================================
        // NO PHONE
        // ===============================================

        if (!assignment.phone) {
          continue;
        }

        // ===============================================
        // NORMALIZE PHONE
        // ===============================================

        const cleanPhone = String(
          assignment.phone
        ).replace(/\D/g, "");

        if (!cleanPhone) {
          continue;
        }

        // ===============================================
        // WHICH DATE TO CHECK?
        //
        // ACTIVE:
        // current operational date
        //
        // HISTORY:
        // requested date
        // ===============================================

        const callDate =
          requestedDate ||
          operationalDate;

        // ===============================================
        // FIND ZOOM CALL
        // ===============================================

        const [calls] =
          await pool.query(
            `
            SELECT
              id,
              call_history_uuid,
              direction,
              call_type,
              status,
              caller_number,
              callee_number,
              start_time,
              end_time,
              duration

            FROM zoom_call_logs

            WHERE user_id = ?

              AND (
                REPLACE(
                  REPLACE(
                    REPLACE(
                      REPLACE(
                        REPLACE(
                          caller_number,
                          '+',
                          ''
                        ),
                        '-',
                        ''
                      ),
                      ' ',
                      ''
                    ),
                    '(',
                    ''
                  ),
                  ')',
                  ''
                ) LIKE ?

                OR

                REPLACE(
                  REPLACE(
                    REPLACE(
                      REPLACE(
                        REPLACE(
                          callee_number,
                          '+',
                          ''
                        ),
                        '-',
                        ''
                      ),
                      ' ',
                        ''
                    ),
                    '(',
                    ''
                  ),
                  ')',
                  ''
                ) LIKE ?
              )

              AND (
                LOWER(
                  TRIM(
                    COALESCE(
                      status,
                      ''
                    )
                  )
                ) IN (
                  'completed',
                  'answered',
                  'connected'
                )

                OR COALESCE(
                  duration,
                  0
                ) > 0
              )

              AND DATE(start_time) = ?

            ORDER BY
              start_time DESC

            LIMIT 1
            `,
            [
              staffId,
              `%${cleanPhone}%`,
              `%${cleanPhone}%`,
              callDate,
            ]
          );

        // ===============================================
        // CALL FOUND
        // ===============================================

        if (calls.length > 0) {
          const call = calls[0];

          // =============================================
          // MARK ASSIGNMENT COMPLETED
          // =============================================

          await pool.query(
            `
            UPDATE daily_desk_assignments

            SET
              status = 'completed',

              completed_at =
                COALESCE(
                  ?,
                  NOW()
                )

            WHERE id = ?

              AND staff_id = ?

              AND LOWER(
                TRIM(
                  COALESCE(
                    status,
                    ''
                  )
                )
              ) <> 'completed'
            `,
            [
              call.end_time ||
                call.start_time ||
                null,

              assignment.assignment_id,

              staffId,
            ]
          );

          // =============================================
          // UPDATE RESPONSE
          // =============================================

          assignment.status =
            "completed";

          assignment.completed_at =
            call.end_time ||
            call.start_time ||
            new Date();

          // =============================================
          // ZOOM INFO
          // =============================================

          assignment.zoom_call = {
            call_id: call.id,

            call_history_uuid:
              call.call_history_uuid ||
              null,

            direction:
              call.direction ||
              null,

            call_type:
              call.call_type ||
              null,

            status:
              call.status ||
              null,

            caller_number:
              call.caller_number ||
              null,

            callee_number:
              call.callee_number ||
              null,

            start_time:
              call.start_time ||
              null,

            end_time:
              call.end_time ||
              null,

            duration:
              call.duration || 0,
          };
        }
      } catch (callError) {
        // =============================================
        // ONE CALL ERROR MUST NOT BREAK API
        // =============================================

        console.error(
          "DAILY DESK CALL CHECK ERROR:",
          callError
        );
      }
    }

    // ===================================================
    // ACTIVE MODE:
    // Remove assignments that just became completed
    // during Zoom check.
    //
    // This means completed task immediately disappears
    // from active Daily Desk.
    // ===================================================

    if (!requestedDate) {
      rows = rows.filter(
        (item) =>
          String(item.status)
            .toLowerCase()
            .trim() !== "completed"
      );
    }

    // ===================================================
    // COUNTS
    // ===================================================

    const total =
      rows.length;

    const completed =
      rows.filter(
        (item) =>
          String(item.status)
            .toLowerCase()
            .trim() === "completed"
      ).length;

    const pending =
      rows.filter(
        (item) =>
          String(item.status)
            .toLowerCase()
            .trim() !== "completed"
      ).length;

    const remaining =
      Math.max(
        0,
        DAILY_TASK_LIMIT - pending
      );

    // ===================================================
    // RESPONSE
    // ===================================================

    return NextResponse.json({
      success: true,

      // Requested/history date
      date:
        requestedDate ||
        null,

      // Current California date
      california_date:
        californiaDate,

      // Current California time
      california_datetime:
        californiaDateTime,

      // 8 AM operational date
      operational_date:
        operationalDate,

      // Timezone
      timezone:
        CALIFORNIA_TIMEZONE,

      // Operational day rule
      operational_day_start:
        "08:00 America/Los_Angeles",

      // Staff
      staff_id:
        staffId,

      // Daily limit
      limit:
        DAILY_TASK_LIMIT,

      // Counts
      total,

      completed,

      pending,

      remaining,

      // Data
      data: rows,
    });
  } catch (error) {
    console.error(
      "STAFF DAILY DESK API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Daily Desk data fetch nahi hua",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}