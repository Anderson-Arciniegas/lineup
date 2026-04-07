import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import {
  StatesPublicService,
  UserApiFilePublicService,
  UserPublicService,
  UtilsService,
} from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { createApolloMock } from '../../../../../testing';
import { ProfilePage } from './profile-page';

describe('ProfilePage', () => {
  let fixture: ComponentFixture<ProfilePage>;
  let component: ProfilePage;
  let getMe: jest.Mock;
  let updateUser: jest.Mock;
  let messageAdd: jest.Mock;

  const userMe = {
    id: 1,
    firstName: 'Ada',
    lastName: 'Lovelace',
    username: 'ada',
    profileImage: { url: 'https://x.com/a.png', name: 'code' },
  };

  beforeEach(async () => {
    getMe = jest.fn(() => of(userMe as any));
    updateUser = jest.fn(() => of({}));
    messageAdd = jest.fn();

    await TestBed.configureTestingModule({
      imports: [ProfilePage, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore,
        { provide: Apollo, useValue: createApolloMock().mock },
        { provide: MessageService, useValue: { add: messageAdd } },
        {
          provide: UserPublicService,
          useValue: { getMe, updateUser },
        },
        {
          provide: StatesPublicService,
          useValue: { findAllStates: () => of([]) },
        },
        {
          provide: UserApiFilePublicService,
          useValue: { post: jest.fn(() => of({ type: 0 } as any)) },
        },
        {
          provide: UtilsService,
          useValue: {
            blobToFile: (blob: Blob, name: string) =>
              new File([blob], name, { type: 'image/png' }),
            getExtensionFile: () => 'png',
            navigate: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  /**
   * `getMe` rellena el formulario y metadatos de imagen.
   */
  describe('carga de usuario', () => {
    it('debe hidratar el formulario con el perfil', () => {
      expect(getMe).toHaveBeenCalled();
      expect(component.profileForm.value.firstName).toBe('Ada');
      expect(component.imgCode).toBe('code');
    });
  });

  /**
   * Validación de username: solo caracteres permitidos.
   */
  describe('validación username', () => {
    it('debe invalidar caracteres fuera del patrón', () => {
      component.profileForm.patchValue({ username: 'no espacios' });
      expect(component.profileForm.get('username')?.valid).toBe(false);
    });

    it('debe aceptar username alfanumérico con ._-', () => {
      component.profileForm.patchValue({ username: 'user_01.name' });
      expect(component.profileForm.get('username')?.valid).toBe(true);
    });
  });

  /**
   * Persistencia del perfil vía `updateUser`.
   */
  describe('onSubmit', () => {
    it('no debe enviar si el formulario es inválido', () => {
      component.profileForm.patchValue({ firstName: '' });
      component.onSubmit();
      expect(updateUser).not.toHaveBeenCalled();
    });

    it('debe llamar updateUser cuando el formulario es válido', () => {
      component.profileForm.patchValue({
        firstName: 'Ada',
        lastName: 'L',
        username: 'ada',
        id: 1,
      });
      component.onSubmit();
      expect(updateUser).toHaveBeenCalled();
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success' }),
      );
    });
  });
});
