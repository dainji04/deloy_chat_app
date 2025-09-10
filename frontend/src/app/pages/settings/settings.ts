import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { User } from '../../services/user/user';
import { Auth } from '../../services/auth/auth';
import { debounceTime } from 'rxjs';
import {ShowErrorValidate} from '../../components/show-error-validate/show-error-validate';
import { ToastService } from '../../services/toast/toast';

@Component({
  selector: 'app-settings',
    imports: [ReactiveFormsModule, ReactiveFormsModule, ShowErrorValidate],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings implements OnInit {
  user: any = {};
  formData!: FormGroup;
  errorInfo!: string;
  errorAvatar!: string;
  errorConfirmPassword!: boolean;
  isSendingEmail: boolean = false;

  selectedFile: boolean = false;
  uploading: boolean = false;
  file!: File;

  formChangePassword!: FormGroup;

  constructor(
    private userService: User,
    private authService: Auth,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');

    this.formData = this.fb.group({
      username: [
        this.user.username || '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(10),
        ],
      ],
      firstName: [
        this.user.firstName || '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(10),
        ],
      ],
      lastName: [
        this.user.lastName || '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(10),
        ],
      ],
      bio: [this.user.bio || '', [Validators.maxLength(200)]],
      phone: [
        this.user.phone || '',
        [Validators.pattern(/^\d{9,11}$/)],
      ],
      dateOfBirth: [
        this.user.dateOfBirth
          ? new Date(this.user.dateOfBirth).toISOString().split('T')[0]
          : '',
        [Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)],
      ],
    });

    this.formChangePassword = this.fb.group({
      oldPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.formChangePassword
      .get('confirmPassword')!
      .valueChanges.pipe(debounceTime(500)) // chờ 500ms sau khi ngừng gõ
      .subscribe(() => {
        this.checkPasswordMatch();
      });
  }

  onFileSelected($event: any): void {
    this.selectedFile = true;
    this.file = $event.target.files[0];
    if (this.file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.user.avatar = e.target.result;
      };
      reader.readAsDataURL(this.file);
    }
  }

  onUpload(): void {
    this.uploading = true;
    this.userService.uploadAvatar(this.file).subscribe({
      next: (res) => {
        this.toastService.showSuccess('Upload Avatar', 'Profile updated successfully');
        this.user.avatar = res.avatarUrl;
        localStorage.setItem('user', JSON.stringify(this.user));
        this.selectedFile = false;
        this.uploading = false;
      },
      error: (err) => {
        console.error('An error occurred while updating profile', err);
        this.errorAvatar =
          err.error.message || 'An error occurred while updating profile';
        this.selectedFile = false;
        this.uploading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.formData.invalid) {
      this.toastService.showWarning('warning', 'Please fill in all required fields correctly');
      return;
    }

    const updateUser: any = {};
    const formValues = this.formData.value;

    if (formValues.username !== this.user.username) {
      updateUser['username'] = formValues.username;
    }
    if (formValues.firstName !== this.user.firstName) {
      updateUser['firstName'] = formValues.firstName;
    }
    if (formValues.lastName !== this.user.lastName) {
      updateUser['lastName'] = formValues.lastName;
    }
    if (formValues.bio !== this.user.bio) {
      updateUser['bio'] = formValues.bio;
    }
    if (formValues.phone !== this.user.phone) {
      updateUser['phone'] = formValues.phone;
    }
    if (formValues.dateOfBirth !== this.user.dateOfBirth) {
      updateUser['dateOfBirth'] = formValues.dateOfBirth;
    }
    console.log('Update User Data:', updateUser);
    if (Object.keys(updateUser).length === 0) {
      this.toastService.showWarning('warning', 'No changes made');
      return;
    }

    // call api update
    this.userService.updateProfile(updateUser).subscribe({
      next: (res) => {
        this.toastService.showSuccess('Update Profile', 'Profile updated successfully');
        this.user = { ...this.user, ...updateUser };
        localStorage.setItem('user', JSON.stringify(this.user));
      },
      error: (err) => {
        this.toastService.showError('Update Profile', 'Failed to update profile');
        this.errorInfo =
          err.error.message || 'An error occurred while updating profile';
      },
    });
  }

  onChangePassword(): void {
    if (this.formChangePassword.invalid) {
      console.log(this.formChangePassword);
      this.toastService.showWarning('warning', 'Please fill in all required fields correctly');
      return;
    }

    const formValues = this.formChangePassword.value;

    if (formValues.newPassword !== formValues.confirmPassword) {
      this.toastService.showWarning('warning', 'New password and confirm password do not match');
      return;
    }

    this.authService
      .changePassword(formValues.oldPassword, formValues.newPassword)
      .subscribe({
        next: (res) => {
          this.toastService.showSuccess('Change Password', 'Password changed successfully');
        },
        error: (err) => {
          this.toastService.showError('Change Password', 'An error occurred while changing password');
        },
      });
  }

  checkPasswordMatch(): void {
    const formValues = this.formChangePassword.value;
    this.errorConfirmPassword =
      formValues.newPassword !== formValues.confirmPassword;
  }

  forgotPassword(): void {
    const email = this.user.email;
    if (!email) {
      this.toastService.showWarning('warning', 'Email is required to reset password, pls enter your email');
      return;
    }

    this.isSendingEmail = true;
    this.authService.forgotPassword(email).subscribe({
      next: (res) => {
        this.toastService.showSuccess('Forgot Password', 'Reset password link sent to your email');
        this.isSendingEmail = false;
      },
      error: (err) => {
        this.toastService.showError('Forgot Password', 'An error occurred while sending reset password link');
        this.isSendingEmail = false;
      },
    });
  }

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
