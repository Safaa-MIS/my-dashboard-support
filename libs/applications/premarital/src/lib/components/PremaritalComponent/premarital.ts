import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { 
  Subject, 
  debounceTime, 
  distinctUntilChanged, 
  switchMap, 
  catchError, 
  of, 
  finalize, 
  Observable
} from 'rxjs';
import { UserService,PagedResponse ,PremaritalNavItems} from '@my-dashboard-support/applications/premarital/data-access';
import { User} from '@my-dashboard-support/shared/domain';
import { NavigationService } from '@my-dashboard-support/shared/ui-services';
import { PermissionService } from '@my-dashboard-support/auth/data-access';
import { Router } from '@angular/router';
import { filterNavItemsByPermission } from '@my-dashboard-support/util-config';


import { 
  ROUTES, 
  MESSAGES, 
  PERMISSION_MESSAGES,
  PAGINATION, 
  TIMING,
  INPUT_LIMITS,
  HTTP
} from '@my-dashboard-support/shared/domain';
import { HttpErrorResponse } from '@angular/common/http';
import { getPageNumbers } from '@my-dashboard-support/shared/util-pagination';

@Component({
  selector: 'lib-premarital',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './premarital.html',
  styleUrl: './premarital.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PremaritalComponent implements OnInit, OnDestroy {
  // ============ Dependencies ============

  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly navService = inject(NavigationService);
  private readonly router = inject(Router);
  private readonly permissionService = inject(PermissionService);

  // ============ State Management (Signals) ============
  readonly searchCategory = signal<string>('');
  readonly searchText = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly itemsPerPage = signal<number>(PAGINATION.DEFAULT_PAGE_SIZE);
  readonly filteredUsers = signal<User[]>([]);
  readonly totalItems = signal<number>(0);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // ============ Computed Values ============
  readonly totalPages = computed(() => 
    Math.ceil(this.totalItems() / this.itemsPerPage())
  );


  readonly permissions = computed(() => ({
    canCreateUser: this.permissionService.hasPermission('create_user'),
    canEditUser: this.permissionService.hasPermission('edit_user'),
    canDeleteUser: this.permissionService.hasPermission('delete_user'),
    canViewUser: this.permissionService.hasPermission('view_users'),
  }));

  readonly currentPageInfo = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage() + 1;
    const end = Math.min(this.currentPage() * this.itemsPerPage(), this.totalItems());
    return { start, end, total: this.totalItems() };
  });

  // ============ Reactive Streams ============
  private readonly searchSubject$ = new Subject<void>();

  // ============ Constants (exposed to template) ============
  readonly Math = Math;
  readonly PAGINATION = PAGINATION;
  readonly MESSAGES = MESSAGES;

  // ============ Lifecycle Hooks ============
  
  ngOnInit(): void {
    this.checkAuthentication();
    this.setupNavigation();
    this.setupSearch();
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.navService.clearNav();
  }

  // ============ Initialization Methods ============

  /**
   * Check if user is authenticated and has permissions
   */
  private checkAuthentication(): void {
    const user = this.permissionService._user();
    if (!user) {
      this.router.navigate([ROUTES.AUTH.LOGIN]);
      return;
    }

    if (!this.permissions().canViewUser) {
      this.error.set(PERMISSION_MESSAGES.NO_VIEW);
      this.router.navigate([ROUTES.ERROR.UNAUTHORIZED]);
    }
  }

  /**
   * Setup navigation items based on user permissions
   */
  private setupNavigation(): void {
    const filteredNav = filterNavItemsByPermission(
      PremaritalNavItems, 
      this.permissionService.permissions()
    );
    this.navService.setNav(filteredNav);
  }

  /**
   * Setup debounced search stream
   */
  private setupSearch(): void {
    this.searchSubject$
      .pipe(
        debounceTime(TIMING.DEBOUNCE.SEARCH),
        distinctUntilChanged(),
        switchMap(() => {
          this.isLoading.set(true);
          return this.fetchUsers();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res) => this.handleSearchSuccess(res as PagedResponse),
        error: (err) => this.handleError(err, MESSAGES.ERROR.LOAD_FAILED),
        complete: () => this.isLoading.set(false)
      });
  }
  // Load users with filters and pagination
  
  loadUsers(): void {
    this.isLoading.set(true);
    this.error.set(null);

this.userService
  .getUsers(this.currentPage(), this.itemsPerPage(), this.searchText(), this.searchCategory())
  .pipe(
    catchError((err: unknown) => this.handleErrorAndReturnEmpty(err)),
    finalize(() => this.isLoading.set(false)),
    takeUntilDestroyed(this.destroyRef)
  )
  .subscribe({
    next: (res) => {
      const typedRes = res as PagedResponse; 
      this.filteredUsers.set(typedRes.data ?? []);
      this.totalItems.set(typedRes.total ?? 0);
    },
    error: (err) => this.handleError(err, MESSAGES.ERROR.LOAD_FAILED)
  });

  }

  /**
   * Fetch users observable (used by debounced search)
   */
  private fetchUsers() {
    return this.userService
      .getUsers(
        this.currentPage(),
        this.itemsPerPage(),
        this.searchText(),
        this.searchCategory()
      )
      .pipe(
        catchError((err: unknown) => this.handleErrorAndReturnEmpty(err)),
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
    // Sanitize and validate input
    const sanitized = value.trim().substring(0, INPUT_LIMITS.TEXT.SEARCH_MAX);
    this.searchText.set(sanitized);
    this.currentPage.set(1);
    this.searchSubject$.next();
  }

  /**
   * Handle category filter change
   */
  onCategoryChange(value: string): void {
    this.searchCategory.set(value);
    this.currentPage.set(1);
    this.loadUsers();
  }

  /**
   * Handle page navigation
   */
  pageChanged(event: Event, page: number | string): void {
    event.preventDefault();

    // Ignore ellipsis clicks
    if (typeof page === 'string') {
      return;
    }

    // Validate page number
    if (page < 1 || page > this.totalPages() || this.isLoading()) {
      return;
    }

    this.currentPage.set(page);
    this.loadUsers();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Handle items per page change
   */
  onItemsPerPageChange(value: number): void {
    // Validate value
    const validated = (PAGINATION.PAGE_SIZE_OPTIONS as readonly number[]).includes(value) 
      ? value 
      : PAGINATION.DEFAULT_PAGE_SIZE;
    
    this.itemsPerPage.set(validated);
    this.currentPage.set(1);
    this.loadUsers();
  }

  // ============ CRUD Operations ============

  /**
   * Navigate to user creation form
   */
  onAddUser(): void {
    if (!this.permissions().canCreateUser) {
      this.error.set(PERMISSION_MESSAGES.NO_CREATE);
      return;
    }
    
    this.router.navigate([ROUTES.PREMARITAL.USERS.CREATE]);
  }

  /**
   * Navigate to user edit form
   */
  onEditUser(user: User): void {
    if (!this.permissions().canEditUser) {
      this.error.set(PERMISSION_MESSAGES.NO_EDIT);
      return;
    }
    
    this.router.navigate([ROUTES.PREMARITAL.USERS.EDIT(user.id)]);
  }

  /**
   * Delete user with confirmation
   */
  onDeleteUser(user: User): void {
    if (!this.permissions().canDeleteUser) {
      this.error.set(PERMISSION_MESSAGES.NO_DELETE);
      return;
    }

    const userName = user.name ?? user.email;
    const confirmed = confirm(MESSAGES.CONFIRM.DELETE(userName));

    if (!confirmed) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.userService.deleteUser(user.id)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => this.handleDeleteSuccess(user),
        error: (err) => this.handleError(err, `Failed to delete user "${userName}"`)
      });
  }

  // ============ Success Handlers ============

  /**
   * Handle successful search
   */
  private handleSearchSuccess(res: PagedResponse): void {
    this.filteredUsers.set(res.data ?? []);
    this.totalItems.set(res.total ?? 0);
  }

  /**
   * Handle successful deletion
   */
  private handleDeleteSuccess(user: User): void {
    // Optimistic UI update
    this.filteredUsers.update(users => 
      users.filter(u => u.id !== user.id)
    );
    this.totalItems.update(total => total - 1);

    // Reload if current page is empty
    if (this.filteredUsers().length === 0 && this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
      this.loadUsers();
    }
  }

  // ============ Error Handling ============


/**
 * Type guard to check if error is HttpErrorResponse
 */
private isHttpError(error: unknown): error is HttpErrorResponse {
  return error instanceof HttpErrorResponse;
}

/**
 * Centralized error handling
 */
private handleError(err: unknown, defaultMessage: string): void {
  if (this.isHttpError(err)) {
    if (err.status === HTTP.STATUS_CODES.UNAUTHORIZED || 
        err.status === HTTP.STATUS_CODES.FORBIDDEN) {
      this.router.navigate([ROUTES.AUTH.LOGIN]);
    } else {
      const message = err.error?.message || defaultMessage;
      this.error.set(message);
      console.error(defaultMessage, err);
    }
  } else {
    // Handle non-HTTP errors
    const message = err instanceof Error ? err.message : defaultMessage;
    this.error.set(message);
    console.error(defaultMessage, err);
  }
}

  /**
   * Handle error and return empty response
   */
private handleErrorAndReturnEmpty(err: unknown): Observable<PagedResponse> {
    this.handleError(err, MESSAGES.ERROR.LOAD_FAILED);
    return of({ 
      data: [], 
      total: 0, 
      page: this.currentPage(), 
      pageSize: this.itemsPerPage() 
    } as PagedResponse);
  }

  // Retry loading after error
  retryLoad(): void {
    this.error.set(null);
    this.loadUsers();
  }

readonly pageNumbers = computed(() => 
  getPageNumbers({
    currentPage: this.currentPage(),
    totalPages: this.totalPages()
  })
);

}