/**
 * Códigos de negocio que devuelve el API de archivos en el cuerpo del error
 * (`error.error.code`). Deben coincidir con `filesResponses.upload` del backend.
 */
export const FILE_UPLOAD_ERROR_CODES = {
  NO_PERMISSION: 700100,
  ADULT_CONTENT: 700101,
  NO_ACCEPTABLE_EXTENSION: 700102,
  NO_ACCEPTABLE_DIRECTORY: 700103,
  POOR_QUALITY: 700104,
  IMPORT_PARSE_ERROR: 700105,
  IMPORT_FILE_REQUIRED: 700106,
  ERROR: 700199,
} as const;

export type FileUploadErrorCode =
  (typeof FILE_UPLOAD_ERROR_CODES)[keyof typeof FILE_UPLOAD_ERROR_CODES];

/** Extrae el código de negocio de un error de subida (`HttpErrorResponse` o similar). */
export function getFileUploadErrorCode(error: unknown): number | undefined {
  const body = (error as { error?: { code?: unknown } } | null)?.error;
  return typeof body?.code === 'number' ? body.code : undefined;
}

/** Indica si el error de subida corresponde a contenido adulto bloqueado. */
export function isAdultContentUploadError(error: unknown): boolean {
  return getFileUploadErrorCode(error) === FILE_UPLOAD_ERROR_CODES.ADULT_CONTENT;
}
