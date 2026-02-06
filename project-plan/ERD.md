# Entity Relationship Diagram (ERD) - Simplified

This document outlines the **simplified** MongoDB collections. We utilize MongoDB's embedding capabilities to reduce the number of collections.

```mermaid
erDiagram
    USERS ||--o{ ORDERS : places
    USERS ||--o{ REVIEWS : writes
    USERS ||--o{ PRODUCTS : sells(if_seller)

    PRODUCTS ||--o{ REVIEWS : receives
    PRODUCTS }|--|| CATEGORIES : belongs_to

    %% COLLECTIONS %%

    USERS {
        ObjectId _id
        string email
        string password_hash
        string google_id "For OAuth"
        string full_name
        string role "customer | seller | admin"
        object[] addresses "Embedded: [{ street, city, zip, country }]"
        object[] cart "Embedded: [{ product_id, quantity }]"
        ObjectId[] wishlist "Embedded: [product_id]"
    }

    PRODUCTS {
        ObjectId _id
        ObjectId seller_id
        ObjectId category_id
        string title
        string description
        float price
        int stock_quantity
        string[] images "Cloudinary URLs"
        float average_rating
        boolean is_active
    }

    CATEGORIES {
        ObjectId _id
        string name
        string slug
        string image_url
    }

    ORDERS {
        ObjectId _id
        ObjectId user_id
        float total_amount
        string status "pending | paid | shipped | delivered | cancelled"
        object shipping_address "Snapshot of user address"
        object[] items "Embedded: [{ product_id, title, price, quantity }]"
        object payment_info "Embedded: { stripe_payment_intent_id, status, method }"
        date created_at
    }

    REVIEWS {
        ObjectId _id
        ObjectId user_id
        ObjectId product_id
        int rating
        string comment
        date created_at
    }
```
