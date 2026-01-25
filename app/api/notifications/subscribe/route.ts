import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

// In a real app, you'd store subscriptions in your database
// For now, we'll use a simple in-memory store
const subscriptions = new Map<string, PushSubscription>();

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscription, userId } = await request.json();

    if (!subscription || !userId) {
      return NextResponse.json({ error: 'Missing subscription or userId' }, { status: 400 });
    }

    // Store the subscription (in production, save to database)
    subscriptions.set(userId, subscription);

    console.log(`Stored push subscription for user ${userId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing push subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Export subscriptions for use in other API routes
export { subscriptions };