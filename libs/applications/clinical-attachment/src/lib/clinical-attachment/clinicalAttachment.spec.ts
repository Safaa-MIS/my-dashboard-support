import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClinicalAttachment } from './clinicalAttachment';

describe('ClinicalAttachment', () => {
  let component: ClinicalAttachment;
  let fixture: ComponentFixture<ClinicalAttachment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicalAttachment],
    }).compileComponents();

    fixture = TestBed.createComponent(ClinicalAttachment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
