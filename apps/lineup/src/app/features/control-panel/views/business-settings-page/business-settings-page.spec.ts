import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  AuthStore,
  BusinessPrivateService,
  ProvidersEnum,
} from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, of, throwError } from 'rxjs';
import { BusinessSettingsPage } from './business-settings-page';

describe('BusinessSettingsPage', () => {
  let component: BusinessSettingsPage;
  let fixture: ComponentFixture<BusinessSettingsPage>;
  let dialogOpen: jest.Mock;
  let onClose$: Subject<boolean>;
  let updateBusiness: jest.Mock;
  let setBusiness: jest.Mock;
  let messageAdd: jest.Mock;
  let businessRef: Record<string, unknown>;

  beforeEach(async () => {
    onClose$ = new Subject<boolean>();
    dialogOpen = jest.fn(() => ({ onClose: onClose$.asObservable() }));
    messageAdd = jest.fn();
    setBusiness = jest.fn();
    businessRef = {
      id: 1,
      email: 'owner@example.com',
      provider: ProvidersEnum.LINEUP,
      isBsEquivalentPriceEnabled: false,
    };
    updateBusiness = jest.fn(() =>
      of({ ...businessRef, isBsEquivalentPriceEnabled: true }),
    );

    await TestBed.configureTestingModule({
      imports: [BusinessSettingsPage, TranslateModule.forRoot()],
      providers: [
        { provide: DialogService, useValue: { open: dialogOpen } },
        { provide: MessageService, useValue: { add: messageAdd } },
        {
          provide: AuthStore,
          useValue: {
            business: () => businessRef,
            setBusiness,
          },
        },
        {
          provide: BusinessPrivateService,
          useValue: { updateBusiness },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BusinessSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear y enmascarar el email', () => {
    expect(component).toBeTruthy();
    expect(component.email).toBe('own**@example.com');
    expect(component.canChangeEmail).toBe(true);
  });

  it('canChangeEmail debe ser false con proveedor Google', () => {
    businessRef['provider'] = ProvidersEnum.GOOGLE;
    fixture = TestBed.createComponent(BusinessSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.canChangeEmail).toBe(false);
  });

  it('isProductPriceInBsToggle refleja la preferencia del negocio', () => {
    expect(component.isProductPriceInBsToggle).toBe(false);
    businessRef['isBsEquivalentPriceEnabled'] = true;
    fixture = TestBed.createComponent(BusinessSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.isProductPriceInBsToggle).toBe(true);
  });

  describe('onIsProductPriceInBsToggle', () => {
    it('debe persistir preferencia y actualizar store', () => {
      component.onIsProductPriceInBsToggle(true);
      expect(updateBusiness).toHaveBeenCalledWith({
        id: 1,
        isBsEquivalentPriceEnabled: true,
      });
      expect(setBusiness).toHaveBeenCalled();
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success' }),
      );
    });

    it('debe revertir en error', () => {
      updateBusiness.mockReturnValueOnce(
        throwError(() => new Error('fail')),
      );
      component.onIsProductPriceInBsToggle(true);
      expect(component.business.isBsEquivalentPriceEnabled).toBe(false);
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error' }),
      );
    });

    it('no debe hacer nada sin id de negocio', () => {
      businessRef['id'] = undefined;
      fixture = TestBed.createComponent(BusinessSettingsPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
      component.onIsProductPriceInBsToggle(true);
      expect(updateBusiness).not.toHaveBeenCalled();
    });
  });

  describe('changeEmail', () => {
    it('debe abrir verificación y luego modal de email', () => {
      component.changeEmail();
      expect(dialogOpen).toHaveBeenCalled();
      onClose$.next(true);
      expect(dialogOpen).toHaveBeenCalledTimes(2);
    });

    it('no debe abrir modal si verificación falla', () => {
      component.changeEmail();
      onClose$.next(false);
      expect(dialogOpen).toHaveBeenCalledTimes(1);
    });
  });

  describe('changePassword', () => {
    it('debe mostrar toast al confirmar cambio', () => {
      component.changePassword();
      onClose$.next(true);
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success' }),
      );
    });
  });
});
