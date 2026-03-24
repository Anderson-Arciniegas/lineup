import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiscountPrivateService, UtilsService } from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { DiscountsPanelPage } from './discounts-panel-page';

describe('DiscountsPanelPage', () => {
  let component: DiscountsPanelPage;
  let fixture: ComponentFixture<DiscountsPanelPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscountsPanelPage, TranslateModule.forRoot()],
      providers: [
        TranslateService,
        TranslateStore,
        MessageService,
        DialogService,
        {
          provide: DiscountPrivateService,
          useValue: {
            findAllMyDiscountsByScope: () => of({ items: [] }),
          },
        },
        {
          provide: UtilsService,
          useValue: { navigate: () => {} },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DiscountsPanelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
