# Hallazgo de triage — TC-INV-002

## Resumen

La salida con stock insuficiente fue rechazada correctamente a nivel funcional. Sin embargo, el caso formal define HTTP 422 y la API junto con la colección Postman validan HTTP 409.

## Resultado observado

- Endpoint: `POST /api/inventory/movements`.
- Código observado: HTTP 409.
- Mensaje y detalle: estructura JSON válida con identificación de stock insuficiente.
- Código esperado por `TC-INV-002`: HTTP 422.
- Verificación posterior de stock: no ejecutada en esta corrida.

## Clasificación

Discrepancia de contrato pendiente de triage. Antes de cambiar implementación o pruebas debe acordarse el código HTTP oficial y sincronizarse el caso formal, la colección Postman y el checklist de regresión.

## Evidencia

- `../APIs/Newman_QAFlow_Ejecucion.txt`.
- `../APIs/Newman_QAFlow_Resultados.json`.

