import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilPagination } from './util-pagination';

describe('UtilPagination', () => {
  let component: UtilPagination;
  let fixture: ComponentFixture<UtilPagination>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilPagination],
    }).compileComponents();

    fixture = TestBed.createComponent(UtilPagination);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
