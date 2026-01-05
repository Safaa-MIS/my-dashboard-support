import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PremaritalDomain } from './premarital-domain';

describe('PremaritalDomain', () => {
  let component: PremaritalDomain;
  let fixture: ComponentFixture<PremaritalDomain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremaritalDomain],
    }).compileComponents();

    fixture = TestBed.createComponent(PremaritalDomain);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
