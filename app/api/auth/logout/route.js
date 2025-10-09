import { NextResponse } from 'next/server';

export async function POST() {
	try {
		const response = NextResponse.json({ message: 'Logged out' });

		// Clear auth cookie by setting maxAge=0
		response.cookies.set('auth-token', '', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 0,
		});

		return response;
	} catch (error) {
		console.error('Logout error:', error);
		return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
	}
}
