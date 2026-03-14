import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SearchFilters } from './search-filters';

describe('SearchFilters', () => {
  let component: SearchFilters;
  let fixture: ComponentFixture<SearchFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchFilters, TranslateModule.forRoot()],
      providers: [
        { provide: DynamicDialogRef, useValue: { close: () => {} } },
        { provide: DynamicDialogConfig, useValue: { data: {} } },
        TranslateService,
        TranslateStore,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchFilters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
