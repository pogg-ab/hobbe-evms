import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class PushNotificationSenderService {
  private readonly logger = new Logger(PushNotificationSenderService.name);

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase(): void {
    try {
      const serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url:
          process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });

      this.logger.log('Firebase initialized successfully');
    } catch (error) {
      this.logger.error('Error initializing Firebase', error.stack);
    }
  }

  async sendPushNotification(
    recipient: string,
    title: string,
    body: string,
    data?: any,
  ): Promise<boolean> {
    try {
      const message = {
        notification: {
          title: title,
          body: body,
        },
        token: recipient,
        data: data || {},
      };

      await admin.messaging().send(message);
      this.logger.log(`Push notification sent successfully to ${recipient}`);
      return true;
    } catch (error) {
      this.logger.error('Error sending push notification', error.stack);
      return false;
    }
  }
}
