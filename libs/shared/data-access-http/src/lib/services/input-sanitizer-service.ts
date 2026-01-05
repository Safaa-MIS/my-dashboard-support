import { inject, Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
/**
 * Input Sanitizer Service
 * Protects against XSS attacks by sanitizing user input
 In our component
 * private sanitizer = inject(InputSanitizerService);
 // Sanitize text input
 * const cleanEmail = this.sanitizer.sanitizeText(userInput);
 // Sanitize search query
 * const cleanSearch = this.sanitizer.sanitizeSearchQuery(searchText);
 // Sanitize HTML (for rich text editors)
 * const cleanHtml = this.sanitizer.sanitizeHtml(richTextContent);
 */
export class InputSanitizerService {
    domSanitizer = inject(DomSanitizer);

  /**
   * Sanitize plain text input (form fields, search boxes)
   *  Remove ( HTML tags , Script tags , Dangerous characters , Excessive whitespace )
   * 
   * @param input - Raw user input
   * @param maxLength - Maximum allowed length (default: 255)
   * @returns Sanitized text
   */
   sanitizeText(input: string | null | undefined, maxLength = 255): string {
    if (!input) return '';

    return input
      .trim()                                    // Remove leading/trailing whitespace
      .replace(/</g, '&lt;')                     // Encode < to prevent HTML injection
      .replace(/>/g, '&gt;')                     // Encode > to prevent HTML injection
      .replace(/"/g, '&quot;')                   // Encode quotes
      .replace(/'/g, '&#x27;')                   // Encode single quotes
      .replace(/\//g, '&#x2F;')                  // Encode forward slash
      .replace(/\\/g, '&#x5C;')                  // Encode backslash
      .replace(/\s+/g, ' ')                      // Collapse multiple spaces to one
      .substring(0, maxLength);                  // Enforce max length
  }

  /**
   * Sanitize email addresses
   * @param email - Email input
   * @returns Sanitized email or empty string if invalid format
   */
  sanitizeEmail(email: string | null | undefined): string {
    if (!email) return '';

    const sanitized = this.sanitizeText(email, 254); // RFC 5321 max length
    
    // Basic email validation pattern
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    return emailPattern.test(sanitized) ? sanitized.toLowerCase() : '';
  }

  /**
   * Sanitize search queries
   * More permissive than sanitizeText - allows some special characters
   * commonly used in searches
   * 
   * @param query - Search query
   * @param maxLength - Maximum length (default: 100)
   * @returns Sanitized search query
   */
  sanitizeSearchQuery(query: string | null | undefined, maxLength = 100): string {
    if (!query) return '';

    return query
      .trim()
      .replace(/[<>]/g, '')                      // Remove angle brackets only
      .replace(/['"]/g, '')                      // Remove quotes
      .replace(/\s+/g, ' ')                      // Collapse whitespace
      .substring(0, maxLength);
  }

  /**
   * Sanitize HTML content (for rich text editors)
   * we use this for trusted content that NEEDS to preserve HTML or its better to use sanitizeText
   * @param html - HTML content
   * @returns Safe HTML
   */
  sanitizeHtml(html: string | null | undefined): SafeHtml {
    if (!html) return '';
    // Angular's DomSanitizer removes dangerous elements
    // Allows: <b>, <i>, <u>, <p>, <br>, <a>, <ul>, <ol>, <li>
    // Removes: <script>, <iframe>, <object>, onclick, etc.
    return this.domSanitizer.sanitize(1, html) || '';
  }

   /**
   * Sanitize URL
   * Prevents javascript: and data: URL attacks
   * 
   * @param url - URL input
   * @returns Sanitized URL or empty string if dangerous
   */
  sanitizeUrl(url: string | null | undefined): string {
    if (!url) return '';

    const trimmed = url.trim().toLowerCase();
    
    // Block dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    
    if (dangerousProtocols.some(protocol => trimmed.startsWith(protocol))) {
      console.warn('Blocked dangerous URL:', url);
      return '';
    }

    // Only allow http, https, and relative URLs
    if (!trimmed.startsWith('http://') && 
        !trimmed.startsWith('https://') && 
        !trimmed.startsWith('/')) {
      return '';
    }

    return url.substring(0, 2048); // RFC 7230 recommended max
  }

  /**
   * Sanitize filename
   * Prevents path traversal attacks (../, ..\)
   * 
   * @param filename - Filename input
   * @returns Safe filename
   */
  sanitizeFilename(filename: string | null | undefined): string {
    if (!filename) return '';

    return filename
      .trim()
      .replace(/[/\\]/g, '')                     // Remove path separators
      .replace(/\.\./g, '')                      // Remove parent directory reference
      .replace(/[<>:"|?*]/g, '')                 // Remove invalid filename chars
      .replace(/\s+/g, '_')                      // Replace spaces with underscore
      .substring(0, 255);                        // Max filename length
  }

  /**
   * Sanitize SQL-like input (for additional protection)
   * NOTE: This is NOT a replacement for parameterized queries!
   * Backend MUST use prepared statements. This is defense-in-depth only.
   * 
   * @param input - Input that might be used in queries
   * @returns Sanitized input
   */
  sanitizeSqlInput(input: string | null | undefined): string {
    if (!input) return '';

    // Remove SQL metacharacters
    return input
      .trim()
      .replace(/[';\\]/g, '')                    // Remove quotes and backslash
      .replace(/--/g, '')                        // Remove SQL comments
      .replace(/\/\*/g, '')                      // Remove /* comments
      .replace(/\*\//g, '')                      // Remove */ comments
      .substring(0, 255);
  }

  /**
   * Sanitize numeric input
   * @param input - Input that should be a number
   * @returns Sanitized number or null if invalid
   */
  sanitizeNumber(input: string | number | null | undefined): number | null {
    if (input === null || input === undefined || input === '') return null;

    const parsed = typeof input === 'string' 
      ? parseFloat(input.replace(/[^0-9.-]/g, ''))
      : input;

    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Sanitize integer input
   * @param input - Input that should be an integer
   * @param min - Minimum allowed value
   * @param max - Maximum allowed value
   * @returns Sanitized integer or null if invalid
   */
  sanitizeInteger(
    input: string | number | null | undefined,
    min?: number,
    max?: number
  ): number | null {
    const num = this.sanitizeNumber(input);
    
    if (num === null) return null;

    const integer = Math.floor(num);
    
    if (min !== undefined && integer < min) return min;
    if (max !== undefined && integer > max) return max;
    
    return integer;
  }

  /**
   * Batch sanitize an object's string properties
   * Useful for sanitizing form data
   * @param obj - Object with string properties
   * @returns New object with sanitized values
   */
  sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized: any = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeText(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? this.sanitizeText(item) : item
        );
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized as T;
  }
}
