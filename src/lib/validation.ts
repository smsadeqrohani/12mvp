import { PASSWORD_ERRORS } from "./constants";

/**
 * Validation utilities for forms and user input
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate password strength
 * Requirements: min 8 chars, uppercase, lowercase, number, special char
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push(PASSWORD_ERRORS.MIN_LENGTH);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push(PASSWORD_ERRORS.UPPERCASE);
  }

  if (!/[a-z]/.test(password)) {
    errors.push(PASSWORD_ERRORS.LOWERCASE);
  }

  if (!/[0-9]/.test(password)) {
    errors.push(PASSWORD_ERRORS.NUMBER);
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push(PASSWORD_ERRORS.SPECIAL);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    errors.push("فرمت ایمیل نامعتبر است");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate name (not empty, reasonable length)
 */
export function validateName(name: string): ValidationResult {
  const errors: string[] = [];

  if (name.trim().length === 0) {
    errors.push("نام نمی‌تواند خالی باشد");
  }

  if (name.length < 2) {
    errors.push("نام باید حداقل ۲ کاراکتر باشد");
  }

  if (name.length > 50) {
    errors.push("نام باید حداکثر ۵۰ کاراکتر باشد");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate file size (in bytes)
 */
export function validateFileSize(size: number, maxSizeMB: number): ValidationResult {
  const errors: string[] = [];
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (size > maxSizeBytes) {
    errors.push(`حجم فایل نباید بیشتر از ${maxSizeMB} مگابایت باشد`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate file type
 */
export function validateFileType(
  fileType: string, 
  allowedTypes: string[]
): ValidationResult {
  const errors: string[] = [];

  if (!allowedTypes.includes(fileType)) {
    errors.push("نوع فایل مجاز نیست");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate question time (in seconds)
 */
export function validateQuestionTime(
  time: number,
  min: number,
  max: number
): ValidationResult {
  const errors: string[] = [];

  if (time < min) {
    errors.push(`زمان نباید کمتر از ${min} ثانیه باشد`);
  }

  if (time > max) {
    errors.push(`زمان نباید بیشتر از ${max} ثانیه باشد`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate question grade (0-100)
 */
export function validateGrade(grade: number): ValidationResult {
  const errors: string[] = [];

  if (grade < 0 || grade > 100) {
    errors.push("نمره باید بین ۰ تا ۱۰۰ باشد");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

