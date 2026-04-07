import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PendingTasks } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import {
  AuthStore,
  BusinessPublicService,
  CatalogPublicService,
  ProductPublicService,
  SeoService,
  UserPublicService,
  UtilsService,
} from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { createApolloMock } from '../../../../../testing';
import { BusinessPage } from './business-page';

describe('BusinessPage', () => {
  let fixture: ComponentFixture<BusinessPage>;
  let component: BusinessPage;
  let findBusinessByPath: jest.Mock;

  const businessDto = {
    id: 7,
    path: 'test-business',
    name: 'Negocio',
    hexColor: '#336699',
  };

  beforeEach(async () => {
    findBusinessByPath = jest.fn(() => of(businessDto as any));

    await TestBed.configureTestingModule({
      imports: [BusinessPage, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: Apollo, useValue: createApolloMock().mock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { business: 'test-business' } },
          },
        },
        TranslateService,
        TranslateStore,
        DialogService,
        { provide: MessageService, useValue: { add: jest.fn() } },
        {
          provide: PendingTasks,
          useValue: { add: () => () => void 0 },
        },
        {
          provide: AuthStore,
          useValue: {
            business: () => null,
            isUserLoggedIn: () => false,
            isBusinessLoggedIn: () => false,
          },
        },
        {
          provide: BusinessPublicService,
          useValue: {
            findBusinessByPath,
            isFollowingBusiness: () => of(false),
          },
        },
        {
          provide: ProductPublicService,
          useValue: {
            getAllPrimaryProductsByBusiness: () => of([]),
          },
        },
        {
          provide: CatalogPublicService,
          useValue: {
            findCatalogsByBusinessId: () => of({ items: [] }),
          },
        },
        { provide: SeoService, useValue: { setBusinessPage: jest.fn() } },
        {
          provide: UserPublicService,
          useValue: { recordVisit: () => of({}) },
        },
        { provide: UtilsService, useValue: { navigate: jest.fn() } },
      ],
    })
      .overrideComponent(BusinessPage, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(BusinessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Resuelve el negocio por path de URL y dispara carga de catálogos/productos.
   */
  describe('carga inicial', () => {
    it('debe obtener el negocio por path', () => {
      expect(findBusinessByPath).toHaveBeenCalledWith('test-business');
      expect(component.business?.id).toBe(7);
    });

    it('debe marcar myBusiness false si AuthStore no coincide', () => {
      expect(component.myBusiness).toBe(false);
    });
  });

  /**
   * Degradado de marca a partir del color hexadecimal del negocio.
   */
  describe('setColor', () => {
    it('debe generar gradiente y detectar luminancia', () => {
      component.setColor('#000000');
      expect(component.pageBackgroundGradient).toContain('linear-gradient');
      expect(component.isDarkBackground).toBe(true);
    });
  });
});
