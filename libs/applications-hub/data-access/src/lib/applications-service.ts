import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '@my-dashboard-support/util-config';
export interface AppCardDto {
  id: string;
  name: string;
  route?: string;
  //icon?: string;
}


@Injectable({
  providedIn: 'root',
})
export class ApplicationsService {
   private http = inject(HttpClient);
  private config = inject(APP_CONFIG);

  getApplications() {
    return this.http.get<AppCardDto[]>(`${this.config.apiUrl}/applications`);
  }
}
