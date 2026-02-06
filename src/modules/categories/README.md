# Category Module

This module manages the categorization of products within the e-commerce platform.

## Purpose
- **Product Organization:** Structure the product catalog into logical groups.
- **Improved Discoverability:** Enhance user experience by allowing easy navigation and filtering of products.

## Key Functionalities
-   Create Product Categories (Admin only).
-   Retrieve Category Details.
-   Update Category (Admin only).
-   Delete Category (Admin only).
-   Retrieve all Categories.

## Expected API Endpoints
-   `POST /api/categories` (Admin role required)
-   `GET /api/categories/:id`
-   `PUT /api/categories/:id` (Admin role required)
-   `DELETE /api/categories/:id` (Admin role required)
-   `GET /api/categories`