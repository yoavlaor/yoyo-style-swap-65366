import { z } from 'zod';

// Auth validation schemas
export const signupSchema = z.object({
  username: z.string()
    .min(3, "שם משתמש חייב להכיל לפחות 3 תווים")
    .max(30, "שם משתמש לא יכול לעבור 30 תווים")
    .regex(/^[a-zA-Z0-9_-]+$/, "שם משתמש יכול להכיל רק אותיות, מספרים, _ ו-"),
  email: z.string().email("כתובת אימייל לא תקינה"),
  phone: z.string()
    .regex(/^((\+972|0)5[0-9]{8})?$/, "מספר טלפון לא תקין")
    .optional()
    .or(z.literal('')),
  address: z.string()
    .min(5, "כתובת קצרה מדי")
    .max(200, "כתובת ארוכה מדי")
    .optional()
    .or(z.literal('')),
  password: z.string()
    .min(6, "סיסמה חייבת להכיל לפחות 6 תווים"),
});

// Profile validation schemas
export const profileSchema = z.object({
  username: z.string()
    .min(3, "שם משתמש חייב להכיל לפחות 3 תווים")
    .max(30, "שם משתמש לא יכול לעבור 30 תווים"),
  full_name: z.string()
    .max(100, "שם מלא לא יכול לעבור 100 תווים")
    .optional()
    .or(z.literal('')),
  bio: z.string()
    .max(500, "ביוגרפיה לא יכולה לעבור 500 תווים")
    .optional()
    .or(z.literal('')),
});

// Item validation schemas
export const itemSchema = z.object({
  title: z.string()
    .min(1, "כותרת חייבת להכיל לפחות תו אחד")
    .max(100, "כותרת לא יכולה לעבור 100 תווים"),
  description: z.string()
    .max(1000, "תיאור לא יכול לעבור 1000 תווים")
    .optional()
    .or(z.literal('')),
  price: z.number()
    .min(0, "מחיר חייב להיות חיובי")
    .max(100000, "מחיר גבוה מדי"),
  brand: z.string()
    .max(50, "שם מותג לא יכול לעבור 50 תווים")
    .optional()
    .or(z.literal('')),
  category: z.string()
    .max(50, "קטגוריה לא יכולה לעבור 50 תווים")
    .optional()
    .or(z.literal('')),
  size: z.string()
    .max(20, "מידה לא יכולה לעבור 20 תווים")
    .optional()
    .or(z.literal('')),
  condition: z.string()
    .max(50, "מצב לא יכול לעבור 50 תווים")
    .optional()
    .or(z.literal('')),
});

// Body measurements validation schemas
export const bodyMeasurementsSchema = z.object({
  height: z.number()
    .min(100, "גובה נמוך מדי")
    .max(250, "גובה גבוה מדי")
    .optional(),
  weight: z.number()
    .min(30, "משקל נמוך מדי")
    .max(300, "משקל גבוה מדי")
    .optional(),
  body_type: z.enum(['slim', 'average', 'athletic', 'curvy', 'plus'])
    .optional(),
  gender: z.enum(['male', 'female', 'other'])
    .optional(),
});

// Error message mapping for user-friendly display
export const ERROR_MESSAGES: Record<string, string> = {
  '23505': 'שם המשתמש כבר תפוס',
  '23503': 'התייחסות לא תקינה',
  'PGRST116': 'אין הרשאה',
  'PGRST301': 'אין הרשאה',
  'default': 'אירעה שגיאה. נסה שוב.',
};

export function getUserMessage(error: any): string {
  const code = error?.code || 'default';
  return ERROR_MESSAGES[code] || ERROR_MESSAGES.default;
}
