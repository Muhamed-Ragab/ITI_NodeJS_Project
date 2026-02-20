# Product Module

This module manages all product-related operations, including creation, retrieval, updates, and deletions. It also handles product search and filtering functionalities.

## Purpose
- **Product Catalog:** Maintain the full inventory of products available in the e-commerce store.
- **Seller Management:** Allow sellers to manage their own product listings.
- **Discovery:** Enable users to search, filter, and browse products efficiently.

## Key Functionalities
-   Create Product (Seller only)
-   Retrieve Product Details
-   Update Product (Seller only)
-   Delete Product (Seller only)
-   Update/Delete any product (Admin only)
-   Search Products by keywords
-   Filter Products by category, price range, etc.
-   Manage product images via Cloudinary

## Expected API Endpoints
-   `POST /api/products` (Seller role required)
-   `GET /api/products/:id`
-   `PUT /api/products/:id` (Seller role required)
-   `DELETE /api/products/:id` (Seller role required)
-   `PUT /api/products/admin/:id` (Admin role required)
-   `DELETE /api/products/admin/:id` (Admin role required)
-   `GET /api/products` (Search and Filter)
-   `POST /api/products/:id/images/upload` (for Cloudinary upload)