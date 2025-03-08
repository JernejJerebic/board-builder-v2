
-- Create tables for the application

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    companyName VARCHAR(200),
    vatId VARCHAR(50),
    email VARCHAR(100),
    phone VARCHAR(50),
    street VARCHAR(200) NOT NULL,
    city VARCHAR(100) NOT NULL,
    zipCode VARCHAR(20) NOT NULL,
    lastPurchase DATE,
    totalPurchases DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Colors table
CREATE TABLE IF NOT EXISTS colors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    htmlColor VARCHAR(20),
    imageUrl VARCHAR(255),
    thickness INT NOT NULL,
    priceWithoutVat DECIMAL(10, 2) NOT NULL,
    priceWithVat DECIMAL(10, 2) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customerId INT NOT NULL,
    orderDate DATE NOT NULL,
    totalCostWithoutVat DECIMAL(10, 2) NOT NULL,
    totalCostWithVat DECIMAL(10, 2) NOT NULL,
    shippingMethod ENUM('pickup', 'delivery') NOT NULL,
    paymentMethod ENUM('credit_card', 'payment_on_delivery', 'pickup_at_shop', 'bank_transfer') NOT NULL,
    status ENUM('placed', 'in_progress', 'completed') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customerId) REFERENCES customers(id)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orderId INT NOT NULL,
    colorId INT NOT NULL,
    length INT NOT NULL,
    width INT NOT NULL,
    thickness INT NOT NULL,
    surfaceArea DECIMAL(10, 4) NOT NULL,
    borderTop BOOLEAN DEFAULT FALSE,
    borderRight BOOLEAN DEFAULT FALSE,
    borderBottom BOOLEAN DEFAULT FALSE,
    borderLeft BOOLEAN DEFAULT FALSE,
    drilling BOOLEAN DEFAULT FALSE,
    quantity INT NOT NULL,
    pricePerUnit DECIMAL(10, 2) NOT NULL,
    totalPrice DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (colorId) REFERENCES colors(id)
);

-- Insert sample data for colors
INSERT INTO colors (title, htmlColor, thickness, priceWithoutVat, priceWithVat, active) VALUES
('Oak Natural', '#d2b48c', 18, 45.00, 54.90, TRUE),
('Walnut Dark', '#614126', 25, 65.00, 79.30, TRUE),
('Pine Light', '#e8d0a9', 18, 35.00, 42.70, TRUE),
('Mahogany Red', '#c04000', 25, 75.00, 91.50, TRUE),
('Maple White', '#f5deb3', 18, 50.00, 61.00, FALSE);
