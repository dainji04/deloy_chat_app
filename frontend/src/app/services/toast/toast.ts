import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private messageService: MessageService) {}

  // Success toast
  showSuccess(summary: string, detail?: string) {
    this.messageService.add({
      severity: 'success',
      summary: summary,
      detail: detail,
      life: 3000
    });
  }

  // Error toast
  showError(summary: string, detail?: string) {
    this.messageService.add({
      severity: 'error',
      summary: summary,
      detail: detail,
      life: 5000
    });
  }

  // Warning toast
  showWarning(summary: string, detail?: string) {
    this.messageService.add({
      severity: 'warn',
      summary: summary,
      detail: detail,
      life: 4000
    });
  }

  // Info toast
  showInfo(summary: string, detail?: string) {
    this.messageService.add({
      severity: 'info',
      summary: summary,
      detail: detail,
      life: 3000
    });
  }

  // Custom toast
  showCustom(severity: string, summary: string, detail?: string, life?: number) {
    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: detail,
      life: life || 3000
    });
  }

  // Clear all toasts
  clear() {
    this.messageService.clear();
  }

  // Clear specific toast by key
  clearByKey(key: string) {
    this.messageService.clear(key);
  }
}