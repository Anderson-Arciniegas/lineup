import { FormControl } from '@angular/forms';
import {
  getHtmlPlainText,
  requiredHtmlContent,
} from './required-html.validator';

describe('getHtmlPlainText', () => {
  it('devuelve cadena vacía para null y undefined', () => {
    expect(getHtmlPlainText(null)).toBe('');
    expect(getHtmlPlainText(undefined)).toBe('');
  });

  it('elimina etiquetas y deja el texto visible', () => {
    expect(getHtmlPlainText('<p>Hola <strong>mundo</strong></p>')).toBe(
      'Hola mundo',
    );
  });
});

describe('requiredHtmlContent', () => {
  it('es válido con texto plano', () => {
    const control = new FormControl('Descripción del producto');
    expect(requiredHtmlContent(control)).toBeNull();
  });

  it('es válido con HTML que contiene texto', () => {
    const control = new FormControl('<p>Descripción del producto</p>');
    expect(requiredHtmlContent(control)).toBeNull();
  });

  it('es inválido si el valor está vacío', () => {
    expect(requiredHtmlContent(new FormControl(''))).toEqual({ required: true });
    expect(requiredHtmlContent(new FormControl(null))).toEqual({
      required: true,
    });
  });

  it('es inválido con el HTML vacío que deja el editor al borrar', () => {
    const emptyEditorValues = [
      '<p></p>',
      '<p><br></p>',
      '<p><br/></p>',
      '<p><br class="ql-break"></p>',
      '<p>&nbsp;</p>',
      '<p>   </p>',
    ];

    for (const value of emptyEditorValues) {
      expect(requiredHtmlContent(new FormControl(value))).toEqual({
        required: true,
      });
    }
  });
});
