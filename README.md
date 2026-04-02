# Lineup

Monorepo [Nx](https://nx.dev) con aplicaciones web y móvil para **catálogos y vitrinas de negocios**: exploración pública de negocios y productos, panel de administración para dueños (catálogos, productos, descuentos, ubicaciones, estadísticas, inventario, etc.) e interfaz de usuario final.

## Stack principal

| Área | Tecnología |
|------|------------|
| Framework | Angular 20 (componentes standalone, signals donde aplica) |
| Monorepo | Nx 21 |
| API | GraphQL ([Apollo Client](https://www.apollographql.com/docs/react/) / `apollo-angular`) |
| UI | [PrimeNG](https://primeng.org/) 20, [Tailwind CSS](https://tailwindcss.com/) 4 |
| Estado | NgRx (store, effects, signals) |
| i18n | `@ngx-translate` |
| Web | **SSR** con `@angular/ssr` y Express (`server.ts` / `main.server.ts`) |
| Móvil | Ionic + [Capacitor](https://capacitorjs.com/) 7 |
| E2E | Playwright |
| Tests unitarios | Jest |

## Estructura del workspace

| Proyecto | Descripción |
|----------|-------------|
| `lineup` | Aplicación web principal (`apps/lineup`): landing, negocios, catálogos, productos, autenticación, perfil y panel de control. |
| `mobile` | Shell Ionic (`apps/mobile`) para empaquetado nativo con Capacitor. |
| `lineup-e2e` / `mobile-e2e` | Pruebas end-to-end con Playwright. |

**Librerías compartidas** (`libs/shared/`):

- `core` — modelos, esquemas, servicios y utilidades de dominio.
- `graphql` — consultas, mutaciones y selecciones GraphQL.
- `ui` — componentes de presentación y estilos globales (`_styles.scss`).
- `i18n` — cadenas y módulo de traducción.
- `assets` — fuentes y recursos estáticos reutilizables.
- `environments` — configuración centralizada (`@lineup/envs`) y proxy de desarrollo.

## Requisitos

- **Node.js** compatible con Angular 20 (recomendado: última LTS actual).
- **npm** (el lockfile del repo es `package-lock.json`).

## Instalación

```sh
npm install
```

`postinstall` instala los navegadores necesarios para Playwright.

## Desarrollo

Servidor de desarrollo de la app web **lineup** (puerto 4200, escucha en todas las interfaces):

```sh
npm run start:dev:lineup
```

Equivalente con Nx:

```sh
npx nx serve lineup --configuration=development --host=0.0.0.0 --port=4200
```

La app `lineup` usa un **proxy HTTP** definido en `libs/shared/environments/proxy.conf.json` para redirigir rutas `/api/*` al backend en desarrollo. Los endpoints GraphQL y archivos también se configuran desde la librería `@lineup/envs` (`libs/shared/environments`).

App **mobile**:

```sh
npx nx serve mobile
```

## Build

```sh
npm run build:prod:lineup
```

Salida: `dist/apps/lineup` (incluye artefactos de servidor para SSR según la configuración del proyecto).

Previsualizar el build de producción con servidor estático local:

```sh
npm run start:prod:lineup
```

## Pruebas y calidad

```sh
# Proyecto concreto
npx nx run lineup:test
npx nx run lineup:lint
npx nx run lineup-e2e:e2e

# Lint, test, build y e2e afectados por cambios (útil en CI)
npm run test:all
```

Ver targets disponibles de un proyecto:

```sh
npx nx show project lineup
```

## Configuración y secretos

La configuración de URLs de API, claves de servicios externos y semillas criptográficas vive en `libs/shared/environments`. **No subas claves reales a repositorios públicos**; usa valores de desarrollo o variables de entorno según tu flujo de despliegue.

## Grafo de dependencias entre proyectos

```sh
npx nx graph
```

## Documentación Nx

- [Tutorial monorepo Angular](https://nx.dev/getting-started/tutorials/angular-monorepo-tutorial)
- [Ejecutar tareas](https://nx.dev/features/run-tasks)

---

Repositorio privado de desarrollo (`private: true` en `package.json`).
