# Pruebas API — QAFlow

## Artefactos

- `QAFlow_Postman_Collection.json`: colección Postman v2.1 con seis requests encadenados.
- `QAFlow_Postman_Environment.json`: environment local con `baseUrl`, `authToken`, `productId` y `productSku`.

La colección valida códigos HTTP, tiempo de respuesta, `Content-Type`, estructura JSON, tipos de datos, campos obligatorios y mensajes de error.

## Orden de ejecución

1. Login exitoso.
2. Login incorrecto.
3. Consultar productos.
4. Crear producto.
5. Rechazar SKU duplicado.
6. Rechazar salida con stock insuficiente.

## Newman

Con QAFlow disponible en `http://127.0.0.1:3000`:

```powershell
npx newman run QAFlow_Postman_Collection.json -e QAFlow_Postman_Environment.json
```

Los valores `authToken`, `productId` y `productSku` se generan durante la ejecución; no deben completarse manualmente.

## Resultado técnico de la Fase 3

- Requests ejecutados: 6.
- Requests fallidos: 0.
- Assertions ejecutadas: 30.
- Assertions fallidas: 0.

Evidencias generadas:

- `Evidencias/Newman_QAFlow_Resultados.json`.
- `Evidencias/Newman_QAFlow_Ejecucion.txt`.
