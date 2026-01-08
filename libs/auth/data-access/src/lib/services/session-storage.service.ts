import { Injectable } from '@angular/core';

interface StoredSession {
  user: {
    id: string;
    username: string;
    roles: string[];
    permissions: string[];
  };
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {
  private readonly SESSION_KEY = 'app_session';
  private readonly MAX_AGE = 30 * 60 * 1000; // 30 minutes

  saveSession(user: StoredSession['user']): void {
    const session: StoredSession = {
      user,
      timestamp: Date.now()
    };
    
    // Store in sessionStorage (cleared on tab close)
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  }

  loadSession(): StoredSession['user'] | null {
    try {
      const stored = sessionStorage.getItem(this.SESSION_KEY);
      if (!stored) return null;

      const session: StoredSession = JSON.parse(stored);
      
      // Check if session expired
      if (Date.now() - session.timestamp > this.MAX_AGE) {
        this.clearSession();
        return null;
      }

      return session.user;
    } catch {
      this.clearSession();
      return null;
    }
  }

  clearSession(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
  }
}