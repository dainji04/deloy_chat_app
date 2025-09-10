import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Message } from '../../services/messages/message';
import { SocketService } from '../../services/socket/socket-service';
import { Subscription } from 'rxjs';
import { ClickOutside } from '../../directives/clickOutSide/click-outside';
import { Home } from '../home/home';
import { Groups } from '../../services/groups/groups';

import { ToastService } from '../../services/toast/toast';
import { ConfirmationService } from 'primeng/api';
import { User } from '../../services/user/user';
import { RouterLink } from '@angular/router';

// primeng
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import {Badge} from 'primeng/badge'
import { ModalImage } from "../../components/modal-image/modal-image";
import { BackgroundConversation } from "../../components/background-conversation/background-conversation";
import { background } from '../../model/background';
import { BgConversation } from '../../services/bg-conversation/bg-conversation';
interface formMedia {
  url: string;
  publicId: string;
  type: string;
  size: number;
}

@Component({
    selector: 'app-detail-message',
    imports: [CommonModule, FormsModule, ClickOutside, Home,
    ConfirmDialog, Dialog, ButtonModule, InputTextModule,
    RouterLink, Badge, ModalImage, BackgroundConversation],
    templateUrl: './detail-message.html',
    styleUrl: './detail-message.scss',
    providers: [ConfirmationService]
})
export class DetailMessage implements OnInit, OnChanges {
    @Input() id: string = '';
    @Input() conversation: any = {};
    @Output() closeDetail = new EventEmitter<void>();
    @Output() loadGroupEvent = new EventEmitter<void>(); // load when delete or leave

    @ViewChild('inputText') inputText!: ElementRef;
    @ViewChild('avatar') avatar!: ElementRef;
    @ViewChild('messagesList') messagesList!: ElementRef;
    @ViewChild('addUserInput') addUserInput!: ElementRef;

    isShowScrollBottom: boolean = false;

    messages: any[] = [];
    currentPage: number = 1;
    limit: number = 20;
    loadOldMessage: boolean = false; // infinities loading message
    loadMore: boolean = true; // still more messages to load

    newMessageText: string = '';
    currentUserId: string = '';

    isShowOptionMedia: boolean = false; // show options media to upload
    selectedFile: boolean = false;
    file: File | null = null;

    formMedia: formMedia | null = null; // save media from response when uploaded
    isUploading: boolean = false;

    isShowSideBar: boolean = false;

    private receiveSub!: Subscription; // listen receive new messages

    replyToMessage: string = '';
    replyToMessageId: string = '';

    isShowMember: boolean | null= null;
    isShowMedia: boolean | null = null;
    listMedia: any[] = [];
    loadingInOption: boolean = false; // loading when user click show member or media

    userIdShowOption: string | null = null; // id to show option: remove, moderator, regular user

    isUploadAvatarGroup: boolean = false;
    fileAvatarGroup: File | null = null;
    currentObjectURL: string | null = null; // preview avatar group

    isShowAddMember: boolean = false;
    listMemberAddToGroup: any[] = []; // list member add to group

    isShowDialogImage:boolean = false;
    currentImageUrl: string = ''; // show current image in dialog

    constructor(
        private messageService: Message,
        private socketService: SocketService,
        private groupService: Groups,
        private toastService: ToastService,
        private userService: User,
        private confirmationService: ConfirmationService,
        private backgroundService: BgConversation
    ) {
        // Get current user ID from localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        this.currentUserId = user._id || '';

        window.addEventListener('beforeunload', () => {
            this.socketService.leaveConversation(this.id);
            this.receiveSub?.unsubscribe();
            console.log('Left conversation and unsubscribed from messages');
        });
    }

    ngOnInit() {
        this.socketService.joinConversation(this.id!);

        this.loadMessages();

        // Lắng nghe tin nhắn từ server
        this.receiveSub = this.socketService
            .listen<any>('receive_message')
            .subscribe(async (data) => {
                if(data.conversationId === this.id && !this.messages.includes(data.message)) {
                    this.messages.push(data.message);
                }
                setTimeout(() => {
                    this.scrollToBottom();
                }, 300);
            });
    }

    // load messages if id changes
    ngOnChanges(changes: SimpleChanges): void {
        this.socketService.joinConversation(this.id!);

        if (changes['id']) {
            this.deleteOldImage();
            this.messages = [];
            this.id = changes['id'].currentValue;
            this.loadMessages();
            this.isShowMember = null;
            this.isShowMedia = null;
            this.listMedia = [];
            this.file = null;
            this.currentPage = 1; // reset current page when id changes
            this.loadMore = true; // reset load more when id changes
            this.formMedia = null;
            this.formMedia = null;

            // revoke old object URL
            if (this.currentObjectURL) {
                URL.revokeObjectURL(this.currentObjectURL);
            }
        }
    }

    loadMessages() {
        if (this.id != '') {
            this.loadOldMessage = true;
            this.messageService.getConversationById(this.id!).subscribe({
                next: (data) => {
                    this.messages = data.data;
                    this.inputText.nativeElement.focus();
                    setTimeout(() => {
                        this.scrollToBottom();
                    }, 100);
                },
                error: (error) => {
                    console.error('Error fetching conversation:', error);
                },
            });
        }
    }

    // listen scroll top to load more messages
    onScroll() {
        if (this.loadMore) {
            const messagesList = this.messagesList.nativeElement;
            if (!messagesList || this.loadOldMessage) return;
            const scrollTop = messagesList.scrollTop;
            const threshold = 100; // Load more messages when scrolled to the top 100px

            // Load more messages if scrolled to the top
            if (scrollTop < threshold) {
                this.loadMoreMessages();
            }
        }
        // Show button scroll bottom when scroll
        this.showButtonScrollBottom();
    }

    loadMoreMessages() {
        this.loadOldMessage = true;
        this.currentPage++;
        this.messageService.loadMoreMessages(this.id, this.currentPage, this.limit).subscribe({
            next: (data) => {
                this.messages = [...data.data, ...this.messages];
                this.loadOldMessage = false;
                if(data.pagination.hasMore == false) {
                    this.loadMore = false; // stop loading more if error
                }
            },
            error: (error) => {
                console.error('Error loading more messages:', error);
                this.loadOldMessage = false;
                this.loadMore = false; // stop loading more if error
            },
        });
    }

    getMediaInConversation() {
        if(!this.isShowMedia) {
            this.isShowMedia = true;
            this.loadingInOption = true;
            this.messageService.getMediaInConversation(this.id).subscribe({
                next: (data) => {
                    this.listMedia = data.data;
                    this.loadingInOption = false;
                },
                error: (error) => {
                    console.error('Error fetching media:', error);
                    this.loadingInOption = false;
                },
            });
        } else {
            this.loadingInOption = false;
            this.isShowMedia = false;
        }
    }

    showButtonScrollBottom() {
        let messagesList = this.messagesList.nativeElement;
        if (!messagesList) return;
        const scrollHeight = messagesList.scrollHeight; // Chiều dài toàn bộ
        const clientHeight = messagesList.clientHeight; // Chiều dài hiển thị
        const scrollTop = messagesList.scrollTop; // Vị trí cuộn
        this.isShowScrollBottom = scrollHeight - clientHeight > scrollTop + 100; // hiển thị nút cuộn 100
    }

    scrollToBottom() {
        const bottomMessages = document.querySelector('#bottom');
        bottomMessages?.scrollIntoView({ behavior: 'smooth' });

        setTimeout(() => {
            this.loadOldMessage = false;
        }, 1000);
    }

    // back to conversation pages in mobile
    goBack(): void {
        this.closeDetail.emit();
    }

    // check is own to render UI
    isOwnMessage(message: any): boolean {
        return message.sender._id === this.currentUserId;
    }

    // open media modal
    openImageModal(imageUrl: string): void {
        this.currentImageUrl = imageUrl;
        this.isShowDialogImage = true;
    }

    // Message
    sendMessage(): void {
        if (this.isUploading) {
            this.toastService.showInfo('File Upload', 'File is uploading, please wait a moment.');
            return;
        }
        if (!this.newMessageText.trim() && !this.formMedia) return;

        const messageData: any = {
            conversationId: this.id,
            content: this.newMessageText || '',
        };

        if (this.formMedia) {
            messageData.media = this.formMedia;
            messageData.type = this.formMedia.type;
        }

        if (this.replyToMessage != '' && this.replyToMessageId != '') {
            messageData.replyTo = this.replyToMessageId;
        }

        console.log('Sending message:', messageData);

        this.socketService.sendMessage(messageData);

        this.newMessageText = '';
        this.formMedia = null;
        this.file = null;
        this.replyToMessage = '';
        this.replyToMessageId = '';
    }

    // reply to message
    setReplyToMessage(message: any) {
        this.replyToMessage = message.content.text;
        this.replyToMessageId = message._id;
        this.inputText.nativeElement.focus();
    }

    toggleUploadAvatarGroup($event: any): void {
        $event.stopPropagation();
        this.isUploadAvatarGroup = !this.isUploadAvatarGroup;
    }

    // upload avatar group
    onFileGroupSelected($event: any): void {
        const files = $event.target.files;
    
        // Check if files exist
        if (!files || files.length === 0) {
            return;
        }
        
        const file = files[0];
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            this.toastService.showError('File Upload', 'Invalid file type. Please select a valid image file (JPEG, PNG, WebP).');
            return;
        }
        
        // Validate file size (ví dụ: max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            this.toastService.showError('File Upload', 'File is too large. Please select a file smaller than 5MB.');
            return;
        }
        
        // Revoke previous object URL to prevent memory leak
        if (this.currentObjectURL) {
            URL.revokeObjectURL(this.currentObjectURL);
        }
        
        // Create new object URL
        this.fileAvatarGroup = file;
        this.currentObjectURL = URL.createObjectURL(file);
        
        if (this.avatar?.nativeElement) {
            this.avatar.nativeElement.src = this.currentObjectURL;
        }
    }

    uploadAvatarGroup() {
        this.groupService.uploadAvatarGroup(this.fileAvatarGroup!, this.id).subscribe({
            next: (res) => {
                this.toastService.showSuccess('Upload Avatar', 'Avatar uploaded successfully.');
                this.loadGroupEvent.emit();
                this.isUploadAvatarGroup = false;
            },
            error: (err) => {
                this.toastService.showError('Upload Avatar', err.error.message);
                console.log('err: ', err);
            },
        });
    }

    onFileSelected($event: any, type: string): void {
        this.selectedFile = true;
        this.file = $event.target.files[0];
        if (this.file) {
            this.upload();
            this.isShowOptionMedia = false;
        }
    }

    upload() {
        this.isUploading = true;
        if (!this.file) {
            this.isUploading = false;
            return;
        }

        const formData = new FormData();
        formData.append('file', this.file);
        formData.append('conversationId', this.id);

        if (this.formMedia) {
            this.deleteOldImage(); // delete old image and file = null
        }

        this.messageService.uploadMedia(formData).subscribe({
            next: (res: any) => {
                this.formMedia = res.data.media;
                this.isUploading = false;
            },
            error: (err: any) => {
                if (err.status == 500) {
                    this.toastService.showError('File Upload', 'File is too large. Please select a file smaller than 50MB.');
                } else {
                    this.toastService.showError('File Upload', err.error.message);
                }
                this.isUploading = false;
                this.file = null;
            },
        });
    }

    deleteOldImage() {
        if (this.formMedia) {
            this.messageService.deleteMedia(this.formMedia.publicId).subscribe({
                next: (res) => {
                    console.log('Delete old image successfully');
                },
                error: (err) => {
                    console.log('err: ', err);
                },
            });
            this.file = null;
            this.formMedia = null;
        }
    }

    // show Dialog add member to group
    showDialogAddMember() {
        this.isShowAddMember = !this.isShowAddMember;
        if (this.isShowAddMember) {
            this.inputText.nativeElement.focus();
        }
    }

    // search by id and add it into list member add to group
    searchAndAddMemberById(event: KeyboardEvent) {
        if(event.key === 'Enter') {
            console.log('key press');
            const email = this.addUserInput.nativeElement.value;
            this.searchUserById(email);
        }
    }
    
    searchUserById(email: string) {
        this.userService.searchByEmail(email).subscribe({
            next: (res) => {
                console.log(res.user);
                if (res.user) {
                    // Check if user already exists in the list
                    const exists = this.listMemberAddToGroup.some(member => member._id === res.user._id);
                    const existingInGroup = this.conversation.participants.some((p: any) => p._id === res.user._id);
                    if (!exists && !existingInGroup) {
                        this.listMemberAddToGroup.push(res.user);
                        this.addUserInput.nativeElement.value = ''; // Clear input after adding
                    } else {
                        this.toastService.showInfo('User Already Added', 'This user is already in the list or group.');
                    }
                } else {
                    this.toastService.showError('User Not Found', 'No user found with this email.');
                }
            },
            error: (err) => {
                this.toastService.showError('User Not Found', 'No user found with this email.');
            }
        })
    }
    
    // remove member from list
    removeMemberFromListAddToGroup(index: number) {
        this.listMemberAddToGroup.splice(index, 1);
    }

    // save member to group
    saveMemberToGroup() {
        if (this.listMemberAddToGroup.length > 0) {
            const participantIds = this.listMemberAddToGroup.map((member) => member._id);
            this.groupService.addMembersToGroup(participantIds, this.id).subscribe({
                next: (res) => {
                    this.toastService.showSuccess('Add Members', 'Members have been added to the group successfully.');
                    this.conversation.participants.push(...this.listMemberAddToGroup);
                    this.listMemberAddToGroup = [];
                },
                error: (err) => {
                    this.toastService.showError('Add Members', err.error.message);
                    console.log('err: ', err);
                    this.listMemberAddToGroup = []; // clear list if error
                },
            });
            this.isShowAddMember = false; // close dialog after saving
        } else {
            this.toastService.showInfo('Add Members', 'No members to add.');
        }
    }

    // member in group: options
    checkPermissionToShowOption(): boolean {
        if (this.currentUserId === this.conversation.admin) {
            return true;
        } 
        if (this.conversation.moderators.includes(this.currentUserId)) {
            return true;
        }

        return false;
    }

    setUserIdShowOption(userId: string | null) {
        if(this.userIdShowOption) {
            this.userIdShowOption = null;
        } else {
            this.userIdShowOption = userId;
        }
    }

    // upgrade user to moderator
    upgradeUserToModerator(userId: string) {
        this.groupService.upgradeUserToModerator(userId, this.id).subscribe({
            next: (res) => {
                this.toastService.showSuccess('Upgrade User', 'User has been upgraded to moderator successfully.');
                this.loadGroupEvent.emit();
                this.userIdShowOption = null;
                this.conversation.moderators.push(userId);
            },
            error: (err) => {
                this.toastService.showError('Upgrade User', err.error.message);
                console.log('err: ', err);
            },
        });
    }

    // downgrade moderator to regular user
    downgradeModeratorToRegularUser(userId: string) {
        this.groupService.downgradeModeratorToRegularUser(userId, this.id).subscribe({
            next: (res) => {
                this.toastService.showSuccess('Downgrade User', 'User has been downgraded to regular user successfully.');
                this.loadGroupEvent.emit();
                this.userIdShowOption = null;
                this.conversation.moderators = this.conversation.moderators.filter(
                    (m: any) => m !== userId
                );
            },
            error: (err) => {
                this.toastService.showError('Downgrade User', err.error.message);
                console.log('err: ', err);
            },
        });
    }

    // confirm remove user with primeng
    removeUserConfirm(event: Event, member: any) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: `Are you sure you want to remove ${member.username} from the group?`,
            header: 'Remove User',
            icon: 'pi pi-info-circle',
            rejectLabel: 'Cancel',
            rejectButtonProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true,
            },
            acceptButtonProps: {
                label: 'Delete',
                severity: 'danger',
            },

            accept: () => {
                this.removeUser(member._id);
            },
        });
    }

    removeUser(userId: string) {
        this.groupService.removeUser(userId, this.id).subscribe({
            next: (res) => {
                this.toastService.showSuccess('Remove User', 'User has been removed successfully.');
                this.loadGroupEvent.emit();
                this.userIdShowOption = null;
                this.conversation.participants = this.conversation.participants.filter((p: any) => p._id !== userId);
            },
            error: (err) => {
                this.toastService.showError('Remove User', err.error.message);
                console.log('err: ', err);
            },
        });
    }
    
    // confirm delete group with primeng
    deleteGroupConfirm(event: Event) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: `Do you want to delete this group?`,
            header: 'Delete Group',
            icon: 'pi pi-info-circle',
            rejectLabel: 'Cancel',
            rejectButtonProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true,
            },
            acceptButtonProps: {
                label: 'Delete',
                severity: 'danger',
            },

            accept: () => {
                this.deleteGroup();
            },
        });
    }

    // Group
    deleteGroup() {
        this.groupService.deleteGroup(this.id).subscribe({
            next: (res) => {
                this.toastService.showSuccess('Delete Group', 'Group has been deleted successfully.');
                this.loadGroupEvent.emit();
                this.goBack();
            },
        });
    }

    // confirm leave group with primeng
    leaveGroupConfirm(event: Event) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: `Do you want to leave this group?`,
            header: 'Leave Group',
            icon: 'pi pi-info-circle',
            rejectLabel: 'Cancel',
            rejectButtonProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true,
            },
            acceptButtonProps: {
                label: 'Delete',
                severity: 'danger',
            },

            accept: () => {
                this.leaveGroup();
            },
        });
    }

    leaveGroup() {
        this.groupService.leaveGroup(this.id).subscribe({
            next: (res) => {
                this.toastService.showSuccess('Leave Group', 'You have left the group successfully.');
                this.loadGroupEvent.emit();
                this.goBack();
            },
            error: (err) => {
                this.toastService.showError('Leave Group', err.error.message);
                console.log('err: ', err);
            },
        });
    }

    changeBackground(background: background) {
        this.backgroundService.changeBackground(this.id, background._id).subscribe({
            next: (res) => {
                this.toastService.showSuccess('Change Background', 'Background has been changed successfully.'); 
                this.conversation.background = background;
            },
            error: (err) => {
                this.toastService.showError('Change Background', err.error.message);
                console.log('err: ', err);
            }
        });
    }

    ngOnDestroy() {
        this.socketService.leaveConversation(this.id);
        this.receiveSub?.unsubscribe();
        this.deleteOldImage();
        this.formMedia = null;
        this.file = null;
        console.log('clean all from detail messages');
        this.isShowMember = false;
        this.isShowMedia = false;
        this.listMedia = [];

        // revoke old object URL
        if (this.currentObjectURL) {
            URL.revokeObjectURL(this.currentObjectURL);
        }

        this.currentPage = 1;
    }
}
