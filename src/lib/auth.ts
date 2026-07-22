import { cookies } from 'next/headers';

// ✅ Check if user is authenticated
export async function isAuthenticated() {
  const cookieStore = await cookies();
  const auth = cookieStore.get('admin-auth');

  return auth?.value === 'true';
}

// ✅ Set login cookie
export async function setAuthCookie() {
  const cookieStore = await cookies();

  cookieStore.set('admin-auth', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

// ✅ Clear cookie (logout)
export async function clearAuthCookie() {
  const cookieStore = await cookies();

  cookieStore.delete('admin-auth');
}