import { Injectable } from '@angular/core';
import { Api } from '../api/api';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Message {
  constructor(private api: Api) {}

  // Get all messages
  getAllConversations(): Observable<any[]> {
    return this.api.get<any[]>('messages');
  }

  getConversationById(conversationId: string): Observable<any> {
    return this.api.get<any>(`messages/${conversationId}`);
  }

  loadMoreMessages(conversationId: string, page: number, limit: number): Observable<any> {
    return this.api.get<any>(`messages/${conversationId}?page=${page}&limit=${limit}`);
  }

  // Send a message
  sendMessage(messageData: any): Observable<any> {
    return this.api.post<any>('messages/send-message', messageData);
  }

  //upload media
  uploadMedia(formData: FormData): Observable<any> {
    return this.api.post('messages/upload', formData);
  }

  // delete media
  deleteMedia(publicId: string): Observable<any> {
    return this.api.deleteWithData('messages/delete', { publicId });
  }

  // get or create conversation
  getOrCreateConversation(userId: string): Observable<any> {
    return this.api.post<any>('messages/conversations', {
      userId,
    });
  }

  getMediaInConversation(conversationId: string): Observable<any> {
    return this.api.get<any>(`messages/${conversationId}/media`);
  }
}
