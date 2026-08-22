import { VISITOR } from "./config.js";

function readStoredCount() {
  const rawValue = localStorage.getItem(VISITOR.storageKey);

  if (rawValue === null) {
    return 0;
  }

  const parsed = Number.parseInt(rawValue, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function recordVisit() {
  const visitCount = readStoredCount() + 1;
  localStorage.setItem(VISITOR.storageKey, String(visitCount));
  return visitCount;
}

export function getVisitCount() {
  return readStoredCount();
}
