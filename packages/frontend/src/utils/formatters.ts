/**
 * Formats price in cents to USD string
 * @param cents Price in cents (e.g., 12900)
 * @returns Formatted price string (e.g., "$129.00")
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Formats ISO date to readable string
 * @param dateString ISO date string (e.g., "2024-03-15")
 * @returns Formatted date (e.g., "Mar 15")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Formats ISO date to full readable string
 * @param dateString ISO date string
 * @returns Formatted date (e.g., "Friday, March 15, 2024")
 */
export function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Formats time to 12-hour format
 * @param time 24-hour time string (e.g., "14:30")
 * @returns 12-hour format (e.g., "2:30 PM")
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Formats duration in minutes to readable string
 * @param minutes Duration in minutes
 * @returns Formatted duration (e.g., "2h 30m")
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}
