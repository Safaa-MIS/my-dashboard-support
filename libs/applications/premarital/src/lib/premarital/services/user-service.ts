import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { User } from '../../interfaces/User';
import { PagedResponse } from '../../models/paged-response';
@Injectable({
  providedIn: 'root',
})
export class UserService {
    users: User[] = [
      {
        id: 1, name: 'Jay Rico', email: 'jay@example.com', role: 'Admin',
        status: 'Active'
      },
      {
        id: 2, name: 'Anna Smith', email: 'anna@example.com', role: 'User',
        status: 'Active'
      },
      {
        id: 3, name: 'John Doe', email: 'john@example.com', role: 'Guest',
        status: 'Active'
      },
      {
        id: 4, name: 'Mary Jane', email: 'mary@example.com', role: 'User',
        status: 'Active'
      },
      {
        id: 5, name: 'Smith', email: 'Smith@example.com', role: 'User',
        status: 'Active'
      },
      {
        id: 6, name: 'Doe John', email: 'Doe@example.com', role: 'Guest',
        status: 'Active'
      },
      {
        id: 7, name: 'Marika', email: 'Marika@example.com', role: 'User',
        status: 'Active'
      },
      {
        id: 8, name: 'Mpon', email: 'Mpon@example.com', role: 'Admin',
        status: 'Active'
      },
    {
      id: 9, name: 'Steve Rogers', email: 'steve@example.com', role: 'Admin',
      status: 'Active'
    },
    {
      id: 10, name: 'Tony Stark', email: 'tony@example.com', role: 'User',
      status: 'Active'
    },
    {
      id: 11, name: 'Bruce Wayne', email: 'bruce@example.com', role: 'Guest',
      status: 'Active'
    },
    {
      id: 12, name: 'Peter Parker', email: 'peter@example.com', role: 'User',
      status: 'Active'
    },
    {
      id: 13, name: 'Clark Kent', email: 'clark@example.com', role: 'Admin',
      status: 'Active'
    },
    {
      id: 14, name: 'Diana Prince', email: 'diana@example.com', role: 'User',
      status: 'Active'
    },
    ];
  http = inject(HttpClient);

    getUsers(page: number, pageSize: number, searchText= '', category= ''): Observable<PagedResponse> {
    // Filter
    const filtered = this.users.filter(user => {
      const matchesText =
        !searchText ||
        user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory =
        !category || user.role.toLowerCase() === category.toLowerCase();
      return matchesText && matchesCategory;
    });

    const total = filtered.length;

    // Paginate
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = filtered.slice(start, end);

    return of({ total, data });
  }
 /* getUsers(page: number, limit: number, search: string, role: string): Observable<PagedResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('search', search)
      .set('role', role);

    return this.http.get<PagedResponse>('/api/users', { params });
  }*/
}

