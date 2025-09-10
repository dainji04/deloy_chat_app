import { Component } from '@angular/core';
import { Auth } from '../../services/auth/auth';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast/toast';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  email: string = '';
  isSendingEmail: boolean = false;

  constructor(private authService: Auth, private toastService: ToastService) {}

  forgotPassword(): void {
    const email = this.email;
    if (!email) {
      this.toastService.showError('Error', 'Email is required to reset password');
      return;
    }

    this.isSendingEmail = true;
    this.authService.forgotPassword(email).subscribe({
      next: (res) => {
        this.toastService.showSuccess('Success', 'Reset password link sent to your email');
        this.isSendingEmail = false;
      },
      error: (err) => {
        console.error(
          'An error occurred while sending reset password link',
          err
        );
        this.toastService.showError(
          'Error',
          err.error.message ||
            'An error occurred while sending reset password link'
        );
        this.isSendingEmail = false;
      },
    });
  }
}
