import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  BusinessPublicService,
  CatalogPublicService,
  ProductPublicService,
} from '@lineup/core';
import { of } from 'rxjs';
import { CatalogDownloadPage } from './catalog-download-page';

describe('CatalogDownloadPage', () => {
  let component: CatalogDownloadPage;
  let fixture: ComponentFixture<CatalogDownloadPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogDownloadPage],
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { business: 'test-business', catalogPath: 'test-catalog' },
              queryParams: {},
            },
          },
        },
        {
          provide: BusinessPublicService,
          useValue: { findBusinessByPath: () => of({ id: 1, name: 'Test' }) },
        },
        {
          provide: CatalogPublicService,
          useValue: {
            findOneCatalogByPath: () => of({ id: 1, title: 'Cat' }),
          },
        },
        {
          provide: ProductPublicService,
          useValue: { getAllByCatalog: () => of([]) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogDownloadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
