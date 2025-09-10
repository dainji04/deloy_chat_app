import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { environment } from '../../../environments/environment';
import { User } from '../user/user';
import { ToastService } from '../toast/toast';

@Injectable({
  providedIn: 'root'
})
export class FirebaseMessagingService {
  private messaging: any;
  constructor(private userServices: User, private toastService: ToastService) {

    // Initialize Firebase
    const app = initializeApp(environment.firebase);
    this.messaging = getMessaging(app);
  }

  // Request notification permission and get token
  async requestPermissionAndGetToken(): Promise<any> {
    try {
      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        
        // Get FCM token
        const token = await getToken(this.messaging, {
          vapidKey: 'BI-OAyoDfPTlcsJIjsTbu5Wn81Cf8QTrfcznER6AX9I_IuJAw7LnvVljkv9g23O4-adAP8RX5_hWYW-FaXkgvBM'
        });
        
        if (token) {
          console.log('FCM Token:', token);
          this.userServices.saveFcmToken(token).subscribe({
            next: (response) => {
              console.log('FCM Token saved successfully:', response);
            },
            error: (error) => {
              console.error('Error saving FCM Token:', error);
            }
          });
        } else {
          console.log('No registration token available.');
        }
      } else {
        console.log('Notification permission denied.');
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
  }

  // Listen for foreground messages
  listenForMessages() {
    onMessage(this.messaging, (payload: any) => {
      console.log('Message received. ', payload);
      if (payload.data) {
        this.toastService.showInfo(`${payload.data.title || 'New Message'}`, payload.data.body);
      }
    });
  }
}
