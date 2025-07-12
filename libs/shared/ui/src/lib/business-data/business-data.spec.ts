import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BusinessData } from './business-data';

describe('BusinessData', () => {
  let component: BusinessData;
  let fixture: ComponentFixture<BusinessData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessData],
    }).compileComponents();

    fixture = TestBed.createComponent(BusinessData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
