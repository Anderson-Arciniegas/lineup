import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { SearchBar } from './search-bar';

describe('SearchBar', () => {
  let component: SearchBar;
  let fixture: ComponentFixture<SearchBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBar, TranslateModule.forRoot()],
      providers: [provideRouter([]), TranslateService, TranslateStore],
    })
      .overrideComponent(SearchBar, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(SearchBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe iniciar con searchQuery vacío', () => {
    expect(component.searchQuery).toBe('');
  });

  it('debe emitir el texto recortado al enviar la búsqueda', () => {
    jest.spyOn(component.searchSubmit, 'emit');
    component.searchQuery = '  zapatos rojos  ';
    component.onSearchSubmit();
    expect(component.searchSubmit.emit).toHaveBeenCalledWith('zapatos rojos');
  });

  it('debe emitir cadena vacía si solo hay espacios', () => {
    jest.spyOn(component.searchSubmit, 'emit');
    component.searchQuery = '   ';
    component.onSearchSubmit();
    expect(component.searchSubmit.emit).toHaveBeenCalledWith('');
  });

  it('debe registrar listener de scroll cuando shrink está activo', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    component.shrink = true;
    component.ngOnInit();
    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    addSpy.mockRestore();
  });

  it('debe alternar clase shrink según scrollY', () => {
    const searchEl = document.createElement('div');
    searchEl.className = 'search';
    document.body.appendChild(searchEl);
    const addSpy = jest.spyOn(window, 'addEventListener');
    component.shrink = true;
    component.ngOnInit();
    const handler = addSpy.mock.calls.find((c) => c[0] === 'scroll')?.[1] as () => void;
    Object.defineProperty(window, 'scrollY', { value: 150, configurable: true });
    handler?.();
    expect(searchEl.classList.contains('shrink')).toBe(true);
    Object.defineProperty(window, 'scrollY', { value: 50, configurable: true });
    handler?.();
    expect(searchEl.classList.contains('shrink')).toBe(false);
    document.body.removeChild(searchEl);
    addSpy.mockRestore();
  });
});
