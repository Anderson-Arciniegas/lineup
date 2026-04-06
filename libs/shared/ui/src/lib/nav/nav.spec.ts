import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { AppState, initialAuthState } from '@lineup/core';
import { provideMockStore } from '@ngrx/store/testing';
import { Apollo } from 'apollo-angular';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { Nav } from './nav';

describe('Nav', () => {
  let component: Nav;
  let fixture: ComponentFixture<Nav>;

  const initialState: AppState = {
    auth: initialAuthState,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nav, TranslateModule.forRoot()],
      providers: [
        { provide: Apollo, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        provideMockStore({ initialState }),
        TranslateService,
        TranslateStore,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Nav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
