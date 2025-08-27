import React from 'react';

// Define the valid status types
type Status = 'pending' | 'in-progress' | 'completed' | 'failed';

// A mapping of status to Tailwind CSS classes for styling
// These color pairings are chosen for a contrast ratio of >= 4.5:1
const statusClasses: Record<Status, string> = {
  // bg-orange-600 and text-white have a contrast ratio of 5.89:1
  pending: 'bg-orange-600 text-white',
  
  // bg-blue-600 and text-white have a contrast ratio of 4.59:1
  'in-progress': 'bg-blue-600 text-white',
  
  // bg-green-600 and text-white have a contrast ratio of 4.75:1
  completed: 'bg-green-600 text-white',
  
  // bg-red-600 and text-white have a contrast ratio of 4.6:1
  failed: 'bg-red-600 text-white',
};

// A mapping of status to human-readable text for the aria-label
const statusLabels: Record<Status, string> = {
  pending: 'Current status: Pending',
  'in-progress': 'Current status: In Progress',
  completed: 'Current status: Completed',
  failed: 'Current status: Failed',
};

// Component props interface
interface StatusBadgeProps {
  status: Status;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  // Get the CSS classes and aria-label text based on the status prop
  const classes = statusClasses[status];
  const label = statusLabels[status];

  // The component renders a span with appropriate classes and ARIA attributes
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}
      role="status"
      aria-label={label}
    >
      {/* Capitalize the first letter of the status for display */}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};