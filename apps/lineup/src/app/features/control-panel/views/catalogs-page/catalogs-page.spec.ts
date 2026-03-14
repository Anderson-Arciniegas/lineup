import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { CatalogsPage } from './catalogs-page';

describe('CatalogsPage', () => {
  let component: CatalogsPage;
  let fixture: ComponentFixture<CatalogsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogsPage, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore,
        MessageService,
        {
          provide: Apollo,
          useValue: { use: () => ({ query: () => of({ data: {} }), mutate: () => of({ data: {} }) }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
