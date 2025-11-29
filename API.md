# TellerRecipes API Contract

Base URL: `/` (e.g. `http://localhost:5001`)

Auth uses HTTP-only cookies for refresh tokens and Bearer access tokens. All protected endpoints require a valid access token; admin- and chef-only endpoints additionally enforce role checks.

## Auth

- `POST /auth/register` — Create a user account. Body: `{ username, email, password }`. Returns user summary + access token.
- `POST /auth/login` — Sign in with email/password. Body: `{ email, password }`. Returns tokens and role.
- `POST /auth/logout` — Revoke refresh session. Body: `{ refreshToken? }` (optional, also clears cookie).

Example: register

Request
```http
POST /auth/register
Content-Type: application/json

{
  "username": "amina",
  "email": "amina@example.com",
  "password": "password123"
}
```

Response
```json
{
  "user": {
    "id": "user-001",
    "username": "amina",
    "email": "amina@example.com",
    "role": "user",
    "status": "active"
  },
  "accessToken": "jwt-access-token"
}
```

## User (diner experience)

- `GET /user/profile` — Get current user profile.
- `PATCH /user/profile` — Update name/email/avatar.
- `PATCH /user/password` — Change password (requires current password).
- `GET /user/recipes` — List approved recipes. Query params:
    - `search`: text search on title/description
    - `cuisine`: filter by cuisine
    - `dietary`: filter by dietary tags (can be array)
    - `page`: page number (default 1)
    - `limit`: items per page (default 20)
    - `sort`: `rating` (highest rated) or default (newest)
- `GET /user/recipes/:id` — Recipe detail (includes ingredients, steps, reviews summary).
- `POST /user/recipes/:id/save` — Toggle save to collections (optional `collectionIds` in body).
- `GET /user/collections` — List user collections and their recipe ids.
- `POST /user/collections` — Create collection. Body: `{ name, description?, visibility? }`.
- `PATCH /user/collections/:id` — Rename/update collection, add/remove recipes.
- `DELETE /user/collections/:id` — Delete a collection.
- `GET /user/shopping-list` — Fetch shopping list (recipes + consolidated items).
- `POST /user/shopping-list` — Generate/update shopping list from recipeIds. Body: `{ recipeIds }`.
- `DELETE /user/shopping-list` — Clear shopping list.
- `DELETE /user/shopping-list/recipes/:id` — Remove one recipe from the list.
- `POST /user/recipes/:id/reviews` — Add a review. Body: `{ rating, comment }`.
- `GET /user/recipes/:id/reviews` — List reviews for the recipe (paginated).

Example: list recipes with filters
```http
GET /user/recipes?search=chicken&cuisine=American&dietary=Gluten%20Free&sort=rating
```

## Chef (approved chefs)

- `GET /chef/profile` — Get chef profile and status.
- `POST /chef/apply` — Submit chef application. Body: `{ fullName, email, displayName, bio, specialties[], yearsExperience, signatureDish, phone?, website? }`.
- `PATCH /chef/profile` — Update approved/pending profile fields.
- `GET /chef/recipes` — List chef-owned recipes with status filters.
- `POST /chef/recipes` — Create recipe. Body includes title, description, cuisine, dietary[], categories[], prepTime, cookTime, servings, image, gallery[], ingredients[], steps[].
    - `categories` can be IDs or new string labels (which will be created as new categories).
- `PATCH /chef/recipes/:id` — Update recipe; major changes set status back to pending.
- `DELETE /chef/recipes/:id` — Remove own recipe (soft delete/archived).
- `POST /chef/recipes/:id/replies` — Reply to a review. Body: `{ reviewId, comment }`.
- `GET /chef/analytics` — Engagement stats (views, saves, ratings) per recipe.

Example: create recipe
```http
POST /chef/recipes
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Harissa Roasted Cauliflower Steaks",
  "description": "Charred cauliflower with herb yogurt...",
  "cuisine": "Mediterranean",
  "dietary": ["Vegetarian", "Gluten Free"],
  "categories": ["Dinner", "Vegetables"],
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "image": "https://...",
  "ingredients": [
    { "name": "Cauliflower heads", "quantity": 2, "unit": "medium" },
    { "name": "Harissa paste", "quantity": 3, "unit": "tbsp" }
  ],
  "steps": [
    { "description": "Heat oven to 425°F.", "order": 1 },
    { "description": "Brush harissa on steaks.", "order": 2 }
  ]
}
```

## Admin

- `GET /admin/dashboard` — Aggregated metrics (recipes, reviews, users, flags, cuisine/dietary counts).
- `GET /admin/categories?type=category|cuisine|dietary` — List taxonomy entries.
- `POST /admin/categories` — Add a category/cuisine/dietary. Body: `{ label, type }`.
- `PATCH /admin/categories/:id` — Rename/update category.
- `DELETE /admin/categories/:id` — Delete category.
- `GET /admin/recipes?status=pending|approved|rejected` — List recipes for moderation.
- `PATCH /admin/recipes/:id/status` — Approve/reject with optional note. Body: `{ status, note? }`.
- `DELETE /admin/recipes/:id` — Remove recipe from catalog.
- `GET /admin/flags` — List flagged items (recipes/reviews/users/chefs).
- `PATCH /admin/flags/:id` — Dismiss or mark handled. Body: `{ status, actionNote? }`.
- `DELETE /admin/flags/:id` — Remove flagged content (and optionally cascade to delete target).
- `GET /admin/users` — List users with filters (`role`, `status`, `search`).
- `PATCH /admin/users/:id/status` — Activate/deactivate user. Activating a chef user automatically approves their chef profile.
- `PATCH /admin/users/:id/role` — Promote/demote (e.g., to/from Chef).
- `DELETE /admin/users/:id` — Delete user (blocked for self/admin safety).

Example: approve recipe
```http
PATCH /admin/recipes/recipe-chef-001/status
Content-Type: application/json
Authorization: Bearer <admin token>

{ "status": "approved", "note": "Looks great." }
```
