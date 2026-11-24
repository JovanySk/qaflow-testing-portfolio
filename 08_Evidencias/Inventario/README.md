# Evidencia de Inventario

El escenario ejecutado fue `TC-INV-002`, salida con stock insuficiente. La API rechazó la operación y devolvió una respuesta JSON tipada, pero el código observado fue HTTP 409 y el caso formal esperaba HTTP 422.

Archivos relacionados:

- `../APIs/Newman_QAFlow_Ejecucion.txt`.
- `../APIs/Newman_QAFlow_Resultados.json`.
- `Hallazgo_TC-INV-002.md`.

`TC-INV-001` y `TC-INV-003` permanecen `NOT RUN` porque no existe evidencia directa de todos sus pasos y resultados esperados.

