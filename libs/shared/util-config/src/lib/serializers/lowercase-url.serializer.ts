import { Injectable } from '@angular/core';
import { DefaultUrlSerializer, UrlTree } from '@angular/router';

/**
 * URL Serializer that converts all URLs to lowercase before routing.
 * This ensures case-insensitive routing throughout the application.
 * ex:
 * /Applications/Premarital → /applications/premarital
 */
@Injectable()
export class LowerCaseUrlSerializer extends DefaultUrlSerializer {
  override parse(url: string): UrlTree {
    return super.parse(url.toLowerCase());
  }
}