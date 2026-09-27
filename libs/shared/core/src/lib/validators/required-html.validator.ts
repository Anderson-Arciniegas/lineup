import { AbstractControl, ValidationErrors } from '@angular/forms';

const HTML_TAG_PATTERN = /<[^>]*>/g;
const EMPTY_HTML_ENTITY_PATTERN = /&(?:nbsp|ensp|emsp|#160|#x0*a0);/gi;

/**
 * Extrae texto plano de HTML de un editor rico (p. ej. Quill / p-editor).
 * Trata etiquetas vacías y entidades de espacio como contenido inexistente.
 */
export function getHtmlPlainText(value: unknown): string {
  if (value == null) {
    return '';
  }

  return String(value)
    .replace(HTML_TAG_PATTERN, ' ')
    .replace(EMPTY_HTML_ENTITY_PATTERN, ' ')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Falla si el valor no tiene texto visible. `Validators.required` no basta
 * porque el editor deja markup vacío (`<p></p>`, `<p><br></p>`).
 */
export function requiredHtmlContent(
  control: AbstractControl,
): ValidationErrors | null {
  return getHtmlPlainText(control.value).length > 0
    ? null
    : { required: true };
}
