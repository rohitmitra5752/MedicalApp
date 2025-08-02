/**
 * Icon definitions and constants for the Icon component
 */

// Icon name enum for type safety and IDE autocompletion
export const Icons = {
  // Basic Actions
  EDIT: 'edit',
  DELETE: 'delete', 
  ADD: 'add',
  CHECK: 'check',
  CLOSE: 'close',

  // Navigation
  ARROW_LEFT: 'arrow-left',
  ARROW_RIGHT: 'arrow-right',
  CHEVRON_RIGHT: 'chevron-right',
  CHEVRON_DOWN: 'chevron-down',

  // User & Medical
  USER: 'user',
  USERS: 'users',
  MEDICINE: 'medicine',
  SETTINGS: 'settings',

  // Documents & Data
  DOCUMENT: 'document',
  DOWNLOAD: 'download',
  UPLOAD: 'upload',
  CHART: 'chart',
  TABLE: 'table',

  // Status & Feedback
  SPINNER: 'spinner',
  WARNING: 'warning',
  INFO: 'info',
  SUCCESS: 'success',
  ERROR: 'error',
  SUCCESS_CIRCLE: 'success-circle',
  WARNING_TRIANGLE: 'warning-triangle',

  // UI Elements
  GRID: 'grid',
  GRIP_VERTICAL: 'grip-vertical',

  // Gender Icons
  MALE: 'male',
  FEMALE: 'female',
} as const;

// Type derived from the Icons object
export type IconName = typeof Icons[keyof typeof Icons];

// Icon path data interface
interface IconData {
  path: string | string[];
  viewBox?: string;
  fill?: boolean;
  strokeLinecap?: 'round' | 'butt' | 'square';
  strokeLinejoin?: 'round' | 'miter' | 'bevel';
}

// Icon path definitions
export const iconPaths: Record<IconName, IconData> = {
  // Basic Actions
  [Icons.EDIT]: {
    path: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },
  [Icons.DELETE]: {
    path: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },
  [Icons.ADD]: {
    path: "M12 4v16m8-8H4",
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },
  [Icons.CHECK]: {
    path: "M5 13l4 4L19 7",
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },
  [Icons.CLOSE]: {
    path: "M6 18L18 6M6 6l12 12",
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  // Navigation
  [Icons.ARROW_LEFT]: {
    path: "M19 12H5M12 5l-7 7 7 7",
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },
  [Icons.ARROW_RIGHT]: {
    path: "M5 12h14M12 5l7 7-7 7",
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },
  [Icons.CHEVRON_RIGHT]: {
    path: "M9 5l7 7-7 7",
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },
  [Icons.CHEVRON_DOWN]: {
    path: "M6 9l6 6 6-6",
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  // User & Medical
  [Icons.USER]: {
    path: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },
  [Icons.USERS]: {
    path: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },
  [Icons.MEDICINE]: {
    path: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },
  [Icons.SETTINGS]: {
    path: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  // Documents & Data
  [Icons.DOCUMENT]: {
    path: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },
  [Icons.DOWNLOAD]: {
    path: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10",
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },
  [Icons.UPLOAD]: {
    path: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12",
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },
  [Icons.CHART]: {
    path: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },
  [Icons.TABLE]: {
    path: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  // Status & Feedback
  [Icons.SPINNER]: {
    path: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z",
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },
  [Icons.WARNING]: {
    path: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z",
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },
  [Icons.INFO]: {
    path: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },
  [Icons.SUCCESS]: {
    path: "M5 13l4 4L19 7",
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },
  [Icons.ERROR]: {
    path: "M6 18L18 6M6 6l12 12",
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  // Filled variants for specific use cases
  [Icons.SUCCESS_CIRCLE]: {
    path: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
    viewBox: "0 0 20 20",
    fill: true
  },
  [Icons.WARNING_TRIANGLE]: {
    path: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z",
    viewBox: "0 0 20 20",
    fill: true
  },

  // UI Elements
  [Icons.GRID]: {
    path: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },
  [Icons.GRIP_VERTICAL]: {
    path: "M4 8h16M4 16h16",
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  // Gender Icons (filled paths for silhouettes)
  [Icons.MALE]: {
    path: "M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7V9C15 9.55 14.55 10 14 10C13.45 10 13 9.55 13 9V7H11V9C11 9.55 10.55 10 10 10C9.45 10 9 9.55 9 9V7H3V9C3 10.1 3.9 11 5 11V20C5 21.1 5.9 22 7 22H9V16H11V22H13V16H15V22H17C18.1 22 19 21.1 19 20V11C20.1 11 21 10.1 21 9Z",
    fill: true
  },
  [Icons.FEMALE]: {
    path: "M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM16 8C16 8.55 15.55 9 15 9C14.45 9 14 8.55 14 8V7H10V8C10 8.55 9.55 9 9 9C8.45 9 8 8.55 8 8V7H6V17C6 18.1 6.9 19 8 19V21C8 21.55 8.45 22 9 22C9.55 22 10 21.55 10 21V19H14V21C14 21.55 14.45 22 15 22C15.55 22 16 21.55 16 21V19C17.1 19 18 18.1 18 17V7H16V8Z",
    fill: true
  }
};
