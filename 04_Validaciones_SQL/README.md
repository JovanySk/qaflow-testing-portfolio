# Validaciones SQL — QAFlow

Scripts MySQL 8 para validar integridad y consistencia sobre un conjunto de manufactura simplificado.

## Orden de ejecución

Desde el cliente MySQL:

```powershell
mysql --user=root --password --execute="source D:/Proyectos/QAFlow_Manufacturing_Testing_Portfolio/04_Validaciones_SQL/schema_qaflow.sql"
mysql --user=root --password --execute="source D:/Proyectos/QAFlow_Manufacturing_Testing_Portfolio/04_Validaciones_SQL/datos_prueba_qaflow.sql"
mysql --user=root --password --execute="source D:/Proyectos/QAFlow_Manufacturing_Testing_Portfolio/04_Validaciones_SQL/validaciones_qaflow.sql"
```

## Cobertura

- SKU duplicados.
- Cantidades negativas.
- Integridad referencial.
- Existencia de productos.
- Movimientos de inventario.
- Cálculo de stock.
- Órdenes sin BOM.
- Órdenes completadas sin inspección.
- Rechazos sin observaciones.
- Auditoría.

## Resultado técnico de la Fase 3

Las diez validaciones terminaron `PASSED`, con cero anomalías para el conjunto de datos controlado. El resultado crudo se conserva en `Evidencias/Resultados_Validaciones_SQL.txt`.
