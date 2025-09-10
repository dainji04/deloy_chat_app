import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthIntroComponent } from '../../../components/auth-intro/auth-intro';
import { PrimaryButton } from '../../../components/primary-button/primary-button';
import { Auth } from '../../../services/auth/auth';
import { SocketService } from '../../../services/socket/socket-service';
import {ShowErrorValidate} from '../../../components/show-error-validate/show-error-validate';
import { ToastService } from '../../../services/toast/toast';

@Component({
  selector: 'app-signup',
  standalone: true,
    imports: [
        ReactiveFormsModule,
        RouterModule,
        PrimaryButton,
        AuthIntroComponent,
        ShowErrorValidate,
    ],
  templateUrl: './signup.html',
  styleUrl: '../auth.scss',
})
export class Signup {
  title: string = 'Sign Up';
  description: string =
    'Create a new account to start chatting with your friends.';
  errorMessage: string = '';
  formData!: FormGroup;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    // public themeService: ThemeService,
    private authService: Auth,
    private socketService: SocketService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.formData = this.fb.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(10),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(10),
        ],
      ],
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(10),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';
    if (this.formData.valid) {
      this.authService.signup(this.formData.value).subscribe({
        next: (response: any) => {
          this.socketService.connect();
          this.toastService.showSuccess('Success', 'Signup successful');
          this.router.navigate(['/']);
        },
        error: (error: any) => {
          this.toastService.showError(
            'Error',
            error.error.message || 'Signup failed. Please try again.'
          );
          this.errorMessage =
            error.error.message || 'Signup failed. Please try again.';
          this.loading = false;
        },
      });
    } else {
      console.error('Form is invalid');
      // Mark all fields as touched to show validation messages
      this.formData.markAllAsTouched();
      this.loading = false;
    }
  }
  // get isDarkMode(): boolean {
  //   return this.themeService.isDarkMode();
  // }
}
