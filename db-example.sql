DROP DATABASE IF EXISTS example;

CREATE DATABASE example;

USE example;

CREATE TABLE products(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    ean VARCHAR(255),
    price DECIMAL(20,2),
    created_at DATE NOT NULL
);

INSERT INTO products(name, ean, price, created_at)
VALUES
('iPhone', '74748484', 999.99, '2023-01-01'),
('Samsung', '9393983', 1099.99, '2023-02-02'),
('Xiaomi', '35333653', 899.99, '2023-03-03'),
('Samsung', '5394983', 1199.99, '2023-04-04'),
('Xiaomi', '65322653', 799.99, '2023-05-05'),
('Nokia', NULL, 950.99, '2023-06-06');