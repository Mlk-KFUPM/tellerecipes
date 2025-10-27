import { createContext, useContext, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';
import mockRecipes from '../data/mockRecipes.js';

const AppStateContext = createContext();
const AppDispatchContext = createContext();

const initialState = {
  session: {
    isAuthenticated: true,
  },
  user: {
    id: 'user-001',
    name: 'Amina Baker',
    email: 'amina.baker@example.com',
    avatarUrl: null,
    isEmailVerified: true,
    collections: [
      { id: 'collection-001', name: 'Weeknight Dinners', recipeIds: ['recipe-001'] },
      { id: 'collection-002', name: 'Pasta Favourites', recipeIds: ['recipe-002'] },
    ],
  },
  recipes: mockRecipes,
  shoppingList: {
    recipeIds: ['recipe-003'],
  },
};

const calculateAverageRating = (reviews) => {
  if (!reviews.length) {
    return { average: 0, count: 0 };
  }
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return { average: Number((total / reviews.length).toFixed(1)), count: reviews.length };
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_PROFILE': {
      return {
        ...state,
        user: {
          ...state.user,
          name: action.payload.name,
          email: action.payload.email,
        },
      };
    }
    case 'UPDATE_PASSWORD': {
      return state;
    }
    case 'SAVE_RECIPE_TO_COLLECTIONS': {
      const { recipeId, collectionIds } = action.payload;
      const updatedCollections = state.user.collections.map((collection) => {
        const hasRecipe = collection.recipeIds.includes(recipeId);
        if (collectionIds.includes(collection.id) && !hasRecipe) {
          return { ...collection, recipeIds: [...collection.recipeIds, recipeId] };
        }
        if (!collectionIds.includes(collection.id) && hasRecipe) {
          return {
            ...collection,
            recipeIds: collection.recipeIds.filter((id) => id !== recipeId),
          };
        }
        return collection;
      });
      return {
        ...state,
        user: { ...state.user, collections: updatedCollections },
      };
    }
    case 'CREATE_COLLECTION': {
      const { id, name, recipeIds = [] } = action.payload;
      return {
        ...state,
        user: {
          ...state.user,
          collections: [...state.user.collections, { id, name, recipeIds }],
        },
      };
    }
    case 'ADD_RECIPE_TO_SHOPPING_LIST': {
      if (state.shoppingList.recipeIds.includes(action.payload.recipeId)) {
        return state;
      }
      return {
        ...state,
        shoppingList: {
          ...state.shoppingList,
          recipeIds: [...state.shoppingList.recipeIds, action.payload.recipeId],
        },
      };
    }
    case 'REMOVE_RECIPE_FROM_SHOPPING_LIST': {
      return {
        ...state,
        shoppingList: {
          ...state.shoppingList,
          recipeIds: state.shoppingList.recipeIds.filter((id) => id !== action.payload.recipeId),
        },
      };
    }
    case 'CLEAR_SHOPPING_LIST': {
      return {
        ...state,
        shoppingList: {
          ...state.shoppingList,
          recipeIds: [],
        },
      };
    }
    case 'ADD_REVIEW': {
      const { recipeId, review } = action.payload;
      const updatedRecipes = state.recipes.map((recipe) => {
        if (recipe.id !== recipeId) {
          return recipe;
        }
        const reviews = [...recipe.reviews, review];
        return { ...recipe, reviews };
      });
      return {
        ...state,
        recipes: updatedRecipes,
      };
    }
    default:
      return state;
  }
};

export const AppStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const memoizedState = useMemo(() => ({
    ...state,
    recipeSummaries: state.recipes.map((recipe) => ({
      ...recipe,
      rating: calculateAverageRating(recipe.reviews),
    })),
  }), [state]);

  return (
    <AppStateContext.Provider value={memoizedState}>
      <AppDispatchContext.Provider value={dispatch}>{children}</AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
};

AppStateProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

export const useAppDispatch = () => {
  const context = useContext(AppDispatchContext);
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within an AppStateProvider');
  }
  return context;
};

export const selectRecipeById = (state, id) => state.recipeSummaries.find((recipe) => recipe.id === id);

export const selectCollections = (state) => state.user.collections;

export const selectShoppingListDetails = (state) => {
  const recipes = state.shoppingList.recipeIds
    .map((id) => state.recipeSummaries.find((recipe) => recipe.id === id))
    .filter(Boolean);

  const consolidatedMap = new Map();

  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((ingredient) => {
      const key = ingredient.name.toLowerCase();
      const existing = consolidatedMap.get(key);
      if (existing) {
        consolidatedMap.set(key, {
          ...existing,
          quantity: existing.quantity + ingredient.quantity,
        });
      } else {
        consolidatedMap.set(key, { ...ingredient });
      }
    });
  });

  return {
    recipes,
    consolidated: Array.from(consolidatedMap.values()),
  };
};

export const selectFilters = (state) => {
  const cuisines = new Set();
  const dietary = new Set();
  state.recipes.forEach((recipe) => {
    cuisines.add(recipe.cuisine);
    recipe.dietary.forEach((tag) => dietary.add(tag));
  });
  return {
    cuisines: Array.from(cuisines),
    dietary: Array.from(dietary),
  };
};

export default AppStateProvider;
