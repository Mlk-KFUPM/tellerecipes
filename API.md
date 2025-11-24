# TellerRecipes API Contract (draft)

Base URL: `/api`

Auth uses HTTP-only cookies for refresh tokens and Bearer access tokens. All protected endpoints require a valid access token; admin- and chef-only endpoints additionally enforce role checks.

## Auth
- `POST /auth/register` — Create a user account. Body: `{ fullName, email, password }`. Returns user summary + access token.
- `POST /auth/login` — Sign in with email/password. Body: `{ email, password }`. Returns tokens and role.
- `POST /auth/logout` — Revoke current refresh session.
- `POST /auth/refresh` — Rotate access/refresh tokens.
- `POST /auth/verify-email` — Verify email using one-time code/token. Body: `{ token }`.
- `POST /auth/resend-verification` — Resend verification email.
- `POST /auth/forgot-password` — Send reset email. Body: `{ email }`.
- `POST /auth/reset-password` — Reset with one-time token. Body: `{ token, newPassword }`.

## User (diner experience)
- `GET /user/profile` — Get current user profile.
- `PATCH /user/profile` — Update name/email/avatar.
- `PATCH /user/password` — Change password (requires current password).
- `GET /recipes` — List recipes with filters: `search`, `cuisine`, `dietary[]`, `page`, `limit`, `sort`.
- `GET /recipes/:id` — Recipe detail (includes ingredients, steps, reviews summary).
- `POST /recipes/:id/save` — Toggle save to collections (optional `collectionIds` in body).
- `GET /collections` — List user collections and their recipe ids.
- `POST /collections` — Create collection. Body: `{ name, description?, visibility? }`.
- `PATCH /collections/:id` — Rename/update collection, add/remove recipes.
- `DELETE /collections/:id` — Delete a collection.
- `GET /shopping-list` — Fetch shopping list (recipes + consolidated items).
- `POST /shopping-list` — Generate/update shopping list from recipeIds. Body: `{ recipeIds }`.
- `DELETE /shopping-list` — Clear shopping list.
- `DELETE /shopping-list/recipes/:id` — Remove one recipe from the list.
- `POST /recipes/:id/reviews` — Add a review. Body: `{ rating, comment }`.
- `GET /recipes/:id/reviews` — List reviews for the recipe (paginated).

## Chef (approved chefs)
- `GET /chef/profile` — Get chef profile and status.
- `POST /chef/apply` — Submit chef application. Body: `{ fullName, email, displayName, bio, specialties[], yearsExperience, signatureDish, phone?, website? }`.
- `PATCH /chef/profile` — Update approved/pending profile fields.
- `GET /chef/recipes` — List chef-owned recipes with status filters.
- `POST /chef/recipes` — Create recipe (draft/pending). Body includes title, description, cuisine, dietary[], categories[], prepTime, cookTime, servings, image, gallery[], ingredients[], steps[].
- `PATCH /chef/recipes/:id` — Update recipe; major changes set status back to pending.
- `DELETE /chef/recipes/:id` — Remove own recipe (soft delete/archived).
- `POST /chef/recipes/:id/replies` — Reply to a review. Body: `{ reviewId, comment }`.
- `GET /chef/analytics` — Engagement stats (views, saves, ratings) per recipe.

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
- `PATCH /admin/users/:id/status` — Activate/deactivate user.
- `PATCH /admin/users/:id/role` — Promote/demote (e.g., to/from Chef).
- `DELETE /admin/users/:id` — Delete user (blocked for self/admin safety).

## Notes derived from frontend
- Frontend uses filters for cuisines/dietary/categories; provide them via `/admin/categories` (for admins) and `/recipes` filter metadata for diners.
- Chef flow: apply -> pending -> approved; approved chefs can create/update recipes; major updates trigger re-review.
- Admin panels cover recipe moderation, flagged content (recipes/reviews), user management, and taxonomy configuration.
- Shopping list aggregates ingredients across selected recipes; keep endpoints idempotent for regenerating lists.
