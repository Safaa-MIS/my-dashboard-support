import { Injectable, signal } from '@angular/core';
import { Toast } from '../Models/Toast';

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  success(message: string, duration = 3000): void {
    this.show({ type: 'success', message, duration });
  }

  error(message: string, duration = 5000): void {
    this.show({ type: 'error', message, duration });
  }

  warning(message: string, duration = 4000): void {
    this.show({ type: 'warning', message, duration });
  }

  info(message: string, duration = 3000): void {
    this.show({ type: 'info', message, duration });
  }

  private show(toast: Omit<Toast, 'id'>): void {
    const id = Date.now();
    const newToast = { ...toast, id };
    
    this.toasts.update(toasts => [...toasts, newToast]);

    if (toast.duration) {
      setTimeout(() => this.remove(id), toast.duration);
    }
  }

  remove(id: number): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }
}