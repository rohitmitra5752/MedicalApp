/**
 * Utility functions for data conversion and common operations
 */

import type { Patient } from './db';

/**
 * Converts SQLite row data to a properly typed Patient object
 * SQLite stores booleans as integers: 1 = true, 0 = false
 */
export function convertSQLitePatient(row: Record<string, unknown>): Patient {
  // Validate required fields exist
  if (!row.id || !row.name || !row.phone_number || !row.medical_id_number || !row.gender || !row.created_at) {
    throw new Error('Invalid patient data: missing required fields');
  }

  // Validate and convert each field with proper type checking
  const id = Number(row.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('Invalid patient data: id must be a positive integer');
  }

  const name = String(row.name).trim();
  if (!name) {
    throw new Error('Invalid patient data: name cannot be empty');
  }

  const phone_number = String(row.phone_number).trim();
  if (!phone_number) {
    throw new Error('Invalid patient data: phone_number cannot be empty');
  }

  const medical_id_number = String(row.medical_id_number).trim();
  if (!medical_id_number) {
    throw new Error('Invalid patient data: medical_id_number cannot be empty');
  }

  const gender = String(row.gender).toLowerCase();
  if (gender !== 'male' && gender !== 'female') {
    throw new Error('Invalid patient data: gender must be either "male" or "female"');
  }

  // Convert SQLite integer (1/0) to boolean
  const is_taking_medicines = row.is_taking_medicines === 1;

  const created_at = String(row.created_at);
  if (!created_at) {
    throw new Error('Invalid patient data: created_at cannot be empty');
  }

  return {
    id,
    name,
    phone_number,
    medical_id_number,
    gender: gender as 'male' | 'female',
    is_taking_medicines,
    created_at
  };
}

/**
 * Converts boolean to SQLite integer for storage
 * true -> 1, false -> 0
 */
export function booleanToSQLiteInteger(value: boolean): number {
  return value ? 1 : 0;
}

/**
 * Converts SQLite integer to boolean
 * 1 -> true, 0 -> false, anything else -> false
 */
export function sqliteIntegerToBoolean(value: number | null): boolean {
  return value === 1;
}

/**
 * Parse phone number to extract country code and number
 * Used across patient forms and API endpoints
 */
export function parsePhoneNumber(phoneNumber: string): { countryCode: string; number: string } {
  // Try to match various phone number formats
  const patterns = [
    /^(\+\d{1,4})\s?(.+)$/, // +1 234567890 or +44 1234567890
    /^(\+\d{1,4})(.+)$/,    // +1234567890
  ];
  
  for (const pattern of patterns) {
    const match = phoneNumber.match(pattern);
    if (match) {
      return {
        countryCode: match[1],
        number: match[2].replace(/\s+/g, ' ').trim() // Normalize spacing
      };
    }
  }
  
  // If no pattern matches, assume it's just a number without country code
  return {
    countryCode: '+91', // Default to India
    number: phoneNumber.trim()
  };
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Validate medical ID format (optional utility for future use)
 */
export function isValidMedicalId(medicalId: string): boolean {
  // Basic validation - can be enhanced based on requirements
  return medicalId.trim().length >= 3;
}

/**
 * Validate phone number format (optional utility for future use)
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Basic validation - can be enhanced based on requirements
  const cleanNumber = phoneNumber.replace(/\s+/g, '');
  return /^\+\d{1,4}\d{6,15}$/.test(cleanNumber);
}

/**
 * Sanitize string input by trimming whitespace and normalizing
 */
export function sanitizeString(input: string | undefined | null): string {
  return (input ?? '').trim();
}

/**
 * Validate and sanitize form data for patients
 */
export function sanitizePatientData(data: {
  name?: string;
  phone_number?: string;
  medical_id_number?: string;
  gender?: string;
}) {
  return {
    name: sanitizeString(data.name),
    phone_number: sanitizeString(data.phone_number),
    medical_id_number: sanitizeString(data.medical_id_number),
    gender: data.gender
  };
}

/**
 * Validate required fields are not empty
 */
export function validateRequiredFields(fields: Record<string, unknown>): string[] {
  const errors: string[] = [];
  
  for (const [fieldName, value] of Object.entries(fields)) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors.push(`${fieldName} is required`);
    }
  }
  
  return errors;
}

/**
 * Format phone number for display (country code + number)
 */
export function formatPhoneNumber(countryCode: string, number: string): string {
  return `${countryCode} ${number}`.trim();
}
