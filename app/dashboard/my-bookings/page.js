import { redirect } from 'next/navigation';

export default function MyBookingsRedirect() {
  // Redirect legacy /dashboard/my-bookings to canonical /my_bookings
  redirect('/my_bookings');
}
