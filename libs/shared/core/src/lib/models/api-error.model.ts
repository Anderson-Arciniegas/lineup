/**
 * Error de API normalizado, independiente del transporte (GraphQL/Apollo o REST/HttpClient).
 *
 * - `httpStatus`: código HTTP equivalente (0 cuando no hubo respuesta del servidor).
 * - `code`: código de negocio devuelto por el backend, si existe.
 * - `message`: mensaje crudo del backend (solo para logging/debug, no se muestra al usuario).
 * - `i18nKey`: clave de traducción del mensaje que se muestra al usuario.
 * - `original`: error original sin transformar.
 */
export interface ApiError {
  httpStatus?: number;
  code?: number;
  message: string;
  i18nKey: string;
  original: unknown;
}
