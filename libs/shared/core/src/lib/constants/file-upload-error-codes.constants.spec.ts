import { HttpErrorResponse } from '@angular/common/http';
import {
  FILE_UPLOAD_ERROR_CODES,
  getFileUploadErrorCode,
  isAdultContentUploadError,
} from './file-upload-error-codes.constants';

describe('file-upload-error-codes', () => {
  it('los códigos coinciden con filesResponses.upload del backend', () => {
    expect(FILE_UPLOAD_ERROR_CODES.ADULT_CONTENT).toBe(700101);
    expect(FILE_UPLOAD_ERROR_CODES.NO_ACCEPTABLE_EXTENSION).toBe(700102);
    expect(FILE_UPLOAD_ERROR_CODES.POOR_QUALITY).toBe(700104);
  });

  it('getFileUploadErrorCode lee el código del cuerpo del HttpErrorResponse', () => {
    const error = new HttpErrorResponse({
      status: 406,
      error: { code: 700102, status: false, message: 'ext' },
    });
    expect(getFileUploadErrorCode(error)).toBe(700102);
  });

  it('getFileUploadErrorCode devuelve undefined sin cuerpo o sin código numérico', () => {
    expect(getFileUploadErrorCode(undefined)).toBeUndefined();
    expect(getFileUploadErrorCode(null)).toBeUndefined();
    expect(getFileUploadErrorCode(new Error('x'))).toBeUndefined();
    expect(getFileUploadErrorCode({ error: { code: '700101' } })).toBeUndefined();
    expect(getFileUploadErrorCode({ error: 'plain text' })).toBeUndefined();
  });

  it('isAdultContentUploadError solo es true para ADULT_CONTENT', () => {
    expect(
      isAdultContentUploadError({
        error: { code: FILE_UPLOAD_ERROR_CODES.ADULT_CONTENT },
      }),
    ).toBe(true);
    expect(isAdultContentUploadError({ error: { code: 22011 } })).toBe(false);
    expect(isAdultContentUploadError({ error: { code: 700102 } })).toBe(false);
    expect(isAdultContentUploadError(undefined)).toBe(false);
  });
});
