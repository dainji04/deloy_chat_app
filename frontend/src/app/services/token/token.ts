import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Token {
  private readonly ACCESS_TOKEN_KEY = 'access_token';

  constructor() {}

  // Lưu access token
  setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  // Lấy access token
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }
  // Xóa tất cả tokens
  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
  }

  // Kiểm tra có token hay không
  hasToken(): boolean {
    return !!this.getAccessToken();
  }

  // Kiểm tra token có hết hạn không (cần decode JWT)
  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  getRefreshToken() {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('refresh_token='))
      ?.split('=')[1];
  }
}
