
# PHP Backend API for Board Configurator App

This is the PHP backend for the Board Configurator application. It provides RESTful API endpoints for managing customers, colors, and orders.

## Setup Instructions

1. **Database Setup**

   Create a MySQL database named `lcc_aplikacija` with a user `lcc_aplikacija` and password `thisisjustademoapp`.

   ```sql
   CREATE DATABASE lcc_aplikacija;
   CREATE USER 'lcc_aplikacija'@'localhost' IDENTIFIED BY 'thisisjustademoapp';
   GRANT ALL PRIVILEGES ON lcc_aplikacija.* TO 'lcc_aplikacija'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. **Install Files**

   Copy all files from the `api` directory to your web server's document root or a subdirectory.

3. **Initialize Database**

   Run the setup script to create tables and initial data:
   
   ```
   http://localhost/path/to/api/setup/setup.php
   ```

   This will create all necessary tables and insert sample data.

## API Endpoints

### Customers

- `GET /customers/index.php` - Get all customers
- `POST /customers/index.php` - Create a new customer
- `GET /customers/customer.php?id={id}` - Get a customer by ID
- `PUT /customers/customer.php?id={id}` - Update a customer
- `DELETE /customers/customer.php?id={id}` - Delete a customer
- `GET /customers/email.php?email={email}` - Find customer by email

### Colors

- `GET /colors/index.php` - Get all colors
- `POST /colors/index.php` - Create a new color
- `GET /colors/color.php?id={id}` - Get a color by ID
- `PUT /colors/color.php?id={id}` - Update a color
- `DELETE /colors/color.php?id={id}` - Delete a color
- `PUT /colors/status.php?id={id}` - Update color active status

### Orders

- `GET /orders/index.php` - Get all orders with their products
- `POST /orders/index.php` - Create a new order with products
- `GET /orders/order.php?id={id}` - Get an order by ID with its products
- `PUT /orders/order.php?id={id}` - Update an order and its products
- `DELETE /orders/order.php?id={id}` - Delete an order
- `PUT /orders/status.php?id={id}` - Update order status

### Email

- `POST /email/order.php` - Send order-related email notification

## Request & Response Format

All requests and responses use JSON format. For POST and PUT requests, send data as JSON in the request body.

Example request:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com"
}
```

Example response:

```json
{
  "id": "1",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "totalPurchases": 0
}
```

## Error Handling

Errors are returned as JSON objects with an `error` property:

```json
{
  "error": "Customer not found"
}
```

HTTP status codes are used appropriately (200, 201, 400, 404, 405, etc.).
