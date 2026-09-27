import { AbstractControl } from '@angular/forms';

export type FieldErrorMessage = {
  key: string;
  params?: Record<string, number>;
};

function isControlShownInvalid(control: AbstractControl | null): boolean {
  return !!control?.invalid && !!(control.dirty || control.touched);
}

/** Primer error visible de un campo solo-requerido. */
export function getRequiredFieldError(
  control: AbstractControl | null,
): FieldErrorMessage | null {
  if (!isControlShownInvalid(control) || !control?.errors?.['required']) {
    return null;
  }
  return { key: 'validation.fieldRequired' };
}

/** Primer error visible de email (required | email). */
export function getEmailFieldError(
  control: AbstractControl | null,
): FieldErrorMessage | null {
  if (!isControlShownInvalid(control)) {
    return null;
  }
  const errors = control?.errors;
  if (!errors) {
    return null;
  }
  if (errors['required']) {
    return { key: 'validation.fieldRequired' };
  }
  if (errors['email']) {
    return { key: 'validation.invalidEmail' };
  }
  return null;
}

/**
 * Primer error visible de password / confirmPassword
 * (required | minlength | maxlength | pattern | MatchPassword).
 */
export function getPasswordFieldError(
  control: AbstractControl | null,
): FieldErrorMessage | null {
  if (!isControlShownInvalid(control)) {
    return null;
  }
  const errors = control?.errors;
  if (!errors) {
    return null;
  }
  if (errors['required']) {
    return { key: 'validation.fieldRequired' };
  }
  if (errors['minlength']) {
    return {
      key: 'validation.passwordMinLength',
      params: { min: errors['minlength'].requiredLength },
    };
  }
  if (errors['maxlength']) {
    return {
      key: 'validation.passwordMaxLength',
      params: { max: errors['maxlength'].requiredLength },
    };
  }
  if (errors['pattern']) {
    return { key: 'validation.passwordInvalidFormat' };
  }
  if (errors['MatchPassword']) {
    return { key: 'validation.passwordMismatch' };
  }
  return null;
}

/** Primer error visible de texto con required / minLength. */
export function getMinLengthFieldError(
  control: AbstractControl | null,
): FieldErrorMessage | null {
  if (!isControlShownInvalid(control)) {
    return null;
  }
  const errors = control?.errors;
  if (!errors) {
    return null;
  }
  if (errors['required']) {
    return { key: 'validation.fieldRequired' };
  }
  if (errors['minlength']) {
    return {
      key: 'validation.minLength',
      params: { min: errors['minlength'].requiredLength },
    };
  }
  return null;
}

/** Primer error visible de valor requerido o mínimo (`Validators.min`). */
export function getMinValueFieldError(
  control: AbstractControl | null,
): FieldErrorMessage | null {
  if (!isControlShownInvalid(control)) {
    return null;
  }
  const errors = control?.errors;
  if (!errors) {
    return null;
  }
  if (errors['required']) {
    return { key: 'validation.fieldRequired' };
  }
  const minError = errors['min'];
  if (!minError) {
    return null;
  }
  return {
    key: 'validation.minValue',
    params: { min: minError.min },
  };
}
