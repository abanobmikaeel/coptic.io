import { query } from '@/lib/db'
import { type NextRequest, NextResponse } from 'next/server'

interface Subscriber {
	id: string
	email: string
}

export async function POST(request: NextRequest) {
	try {
		const url = new URL(request.url)
		let token = url.searchParams.get('token')

		// Also accept token from body
		if (!token) {
			const body = await request.json().catch(() => ({}))
			token = body.token
		}

		if (!token) {
			return NextResponse.json({ error: 'Token is required' }, { status: 400 })
		}

		const result = await query<Subscriber>(
			'DELETE FROM subscribers WHERE token = $1 RETURNING id, email',
			[token],
		)

		if (result.length === 0) {
			return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 })
		}

		return NextResponse.json({ message: 'Successfully unsubscribed' })
	} catch (error) {
		console.error('Unsubscribe error:', error)
		return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 })
	}
}

// Also support GET for one-click unsubscribe links
export async function GET(request: NextRequest) {
	const url = new URL(request.url)
	const token = url.searchParams.get('token')

	if (!token) {
		return NextResponse.redirect(new URL('/', request.url))
	}

	try {
		const result = await query<Subscriber>(
			'DELETE FROM subscribers WHERE token = $1 RETURNING id, email',
			[token],
		)

		// Redirect to home with a message
		const redirectUrl = new URL('/', request.url)
		if (result.length > 0) {
			redirectUrl.searchParams.set('unsubscribed', 'true')
		} else {
			redirectUrl.searchParams.set('unsubscribed', 'not_found')
		}

		return NextResponse.redirect(redirectUrl)
	} catch (error) {
		console.error('Unsubscribe GET error:', error)
		return NextResponse.redirect(new URL('/?unsubscribed=error', request.url))
	}
}
