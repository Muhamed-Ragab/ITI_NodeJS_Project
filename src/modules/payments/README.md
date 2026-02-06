# Payment Module

This module integrates with the Stripe API to handle payment processing for orders.

## Purpose
- **Secure Transactions:** Facilitate secure credit card payments using a reputable payment gateway.
- **Order Finalization:** Mark orders as paid upon successful transaction.
- **Webhook Handling:** Process asynchronous payment notifications from Stripe.

## Key Functionalities
-   Create a payment intent for an order (Stripe API).
-   Handle Stripe webhooks for payment success/failure.
-   Update order status based on payment outcomes.

## Expected API Endpoints
-   `POST /api/payments/create-payment-intent`
-   `POST /api/payments/webhook` (Stripe webhook endpoint)