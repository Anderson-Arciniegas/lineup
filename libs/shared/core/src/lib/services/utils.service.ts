import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { DOC_ORIENTATION, NgxImageCompressService } from 'ngx-image-compress';
import { from, Observable } from 'rxjs';
import { DiscountTypeEnum } from '../enums';
import {
  BcvOfficialRatesSchema,
  DiscountSchema,
  ProductSkuSchema,
} from '../schemas';
@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  private _platform = inject(PLATFORM_ID);
  private _document = inject(DOCUMENT);
  private _router = inject(Router);
  //   private _toast = inject(ToastService);
  //   private _errors = inject(ErrorsService);
  private _imageCompress = inject(NgxImageCompressService);

  get document() {
    return this._document;
  }

  /**
   * Allow user to redirect to another view
   *
   * @param {any[]} url
   * @param {NavigationExtras} [navigationExtra]
   * @returns {Promise<boolean>}
   * @memberof UtilsService
   */
  navigate(url: any[], navigationExtra?: NavigationExtras): Promise<boolean> {
    url = url.filter((u) => u !== '');
    return this._router.navigate(url, navigationExtra);
  }

  /**
   * Navigate the user to a specified URL.
   *
   * @param {string} url
   * @memberof UtilsService
   */
  redirect(url: string) {
    this._document.location.href = url;
  }

  blobToFile(theBlob: Blob, fileName: string): File {
    const b: any = theBlob;
    // A Blob() is almost a File() - it's just missing the two properties below which we will add
    b.lastModifiedDate = new Date();
    b.name = fileName;

    // Cast to a File() type
    return theBlob as File;
  }

  getExtensionFile(fileBase64: string): string {
    return fileBase64.substring(
      fileBase64.indexOf('/') + 1,
      fileBase64.indexOf(';base64'),
    );
  }

  passwordsMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword
      ? null
      : {
          passwordsMismatch: true,
        };
  }

  handleError(error: any) {
    // Internal server error or some system error [504] [500]
    // show toast
    // if (!isPlatformBrowser(this._platform)) {
    //   return;
    // }
    // if (!error || !error.error || !error.error.code) {
    //   return;
    // }
    // this._toast.error(this._errors.handleErrorMessage(error.error.code));
  }

  windowInnerWidth() {
    if (isPlatformBrowser(this._platform)) {
      return window.innerWidth;
      // ... use viewportWidth for client-side logic
    } else {
      return 0;
    }
  }

  /**
   * Replaces multiple consecutive spaces with a single space and trims the string.
   * Use for normalizing user input before sending to the API (except for rich text like product description).
   *
   * @param {string} value
   * @returns {string}
   * @memberof UtilsService
   */
  normalizeSpaces(value: string): string {
    if (value == null || typeof value !== 'string') return value;
    return value.trim().replace(/\s{2,}/g, ' ');
  }

  /**
   * This method trim all controls in the form
   *
   * @param {FormGroup} formGroup
   * @memberof UtilsService
   */
  trimForm(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      if (key !== 'telephone') {
        const value =
          typeof formGroup.get(key).value === 'string'
            ? formGroup.get(key).value.trim()
            : formGroup.get(key).value;
        formGroup.get(key).setValue(value);
      }
    });
  }

  /**
   *
   * compress file
   * @param {string} image
   * @returns {Observable<string>}
   * @memberof UtilsService
   */
  compressImage(image: string): Observable<string> {
    return from(
      this._imageCompress.compressFile(
        image,
        DOC_ORIENTATION.NotDefined,
        75,
        80,
      ),
    );
  }

  formatWhatsappPhone(phone: string, text: string) {
    const href = `https://api.whatsapp.com/send?phone=${phone.replace(/[^0-9]/g, '')}&text=${text}`;
    return href;
  }

  //dollar = 1
  //bs = 2
  //euro = 3

  formatPriceWithDiscount(
    sku: ProductSkuSchema,
    discount: DiscountSchema,
    rates: BcvOfficialRatesSchema,
  ) {
    if (!sku.price) return null;
    if (!discount) return sku.price;

    if (discount.discountType === DiscountTypeEnum.PERCENTAGE) {
      return sku.price - (sku.price * discount.value) / 100;
    }

    if (sku.idCurrency === discount.idCurrency) {
      return sku.price - discount.value;
    } else if (sku.idCurrency === 1 && discount.idCurrency === 2) {
      return sku.price - discount.value / rates.dollar;
    } else if (sku.idCurrency === 1 && discount.idCurrency === 3) {
      return sku.price - (rates.euro / rates.dollar) * discount.value;
    } else if (sku.idCurrency === 2 && discount.idCurrency === 3) {
      return sku.price - rates.euro * discount.value;
    } else if (sku.idCurrency === 2 && discount.idCurrency === 1) {
      return sku.price - rates.dollar * discount.value;
    } else if (sku.idCurrency === 3 && discount.idCurrency === 1) {
      return sku.price - (rates.dollar / rates.euro) * discount.value;
    } else if (sku.idCurrency === 3 && discount.idCurrency === 2) {
      return sku.price - discount.value / rates.euro;
    }

    return sku.price;
  }
}
