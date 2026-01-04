import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthService } from '@my-dashboard-support/data-access';
import { User } from '@my-dashboard-support/domain';

@Injectable({ providedIn: 'root' })
export class PermissionService {

private authService = inject(AuthService);
readonly permissions = computed(() => this.authService.userPermissions());
readonly roles = computed(() => this.authService.userRoles());
readonly _user =  computed(() => this.authService.user());


//CRUD helpers
canCreate(resource: string): boolean {
  return this.hasPermission(`create_${resource}`);
}

  hasPermission(permission: string): boolean {
    return this.permissions().includes(permission);
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }
}
