import { HttpContext, HttpContextToken } from '@angular/common/http';

/**
 * Token de `HttpContext` para desactivar el toast global de error en una petición REST.
 * Úsalo cuando la vista maneja el error de forma específica (p. ej. subida de archivos).
 */
export const SKIP_GLOBAL_ERROR_TOAST = new HttpContextToken<boolean>(
  () => false,
);

/** Nombre de la propiedad en el `context` de Apollo que desactiva el toast global de error. */
export const SKIP_GLOBAL_ERROR_TOAST_CONTEXT = 'skipGlobalErrorToast' as const;

/** Fragmento de `context` de Apollo listo para hacer spread en `query`/`mutate`. */
export const SKIP_GLOBAL_ERROR_TOAST_APOLLO_CONTEXT: Readonly<
  Record<typeof SKIP_GLOBAL_ERROR_TOAST_CONTEXT, true>
> = { [SKIP_GLOBAL_ERROR_TOAST_CONTEXT]: true };

/** Crea un `HttpContext` con el toast global de error desactivado. */
export function skipGlobalErrorToastContext(
  base: HttpContext = new HttpContext(),
): HttpContext {
  return base.set(SKIP_GLOBAL_ERROR_TOAST, true);
}

/** Indica si un `context` de Apollo pidió omitir el toast global de error. */
export function shouldSkipGlobalErrorToast(
  context: Record<string, unknown> | undefined | null,
): boolean {
  return context?.[SKIP_GLOBAL_ERROR_TOAST_CONTEXT] === true;
}
