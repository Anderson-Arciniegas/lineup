import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Button } from '../button/button';
export type ShareNetwork =
  | 'instagram'
  | 'whatsapp'
  | 'telegram'
  | 'email'
  | 'x'
  | 'facebook';

interface ShareOption {
  id: ShareNetwork;
  icon: string;
  label: string;
  getShareUrl: (url: string) => string;
}

@Component({
  selector: 'lib-share-modal',
  standalone: true,
  imports: [DialogModule, TranslateModule, Button, QRCodeComponent],
  templateUrl: './share-modal.html',
  styleUrl: './share-modal.scss',
})
export class ShareModal {
  readonly visible = input<boolean>(false);
  readonly url = input<string>('');
  readonly visibleChange = output<boolean>();

  private readonly dynamicDialogConfig = inject(DynamicDialogConfig, {
    optional: true,
  });

  readonly isInsideDynamicDialog = computed(() => !!this.dynamicDialogConfig);

  readonly displayUrl = computed(() => {
    const fromConfig = this.dynamicDialogConfig?.data?.url as
      | string
      | undefined;
    const fromInput = this.url();
    return (
      fromConfig ??
      fromInput ??
      (typeof window !== 'undefined' ? window.location.href : '')
    );
  });

  readonly copied = signal(false);

  readonly shareOptions: ShareOption[] = [
    {
      id: 'whatsapp',
      icon: 'pi pi-whatsapp',
      label: 'WhatsApp',
      getShareUrl: (url) => `https://wa.me/?text=${encodeURIComponent(url)}`,
    },
    {
      id: 'telegram',
      icon: 'pi pi-telegram',
      label: 'Telegram',
      getShareUrl: (url) =>
        `https://t.me/share/url?url=${encodeURIComponent(url)}`,
    },
    {
      id: 'x',
      icon: 'pi pi-twitter',
      label: 'X',
      getShareUrl: (url) =>
        `https://x.com/intent/tweet?url=${encodeURIComponent(url)}`,
    },
    {
      id: 'facebook',
      icon: 'pi pi-facebook',
      label: 'Facebook',
      getShareUrl: (url) =>
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      id: 'email',
      icon: 'pi pi-envelope',
      label: 'Email',
      getShareUrl: (url) =>
        `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent('Observa este producto')}&body=${encodeURIComponent(url)}`,
    },
  ];

  copyUrl(): void {
    const urlToCopy = this.displayUrl();
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(urlToCopy).then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
      });
    }
  }

  shareOn(network: ShareOption): void {
    if (typeof window === 'undefined') return;
    window.open(
      network.getShareUrl(this.displayUrl()),
      '_blank',
      'noopener,noreferrer',
    );
  }
}
