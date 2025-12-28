
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {  signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged, switchMap, catchError, of, finalize } from 'rxjs';
import { UserService } from '../../services/user-service';
import { PagedResponse } from '../../../models/paged-response';
import { User } from '../../../interfaces/User';

import { NavigationService } from '@my-dashboard-support/shared/shared-data-access';
@Component({
  selector: 'lib-premarital',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './premarital.html',
  styleUrl: './premarital.css',
})
export class PremaritalComponent implements OnInit,OnDestroy {
  // Modern dependency injection
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly navService = inject(NavigationService); 
  // Signals for reactive state
  readonly searchCategory = signal<string>('');
  readonly searchText = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly itemsPerPage = signal<number>(5);
  readonly filteredUsers = signal<User[]>([]);
  readonly totalItems = signal<number>(0);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Computed values
  readonly totalPages = computed(() => 
    Math.ceil(this.totalItems() / this.itemsPerPage())
  );

  readonly hasResults = computed(() => this.filteredUsers().length > 0);

  // Search subject for debouncing
  private readonly searchSubject$ = new Subject<void>();

  // Expose Math for template
  readonly Math = Math;

 ngOnInit(): void {
    //SET NAVIGATION
    this.navService.setNav([
      {
        label: 'Users',
        icon: 'bi-people',
        route: '/applications/premarital'
      },
      {
        label: 'Payments',
        icon: 'bi-credit-card',
        route: '/applications/premarital/payments'
      }
    ]);
    // Setup debounced search
    this.searchSubject$
      .pipe(
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged(),
        switchMap(() => this.fetchUsers()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

    // Initial load
    this.loadUsers();
  }

  /**
   * Load users with current filters and pagination
   */
  loadUsers(): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Sanitize inputs
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
        catchError((error: Error) => {
          console.error('Error loading users:', error);
          this.error.set('Failed to load users. Please try again.');
          return of({ data: [], total: 0, page: 1, pageSize: 0 } as PagedResponse);
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
   * Fetch users observable (used by debounced search)
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
        catchError((error: Error) => {
          console.error('Error fetching users:', error);
          this.error.set('Failed to load users. Please try again.');
          return of({ data: [], total: 0, page: 1, pageSize: 0 } as PagedResponse);
        }),
        finalize(() => this.isLoading.set(false))
      );
  }

  /**
   * Handle search form submission
   */
  onSearch(event: Event): void {
    event.preventDefault();
    this.currentPage.set(1); // Reset to first page
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
  pageChanged(event: Event, page: number): void {
    event.preventDefault();

    // Validate page number
    if (page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);
    this.loadUsers();
  }

  /**
   * Handle items per page change
   */
  onItemsPerPageChange(value: number): void {
    this.itemsPerPage.set(value);
    this.currentPage.set(1); // Reset to first page
    this.loadUsers();
  }

  /**
   * Get page numbers for pagination
   */
  getPageNumbers(): number[] {
    const totalPages = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    // Show max 5 pages
    const startPage = Math.max(1, current - 2);
    const endPage = Math.min(totalPages, current + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  /**
   * Sanitize user input to prevent XSS attacks
   */
  private sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
      .substring(0, 100); // Limit length to prevent DoS
  }

  /**
   * Retry loading users after error
   */
  retryLoad(): void {
    this.error.set(null);
    this.loadUsers();
  }

   ngOnDestroy(): void {
    //CLEAR NAVIGATION
    this.navService.clearNav();
  }
}