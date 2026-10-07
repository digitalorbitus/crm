const TIME_ZONE = "America/Los_Angeles";

const LOGOUT_HOUR = 17;
const LOGOUT_MINUTE = 30;

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function getCaliforniaParts(date) {
  return Object.fromEntries(
    dateTimeFormatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map(({ type, value }) => [type, Number(value)])
  );
}

// ============================================================
// SHIFT CALIFORNIA CALENDAR DATE
// ============================================================

function shiftCalendarDate(
  { year, month, day },
  amount
) {
  const shiftedDate = new Date(
    Date.UTC(
      year,
      month - 1,
      day + amount
    )
  );

  return {
    year: shiftedDate.getUTCFullYear(),
    month: shiftedDate.getUTCMonth() + 1,
    day: shiftedDate.getUTCDate(),
  };
}

// ============================================================
// GET CALIFORNIA 5:30 PM CUTOFF
//
// Represents:
//     05:30 PM
//     America/Los_Angeles
//
// DST is automatically handled.
// ============================================================

function getCutoffForDate({
  year,
  month,
  day,
}) {
  // Initial UTC guess.
  //
  // Desired California local time:
  //     17:30 / 5:30 PM
  //
  const targetAsUtc = Date.UTC(
    year,
    month - 1,
    day,
    LOGOUT_HOUR,
    LOGOUT_MINUTE,
    0
  );

  let cutoff = targetAsUtc;

  // Correct the UTC timestamp until the represented
  // California time becomes exactly 17:30.
  for (
    let attempt = 0;
    attempt < 4;
    attempt += 1
  ) {
    const parts = getCaliforniaParts(
      new Date(cutoff)
    );

    const representedAsUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second
    );

    cutoff +=
      targetAsUtc -
      representedAsUtc;
  }

  return cutoff;
}

// ============================================================
// NEXT CALIFORNIA LOGOUT
//
// If current time is before 5:30 PM:
//     today's 5:30 PM
//
// If current time is at/after 5:30 PM:
//     tomorrow's 5:30 PM
// ============================================================

export function getNextCaliforniaLogout(
  now = new Date()
) {
  const today =
    getCaliforniaParts(now);

  let cutoff =
    getCutoffForDate(today);

  if (
    cutoff <= now.getTime()
  ) {
    cutoff =
      getCutoffForDate(
        shiftCalendarDate(
          today,
          1
        )
      );
  }

  return cutoff;
}

// ============================================================
// MOST RECENT CALIFORNIA LOGOUT
//
// If current time is after today's 5:30 PM:
//     today's 5:30 PM
//
// If current time is before today's 5:30 PM:
//     yesterday's 5:30 PM
// ============================================================

export function getMostRecentCaliforniaLogout(
  now = new Date()
) {
  const today =
    getCaliforniaParts(now);

  let cutoff =
    getCutoffForDate(today);

  if (
    cutoff > now.getTime()
  ) {
    cutoff =
      getCutoffForDate(
        shiftCalendarDate(
          today,
          -1
        )
      );
  }

  return cutoff;
}

// ============================================================
// CHECK CURRENT CALIFORNIA SESSION
//
// A JWT is valid for the current operational/login day
// only if it was created at or after the latest 5:30 PM
// California cutoff.
// ============================================================

export function isSessionCurrentForCaliforniaDay(
  payload,
  now = new Date()
) {
  return (
    Number.isFinite(
      Number(payload?.iat)
    ) &&
    Number(payload.iat) * 1000 >=
      getMostRecentCaliforniaLogout(now)
  );
}

// ============================================================
// FORMAT CALIFORNIA DATE/TIME
//
// Returns:
// YYYY-MM-DD HH:mm:ss
// ============================================================

export function formatCaliforniaDateTime(
  date
) {
  const {
    year,
    month,
    day,
    hour,
    minute,
    second,
  } = getCaliforniaParts(date);

  return [
    `${year}-${String(month).padStart(
      2,
      "0"
    )}-${String(day).padStart(
      2,
      "0"
    )}`,

    `${String(hour).padStart(
      2,
      "0"
    )}:${String(minute).padStart(
      2,
      "0"
    )}:${String(second).padStart(
      2,
      "0"
    )}`,
  ].join(" ");
}