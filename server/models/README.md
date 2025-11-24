# TellerRecipes backend model design

This schema targets MongoDB via Mongoose and mirrors the entities used in the React client (recipes, collections, shopping list, chef applications, admin tools, and auth).

## Core entities

- **User (`user.model.js`)**: `fullName`, `username`, `email`, `passwordHash`, `role` (`user|chef|admin`), `status`, `avatarUrl`, `isEmailVerified`, timestamps for login/password/terms. Indexed by email/username/role.
- **ChefProfile (`chefProfile.model.js`)**: one-to-one with `User`; `displayName`, `bio`, `specialties[]`, `yearsExperience`, `signatureDish`, `phone`, `website`, `avatarUrl`, `status` (`pending|approved|rejected`), submission/approval dates and notes. Used for chef applications and dashboards.
- **Category (`category.model.js`)**: curated taxonomy the admin screen edits. Fields: `label`, `slug`, `type` (`category|cuisine|dietary`), `isActive`.
- **Recipe (`recipe.model.js`)**: `owner` (user id), `chefProfile` (nullable), `title`, `description`, `cuisine`, `dietary[]`, `categories[]` (Category refs), `prepTime`, `cookTime`, `servings`, `status` (`draft|pending|approved|rejected|archived`), `image`, `gallery[]`, `ingredients[]` ({ name, quantity, unit, alternatives[] }), `steps[]`, `ratingSummary` ({ average, count }), `engagement` ({ views, saves, shoppingAdds }), submission/approval metadata. Text index on title/description; filtered by status/cuisine/chef.
- **Review (`review.model.js`)**: stored separately from recipes for scale. Fields: `recipe`, `author` (nullable for guests), `displayName`, `rating`, `comment`, `replies[]` ({ author, displayName, comment, createdAt }), `status` (`visible|removed|flagged`), `flaggedReason`. Ordered by createdAt desc index.
- **Collection (`collection.model.js`)**: per-user saved lists; `name`, `description`, `recipeIds[]`, `visibility`, `isDefault`. Unique compound index on user+name to match the client collections UX.
- **ShoppingList (`shoppingList.model.js`)**: one per user; `recipeIds[]`, `consolidatedItems[]` ({ name, quantity, unit, sourceRecipe }), `generatedAt`.
- **Flag (`flag.model.js`)**: moderation queue used by the admin flagged-content UI. Fields: `targetModel` (`Recipe|Review|User|ChefProfile`), `reference`, `title`, `reason`, `snippet`, `reportedBy`, `flaggedAt`, `status` (`open|dismissed|removed`), `handledBy`, `actionNote`.

## Auth models

- **Session (`session.model.js`)**: persisted refresh token sessions; `user`, `refreshTokenHash`, `expiresAt`, optional `revokedAt`, `revokedBy`, `userAgent`, `ipAddress`. Unique hash index prevents reuse and supports logout-all.
- **AuthToken (`authToken.model.js`)**: short-lived one-time tokens for email verification and password resets; `user`, `type` (`verify_email|reset_password`), `tokenHash`, `expiresAt`, `consumedAt`, `ipAddress`, `userAgent`.

## Relations and flows

- User may have one ChefProfile; chef-owned recipes reference both `owner` (User) and `chefProfile` to support admin moderation and chef dashboards.
- Recipes pull display filters from Category docs (`type === cuisine|dietary|category`) to match the admin category management screen.
- Reviews and Flags remain separate collections so moderation actions do not bloat the recipe document.
- Collections and ShoppingList mirror the client state: recipe ids are stored, and consolidated shopping items are derived once a list is generated.
- Admin action log in the client can be derived from moderation or role/status changes persisted via Flag, Recipe status, and User status updates.
