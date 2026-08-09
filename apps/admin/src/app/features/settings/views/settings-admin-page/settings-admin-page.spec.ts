import { ComponentFixture, TestBed } from '@angular/core/testing';
import { translateModuleForTests } from '../../../../../testing';
import { SettingsAdminPage } from './settings-admin-page';

describe('SettingsAdminPage', () => {
  let fixture: ComponentFixture<SettingsAdminPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsAdminPage, translateModuleForTests()],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsAdminPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
