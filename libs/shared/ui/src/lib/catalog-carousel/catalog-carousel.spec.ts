import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { CatalogCarousel } from './catalog-carousel';

describe('CatalogCarousel', () => {
  let component: CatalogCarousel;
  let fixture: ComponentFixture<CatalogCarousel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogCarousel, TranslateModule.forRoot(), RouterModule.forRoot([])],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore,
        DialogService,
        {
          provide: Apollo,
          useValue: {
            use: () => ({
              query: () => of({ data: { hasLikedProduct: false } }),
            }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogCarousel);
    component = fixture.componentInstance;
    component.products = [
      {
        productFiles: [{ file: { url: 'https://example.com/image.jpg' } }],
      },
    ] as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
