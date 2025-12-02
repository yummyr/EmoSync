// src/utils/date.js

/**
 * Format a timestamp or ISO string into "YYYY-MM-DD HH:mm" or "YYYY-MM-DD HH:mm:ss"
 * Returns "—" if input is null, undefined, or invalid.
 *
 * @param {string | number | Date} inputTime - Timestamp or ISO date string.
 * @param {boolean} [includeSeconds=false] - Whether to include seconds in the formatted time.
 * @returns {string} A human-readable date-time string.
 */
export function formatDateTime(inputTime, includeSeconds = false) {
  if (!inputTime) return "—";

  try {
    const date = new Date(inputTime);
    if (isNaN(date.getTime())) return "—"; // Handle invalid date

    const datePart = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const timePart = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: includeSeconds ? "2-digit" : undefined,
      hour12: false, // Use 24-hour format
    });

    return `${datePart} ${timePart}`;
  } catch (e) {
    console.warn("FormatDateTime error:", e);
    return "—";
  }
}

/**
 * Format only the date portion as "YYYY-MM-DD".
 *
 * @param {string | number | Date} inputTime - Timestamp or ISO date string.
 * @returns {string} Formatted date string or "—" if invalid.
 */
export function formatDate(inputTime) {
  if (!inputTime) return "—";
  try {
    const date = new Date(inputTime);
    if (isNaN(date.getTime())) return "—";
    // en-CA locale outputs date in ISO-like format: YYYY-MM-DD
    return date.toLocaleDateString("en-CA");
  } catch {
    return "—";
  }
}