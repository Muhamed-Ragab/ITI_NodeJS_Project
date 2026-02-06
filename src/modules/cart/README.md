# Cart Module

This module handles operations related to the user's shopping cart, which is now embedded directly within the User document.

## Purpose
- **Temporary Storage:** Provide a way for users to collect items before checkout.
- **Quantity Management:** Allow users to adjust the quantity of items in their cart.
- **Integration with User Profile:** Seamlessly manage cart contents as part of the user's persistent profile.

## Key Functionalities
-   Add an item to the user's embedded cart.
-   Update the quantity of an item in the cart.
-   Remove an item from the cart.
-   Retrieve the current contents of the user's cart.

## Expected API Endpoints (Refer to User Module for actual implementation)
*Note: Since the cart is embedded in the User document, its APIs are often managed within the User Module to maintain a single source of truth for user-related data manipulation. This `README.md` is for conceptual clarity.*

-   `POST /api/users/cart` (Add/Update item in cart)
-   `DELETE /api/users/cart/:productId` (Remove item from cart)
-   `GET /api/users/cart` (Retrieve cart contents)