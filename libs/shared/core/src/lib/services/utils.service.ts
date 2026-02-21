import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { DOC_ORIENTATION, NgxImageCompressService } from 'ngx-image-compress';
import { from, Observable } from 'rxjs';
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
}
