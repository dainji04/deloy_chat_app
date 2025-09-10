import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  FormsModule,
  FormControl,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { Auth } from '../../services/auth/auth';
import { Router, RouterModule } from '@angular/router';
import { ClickOutside } from '../../directives/clickOutSide/click-outside';
import { debounceTime, finalize } from 'rxjs';
import { User } from '../../services/user/user';
import { SocketService } from '../../services/socket/socket-service';
import { FriendService } from '../../services/friends/friends';
import { Message } from '../../services/messages/message';
import { ToastService } from '../../services/toast/toast';

@Component({
  selector: 'app-search-user',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    ClickOutside,
  ],
  templateUrl: './search-user.html',
  styleUrl: './search-user.scss'
})
export class SearchUser {
  @Output() chatSelected = new EventEmitter<string>();

  searchForm: FormGroup = new FormGroup({
    email: new FormControl(''),
  });

  isShowSearchResult: boolean = false;
  isLoadingSearch: boolean = false;

  isProfile: boolean = false;
  isProfileDesktop: boolean = false;

  user: any = null;

  resultUser: any = null;

  // button state
  isChat: boolean = false;

  toggleSearch() {
    this.isShowSearchResult = !this.isShowSearchResult;
  }

  toggleProfile() {
    this.isProfile = !this.isProfile;
  }

  constructor(
    private authService: Auth,
    private userService: User,
    private socketService: SocketService,
    private router: Router,
    private friendService: FriendService,
    private messageService: Message,
    private toastService: ToastService
  ) {}
  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user') || 'null');

    this.searchForm
      .get('email')!
      .valueChanges.pipe(debounceTime(500)) // chờ 500ms sau khi ngừng gõ
      .subscribe(() => {
        this.onSearchInput();
      });
  }

  onSearchInput() {
    this.resultUser = null;
    this.isLoadingSearch = true;
    console.log(this.isLoadingSearch);
    this.userService.searchByEmail(this.searchForm.value.email)
    .pipe(
      finalize(() => {
        this.isLoadingSearch = false;
        console.log(this.isLoadingSearch);
      })
    )
    .subscribe({
      next: (response) => {
        this.resultUser = response.user;
      },
    });
  }

  isOwnProfile() {
    return (
      this.user && this.resultUser && this.user._id === this.resultUser._id
    );
  }

  isFriend() {
    if (!this.user || !this.resultUser || !this.user.friends) {
      return false;
    }

    let isFriend = false;

    for (let friend of this.user.friends) {
      if (friend._id === this.resultUser._id) {
        isFriend = true;
      }
    }

    return isFriend;
  }

  logout() {
    // Force disconnect và clear socket hoàn toàn
    this.socketService.forceDisconnect();
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Logout failed:', error);
      },
    });
  }

  addFriend() {
    this.friendService.addFriend(this.resultUser._id).subscribe({
      next: (response) => {
        this.toastService.showSuccess('Add Friend', 'Friend added successfully.');
      },
      error: (error) => {
        this.toastService.showInfo('Info', error.error.message);
      },
    });
  }

  getOrCreateConversation() {
    this.messageService.getOrCreateConversation(this.resultUser._id).subscribe({
      next: (response: any) => {
        this.chatSelected.emit(response.data.conversation._id);
        this.isShowSearchResult = false;
      },
      error: (error: any) => {
        this.toastService.showError('Error getting or creating conversation', error);
      },
    });
  }
}
