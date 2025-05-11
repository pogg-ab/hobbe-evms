import * as dotenv from 'dotenv';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import * as fs from 'fs';

// Load environment variables from .env file
dotenv.config();

// Read the Firebase service account JSON from the file path specified in .env
const serviceAccount: ServiceAccount = JSON.parse(
  fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8'),
);

// Initialize Firebase Admin with the service account credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://hobbe-df707-default-rtdb.firebaseio.com/',
});

// Export the Firebase Database instance
export const firebaseDatabase = admin.database();
export const firebaseMessaging = admin.messaging();
