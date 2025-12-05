# Tests E2E con Playwright - Admin Panel

Este directorio contiene los tests end-to-end automatizados para el panel de administración.

## Estructura

```
tests/e2e/
├── fixtures/          # Fixtures y datos de prueba
├── helpers/          # Helpers y utilidades
│   ├── page-objects/ # Page Object Models
│   └── selectors.ts  # Selectores centralizados
├── smoke/            # Tests de smoke
├── auth/             # Tests de autenticación admin
├── usuarios/         # Tests de gestión de usuarios
├── reglas/           # Tests de gestión de reglas
└── ...
```

## Ejecutar Tests

```bash
# Ejecutar todos los tests
npm run test:e2e

# Ejecutar con UI interactiva
npm run test:e2e:ui

# Ver reporte HTML
npm run test:e2e:report
```

## Convenciones

Ver `app-prefa-frontend/tests/e2e/README.md` para convenciones generales.

