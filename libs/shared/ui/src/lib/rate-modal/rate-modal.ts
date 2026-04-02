import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RatingPublicService } from '@lineup/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TextareaModule } from 'primeng/textarea';
import { Button } from '../button/button';

export interface RateModalData {
  idProduct: number;
}

@Component({
  selector: 'lib-rate-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    Button,
    TextareaModule,
  ],
  templateUrl: './rate-modal.html',
  styleUrl: './rate-modal.scss',
})
export class RateModal implements OnInit {
  form: FormGroup;
  attempt = signal(false);
  hoveredStar = signal(0);

  readonly stars = [1, 2, 3, 4, 5] as const;

  private readonly _fb = inject(FormBuilder);
  private readonly _ref = inject(DynamicDialogRef);
  private readonly _config = inject(DynamicDialogConfig);
  private readonly _ratingService = inject(RatingPublicService);
  private readonly _messageService = inject(MessageService);
  private readonly _translate = inject(TranslateService);

  ngOnInit(): void {
    this.form = this._fb.group({
      stars: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.maxLength(1000)]],
    });
  }

  get selectedStars(): number {
    return this.form.get('stars')?.value ?? 0;
  }

  get isStarsInvalid(): boolean {
    const control = this.form.get('stars');
    return (control?.invalid && control?.touched) ?? false;
  }

  setStars(value: number): void {
    this.form.get('stars')?.setValue(value);
  }

  cancel(): void {
    this._ref.close(false);
  }

  submit(): void {
    if (this.form.invalid || this.attempt()) {
      this.form.markAllAsTouched();
      return;
    }

    const data = this._config.data as RateModalData | undefined;
    const idProduct = data?.idProduct;

    if (!idProduct) {
      return;
    }

    this.attempt.set(true);

    const { stars, comment } = this.form.getRawValue();

    this._ratingService
      .rateProduct({ idProduct, stars, comment: comment || undefined })
      .subscribe({
        next: () => {
          this.attempt.set(false);
          this._messageService.add({
            severity: 'success',
            summary: this._translate.instant('general.success'),
            detail: this._translate.instant('general.ratingSubmitted'),
            life: 4000,
          });
          this._ref.close(true);
        },
        error: (err) => {
          this.attempt.set(false);
          this._messageService.add({
            severity: 'error',
            summary: this._translate.instant('general.error'),
            detail:
              err?.graphQLErrors?.[0]?.message ??
              err?.message ??
              this._translate.instant('general.errorRatingProduct'),
            life: 5000,
          });
        },
      });
  }
}
