import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to login (middleware handles auth check)
  redirect('/login');
}
