export interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  maxVisiblePages?: number;
}

export function getPageNumbers(config: PaginationConfig): (number | string)[] {
  const { currentPage, totalPages, maxVisiblePages = 7 } = config;
  const pages: (number | string)[] = [];

  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  pages.push(1);

  if (currentPage > 3) pages.push('...');

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) pages.push('...');
  
  pages.push(totalPages);

  return pages;
}