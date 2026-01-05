import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResponse } from '../models/paged-response';
import { APP_CONFIG } from '@my-dashboard-support/util-config';
import { User } from '@my-dashboard-support/shared/domain';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private config = inject(APP_CONFIG);

  /**
   * Get paginated users from API
   * Backend should handle filtering, sorting, and pagination
   */
  getUsers(
    page: number, 
    pageSize: number, 
    searchText = '', 
    category = ''
  ): Observable<PagedResponse> {
    //Build query parameters
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (searchText) {
      params = params.set('search', searchText);
    }

    if (category) {
      params = params.set('role', category);
    }

    //Call backend API
    return this.http.get<PagedResponse>(
      `${this.config.apiUrl}/users`,
      { params }
    );
  }

  /**
   * Get single user by ID
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.config.apiUrl}/users/${id}`);
  }

  /**
   * Create new user
   */
  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.config.apiUrl}/users`, user);
  }

  /**
   * Update existing user
   */
  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.config.apiUrl}/users/${id}`, user);
  }

  /**
   * Delete user
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.config.apiUrl}/users/${id}`);
  }

  /**
   * Update user status
   */
  updateUserStatus(id: number, status: 'Active' | 'Inactive'): Observable<User> {
    return this.http.patch<User>(
      `${this.config.apiUrl}/users/${id}/status`,
      { status }
    );
  }
}