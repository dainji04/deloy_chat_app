import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FirebaseMessagingService } from './services/firebase/firebase-messaging';
import { ToastComponent } from "./components/toast/toast";
import { SocketService } from './services/socket/socket-service';
import { IncomingCall } from "./components/receive-call/incoming-call";
import { Theme } from './services/theme/theme';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, IncomingCall],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  isHaveAnIncomingCall: boolean = false;
  private receiveCallSub: any;
  dataIncomingCall: any;
  
  constructor(private firebaseMessaging: FirebaseMessagingService,
              private socketService: SocketService,
              private themeService: Theme
  ) {
    window.addEventListener('beforeunload', () => {
          this.receiveCallSub?.unsubscribe();
        });
  }

  ngOnInit() {
    this.themeService.loadTheme();

    this.initializeFirebaseMessaging();

    this.receiveCallSub = this.socketService
            .listen<any>('receive-call')
            .subscribe(async (data) => {
                console.log('Incoming call data:', data);
                this.dataIncomingCall = data;
                this.isHaveAnIncomingCall = true;
            });
  }

  async initializeFirebaseMessaging() {
    console.log('Initializing Firebase Messaging...');
    
    // Request permission and get token
    const token = await this.firebaseMessaging.requestPermissionAndGetToken();
    
    if (token) {
      console.log('FCM Token received:', token);
    }
    
    // Start listening for foreground messages
    this.firebaseMessaging.listenForMessages();
  }
}
