import { Component, OnInit } from '@angular/core';
import { Auth } from '../../services/auth/auth';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { debounceTime } from 'rxjs';
import { ToastService } from '../../services/toast/toast';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword implements OnInit {
  isSendingEmail: boolean = false;

  formReset!: FormGroup;
  errorConfirmPassword: boolean = false;

  userId!: string;

  constructor(
    private authService: Auth,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.formReset = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.formReset
      .get('confirmPassword')!
      .valueChanges.pipe(debounceTime(1000)) // chờ 1s sau khi ngừng gõ
      .subscribe(() => {
        this.checkPasswordMatch();
      });
  }

  checkPasswordMatch(): void {
    const formValues = this.formReset.value;
    this.errorConfirmPassword =
      formValues.newPassword !== formValues.confirmPassword;
  }

  resetPassword(): void {
    const token = this.route.snapshot.queryParams['token'];
    const formValues = this.formReset.value;
    if (formValues.newPassword !== formValues.confirmPassword) {
      this.errorConfirmPassword = true;
      return;
    }

    if (token) {
      this.authService.resetPassword(token, formValues.newPassword).subscribe({
        next: (response) => {
          this.toastService.showSuccess('Success', 'Password reset successful');
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          console.error('Error verifying token:', error);
        },
      });
    }
  }
}
