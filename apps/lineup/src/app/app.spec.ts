import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AppState, BusinessPrivateService, initialAuthState, UserPublicService } from '@lineup/core';
import { provideMockStore } from '@ngrx/store/testing';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { App } from './app';
import { AuthService } from './core/services/auth.service';

describe('App', () => {
  const initialState: AppState = {
    auth: initialAuthState,
  };

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
    await TestBed.configureTestingModule({
      imports: [
        App,
        RouterModule.forRoot([]),
        TranslateModule.forRoot(),
        HttpClientTestingModule,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        { provide: Apollo, useValue: mockApollo },
        provideMockStore({ initialState }),
        TranslateService,
        TranslateStore,
        MessageService,
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have router-outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('ngAfterViewInit debe rehidratar sesión en browser', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [
        App,
        RouterModule.forRoot([]),
        TranslateModule.forRoot(),
        HttpClientTestingModule,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        { provide: Apollo, useValue: mockApollo },
        provideMockStore({ initialState }),
        TranslateService,
        TranslateStore,
        MessageService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: UserPublicService,
          useValue: { getMe: () => of({ id: 1 }), refreshToken: () => of({}) },
        },
        {
          provide: BusinessPrivateService,
          useValue: {
            myBusiness: () => of({ id: 2 }),
            refreshToken: () => of({}),
          },
        },
        {
          provide: AuthService,
          useValue: {
            setUser: jest.fn(),
            setBusiness: jest.fn(),
            removeUser: jest.fn(),
          },
        },
      ],
    }).compileComponents();
    const fix = TestBed.createComponent(App);
    fix.detectChanges();
    expect(TestBed.inject(AuthService).setUser).toHaveBeenCalled();
    expect(TestBed.inject(AuthService).setBusiness).toHaveBeenCalled();
  });
});
