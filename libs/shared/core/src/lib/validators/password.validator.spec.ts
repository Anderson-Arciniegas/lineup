import { FormControl, FormGroup } from '@angular/forms';
import { PasswordValidation } from './password.validator';

describe('PasswordValidation', () => {
  it('returns null when passwords match', () => {
    const form = new FormGroup({
      password: new FormControl('secret'),
      confirmPassword: new FormControl('secret'),
    });
    expect(PasswordValidation.MatchPassword(form)).toBeNull();
  });

  it('returns MatchPassword error when passwords differ', () => {
    const form = new FormGroup({
      password: new FormControl('secret'),
      confirmPassword: new FormControl('other'),
    });
    expect(PasswordValidation.MatchPassword(form)).toEqual({
      MatchPassword: true,
    });
    expect(form.get('confirmPassword')?.errors).toEqual({ MatchPassword: true });
  });

  it('handles missing password controls', () => {
    const form = new FormGroup({
      confirmPassword: new FormControl('other'),
    });
    expect(PasswordValidation.MatchPassword(form)).toEqual({
      MatchPassword: true,
    });

    const onlyPassword = new FormGroup({
      password: new FormControl('secret'),
    });
    expect(PasswordValidation.MatchPassword(onlyPassword)).toEqual({
      MatchPassword: true,
    });
  });

  it('clears MatchPassword when passwords become equal', () => {
    const form = new FormGroup({
      password: new FormControl('secret'),
      confirmPassword: new FormControl('other'),
    });
    PasswordValidation.MatchPassword(form);
    expect(form.get('confirmPassword')?.errors).toEqual({ MatchPassword: true });

    form.get('confirmPassword')?.setValue('secret');
    expect(PasswordValidation.MatchPassword(form)).toBeNull();
    expect(form.get('confirmPassword')?.errors).toBeNull();
  });
});
