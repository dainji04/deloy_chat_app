import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../../services/auth/auth';
import { PrimaryButton } from '../../../components/primary-button/primary-button';
import { AuthIntroComponent } from '../../../components/auth-intro/auth-intro';
import { SocketService } from '../../../services/socket/socket-service';
import {ShowErrorValidate} from '../../../components/show-error-validate/show-error-validate';
import { ToastService } from '../../../services/toast/toast';

@Component({
  selector: 'app-login',
    imports: [
        PrimaryButton,
        AuthIntroComponent,
        ReactiveFormsModule,
        RouterModule,
        ShowErrorValidate,
    ],
  templateUrl: './login.html',
  styleUrls: ['../auth.scss'],
})
export class Login {
  title: string = 'Login';
  description: string =
    'Login to your account to start chatting with your friends.';
  errorMessage: string = '';
  formData!: FormGroup;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private socketService: SocketService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.formData = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';
    if (this.formData.valid) {
      const { email, password } = this.formData.value;
      this.authService.login(email, password).subscribe({
        next: (response: any) => {
          // Reconnect socket với token mới
          this.socketService.reconnectWithNewToken();
          this.toastService.showSuccess('Success', 'Login successful');
          this.loading = false;
          this.router.navigate(['/']);
        },
        error: (error: any) => {
          this.toastService.showError(
            'Error',
            error.error.message || 'Login failed. Please try again.'
          );
          this.errorMessage =
            error.error.message || 'Login failed. Please try again.';
          this.loading = false;
        },
      });
    } else {
      // Mark all fields as touched to show validation messages
      this.formData.markAllAsTouched();
      this.loading = false;
    }
  }
}
