import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { AppState, initialAuthState } from '@lineup/core';
import { provideMockStore } from '@ngrx/store/testing';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';
import { UserLayout } from './user-layout';

describe('UserLayout', () => {
  let component: UserLayout;
  let fixture: ComponentFixture<UserLayout>;

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
      imports: [UserLayout, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        { provide: Apollo, useValue: mockApollo },
        provideMockStore({ initialState }),
        TranslateService,
        TranslateStore,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
