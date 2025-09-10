import { Injectable } from '@angular/core';
import { Api } from '../api/api';
import { Observable } from 'rxjs';

interface group {
  name: string;
  description: string;
  participantIds: string[];
  avatar?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Groups {
  constructor(private apiService: Api) {}

  createGroup(data: group): Observable<any> {
    return this.apiService.post('groups/create', {
      ...data,
    });
  }

  uploadGroupAvatar(groupId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('groupId', groupId);
    return this.apiService.put('groups/upload-avatar', formData);
  }

  deleteGroup(groupId: string): Observable<any> {
    return this.apiService.deleteWithData('groups/delete', { groupId });
  }

  leaveGroup(groupId: string): Observable<any> {
    return this.apiService.put('groups/leave', { groupId });
  }

  uploadAvatarGroup(file: File, groupId: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('groupId', groupId);
    return this.apiService.put('groups/upload-avatar', formData);
  }

  upgradeUserToModerator(userId: string, groupId: string): Observable<any> {
    return this.apiService.put(`groups/promote`, { userId, groupId });
  }

  downgradeModeratorToRegularUser(userId: string, groupId: string): Observable<any> {
    return this.apiService.put(`groups/demote`, { userId, groupId });
  }

  removeUser(userId: string, groupId: string): Observable<any> {
    return this.apiService.put(`groups/remove-members`, { groupId, removeMemberId: userId });
  }

  addMembersToGroup(participantIds: string[], groupId: string): Observable<any> {
    return this.apiService.put(`groups/add-members`, { participantIds, groupId });
  }
}