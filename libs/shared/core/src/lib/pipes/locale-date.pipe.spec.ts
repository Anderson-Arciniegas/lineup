import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LocaleDatePipe } from './locale-date.pipe';

describe('LocaleDatePipe', () => {
  let pipe: LocaleDatePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [LocaleDatePipe],
    });
    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en');
    translate.use('en');
    pipe = TestBed.inject(LocaleDatePipe);
  });

  it('returns empty string for nullish values', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });

  it('formats date kind', () => {
    const result = pipe.transform('2024-06-15', 'date');
    expect(result).toContain('2024');
  });

  it('formats datetime kind', () => {
    const result = pipe.transform('2024-06-15T10:30:00', 'datetime');
    expect(result).toContain('2024');
  });

  it('formats short kind', () => {
    const result = pipe.transform('2024-06-15', 'short');
    expect(result.length).toBeGreaterThan(0);
  });

  it('falls back to default language when current lang is unset', () => {
    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en');
    translate.currentLang = undefined as never;
    expect(pipe.transform('2024-06-15', 'date')).toContain('2024');
  });
});
