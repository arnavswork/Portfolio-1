import { NextResponse } from 'next/server';

// 🔐 LOGIN
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password } = body;

    // ❌ Missing password
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // ❌ Wrong password
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // ✅ Create response
    const response = NextResponse.json({ success: true });

    // ✅ Set secure cookie
    response.cookies.set('admin-auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// 🔓 LOGOUT
export async function DELETE() {
  const response = NextResponse.json({ success: true });

  // ❌ Remove cookie
  response.cookies.set('admin-auth', '', {
    httpOnly: true,
    path: '/',
    expires: new Date(0),
  });

  return response;
}