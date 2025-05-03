import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function RootPage() {
  // Check if user is authenticated through server-side cookie check
  const isAuthenticated = (await cookies()).has('isAuthenticated');
  
  // Redirect authenticated users to dashboard, others to login
  if (isAuthenticated) {
    redirect('/overview');
  } else {
    redirect('/login');
  }

  return null;
}