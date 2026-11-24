# Índice de evidencias — QAFlow

Evidencias obtenidas el 20 de julio de 2026 en un ambiente local de QA sobre el sistema simplificado utilizado como objeto de pruebas.

## Resultado consolidado

| Capa | Ejecución | Resultado |
|---|---:|---:|
| Casos formales | 15 diseñados | 6 PASSED, 1 FAILED, 8 NOT RUN |
| Postman/Newman | 6 solicitudes, 30 aserciones | 6/6 y 30/30 |
| SQL/MySQL | 10 validaciones | 10/10 |
| Cypress | 4 pruebas E2E | 4/4 |

Las capas no se suman en una sola tasa de aprobación porque representan unidades de medición diferentes.

## Trazabilidad de casos ejecutados

| Caso | Estado | Evidencia principal |
|---|---|---|
| TC-LOG-001 | PASSED | `Login/CY-LOGIN-001_login_exitoso.png`, `Cypress/Cypress_Login_Completa.txt`, `APIs/Newman_QAFlow_Ejecucion.txt` |
| TC-LOG-002 | PASSED | `Login/CY-LOGIN-002_login_incorrecto.png`, `Cypress/Cypress_Login_Completa.txt`, `APIs/Newman_QAFlow_Ejecucion.txt` |
| TC-LOG-003 | PASSED | `Login/CY-LOGIN-003_campos_vacios.png`, `Cypress/Cypress_Login_Completa.txt` |
| TC-PRO-001 | PASSED | `APIs/Newman_QAFlow_Ejecucion.txt`, `APIs/Newman_QAFlow_Resultados.json` |
| TC-PRO-002 | PASSED | `APIs/Newman_QAFlow_Ejecucion.txt`, `APIs/Newman_QAFlow_Resultados.json` |
| TC-PRO-003 | PASSED | `APIs/Newman_QAFlow_Ejecucion.txt`, `APIs/Newman_QAFlow_Resultados.json` |
| TC-INV-002 | FAILED | `APIs/Newman_QAFlow_Ejecucion.txt`, `APIs/Newman_QAFlow_Resultados.json`, `Inventario/Hallazgo_TC-INV-002.md` |

## Evidencia técnica adicional

- `Login/CY-LOGIN-004_cierre_sesion.png`: evidencia del caso Cypress opcional de cierre de sesión.
- `Cypress/Cypress_Login_Obligatorias.txt`: ejecución separada de los dos escenarios obligatorios.
- `SQL/Resultados_Validaciones_SQL.txt`: resultado consolidado de las diez validaciones de integridad.
- `APIs/Newman_QAFlow_Resultados.json`: reporte estructurado para auditoría detallada de cada aserción.

## Criterio de veracidad

- Un caso formal solo se marca `PASSED` cuando su resultado esperado fue observado y existe evidencia directa.
- `TC-INV-002` se marca `FAILED` porque el caso exige HTTP 422 y la respuesta observada fue HTTP 409, aunque el rechazo funcional sí ocurrió.
- Los ocho casos restantes conservan `NOT RUN`; las validaciones SQL relacionadas no sustituyen la ejecución funcional completa.
- El checklist de regresión permanece como diseño de 34 verificaciones y no se declara ejecutado como suite completa.

