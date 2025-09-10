import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Message } from '../../services/messages/message';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DetailMessage } from '../detail-message/detail-message';
import { ClickOutside } from '../../directives/clickOutSide/click-outside';
import { FriendService } from '../../services/friends/friends';
import { Groups } from '../../services/groups/groups';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../../services/user/user';
import { ToastService } from '../../services/toast/toast';
import { SocketService } from '../../services/socket/socket-service';
import { SearchUser } from "../../components/search-user/search-user";
import { Subscription } from 'rxjs';
import { conversation } from '../../model/conversation';
import { lastMessage } from '../../model/lastMessage';

interface group {
  name: string;
  description: string;
  participantIds: string[];
  avatar?: string;
}

interface receiveMessageData {
  conversationId: string;
  message: lastMessage;
}

@Component({
  selector: 'app-messages',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DetailMessage,
    ClickOutside,
    ReactiveFormsModule,
    SearchUser
],
  templateUrl: './messages.html',
  styleUrl: './messages.scss',
})
export class Messages implements OnInit, OnDestroy {
  @ViewChild('detail') detailElement: any;
  @ViewChild('message') messageElement: any;
  private receiveSub!: Subscription; // listen receive new messages
  
  messages: conversation[] = [];
  selectedMessageId: string = '';
  isDetailOpen: boolean = false;
  detailConversation: any = {};

  // create group chat
  isShowCreateOptions: boolean = false;
  isShowCreateGroupBox: boolean = false;
  listFriends: any[] = [];
  formGroupChat: group = {
    name: '',
    description: 'default desc',
    participantIds: [],
  };
  file!: File;
  isCreatingGroup: boolean = false;
  // search user
  isSearching: boolean = false;
  searchForm: FormGroup = new FormGroup({
    email: new FormControl(''),
  });

  private beforeUnloadListener?: () => void;

  constructor(
    private messageService: Message,
    private friendServices: FriendService,
    private groupServices: Groups,
    private userServices: User,
    private toastService: ToastService,
    private socketService: SocketService
  ) { }

  ngOnInit(): void {
    this.fetchMessages();

    this.beforeUnloadListener = () => {
      this.cleanup();
    };

    window.addEventListener('beforeunload', this.beforeUnloadListener);

    this.receiveSub = this.socketService
            .listen<any>('receive_message')
            .subscribe(async (data) => {
              this.updateConversationsWhenReceiveMessage(data);
            });
  }

  updateConversationsWhenReceiveMessage(data: receiveMessageData) {
    const convUpdate = this.messages.find((conv) => conv._id === data.conversationId);
    convUpdate!.lastMessage = {
      content: data.message.content,
      createdAt: data.message.createdAt,
      sender: data.message.sender,
      _id: data.message._id
    };

    // Đưa convUpdate lên đầu mảng
    this.messages = [
      convUpdate!,
      ...this.messages.filter((conv) => conv._id !== data.conversationId),
    ];
  }

  setChat(id: string) {
    this.selectedMessageId = id;
  }

  private cleanup() {
    // Gộp tất cả cleanup logic vào 1 hàm
    document.body.classList.remove('detail-message-open');
    this.leaveGroup();
  }

  fetchMessages() {
    this.messageService.getAllConversations().subscribe((data: any) => {
      this.messages = data.data;
    });
  }

  showCreateOptions() {
    this.isShowCreateOptions = !this.isShowCreateOptions;
  }

  showCreateGroupBox() {
    this.isShowCreateGroupBox = !this.isShowCreateGroupBox;
    if (this.listFriends.length === 0) {
      this.friendServices.getFriends().subscribe({
        next: (res: any) => {
          this.listFriends = res.friends;
        },
      });
    }
  }

  selectMessage(message: any) {
    if(this.selectedMessageId !== message._id && this.selectedMessageId !== '') {
      this.socketService.leaveConversation(this.selectedMessageId);
    }

    // Navigate to the detail message component with the selected message ID
    this.selectedMessageId = message._id;
    this.detailConversation = message;
    this.isDetailOpen = true;

    this.enterGroup();

    // Add class to prevent body scroll
    document.body.classList.add('detail-message-open');

    // Show detail with animation
    this.detailElement.nativeElement.classList.add('show');
    setTimeout(() => {
      this.messageElement.nativeElement.classList.add('hide');
    }, 100);
  }

  closeDetail() {
    this.isDetailOpen = false;

    // Remove class to restore body scroll
    document.body.classList.remove('detail-message-open');

    // Hide detail with animation
    this.messageElement.nativeElement.classList.remove('hide');
    this.detailElement.nativeElement.classList.remove('show');

    // Clear selected message after animation
    setTimeout(() => {
      this.selectedMessageId = '';
      this.detailConversation = {};
      this.leaveGroup();
    }, 300);
  }

  enterGroup() {
    this.userServices.enterGroup().subscribe({
      next: (res) => {
        console.log('User entered group:', res);
      },
      error: (err) => {
        console.error('Error entering group:', err);
      },
    });
  }

  leaveGroup() {
    this.userServices.leaveGroup().subscribe({
      next: (res) => {
        console.log('User left group:', res);
      },
      error: (err) => {
        console.error('Error leaving group:', err);
      },
    });
  }

  toggleMember(id: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    let mem = this.formGroupChat.participantIds;

    if (checked) {
      // Thêm vào nếu chưa có
      if (!mem.includes(id)) {
        mem.push(id);
      }
    } else {
      // Xoá ra
      this.formGroupChat.participantIds = mem.filter(
        (memberId) => memberId !== id
      );
    }
  }

  createGroup() {
    this.isCreatingGroup = true;
    this.groupServices.createGroup(this.formGroupChat).subscribe({
      next: async (res: any) => {
        if (this.file) {
          await this.onUpload(res.data.group._id);
        }
        this.isCreatingGroup = false;
        this.isShowCreateGroupBox = false;
        this.fetchMessages();
        this.toastService.showSuccess('Create Group', 'Group has been created successfully.');
      },
      error: (err: HttpErrorResponse) => {
        this.toastService.showError('Create Group', err.error.message);
        this.isCreatingGroup = false;
      },
    });
  }

  onFileSelected($event: any): void {
    this.file = $event.target.files[0];
  }

  onUpload(groupId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.groupServices.uploadGroupAvatar(groupId, this.file).subscribe({
        next: (res) => {
          this.toastService.showSuccess('Upload Avatar Group', 'Avatar group has been uploaded successfully.');
          resolve();
        },
        error: (err) => {
          reject(err);
        },
      });
    });
  }

  ngOnDestroy() {
    // Clean up body class when component is destroyed
    this.cleanup();

    // Remove event listener để tránh memory leak
    if (this.beforeUnloadListener) {
      window.removeEventListener('beforeunload', this.beforeUnloadListener);
    }
  }
}
