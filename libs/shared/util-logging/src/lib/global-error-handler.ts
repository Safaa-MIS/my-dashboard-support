import { ErrorHandler, inject, Injectable } from '@angular/core';
import { LoggerService } from './services/logger-service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly logger = inject(LoggerService);

  handleError(error: Error | unknown): void {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : undefined;
    
    // Log to backend
    this.logger.fatal(message, error as Error, 'GlobalErrorHandler');
    
    // Still log to console in dev
    console.error('Global error caught:', error);
  }
}