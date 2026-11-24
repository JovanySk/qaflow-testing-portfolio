-- QAFlow Manufacturing Testing Portfolio
-- Datos deterministas e idempotentes para MySQL 8.

USE qaflow_portfolio;

INSERT INTO users (id, username, password_hash, role, active)
VALUES (1, 'qa.sql', SHA2('QaflowDemo#2026', 256), 'QA', TRUE)
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  role = VALUES(role),
  active = VALUES(active);

INSERT INTO products (id, sku, name, product_type, unit_price, current_stock, active)
VALUES
  (1, 'MAT-STEEL-01', 'Lámina de acero', 'RAW_MATERIAL', 185.50, 100, TRUE),
  (2, 'CMP-SCREW-01', 'Tornillo industrial', 'COMPONENT', 2.75, 500, TRUE),
  (3, 'FG-PANEL-01', 'Panel ensamblado', 'FINISHED_GOOD', 899.00, 10, TRUE)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  product_type = VALUES(product_type),
  unit_price = VALUES(unit_price),
  current_stock = VALUES(current_stock),
  active = VALUES(active);

INSERT INTO inventory_movements
  (id, movement_ref, product_id, movement_type, quantity, stock_before, stock_after, notes, created_by, created_at)
VALUES
  (1, 'MOV-STEEL-ENTRY-01', 1, 'ENTRY', 120, 0, 120, 'Carga inicial controlada.', 1, '2026-07-01 08:00:00'),
  (2, 'MOV-STEEL-EXIT-01', 1, 'EXIT', 20, 120, 100, 'Consumo de producción.', 1, '2026-07-02 09:00:00'),
  (3, 'MOV-SCREW-ENTRY-01', 2, 'ENTRY', 550, 0, 550, 'Carga inicial controlada.', 1, '2026-07-01 08:05:00'),
  (4, 'MOV-SCREW-EXIT-01', 2, 'EXIT', 50, 550, 500, 'Consumo de producción.', 1, '2026-07-02 09:05:00'),
  (5, 'MOV-PANEL-ENTRY-01', 3, 'ENTRY', 12, 0, 12, 'Producto terminado recibido.', 1, '2026-07-03 12:00:00'),
  (6, 'MOV-PANEL-EXIT-01', 3, 'EXIT', 2, 12, 10, 'Salida para muestra de calidad.', 1, '2026-07-03 13:00:00')
ON DUPLICATE KEY UPDATE
  product_id = VALUES(product_id),
  movement_type = VALUES(movement_type),
  quantity = VALUES(quantity),
  stock_before = VALUES(stock_before),
  stock_after = VALUES(stock_after),
  notes = VALUES(notes),
  created_by = VALUES(created_by),
  created_at = VALUES(created_at);

INSERT INTO customer_orders
  (id, order_number, customer_name, status, order_date, total_amount, created_by)
VALUES
  (1, 'PED-2026-001', 'Cliente QA Industrial', 'CONFIRMED', '2026-07-04', 8990.00, 1)
ON DUPLICATE KEY UPDATE
  customer_name = VALUES(customer_name),
  status = VALUES(status),
  order_date = VALUES(order_date),
  total_amount = VALUES(total_amount),
  created_by = VALUES(created_by);

INSERT INTO customer_order_items (id, order_id, product_id, quantity, unit_price)
VALUES (1, 1, 3, 10, 899.00)
ON DUPLICATE KEY UPDATE
  order_id = VALUES(order_id),
  product_id = VALUES(product_id),
  quantity = VALUES(quantity),
  unit_price = VALUES(unit_price);

INSERT INTO boms (id, bom_code, finished_product_id, version_number, status, created_by)
VALUES (1, 'BOM-PANEL-01-V1', 3, 1, 'ACTIVE', 1)
ON DUPLICATE KEY UPDATE
  finished_product_id = VALUES(finished_product_id),
  version_number = VALUES(version_number),
  status = VALUES(status),
  created_by = VALUES(created_by);

INSERT INTO bom_items (id, bom_id, component_product_id, quantity_required)
VALUES
  (1, 1, 1, 2.000),
  (2, 1, 2, 8.000)
ON DUPLICATE KEY UPDATE
  bom_id = VALUES(bom_id),
  component_product_id = VALUES(component_product_id),
  quantity_required = VALUES(quantity_required);

INSERT INTO production_orders
  (id, production_number, customer_order_id, product_id, bom_id, planned_quantity, completed_quantity, status, started_at, completed_at, created_by)
VALUES
  (1, 'OP-2026-001', 1, 3, 1, 5, 5, 'COMPLETED', '2026-07-05 07:00:00', '2026-07-05 15:30:00', 1)
ON DUPLICATE KEY UPDATE
  customer_order_id = VALUES(customer_order_id),
  product_id = VALUES(product_id),
  bom_id = VALUES(bom_id),
  planned_quantity = VALUES(planned_quantity),
  completed_quantity = VALUES(completed_quantity),
  status = VALUES(status),
  started_at = VALUES(started_at),
  completed_at = VALUES(completed_at),
  created_by = VALUES(created_by);

INSERT INTO quality_inspections
  (id, inspection_number, production_order_id, inspected_quantity, rejected_quantity, result, observations, inspected_by, inspected_at)
VALUES
  (1, 'IC-2026-001', 1, 5, 0, 'PASSED', 'Lote conforme con los criterios definidos.', 1, '2026-07-05 16:00:00')
ON DUPLICATE KEY UPDATE
  production_order_id = VALUES(production_order_id),
  inspected_quantity = VALUES(inspected_quantity),
  rejected_quantity = VALUES(rejected_quantity),
  result = VALUES(result),
  observations = VALUES(observations),
  inspected_by = VALUES(inspected_by),
  inspected_at = VALUES(inspected_at);

INSERT INTO audit_log (id, user_id, action, entity_type, entity_id, details, created_at)
VALUES
  (1, 1, 'PRODUCT_CREATED', 'PRODUCT', 1, JSON_OBJECT('sku', 'MAT-STEEL-01'), '2026-07-01 07:30:00'),
  (2, 1, 'PRODUCT_CREATED', 'PRODUCT', 2, JSON_OBJECT('sku', 'CMP-SCREW-01'), '2026-07-01 07:31:00'),
  (3, 1, 'PRODUCT_CREATED', 'PRODUCT', 3, JSON_OBJECT('sku', 'FG-PANEL-01'), '2026-07-01 07:32:00'),
  (4, 1, 'INVENTORY_MOVEMENT', 'INVENTORY_MOVEMENT', 1, JSON_OBJECT('reference', 'MOV-STEEL-ENTRY-01'), '2026-07-01 08:00:00'),
  (5, 1, 'ORDER_CREATED', 'CUSTOMER_ORDER', 1, JSON_OBJECT('number', 'PED-2026-001'), '2026-07-04 10:00:00'),
  (6, 1, 'BOM_ACTIVATED', 'BOM', 1, JSON_OBJECT('code', 'BOM-PANEL-01-V1'), '2026-07-04 11:00:00'),
  (7, 1, 'PRODUCTION_COMPLETED', 'PRODUCTION_ORDER', 1, JSON_OBJECT('number', 'OP-2026-001'), '2026-07-05 15:30:00'),
  (8, 1, 'QUALITY_INSPECTION_RECORDED', 'QUALITY_INSPECTION', 1, JSON_OBJECT('number', 'IC-2026-001'), '2026-07-05 16:00:00')
ON DUPLICATE KEY UPDATE
  user_id = VALUES(user_id),
  action = VALUES(action),
  entity_type = VALUES(entity_type),
  entity_id = VALUES(entity_id),
  details = VALUES(details),
  created_at = VALUES(created_at);
