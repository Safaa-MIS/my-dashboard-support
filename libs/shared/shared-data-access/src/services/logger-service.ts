import { HttpClient } from '@angular/common/http';
import { inject, Injectable, isDevMode } from '@angular/core';
import { AuthService } from '@my-dashboard-support/data-access';
import { APP_CONFIG } from '@my-dashboard-support/util-config';
import { bufferTime, catchError, filter, of, Subject } from 'rxjs';


/**
 * Log Levels (matches backend enum)
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

/**
 * Log Entry Interface
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;          // Component/Service name
  userId?: string;            // Current user ID
  sessionId?: string;         // Browser session ID
  url?: string;               // Current route
  userAgent?: string;         // Browser info
  stackTrace?: string;        // Error stack trace
  metadata?: Record<string, any>; // Additional data
}


/**
 * Logger Service
 * Logs to console in development, sends to backend in production
 * Batches logs to reduce API calls
 * 
 * Usage:
 * private logger = inject(LoggerService);
 * this.logger.info('User logged in', { userId: user.id });
 * this.logger.error('API call failed', error, { endpoint: '/users' });
 * this.logger.warn('Deprecated feature used', { feature: 'oldApi' });
 * 
 * Backend Endpoint Expected:
 * POST /api/logs
 * Body: LogEntry[]
 */
@Injectable({
  providedIn: 'root',
})
export class LoggerService {
   private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  
  // Development mode flag
  private readonly isDev = isDevMode();
  
  // Batch logging for production
  private readonly logQueue$ = new Subject<LogEntry>();
  private sessionId: string;
  
    constructor() {
    // Generate session ID
    this.sessionId = this.generateSessionId();
    
    // Setup batch logging (sends logs every 10 seconds or when 50 logs accumulated)
    if (!this.isDev) {
      this.setupBatchLogging();
    }
  }
   /* Generate unique session ID */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}`;
  }

  /* Setup batch logging
     Collects logs and sends them every 10 seconds
   */
  private setupBatchLogging(): void {
    this.logQueue$
      .pipe(
        bufferTime(10000, undefined, 50), // Buffer for 10s or 50 logs
        filter(logs => logs.length > 0)   // Only send if there are logs
      )
      .subscribe(logs => {
        this.http.post(`${this.config.apiUrl}/logs`, logs, { 
          withCredentials: true 
        })
        .pipe(
          catchError(err => {
            console.error('Failed to send batch logs to backend:', err);
            return of(null);
          })
        )
        .subscribe();
      });
  }

   /* Log DEBUG level message
   * Only logged in development mode
   */
  debug(message: string, context?: string, metadata?: Record<string, any>): void {
    if (this.isDev) {
      console.debug(`[DEBUG] ${context ? `[${context}]` : ''} ${message}`, metadata || '');
    }
  }

   /* Log INFO level message
   Logged to console in dev, sent to backend in production
   */
  info(message: string, context?: string, metadata?: Record<string, any>): void {
    if (this.isDev) {
      console.info(`[INFO] ${context ? `[${context}]` : ''} ${message}`, metadata || '');
    } else {
      this.queueLog(LogLevel.INFO, message, context, metadata);
    }
  }
  /*
    Queue log entry for batch sending
   */
  private queueLog(level: LogLevel,message: string,
    context?: string,metadata?: Record<string, any>,stackTrace?: string): void {

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      userId: this.getCurrentUserId(),
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      stackTrace,
      metadata
    };

    this.logQueue$.next(entry);
  }
 private getCurrentUserId(): string | undefined {

  return inject(AuthService).user()?.id;
  }


  /*
    Log WARN level message
    Always logged to console, sent to backend in production
   */
  warn(message: string, context?: string, metadata?: Record<string, any>): void {
    console.warn(`[WARN] ${context ? `[${context}]` : ''} ${message}`, metadata || '');
    
    if (!this.isDev) {
      this.queueLog(LogLevel.WARN, message, context, metadata);
    }
  }

  /**
    Log ERROR level message
    Always logged to console, sent to backend in production
   */
  error(message: string, error?: Error | any, context?: string, metadata?: Record<string, any>): void {

    console.error(`[ERROR] ${context ? `[${context}]` : ''} ${message}`, error || '', metadata || '');
    
    if (!this.isDev) {
      this.queueLog(LogLevel.ERROR, message, 
        context, {
          ...metadata,errorName: error?.name,errorMessage: error?.message,stackTrace: error?.stack
        },
        error?.stack
      );
    }
  }
  /**
   * Log FATAL level message
   * Critical errors that require immediate attention (logged to console and backend)
   */
  fatal(message: string, error?: Error | any, context?: string, metadata?: Record<string, any>): void {
    console.error(`[FATAL] ${context ? `[${context}]` : ''} ${message}`, error || '', metadata || '');
    
    // Send immediately, don't batch
    this.sendLogImmediately(
      LogLevel.FATAL, 
      message, 
      context, 
      {
        ...metadata,
        errorName: error?.name,
        errorMessage: error?.message,
        stackTrace: error?.stack
      },
      error?.stack
    );
  }

  //Send log immediately (for fatal errors)
  private sendLogImmediately(level: LogLevel,message: string,context?: string,metadata?: Record<string, any>,stackTrace?: string): void {
    const entry: LogEntry = {
      level,message,timestamp: new Date(),
      context,userId: this.getCurrentUserId(),sessionId: this.sessionId,url: window.location.href,
      userAgent: navigator.userAgent,stackTrace,metadata
    };

    this.http.post(`${this.config.apiUrl}/logs`, entry, { 
      withCredentials: true 
    })
    .pipe(
      catchError(err => {
        console.error('Failed to send log to backend:', err);
        return of(null);
      })
    ).subscribe();
  }


   //flush all pending logs now call this before logout
  flush(): void {
    this.logQueue$.next(null as any); // Force flush
  }
}
