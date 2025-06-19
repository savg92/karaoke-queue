import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// This route handler processes the authentication callback from Supabase.
// It's called when users click the magic link in their email.
export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get('code');
	const token = searchParams.get('token');
	const type = searchParams.get('type');
	const error = searchParams.get('error');
	const errorDescription = searchParams.get('error_description');

	// If "next" is in param, use it as the redirect URL
	let next = searchParams.get('next') ?? '/dashboard';
	if (!next.startsWith('/')) {
		// If "next" is not a relative URL, use the default
		next = '/dashboard';
	}

	// Handle auth errors from URL params
	if (error) {
		console.error('Auth callback error:', error, errorDescription);
		return NextResponse.redirect(
			`${origin}/auth/auth-code-error?error=${error}&description=${encodeURIComponent(
				errorDescription || ''
			)}`
		);
	}

	const supabase = await createClient();

	// Handle PKCE code exchange
	if (code) {
		try {
			const { error: exchangeError } =
				await supabase.auth.exchangeCodeForSession(code);

			if (!exchangeError) {
				const forwardedHost = request.headers.get('x-forwarded-host');
				const isLocalEnv = process.env.NODE_ENV === 'development';

				if (isLocalEnv) {
					return NextResponse.redirect(`${origin}${next}`);
				} else if (forwardedHost) {
					return NextResponse.redirect(`https://${forwardedHost}${next}`);
				} else {
					return NextResponse.redirect(`${origin}${next}`);
				}
			} else {
				console.error('Exchange code error:', exchangeError);
				return NextResponse.redirect(
					`${origin}/auth/auth-code-error?error=exchange_failed&description=${encodeURIComponent(
						exchangeError.message
					)}`
				);
			}
		} catch (error) {
			console.error('Auth callback exception:', error);
			return NextResponse.redirect(
				`${origin}/auth/auth-code-error?error=exception&description=${encodeURIComponent(
					'Unexpected error during authentication'
				)}`
			);
		}
	}

	// Handle traditional magic link token verification
	if (token && type) {
		try {
			const { error: verifyError } = await supabase.auth.verifyOtp({
				token_hash: token,
				type: type as
					| 'signup'
					| 'magiclink'
					| 'recovery'
					| 'invite'
					| 'email_change',
			});

			if (!verifyError) {
				const forwardedHost = request.headers.get('x-forwarded-host');
				const isLocalEnv = process.env.NODE_ENV === 'development';

				if (isLocalEnv) {
					return NextResponse.redirect(`${origin}${next}`);
				} else if (forwardedHost) {
					return NextResponse.redirect(`https://${forwardedHost}${next}`);
				} else {
					return NextResponse.redirect(`${origin}${next}`);
				}
			} else {
				console.error('Verify token error:', verifyError);
				return NextResponse.redirect(
					`${origin}/auth/auth-code-error?error=verify_failed&description=${encodeURIComponent(
						verifyError.message
					)}`
				);
			}
		} catch (error) {
			console.error('Token verification exception:', error);
			return NextResponse.redirect(
				`${origin}/auth/auth-code-error?error=verify_exception&description=${encodeURIComponent(
					'Unexpected error during token verification'
				)}`
			);
		}
	}

	// Return the user to an error page with instructions
	return NextResponse.redirect(
		`${origin}/auth/auth-code-error?error=no_auth_data&description=${encodeURIComponent(
			'No authentication code or token received'
		)}`
	);
}
