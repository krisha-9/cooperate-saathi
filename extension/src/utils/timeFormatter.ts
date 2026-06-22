/**
 * Formats a date string or Date object to a human-friendly relative timestamp.
 * Examples: "Just now", "2 mins ago", "1 hour ago", "Yesterday", "3 days ago", "Jun 25, 2025"
 */
export const formatRelativeTime = (dateInput: string | Date): string => {
  try {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    if (isNaN(diffMs)) {
      return typeof dateInput === "string" ? dateInput : "";
    }

    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return "Just now";
    }
    if (diffMins < 60) {
      return `${diffMins} mins ago`;
    }
    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    }
    if (diffDays === 1) {
      return "Yesterday";
    }
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }

    // Full date for older memories
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    return typeof dateInput === "string" ? dateInput : "";
  }
};
