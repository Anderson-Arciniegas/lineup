/**
 * Códigos de negocio del backend (`core/common/responses/*.response.ts`) que tienen un
 * mensaje de usuario específico. Llegan como `businessCode` en errores GraphQL (vía
 * `formatError`) o como `error.code` en el cuerpo de errores REST.
 *
 * Todo código que no esté aquí cae en el mensaje genérico por status HTTP.
 * Convención del backend: `1xxxxx` usuarios, `2xxxxx` negocios, `24xxxxx` códigos de
 * verificación, `25xxxxx` valoraciones, `7xxxxx` archivos.
 */
export const BUSINESS_ERROR_I18N_KEYS: Readonly<Record<number, string>> = {
  // auth.login
  100000: 'auth.invalidCredentials',
  100004: 'auth.emailNotVerified',

  // users/businesses: correo ya registrado (create / update / list)
  100103: 'errors.email.alreadyRegistered',
  100201: 'errors.email.alreadyRegistered',
  100302: 'errors.email.alreadyRegistered',
  200103: 'errors.email.alreadyRegistered',
  200201: 'errors.email.alreadyRegistered',
  200302: 'errors.email.alreadyRegistered',

  // users/businesses: changePassword
  100700: 'errors.password.notFitStandard',
  100701: 'errors.password.equalToPrevious',
  100702: 'errors.password.previousInvalid',
  100799: 'validation.passwordUpdateFailed',
  200700: 'errors.password.notFitStandard',
  200701: 'errors.password.equalToPrevious',
  200702: 'errors.password.previousInvalid',
  200799: 'validation.passwordUpdateFailed',

  // users/businesses: verificationCode.error (envío)
  101100: 'errors.verificationCode.sendFailed',
  201100: 'errors.verificationCode.sendFailed',

  // verification-codes: verify
  2400100: 'errors.verificationCode.notFound',
  2400101: 'errors.verificationCode.expired',
  2400102: 'errors.verificationCode.alreadyUsed',
  2400103: 'errors.verificationCode.invalid',

  // product-ratings: rate
  2501099: 'general.errorRatingProduct',

  // files: upload
  700101: 'errors.file.adultContent',
  700102: 'errors.file.invalidExtension',
  700104: 'errors.file.poorQuality',
};

/**
 * Mensajes literales del backend cuando el `formatError` no incluye `businessCode`
 * (p. ej. `{ code: 500, message: "The mail is already registered.", status: false }`).
 */
export const BACKEND_MESSAGE_ERROR_I18N_KEYS: Readonly<Record<string, string>> =
  {
    'The mail is already registered.': 'errors.email.alreadyRegistered',
  };

/** Devuelve la clave i18n asociada a un código de negocio, si está mapeado. */
export function resolveBusinessErrorI18nKey(
  businessCode: number | undefined,
): string | undefined {
  return businessCode === undefined
    ? undefined
    : BUSINESS_ERROR_I18N_KEYS[businessCode];
}

/** Devuelve la clave i18n asociada a un mensaje literal del backend, si está mapeado. */
export function resolveMessageErrorI18nKey(
  message: string | undefined,
): string | undefined {
  if (!message) return undefined;
  return BACKEND_MESSAGE_ERROR_I18N_KEYS[message];
}
