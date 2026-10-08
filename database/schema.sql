-- =============================================================
-- TradePOS Cloud — Multi-Tenant PostgreSQL Schema Definition
-- Strict Tenant Isolation & Foreign Key References
-- =============================================================

-- 1. Tenants / Businesses
CREATE TABLE businesses (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    currency VARCHAR(10) DEFAULT 'TZS',
    tax_rate NUMERIC(5, 2) DEFAULT 18.00,
    phone VARCHAR(50),
    email VARCHAR(255),
    subscription_plan VARCHAR(50) DEFAULT 'PROFESSIONAL',
    subscription_status VARCHAR(50) DEFAULT 'ACTIVE',
    subscription_expiry DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Branches
CREATE TABLE branches (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    is_main BOOLEAN DEFAULT FALSE,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_branches_tenant ON branches(tenant_id);

-- 3. Users / Employees
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    branch_id VARCHAR(64) REFERENCES branches(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- OWNER, MANAGER, ACCOUNTANT, CASHIER, SUPER_ADMIN
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_tenant ON users(tenant_id);

-- 4. Products & Inventory
CREATE TABLE products (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    branch_id VARCHAR(64) REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    barcode VARCHAR(100),
    category VARCHAR(100),
    brand VARCHAR(100),
    buying_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    wholesale_price NUMERIC(12, 2) DEFAULT 0.00,
    stock_quantity INT NOT NULL DEFAULT 0,
    min_stock INT DEFAULT 5,
    max_stock INT DEFAULT 100,
    unit VARCHAR(20) DEFAULT 'Pcs',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_products_tenant ON products(tenant_id);
CREATE INDEX idx_products_barcode ON products(tenant_id, barcode);

-- 5. Sales & Invoices
CREATE TABLE sales (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    branch_id VARCHAR(64) REFERENCES branches(id) ON DELETE CASCADE,
    sale_number VARCHAR(100) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    tax NUMERIC(12, 2) DEFAULT 0.00,
    discount NUMERIC(12, 2) DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL,
    paid_amount NUMERIC(12, 2) NOT NULL,
    balance NUMERIC(12, 2) DEFAULT 0.00,
    payment_method VARCHAR(50) NOT NULL, -- CASH, MPESA, AIRTEL_MONEY, CARD, CREDIT
    customer_name VARCHAR(255),
    cashier_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'COMPLETED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_sales_tenant ON sales(tenant_id);

-- 6. Sale Items
CREATE TABLE sale_items (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    sale_id VARCHAR(64) NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id),
    quantity INT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    total NUMERIC(12, 2) NOT NULL
);
CREATE INDEX idx_sale_items_tenant ON sale_items(tenant_id, sale_id);

-- 7. Customers & CRM
CREATE TABLE customers (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    total_spent NUMERIC(12, 2) DEFAULT 0.00,
    debt_balance NUMERIC(12, 2) DEFAULT 0.00,
    loyalty_points INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_customers_tenant ON customers(tenant_id);

-- 8. Expenses
CREATE TABLE expenses (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    branch_id VARCHAR(64) REFERENCES branches(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    date DATE NOT NULL,
    recorded_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_expenses_tenant ON expenses(tenant_id);

-- 9. Online Orders & Deliveries
CREATE TABLE online_orders (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    order_number VARCHAR(100) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    delivery_fee NUMERIC(12, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_online_orders_tenant ON online_orders(tenant_id);

-- 10. Audit Logs
CREATE TABLE audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
