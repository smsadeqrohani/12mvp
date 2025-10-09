/**
 * Application-wide constants and configuration
 */

// UI Constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 5,
  ADMIN_PAGE_SIZE: 5,
} as const;

// Match/Game Constants
export const MATCH = {
  DEFAULT_QUESTIONS_COUNT: 10,
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 2,
} as const;

// Toast Configuration
export const TOAST = {
  DURATION: 4000,
  POSITION: 'top-center',
} as const;

// Question Constants
export const QUESTION = {
  MIN_TIME_SECONDS: 5,
  MAX_TIME_SECONDS: 120,
  DEFAULT_TIME_SECONDS: 30,
  OPTIONS_COUNT: 4,
} as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ADMIN: '/admin',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  ACTIVE_TAB: 'activeTab',
} as const;

// Persian Messages
export const MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'با موفقیت وارد شدید',
    LOGIN_ERROR: 'خطا در ورود. لطفاً دوباره تلاش کنید',
    LOGOUT_SUCCESS: 'با موفقیت خارج شدید',
    SIGNUP_SUCCESS: 'حساب کاربری با موفقیت ایجاد شد',
    INVALID_PASSWORD: 'رمز عبور نامعتبر است. لطفاً دوباره تلاش کنید.',
    PASSWORD_REQUIREMENTS: 'رمز عبور معیارهای امنیتی را برآورده نمی‌کند',
  },
  MATCH: {
    OPPONENT_FOUND: 'حریف پیدا شد! مسابقه شروع شد',
    MATCH_CANCELLED: 'مسابقه لغو شد',
    MATCH_LEFT: 'از مسابقه خارج شدید',
    ANSWER_ERROR: 'خطا در ارسال پاسخ',
  },
  ADMIN: {
    USER_ADMIN_GRANTED: 'کاربر به مدیر تبدیل شد',
    USER_ADMIN_REVOKED: 'دسترسی مدیر حذف شد',
    NAME_UPDATED: 'نام کاربر با موفقیت به‌روزرسانی شد',
    PASSWORD_RESET: 'رمز عبور بازنشانی شد',
    QUESTION_DELETED: 'سؤال با موفقیت حذف شد',
    MATCH_CANCELLED: 'مسابقه با موفقیت لغو شد',
  },
  PROFILE: {
    CREATED: 'پروفایل ایجاد شد!',
    ERROR: 'نمی‌توان پروفایل ایجاد کرد',
  },
} as const;

// Password Validation Messages
export const PASSWORD_ERRORS = {
  MIN_LENGTH: 'رمز عبور باید حداقل ۸ کاراکتر باشد',
  UPPERCASE: 'رمز عبور باید حداقل یک حرف بزرگ انگلیسی داشته باشد',
  LOWERCASE: 'رمز عبور باید حداقل یک حرف کوچک انگلیسی داشته باشد',
  NUMBER: 'رمز عبور باید حداقل یک عدد داشته باشد',
  SPECIAL: 'رمز عبور باید حداقل یک کاراکتر ویژه (!@#$%^&*...) داشته باشد',
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm'],
  ALLOWED_AUDIO_TYPES: ['audio/mp3', 'audio/wav'],
} as const;

// Design System
export const COLORS = {
  BACKGROUND: '#06202F',
  BACKGROUND_LIGHT: '#0a2840',
  ACCENT: '#ff701a',
  ACCENT_HOVER: '#e55a00',
} as const;

// Screen Breakpoints (matches Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

