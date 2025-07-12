import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { CategoryItem } from './category-item';

describe('CategoryItem', () => {
  let component: CategoryItem;
  let fixture: ComponentFixture<CategoryItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryItem, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
