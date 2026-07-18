/**
 * dateHelpers — Pure date formatting utilities
 *
 * Used by CombustibleFormScreen and GastoFormScreen to:
 *   - convert a JS Date to an ISO YYYY-MM-DD string for API submission
 *   - convert an ISO YYYY-MM-DD string to a dd/mm/yyyy string for display
 *
 * Both functions are pure (no side effects, no external dependencies).
 *
 * Validates: Requirements 2.18, 2.20, 3.7, 3.8
 */

/**
 * toISODate — converts a JS Date to "YYYY-MM-DD" format.
 *
 * Uses local date components (getFullYear / getMonth / getDate) so the result
 * always reflects the date the user tapped on the native picker, regardless of
 * the device timezone offset.
 *
 * @param date - Any valid JS Date object
 * @returns ISO 8601 date string, e.g. "2025-07-28"
 */
export function toISODate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * formatDateDisplay — converts "YYYY-MM-DD" to "dd/mm/yyyy" for human display.
 *
 * Does not validate the input beyond splitting on "-"; if the value is not a
 * well-formed ISO date this function returns the original string unchanged so
 * the validation layer can surface the correct error message.
 *
 * @param iso - ISO date string in "YYYY-MM-DD" format
 * @returns Display string in "dd/mm/yyyy" format, e.g. "28/07/2025"
 */
export function formatDateDisplay(iso: string): string {
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  const [yyyy, mm, dd] = parts;
  if (!yyyy || !mm || !dd) return iso;
  return `${dd}/${mm}/${yyyy}`;
}
