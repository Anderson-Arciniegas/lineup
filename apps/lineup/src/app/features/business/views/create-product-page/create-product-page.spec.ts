import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateProductPage } from './create-product-page';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';

describe('CreateProductPage', () => {
  let component: CreateProductPage;
  let fixture: ComponentFixture<CreateProductPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CreateProductPage,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateProductPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
