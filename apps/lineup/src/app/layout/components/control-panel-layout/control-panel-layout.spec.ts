import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AppState, initialAuthState } from '@lineup/core';
import { provideMockStore } from '@ngrx/store/testing';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { ControlPanelLayout } from './control-panel-layout';

describe('ControlPanelLayout', () => {
  let component: ControlPanelLayout;
  let fixture: ComponentFixture<ControlPanelLayout>;

  const initialState: AppState = {
    auth: initialAuthState,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ControlPanelLayout,
        RouterModule.forRoot([]),
        HttpClientTestingModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        { provide: Apollo, useValue: {} },
        provideMockStore({ initialState }),
        TranslateService,
        TranslateStore,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ControlPanelLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
