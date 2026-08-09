import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationEnd, provideRouter, Router } from '@angular/router';
import { translateModuleForTests } from '../../../../testing';
import { AuthAdminService } from '../../../core/services/auth-admin.service';
import { ShellAdminLayout } from './shell-admin-layout';

describe('ShellAdminLayout', () => {
  let component: ShellAdminLayout;
  let fixture: ComponentFixture<ShellAdminLayout>;
  let signOut: jest.Mock;

  beforeEach(async () => {
    signOut = jest.fn();
    await TestBed.configureTestingModule({
      imports: [ShellAdminLayout, translateModuleForTests()],
      providers: [
        provideRouter([]),
        {
          provide: AuthAdminService,
          useValue: { signOut },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShellAdminLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggleSidebar toggles sidebarOpen signal', () => {
    expect(component.sidebarOpen()).toBe(false);
    component.toggleSidebar();
    expect(component.sidebarOpen()).toBe(true);
    component.toggleSidebar();
    expect(component.sidebarOpen()).toBe(false);
  });

  it('closeSidebar sets sidebarOpen to false', () => {
    component.toggleSidebar();
    component.closeSidebar();
    expect(component.sidebarOpen()).toBe(false);
  });

  it('signOut delegates to AuthAdminService', () => {
    component.signOut();
    expect(signOut).toHaveBeenCalledWith(true);
  });

  it('onDocumentEscape closes sidebar when open', () => {
    component.toggleSidebar();
    component.onDocumentEscape();
    expect(component.sidebarOpen()).toBe(false);
  });

  it('closes sidebar on NavigationEnd', () => {
    component.toggleSidebar();
    TestBed.inject(Router).events.next(
      new NavigationEnd(1, '/dashboard', '/dashboard'),
    );
    expect(component.sidebarOpen()).toBe(false);
  });
});
