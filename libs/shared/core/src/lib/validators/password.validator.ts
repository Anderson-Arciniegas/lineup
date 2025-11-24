import { AbstractControl, ValidationErrors } from '@angular/forms';

export class PasswordValidation {
  static MatchPassword(AC: AbstractControl): ValidationErrors | null {
    const password = AC.get('password')?.value;
    const confirmPassword = AC.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      AC.get('confirmPassword')?.setErrors({
        MatchPassword: true,
      });
      return { MatchPassword: true };
    } else {
      return null;
    }
  }
}
