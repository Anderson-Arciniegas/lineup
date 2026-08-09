import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { AppState, initialAuthState } from '@lineup/core';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { UserLayout } from './user-layout';

describe('UserLayout', () => {
  let component: UserLayout;
  let fixture: ComponentFixture<UserLayout>;
  let signOut: jest.Mock;

  const initialState: AppState = { auth: initialAuthState };

  const mockApolloClient = {
    query: () => of({ data: { me: null, myBusiness: null } }),
    mutate: () =>
      of({
        data: {
          login: { user: null, business: null },
          refreshToken: { user: null, business: null },
        },
      }),
  };

  const mockApollo = {
    use: () => mockApolloClient,
  } as unknown as Apollo;

  beforeEach(async () => {
    signOut = jest.fn();

    await TestBed.configureTestingModule({
      imports: [
        UserLayout,
        RouterModule.forRoot([]),
        TranslateModule.forRoot(),
        HttpClientTestingModule,
      ],
      providers: [
        { provide: Apollo, useValue: mockApollo },
        provideMockStore({ initialState }),
        TranslateService,
        TranslateStore,
        { provide: AuthService, useValue: { signOut } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear y construir menú', () => {
    expect(component).toBeTruthy();
    expect(component.items.length).toBeGreaterThan(0);
    expect(component.items.some((i) => i.url === '/profile/settings')).toBe(true);
  });

  it('toggleSidebar y closeSidebar', () => {
    component.toggleSidebar();
    expect(component.sidebarOpen()).toBe(true);
    component.closeSidebar();
    expect(component.sidebarOpen()).toBe(false);
  });

  it('signOut debe delegar en AuthService', () => {
    const signOutItem = component.items.find(
      (i) => i.label === 'general.signOut',
    );
    signOutItem?.command?.({} as any);
    expect(signOut).toHaveBeenCalled();
  });

  it('onDocumentEscape cierra sidebar abierto', () => {
    component.toggleSidebar();
    component.onDocumentEscape();
    expect(component.sidebarOpen()).toBe(false);
  });
});
