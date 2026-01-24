import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface SNSMessage {
  Type: string;
  MessageId: string;
  Token?: string;
  TopicArn: string;
  Subject?: string;
  Message: string;
  SubscribeURL?: string;
  Timestamp: string;
}

interface SESBounceMessage {
  notificationType: 'Bounce';
  bounce: {
    bounceType: string;
    bouncedRecipients: Array<{ emailAddress: string }>;
  };
}

interface SESComplaintMessage {
  notificationType: 'Complaint';
  complaint: {
    complainedRecipients: Array<{ emailAddress: string }>;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const message: SNSMessage = JSON.parse(body);

    // Handle SNS subscription confirmation
    if (message.Type === 'SubscriptionConfirmation' && message.SubscribeURL) {
      // Confirm the subscription by visiting the URL
      await fetch(message.SubscribeURL);
      console.log('SNS subscription confirmed:', message.TopicArn);
      return NextResponse.json({ message: 'Subscription confirmed' });
    }

    // Handle actual notifications
    if (message.Type === 'Notification') {
      const sesMessage: SESBounceMessage | SESComplaintMessage = JSON.parse(message.Message);

      if (sesMessage.notificationType === 'Bounce') {
        // Handle bounce - remove email from subscribers
        const emails = sesMessage.bounce.bouncedRecipients.map(r => r.emailAddress);

        for (const email of emails) {
          await query(
            'DELETE FROM subscribers WHERE email = $1',
            [email.toLowerCase()]
          );
          console.log('Removed bounced email:', email);
        }
      }

      if (sesMessage.notificationType === 'Complaint') {
        // Handle complaint - remove email from subscribers
        const emails = sesMessage.complaint.complainedRecipients.map(r => r.emailAddress);

        for (const email of emails) {
          await query(
            'DELETE FROM subscribers WHERE email = $1',
            [email.toLowerCase()]
          );
          console.log('Removed complained email:', email);
        }
      }

      return NextResponse.json({ message: 'Notification processed' });
    }

    return NextResponse.json({ message: 'OK' });
  } catch (error) {
    console.error('SES webhook error:', error);
    // Return 200 anyway to prevent SNS from retrying
    return NextResponse.json({ error: 'Processing error' }, { status: 200 });
  }
}
