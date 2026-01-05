import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilValidation } from './util-validation';

describe('UtilValidation', () => {
  let component: UtilValidation;
  let fixture: ComponentFixture<UtilValidation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilValidation],
    }).compileComponents();

    fixture = TestBed.createComponent(UtilValidation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
