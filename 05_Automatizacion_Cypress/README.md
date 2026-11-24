# Automatización Cypress — QAFlow

Automatización E2E de los flujos críticos de login del sistema simplificado utilizado como objeto de pruebas.

## Cobertura obligatoria

- `CY-LOGIN-001`: login exitoso.
- `CY-LOGIN-002`: rechazo de credenciales incorrectas.

## Cobertura opcional añadida después de validar la obligatoria

- `CY-LOGIN-003`: validación de campos vacíos sin llamada a la API.
- `CY-LOGIN-004`: cierre de sesión.

Las pruebas usan atributos `data-cy`, `cy.intercept()`, fixtures, comandos personalizados y assertions reintentables. No contienen esperas fijas.

## Ejecución

Con QAFlow disponible en `http://127.0.0.1:3000`:

```powershell
npm install
npm run cy:run
```

Para otra URL:

```powershell
npm run cy:run -- --config baseUrl=http://127.0.0.1:3100
```

Las capturas se generan en `Evidencias/screenshots`.

## Resultado técnico de la Fase 3

- Casos ejecutados: 4.
- Casos exitosos: 4.
- Casos fallidos: 0.
- Capturas revisadas visualmente: 4.

Los resultados se encuentran en `Evidencias/Cypress_Login_Obligatorias.txt`, `Evidencias/Cypress_Login_Completa.txt` y `Evidencias/screenshots`.
