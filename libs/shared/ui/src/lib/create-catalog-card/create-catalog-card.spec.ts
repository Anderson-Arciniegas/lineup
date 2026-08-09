import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { AppConfigService, UtilsService } from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { CreateCatalogCard } from './create-catalog-card';

describe('CreateCatalogCard', () => {
  let component: CreateCatalogCard;
  let fixture: ComponentFixture<CreateCatalogCard>;
  let utilsService: { navigate: jest.Mock };

  beforeEach(async () => {
    utilsService = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [CreateCatalogCard, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        { provide: UtilsService, useValue: utilsService },
        DialogService,
        TranslateService,
        TranslateStore,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateCatalogCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe navegar al flujo de creación de catálogo', () => {
    component.createCatalog();
    expect(utilsService.navigate).toHaveBeenCalledWith([
      AppConfigService.config.routes.dashboard,
      AppConfigService.config.routes.catalogs,
      AppConfigService.config.routes.createCatalog,
    ]);
  });
});
