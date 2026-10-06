# Playwright QA Framework

Framework de automatización E2E y de API construido con [Playwright](https://playwright.dev) y TypeScript, sobre dos sitios de práctica públicos:

- **UI**: [SauceDemo](https://www.saucedemo.com) — login, catálogo, detalle de producto, carrito y checkout.
- **API**: [restful-booker](https://restful-booker.herokuapp.com) — CRUD y búsqueda de reservas con autenticación por token.

## Por qué esta arquitectura

- **Page Object Model** (`pages/`): cada página expone sus locators y acciones, no sus asserts. Los asserts viven en los tests para que el POM sea reutilizable entre distintos escenarios.
- **Fixtures** (`fixtures/`): encapsulan setup repetido — login de UI y obtención de token de API — para que los tests no dupliquen ese código ni conozcan el detalle de cómo se autentica.
- **Selectores**: se prioriza `getByRole`/`getByPlaceholder` y `data-test` sobre CSS/XPath frágil, siguiendo la misma política de estabilidad que se usa en testing profesional.
- **Trazabilidad**: cada archivo de test referencia su caso correspondiente en `docs/*.feature`, escrito en Gherkin. La idea es que cualquier persona (técnica o no) pueda leer el criterio de aceptación sin abrir código.
- **Contrato de API**: la forma de `Booking` se valida con `zod` (`utils/schemas.ts`) en vez de asserts campo por campo, así un cambio de forma en la respuesta falla con un mensaje claro.
- **Accesibilidad**: `@axe-core/playwright` corre sobre las pantallas clave (WCAG 2.0 A/AA) para atrapar regresiones de accesibilidad, no solo funcionales.
- **Tags**: `@smoke` (feedback rápido en cada push/PR), `@regression` (suite completa) y `@negative` (casos de error/edge cases) permiten correr subconjuntos sin tocar código — ver sección CI.

## Estructura

```
pages/       Page Objects (Login, Inventory, Cart, Checkout, ProductDetail)
fixtures/    Fixtures de Playwright (auth UI, token API)
utils/       Datos de prueba y schemas de validación (zod)
tests/ui/    Specs E2E sobre SauceDemo (incluye accesibilidad)
tests/api/   Specs de API sobre restful-booker (CRUD, búsqueda, edge cases)
docs/        Casos de prueba en Gherkin, trazables a cada spec
.github/     Workflow de CI
global-setup.ts  Pre-flight check: aborta la suite si la API no responde
```

## Requisitos

- Node.js 20+

## Instalación

```bash
npm install
npx playwright install --with-deps
```

## Ejecución

```bash
npm test               # toda la suite (UI en Chromium/Firefox/WebKit + mobile smoke + API)
npm run test:ui        # solo specs de UI (Chromium + Firefox + WebKit)
npm run test:api       # solo specs de API
npm run test:mobile    # solo @smoke en viewport mobile (Pixel 5)
npm run test:smoke     # solo tests @smoke, en todos los proyectos
npm run test:regression # solo tests @regression
npm run test:headed    # UI con navegador visible
npm run test:report    # abre el último reporte HTML
npm run typecheck      # tsc --noEmit
npm run lint           # biome check (lint + formato)
npm run lint:fix       # aplica los fixes automáticos de biome
```

Para correr un archivo o test puntual:

```bash
npx playwright test tests/ui/login.spec.ts -g "usuario estándar"
```

## Variables de entorno

Copia `.env.example` a `.env` si necesitas apuntar a otro entorno o credenciales distintas de restful-booker (`BOOKER_USERNAME`, `BOOKER_PASSWORD`).

## CI

`.github/workflows/playwright.yml` corre lint + typecheck siempre, y después:

- En cada **push/PR a main**: solo los tests `@smoke`, para feedback rápido.
- Todas las noches (**cron**) y en **workflow_dispatch** (manual): la suite completa, con los 4 proyectos de navegador/viewport y todos los tags.

El reporte HTML queda disponible como artefacto del run en ambos casos.

## Nota sobre el contenido

Este repositorio usa exclusivamente sitios públicos de práctica. No contiene código, selectores ni datos de ningún proyecto propietario.
