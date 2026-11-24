-- QAFlow Manufacturing Testing Portfolio
-- Validaciones consolidadas. Un resultado PASSED requiere cero anomalías.

USE qaflow_portfolio;

DROP TEMPORARY TABLE IF EXISTS qaflow_validation_results;

CREATE TEMPORARY TABLE qaflow_validation_results (
  validation_id VARCHAR(12) NOT NULL,
  category VARCHAR(80) NOT NULL,
  validation_description VARCHAR(240) NOT NULL,
  anomaly_count INT NOT NULL,
  validation_status ENUM('PASSED', 'FAILED') NOT NULL,
  PRIMARY KEY (validation_id)
);

INSERT INTO qaflow_validation_results
SELECT
  'SQL-001',
  'SKU duplicados',
  'Detecta más de un producto para el mismo SKU sin distinguir mayúsculas.',
  COUNT(*),
  IF(COUNT(*) = 0, 'PASSED', 'FAILED')
FROM (
  SELECT UPPER(TRIM(sku)) AS normalized_sku
  FROM products
  GROUP BY UPPER(TRIM(sku))
  HAVING COUNT(*) > 1
) duplicate_skus;

INSERT INTO qaflow_validation_results
SELECT
  'SQL-002',
  'Cantidades negativas',
  'Busca precios, stocks, movimientos o cantidades con valores negativos o nulos inválidos.',
  COUNT(*),
  IF(COUNT(*) = 0, 'PASSED', 'FAILED')
FROM (
  SELECT 'products' AS source_table, id FROM products WHERE unit_price < 0 OR current_stock < 0
  UNION ALL
  SELECT 'inventory_movements', id FROM inventory_movements WHERE quantity <= 0 OR stock_before < 0 OR stock_after < 0
  UNION ALL
  SELECT 'customer_order_items', id FROM customer_order_items WHERE quantity <= 0 OR unit_price < 0
  UNION ALL
  SELECT 'bom_items', id FROM bom_items WHERE quantity_required <= 0
  UNION ALL
  SELECT 'production_orders', id FROM production_orders WHERE planned_quantity <= 0 OR completed_quantity < 0
  UNION ALL
  SELECT 'quality_inspections', id FROM quality_inspections WHERE inspected_quantity <= 0 OR rejected_quantity < 0
) invalid_quantities;

INSERT INTO qaflow_validation_results
SELECT
  'SQL-003',
  'Integridad referencial',
  'Identifica registros huérfanos entre productos, pedidos, BOM, producción e inspecciones.',
  COUNT(*),
  IF(COUNT(*) = 0, 'PASSED', 'FAILED')
FROM (
  SELECT 'inventory_product' AS relation_name, im.id
  FROM inventory_movements im LEFT JOIN products p ON p.id = im.product_id
  WHERE p.id IS NULL
  UNION ALL
  SELECT 'order_item_order', oi.id
  FROM customer_order_items oi LEFT JOIN customer_orders o ON o.id = oi.order_id
  WHERE o.id IS NULL
  UNION ALL
  SELECT 'order_item_product', oi.id
  FROM customer_order_items oi LEFT JOIN products p ON p.id = oi.product_id
  WHERE p.id IS NULL
  UNION ALL
  SELECT 'bom_component', bi.id
  FROM bom_items bi LEFT JOIN products p ON p.id = bi.component_product_id
  WHERE p.id IS NULL
  UNION ALL
  SELECT 'production_product', po.id
  FROM production_orders po LEFT JOIN products p ON p.id = po.product_id
  WHERE p.id IS NULL
  UNION ALL
  SELECT 'inspection_production', qi.id
  FROM quality_inspections qi LEFT JOIN production_orders po ON po.id = qi.production_order_id
  WHERE po.id IS NULL
) orphan_records;

INSERT INTO qaflow_validation_results
SELECT
  'SQL-004',
  'Existencia de productos',
  'Confirma la existencia de los tres SKU obligatorios del conjunto de pruebas.',
  GREATEST(3 - COUNT(DISTINCT sku), 0),
  IF(COUNT(DISTINCT sku) = 3, 'PASSED', 'FAILED')
FROM products
WHERE sku IN ('MAT-STEEL-01', 'CMP-SCREW-01', 'FG-PANEL-01')
  AND active = TRUE;

INSERT INTO qaflow_validation_results
SELECT
  'SQL-005',
  'Movimientos de inventario',
  'Valida la aritmética interna de cada entrada y salida registrada.',
  COUNT(*),
  IF(COUNT(*) = 0, 'PASSED', 'FAILED')
FROM inventory_movements
WHERE stock_after <> CASE
  WHEN movement_type = 'ENTRY' THEN stock_before + quantity
  WHEN movement_type = 'EXIT' THEN stock_before - quantity
END;

INSERT INTO qaflow_validation_results
SELECT
  'SQL-006',
  'Cálculo de stock',
  'Compara el stock persistido contra la suma de entradas menos salidas.',
  COUNT(*),
  IF(COUNT(*) = 0, 'PASSED', 'FAILED')
FROM products p
LEFT JOIN (
  SELECT
    product_id,
    SUM(CASE WHEN movement_type = 'ENTRY' THEN quantity ELSE -quantity END) AS calculated_stock
  FROM inventory_movements
  GROUP BY product_id
) movement_totals ON movement_totals.product_id = p.id
WHERE p.current_stock <> COALESCE(movement_totals.calculated_stock, 0);

INSERT INTO qaflow_validation_results
SELECT
  'SQL-007',
  'Órdenes sin BOM',
  'Busca órdenes de producción activas o completadas sin una BOM válida y activa.',
  COUNT(*),
  IF(COUNT(*) = 0, 'PASSED', 'FAILED')
FROM production_orders po
LEFT JOIN boms b ON b.id = po.bom_id AND b.status = 'ACTIVE'
WHERE po.status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED')
  AND b.id IS NULL;

INSERT INTO qaflow_validation_results
SELECT
  'SQL-008',
  'Órdenes completadas sin inspección',
  'Detecta órdenes completadas que no cuentan con inspección de calidad.',
  COUNT(*),
  IF(COUNT(*) = 0, 'PASSED', 'FAILED')
FROM production_orders po
JOIN (
  SELECT completed_po.id
  FROM production_orders completed_po
  LEFT JOIN quality_inspections qi ON qi.production_order_id = completed_po.id
  WHERE completed_po.status = 'COMPLETED'
  GROUP BY completed_po.id
  HAVING COUNT(qi.id) = 0
) completed_without_inspection ON completed_without_inspection.id = po.id;

INSERT INTO qaflow_validation_results
SELECT
  'SQL-009',
  'Rechazos sin observaciones',
  'Detecta inspecciones rechazadas sin una explicación documentada.',
  COUNT(*),
  IF(COUNT(*) = 0, 'PASSED', 'FAILED')
FROM quality_inspections
WHERE result = 'REJECTED'
  AND (observations IS NULL OR TRIM(observations) = '');

INSERT INTO qaflow_validation_results
SELECT
  'SQL-010',
  'Auditoría',
  'Confirma eventos de auditoría para las entidades críticas del conjunto de datos.',
  COUNT(*),
  IF(COUNT(*) = 0, 'PASSED', 'FAILED')
FROM (
  SELECT 'PRODUCT' AS entity_type, id AS entity_id FROM products
  UNION ALL
  SELECT 'CUSTOMER_ORDER', id FROM customer_orders
  UNION ALL
  SELECT 'BOM', id FROM boms
  UNION ALL
  SELECT 'PRODUCTION_ORDER', id FROM production_orders
  UNION ALL
  SELECT 'QUALITY_INSPECTION', id FROM quality_inspections
) required_audit
LEFT JOIN audit_log al
  ON al.entity_type = required_audit.entity_type
 AND al.entity_id = required_audit.entity_id
WHERE al.id IS NULL;

SELECT
  validation_id,
  category,
  validation_description,
  anomaly_count,
  validation_status
FROM qaflow_validation_results
ORDER BY validation_id;

SELECT
  COUNT(*) AS total_validations,
  SUM(validation_status = 'PASSED') AS passed_validations,
  SUM(validation_status = 'FAILED') AS failed_validations
FROM qaflow_validation_results;
