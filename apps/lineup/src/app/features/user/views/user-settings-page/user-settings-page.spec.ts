import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthStore, ProvidersEnum } from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { UserSettingsPage } from './user-settings-page';

describe('UserSettingsPage', () => {
  let component: UserSettingsPage;
  let fixture: ComponentFixture<UserSettingsPage>;
  let dialogOpen: jest.Mock;
  let onClose$: Subject<boolean>;
  let messageAdd: jest.Mock;
  let userRef: Record<string, unknown>;

  beforeEach(async () => {
    onClose$ = new Subject<boolean>();
    dialogOpen = jest.fn(() => ({ onClose: onClose$.asObservable() }));
    messageAdd = jest.fn();
    userRef = {
      id: 1,
      email: 'user@example.com',
      provider: ProvidersEnum.LINEUP,
    };

    await TestBed.configureTestingModule({
      imports: [UserSettingsPage, TranslateModule.forRoot()],
      providers: [
        { provide: DialogService, useValue: { open: dialogOpen } },
        { provide: MessageService, useValue: { add: messageAdd } },
        {
          provide: AuthStore,
          useValue: { user: () => userRef },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear y enmascarar email', () => {
    expect(component).toBeTruthy();
    expect(component.email).toBe('use*@example.com');
    expect(component.canChangeEmail).toBe(true);
  });

  it('canChangeEmail debe ser false con Google', () => {
    userRef['provider'] = ProvidersEnum.GOOGLE;
    fixture = TestBed.createComponent(UserSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.canChangeEmail).toBe(false);
  });

  describe('changePassword', () => {
    it('debe mostrar toast al confirmar', () => {
      component.changePassword();
      onClose$.next(true);
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success' }),
      );
    });
  });

  describe('changeEmail', () => {
    it('debe abrir verificación y modal de email', () => {
      component.changeEmail();
      onClose$.next(true);
      expect(dialogOpen).toHaveBeenCalledTimes(2);
    });

    it('debe actualizar email enmascarado tras éxito', () => {
      component.changeEmail();
      onClose$.next(true);
      onClose$.next(true);
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success' }),
      );
    });

    it('no debe continuar si verificación falla', () => {
      component.changeEmail();
      onClose$.next(false);
      expect(dialogOpen).toHaveBeenCalledTimes(1);
    });
  });
});
