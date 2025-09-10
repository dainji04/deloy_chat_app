import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // GET request
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`);
  }

  // POST request
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data);
  }

  // PUT request
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, data);
  }

  // PUT without data
  putWithoutData<T>(endpoint: string): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, {});
  }

  // DELETE request
  delete<T>(endpoint: string, data: any = null): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`);
  }

  // DELETE WITH DATA
  deleteWithData<T>(endpoint: string, data: any): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, {
      body: data, // ✅ truyền đúng cách
    });
  }

  // Get full URL
  getFullUrl(endpoint: string): string {
    return `${this.baseUrl}/${endpoint}`;
  }

  // Get base URL
  getBaseUrl(): string {
    return this.baseUrl;
  }
}
