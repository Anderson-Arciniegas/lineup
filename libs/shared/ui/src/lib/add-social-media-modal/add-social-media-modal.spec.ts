import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SocialNetworkPrivateService } from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { of, throwError } from 'rxjs';
import { AddSocialMediaModal } from './add-social-media-modal';

describe('AddSocialMediaModal (URL)', () => {
  let component: AddSocialMediaModal;
  let fixture: ComponentFixture<AddSocialMediaModal>;
  let dialogRef: { close: jest.Mock };
  let socialNetworkService: {
    createSocialNetworkBusiness: jest.Mock;
    updateSocialNetworkBusiness: jest.Mock;
  };

  beforeEach(async () => {
    dialogRef = { close: jest.fn() };
    socialNetworkService = {
      createSocialNetworkBusiness: jest.fn(() => of({ id: 1 })),
      updateSocialNetworkBusiness: jest.fn(() => of({ id: 2 })),
    };

    await TestBed.configureTestingModule({
      imports: [AddSocialMediaModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        MessageService,
        { provide: DynamicDialogRef, useValue: dialogRef },
        {
          provide: DynamicDialogConfig,
          useValue: {
            data: {
              socialMedia: { id: 1, code: 'INSTAGRAM', name: 'Instagram' },
              businessSocialNetwork: null,
            },
          },
        },
        { provide: SocialNetworkPrivateService, useValue: socialNetworkService },
      ],
    })
      .overrideComponent(AddSocialMediaModal, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(AddSocialMediaModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente con formulario URL', () => {
    expect(component).toBeTruthy();
    expect(component.whatsappMode).toBeFalsy();
    expect(component.socialMediaForm.get('url')).toBeTruthy();
  });

  it('debe detectar URL inválida cuando está touched', () => {
    component.socialMediaForm.patchValue({ url: 'not-a-url' });
    component.urlControl?.markAsTouched();
    expect(component.isUrlInvalid).toBe(true);
  });

  it('no debe marcar URL válida como inválida', () => {
    component.socialMediaForm.patchValue({ url: 'https://instagram.com/test' });
    component.urlControl?.markAsDirty();
    expect(component.isUrlInvalid).toBeFalsy();
  });

  it('debe detectar URL inválida', () => {
    component.socialMediaForm.patchValue({ url: 'not-a-url' });
    component.urlControl?.markAsDirty();
    expect(component.isUrlInvalid).toBe(true);
  });

  it('debe crear red social con URL válida', () => {
    component.socialMediaForm.patchValue({ url: 'https://instagram.com/test' });
    component.saveSocialMedia();
    expect(socialNetworkService.createSocialNetworkBusiness).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith({ id: 1 });
  });

  it('debe actualizar red social existente', () => {
    component.businessSocialNetwork = { id: 5 } as import('@lineup/core').SocialNetworkBusinessSchema;
    component.socialMediaForm.patchValue({ url: 'https://instagram.com/updated' });
    component.saveSocialMedia();
    expect(socialNetworkService.updateSocialNetworkBusiness).toHaveBeenCalled();
  });

  it('debe precargar URL de red social existente al iniciar', async () => {
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [AddSocialMediaModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        MessageService,
        { provide: DynamicDialogRef, useValue: { close: jest.fn() } },
        {
          provide: DynamicDialogConfig,
          useValue: {
            data: {
              socialMedia: { id: 1, code: 'INSTAGRAM', name: 'Instagram' },
              businessSocialNetwork: { id: 5, url: 'https://instagram.com/existing' },
            },
          },
        },
        { provide: SocialNetworkPrivateService, useValue: socialNetworkService },
      ],
    })
      .overrideComponent(AddSocialMediaModal, { set: { template: '' } })
      .compileComponents();
    const fix = TestBed.createComponent(AddSocialMediaModal);
    fix.detectChanges();
    expect(fix.componentInstance.socialMediaForm.get('url')?.value).toBe(
      'https://instagram.com/existing',
    );
  });

  it('no debe guardar formulario inválido', () => {
    component.socialMediaForm.patchValue({ url: '' });
    component.saveSocialMedia();
    expect(socialNetworkService.createSocialNetworkBusiness).not.toHaveBeenCalled();
  });

  it('debe manejar error al guardar', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    socialNetworkService.createSocialNetworkBusiness.mockReturnValue(
      throwError(() => new Error('fail')),
    );
    component.socialMediaForm.patchValue({ url: 'https://instagram.com/test' });
    component.saveSocialMedia();
    expect(component.attempt).toBe(false);
  });

  it('debe manejar error al actualizar red social', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    socialNetworkService.updateSocialNetworkBusiness.mockReturnValue(
      throwError(() => new Error('fail')),
    );
    component.businessSocialNetwork = { id: 5 } as import('@lineup/core').SocialNetworkBusinessSchema;
    component.socialMediaForm.patchValue({ url: 'https://instagram.com/updated' });
    component.saveSocialMedia();
    expect(component.attempt).toBe(false);
  });
});

describe('AddSocialMediaModal (WhatsApp)', () => {
  let component: AddSocialMediaModal;
  let fixture: ComponentFixture<AddSocialMediaModal>;
  let socialNetworkService: {
    updateSocialNetworkBusiness: jest.Mock;
  };

  beforeEach(async () => {
    socialNetworkService = {
      updateSocialNetworkBusiness: jest.fn(() => of({ id: 3 })),
    };

    await TestBed.configureTestingModule({
      imports: [AddSocialMediaModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        MessageService,
        { provide: DynamicDialogRef, useValue: { close: jest.fn() } },
        {
          provide: DynamicDialogConfig,
          useValue: {
            data: {
              socialMedia: { id: 2, code: 'WHATSAPP', name: 'WhatsApp' },
              businessSocialNetwork: { id: 3, phone: '+584121234567' },
            },
          },
        },
        {
          provide: SocialNetworkPrivateService,
          useValue: {
            createSocialNetworkBusiness: jest.fn(() => of({})),
            updateSocialNetworkBusiness: socialNetworkService.updateSocialNetworkBusiness,
          },
        },
      ],
    })
      .overrideComponent(AddSocialMediaModal, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(AddSocialMediaModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear formulario de teléfono para WhatsApp', () => {
    expect(component.whatsappMode).toBe(true);
    expect(component.socialMediaForm.get('phone')?.value).toBe('+584121234567');
  });

  it('debe actualizar teléfono WhatsApp', () => {
    component.socialMediaForm.patchValue({ phone: '+584129999999' });
    component.saveSocialMedia();
    expect(socialNetworkService.updateSocialNetworkBusiness).toHaveBeenCalled();
  });

  it('debe manejar error al guardar WhatsApp', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    socialNetworkService.updateSocialNetworkBusiness.mockReturnValue(
      throwError(() => new Error('fail')),
    );
    component.saveSocialMedia();
    expect(component.attempt).toBe(false);
  });
});
