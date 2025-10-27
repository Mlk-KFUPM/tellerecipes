# TellerRecipes Frontend Guide

Welcome to the TellerRecipes front-end workspace. This guide explains how the project is organised and where each team member should add features for their user type.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Visit the URL shown in the terminal (defaults to http://localhost:5173).

## Project Structure

```
src/
├── assets/                  # Static images and illustrations
├── components/
│   ├── auth/                # Shared widgets for sign in/up screens
│   ├── collections/         # Collection cards & modals
│   ├── common/              # Reusable primitives (brand mark, etc.)
│   ├── forms/               # Controlled form inputs (text, password, checkbox)
│   ├── navigation/          # Navigation components (future)
│   ├── recipes/             # Recipe cards, detail panels, search widgets, reviews
│   └── shopping/            # Shopping list summary component
├── context/                 # Global app state (user session, recipes, collections)
├── data/                    # Mock data sources (recipes until API integration)
├── layouts/                 # Page shells (AuthLayout, DashboardLayout)
├── pages/
│   ├── auth/                # Login & register views
│   ├── user/                # Registered User workflow (home, detail, collections, shopping list, profile)
│   ├── chef/                # (to be created) screens for chef role
│   └── admin/               # (to be created) screens for admin role
├── routes/                  # Route guards (ProtectedRoute)
├── theme/                   # MUI theme configuration
├── App.jsx                  # Route map
└── main.jsx                 # App bootstrap (providers, router)
```

## Working by Role

### Registered User (current implementation)
- Pages live under `src/pages/user/`
- Shared user-specific components reside in `src/components/recipes`, `src/components/collections`, and `src/components/shopping`
- App state and mock data live in `src/context/AppStateContext.jsx` and `src/data/mockRecipes.js`

### Chef Experience
- Create Chef-specific pages in `src/pages/chef/` (e.g., `DashboardPage.jsx`, `RecipeEditorPage.jsx`)
- Chef-specific shared components (recipe editor forms, analytics, etc.) can live in a new folder `src/components/chef/`
- Use existing form primitives from `src/components/forms/` when possible
- If chefs require extra context (e.g., list of their recipes), extend `AppStateContext` with the necessary state/actions

### Admin Experience
- Add Admin pages under `src/pages/admin/` (e.g., `UserManagementPage.jsx`, `ContentModerationPage.jsx`)
- Reusable admin widgets should go in `src/components/admin/`
- Hook into the same global context or add new selectors/actions for moderation workflows

## Adding Routes

Declare new role-specific routes in `src/App.jsx` under the protected `/app` tree. Example:

```jsx
<Route element={<ProtectedRoute />}>
  <Route path="/app" element={<DashboardLayout />}>
    <Route path="chef" element={<ChefDashboardPage />} />
    <Route path="admin" element={<AdminOverviewPage />} />
  </Route>
</Route>
```

Consider nested layouts if Chef/Admin need different navigation shells.

## State & Data

- `AppStateContext` manages shared state for the user journey. Extend its reducer and selectors for Chef/Admin features.
- Replace `src/data/mockRecipes.js` with API calls once backend endpoints are ready. Until then, update the mock data to simulate new features.

## Code Style & Testing

- Stick to functional components and hooks
- Use the existing theme tokens defined in `src/theme/index.js`
- Prefer reusing components over duplicating markup; extract shared pieces into the `components/` tree
- Add tests (React Testing Library) alongside new components when feasible

## Pull Requests & Reviews

Before pushing:

1. Run `npm run lint` (add a lint script if needed)
2. Run the dev server and smoke test the new pages
3. Commit only relevant files; ensure `node_modules` and `dist` are ignored

Happy building! Collaborate via shared components and consistent state management so each user role feels cohesive.
