import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthDomain } from './auth-domain';

describe('AuthDomain', () => {
  let component: AuthDomain;
  let fixture: ComponentFixture<AuthDomain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthDomain],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthDomain);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
