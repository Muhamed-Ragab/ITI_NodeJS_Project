# Order Module

This module manages the entire lifecycle of customer orders, from creation to status updates.

## Purpose
- **Transaction Management:** Handle the process of converting a user's cart into a confirmed order.
- **Order Tracking:** Provide mechanisms for customers to track their orders and for admins/sellers to manage order fulfillment.
- **Historical Data:** Maintain accurate records of all purchases.

## Key Functionalities
-   Create Order from user's cart (Checkout process)
-   Retrieve Order Details
-   Update Order Status (Admin/Seller only)
-   Retrieve a User's Order History
-   Retrieve all Orders (Admin only)

## Expected API Endpoints
-   `POST /api/orders` (Checkout)
-   `GET /api/orders/:id`
-   `PUT /api/orders/:id/status` (Admin/Seller role required)
-   `GET /api/orders/me` (User's own orders)
-   `GET /api/orders` (Admin role required)