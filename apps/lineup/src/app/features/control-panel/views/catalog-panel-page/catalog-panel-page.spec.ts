import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { CatalogPanelPage } from './catalog-panel-page';

describe('CatalogPanelPage', () => {
  let component: CatalogPanelPage;
  let fixture: ComponentFixture<CatalogPanelPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogPanelPage, TranslateModule.forRoot()],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { business: 'test-business', catalogPath: 'catalog' } } },
        },
        TranslateService,
        TranslateStore,
        DialogService,
        MessageService,
        {
          provide: Apollo,
          useValue: { use: () => ({ query: () => of({ data: {} }), mutate: () => of({ data: {} }) }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogPanelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
