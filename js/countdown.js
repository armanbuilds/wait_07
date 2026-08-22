import { BIRTHDAY } from "./config.js";

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

function pad(value) {
  return String(value).padStart(2, "0");
}

function readPart(parts, type) {
  const part = parts.find((item) => item.type === type);
  return part ? Number(part.value) : 0;
}

/**
 * Convert a wall-clock date in BIRTHDAY.timeZone into a UTC timestamp.
 * Keeps the target accurate if the timezone or date in config.js changes.
 */
export function getBirthdayTimestamp(birthday = BIRTHDAY) {
  const utcGuess = Date.UTC(
    birthday.year,
    birthday.month - 1,
    birthday.day,
    birthday.hour,
    birthday.minute,
    birthday.second
  );

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: birthday.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(new Date(utcGuess));
  const hourValue = readPart(parts, "hour");

  const asUtcFromZonedParts = Date.UTC(
    readPart(parts, "year"),
    readPart(parts, "month") - 1,
    readPart(parts, "day"),
    hourValue === 24 ? 0 : hourValue,
    readPart(parts, "minute"),
    readPart(parts, "second")
  );

  const timezoneOffset = asUtcFromZonedParts - utcGuess;
  return utcGuess - timezoneOffset;
}

export function getTimeRemaining(now = Date.now(), birthday = BIRTHDAY) {
  const target = getBirthdayTimestamp(birthday);
  const diff = target - now;

  if (diff <= 0) {
    return {
      reached: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      display: {
        days: pad(0),
        hours: pad(0),
        minutes: pad(0),
        seconds: pad(0),
      },
    };
  }

  const days = Math.floor(diff / MS_PER_DAY);
  const hours = Math.floor((diff % MS_PER_DAY) / MS_PER_HOUR);
  const minutes = Math.floor((diff % MS_PER_HOUR) / MS_PER_MINUTE);
  const seconds = Math.floor((diff % MS_PER_MINUTE) / MS_PER_SECOND);

  return {
    reached: false,
    days,
    hours,
    minutes,
    seconds,
    display: {
      days: pad(days),
      hours: pad(hours),
      minutes: pad(minutes),
      seconds: pad(seconds),
    },
  };
}

export function startCountdown(onTick, onReached) {
  let intervalId = null;
  let hasReached = false;

  function tick() {
    const remaining = getTimeRemaining();

    if (remaining.reached) {
      if (!hasReached) {
        hasReached = true;
        onReached(remaining);
      }

      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }

      return;
    }

    onTick(remaining);
  }

  tick();

  if (!hasReached) {
    intervalId = setInterval(tick, 1000);
  }

  return function stopCountdown() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}
