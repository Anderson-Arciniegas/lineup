import { HttpClientTestingModule } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { AuthStore } from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { createApolloMock } from '../../../../testing';
import { AuthService } from '../../../core/services/auth.service';
import { ControlPanelLayout } from './control-panel-layout';

describe('ControlPanelLayout', () => {
  let component: ControlPanelLayout;
  let fixture: ComponentFixture<ControlPanelLayout>;
  let signOut: jest.Mock;

  beforeEach(async () => {
    signOut = jest.fn();
    const { mock: apolloMock } = createApolloMock();

    await TestBed.configureTestingModule({
      imports: [
        ControlPanelLayout,
        RouterModule.forRoot([]),
        TranslateModule.forRoot(),
        HttpClientTestingModule,
      ],
      providers: [
        { provide: Apollo, useValue: apolloMock },
        {
          provide: AuthStore,
          useValue: {
            business: signal({ id: 1, path: 'my-shop', name: 'Shop' }),
            user: () => null,
            isUserLoggedIn: () => false,
            isBusinessLoggedIn: () => true,
          },
        },
        TranslateService,
        TranslateStore,
        { provide: AuthService, useValue: { signOut } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ControlPanelLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el layout', () => {
    expect(component).toBeTruthy();
  });

  it('items debe incluir entradas de menú cuando hay negocio', () => {
    const items = component.items();
    expect(items.length).toBeGreaterThan(0);
    expect(items.some((i) => i.url === '/dashboard/catalogs')).toBe(true);
    expect(
      items.some(
        (i) =>
          i.label === 'general.importProducts' &&
          i.url === '/dashboard/import-products',
      ),
    ).toBe(true);
  });

  it('toggleSidebar alterna sidebarOpen', () => {
    expect(component.sidebarOpen()).toBe(false);
    component.toggleSidebar();
    expect(component.sidebarOpen()).toBe(true);
    component.closeSidebar();
    expect(component.sidebarOpen()).toBe(false);
  });

  it('signOut debe delegar en AuthService', () => {
    const items = component.items();
    const signOutItem = items.find((i) => i.label === 'general.signOut');
    signOutItem?.command?.({} as any);
    expect(signOut).toHaveBeenCalled();
  });

  it('onDocumentEscape cierra sidebar si está abierto', () => {
    component.toggleSidebar();
    component.onDocumentEscape();
    expect(component.sidebarOpen()).toBe(false);
  });
});
