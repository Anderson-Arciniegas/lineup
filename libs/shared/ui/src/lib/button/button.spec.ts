import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { Button } from './button';

describe('Button', () => {
  let component: Button;
  let fixture: ComponentFixture<Button>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Button, TranslateModule.forRoot()],
      providers: [provideRouter([]), TranslateService, TranslateStore],
    })
      .overrideComponent(Button, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(Button);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe usar primary como color por defecto', () => {
    expect(component.color).toBe('primary');
  });

  it('debe reflejar inputs de estado deshabilitado y carga', () => {
    component.disabled = true;
    component.loading = true;
    fixture.detectChanges();
    expect(component.disabled).toBe(true);
    expect(component.loading).toBe(true);
  });

  it('debe emitir action cuando se dispara el output', () => {
    jest.spyOn(component.action, 'emit');
    component.action.emit({ source: 'test' });
    expect(component.action.emit).toHaveBeenCalledWith({ source: 'test' });
  });

  it('debe aceptar variante outlined y tipo link', () => {
    component.variant = 'outlined';
    component.linkType = true;
    component.label = 'Ver más';
    fixture.detectChanges();
    expect(component.variant).toBe('outlined');
    expect(component.linkType).toBe(true);
    expect(component.label).toBe('Ver más');
  });
});
