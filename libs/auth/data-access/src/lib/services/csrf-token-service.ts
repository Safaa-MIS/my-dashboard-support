import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, shareReplay, tap, map } from 'rxjs';
import { APP_CONFIG } from '@my-dashboard-support/util-config';

@Injectable({
  providedIn: 'root'
})
export class CsrfTokenService {
  private http = inject(HttpClient);
  private config = inject(APP_CONFIG);
  
  //Fix: Make token$ strictly Observable<string>
  private token$: Observable<string> | undefined = undefined;
  private cachedToken: string | null = null;

  getToken(): Observable<string> {
    // Return cached token if available
    if (this.cachedToken) {
      return of(this.cachedToken);
    }

    // Return ongoing request if exists
    if (this.token$) {
      return this.token$;
    }

    // Fetch new token
    this.token$ = this.http.get<{ token: string }>(
      `${this.config.apiUrl}/csrf-token`,
      { withCredentials: true }
    ).pipe(
      map(response => response.token), //Extract token string
      tap(token => {
        this.cachedToken = token;
        this.token$ = undefined; //Clear ongoing request
      }),
      shareReplay(1) //Cache the result
    );

    return this.token$;
  }

  clearToken(): void {
    this.cachedToken = null;
    this.token$ = undefined;
  }
}