import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of, Subject, throwError } from 'rxjs';
import { translateModuleForTests, adminTestProviders } from '../../../../../testing';
import { SocialNetworkAdminService } from '../../../../core/services/social-network-admin.service';
import { SocialNetworksAdminPage } from './social-networks-admin-page';

describe('SocialNetworksAdminPage', () => {
  let component: SocialNetworksAdminPage;
  let fixture: ComponentFixture<SocialNetworksAdminPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialNetworksAdminPage, translateModuleForTests()],
      providers: [
        ...adminTestProviders(),
        MessageService,
        {
          provide: SocialNetworkAdminService,
          useValue: {
            findAllSocialNetworks: () => of([{ id: 1, name: 'Facebook', code: 'FB' }]),
            removeSocialNetwork: () => of(true),
          },
        },
        {
          provide: DialogService,
          useValue: {
            open: () => ({
              onClose: of(false),
            }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SocialNetworksAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load networks', () => {
    expect(component).toBeTruthy();
    expect(component.networks().length).toBe(1);
    expect(component.loading()).toBe(false);
  });

  it('openCreate resets dialog network and opens modal', () => {
    component.openCreate();
    expect(component.dialogNetwork()).toBeNull();
    expect(component.dialogVisible()).toBe(true);
  });

  it('openEdit sets selected network', () => {
    const network = { id: 2, name: 'X', code: 'X' } as never;
    component.openEdit(network);
    expect(component.dialogNetwork()).toBe(network);
    expect(component.dialogVisible()).toBe(true);
  });

  it('onModalSaved reloads networks', () => {
    component.onModalSaved();
    expect(component.networks().length).toBe(1);
  });

  it('confirmRemoveSocialNetwork skips when dialog is cancelled', () => {
    const removeSpy = jest.spyOn(
      TestBed.inject(SocialNetworkAdminService),
      'removeSocialNetwork',
    );
    component.confirmRemoveSocialNetwork({ id: 1 } as never);
    expect(removeSpy).not.toHaveBeenCalled();
  });

  it('confirmRemoveSocialNetwork removes network when confirmed', () => {
    const closeSubject = new Subject<boolean>();
    jest.spyOn(TestBed.inject(DialogService), 'open').mockReturnValue({
      onClose: closeSubject.asObservable(),
    } as never);
    component.confirmRemoveSocialNetwork({ id: 1 } as never);
    closeSubject.next(true);
    expect(component.networks().length).toBe(1);
  });

  it('sets error when loading networks fails', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [SocialNetworksAdminPage, translateModuleForTests()],
      providers: [
        ...adminTestProviders(),
        MessageService,
        {
          provide: SocialNetworkAdminService,
          useValue: {
            findAllSocialNetworks: () => throwError(() => new Error('fail')),
            removeSocialNetwork: () => of(true),
          },
        },
        {
          provide: DialogService,
          useValue: { open: () => ({ onClose: of(false) }) },
        },
      ],
    }).compileComponents();
    const errorFixture = TestBed.createComponent(SocialNetworksAdminPage);
    errorFixture.detectChanges();
    expect(errorFixture.componentInstance.error()).toBe('admin.feature.loadError');
  });
});
