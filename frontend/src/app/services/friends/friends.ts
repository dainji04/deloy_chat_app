import { Injectable } from '@angular/core';
import { Api } from '../api/api';

@Injectable({
  providedIn: 'root',
})
export class FriendService {
  constructor(private apiService: Api) {}

  getFriends() {
    return this.apiService.get('friends/list');
  }

  getFriendRequests() {
    return this.apiService.get('friends/requests');
  }

  addFriend(friendId: string) {
    return this.apiService.post('friends/add', { friendId });
  }

  acceptFriendRequest(friendId: string) {
    return this.apiService.post('friends/accept', { friendId });
  }

  unFriend(friendId: string) {
    return this.apiService.deleteWithData(`friends/unfriend`, { friendId });
  }
}
