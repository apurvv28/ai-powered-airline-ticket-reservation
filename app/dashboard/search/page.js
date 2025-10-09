import { redirect } from 'next/navigation';

export default function DashboardSearchRedirect() {
  // Redirect legacy /dashboard/search URLs to the canonical /search route
  redirect('/search');
}
