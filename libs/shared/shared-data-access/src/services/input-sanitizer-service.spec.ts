import { TestBed } from '@angular/core/testing';

import { InputSanitizerService } from './input-sanitizer-service';

describe('InputSanitizerService', () => {
  let service: InputSanitizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InputSanitizerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
