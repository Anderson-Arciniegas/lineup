import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BusinessLayout } from './business-layout';

describe('BusinessLayout', () => {
  let component: BusinessLayout;
  let fixture: ComponentFixture<BusinessLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(BusinessLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
