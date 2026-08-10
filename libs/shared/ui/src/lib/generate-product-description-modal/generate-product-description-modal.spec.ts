import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GeminiService } from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { of, throwError } from 'rxjs';
import { GenerateProductDescriptionModal } from './generate-product-description-modal';

describe('GenerateProductDescriptionModal', () => {
  let component: GenerateProductDescriptionModal;
  let fixture: ComponentFixture<GenerateProductDescriptionModal>;
  let dialogRef: { close: jest.Mock };
  let generateProductDescription: jest.Mock;
  let messageAdd: jest.Mock;

  beforeEach(async () => {
    dialogRef = { close: jest.fn() };
    generateProductDescription = jest.fn(() => of('<p>HTML</p>'));
    messageAdd = jest.fn();

    await TestBed.configureTestingModule({
      imports: [GenerateProductDescriptionModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: DynamicDialogRef, useValue: dialogRef },
        {
          provide: DynamicDialogConfig,
          useValue: {
            data: {
              title: 'Producto',
              subtitle: 'Sub',
              imageUrls: ['https://cdn.example/a.png'],
            },
          },
        },
        {
          provide: GeminiService,
          useValue: { generateProductDescription },
        },
        { provide: MessageService, useValue: { add: messageAdd } },
        TranslateService,
        TranslateStore,
      ],
    })
      .overrideComponent(GenerateProductDescriptionModal, {
        set: { template: '' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(GenerateProductDescriptionModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('cancel cierra sin resultado', () => {
    component.cancel();
    expect(dialogRef.close).toHaveBeenCalledWith();
  });

  it('generate llama a Gemini y cierra con HTML', () => {
    component.userPrompt = 'Enfatiza calidad';
    component.generate();
    expect(generateProductDescription).toHaveBeenCalledWith({
      title: 'Producto',
      subtitle: 'Sub',
      imageUrls: ['https://cdn.example/a.png'],
      userPrompt: 'Enfatiza calidad',
    });
    expect(dialogRef.close).toHaveBeenCalledWith('<p>HTML</p>');
    expect(component.isGenerating()).toBe(false);
  });

  it('generate en error muestra toast y no cierra', () => {
    generateProductDescription.mockReturnValue(
      throwError(() => new Error('fail')),
    );
    component.generate();
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(messageAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error' }),
    );
    expect(component.isGenerating()).toBe(false);
  });
});
