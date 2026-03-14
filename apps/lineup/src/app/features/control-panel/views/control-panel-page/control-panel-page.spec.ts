import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { AuthStore } from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';
import { ControlPanelPage } from './control-panel-page';

describe('ControlPanelPage', () => {
  let component: ControlPanelPage;
  let fixture: ComponentFixture<ControlPanelPage>;

  const mockAuthStore = {
    business: () => ({ path: 'test-business' }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlPanelPage, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore,
        { provide: AuthStore, useValue: mockAuthStore },
        {
          provide: Apollo,
          useValue: { use: () => ({ query: () => of({ data: {} }), mutate: () => of({ data: {} }) }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ControlPanelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
