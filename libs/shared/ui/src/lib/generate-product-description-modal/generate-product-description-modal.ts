import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '@lineup/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TextareaModule } from 'primeng/textarea';
import { Button } from '../button/button';

export interface GenerateProductDescriptionModalData {
  title: string;
  subtitle?: string;
  imageUrls: string[];
}

/**
 * Modal to collect optional AI instructions and generate a product sales description via Gemini.
 * Closes with the generated HTML string on success.
 */
@Component({
  selector: 'lib-generate-product-description-modal',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    Button,
    TextareaModule,
  ],
  templateUrl: './generate-product-description-modal.html',
  styleUrl: './generate-product-description-modal.scss',
})
export class GenerateProductDescriptionModal {
  userPrompt = '';
  readonly isGenerating = signal(false);

  private readonly _ref = inject(DynamicDialogRef);
  private readonly _config = inject(DynamicDialogConfig);
  private readonly _geminiService = inject(GeminiService);
  private readonly _messageService = inject(MessageService);
  private readonly _translate = inject(TranslateService);

  cancel(): void {
    if (this.isGenerating()) {
      return;
    }
    this._ref.close();
  }

  /** Calls Gemini and closes the dialog with the generated HTML description. */
  generate(): void {
    if (this.isGenerating()) {
      return;
    }

    const data = this._config.data as
      | GenerateProductDescriptionModalData
      | undefined;
    const title = data?.title?.trim() ?? '';
    if (!title) {
      this._messageService.add({
        severity: 'warn',
        summary: this._translate.instant('general.warning'),
        detail: this._translate.instant('validation.titleRequiredForAi'),
      });
      return;
    }

    this.isGenerating.set(true);
    this._geminiService
      .generateProductDescription({
        title,
        subtitle: data?.subtitle?.trim() || undefined,
        imageUrls: [...(data?.imageUrls ?? [])],
        userPrompt: this.userPrompt?.trim() || undefined,
      })
      .subscribe({
        next: (html) => {
          this.isGenerating.set(false);
          this._ref.close(html);
        },
        error: () => {
          this.isGenerating.set(false);
          this._messageService.add({
            severity: 'error',
            summary: this._translate.instant('general.error'),
            detail: this._translate.instant('general.aiDescriptionError'),
          });
        },
      });
  }
}
