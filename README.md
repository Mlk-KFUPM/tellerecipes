# TellerRecipes Frontend

Vite + React implementation of the TellerRecipes prototype. This project simulates three personas (registered user, chef, admin) sharing a common mock data layer so workflows can be exercised without a backend.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```
4. Preview the production build:
   ```bash
   npm run preview
   ```

> The dev server uses hot module reloading, so any change made inside `src/` is reflected immediately.

## Workflow & Usage Guide

The app assumes a single browser session that can impersonate different roles. Use the “Sign in as” selector on the login page to jump between personas while keeping the shared mock state intact.

### 1. Register & Explore as a User

1. Visit `/auth/register`, enter a name/email/password, and submit.
2. You are redirected to the user workspace (`/app/user`) where you can:
   - Filter recipes by text, cuisine, or dietary tags.
   - Open recipe details (`/app/user/recipes/:id`) to review ingredients/instructions.
   - Save recipes into collections or add them to the shopping list.
   - Leave a review (one per recipe in this mock build).
3. Navigate to “Collections,” “Shopping List,” or “Profile” via the sidebar to test those flows. Shopping list actions aggregate ingredients, export to clipboard, and offer a print view.

> The registration step also inserts the account into the admin user list so admins can later promote it to a chef if needed.

### 2. Apply & Work as a Chef

1. From any auth screen, click **Apply to become a chef** or go directly to `/auth/become-chef`.
2. Fill out the chef application form. Submission:
   - Creates a pending chef profile tied to your user ID.
   - Switches your session to the chef workspace (`/app/chef`).
   - Adds your account to the admin “User Management” table with role “Chef” and status “Pending.”
3. Explore chef routes:
   - **Overview**: shows quick stats and latest review.
   - **Profile**: edit your public chef bio.
   - **Recipes**: create or edit recipes. Any edit automatically moves the recipe back into “Pending” so it must be re-approved by an admin.
   - **Reviews**: reply to diner feedback.
   - **Analytics**: engagement data recalculates from actual reviews, collections, and shopping list usage (no manual editing required).

### 3. Moderate & Configure as an Admin

1. Sign out and log back in as `Admin` (role selector on the login page uses mock credentials).
2. Admin workspace features:
   - **Dashboard** (`/app/admin`): platform KPIs, date-range selector, top cuisines, and “most discussed” recipes.
   - **Categories**: manage categories/cuisines/dietary tags. Add, rename, or delete entries; enforcement ensures names are unique.
   - **Recipe Moderation**: review pending submissions, view full details, approve/reject with notes, and remove published recipes with confirmation.
   - **Flagged Content**: inspect reports with context snippets, dismiss or remove the offending content, and review a session action log.
   - **User Management**: search/filter users, view account details, promote/demote chef roles, deactivate/reactivate, or delete accounts (cannot delete the signed-in admin).

### 4. End-to-End Flow Example

1. Register as “Jordan Lee” (`/auth/register`).
2. Apply as a chef using Jordan’s account.
3. Sign in as Admin, open **User Management**, and note Jordan listed with status “Pending”.
4. Visit **Recipe Moderation**: Jordan’s newly created recipes appear under pending submissions. Approve/reject as desired.
5. Sign back in as Jordan (role: Chef) to confirm recipe statuses and real-time engagement metrics update accordingly.

## Project Structure

```
src/
  components/     # Shared UI primitives (recipes, forms, chef widgets, etc.)
  context/        # AppStateContext that holds mock data + reducer
  data/           # mockRecipes + admin mock data seeds
  pages/          # Route-level components, grouped by role
  layouts/        # Auth and dashboard shells
  routes/         # Protected and role-based route wrappers
  theme/          # MUI theme definition
```

The reducer in `src/context/AppStateContext.jsx` is the single source of truth. Actions mutate mock state to simulate API calls (e.g., adding reviews, submitting chef applications, admin moderation decisions).

## Additional Notes

- All data is ephemeral. Refreshing the browser resets to the seeded defaults.
- Image uploads are mocked via URL fields; there is no file storage.
- Authentication is role-based only—use the login selector to switch personas; no actual credential check is performed.
