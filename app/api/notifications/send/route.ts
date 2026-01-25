import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import webpush from 'web-push';
import { subscriptions } from '../subscribe/route';

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:your-email@example.com', // Replace with your email
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, excludeUserId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const payload = JSON.stringify({
      title: 'Birrapp 🍺',
      body: message,
      icon: '/icon-192.png',
      badge: '/icon-192.png'
    });

    // Send notifications to all subscribed users except the one who triggered it
    const promises: Promise<any>[] = [];
    
    for (const [userId, subscription] of subscriptions.entries()) {
      if (userId !== excludeUserId) {
        promises.push(
          webpush.sendNotification(subscription as any, payload)
            .catch(error => {
              console.error(`Failed to send notification to user ${userId}:`, error);
              // Remove invalid subscriptions
              if (error.statusCode === 410) {
                subscriptions.delete(userId);
              }
            })
        );
      }
    }

    await Promise.all(promises);

    return NextResponse.json({ 
      success: true, 
      sentTo: subscriptions.size - (excludeUserId ? 1 : 0)
    });
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}