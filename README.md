# TellerRecipes Frontend

Vite + React implementation of the TellerRecipes prototype. This project simulates three personas (registered user, chef, admin) sharing a common mock data layer so workflows can be exercised without a backend.

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (running locally on default port 27017)

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (optional, defaults provided for dev):
   ```env
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/tellerecipes
   ACCESS_TOKEN_SECRET=dev-access-secret
   REFRESH_TOKEN_SECRET=dev-refresh-secret
   ```
4. Seed the database with initial data:
   ```bash
   npm run seed
   ```
   This creates default users (`admin`, `chef1`, `user1` - all password `password123`), recipes, and categories.

5. Start the server:
   ```bash
   node server.js
   ```

### Frontend Setup

1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Workflow & Usage Guide

The app supports three distinct roles. You can log in with the seeded accounts:

- **User**: `user@example.com` / `password123`
- **Chef**: `chef@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`

### 1. Register & Explore as a User

1. Visit `/auth/register` to create a new account.
2. You are redirected to the user workspace (`/app/user`) where you can:
   - Filter recipes by text, cuisine, or dietary tags.
   - Open recipe details to review ingredients/instructions.
   - Save recipes into collections or add them to the shopping list.
   - Leave a review on approved recipes.

### 2. Apply & Work as a Chef

1. Log in as a user and click **Apply to become a chef**.
2. Fill out the application. This sets your status to "pending".
3. An admin must approve your application.
4. Once approved, access the Chef Dashboard (`/app/chef`) to:
   - Create and manage recipes.
   - View analytics and reply to reviews.

### 3. Moderate & Configure as an Admin

1. Log in as an admin.
2. Access the Admin Dashboard (`/app/admin`) to:
   - Manage categories and taxonomies.
   - Moderate pending recipes (approve/reject).
   - Manage users (approve chef applications).
   - Handle flagged content.

### 4. End-to-End Flow Example

1. Register as “Jordan Lee” (`/auth/register`).
2. Apply as a chef using Jordan’s account.
3. Sign in as Admin, open **User Management**, and note Jordan listed with status “Pending”.
4. Visit **Recipe Moderation**: Jordan’s newly created recipes appear under pending submissions. Approve/reject as desired.
5. Sign back in as Jordan (role: Chef) to confirm recipe statuses and real-time engagement metrics update accordingly.

## Project Structure

```
client/           # Frontend (Vite + React)
  src/
    components/   # Shared UI primitives
    context/      # AuthContext & ThemeContext
    pages/        # Route-level components
    api/          # Axios client & endpoints

server/           # Backend (Express + MongoDB)
  models/         # Mongoose schemas
  routes/         # API endpoints
  middleware/     # Auth & validation
  seeder.js       # Database population script
```

## API Documentation

See [API.md](./API.md) for detailed endpoint documentation.

## Additional Notes

- All data is ephemeral. Refreshing the browser resets to the seeded defaults.
- Image uploads are mocked via URL fields; there is no file storage.
- Authentication is role-based only—use the login selector to switch personas; no actual credential check is performed.
