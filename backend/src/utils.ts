/**
 * Generate a human-readable incident ID
 * Format: INC-XXXXXX (e.g., INC-A7X3K9)
 * 
 * Uses uppercase letters and numbers, excluding confusing characters:
 * - No 0/O (look similar)
 * - No 1/I/L (look similar)
 */

// Characters that are easy to read and distinguish
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/**
 * Generate a random string of specified length
 */
function randomString(length: number): string {
  let result = "";
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += ALPHABET[randomValues[i] % ALPHABET.length];
  }
  
  return result;
}

/**
 * Generate a human-readable incident ID
 * Format: INC-XXXXXX
 * 
 * With 6 characters from a 30-character alphabet:
 * - 30^6 = 729,000,000 possible combinations
 * - Very low collision probability for typical usage
 */
export function generateIncidentId(): string {
  return `INC-${randomString(6)}`;
}
