import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RatingPublicService } from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { of, throwError } from 'rxjs';
import { RateModal } from './rate-modal';

describe('RateModal', () => {
  let component: RateModal;
  let fixture: ComponentFixture<RateModal>;
  let dialogRef: { close: jest.Mock };
  let ratingService: { rateProduct: jest.Mock };
  let messageService: { add: jest.Mock };

  beforeEach(async () => {
    dialogRef = { close: jest.fn() };
    ratingService = { rateProduct: jest.fn(() => of({})) };
    messageService = { add: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [RateModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: MessageService, useValue: messageService },
        { provide: DynamicDialogRef, useValue: dialogRef },
        {
          provide: DynamicDialogConfig,
          useValue: { data: { idProduct: 42 } },
        },
        { provide: RatingPublicService, useValue: ratingService },
      ],
    })
      .overrideComponent(RateModal, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(RateModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar formulario inválido', () => {
    expect(component.form.valid).toBe(false);
    expect(component.selectedStars).toBe(0);
  });

  it('debe establecer estrellas con setStars', () => {
    component.setStars(4);
    expect(component.selectedStars).toBe(4);
    expect(component.form.valid).toBe(true);
  });

  it('debe marcar estrellas inválidas si no se tocaron', () => {
    expect(component.isStarsInvalid).toBe(false);
    component.form.get('stars')?.markAsTouched();
    expect(component.isStarsInvalid).toBe(true);
  });

  it('debe cerrar con false al cancelar', () => {
    component.cancel();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('debe enviar valoración y cerrar con true', () => {
    component.setStars(5);
    component.form.patchValue({ comment: 'Excelente' });
    component.submit();
    expect(ratingService.rateProduct).toHaveBeenCalledWith({
      idProduct: 42,
      stars: 5,
      comment: 'Excelente',
    });
    expect(messageService.add).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('no debe enviar formulario inválido', () => {
    component.submit();
    expect(ratingService.rateProduct).not.toHaveBeenCalled();
  });

  it('debe mostrar error si falla el envío', () => {
    ratingService.rateProduct.mockReturnValue(
      throwError(() => ({ message: 'Error de red' })),
    );
    component.setStars(3);
    component.submit();
    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error' }),
    );
    expect(component.attempt()).toBe(false);
  });

  it('debe mostrar error GraphQL al fallar envío', () => {
    ratingService.rateProduct.mockReturnValue(
      throwError(() => ({ graphQLErrors: [{ message: 'Rating blocked' }] })),
    );
    component.setStars(4);
    component.submit();
    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ detail: 'Rating blocked' }),
    );
  });

  it('no debe enviar si attempt está activo', () => {
    component.setStars(5);
    component.attempt.set(true);
    component.submit();
    expect(ratingService.rateProduct).not.toHaveBeenCalled();
  });
});

describe('RateModal sin idProduct', () => {
  let component: RateModal;
  let fixture: ComponentFixture<RateModal>;
  let ratingService: { rateProduct: jest.Mock };

  beforeEach(async () => {
    ratingService = { rateProduct: jest.fn(() => of({})) };

    await TestBed.configureTestingModule({
      imports: [RateModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: MessageService, useValue: { add: jest.fn() } },
        { provide: DynamicDialogRef, useValue: { close: jest.fn() } },
        { provide: DynamicDialogConfig, useValue: { data: {} } },
        { provide: RatingPublicService, useValue: ratingService },
      ],
    })
      .overrideComponent(RateModal, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(RateModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('no debe enviar sin idProduct', () => {
    component.setStars(5);
    component.submit();
    expect(ratingService.rateProduct).not.toHaveBeenCalled();
  });
});
