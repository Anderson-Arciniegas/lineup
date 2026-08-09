import { ComponentFixture, TestBed } from '@angular/core/testing';
import { translateModuleForTests } from '../../../../../testing';
import { DashboardAdminPage } from './dashboard-admin-page';

describe('DashboardAdminPage', () => {
  let fixture: ComponentFixture<DashboardAdminPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAdminPage, translateModuleForTests()],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardAdminPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
