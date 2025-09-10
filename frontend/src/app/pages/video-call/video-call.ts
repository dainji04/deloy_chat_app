import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoCallService } from '../../services/call-video/video-call';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../../services/socket/socket-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-video-call',
  imports: [CommonModule],
  templateUrl: './video-call.html',
  styleUrl: './video-call.scss'
})
export class VideoCall implements OnInit, OnDestroy {
  id: string = '';
  currentUser: any | null = null;
  isCallActive: boolean = false;
  isConnecting: boolean = false;
  isVideoEnabled: boolean = true;
  isAudioEnabled: boolean = true;
  connectionState: string = 'not-connected';

  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;
  private subscriptions: Subscription[] = [];

  constructor(
    private videoCallService: VideoCallService, 
    private route: ActivatedRoute, 
    private socketService: SocketService,
    private router: Router
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('roomId') || '';
    this.currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null;

    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.setupSocketListeners();
    this.setupRemoteStreamListener();

    this.startCall();
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private setupSocketListeners() {
    // Listen for user connected
    const userConnectedSub = this.socketService.onUserConnected().subscribe((userId) => {
      console.log('User connected:', userId);
      this.videoCallService.createOffer();
    });

    // Listen for offers
    const offerSub = this.socketService.onOffer().subscribe(async ({offer}) => {
      console.log('Received offer');
      await this.videoCallService.handleOffer(offer);
    });

    // Listen for answers
    const answerSub = this.socketService.onAnswer().subscribe(async ({answer}) => {
      console.log('Received answer');
      await this.videoCallService.handleAnswer(answer);
    });

    // Listen for ICE candidates
    const iceCandidateSub = this.socketService.onIceCandidate().subscribe(async ({candidate}) => {
      console.log('Received ICE candidate');
      await this.videoCallService.handleIceCandidate(candidate);
    });

    // Listen for user disconnected
    const userDisconnectedSub = this.socketService.onUserDisconnected().subscribe((userId) => {
      console.log('User disconnected:', userId);
      this.handleUserDisconnected();
    });

    this.subscriptions.push(userConnectedSub, offerSub, answerSub, iceCandidateSub, userDisconnectedSub);
  }

  private setupRemoteStreamListener() {
    // Listen for remote stream changes
    const remoteStreamSub = this.videoCallService.remoteStream$.subscribe((stream) => {
      if (this.remoteVideo && stream.getTracks().length > 0) {
        console.log('Setting remote stream');
        this.remoteVideo.nativeElement.srcObject = stream;
      }
    });

    this.subscriptions.push(remoteStreamSub);
  }

  async startCall() {
    try {
      this.isConnecting = true;
      console.log('Starting call...');

      // Get user media
      await this.videoCallService.getUserMedia();

      // Set local video
      const localStream = this.videoCallService.getLocalStream();
      if (this.localVideo && localStream) {
        this.localVideo.nativeElement.srcObject = localStream;
      }

      // Join room
      this.videoCallService.joinRoom(this.id, this.currentUser._id);
      
      this.isCallActive = true;
      this.isConnecting = false;
      console.log('Call started successfully');
    } catch (error) {
      console.error('Error starting call:', error);
      this.isConnecting = false;
      alert('Failed to start call. Please check your camera and microphone permissions.');
    }
  }

  stopCall() {
    try {
      console.log('Stopping call...');
      
      // Stop local video
      if (this.localVideo) {
        this.localVideo.nativeElement.srcObject = null;
      }
      
      // Stop remote video
      if (this.remoteVideo) {
        this.remoteVideo.nativeElement.srcObject = null;
      }

      // Cleanup video call service
      this.videoCallService.cleanup();
      
      this.isCallActive = false;
      console.log('Call stopped');
      
      // Navigate back or to home
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error stopping call:', error);
    }
  }

  private handleUserDisconnected() {
    console.log('Remote user disconnected');
    if (this.remoteVideo) {
      this.remoteVideo.nativeElement.srcObject = null;
    }
    // Optionally show a message to user
    alert('The other user has left the call');
  }

  private cleanup() {
    console.log('Cleaning up video call component...');
    
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    
    // Cleanup video call service
    this.videoCallService.cleanup();
    
    // Clear video elements
    if (this.localVideo) {
      this.localVideo.nativeElement.srcObject = null;
    }
    if (this.remoteVideo) {
      this.remoteVideo.nativeElement.srcObject = null;
    }
  }

  toggleVideo() {
    this.isVideoEnabled = this.videoCallService.toggleVideo();
  }

  toggleAudio() {
    this.isAudioEnabled = this.videoCallService.toggleAudio();
  }

  // Get connection status for display
  getConnectionStatus(): string {
    const state = this.videoCallService.getConnectionState();
    switch (state) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'failed':
        return 'Connection Failed';
      default:
        return 'Not Connected';
    }
  }
}
