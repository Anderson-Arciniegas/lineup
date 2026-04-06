import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { BusinessSettingsPage } from './business-settings-page';

describe('BusinessSettingsPage', () => {
  let component: BusinessSettingsPage;
  let fixture: ComponentFixture<BusinessSettingsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessSettingsPage, TranslateModule.forRoot()],
      providers: [
        { provide: Apollo, useValue: {} },
        DialogService,
        MessageService,
        TranslateService,
        TranslateStore,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BusinessSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
