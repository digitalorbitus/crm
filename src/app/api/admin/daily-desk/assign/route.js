import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =====================================================
// CONFIG
// =====================================================

const CALIFORNIA_TIMEZONE = "America/Los_Angeles";

const MAX_NEW_TASKS_PER_OPERATIONAL_DAY = 500;

// =====================================================
// CALIFORNIA PARTS
// =====================================================

function getCaliforniaParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CALIFORNIA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const result = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      result[part.type] = part.value;
    }
  }

  return {
    year: Number(result.year),
    month: Number(result.month),
    day: Number(result.day),
    hour: Number(result.hour),
    minute: Number(result.minute),
    second: Number(result.second),
  };
}

// =====================================================
// CALIFORNIA CALENDAR DATE
// =====================================================

function getCaliforniaDate(date = new Date()) {
  const parts = getCaliforniaParts(date);

  return [
    String(parts.year).padStart(4, "0"),
    String(parts.month).padStart(2, "0"),
    String(parts.day).padStart(2, "0"),
  ].join("-");
}

// =====================================================
// OPERATIONAL DATE
//
// 08:00 AM California -> next day 08:00 AM
//
// 00:00 - 07:59 California
// belongs to PREVIOUS operational day.
// =====================================================

function getCaliforniaOperationalDate(date = new Date()) {
  const parts = getCaliforniaParts(date);

  let {
    year,
    month,
    day,
    hour,
  } = parts;

  if (hour < 8) {
    const previousDay = new Date(
      Date.UTC(year, month - 1, day - 1)
    );

    year = previousDay.getUTCFullYear();
    month = previousDay.getUTCMonth() + 1;
    day = previousDay.getUTCDate();
  }

  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

// =====================================================
// PHONE NORMALIZER
// =====================================================

function normalizePhone(phone) {
  if (
    phone === null ||
    phone === undefined
  ) {
    return "";
  }

  let digits = String(phone).replace(/\D/g, "");

  // Remove US country code
  if (
    digits.length === 11 &&
    digits.startsWith("1")
  ) {
    digits = digits.substring(1);
  }

  return digits;
}

// =====================================================
// VALID PHONE
// =====================================================

function isValidPhone(phone) {
  const normalized = normalizePhone(phone);

  return (
    normalized.length >= 10 &&
    normalized.length <= 15
  );
}

// =====================================================
// GET
//
// Date-wise Daily Desk history
// =====================================================

export async function GET(request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const dateParam =
      searchParams.get("date");

    const californiaDate =
      getCaliforniaDate();

    const operationalDate =
      getCaliforniaOperationalDate();

    const targetDate =
      dateParam || operationalDate;

    // =================================================
    // DATE VALIDATION
    // =================================================

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(
        targetDate
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid date. Format YYYY-MM-DD hona chahiye.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // HISTORY
    // =================================================

    const [rows] =
      await pool.execute(
        `
        SELECT
          dda.id AS assignment_id,

          ddt.task_id AS taskId,
          ddt.phone,
          ddt.source_file AS sourceFile,

          u.id AS staffId,
          u.name AS staffName,
          u.email AS staffEmail,

          dda.assigned_date AS assignedDate,
          dda.assigned_at AS assignedAt,
          dda.completed_at AS completedAt,
          dda.status

        FROM daily_desk_assignments dda

        INNER JOIN daily_desk_tasks ddt
          ON dda.task_id = ddt.id

        INNER JOIN users u
          ON dda.staff_id = u.id

        WHERE DATE(dda.assigned_date) = ?

        ORDER BY dda.assigned_at DESC
        `,
        [targetDate]
      );

    // =================================================
    // REMOVE DUPLICATE PHONES FROM RESPONSE
    // =================================================

    const uniqueRows = [];

    const seenPhones = new Set();

    for (const row of rows) {
      const phoneKey =
        normalizePhone(row.phone);

      if (!phoneKey) {
        uniqueRows.push(row);
        continue;
      }

      if (seenPhones.has(phoneKey)) {
        continue;
      }

      seenPhones.add(phoneKey);

      uniqueRows.push(row);
    }

    return NextResponse.json({
      success: true,

      timezone:
        CALIFORNIA_TIMEZONE,

      californiaDate,

      operationalDate,

      operationalDay:
        "08:00 AM California -> next day 08:00 AM California",

      date: targetDate,

      count:
        uniqueRows.length,

      totalDatabaseRows:
        rows.length,

      duplicatesRemoved:
        rows.length -
        uniqueRows.length,

      data: uniqueRows,
    });
  } catch (error) {
    console.error(
      "DAILY DESK HISTORY GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Daily Desk history fetch nahi ho saki.",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// POST
//
// CREATE DAILY DESK ASSIGNMENTS
// =====================================================

export async function POST(request) {
  const connection =
    await pool.getConnection();

  try {
    const body =
      await request.json();

    const {
      numbers = [],
      selectedStaff = [],
      distribution = "equal",
      sourceFile = null,
    } = body;

    // =================================================
    // CURRENT OPERATIONAL DATE
    // =================================================

    const californiaCalendarDate =
      getCaliforniaDate();

    const operationalDate =
      getCaliforniaOperationalDate();

    console.log(
      "CALIFORNIA CALENDAR DATE:",
      californiaCalendarDate
    );

    console.log(
      "DAILY DESK OPERATIONAL DATE:",
      operationalDate
    );

    // =================================================
    // VALIDATE NUMBERS
    // =================================================

    if (
      !Array.isArray(numbers) ||
      numbers.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Numbers nahi mile.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // VALIDATE STAFF
    // =================================================

    if (
      !Array.isArray(selectedStaff) ||
      selectedStaff.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Staff select nahi kiya gaya.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // CLEAN STAFF IDS
    // =================================================

    const cleanStaff = [
      ...new Set(
        selectedStaff
          .map((id) => Number(id))
          .filter(
            (id) =>
              Number.isInteger(id) &&
              id > 0
          )
      ),
    ];

    if (!cleanStaff.length) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid staff IDs nahi mile.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // TRANSACTION
    // =================================================

    await connection.beginTransaction();

    // =================================================
    // COUNTERS
    // =================================================

    let tasksSaved = 0;
    let assignmentsSaved = 0;

    let duplicateInputSkipped = 0;
    let duplicateDatabaseSkipped = 0;
    let invalidSkipped = 0;

    let completedAlreadySkipped = 0;
    let pendingAlreadySkipped = 0;
    let followUpSkipped = 0;
    let callbackSkipped = 0;
    let dncSkipped = 0;

    // =================================================
    // STAFF COUNTS
    // =================================================

    const assignedTaskCounts = {};

    for (const staffId of cleanStaff) {
      assignedTaskCounts[staffId] = 0;
    }

    // =================================================
    // INPUT PHONE DEDUPLICATION
    //
    // ONE PHONE = ONE ASSIGNMENT
    // =================================================

    const uniqueNumbers = [];

    const inputPhoneKeys =
      new Set();

    for (const item of numbers) {
      if (!item) {
        invalidSkipped++;
        continue;
      }

      if (!item.phone) {
        invalidSkipped++;
        continue;
      }

      if (!item.taskId) {
        invalidSkipped++;
        continue;
      }

      const phoneKey =
        normalizePhone(item.phone);

      if (!isValidPhone(phoneKey)) {
        invalidSkipped++;
        continue;
      }

      // -----------------------------------------------
      // INPUT DUPLICATE
      // -----------------------------------------------

      if (
        inputPhoneKeys.has(phoneKey)
      ) {
        duplicateInputSkipped++;
        continue;
      }

      inputPhoneKeys.add(phoneKey);

      uniqueNumbers.push({
        ...item,
        phoneKey,
      });
    }

    // =================================================
    // NO VALID INPUT
    // =================================================

    if (!uniqueNumbers.length) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Koi unique valid phone number nahi mila.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // IMPORTANT:
    //
    // We do NOT simply take first 500 here.
    //
    // We first check DB uniqueness.
    // Then only actual NEW numbers count toward 500.
    // =================================================

    // =================================================
    // GET STAFF'S NEW ASSIGNMENT COUNTS
    //
    // Current operational day only.
    //
    // Pending old tasks are NOT treated as new tasks.
    // =================================================

    const staffDailyCounts = {};

    for (const staffId of cleanStaff) {
      const [
        countRows,
      ] = await connection.execute(
        `
        SELECT COUNT(*) AS total
        FROM daily_desk_assignments
        WHERE staff_id = ?
          AND DATE(assigned_date) = ?
        `,
        [
          staffId,
          operationalDate,
        ]
      );

      staffDailyCounts[staffId] =
        Number(
          countRows?.[0]?.total || 0
        );
    }

    // =================================================
    // TOTAL NEW ASSIGNMENTS TODAY
    //
    // We use total assigned for operational date
    // across selected staff.
    // =================================================

    let totalAssignedToday = 0;

    for (const staffId of cleanStaff) {
      totalAssignedToday +=
        staffDailyCounts[staffId] || 0;
    }

    // =================================================
    // MAX 500 NEW NUMBERS
    // =================================================

    let remainingDailyCapacity =
      Math.max(
        0,
        MAX_NEW_TASKS_PER_OPERATIONAL_DAY -
          totalAssignedToday
      );

    // =================================================
    // If today's capacity is already full
    // =================================================

    if (remainingDailyCapacity <= 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,

          message:
            "Is operational day ke 500 new Daily Desk tasks already assigned ho chuke hain.",

          timezone:
            CALIFORNIA_TIMEZONE,

          operationalDate,

          maxDailyNewTasks:
            MAX_NEW_TASKS_PER_OPERATIONAL_DAY,

          assignedToday:
            totalAssignedToday,

          remaining:
            0,
        },
        { status: 400 }
      );
    }

    // =================================================
    // TRACK ASSIGNED PHONES IN THIS REQUEST
    //
    // GLOBAL:
    // same phone cannot go to another staff.
    // =================================================

    const assignedPhonesThisRequest =
      new Set();

    // =================================================
    // STAFF ROTATION INDEX
    // =================================================

    let staffRotationIndex = 0;

    // =================================================
    // PROCESS NUMBERS
    // =================================================

    for (
      const item of uniqueNumbers
    ) {
      // -----------------------------------------------
      // DAILY CAPACITY
      // -----------------------------------------------

      if (
        remainingDailyCapacity <= 0
      ) {
        break;
      }

      const phoneKey =
        item.phoneKey;

      // -----------------------------------------------
      // SAFETY CHECK
      // -----------------------------------------------

      if (
        assignedPhonesThisRequest.has(
          phoneKey
        )
      ) {
        duplicateInputSkipped++;
        continue;
      }

      // =================================================
      // GLOBAL DATABASE PHONE CHECK
      //
      // IMPORTANT:
      //
      // Same phone kisi bhi staff ko pehle assign hua
      // ho to new assignment nahi banegi.
      //
      // This prevents:
      //
      // Staff A -> 5551234567
      // Staff B -> 5551234567
      //
      // =================================================

      const [
        existingPhoneRows,
      ] = await connection.execute(
        `
        SELECT
          dda.id,
          dda.staff_id,
          dda.status,
          dda.assigned_date,
          ddt.phone

        FROM daily_desk_assignments dda

        INNER JOIN daily_desk_tasks ddt
          ON dda.task_id = ddt.id

        WHERE
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      ddt.phone,
                      ' ',
                      ''
                    ),
                    '-',
                    ''
                  ),
                  '(',
                  ''
                ),
                ')',
                ''
              ),
              '+',
              ''
            ),
            '.',
            ''
          ) LIKE ?

        LIMIT 1
        `,
        [`%${phoneKey}`]
      );

      // =================================================
      // EXISTING PHONE FOUND
      // =================================================

      if (
        existingPhoneRows.length > 0
      ) {
        const existing =
          existingPhoneRows[0];

        const status =
          String(
            existing.status || ""
          )
            .trim()
            .toLowerCase();

        duplicateDatabaseSkipped++;

        // -----------------------------------------------
        // STATUS COUNTERS
        // -----------------------------------------------

        if (
          status === "completed"
        ) {
          completedAlreadySkipped++;
        }

        if (
          status === "pending" ||
          status === "in progress"
        ) {
          pendingAlreadySkipped++;
        }

        if (
          status.includes(
            "follow"
          )
        ) {
          followUpSkipped++;
        }

        if (
          status.includes(
            "callback"
          )
        ) {
          callbackSkipped++;
        }

        if (
          status === "dnc" ||
          status.includes("do not call")
        ) {
          dncSkipped++;
        }

        continue;
      }

      // =================================================
      // SELECT STAFF
      //
      // Equal / Round Robin
      //
      // We choose staff with lowest current count.
      // This keeps distribution balanced.
      // =================================================

      let selectedStaffId =
        null;

      if (
        distribution === "round_robin"
      ) {
        selectedStaffId =
          cleanStaff[
            staffRotationIndex %
              cleanStaff.length
          ];

        staffRotationIndex++;
      } else {
        // ---------------------------------------------
        // EQUAL DISTRIBUTION
        //
        // Select staff having lowest count.
        // ---------------------------------------------

        let lowestCount =
          Infinity;

        for (const staffId of cleanStaff) {
          const currentCount =
            staffDailyCounts[
              staffId
            ] || 0;

          if (
            currentCount <
            lowestCount
          ) {
            lowestCount =
              currentCount;

            selectedStaffId =
              staffId;
          }
        }
      }

      if (!selectedStaffId) {
        invalidSkipped++;
        continue;
      }

      // =================================================
      // FINAL SAFETY CHECK
      //
      // Check again for same phone in this transaction.
      // =================================================

      if (
        assignedPhonesThisRequest.has(
          phoneKey
        )
      ) {
        duplicateInputSkipped++;
        continue;
      }

      // =================================================
      // INSERT TASK
      // =================================================

      const [
        taskResult,
      ] = await connection.execute(
        `
        INSERT INTO daily_desk_tasks
        (
          task_id,
          phone,
          source_file,
          task_date
        )
        VALUES (?, ?, ?, ?)
        `,
        [
          item.taskId,
          item.phone,
          sourceFile,
          operationalDate,
        ]
      );

      const taskDatabaseId =
        taskResult.insertId;

      tasksSaved++;

      // =================================================
      // INSERT ASSIGNMENT
      // =================================================

      await connection.execute(
        `
        INSERT INTO daily_desk_assignments
        (
          task_id,
          staff_id,
          assigned_date,
          status
        )
        VALUES (?, ?, ?, 'Pending')
        `,
        [
          taskDatabaseId,
          selectedStaffId,
          operationalDate,
        ]
      );

      assignmentsSaved++;

      // =================================================
      // MARK PHONE ASSIGNED
      // =================================================

      assignedPhonesThisRequest.add(
        phoneKey
      );

      // =================================================
      // UPDATE STAFF COUNT
      // =================================================

      staffDailyCounts[
        selectedStaffId
      ] =
        (staffDailyCounts[
          selectedStaffId
        ] || 0) + 1;

      assignedTaskCounts[
        selectedStaffId
      ] =
        (assignedTaskCounts[
          selectedStaffId
        ] || 0) + 1;

      // =================================================
      // REDUCE DAILY CAPACITY
      // =================================================

      remainingDailyCapacity--;
    }

    // =================================================
    // NOTHING SAVED
    // =================================================

    if (
      assignmentsSaved === 0
    ) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,

          message:
            "Koi new unique Daily Desk task assign nahi hui.",

          timezone:
            CALIFORNIA_TIMEZONE,

          operationalDate,

          data: {
            duplicateInputSkipped,
            duplicateDatabaseSkipped,
            invalidSkipped,
            completedAlreadySkipped,
            pendingAlreadySkipped,
            followUpSkipped,
            callbackSkipped,
            dncSkipped,

            maxDailyNewTasks:
              MAX_NEW_TASKS_PER_OPERATIONAL_DAY,

            alreadyAssignedToday:
              totalAssignedToday,

            remainingDailyCapacity,
          },
        },
        { status: 400 }
      );
    }

    // =================================================
    // NOTIFICATIONS
    //
    // ONE NOTIFICATION PER STAFF
    //
    // Example:
    //
    // Staff A = 167
    // Staff B = 167
    // Staff C = 166
    //
    // Total notifications = 3
    //
    // NOT 500.
    // =================================================

    let notificationsCreated = 0;

    for (
      const [
        staffId,
        taskCount,
      ] of Object.entries(
        assignedTaskCounts
      )) {
      const numericStaffId =
        Number(staffId);

      const numericTaskCount =
        Number(taskCount);

      if (
        !numericStaffId ||
        numericTaskCount <= 0
      ) {
        continue;
      }

      // =================================================
      // CREATE ONE NOTIFICATION
      // =================================================

      await connection.execute(
        `
        INSERT INTO notifications
        (
          user_id,
          title,
          message,
          type,
          is_read,
          created_at
        )
        VALUES (?, ?, ?, ?, 0, NOW())
        `,
        [
          numericStaffId,

          "New Daily Tasks Assigned",

          `You have been assigned ${numericTaskCount} new Daily Desk task${numericTaskCount === 1 ? "" : "s"}.`,

          "task",
        ]
      );

      notificationsCreated++;

      console.log(
        `DAILY DESK NOTIFICATION CREATED: staff=${numericStaffId}, tasks=${numericTaskCount}`
      );
    }

    // =================================================
    // COMMIT
    // =================================================

    await connection.commit();

    // =================================================
    // RESPONSE
    // =================================================

    return NextResponse.json({
      success: true,

      message:
        "Daily Desk tasks successfully assigned.",

      timezone:
        CALIFORNIA_TIMEZONE,

      californiaDate:
        californiaCalendarDate,

      operationalDate,

      operationalDay:
        "08:00 AM California -> next day 08:00 AM California",

      data: {
        tasksSaved,

        assignmentsSaved,

        staffCount:
          cleanStaff.length,

        distribution,

        maxDailyNewTasks:
          MAX_NEW_TASKS_PER_OPERATIONAL_DAY,

        assignedBeforeThisRequest:
          totalAssignedToday,

        assignedInThisRequest:
          assignmentsSaved,

        remainingDailyCapacity,

        uniqueInputNumbers:
          uniqueNumbers.length,

        uniqueAssignedNumbers:
          assignedPhonesThisRequest.size,

        duplicateInputSkipped,

        duplicateDatabaseSkipped,

        invalidSkipped,

        completedAlreadySkipped,

        pendingAlreadySkipped,

        followUpSkipped,

        callbackSkipped,

        dncSkipped,

        notificationsCreated,

        assignedTaskCounts,
      },
    });
  } catch (error) {
    // =================================================
    // ROLLBACK
    // =================================================

    try {
      await connection.rollback();
    } catch {}

    console.error(
      "DAILY DESK ASSIGN ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Daily Desk tasks save nahi ho sake.",
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}