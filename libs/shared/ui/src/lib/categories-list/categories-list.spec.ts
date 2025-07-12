import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { CategoriesList } from './categories-list';

describe('CategoriesList', () => {
  let component: CategoriesList;
  let fixture: ComponentFixture<CategoriesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesList, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
