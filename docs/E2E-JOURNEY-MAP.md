# Mapa de cobertura E2E (flujos)

**Regla:** ≥80% de los ítems de cada mapa deben estar implementados (checkbox marcado) y verdes en Chromium.

Gate CI: `node scripts/check-e2e-journey-coverage.mjs`

Convención Playwright: cada flujo implementado usa `@journey` y la HU primaria `@hu-xx` en el título del test. Las tareas heurísticas añaden `@t-xx`.

Capítulo TEG 4.5: [`TEG/TEG - Pruebas y Validacion.md`](../../../TEG/TEG%20-%20Pruebas%20y%20Validacion.md).

Los journeys `@t-01`–`@t-10` y P1 (guards, onboarding, WhatsApp/BCV) usan `click` / `fill` / `submit`. El resto sigue siendo smoke de ruta.

---

## lineup-e2e (48 flujos — umbral ≥39)

### Público (17)

- [x] home/landing carga contenido principal `@journey @hu-19`
- [x] landing info `@journey @hu-19`
- [x] login error luego éxito como negocio `@journey @hu-03 @t-01`
- [x] register account-type accesible `@journey @hu-01`
- [x] register user formulario visible `@journey @hu-01`
- [x] register business verificación y alta `@journey @hu-02 @t-02`
- [x] search con término en URL `@journey @hu-20`
- [x] tag exploration `@journey @hu-20`
- [x] business page por path `@journey @hu-21`
- [x] catalog page búsqueda pública `@journey @hu-20 @t-07`
- [x] catalog page y detalle de producto `@journey @hu-21 @t-08`
- [x] product page WhatsApp y equivalente BS `@journey @hu-22 @hu-29 @t-08`
- [x] privacy policy `@journey @hu-19`
- [x] terms and conditions `@journey @hu-19`
- [x] catalog download overlay y volver `@journey @hu-24 @t-09`
- [x] profile sin sesión redirige a login `@journey @hu-03`
- [x] dashboard sin sesión redirige a login `@journey @hu-03`

### Usuario autenticado (8)

- [x] login user → dashboard `@journey @hu-23`
- [x] profile `@journey @hu-04`
- [x] user settings `@journey @hu-04`
- [x] favorites `@journey @hu-23`
- [x] wishlist `@journey @hu-23`
- [x] my-ratings `@journey @hu-23`
- [x] notifications panel open `@journey @hu-28`
- [x] logout `@journey @hu-04`

### Business / control-panel (23)

- [x] login business → panel `@journey @hu-14`
- [x] onboarding setup datos y guardar `@journey @hu-05 @t-10`
- [x] onboarding crear catálogo `@journey @hu-05`
- [x] onboarding crear producto `@journey @hu-05 @t-03`
- [x] onboarding sin flag redirige al panel `@journey @hu-05`
- [x] edit business guardar `@journey @hu-06 @t-10`
- [x] business settings `@journey @hu-04`
- [x] catalogs list `@journey @hu-07`
- [x] create catalog `@journey @hu-07`
- [x] catalog panel búsqueda `@journey @hu-07 @t-07`
- [x] products list / eliminar producto `@journey @hu-09 @t-05`
- [x] create product inválido luego válido `@journey @hu-09 @t-03`
- [x] edit product cancelar dirty `@journey @hu-09 @t-04`
- [x] inventory / SKU `@journey @hu-10`
- [x] product SKU guardar `@journey @hu-10 @t-03`
- [x] register sale `@journey @hu-10`
- [x] discounts panel `@journey @hu-11`
- [x] create discount `@journey @hu-11`
- [x] locations `@journey @hu-12`
- [x] business hours `@journey @hu-12`
- [x] social medias `@journey @hu-13`
- [x] statistics `@journey @hu-14`
- [x] import products archivo `@journey @hu-18 @t-06`

---

## admin-e2e (8 flujos — umbral ≥7, 80%=6.4→7)

- [x] login page carga `@journey @hu-26`
- [x] post-login shell visible `@journey @hu-27`
- [x] listado usuarios admin `@journey @hu-26`
- [x] listado negocios admin `@journey @hu-26`
- [x] stats admin `@journey @hu-27`
- [x] roles admin `@journey @hu-27`
- [x] social networks admin `@journey @hu-27`
- [x] logout o sesión inválida `@journey @hu-26`

---

## mobile-e2e (3 flujos — umbral ≥3, 80%=2.4→3)

- [x] home carga `@journey @hu-30`
- [x] navegación principal `@journey @hu-30`
- [x] ruta secundaria accesible `@journey @hu-30`

---

## Estado

| Mapa | Total | Implementados | % | Cumple ≥80% |
| ---- | ----- | ------------- | - | ----------- |
| lineup-e2e | 48 | 48 | 100% | SÍ |
| admin-e2e | 8 | 8 | 100% | SÍ |
| mobile-e2e | 3 | 3 | 100% | SÍ |

Actualizar checkboxes y esta tabla al implementar flujos.
