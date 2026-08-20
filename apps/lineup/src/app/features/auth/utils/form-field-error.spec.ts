import { FormControl, Validators } from '@angular/forms';
import {
  getEmailFieldError,
  getPasswordFieldError,
  getRequiredFieldError,
} from './form-field-error';

describe('form-field-error', () => {
  it('getRequiredFieldError no muestra error si el control está pristine', () => {
    const control = new FormControl('', Validators.required);
    expect(getRequiredFieldError(control)).toBeNull();
  });

  it('getRequiredFieldError devuelve null con control nulo', () => {
    expect(getRequiredFieldError(null)).toBeNull();
  });

  it('getRequiredFieldError devuelve fieldRequired cuando está touched e inválido', () => {
    const control = new FormControl('', Validators.required);
    control.markAsTouched();
    expect(getRequiredFieldError(control)).toEqual({
      key: 'validation.fieldRequired',
    });
  });

  it('getEmailFieldError prioriza required sobre email', () => {
    const control = new FormControl('', [Validators.required, Validators.email]);
    control.markAsDirty();
    expect(getEmailFieldError(control)).toEqual({
      key: 'validation.fieldRequired',
    });
  });

  it('getEmailFieldError detecta formato inválido', () => {
    const control = new FormControl('not-an-email', Validators.email);
    control.markAsTouched();
    expect(getEmailFieldError(control)).toEqual({
      key: 'validation.invalidEmail',
    });
  });

  it('getEmailFieldError devuelve null con control nulo o sin errores', () => {
    expect(getEmailFieldError(null)).toBeNull();
    const control = {
      invalid: true,
      dirty: true,
      touched: true,
      errors: null,
    } as unknown as FormControl;
    expect(getEmailFieldError(control)).toBeNull();
  });

  it('getPasswordFieldError cubre min, max, patrón y mismatch', () => {
    const min = new FormControl('Ab1!', Validators.minLength(8));
    min.markAsTouched();
    expect(getPasswordFieldError(min)).toEqual({
      key: 'validation.passwordMinLength',
      params: { min: 8 },
    });

    const max = new FormControl('x'.repeat(21), Validators.maxLength(20));
    max.markAsTouched();
    expect(getPasswordFieldError(max)).toEqual({
      key: 'validation.passwordMaxLength',
      params: { max: 20 },
    });

    const pattern = new FormControl(
      'password',
      Validators.pattern(/^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/),
    );
    pattern.markAsTouched();
    expect(getPasswordFieldError(pattern)).toEqual({
      key: 'validation.passwordInvalidFormat',
    });

    const mismatch = new FormControl('Password1!');
    mismatch.setErrors({ MatchPassword: true });
    mismatch.markAsDirty();
    expect(getPasswordFieldError(mismatch)).toEqual({
      key: 'validation.passwordMismatch',
    });
  });

  it('getPasswordFieldError devuelve required si falta el valor', () => {
    const control = new FormControl('', Validators.required);
    control.markAsTouched();
    expect(getPasswordFieldError(control)).toEqual({
      key: 'validation.fieldRequired',
    });
  });

  it('getPasswordFieldError devuelve null con control nulo o sin errores', () => {
    expect(getPasswordFieldError(null)).toBeNull();
    const control = {
      invalid: true,
      dirty: true,
      touched: true,
      errors: null,
    } as unknown as FormControl;
    expect(getPasswordFieldError(control)).toBeNull();
  });
});
