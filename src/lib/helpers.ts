/**
 * General helper functions
 */

/**
 * Delay execution by specified milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Generate random ID
 */
export function generateId(prefix: string = ""): string {
  const random = Math.random().toString(36).substring(2, 9);
  const timestamp = Date.now().toString(36);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}

/**
 * Copy text to clipboard (cross-platform)
 * Works on web (navigator.clipboard) and React Native (via Clipboard API)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Check if we're on web
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // For React Native, we'll need to use a library or handle differently
    // For now, fallback to a simple implementation
    // Note: This works on web with react-native-web, but for native you'd need expo-clipboard
    if (typeof navigator !== 'undefined' && (navigator as any).clipboard) {
      await (navigator as any).clipboard.writeText(text);
      return true;
    }
    
    // Fallback: try to use document.execCommand for older browsers
    if (typeof document !== 'undefined') {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
    
    return false;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Check if value is empty (null, undefined, empty string, empty array)
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Get random item from array
 */
export function randomItem<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Group array items by key
 */
export function groupBy<T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  return array.reduce((result, item) => {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Remove duplicates from array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Extract clean Persian error message from Convex errors
 * Removes technical details like Request ID, stack traces, etc.
 */
export function getCleanErrorMessage(error: unknown): string {
  if (!error) {
    return "خطایی رخ داده است";
  }

  let errorMessage = "";
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else {
    errorMessage = String(error);
  }

  // Split by newlines to handle multi-line errors
  const lines = errorMessage.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
  
  // Look for Persian text (contains Persian characters)
  const persianPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  
  // Find the line with Persian text
  let persianLine = "";
  for (const line of lines) {
    if (persianPattern.test(line)) {
      // Clean this line from technical details
      let cleaned = line
        .replace(/^خطا در (ایجاد|پیوستن|لغو|ارسال|خروج|تغییر|ذخیره|حذف|آپلود|انتخاب|بازنشانی|به‌روزرسانی)\s*[^:]*:\s*/i, "")
        .replace(/^Uncaught Error\s*:?\s*/i, "")
        .replace(/^Server Error\s*:?\s*/i, "")
        .replace(/\[Request ID:\s*[^\]]+\]/gi, "")
        .replace(/\[CONVEX\s+[^\]]+\]/gi, "")
        .replace(/at handler\s*\([^)]+\)/gi, "")
        .replace(/Called by client/gi, "")
        .trim();
      
      if (cleaned && persianPattern.test(cleaned)) {
        persianLine = cleaned;
        break;
      }
    }
  }
  
  // If we found a Persian line, use it
  if (persianLine) {
    return persianLine;
  }
  
  // Otherwise, clean the entire message
  errorMessage = errorMessage
    .replace(/^خطا در (ایجاد|پیوستن|لغو|ارسال|خروج|تغییر|ذخیره|حذف|آپلود|انتخاب|بازنشانی|به‌روزرسانی)\s*[^:]*:\s*/i, "")
    .replace(/^Uncaught Error\s*:?\s*/i, "")
    .replace(/^Server Error\s*:?\s*/i, "")
    .replace(/\[Request ID:\s*[^\]]+\]/gi, "")
    .replace(/\[CONVEX\s+[^\]]+\]/gi, "")
    .replace(/at handler\s*\([^)]+\)/gi, "")
    .replace(/Called by client/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  // If message is empty or doesn't contain Persian, return default
  if (!errorMessage || errorMessage.length < 5 || !persianPattern.test(errorMessage)) {
    return "خطایی رخ داده است";
  }

  return errorMessage;
}

