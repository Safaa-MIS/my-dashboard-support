import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PremaritalComponent } from './premarital';

describe('PremaritalComponent', () => {
  let component: PremaritalComponent;
  let fixture: ComponentFixture<PremaritalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremaritalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PremaritalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
