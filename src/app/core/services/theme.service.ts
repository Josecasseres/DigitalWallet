import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly KEY = 'dw-theme';
  isDark = true;

  init(): void {
    const saved = localStorage.getItem(this.KEY);
    this.isDark = saved !== 'light';
    this.apply();
  }

  toggle(): void {
    this.isDark = !this.isDark;
    localStorage.setItem(this.KEY, this.isDark ? 'dark' : 'light');
    this.apply();
  }

  private apply(): void {
    document.body.classList.toggle('dw-dark', this.isDark);
    document.body.classList.toggle('dw-light', !this.isDark);
    document.body.classList.toggle('ion-palette-dark', this.isDark);
  }
}
