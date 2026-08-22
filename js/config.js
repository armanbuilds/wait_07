/**
 * Central configuration for the opening countdown.
 * Change the birthday target and visit messages here only.
 */

export const BIRTHDAY = {
  year: 2026,
  month: 9,
  day: 7,
  hour: 0,
  minute: 0,
  second: 0,
  timeZone: "Asia/Karachi",
};

export const VISITOR = {
  storageKey: "b_birthday_visit_count",
};

export const MESSAGES = {
  experienceWaiting: "A GREAT EXPERIENCE IS WAITING FOR YOU",
  unlockedPlaceholder: "Birthday unlocked. The full experience will live here.",
  visitor: {
    1: "SO... YOU FINALLY MADE IT HERE 👀",
    2: "DON'T BE SO IMPATIENT 😭",
    3: "BRO... IT'S STILL NOT YOUR BIRTHDAY 😂",
    4: "YOU REALLY THOUGHT IT UNLOCKED? 💀",
    5: "YOU'RE REALLY CHECKING AGAIN? 😭",
    6: "THE PATIENCE LEVEL IS CONCERNING 😂",
    7: "AT THIS POINT, JUST WAIT FOR SEPTEMBER 7TH 🎂😂",
  },
};

export function getVisitorMessage(visitCount) {
  if (visitCount <= 1) {
    return MESSAGES.visitor[1];
  }

  if (visitCount >= 7) {
    return MESSAGES.visitor[7];
  }

  return MESSAGES.visitor[visitCount];
}
