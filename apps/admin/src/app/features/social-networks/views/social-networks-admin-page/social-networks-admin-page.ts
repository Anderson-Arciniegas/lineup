import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { SocialNetworkSchema } from '@lineup/core';
import { Button, ConfirmationModal } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { finalize, take } from 'rxjs';
import { CreateSocialNetworkAdminModal } from '../../components/create-social-network-admin-modal/create-social-network-admin-modal';
import { SocialNetworkAdminService } from '../../../../core/services/social-network-admin.service';

@Component({
  selector: 'app-social-networks-admin-page',
  imports: [
    CommonModule,
    TranslateModule,
    Button,
    CreateSocialNetworkAdminModal,
  ],
  templateUrl: './social-networks-admin-page.html',
  styleUrl: './social-networks-admin-page.scss',
})
export class SocialNetworksAdminPage implements OnInit {
  private readonly socialAdmin = inject(SocialNetworkAdminService);
  private readonly dialogService = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);
  private readonly messageService = inject(MessageService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly networks = signal<SocialNetworkSchema[]>([]);

  readonly dialogVisible = signal(false);
  readonly dialogNetwork = signal<SocialNetworkSchema | null>(null);

  readonly attemptDelete = signal(false);

  ngOnInit(): void {
    this.loadNetworks();
  }

  openCreate(): void {
    this.dialogNetwork.set(null);
    this.dialogVisible.set(true);
  }

  openEdit(network: SocialNetworkSchema): void {
    this.dialogNetwork.set(network);
    this.dialogVisible.set(true);
  }

  onModalSaved(): void {
    this.loadNetworks();
  }

  confirmRemoveSocialNetwork(network: SocialNetworkSchema): void {
    const ref = this.dialogService.open(ConfirmationModal, {
      width: '500px',
      style: { maxHeight: '80vh' },
      breakpoints: {
        '640px': '450px',
        '500px': '80vw',
        '400px': '90vw',
      },
      data: {
        message: this.translate.instant(
          'confirmation.doYouWantToDeleteThisSocialNetwork',
        ),
        color: 'danger',
      },
      modal: true,
      draggable: false,
      resizable: false,
    });

    ref.onClose
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed: boolean) => {
        if (!confirmed || this.attemptDelete()) {
          return;
        }
        this.attemptDelete.set(true);
        this.socialAdmin
          .removeSocialNetwork(network.id)
          .pipe(finalize(() => this.attemptDelete.set(false)))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('general.success'),
                detail: this.translate.instant('admin.socialNetworkModal.deleteOk'),
                life: 3000,
              });
              this.loadNetworks();
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('general.error'),
                detail: this.translate.instant(
                  'admin.socialNetworkModal.deleteError',
                ),
                life: 4000,
              });
            },
          });
      });
  }

  private loadNetworks(): void {
    this.loading.set(true);
    this.error.set(null);
    this.socialAdmin
      .findAllSocialNetworks()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (list) => {
          this.networks.set(list ?? []);
        },
        error: () => {
          this.error.set('admin.feature.loadError');
        },
      });
  }
}
