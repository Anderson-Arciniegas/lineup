import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AppState, initialAuthState } from '@lineup/core';
import { provideMockStore } from '@ngrx/store/testing';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';
import { App } from './app';

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
});
