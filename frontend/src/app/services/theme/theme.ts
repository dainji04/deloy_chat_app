import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Theme {
  private theme!: string;

  constructor() {
    this.theme = localStorage.getItem("theme") || 'light';
    console.error('theme loading');
  }

  loadTheme() {
    document.body.classList.toggle('dark-theme', this.theme === 'dark');
    document.body.classList.toggle('light-theme', this.theme === 'light');
    localStorage.setItem('theme', this.theme);
  }

  toggleTheme() {
    this.theme = this.theme == 'light' ? 'dark' : 'light';
    this.loadTheme();
  }

  getTheme(): string {
    return this.theme;
  }
}
