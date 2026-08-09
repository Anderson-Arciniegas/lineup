import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationModal } from './confirmation-modal';

describe('ConfirmationModal', () => {
  let component: ConfirmationModal;
  let fixture: ComponentFixture<ConfirmationModal>;
  let dialogRef: { close: jest.Mock };

  beforeEach(async () => {
    dialogRef = { close: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [ConfirmationModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: DynamicDialogRef, useValue: dialogRef },
        {
          provide: DynamicDialogConfig,
          useValue: {
            data: { message: '¿Eliminar elemento?', color: 'danger' },
          },
        },
        TranslateService,
        TranslateStore,
      ],
    })
      .overrideComponent(ConfirmationModal, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(ConfirmationModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe leer message y color desde DynamicDialogConfig', () => {
    expect(component.message).toBe('¿Eliminar elemento?');
    expect(component.color).toBe('danger');
  });

  it('debe cerrar con false al cancelar', () => {
    component.cancel();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('debe cerrar con true al confirmar', () => {
    component.confirm();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });
});

describe('ConfirmationModal sin data', () => {
  it('debe usar valores por defecto', async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: DynamicDialogRef, useValue: { close: jest.fn() } },
        { provide: DynamicDialogConfig, useValue: { data: undefined } },
        TranslateService,
        TranslateStore,
      ],
    })
      .overrideComponent(ConfirmationModal, { set: { template: '' } })
      .compileComponents();

    const fixture = TestBed.createComponent(ConfirmationModal);
    const cmp = fixture.componentInstance;
    fixture.detectChanges();
    expect(cmp.message).toBeUndefined();
    expect(cmp.color).toBeUndefined();
  });
});
