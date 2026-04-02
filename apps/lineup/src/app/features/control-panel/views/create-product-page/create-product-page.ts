import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  AppConfigService,
  BASIC_COLORS,
  BASIC_SIZES,
  BusinessApiFilePrivateService,
  BusinessPrivateService,
  BusinessSchema,
  CatalogPrivateService,
  CatalogSchema,
  Color,
  CreateProductInput,
  CreateProductVariationInput,
  DirectoriesEnum,
  ProductImageInput,
  ProductPrivateService,
  ProductSchema,
  ProductVariationInput,
  Size,
  UpdateProductInput,
  UtilsService,
} from '@lineup/core';
import {
  Button,
  DraggableImageList,
  ImageCropper,
  ProductBreadcrumb,
} from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { base64ToFile } from 'ngx-image-cropper';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EditorModule } from 'primeng/editor';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MultiSelectModule } from 'primeng/multiselect';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinner } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import { map, Subscription } from 'rxjs';

@Component({
  selector: 'app-create-product-page',
  imports: [
    CommonModule,
    SkeletonModule,
    ProductBreadcrumb,
    InputTextModule,
    FormsModule,
    TranslateModule,
    ButtonModule,
    TextareaModule,
    MultiSelectModule,
    Button,
    PanelModule,
    MenuModule,
    ChipModule,
    EditorModule,
    DraggableImageList,
    ReactiveFormsModule,
    ProgressSpinner,
  ],
  templateUrl: './create-product-page.html',
  styleUrl: './create-product-page.scss',
})
export class CreateProductPage implements OnInit {
  ref: DynamicDialogRef | undefined;
  createProductForm: FormGroup;
  business: BusinessSchema;
  product: ProductSchema;
  idProduct: string | undefined;
  path: string;
  catalogPath: string | undefined;
  isDragging = false;
  urls: string[] = [];
  imgCodes: string[] = [];

  catalog: CatalogSchema | null = null;
  isSubmitting = false;
  loadingFile = false;
  uploadFailed = false;
  adultContent = false;
  attempt = false;

  maxTitleLength = 80;
  maxSubtitleLength = 100;

  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);
  private readonly _businessService = inject(BusinessPrivateService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _productService = inject(ProductPrivateService);
  private readonly _catalogService = inject(CatalogPrivateService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _utils = inject(UtilsService);
  private readonly _messageService = inject(MessageService);
  private readonly _apiFileService = inject(BusinessApiFilePrivateService);

  private readonly _subscription = new Subscription();

  constructor() {
    this.createProductForm = this._formBuilder.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(this.maxTitleLength),
        ],
      ],
      subtitle: [
        '',
        [Validators.minLength(3), Validators.maxLength(this.maxSubtitleLength)],
      ],
      description: ['', [Validators.required]],
      variations: this._formBuilder.array([]),
    });
  }

  ngOnInit(): void {
    this.path = this._activatedRoute.snapshot.params['business'];
    this.idProduct = this._activatedRoute.snapshot.params['idProduct'];
    this.catalogPath = this._activatedRoute.snapshot.params['catalogPath'];
    if (this.path) {
      this.getBusiness();
    }
    if (this.catalogPath) {
      this.getCatalog();
    }
    if (this.idProduct) {
      this.getProduct();
    }
  }

  private getCatalog(): void {
    if (!this.catalogPath) return;
    this._subscription.add(
      this._catalogService.findOneCatalogByPath(this.catalogPath).subscribe({
        next: (catalog) => {
          this.catalog = catalog;
        },
      }),
    );
  }

  private getProduct(): void {
    if (!this.idProduct) return;
    if (this.attempt) return;
    this.attempt = true;
    this._subscription.add(
      this._productService.findOneProduct(Number(this.idProduct)).subscribe({
        next: (product) => {
          this.product = product;
          this.createProductForm.patchValue({
            title: product.title,
            subtitle: product.subtitle ?? '',
            description: product.description,
          });
          const variations = product.variations ?? [];
          this.variationsFormArray.clear();
          variations.forEach((variation) => {
            const key: 'color' | 'size' | null =
              variation.title === 'variations.color'
                ? 'color'
                : variation.title === 'variations.size'
                  ? 'size'
                  : null;
            const group = this.createVariationFormGroup();
            group.patchValue({
              id: variation.id,
              title: variation.title,
              variationKey: key,
            });
            (variation.options ?? []).forEach((opt: string) =>
              this.getVariationOptionsFormArray(group).push(
                this._formBuilder.control(opt),
              ),
            );
            this.variationsFormArray.push(group);
          });
          this.urls =
            product.productFiles?.map((file) => file.file?.url || '') ?? [];
          this.imgCodes =
            product.productFiles?.map((file) => file.file?.name || '') ?? [];

          this.attempt = false;
        },
        error: (error) => {
          console.error(error);
          this.attempt = false;
        },
        complete: () => {
          console.log('complete');
          this.attempt = false;
        },
      }),
    );
  }

  get variationsFormArray(): FormArray {
    return this.createProductForm.get('variations') as FormArray;
  }

  getVariationOptionsFormArray(variationGroup: AbstractControl): FormArray {
    return (variationGroup as FormGroup).get('options') as FormArray;
  }

  isColorVariation(variationGroup: AbstractControl): boolean {
    const group = variationGroup as FormGroup;
    return group.get('variationKey')?.value === 'color';
  }

  isSizeVariation(variationGroup: AbstractControl): boolean {
    const group = variationGroup as FormGroup;
    return group.get('variationKey')?.value === 'size';
  }

  hasPredefinedOptions(variationGroup: AbstractControl): boolean {
    return (
      this.isColorVariation(variationGroup) ||
      this.isSizeVariation(variationGroup)
    );
  }

  getPredefinedOptions(variationGroup: AbstractControl): {
    label: string;
    value: string;
    hex?: string;
    labelTranslated?: string;
  }[] {
    if (this.isColorVariation(variationGroup)) {
      const options: {
        label: string;
        value: string;
        hex?: string;
        labelTranslated: string;
      }[] = [];
      for (const color of BASIC_COLORS as readonly Color[]) {
        options.push({
          label: color.name,
          value: color.value,
          hex: color.hex,
          labelTranslated: this._translate.instant(color.name),
        });
      }
      return options;
    }

    if (this.isSizeVariation(variationGroup)) {
      const options: {
        label: string;
        value: string;
        labelTranslated: string;
      }[] = [];
      for (const size of BASIC_SIZES as readonly Size[]) {
        options.push({
          label: size.name,
          value: size.value,
          labelTranslated: size.name,
        });
      }
      return options;
    }

    return [];
  }

  onPredefinedOptionsChange(
    variationGroup: AbstractControl,
    selectedValues: string[],
  ): void {
    const optionsArray = this.getVariationOptionsFormArray(variationGroup);
    while (optionsArray.length > 0) {
      optionsArray.removeAt(0);
    }

    selectedValues.forEach((value: string) => {
      optionsArray.push(this._formBuilder.control(value));
    });
  }

  addVariation(): void {
    this.variationsFormArray.push(this.createVariationFormGroup());
  }

  createVariationFormGroup(): FormGroup {
    return this._formBuilder.group({
      id: [null as number | null],
      title: ['', [Validators.required, Validators.maxLength(30)]],
      variationKey: [null as 'color' | 'size' | null],
      options: this._formBuilder.array([]),
      newOption: [''],
    });
  }

  addColorVariation(): void {
    const variationGroup = this.createVariationFormGroup();
    variationGroup.patchValue({
      title: 'variations.color',
      variationKey: 'color',
    });
    this.variationsFormArray.push(variationGroup);
  }

  addSizeVariation(): void {
    const variationGroup = this.createVariationFormGroup();
    variationGroup.patchValue({
      title: 'variations.size',
      variationKey: 'size',
    });
    this.variationsFormArray.push(variationGroup);
  }

  addVariationOption(variationGroup: AbstractControl): void {
    const group = variationGroup as FormGroup;
    const newOptionControl = group.get('newOption');
    const value = (newOptionControl?.value ?? '').trim();
    if (!value) return;
    const optionsArray = this.getVariationOptionsFormArray(group);
    optionsArray.push(this._formBuilder.control(value));
    newOptionControl?.setValue('', { emitEvent: true });
  }

  removeVariationOption(variationGroup: AbstractControl, index: number): void {
    const optionsArray = this.getVariationOptionsFormArray(variationGroup);
    optionsArray.removeAt(index);
  }

  removeVariation(index: number): void {
    this.variationsFormArray.removeAt(index);
  }

  // private getCurrencies(): void {
  //   this._subscription.add(
  //     this._currencyService.findAllCurrencies().subscribe({
  //       next: (currencies) => {
  //         this.currencies = this.currencies.map((currency) => {
  //           const currencyFound = currencies.find(
  //             (c) => Number(c.id) === Number(currency.id),
  //           );
  //           if (currencyFound) {
  //             currency = {
  //               ...currency,
  //               code: currencyFound?.code,
  //               name: currencyFound?.name,
  //               status: currencyFound?.status,
  //             };
  //           }

  //           return currency;
  //         });
  //         const idCurrency = this.createProductForm.get('idCurrency')?.value;
  //         if (
  //           idCurrency != null &&
  //           idCurrency !== '' &&
  //           !this.selectedCurrency
  //         ) {
  //           this.selectedCurrency =
  //             this.currencies.find((c) => c.id === Number(idCurrency)) ?? null;
  //           this._cdr.markForCheck();
  //         }
  //       },
  //     }),
  //   );
  // }

  private getBusiness(): void {
    this._subscription.add(
      this._businessService.getBusinessByPath(this.path).subscribe({
        next: (business) => {
          this.business = business;
        },
      }),
    );
  }

  // onCurrencyChange(event: {
  //   value: number | typeof this.selectedCurrency;
  // }): void {
  //   const value = event.value;
  //   this.selectedCurrency =
  //     typeof value === 'object' && value !== null
  //       ? value
  //       : (this.currencies.find((c) => c.id === value) ?? null);

  //   console.log(this.selectedCurrency);
  // }

  onImagesChange(event: { urls: string[]; imageCodes: string[] }): void {
    this.urls = event.urls;
    this.imgCodes = event.imageCodes;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
      input.value = '';
    }
  }

  openImageCropper() {
    this.ref = this._dialogService.open(ImageCropper, {
      header: this._translate.instant('general.addImage'),
      width: '600px',
      style: { maxHeight: '80vh' },
      breakpoints: {
        '640px': '450px',
        '500px': '80vw',
        '400px': '90vw',
      },
      modal: true,
      draggable: false,
      resizable: false,
      closable: true,
    });

    this.ref.onClose.subscribe((image: string) => {
      if (image) {
        this.uploadFile(image);
      }
    });
  }

  uploadFile(fileBase64: any) {
    this.loadingFile = true;

    const image: File = this._utils.blobToFile(
      base64ToFile(fileBase64),
      'file',
    );

    const fileUpload = new FormData();
    const extension = this._utils.getExtensionFile(fileBase64);

    fileUpload.append('directory', DirectoriesEnum.PRODUCTS);
    fileUpload.append('file', image, `image.${extension}`);

    this._subscription.add(
      this._apiFileService
        .post('files/upload', fileUpload)
        .pipe(
          map((response) => {
            console.log(response);
            switch (response.type) {
              case HttpEventType.Response:
                if (response.body.file) {
                  this.imgCodes.push(response.body.file.name);
                  this.urls.push(response.body.file.url);
                }
                return response;

              default:
                break;
            }
          }),
        )
        .subscribe({
          next: (uploadResponse) => {
            if (typeof uploadResponse === 'object' && uploadResponse.status) {
              this.uploadFailed = false;
              this.adultContent = false;
              this.loadingFile = false;
            }
          },
          error: (error) => {
            this.uploadFailed = true;
            this.loadingFile = false;
            this.adultContent = error.error.code === 22011;
          },
        }),
    );
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  removeImage(index: number) {
    this.urls.splice(index, 1);
  }

  handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const previewUrl = reader.result as string;
      this.urls.push(previewUrl);
    };
    reader.readAsDataURL(file);
  }

  onImageReorder($event) {
    console.log($event);
  }

  createProduct(): void {
    if (this.createProductForm.invalid) {
      this.createProductForm.markAllAsTouched();
      return;
    }
    if (this.imgCodes.length === 0) {
      this._messageService.add({
        severity: 'warn',
        summary: this._translate.instant('general.warning'),
        detail: this._translate.instant('validation.imageRequired'),
      });
      return;
    }
    if (!this.catalog?.id) {
      this._messageService.add({
        severity: 'warn',
        summary: this._translate.instant('general.warning'),
        detail: this._translate.instant('general.catalogRequired'),
      });
      return;
    }
    if (this.isSubmitting) {
      return;
    }
    const raw = this.createProductForm.getRawValue();

    const variationsFormatted: CreateProductVariationInput[] = (
      raw.variations ?? []
    ).map((v: { title: string; options: string[]; newOption?: string }) => ({
      title: this._utils.normalizeSpaces(v.title ?? ''),
      options: (v.options ?? []).map((opt) => ({
        value: this._utils.normalizeSpaces(String(opt ?? '')),
      })),
    }));

    const images: ProductImageInput[] = this.imgCodes.map(
      (imageCode, order) => ({
        imageCode,
        order,
      }),
    );

    if (this.product) {
      const variationsUpdate: ProductVariationInput[] = (
        raw.variations ?? []
      ).map((v: { id?: number; title: string; options: string[] }) => ({
        ...(v.id != null ? { id: v.id } : {}),
        title: this._utils.normalizeSpaces(v.title ?? ''),
        options: (v.options ?? []).map((opt) => ({
          value: this._utils.normalizeSpaces(String(opt ?? '')),
        })),
      }));

      const data: UpdateProductInput = {
        id: this.product.id,
        title: this._utils.normalizeSpaces(raw.title ?? ''),
        subtitle: this._utils.normalizeSpaces(raw.subtitle ?? ''),
        description: raw.description,
        idCatalog: this.catalog.id,
        images,
        variations: variationsUpdate.length > 0 ? variationsUpdate : undefined,
      };

      this.isSubmitting = true;
      this._subscription.add(
        this._productService.updateProduct(data).subscribe({
          next: (product) => {
            console.log(product);
            this.isSubmitting = false;
            this._messageService.add({
              severity: 'success',
              summary: this._translate.instant('general.success'),
              detail: this._translate.instant('general.productUpdated'),
            });
            if (this.business) {
              this._utils.navigate([
                this.business.path,
                AppConfigService.config.routes.lineup,
                this.catalog?.path ?? '',
              ]);
            } else {
              this._utils.navigate([
                AppConfigService.config.routes.dashboard,
                AppConfigService.config.routes.catalogs,
                this.catalogPath ?? '',
              ]);
            }
          },
          error: (err) => {
            this.isSubmitting = false;
            this._messageService.add({
              severity: 'error',
              summary: this._translate.instant('general.error'),
              detail:
                err?.message ??
                this._translate.instant('general.errorUpdatingProduct'),
            });
          },
        }),
      );
    } else {
      const data: CreateProductInput = {
        title: this._utils.normalizeSpaces(raw.title ?? ''),
        subtitle: this._utils.normalizeSpaces(raw.subtitle ?? ''),
        description: raw.description,
        idCatalog: this.catalog.id,
        images,
        variations:
          variationsFormatted.length > 0 ? variationsFormatted : undefined,
      };

      this.isSubmitting = true;
      this._subscription.add(
        this._productService.createProduct(data).subscribe({
          next: (product) => {
            console.log(product);
            this.isSubmitting = false;
            this._messageService.add({
              severity: 'success',
              summary: this._translate.instant('general.success'),
              detail: this._translate.instant('general.productCreated'),
            });
            if (this.business && this.catalog) {
              this._utils.navigate([
                this.business.path,

                this.catalog?.path,
                product.id,
                AppConfigService.config.routes.inventory,
              ]);
            } else {
              this._utils.navigate([
                AppConfigService.config.routes.dashboard,
                AppConfigService.config.routes.catalogs,
                this.catalogPath,
                product.id,
                AppConfigService.config.routes.inventory,
              ]);
            }
          },
          error: (err) => {
            this.isSubmitting = false;
            this._messageService.add({
              severity: 'error',
              summary: this._translate.instant('general.error'),
              detail:
                err?.message ??
                this._translate.instant('general.errorCreatingProduct'),
            });
          },
        }),
      );
    }
  }
}
