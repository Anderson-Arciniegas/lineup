import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateProductCard } from './create-product-card';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';

describe('CreateProductCard', () => {
  let component: CreateProductCard;
  let fixture: ComponentFixture<CreateProductCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CreateProductCard,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateProductCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});