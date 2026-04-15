import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import {
  AuthStore,
  BusinessHourSchema,
  BusinessPrivateService,
  BusinessPublicService,
  BusinessSchema,
  CurrencyPrivateService,
  CurrencySchema,
  CurrencySymbolPipe,
  DiscountSchema,
  DiscountScopeEnum,
  DiscountTypeEnum,
  FileThumbnailUrlPipe,
  LocationSchema,
  SocialNetworkBusinessSchema,
  SocialNetworkPrivateService,
  StatusEnum,
  UtilsService,
  WeekDayEnum,
} from '@lineup/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ChipModule } from 'primeng/chip';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
import { BusinessHoursViewModal } from '../business-hours-view-modal/business-hours-view-modal';
import { BusinessLocationsModal } from '../business-locations-modal/business-locations-modal';
import { Button } from '../button/button';
import { LocationModal } from '../location-modal/location-modal';
import { ShareModal } from '../share-modal/share-modal';

/**
 * Cabecera rica del negocio en vista pública: marca, descuentos, redes, ubicaciones,
 * horarios, moneda preferida, seguir/dejar de seguir y modales asociados.
 */
@Component({
  selector: 'lib-business-data',
  imports: [
    CommonModule,
    FileThumbnailUrlPipe,
    TagModule,
    Button,
    TranslateModule,
    SkeletonModule,
    ChipModule,
    TooltipModule,
    PopoverModule,
    ColorPickerModule,
    FormsModule,
    InputTextModule,
    CurrencySymbolPipe,
  ],
  templateUrl: './business-data.html',
  styleUrl: './business-data.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BusinessData implements OnInit, OnChanges, OnDestroy {
  @Input() business: BusinessSchema;
  @Input() myBusiness: boolean;
  /**
   * Contraste sobre el degradado de la página: `true` texto claro, `false` texto oscuro.
   * Si no se define, no se aplican estilos de tema (p. ej. fuera de business-page).
   */
  @Input() useLightText?: boolean;
  @Output() colorChange = new EventEmitter<string>();
  ref: DynamicDialogRef;
  businessSocialNetworks: SocialNetworkBusinessSchema[] = [];
  attempt: boolean;
  following = false;
  followers = 0;
  color = '#ffffff';
  attemptColor = false;
  discount: DiscountSchema;
  DiscountTypeEnum = DiscountTypeEnum;
  DiscountScopeEnum = DiscountScopeEnum;
  currencies: CurrencySchema[] = [];

  private readonly _authStore = inject(AuthStore);
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);
  private readonly _socialMediaService = inject(SocialNetworkPrivateService);
  private readonly _utilsService = inject(UtilsService);
  private readonly _sanitizer = inject(DomSanitizer);
  private readonly _businessPublicService = inject(BusinessPublicService);
  private readonly _businessPrivateService = inject(BusinessPrivateService);
  private readonly _messageService = inject(MessageService);
  private readonly _currencyService = inject(CurrencyPrivateService);

  private _subscriptions = new Subscription();

  readonly orderedWeekDays: WeekDayEnum[] = [
    WeekDayEnum.MONDAY,
    WeekDayEnum.TUESDAY,
    WeekDayEnum.WEDNESDAY,
    WeekDayEnum.THURSDAY,
    WeekDayEnum.FRIDAY,
    WeekDayEnum.SATURDAY,
    WeekDayEnum.SUNDAY,
  ];

  userMode = computed(() => this._authStore.isUserLoggedIn());

  ngOnInit(): void {
    this._subscriptions.add(
      this._currencyService.findAllCurrencies().subscribe({
        next: (currencies) => {
          this.currencies = currencies ?? [];
        },
      }),
    );
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    void changes;
    if (this.business) {
      this.followers = this.business.followers;
      this.isFollowingBusiness();
      this.getMySocialNetworkBusinesses();
      this.color = this.business.hexColor ?? '#ffffff';
      this.discount = this.business.discounts.find(
        (discount) =>
          discount.scope === DiscountScopeEnum.BUSINESS &&
          discount.status === StatusEnum.ACTIVE,
      );
    }
  }

  getDescription() {
    return this._sanitizer.bypassSecurityTrustHtml(
      this.business?.description ?? '',
    );
  }

  discountCurrencyCode(): string | undefined {
    const id = this.discount?.idCurrency;
    if (id == null) return undefined;
    return this.currencies.find((c) => c.id === id)?.code;
  }

  getSocialNetworkUrl(id: number) {
    const socialNetwork = this.businessSocialNetworks.find(
      (socialNetwork) => Number(socialNetwork.socialNetwork.id) === Number(id),
    );
    if (socialNetwork?.url) {
      return socialNetwork.url;
    } else if (socialNetwork.socialNetwork.code === 'WHATSAPP') {
      const href = this._utilsService.formatWhatsappPhone(
        socialNetwork?.phone,
        'Hola',
      );

      return href;
    } else {
      return '';
    }
  }

  getMySocialNetworkBusinesses() {
    this.attempt = true;
    this._subscriptions.add(
      this._socialMediaService.findByBusiness(this.business.id).subscribe({
        next: (socialNetworkBusinesses) => {
          if (socialNetworkBusinesses.length > 0) {
            this.businessSocialNetworks = socialNetworkBusinesses;
          } else {
            this.businessSocialNetworks = [];
          }
          this.attempt = false;
        },
        error: (error) => {
          console.error(error);
          this.attempt = false;
        },
      }),
    );
  }

  share() {
    this.ref = this._dialogService.open(ShareModal, {
      header: this._translate.instant('general.share'),
      width: '550px',
      style: { maxHeight: '80vh' },
      breakpoints: {
        '640px': '450px',
        '500px': '80vw',
        '400px': '90vw',
      },
      data: {
        url: location.href,
      },
      modal: true,
      closable: true,
    });
  }

  /**
   * Formatea el número de seguidores al estilo redes sociales:
   * - >= 1.000.000: 1 M, 2 M, 1.9 M (trunca a 1 decimal, sin redondear hacia arriba)
   * - >= 1.000: 1 m, 2 m, 999.9 m (trunca a 1 decimal, sin redondear hacia arriba)
   * - < 1.000: valor sin formatear
   */
  formatFollowers(count: number): string {
    if (count == null || count < 0) return '0';
    if (count >= 1_000_000) {
      const value = count / 1_000_000;
      const display = value % 1 === 0 ? value : Math.floor(value * 10) / 10;
      return `${display} M`;
    }
    if (count >= 1_000) {
      const value = count / 1_000;
      const display = value % 1 === 0 ? value : Math.floor(value * 10) / 10;
      return `${display} m`;
    }
    return String(count);
  }

  getAddress(address: string): string {
    return address.split(',').slice(0, 2).join(', ');
  }

  get hasBusinessHours(): boolean {
    return (this.business?.businessHours?.length ?? 0) > 0;
  }

  get businessHoursSummaryLabel(): string | null {
    if (!this.hasBusinessHours) return null;
    const summary = this.buildBusinessHoursSummary(
      this.business.businessHours ?? [],
    );
    return summary.kind === 'uniform' ? summary.label : null;
  }

  get shouldShowBusinessHoursChip(): boolean {
    if (!this.hasBusinessHours) return false;
    const summary = this.buildBusinessHoursSummary(
      this.business.businessHours ?? [],
    );
    return summary.kind === 'varied';
  }

  openBusinessHoursModal(): void {
    if (!this.hasBusinessHours) return;
    this.ref = this._dialogService.open(BusinessHoursViewModal, {
      header: this._translate.instant('general.businessHours'),
      width: '620px',
      style: { maxHeight: '90vh' },
      breakpoints: {
        '640px': '520px',
        '500px': '86vw',
        '400px': '92vw',
      },
      data: {
        businessName: this.business?.name,
        businessHours: this.business?.businessHours ?? [],
      },
      modal: true,
      closable: true,
    });
  }

  private buildBusinessHoursSummary(
    hours: BusinessHourSchema[],
  ):
    | { kind: 'uniform'; label: string }
    | { kind: 'varied' }
    | { kind: 'none' } {
    if (hours.length === 0) return { kind: 'none' };

    const byDay = new Map<WeekDayEnum, BusinessHourSchema[]>();
    for (const day of this.orderedWeekDays) byDay.set(day, []);
    for (const h of hours) {
      const list = byDay.get(h.dayOfWeek) ?? [];
      byDay.set(h.dayOfWeek, [...list, h]);
    }

    const daysWithHours = this.orderedWeekDays.filter(
      (d) => (byDay.get(d)?.length ?? 0) > 0,
    );
    if (daysWithHours.length === 0) return { kind: 'none' };

    // Uniforme solo si cada día registrado tiene exactamente 1 franja y todas coinciden.
    const firstDay = daysWithHours[0];
    const firstSlots = [...(byDay.get(firstDay) ?? [])].sort(
      (a, b) => (a.slotOrder ?? 0) - (b.slotOrder ?? 0),
    );
    if (firstSlots.length !== 1) return { kind: 'varied' };

    const base = firstSlots[0];
    for (const day of daysWithHours) {
      const slots = [...(byDay.get(day) ?? [])].sort(
        (a, b) => (a.slotOrder ?? 0) - (b.slotOrder ?? 0),
      );
      if (slots.length !== 1) return { kind: 'varied' };
      const s = slots[0];
      if (
        s.opensAtMinute !== base.opensAtMinute ||
        s.closesAtMinute !== base.closesAtMinute
      ) {
        return { kind: 'varied' };
      }
    }

    const label = this.formatUniformHoursLabel(
      daysWithHours,
      base.opensAtMinute,
      base.closesAtMinute,
    );
    if (!label) return { kind: 'varied' };
    return { kind: 'uniform', label };
  }

  private formatUniformHoursLabel(
    days: WeekDayEnum[],
    opensAtMinute: number,
    closesAtMinute: number,
  ): string | null {
    const opens = this.formatMinutesTo12h(opensAtMinute);
    const closes = this.formatMinutesTo12h(closesAtMinute);

    const indices = [
      ...new Set(days.map((d) => this.orderedWeekDays.indexOf(d))),
    ]
      .filter((i) => i >= 0)
      .sort((a, b) => a - b);
    if (indices.length === 0) return null;

    const isAllWeek = indices.length === 7;
    if (isAllWeek) {
      return this._translate.instant('general.businessHoursSummary.everyDay', {
        opens,
        closes,
      });
    }

    if (indices.length === 1) {
      const day = this.weekDayName(this.orderedWeekDays[indices[0]]);
      return this._translate.instant('general.businessHoursSummary.singleDay', {
        day,
        opens,
        closes,
      });
    }

    // Si los días son contiguos según el orden normal, mostramos rango (cualquier combinación).
    const isContiguous = indices.every(
      (idx, i) => i === 0 || idx === indices[i - 1] + 1,
    );
    if (isContiguous) {
      const from = this.weekDayName(this.orderedWeekDays[indices[0]]);
      const to = this.weekDayName(
        this.orderedWeekDays[indices[indices.length - 1]],
      );
      return this._translate.instant('general.businessHoursSummary.range', {
        from,
        to,
        opens,
        closes,
      });
    }

    // No contiguo: mejor tratarlo como "variado" para abrir modal con detalle.
    return null;
  }

  private weekDayName(day: WeekDayEnum): string {
    return this._translate.instant(`general.weekDays.${day.toLowerCase()}`);
  }

  private formatMinutesTo12h(totalMinutes: number): string {
    const minutes = Math.max(0, Math.floor(totalMinutes));
    const hh24 = Math.floor(minutes / 60) % 24;
    const mm = minutes % 60;
    const suffix = hh24 >= 12 ? 'pm' : 'am';
    const hh12 = hh24 % 12 === 0 ? 12 : hh24 % 12;
    return `${hh12}${mm === 0 ? '' : `:${mm.toString().padStart(2, '0')}`} ${suffix}`;
  }

  openLocationsModal() {
    this.ref = this._dialogService.open(BusinessLocationsModal, {
      width: '520px',
      style: { maxHeight: '90vh' },
      breakpoints: {
        '640px': '450px',
        '500px': '80vw',
        '400px': '90vw',
      },
      data: {
        locations: this.business?.locations ?? [],
        businessName: this.business?.name,
      },
      modal: true,
      closable: true,
    });
  }

  openLocationModal(location: LocationSchema) {
    this.ref = this._dialogService.open(LocationModal, {
      header:
        this._translate.instant('general.locationOf') +
        ' ' +
        this.business?.name,
      width: '600px',
      style: { maxHeight: '90vh' },
      breakpoints: {
        '640px': '450px',
        '500px': '80vw',
        '400px': '90vw',
      },
      data: {
        location,
        myLocation: false,
      },
      modal: true,
      closable: true,
    });
  }

  isFollowingBusiness() {
    this._subscriptions.add(
      this._businessPublicService
        .isFollowingBusiness(this.business.id)
        .subscribe({
          next: (response) => {
            this.following = response;
          },
          error: (error) => {
            console.error(error);
          },
        }),
    );
  }

  followBusiness() {
    this.following = true;
    this._subscriptions.add(
      this._businessPublicService.followBusiness(this.business.id).subscribe({
        next: () => {
          this.following = true;
          this.followers++;
        },
        error: (error) => {
          console.error(error);
          this.following = false;
        },
      }),
    );
  }

  unfollowBusiness() {
    this.following = false;
    this._subscriptions.add(
      this._businessPublicService.unfollowBusiness(this.business.id).subscribe({
        next: () => {
          this.following = false;
          this.followers--;
        },
        error: (error) => {
          console.error(error);
          this.following = true;
        },
      }),
    );
  }

  saveColor() {
    this.attemptColor = true;
    this._subscriptions.add(
      this._businessPrivateService
        .updateBusiness({
          id: this.business.id,
          hexColor: this.color,
        })
        .subscribe({
          next: () => {
            this.attemptColor = false;
            this._messageService.add({
              severity: 'success',
              summary: this._translate.instant('general.success'),
              detail: this._translate.instant(
                'toast.businessUpdatedSuccessfully',
              ),
            });
          },
          error: (error) => {
            console.error(error);
            this.attemptColor = false;
          },
        }),
    );
  }

  resetColor() {
    this.color = this.business?.hexColor ?? '#ffffff';
    this.setColor();
  }

  setColor() {
    this.colorChange.emit(this.color);
  }

  // getSocialNetworkIcon(code: string) {
  //   switch (code) {
  //     case 'FACEBOOK':
  //       return 'pi pi-facebook';
  //     case 'TWITTER':
  //       return 'pi pi-twitter';
  //     case 'INSTAGRAM':
  //       return 'pi pi-instagram';
  //     case 'LINKEDIN':
  //       return 'pi pi-linkedin';
  //     case 'YOUTUBE':
  //       return 'pi pi-youtube';
  //     case 'TIKTOK':
  //       return 'pi pi-tiktok';
  //     case 'PINTEREST':
  //       return 'pi pi-pinterest';
  //     case 'SNAPCHAT':
  //       return 'pi pi-snapchat';
  //     case 'WHATSAPP':
  //       return 'pi pi-whatsapp';
  //     case 'TELEGRAM':
  //       return 'pi pi-telegram';
  //     case 'EMAIL':
  //       return 'pi pi-envelope';
  //     default:
  //       return 'pi pi-globe';
  //   }
  // }
}
