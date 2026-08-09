import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { translateModuleForTests, adminTestProviders } from '../../../../testing';
import { AuthAdminLayout } from './auth-admin-layout';

describe('AuthAdminLayout', () => {
  let fixture: ComponentFixture<AuthAdminLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthAdminLayout, translateModuleForTests()],
      providers: [provideRouter([]), ...adminTestProviders()],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthAdminLayout);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
