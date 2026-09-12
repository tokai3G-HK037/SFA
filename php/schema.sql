-- SFM (案件管理・見積書・売上仕入データ出力) MySQL スキーマ
-- WebARENA SuiteX 標準データベース(MySQL)向け。phpMyAdmin の「インポート」タブから実行してください。

SET NAMES utf8mb4;

-- ── 案件管理 ─────────────────────────────

CREATE TABLE IF NOT EXISTS projects (
  id                     CHAR(36) NOT NULL PRIMARY KEY,
  customer_name          VARCHAR(200) NOT NULL,
  project_name           VARCHAR(200) NOT NULL,
  assignee               VARCHAR(100) NULL,
  status                 ENUM('ESTIMATING','NEGOTIATING','APPROVAL','ORDERED','LOST','COMPLETED') NOT NULL DEFAULT 'ESTIMATING',
  amount                 DECIMAL(14,2) NOT NULL DEFAULT 0,
  expected_delivery_date DATE NULL,
  notes                  TEXT NULL,
  is_deleted             TINYINT(1) NOT NULL DEFAULT 0,
  end_user_name          VARCHAR(200) NULL,
  end_user_contact_person VARCHAR(100) NULL,
  end_user_address       VARCHAR(300) NULL,
  end_user_contact       VARCHAR(200) NULL,
  created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_projects_customer_name (customer_name),
  INDEX idx_projects_status (status),
  INDEX idx_projects_assignee (assignee),
  INDEX idx_projects_expected_delivery_date (expected_delivery_date),
  INDEX idx_projects_is_deleted (is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS purchase_items (
  id            CHAR(36) NOT NULL PRIMARY KEY,
  project_id    CHAR(36) NOT NULL,
  sort_order    INT NOT NULL DEFAULT 0,
  supplier_name VARCHAR(200) NOT NULL,
  item_name     VARCHAR(200) NOT NULL,
  quantity      DECIMAL(12,2) NOT NULL DEFAULT 1,
  unit          VARCHAR(30) NULL,
  unit_price    DECIMAL(14,2) NOT NULL DEFAULT 0,
  amount        DECIMAL(14,2) NOT NULL DEFAULT 0,
  notes         VARCHAR(1000) NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_purchase_items_project_id (project_id),
  CONSTRAINT fk_purchase_items_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 見積書 ─────────────────────────────

CREATE TABLE IF NOT EXISTS company_profile (
  id           VARCHAR(20) NOT NULL PRIMARY KEY,
  company_name VARCHAR(200) NOT NULL DEFAULT '',
  postal_code  VARCHAR(20) NULL,
  address      VARCHAR(300) NULL,
  phone        VARCHAR(50) NULL,
  contact_name VARCHAR(100) NULL,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO company_profile (id, company_name) VALUES ('default', '')
  ON DUPLICATE KEY UPDATE id = id;

CREATE TABLE IF NOT EXISTS estimates (
  id              CHAR(36) NOT NULL PRIMARY KEY,
  project_id      CHAR(36) NOT NULL,
  estimate_number VARCHAR(50) NOT NULL UNIQUE,
  title           VARCHAR(200) NOT NULL,
  addressee       VARCHAR(200) NOT NULL,
  issuer_name     VARCHAR(200) NOT NULL,
  issuer_address  VARCHAR(300) NULL,
  issuer_contact  VARCHAR(200) NULL,
  issue_date      DATE NOT NULL,
  valid_until     DATE NULL,
  tax_rate        DECIMAL(5,2) NOT NULL DEFAULT 10,
  tax_type        ENUM('EXCLUSIVE','INCLUSIVE') NOT NULL DEFAULT 'EXCLUSIVE',
  subtotal        DECIMAL(14,2) NOT NULL DEFAULT 0,
  tax_amount      DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_amount    DECIMAL(14,2) NOT NULL DEFAULT 0,
  status          ENUM('DRAFT','FINALIZED') NOT NULL DEFAULT 'DRAFT',
  notes           TEXT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_estimates_project_id (project_id),
  INDEX idx_estimates_issue_date (issue_date),
  INDEX idx_estimates_status (status),
  CONSTRAINT fk_estimates_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS estimate_items (
  id          CHAR(36) NOT NULL PRIMARY KEY,
  estimate_id CHAR(36) NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  name        VARCHAR(200) NOT NULL,
  quantity    DECIMAL(12,2) NOT NULL DEFAULT 1,
  unit        VARCHAR(30) NULL,
  unit_price  DECIMAL(14,2) NOT NULL DEFAULT 0,
  amount      DECIMAL(14,2) NOT NULL DEFAULT 0,
  notes       VARCHAR(500) NULL,
  INDEX idx_estimate_items_estimate_id (estimate_id),
  CONSTRAINT fk_estimate_items_estimate FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 売上/仕入データ出力(③着手時に使用。今回はテーブルのみ) ─────────────────────────────

CREATE TABLE IF NOT EXISTS export_templates (
  id             CHAR(36) NOT NULL PRIMARY KEY,
  name           VARCHAR(200) NOT NULL,
  export_type    ENUM('SALES','PURCHASE') NOT NULL,
  file_format    ENUM('CSV','XLSX') NOT NULL DEFAULT 'CSV',
  encoding       ENUM('UTF8','SHIFT_JIS') NOT NULL DEFAULT 'UTF8',
  csv_delimiter  VARCHAR(5) NOT NULL DEFAULT ',',
  has_header_row TINYINT(1) NOT NULL DEFAULT 1,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_export_templates_export_type (export_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS export_template_columns (
  id                  CHAR(36) NOT NULL PRIMARY KEY,
  export_template_id  CHAR(36) NOT NULL,
  column_order        INT NOT NULL DEFAULT 0,
  header_label         VARCHAR(200) NOT NULL,
  source_field         VARCHAR(100) NULL,
  fixed_value          VARCHAR(200) NULL,
  format_type          ENUM('TEXT','DATE','NUMBER') NULL,
  INDEX idx_export_template_columns_template_id (export_template_id),
  CONSTRAINT fk_export_template_columns_template FOREIGN KEY (export_template_id) REFERENCES export_templates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS export_history (
  id                  CHAR(36) NOT NULL PRIMARY KEY,
  export_template_id  CHAR(36) NOT NULL,
  executed_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  period_from          DATE NULL,
  period_to            DATE NULL,
  record_count         INT NOT NULL DEFAULT 0,
  INDEX idx_export_history_template_id (export_template_id),
  CONSTRAINT fk_export_history_template FOREIGN KEY (export_template_id) REFERENCES export_templates(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
