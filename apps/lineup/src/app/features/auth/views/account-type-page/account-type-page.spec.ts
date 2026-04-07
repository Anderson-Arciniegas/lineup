import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { AccountTypePage } from './account-type-page';

/**
 * Elección de tipo de cuenta antes del registro: enlaces relativos a usuario o negocio.
 */
describe('AccountTypePage', () => {
  let component: AccountTypePage;
  let fixture: ComponentFixture<AccountTypePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountTypePage, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountTypePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe renderizar dos enlaces RouterLink (usuario y negocio)', () => {
    const links = fixture.debugElement.queryAll(By.directive(RouterLink));
    expect(links.length).toBe(2);
  });

  it('debe generar href de navegación para cada opción', () => {
    const anchors = Array.from(
      fixture.nativeElement.querySelectorAll('a'),
    ) as HTMLAnchorElement[];
    expect(anchors.length).toBe(2);
    const hrefs = anchors.map((a) => a.getAttribute('href') ?? '');
    expect(hrefs.some((h) => /user/i.test(h))).toBe(true);
    expect(hrefs.some((h) => /business/i.test(h))).toBe(true);
  });
});
