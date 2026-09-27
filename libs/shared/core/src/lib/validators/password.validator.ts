import { AbstractControl, ValidationErrors } from '@angular/forms';

export class PasswordValidation {
  static MatchPassword(AC: AbstractControl): ValidationErrors | null {
    const confirmControl = AC.get('confirmPassword');
    const password = AC.get('password')?.value;
    const confirmPassword = confirmControl?.value;
    if (password !== confirmPassword) {
      confirmControl?.setErrors({
        ...(confirmControl.errors ?? {}),
        MatchPassword: true,
      });
      return { MatchPassword: true };
    }

    if (confirmControl?.errors?.['MatchPassword']) {
      const rest = { ...confirmControl.errors };
      delete rest['MatchPassword'];
      confirmControl.setErrors(Object.keys(rest).length ? rest : null);
    }
    return null;
  }
}
