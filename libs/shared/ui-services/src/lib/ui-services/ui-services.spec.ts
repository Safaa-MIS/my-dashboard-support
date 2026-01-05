import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiServices } from './ui-services';

describe('UiServices', () => {
  let component: UiServices;
  let fixture: ComponentFixture<UiServices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiServices],
    }).compileComponents();

    fixture = TestBed.createComponent(UiServices);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
