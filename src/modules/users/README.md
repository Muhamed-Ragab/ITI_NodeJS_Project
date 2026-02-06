# User Module

This module manages all user profile-related operations, including retrieving, updating personal information, and managing embedded data like addresses, wishlists, and carts.

## Purpose
- **Profile Management:** Allow users to manage their personal data.
- **Embedded Data:** Provide APIs to interact with user-specific embedded documents (addresses, cart, wishlist) as defined in the ERD.

## Key Functionalities
-   Retrieve User Profile
-   Update User Profile (name, etc.)
-   Manage User Addresses (add, update, remove)
-   Manage User Wishlist (add, remove product)
-   Manage User Cart (add, remove, update quantity)
-   Role Management (Admin APIs to modify user roles)

## Expected API Endpoints
-   `GET /api/users/profile`
-   `PUT /api/users/profile`
-   `POST /api/users/address`
-   `PUT /api/users/address/:addressId`
-   `DELETE /api/users/address/:addressId`
-   `GET /api/users/wishlist`
-   `POST /api/users/wishlist/:productId`
-   `DELETE /api/users/wishlist/:productId`
-   `GET /api/users/cart`
-   `POST /api/users/cart` (add/update item)
-   `DELETE /api/users/cart/:productId`