
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date for display
export function formatDate(date: string | Date): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString();
}

// Format time for display
export function formatTime(time: string): string {
  if (!time) return '';
  return time.substring(0, 5); // Format as HH:MM
}
