export function formatDate(dateString: string | null): string {
  if (!dateString) return 'Not set';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
}

export function formatDateLong(dateString: string | null): string {
  if (!dateString) return 'Not set';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
}

export function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate && !endDate) return 'No dates set';
  if (!startDate) return `Ends ${formatDate(endDate)}`;
  if (!endDate) return `Starts ${formatDate(startDate)}`;
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

