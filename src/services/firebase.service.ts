import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FirebaseService {
  constructor() {
    if (!admin.apps.length) {
      const serviceAccountPath = path.join(process.cwd(), 'config', 'smartpaw-be099-firebase-adminsdk-fbsvc-6deebf5c54.json');
      
      if (!fs.existsSync(serviceAccountPath)) {
        throw new Error('Firebase service account file not found. Please check the config directory.');
      }

      const serviceAccount = require(serviceAccountPath);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  }

  async sendNotification(fcmToken: string, title: string, body: string) {
    try {
      const message = {
        notification: {
          title,
          body,
        },
        token: fcmToken,
      };

      const response = await admin.messaging().send(message);
      console.log('Successfully sent notification:', response);
      return response;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }
} 