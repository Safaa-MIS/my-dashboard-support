import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'; //Automatically unsubscribes RxJS streams when component is destroyed =>>> prevents memory leaks
import { 
  Subject, 
  debounceTime, 
  distinctUntilChanged, 
  switchMap, 
  catchError, 
  of, 
  finalize 
} from 'rxjs';
import { UserService } from '../../services/user-service';
import { PagedResponse } from '../../../models/paged-response';
import { User } from '@my-dashboard-support/domain';
import { NavigationService, PermissionService } from '@my-dashboard-support/shared/shared-data-access';
import { Router } from '@angular/router';
import { PremaritalNavItems } from '../../config/premarital-nav-items';

import { filterNavItemsByPermission } from '@my-dashboard-support/util-config';
@Component({
  selector: 'lib-premarital',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './premarital.html',
  styleUrl: './premarital.css',
changeDetection: ChangeDetectionStrategy.OnPush
})
export class PremaritalComponent implements OnInit, OnDestroy {
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly navService = inject(NavigationService);
  private readonly router = inject(Router);
  private readonly permissionService = inject(PermissionService);

  //  Reactive state using signals
  readonly searchCategory = signal<string>('');
  readonly searchText = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly itemsPerPage = signal<number>(10); // Changed default to 10
  readonly filteredUsers = signal<User[]>([]);
  readonly totalItems = signal<number>(0);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

//Computed permissions (CACHED until permissions change)
readonly permissions = computed(() => ({
  canCreateUser: this.permissionService.hasPermission('create_user'),
  canEditUser: this.permissionService.hasPermission('edit_user'),
  canDeleteUser: this.permissionService.hasPermission('delete_user'),
  canViewUser: this.permissionService.hasPermission('view_users'),
}));


  //  Computed values
  readonly totalPages = computed(() => 
    Math.ceil(this.totalItems() / this.itemsPerPage())
  );

  readonly hasResults = computed(() => this.filteredUsers().length > 0);

  // Search subject for debouncing (wait until the user stops typing)
  private readonly searchSubject$ = new Subject<void>();

  // Expose Math for template ==> Angular templates can’t access globals directly
  readonly Math = Math;

  ngOnInit(): void {
  const user = this.permissionService._user;
  if (!user) {
    this.router.navigate(['/login']);
    return;
  }
  const filteredNav = filterNavItemsByPermission(PremaritalNavItems, this.permissionService.permissions());
  this.navService.setNav(filteredNav);
  
  console.log('User Permissions:', this.permissionService.permissions());
  console.log('Filtered Nav:', filteredNav);


    //  Setup debounced search
    this.setupSearch();

    // Initial load
    this.loadUsers();
  }
private setupSearch(){
    this.searchSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(() => {
          this.isLoading.set(true);
          return this.fetchUsers();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res) => {
          this.filteredUsers.set(res.data ?? []);
          this.totalItems.set(res.total ?? 0);
        },
        error: (err) => { 
           if (err?.status === 401 || err?.status === 403) {
          this.router.navigate(['/login']);
                      }else{
          this.error.set('Failed to search users. Please try again.');
                      }
        },
        complete: () => {
          this.isLoading.set(false);
        }
      });
}
  /**
   *  Load users with current filters and pagination
   */
  loadUsers(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const sanitizedText = this.sanitizeInput(this.searchText());
    const sanitizedCategory = this.sanitizeInput(this.searchCategory());

    this.userService
      .getUsers(
        this.currentPage(),
        this.itemsPerPage(),
        sanitizedText,
        sanitizedCategory
      )
      .pipe(
        catchError((err: any) => {
               if (err?.status === 401 || err?.status === 403) {
          this.router.navigate(['/login']);
                      }else{
          this.error.set('Failed to search users. Please try again.');
                      }
          return of({ 
            data: [], 
            total: 0, 
            page: this.currentPage(), 
            pageSize: this.itemsPerPage() 
          } as PagedResponse);
        }),
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res: PagedResponse) => {
        this.filteredUsers.set(res.data ?? []);
        this.totalItems.set(res.total ?? 0);
      });
  }

  /**
   *  Fetch users observable (used by debounced search)
   */
  private fetchUsers() {
    const sanitizedText = this.sanitizeInput(this.searchText());
    const sanitizedCategory = this.sanitizeInput(this.searchCategory());

    return this.userService
      .getUsers(
        this.currentPage(),
        this.itemsPerPage(),
        sanitizedText,
        sanitizedCategory
      )
      .pipe(
        catchError((err: any) => {
            if (err?.status === 401 || err?.status === 403) {
          this.router.navigate(['/login']);
                      }else{
          this.error.set('Failed to search users. Please try again.');
                      }
          return of({ 
            data: [], 
            total: 0, 
            page: this.currentPage(), 
            pageSize: this.itemsPerPage() 
          } as PagedResponse);
        }),
        finalize(() => this.isLoading.set(false))
      );
  }

  /**
   * Handle search form submission
   */
  onSearch(event: Event): void {
    event.preventDefault();
    this.currentPage.set(1);
    this.loadUsers();
  }

  /**
   * Handle search text changes with debouncing
   */
  onSearchTextChange(value: string): void {
    this.searchText.set(value);
    this.currentPage.set(1);
    this.searchSubject$.next();
  }

  /**
   * Handle category change
   */
  onCategoryChange(value: string): void {
    this.searchCategory.set(value);
    this.currentPage.set(1);
    this.loadUsers();
  }

  /**
   * Handle page change
   */
  pageChanged(event: Event, page: number | string): void {
    event.preventDefault();

    //  Ignore ellipsis clicks
    if (typeof page === 'string') {
      return;
    }

    if (page < 1 || page > this.totalPages() || this.isLoading()) {
      return;
    }

    this.currentPage.set(page);
    this.loadUsers();

    //  Scroll to top of table
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Handle items per page change
   */
  onItemsPerPageChange(value: number): void {
    this.itemsPerPage.set(value);
    this.currentPage.set(1);
    this.loadUsers();
  }

  /**
   *  Get page numbers for pagination with ellipsis
   */
  getPageNumbers(): (number | string)[] {
    const totalPages = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (current > 3) {
        pages.push('...');
      }

      // Show pages around current
      const start = Math.max(2, current - 1);
      const end = Math.min(totalPages - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  }
 onAddUser(): void {
    if (!this.permissions().canCreateUser) {
      this.error.set('You do not have permission to create users');
      return;
    }
    // Navigate to user creation form
    this.router.navigate(['/applications/premarital/users/create']);
  }

  /*  Edit user   */
  onEditUser(user: User): void {
    if (!this.permissions().canEditUser) {
      this.error.set('You do not have permission to edit users');
      return;
    }
    // Navigate to edit form with user ID
    this.router.navigate(['/applications/premarital/users/edit', user.id]);
  }

  /* Delete user   */
  onDeleteUser(user: User): void {
    if (!this.permissions().canDeleteUser) {
      this.error.set('You do not have permission to delete users');
      return;
    }

    // Confirm deletion
    const confirmed = confirm(
      `Are you sure you want to delete user "${user.name ?? user.email}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.userService.deleteUser(user.id)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          // Optimistic UI update: remove from list
          this.filteredUsers.update(users => 
            users.filter(u => u.id !== user.id)
          );
          this.totalItems.update(total => total - 1);

          // Show success message 
          console.info(`User "${user.name}" deleted successfully`);

          // Reload if current page is empty
          if (this.filteredUsers().length === 0 && this.currentPage() > 1) {
            this.currentPage.update(page => page - 1);
            this.loadUsers();
          }
        },
        error: (err) => {
          this.handleError(err, `Failed to delete user "${user.name}"`);
        }
      });
  }

  /**
   * Centralized error handling
   */
  private handleError(err: any, defaultMessage: string): void {
    if (err?.status === 401 || err?.status === 403) {
      this.router.navigate(['/login']);
    } else {
      const message = err?.error?.message || defaultMessage;
      this.error.set(message);
      console.error(defaultMessage, err);
    }
  }

  /**
   * Sanitize user input to prevent XSS attacks
   */
  private sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .trim()
      .replace(/[<>'"]/g, '')
      .substring(0, 100);
  }

  /**
   * Retry loading users after error
   */
  retryLoad(): void {
    this.error.set(null);
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.navService.clearNav();
  }
}