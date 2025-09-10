import { inject, Injectable } from '@angular/core';
import { SocketService } from '../socket/socket-service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideoCallService {
  private localStream!: MediaStream;
  private remoteStream: MediaStream = new MediaStream();
  private callConfigure = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  }
  private peerConnection!: RTCPeerConnection;
  private socketService = inject(SocketService);
  private currentRoomId: string = '';
  
  // Subjects to notify component about stream changes
  private remoteStreamSubject = new BehaviorSubject<MediaStream>(new MediaStream());
  public remoteStream$ = this.remoteStreamSubject.asObservable();

  setLocalStream(stream: MediaStream) {
    this.localStream = stream;
  }

  setRemoteStream(stream: MediaStream) {
    this.remoteStream = stream;
    this.remoteStreamSubject.next(stream);
  }

  getLocalStream(): MediaStream {
    return this.localStream;
  }

  getRemoteStream(): MediaStream {
    return this.remoteStream;
  }

  async getUserMedia() {
    try {
      // Request both video and audio
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.setLocalStream(this.localStream);
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      
      // Try with reduced constraints if the first attempt fails
      try {
        console.log('Retrying with basic constraints...');
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        this.setLocalStream(this.localStream);
        return this.localStream;
      } catch (fallbackError) {
        console.error('Fallback media access also failed:', fallbackError);
        throw fallbackError;
      }
    }
  }

  async joinRoom(roomId: string, userId: string) {
    try {
      this.currentRoomId = roomId;
      this.setUpPeerConnection(roomId);
      this.socketService.joinRoom(roomId, userId);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  }

  async setUpPeerConnection(roomId: string) {
    this.peerConnection = new RTCPeerConnection(this.callConfigure);

    // Add local stream tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }

    // Handle incoming remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('Received remote track');
      const [remoteStream] = event.streams;
      this.setRemoteStream(remoteStream);
    }

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate');
        this.socketService.sendIceCandidate(event.candidate, roomId);
      }
    }

    // Monitor connection state
    this.peerConnection.onconnectionstatechange = () => {
      console.log('Peer connection state changed:', this.peerConnection.connectionState);
      
      if (this.peerConnection.connectionState === 'failed') {
        console.log('Connection failed, attempting to restart ICE');
        this.peerConnection.restartIce();
      }
    };

    // Monitor ICE connection state
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state changed:', this.peerConnection.iceConnectionState);
      
      switch (this.peerConnection.iceConnectionState) {
        case 'connected':
          console.log('ICE connection established');
          break;
        case 'disconnected':
          console.log('ICE connection lost');
          break;
        case 'failed':
          console.log('ICE connection failed');
          break;
      }
    };

    // Monitor gathering state
    this.peerConnection.onicegatheringstatechange = () => {
      console.log('ICE gathering state changed:', this.peerConnection.iceGatheringState);
    };
  }

  async createOffer() {
    console.log('Creating offer...');
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      // Send offer to remote peer through socket
      this.socketService.sendOffer(offer, this.currentRoomId);
      console.log('Offer sent');
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }

  async handleOffer(offer: RTCSessionDescriptionInit) {
    console.log('Handling offer...');
    try {
      await this.peerConnection.setRemoteDescription(offer);
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      // Send answer to remote peer through socket
      this.socketService.sendAnswer(answer, this.currentRoomId);
      console.log('Answer sent');
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  async handleAnswer(answer: RTCSessionDescriptionInit) {
    console.log('Handling answer...');
    try {
      await this.peerConnection.setRemoteDescription(answer);
      console.log('Answer handled successfully');
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  async handleIceCandidate(candidate: RTCIceCandidateInit) {
    console.log('Handling ICE candidate...');
    try {
      await this.peerConnection.addIceCandidate(candidate);
      console.log('ICE candidate added successfully');
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  // Clean up resources
  cleanup() {
    console.log('Cleaning up video call resources...');
    
    // Stop all local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
    }

    // Reset streams
    this.setRemoteStream(new MediaStream());
    this.currentRoomId = '';
    
    console.log('Video call cleanup completed');
  }

  // Get current room ID
  getCurrentRoomId(): string {
    return this.currentRoomId;
  }

  // Get connection state
  getConnectionState(): string {
    return this.peerConnection ? this.peerConnection.connectionState : 'not-connected';
  }

  // Get ICE connection state
  getIceConnectionState(): string {
    return this.peerConnection ? this.peerConnection.iceConnectionState : 'not-connected';
  }

  // Toggle video
  toggleVideo(): boolean {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  // Toggle audio
  toggleAudio(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  // Check if video is enabled
  isVideoEnabled(): boolean {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      return videoTrack ? videoTrack.enabled : false;
    }
    return false;
  }

  // Check if audio is enabled
  isAudioEnabled(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      return audioTrack ? audioTrack.enabled : false;
    }
    return false;
  }
}
