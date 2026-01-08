import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '@my-dashboard-support/util-config';
import { shareReplay } from 'rxjs';
import { AppCardDto } from '../models/app-card.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationsService {
   private http = inject(HttpClient);
  private config = inject(APP_CONFIG);

  // getApplications() {
  //   return this.http.get<AppCardDto[]>(`${this.config.apiUrl}/applications`);
  // }
  private apps$ = this.http.get<AppCardDto[]>(`${this.config.apiUrl}/applications`)
  .pipe(shareReplay({ bufferSize: 1, refCount: true }));

getApplications() {
  return this.apps$;
  }
}
