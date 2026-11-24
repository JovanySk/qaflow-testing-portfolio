-- QAFlow Manufacturing Testing Portfolio
-- Esquema MySQL 8 para validaciones de integridad del portafolio.

CREATE DATABASE IF NOT EXISTS qaflow_portfolio
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE qaflow_portfolio;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL,
  password_hash CHAR(64) NOT NULL,
  role ENUM('ADMIN', 'QA', 'OPERATOR', 'VIEWER') NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  sku VARCHAR(48) NOT NULL,
  name VARCHAR(120) NOT NULL,
  product_type ENUM('RAW_MATERIAL', 'COMPONENT', 'FINISHED_GOOD') NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  current_stock INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_sku (sku),
  CONSTRAINT chk_products_price CHECK (unit_price >= 0),
  CONSTRAINT chk_products_stock CHECK (current_stock >= 0)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS inventory_movements (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  movement_ref VARCHAR(40) NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  movement_type ENUM('ENTRY', 'EXIT') NOT NULL,
  quantity INT NOT NULL,
  stock_before INT NOT NULL,
  stock_after INT NOT NULL,
  notes VARCHAR(300) NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_inventory_movement_ref (movement_ref),
  KEY idx_inventory_product_date (product_id, created_at),
  CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products (id),
  CONSTRAINT fk_inventory_user FOREIGN KEY (created_by) REFERENCES users (id),
  CONSTRAINT chk_inventory_quantity CHECK (quantity > 0),
  CONSTRAINT chk_inventory_stock CHECK (stock_before >= 0 AND stock_after >= 0)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS customer_orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_number VARCHAR(32) NOT NULL,
  customer_name VARCHAR(120) NOT NULL,
  status ENUM('DRAFT', 'CONFIRMED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'DRAFT',
  order_date DATE NOT NULL,
  total_amount DECIMAL(14, 2) NOT NULL DEFAULT 0,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_customer_orders_number (order_number),
  CONSTRAINT fk_customer_orders_user FOREIGN KEY (created_by) REFERENCES users (id),
  CONSTRAINT chk_customer_orders_total CHECK (total_amount >= 0)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS customer_order_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_order_product (order_id, product_id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES customer_orders (id),
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (id),
  CONSTRAINT chk_order_items_quantity CHECK (quantity > 0),
  CONSTRAINT chk_order_items_price CHECK (unit_price >= 0)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS boms (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  bom_code VARCHAR(32) NOT NULL,
  finished_product_id BIGINT UNSIGNED NOT NULL,
  version_number INT NOT NULL,
  status ENUM('DRAFT', 'ACTIVE', 'OBSOLETE') NOT NULL DEFAULT 'DRAFT',
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_boms_code (bom_code),
  UNIQUE KEY uq_boms_product_version (finished_product_id, version_number),
  CONSTRAINT fk_boms_product FOREIGN KEY (finished_product_id) REFERENCES products (id),
  CONSTRAINT fk_boms_user FOREIGN KEY (created_by) REFERENCES users (id),
  CONSTRAINT chk_boms_version CHECK (version_number > 0)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS bom_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  bom_id BIGINT UNSIGNED NOT NULL,
  component_product_id BIGINT UNSIGNED NOT NULL,
  quantity_required DECIMAL(12, 3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_bom_component (bom_id, component_product_id),
  CONSTRAINT fk_bom_items_bom FOREIGN KEY (bom_id) REFERENCES boms (id),
  CONSTRAINT fk_bom_items_product FOREIGN KEY (component_product_id) REFERENCES products (id),
  CONSTRAINT chk_bom_items_quantity CHECK (quantity_required > 0)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS production_orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  production_number VARCHAR(32) NOT NULL,
  customer_order_id BIGINT UNSIGNED NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  bom_id BIGINT UNSIGNED NULL,
  planned_quantity INT NOT NULL,
  completed_quantity INT NOT NULL DEFAULT 0,
  status ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PLANNED',
  started_at DATETIME NULL,
  completed_at DATETIME NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_production_number (production_number),
  CONSTRAINT fk_production_order FOREIGN KEY (customer_order_id) REFERENCES customer_orders (id),
  CONSTRAINT fk_production_product FOREIGN KEY (product_id) REFERENCES products (id),
  CONSTRAINT fk_production_bom FOREIGN KEY (bom_id) REFERENCES boms (id),
  CONSTRAINT fk_production_user FOREIGN KEY (created_by) REFERENCES users (id),
  CONSTRAINT chk_production_planned CHECK (planned_quantity > 0),
  CONSTRAINT chk_production_completed CHECK (completed_quantity >= 0 AND completed_quantity <= planned_quantity)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS quality_inspections (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  inspection_number VARCHAR(32) NOT NULL,
  production_order_id BIGINT UNSIGNED NOT NULL,
  inspected_quantity INT NOT NULL,
  rejected_quantity INT NOT NULL DEFAULT 0,
  result ENUM('PASSED', 'REJECTED') NOT NULL,
  observations VARCHAR(500) NULL,
  inspected_by BIGINT UNSIGNED NOT NULL,
  inspected_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_inspection_number (inspection_number),
  CONSTRAINT fk_quality_production FOREIGN KEY (production_order_id) REFERENCES production_orders (id),
  CONSTRAINT fk_quality_user FOREIGN KEY (inspected_by) REFERENCES users (id),
  CONSTRAINT chk_quality_inspected CHECK (inspected_quantity > 0),
  CONSTRAINT chk_quality_rejected CHECK (rejected_quantity >= 0 AND rejected_quantity <= inspected_quantity)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL,
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(40) NOT NULL,
  entity_id BIGINT UNSIGNED NULL,
  details JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_entity (entity_type, entity_id),
  KEY idx_audit_created_at (created_at),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE = InnoDB;
