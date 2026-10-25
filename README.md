# EsmiringShop — Product Management App

A React + Vite product catalog and shopping-cart project built to match the PRE-FINAL EXAM requirements.

## Requirements covered

- Four default products with feature image, name, category, price, stock quantity, and computed stock subtotal.
- Category filtering, product search, and sorting.
- Dedicated in-app product detail view with description, specifications, rating, stock, and subtotal.
- Add-to-cart controls and quantity increase/decrease/remove controls, with stock limits.
- Add-product form with image URL, name, category, description, specifications, rating, price, and quantity. All fields are required and numeric values are validated.
- Automatic inventory value and cart subtotal calculations using `reduce`; products render using `map`.
- Low-stock labels when quantity is below 5; out-of-stock products cannot be added to the cart.
- `localStorage` persistence for products and cart across page refreshes.
- Responsive layout for desktop and mobile screens.

## Run the project

1. Install Node.js (LTS) if it is not installed.
2. Open this `EsmiringShop` folder in VS Code.
3. Open Terminal → New Terminal.
4. Run:

   ```bash
   npm install
   npm run dev
   ```

5. Open the local URL printed by Vite (usually `http://localhost:5173`).

To create a production build, run `npm run build`.

## Notes

- Product images use image URLs, so an internet connection is needed to load remote images.
- Checkout is intentionally a demo message; this project does not process payments.
- This is a frontend-only project. Products and cart are saved in the browser's local storage, not in a shared database.
