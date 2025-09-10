import { Injectable } from '@angular/core';
import { Api } from '../api/api';
import { Token } from '../token/token';
import { signUp } from '../../model/auth';
import { firstValueFrom, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  constructor(private apiService: Api, private tokenService: Token) {}

  signup(data: signUp): Observable<any> {
    return this.apiService.post('auth/signup', data).pipe(
      tap((response: any) => {
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        // Lưu token sau khi signup thành công
        if (response.accessToken) {
          this.tokenService.setAccessToken(response.accessToken);
        }
      })
    );
  }

  login(email: string, password: string): Observable<any> {
    return this.apiService.post('auth/login', { email, password }).pipe(
      tap((response: any) => {
        // Lưu token sau khi login thành công
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        if (response.accessToken) {
          this.tokenService.setAccessToken(response.accessToken);
        }
      })
    );
  }

  logout(): Observable<any> {
    this.tokenService.clearTokens();
    console.info('User logged out');
    // localStorage.removeItem('user'); // remove user to check auth guard
    return this.apiService.post('auth/logout', {});
  }

  // change password
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.apiService.post('auth/change-password', {
      oldPassword,
      newPassword,
    });
  }

  //reset password
  forgotPassword(email: string): Observable<any> {
    return this.apiService.post('auth/forgot-password', { email });
  }
  
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.apiService.post('auth/reset-password', {
      token,
      newPassword,
    });
  }

  refreshToken(): Observable<any> {
    try {
      return this.apiService.post('auth/refresh-token', {}).pipe(
        tap((response: any) => {
          // Cập nhật access token mới
          if (response.accessToken) {
            this.tokenService.setAccessToken(response.accessToken);
          }
        })
      );
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    // Check if user has a valid access token
    const user = localStorage.getItem('user');
    if (this.tokenService.hasToken() && !this.tokenService.isTokenExpired()) {
      return true;
    }

    try {
      const response = await firstValueFrom(this.refreshToken());
      if (response.accessToken) {
        this.tokenService.setAccessToken(response.accessToken);
        console.log('Token refreshed successfully', response);
        return true;
      }
      return false;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  getToken(): string | null {
    return this.tokenService.getAccessToken();
  }

  async isLoggedIn(): Promise<boolean> {
    return await this.isAuthenticated();
  }
}
