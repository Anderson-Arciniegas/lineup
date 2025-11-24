import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BusinessSettingsPage } from './business-settings-page';

describe('BusinessSettingsPage', () => {
  let component: BusinessSettingsPage;
  let fixture: ComponentFixture<BusinessSettingsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessSettingsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(BusinessSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
