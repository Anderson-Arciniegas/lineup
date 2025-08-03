import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { CatalogCard } from './catalog-card';

describe('CatalogCard', () => {
  let component: CatalogCard;
  let fixture: ComponentFixture<CatalogCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogCard, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
