# Reviews Module

This module manages product reviews and ratings.

## Purpose
- Allow customers to leave one review per product.
- Support review read/update/delete with ownership/admin authorization.
- Keep product-level rating aggregates (`average_rating`, `ratings_count`) in sync.

## Key Functionalities
- Create review (authenticated user)
- Get review by ID
- List reviews by product with pagination
- Update review (owner or admin)
- Delete review (owner or admin)
- Recalculate product rating stats after create/update/delete

## Expected API Endpoints
- `POST /api/reviews` (auth required)
- `GET /api/reviews/:id`
- `GET /api/reviews/product/:productId`
- `PUT /api/reviews/:id` (auth required, owner/admin)
- `DELETE /api/reviews/:id` (auth required, owner/admin)
