/**
 * Formatting utilities for display and localization
 */

/**
 * Format file size to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "۰ بایت";

  const sizes = ["بایت", "کیلوبایت", "مگابایت", "گیگابایت"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);

  return `${toPersianNumber(size.toFixed(2))} ${sizes[i]}`;
}

/**
 * Convert English numbers to Persian numbers
 */
export function toPersianNumber(input: string | number): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(input).replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
}

/**
 * Convert Persian numbers to English numbers
 */
export function toEnglishNumber(input: string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  let result = input;
  persianDigits.forEach((persian, index) => {
    result = result.replace(new RegExp(persian, "g"), String(index));
  });
  return result;
}

/**
 * Format time in seconds to MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${toPersianNumber(mins.toString().padStart(2, "0"))}:${toPersianNumber(secs.toString().padStart(2, "0"))}`;
}

/**
 * Format date to Persian locale string
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  
  // Use Persian calendar
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    // Fallback to Gregorian if Persian calendar not available
    return date.toLocaleDateString("fa-IR");
  }
}

/**
 * Format date and time to Persian locale string
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return date.toLocaleString("fa-IR");
  }
}

/**
 * Format relative time (e.g., "۵ دقیقه پیش")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) {
    return "لحظاتی پیش";
  } else if (minutes < 60) {
    return `${toPersianNumber(minutes)} دقیقه پیش`;
  } else if (hours < 24) {
    return `${toPersianNumber(hours)} ساعت پیش`;
  } else if (days < 30) {
    return `${toPersianNumber(days)} روز پیش`;
  } else if (months < 12) {
    return `${toPersianNumber(months)} ماه پیش`;
  } else {
    return `${toPersianNumber(years)} سال پیش`;
  }
}

/**
 * Format score with Persian numbers
 */
export function formatScore(score: number): string {
  return toPersianNumber(score);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, total: number): string {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  return `${toPersianNumber(percentage)}٪`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * Pluralize Persian words based on count
 */
export function pluralize(
  count: number,
  singular: string,
  plural: string
): string {
  return count === 1 ? singular : plural;
}

