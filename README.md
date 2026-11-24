# QAFlow — Manufacturing Testing Portfolio

> **EN summary:** an end-to-end QA portfolio for a simplified manufacturing system: test plan, documented test cases, API tests, SQL validation, E2E automation, defect reports and evidence. The app under test (Node.js + Express + MySQL 8) was built only to be tested.

| Area | Result (evidence in each `Evidencias/` folder) |
|---|---|
| API — Postman/Newman | **6/6 requests, 30/30 assertions**, avg response **25 ms** |
| E2E — Cypress | **4/4** login scenarios passing (valid, invalid, empty fields, logout) |
| Data — MySQL 8 | **10/10** SQL integrity validations passing |
| Test design | 15 documented cases (6 passed, 1 failed with triage note, 8 not run), 34-point regression checklist, 3 defect report drafts |

**Run the app under test:** see [`09_Sistema_Bajo_Prueba/README.md`](09_Sistema_Bajo_Prueba/README.md). Demo-only credentials: `qa.admin` / `QaflowDemo#2026` (local disposable database).

---


Portafolio profesional de aseguramiento de calidad aplicado sobre un sistema simplificado de gestión de manufactura.

QAFlow no es un ERP ni un sistema completo de manufactura. El sistema de manufactura será un **sistema simplificado utilizado como objeto de pruebas**. El valor principal del proyecto está en la estrategia, documentación, ejecución y evidencia de calidad.

## Objetivo

Respaldar de forma honesta y verificable la siguiente experiencia técnica:

> Portafolio de QA para el plan de pruebas de un sistema de gestión de manufactura, cubriendo casos documentados, validación SQL y automatización.
>
> Documenté casos de prueba cubriendo los módulos de Login, Productos, Inventario, Pedidos, BOM, Órdenes de Producción e Inspección de Calidad, con pasos, resultados esperados, estatus y evidencia.
>
> Ejecuté validaciones SQL en MySQL para verificar integridad de datos y probé endpoints REST con Postman usando aserciones automatizadas de estatus, tiempo de respuesta y estructura de datos.
>
> Automaticé casos de prueba críticos con Cypress para flujos de login y construí un checklist de regresión cubriendo los flujos críticos del sistema.

## Alcance funcional del objeto de pruebas

El alcance documental cubre:

- Login.
- Productos.
- Inventario.
- Pedidos.
- BOM.
- Órdenes de Producción.
- Inspecciones de Calidad.

La aplicación mínima construida en la etapa 2 se limita a los flujos necesarios para ejecutar validaciones verificables de autenticación, consulta y creación de productos, control de SKU duplicado, entradas de inventario y rechazo de salidas por stock insuficiente.

## Entregables del portafolio

| Área | Entregable | Formato | Fase |
|---|---|---|---|
| Presentación | Resumen ejecutivo del portafolio | PDF | 4 |
| Estrategia | Plan de pruebas | DOCX y PDF | 1 |
| Diseño de pruebas | 15 casos de prueba | XLSX | 1 |
| API | Colección y environment de Postman | JSON | 3 |
| Base de datos | Esquema, datos y validaciones | SQL | 3 |
| Automatización | Pruebas de login con Cypress | JavaScript | 3 |
| Defectos | Tres reportes de defectos realistas | XLSX | 1 |
| Regresión | Checklist de flujos críticos | XLSX | 1 |
| Resultados | Reporte, estados y evidencias | Documentación y evidencias | 4 |

## Estructura

```text
QAFlow_Manufacturing_Testing_Portfolio/
├── 00_Presentacion/
├── 01_Plan_de_Pruebas/
├── 02_Casos_de_Prueba/
├── 03_Pruebas_API/
│   └── Evidencias/
├── 04_Validaciones_SQL/
│   └── Evidencias/
├── 05_Automatizacion_Cypress/
│   └── Evidencias/
├── 06_Reportes_de_Defectos/
│   └── Evidencias/
├── 07_Regresion/
├── 08_Evidencias/
│   ├── Login/
│   ├── Productos/
│   ├── Inventario/
│   ├── APIs/
│   ├── SQL/
│   └── Cypress/
├── 09_Sistema_Bajo_Prueba/
│   ├── api/
│   └── web/
└── README.md
```

## Fases

### Fase 1 - Base documental

- Estructura de carpetas.
- README inicial.
- Plan de pruebas en DOCX y PDF.
- Casos de prueba en XLSX.
- Reportes de defectos en XLSX.
- Checklist de regresión en XLSX.

### Etapa 2 - Aplicación mínima de manufactura

- API Node.js + Express + MySQL.
- Frontend HTML, CSS y JavaScript.
- Flujos mínimos verificables y atributos `data-cy`.

### Fase 3 - Ejecución técnica

- Colección Postman y environment.
- Scripts SQL.
- Automatización Cypress.
- Ejecución de validaciones verificables.

### Fase 4 - Evidencias y presentación

- Organización de evidencias.
- Actualización de estados según ejecución real.
- Reporte de resultados.
- Resumen en PDF.

## Artefactos disponibles de la Fase 1

- `01_Plan_de_Pruebas/Plan_de_Pruebas_QAFlow.docx`
- `01_Plan_de_Pruebas/Plan_de_Pruebas_QAFlow.pdf`
- `02_Casos_de_Prueba/Casos_de_Prueba_QAFlow.xlsx`
- `06_Reportes_de_Defectos/Defectos_QAFlow.xlsx`
- `07_Regresion/Checklist_Regresion_QAFlow.xlsx`

Los libros incluyen encabezados legibles, filtros, paneles congelados, anchos ajustados, listas de selección y formato condicional. El plan y los libros fueron sometidos a revisión estructural y visual antes de cerrar la fase.

## Aplicación mínima disponible de la etapa 2

- `09_Sistema_Bajo_Prueba/api`: API REST Node.js + Express con persistencia MySQL.
- `09_Sistema_Bajo_Prueba/web`: interfaz HTML, CSS y JavaScript con atributos `data-cy`.
- `09_Sistema_Bajo_Prueba/README.md`: configuración, credenciales locales, endpoints y límites intencionales.

La implementación permite validar login exitoso, login incorrecto, campos vacíos, consulta y creación de productos, SKU duplicado, entrada de inventario y rechazo de salida por stock insuficiente. El inventario usa transacciones y bloqueo de fila para conservar la consistencia del stock.

## Artefactos ejecutados de la Fase 3

- `03_Pruebas_API/QAFlow_Postman_Collection.json`: seis requests Postman v2.1 con 30 assertions.
- `03_Pruebas_API/QAFlow_Postman_Environment.json`: variables `baseUrl`, `authToken`, `productId` y `productSku`.
- `04_Validaciones_SQL/schema_qaflow.sql`: esquema relacional MySQL 8.
- `04_Validaciones_SQL/datos_prueba_qaflow.sql`: conjunto de datos determinista e idempotente.
- `04_Validaciones_SQL/validaciones_qaflow.sql`: diez validaciones consolidadas.
- `05_Automatizacion_Cypress/cypress/e2e/login.cy.js`: cuatro casos E2E de autenticación.

Resultados técnicos: SQL 10/10, Postman 6/6 con 30/30 assertions y Cypress 4/4. Los reportes crudos y las capturas se conservan en las carpetas `Evidencias` de cada área.

## Artefactos disponibles de la Fase 4

- `08_Evidencias/README.md`: índice de evidencia y trazabilidad por caso.
- `08_Evidencias/Reporte_de_Resultados_QAFlow.docx`: reporte editable de resultados.
- `08_Evidencias/Reporte_de_Resultados_QAFlow.pdf`: reporte final de resultados.
- `00_Presentacion/QAFlow_Resumen.pdf`: resumen ejecutivo del portafolio.

Resultado formal de los 15 casos documentados: 6 `PASSED`, 1 `FAILED`, 8 `NOT RUN` y 0 `BLOCKED`. El caso `TC-INV-002` conserva `FAILED` porque el contrato del caso espera HTTP 422 y la ejecución observó HTTP 409; el rechazo funcional sí ocurrió y la discrepancia queda documentada para triage.

## Criterio de veracidad

- Ningún caso se marcará `PASSED` sin ejecución y evidencia.
- Los casos solo cambian de `NOT RUN` cuando existe ejecución trazable y evidencia directa.
- Los defectos se documentan en un ambiente local de QA sobre el sistema simplificado utilizado como objeto de pruebas.
- No se afirmará que un defecto fue encontrado en un entorno distinto al realmente utilizado.

## Estado actual

Fases 1, 2, 3 y 4 completadas y verificadas el 20 de julio de 2026. El portafolio incluye la base documental, el sistema simplificado utilizado como objeto de pruebas, los artefactos técnicos de API, SQL y Cypress, las evidencias organizadas, el reporte de resultados y el resumen ejecutivo.

Los ocho casos sin ejecución formal permanecen `NOT RUN`. El checklist de regresión conserva sus 34 verificaciones en `NOT RUN` porque fue diseñado, pero no ejecutado como suite completa. Los tres reportes de defectos continúan como borradores no confirmados y no se presentan como hallazgos reproducidos.

---
Autor: **Jovany Morales del Ángel** · Licencia MIT
