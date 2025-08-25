import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { CreateCatalogCard } from './create-catalog-card';

describe('CreateCatalogCard', () => {
  let component: CreateCatalogCard;
  let fixture: ComponentFixture<CreateCatalogCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CreateCatalogCard,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateCatalogCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
