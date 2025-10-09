import { redirect } from 'next/navigation';

export default function BookingRedirect() {
  // Redirect legacy /dashboard/booking to canonical /booking
  redirect('/booking');
}
