import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilsService } from '@lineup/core';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { of, Subject, throwError } from 'rxjs';
import { translateModuleForTests, adminTestProviders } from '../../../../../testing';
import { AdminApiFileService } from '../../../../core/services/admin-api-file.service';
import { SocialNetworkAdminService } from '../../../../core/services/social-network-admin.service';
import { CreateSocialNetworkAdminModal } from './create-social-network-admin-modal';

describe('CreateSocialNetworkAdminModal', () => {
  let component: CreateSocialNetworkAdminModal;
  let fixture: ComponentFixture<CreateSocialNetworkAdminModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSocialNetworkAdminModal, translateModuleForTests()],
      providers: [
        ...adminTestProviders(),
        MessageService,
        {
          provide: UtilsService,
          useValue: {
            normalizeSpaces: (v: string) => v.trim(),
            blobToFile: (blob: Blob) => blob,
            getExtensionFile: () => 'png',
          },
        },
        {
          provide: AdminApiFileService,
          useValue: {
            upload: () => of({ name: 'file.png', url: 'https://cdn/file.png' }),
          },
        },
        {
          provide: SocialNetworkAdminService,
          useValue: {
            createSocialNetwork: () => of({ id: 1 }),
            updateSocialNetwork: () => of({ id: 1 }),
          },
        },
        {
          provide: DialogService,
          useValue: {
            open: () =>
              ({
                onClose: of(undefined),
                close: jest.fn(),
              }) as unknown as DynamicDialogRef,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateSocialNetworkAdminModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('dialogHeaderKey reflects create mode', () => {
    expect(component.dialogHeaderKey).toBe('admin.socialNetworkModal.createTitle');
  });

  it('close hides dialog', () => {
    component.visible.set(true);
    component.close();
    expect(component.visible()).toBe(false);
  });

  it('submit warns when image is missing on create', () => {
    const add = jest.spyOn(component['messageService'], 'add');
    component.form.setValue({ name: 'Facebook', code: 'FB' });
    component.submit();
    expect(add).toHaveBeenCalled();
  });

  it('submit creates social network when form and image are valid', () => {
    const createSpy = jest.spyOn(
      TestBed.inject(SocialNetworkAdminService),
      'createSocialNetwork',
    );
    component.imageCode.set('img-code');
    component.form.setValue({ name: 'Facebook', code: 'fb' });
    component.submit();
    expect(createSpy).toHaveBeenCalled();
  });

  it('submit updates social network in edit mode', () => {
    const updateSpy = jest.spyOn(
      TestBed.inject(SocialNetworkAdminService),
      'updateSocialNetwork',
    );
    component.visible.set(true);
    fixture.componentRef.setInput('network', {
      id: 1,
      name: 'Facebook',
      code: 'FB',
      imageCode: 'img',
    });
    fixture.detectChanges();
    component.form.setValue({ name: 'Facebook Updated', code: 'FB' });
    component.submit();
    expect(updateSpy).toHaveBeenCalled();
  });

  it('submit marks form when invalid', () => {
    const markAllAsTouched = jest.spyOn(component.form, 'markAllAsTouched');
    component.submit();
    expect(markAllAsTouched).toHaveBeenCalled();
  });

  it('dialogHeaderKey reflects edit mode', () => {
    fixture.componentRef.setInput('network', {
      id: 1,
      name: 'Facebook',
      code: 'FB',
    });
    fixture.detectChanges();
    expect(component.dialogHeaderKey).toBe('admin.socialNetworkModal.editTitle');
  });

  it('openImageCropper uploads cropped image', () => {
    const closeSubject = new Subject<string>();
    jest.spyOn(TestBed.inject(DialogService), 'open').mockReturnValue({
      onClose: closeSubject.asObservable(),
      close: jest.fn(),
    } as unknown as DynamicDialogRef);
    component.openImageCropper();
    closeSubject.next('data:image/png;base64,abc');
    expect(component.imageCode()).toBe('file.png');
  });

  it('uploadFromBase64 shows error toast on failure', () => {
    jest
      .spyOn(TestBed.inject(AdminApiFileService), 'upload')
      .mockReturnValue(throwError(() => new Error('upload fail')));
    const add = jest.spyOn(component['messageService'], 'add');
    component['uploadFromBase64']('data:image/png;base64,abc');
    expect(add).toHaveBeenCalled();
    expect(component.uploadFailed()).toBe(true);
  });

  it('onDialogHide closes cropper ref', () => {
    const close = jest.fn();
    component['cropperRef'] = { close } as unknown as DynamicDialogRef;
    component.onDialogHide();
    expect(close).toHaveBeenCalled();
  });
});
