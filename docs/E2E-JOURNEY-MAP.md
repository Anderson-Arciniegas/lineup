# Mapa de cobertura E2E (flujos)

**Regla:** ≥80% de los ítems de cada mapa deben estar implementados (checkbox marcado) y verdes en Chromium.

Gate CI: `node scripts/check-e2e-journey-coverage.mjs`

Convención Playwright: cada flujo implementado usa el tag `@journey` en el título del test.

---

## lineup-e2e (30 flujos — umbral ≥24)

### Público (12)

- [x] home/landing carga contenido principal `@journey`
- [x] login muestra layout de autenticación `@journey`
- [x] register account-type accesible `@journey`
- [x] register user formulario visible `@journey`
- [x] register business formulario visible `@journey`
- [x] search con término en URL `@journey`
- [x] business page por path `@journey`
- [x] catalog page `@journey`
- [x] product page `@journey`
- [x] privacy policy `@journey`
- [x] terms and conditions `@journey`
- [x] catalog download vista `@journey`

### Usuario autenticado (8)

- [x] login user → dashboard `@journey`
- [x] profile `@journey`
- [x] user settings `@journey`
- [x] favorites `@journey`
- [x] wishlist `@journey`
- [x] my-ratings `@journey`
- [x] notifications panel open `@journey`
- [x] logout `@journey`

### Business / control-panel (10)

- [x] login business → panel `@journey`
- [x] catalogs list `@journey`
- [x] create catalog `@journey`
- [x] products list / product panel `@journey`
- [x] create product `@journey`
- [x] inventory / SKU `@journey`
- [x] discounts panel `@journey`
- [x] locations `@journey`
- [x] social medias `@journey`
- [x] statistics `@journey`

---

## admin-e2e (4 flujos — umbral ≥4, 80%=3.2→4)

- [x] login page carga `@journey`
- [x] post-login shell visible `@journey`
- [x] listado principal navegable `@journey`
- [x] logout o sesión inválida `@journey`

---

## mobile-e2e (3 flujos — umbral ≥3, 80%=2.4→3)

- [x] home carga `@journey`
- [x] navegación principal `@journey`
- [x] ruta secundaria accesible `@journey`

---

## Estado

| Mapa | Total | Implementados | % | Cumple ≥80% |
| ---- | ----- | ------------- | - | ----------- |
| lineup-e2e | 30 | 30 | 100% | SÍ |
| admin-e2e | 4 | 4 | 100% | SÍ |
| mobile-e2e | 3 | 3 | 100% | SÍ |

Actualizar checkboxes y esta tabla al implementar flujos.
