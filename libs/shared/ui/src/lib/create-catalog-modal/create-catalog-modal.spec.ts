import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { CreateCatalogModal } from './create-catalog-modal';

describe('CreateCatalogModal', () => {
  let component: CreateCatalogModal;
  let fixture: ComponentFixture<CreateCatalogModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCatalogModal, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        DialogService,
        TranslateService,
        TranslateStore,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateCatalogModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
