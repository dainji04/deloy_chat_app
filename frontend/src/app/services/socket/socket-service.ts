import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { Token } from '../token/token';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket | null = null;

  constructor(private token: Token) {
    this.initializeSocket();
  }

  private initializeSocket() {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(environment.socketUrl, {
      auth: {
        token: this.token.getAccessToken(),
      },
      withCredentials: true,
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to socket server', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from socket server');
    });
  }

  // Phương thức để reconnect với token mới
  reconnectWithNewToken() {
    console.log('🔄 Reconnecting socket with new token...');

    // Disconnect hoàn toàn socket cũ
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    // Khởi tạo socket mới với token mới
    this.initializeSocket();
  }

  // Thêm method để force disconnect
  forceDisconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 Socket force disconnected and cleaned');
    }
  }

  listen<T = any>(event: string): Observable<T> {
    return new Observable((subscriber) => {
      if (this.socket) {
        this.socket.on(event, (data: T) => {
          subscriber.next(data);
        });
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('Disconnected from socket server');
    }
  }

  connect() {
    if (this.socket) {
      this.socket.connect();
      console.log('Reconnected to socket server');
    }
  }

  joinConversation(conversationId: string) {
    console.log(`Joining conversation: ${conversationId}`);
    if (this.socket) {
      this.socket.emit('join_conversation', conversationId);
    }
  }

  leaveConversation(conversationId: string) {
    if (this.socket) {
      this.socket.emit('leave_conversation', conversationId);
      console.log(`Left conversation: ${conversationId}`);
    }
  }

  sendMessage(data: {
    conversationId: string;
    content: string;
    type?: string;
    media?: any;
    replyTo?: string;
  }) {
    if (this.socket) {
      this.socket.emit('send_message', data);
    }
  }

  // video call
  // Join room
  joinRoom(roomId: string, userId: string): void {
    this.socket?.emit('join-room', roomId, userId);
  }

  // Listen for user connected
  onUserConnected(): Observable<string> {
    return new Observable(observer => {
      this.socket?.on('user-connected', (userId: string) => {
        observer.next(userId);
      });
    });
  }

  // Listen for user disconnected
  onUserDisconnected(): Observable<string> {
    return new Observable(observer => {
      this.socket?.on('user-disconnected', (userId: string) => {
        observer.next(userId);
      });
    });
  }

  // WebRTC signaling events
  sendOffer(offer: RTCSessionDescriptionInit, roomId: string): void {
    this.socket?.emit('offer', offer, roomId);
  }

  onOffer(): Observable<{offer: RTCSessionDescriptionInit, socketId: string}> {
    console.log('called')
    return new Observable(observer => {
      this.socket?.on('offer', (offer: RTCSessionDescriptionInit, socketId: string) => {
        observer.next({offer, socketId});
      });
    });
  }

  sendAnswer(answer: RTCSessionDescriptionInit, roomId: string): void {
    this.socket?.emit('answer', answer, roomId);
  }

  onAnswer(): Observable<{answer: RTCSessionDescriptionInit, socketId: string}> {
    return new Observable(observer => {
      this.socket?.on('answer', (answer: RTCSessionDescriptionInit, socketId: string) => {
        observer.next({answer, socketId});
      });
    });
  }

  sendIceCandidate(candidate: RTCIceCandidateInit, roomId: string): void {
    this.socket?.emit('ice-candidate', candidate, roomId);
  }

  onIceCandidate(): Observable<{candidate: RTCIceCandidateInit, socketId: string}> {
    return new Observable(observer => {
      this.socket?.on('ice-candidate', (candidate: RTCIceCandidateInit, socketId: string) => {
        observer.next({candidate, socketId});
      });
    });
  }
}
