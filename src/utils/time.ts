import { formatDistanceToNowStrict, format } from 'date-fns';

export function formatRelativeToNow(date: string | Date) {
  try {
    return formatDistanceToNowStrict(new Date(date), { addSuffix: true });
  } catch (error) {
    return 'soon';
  }
}

export function formatReadable(date: string | Date) {
  try {
    return format(new Date(date), "eee, MMM d 'at' HH:mm");
  } catch (error) {
    return 'Unknown time';
  }
}
