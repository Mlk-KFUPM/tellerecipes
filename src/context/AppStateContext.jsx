import { createContext, useContext, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';
import mockRecipes from '../data/mockRecipes.js';

const AppStateContext = createContext();
const AppDispatchContext = createContext();

const generateId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const chefProfileSeed = {
  id: 'chef-001',
  name: 'Amina Baker',
  email: 'amina.baker@example.com',
  displayName: 'Chef Amina',
  avatarUrl: null,
  status: 'approved',
  bio: 'North African-inspired chef sharing soulful, spice-forward recipes for busy home cooks.',
  specialties: ['Moroccan', 'Mediterranean', 'Vegetarian Comfort'],
  yearsExperience: 9,
  phone: '',
  website: 'https://chefamina.example.com',
  signatureDish: 'Preserved Lemon & Chickpea Tagine',
  termsAcceptedAt: '2024-01-20T10:00:00Z',
  submittedAt: '2024-01-20T10:00:00Z',
  approvedAt: '2024-01-25T14:30:00Z',
};

const chefRecipesSeed = [
  {
    id: 'recipe-chef-001',
    chefId: chefProfileSeed.id,
    title: 'Harissa Roasted Cauliflower Steaks',
    description: 'Charred cauliflower with bright herb yogurt and a crunchy almond-date crumble.',
    cuisine: 'Mediterranean',
    dietary: ['Vegetarian', 'Gluten Free'],
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    status: 'approved',
    categories: ['Dinner', 'Vegetables'],
    image: 'https://images.unsplash.com/photo-1543352634-873f17a7a088?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512058564366-c9e3e0464b1d?auto=format&fit=crop&w=1000&q=80',
    ],
    ingredients: [
      {
        id: 'ing-chef-001',
        name: 'Cauliflower heads',
        quantity: 2,
        unit: 'medium',
        alternatives: ['Romanesco'],
      },
      {
        id: 'ing-chef-002',
        name: 'Harissa paste',
        quantity: 3,
        unit: 'tbsp',
        alternatives: ['Calabrian chili paste'],
      },
      {
        id: 'ing-chef-003',
        name: 'Greek yogurt',
        quantity: 1,
        unit: 'cup',
        alternatives: ['Coconut yogurt'],
      },
      {
        id: 'ing-chef-004',
        name: 'Fresh mint',
        quantity: 0.25,
        unit: 'cup',
        alternatives: ['Cilantro'],
      },
      {
        id: 'ing-chef-005',
        name: 'Toasted almonds',
        quantity: 0.5,
        unit: 'cup',
        alternatives: ['Hazelnuts', 'Pumpkin seeds'],
      },
    ],
    steps: [
      'Heat oven to 425°F (220°C). Slice cauliflower into 1-inch steaks.',
      'Whisk harissa with olive oil and brush over steaks; season generously with salt.',
      'Roast on a sheet pan, flipping once, until deeply caramelized.',
      'Stir yogurt with lemon zest and minced mint; set aside.',
      'Pulse almonds, dates, and mint into a coarse crumble. Serve cauliflower with yogurt and crumble.',
    ],
    reviews: [
      {
        id: 'review-chef-001',
        author: 'Michael T.',
        rating: 5,
        comment: 'The textures are incredible. That crunchy topping is genius!',
        createdAt: '2024-02-12T12:10:00Z',
        replies: [
          {
            id: 'reply-chef-001',
            author: chefProfileSeed.displayName,
            comment: 'Thanks Michael! Try swapping in pistachios for an extra vibrant crunch.',
            createdAt: '2024-02-13T08:45:00Z',
          },
        ],
      },
    ],
    createdAt: '2024-01-28T09:00:00Z',
    updatedAt: '2024-02-13T08:45:00Z',
  },
  {
    id: 'recipe-chef-002',
    chefId: chefProfileSeed.id,
    title: 'Preserved Lemon Chickpea Tagine',
    description: 'Slow-simmered chickpeas with caramelized onions, saffron broth, and briny preserved lemons.',
    cuisine: 'Moroccan',
    dietary: ['Vegan', 'High Protein'],
    prepTime: 20,
    cookTime: 45,
    servings: 6,
    status: 'pending',
    categories: ['Dinner', 'One Pot'],
    image: 'https://images.unsplash.com/photo-1604908177113-1f0b9ddf871e?auto=format&fit=crop&w=1200&q=80',
    gallery: [],
    ingredients: [
      {
        id: 'ing-chef-006',
        name: 'Cooked chickpeas',
        quantity: 4,
        unit: 'cups',
        alternatives: ['Cannellini beans'],
      },
      {
        id: 'ing-chef-007',
        name: 'Preserved lemons',
        quantity: 2,
        unit: 'pcs',
        alternatives: ['Roasted lemon slices', 'Fresh lemon zest'],
      },
      {
        id: 'ing-chef-008',
        name: 'Saffron threads',
        quantity: 1,
        unit: 'pinch',
        alternatives: ['Turmeric'],
      },
      {
        id: 'ing-chef-009',
        name: 'Ground cumin',
        quantity: 2,
        unit: 'tsp',
        alternatives: ['Ras el hanout'],
      },
      {
        id: 'ing-chef-010',
        name: 'Golden raisins',
        quantity: 0.5,
        unit: 'cup',
        alternatives: ['Dried apricots'],
      },
    ],
    steps: [
      'Sweat onions in olive oil until golden and jammy.',
      'Bloom spices with tomato paste, then add broth, chickpeas, and preserved lemon.',
      'Simmer until sauce thickens and chickpeas are coated.',
      'Fold in herbs and finish with lemon juice before serving over couscous.',
    ],
    reviews: [],
    createdAt: '2024-03-06T11:15:00Z',
    updatedAt: '2024-03-06T11:15:00Z',
  },
];

const chefEngagementSeed = {
  totals: {
    views: 18420,
    saves: 940,
    averageRating: 4.8,
    ratingsCount: 38,
  },
  recipeStats: {
    [chefRecipesSeed[0].id]: {
      views: 12400,
      saves: 620,
      averageRating: 4.9,
      ratingsCount: 28,
      comments: 12,
    },
    [chefRecipesSeed[1].id]: {
      views: 6020,
      saves: 320,
      averageRating: 4.6,
      ratingsCount: 10,
      comments: 3,
    },
  },
};

const emptyChefEngagement = {
  totals: {
    views: 0,
    saves: 0,
    averageRating: 0,
    ratingsCount: 0,
  },
  recipeStats: {},
};

const initialState = {
  session: {
    isAuthenticated: true,
    role: 'chef',
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
  chefProfile: chefProfileSeed,
  chefEngagement: chefEngagementSeed,
  recipes: [...mockRecipes, ...chefRecipesSeed],
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
    case 'SET_SESSION_ROLE': {
      return {
        ...state,
        session: {
          ...state.session,
          role: action.payload,
        },
      };
    }
    case 'SUBMIT_CHEF_APPLICATION': {
      const applicationId = generateId('chef');
      return {
        ...state,
        chefProfile: {
          id: applicationId,
          name: action.payload.fullName,
          email: action.payload.email,
          displayName: action.payload.displayName || action.payload.fullName,
          avatarUrl: null,
          status: 'pending',
          bio: action.payload.bio || '',
          specialties: action.payload.specialties || [],
          yearsExperience: action.payload.yearsExperience || 0,
          phone: action.payload.phone || '',
          website: action.payload.website || '',
          signatureDish: action.payload.signatureDish || '',
          termsAcceptedAt: new Date().toISOString(),
          submittedAt: new Date().toISOString(),
          approvedAt: null,
        },
        chefEngagement: emptyChefEngagement,
        recipes: state.recipes.filter((recipe) => recipe.chefId !== state.chefProfile?.id),
        session: {
          ...state.session,
          role: 'chef',
        },
      };
    }
    case 'UPDATE_CHEF_PROFILE': {
      if (!state.chefProfile) {
        return state;
      }
      return {
        ...state,
        chefProfile: {
          ...state.chefProfile,
          ...action.payload,
          updatedAt: new Date().toISOString(),
        },
      };
    }
    case 'SET_CHEF_PROFILE_STATUS': {
      if (!state.chefProfile) {
        return state;
      }
      return {
        ...state,
        chefProfile: {
          ...state.chefProfile,
          status: action.payload.status,
          approvedAt: action.payload.status === 'approved' ? new Date().toISOString() : state.chefProfile.approvedAt,
        },
      };
    }
    case 'CREATE_CHEF_RECIPE': {
      if (!state.chefProfile) {
        return state;
      }
      const recipeId = generateId('recipe');
      const newRecipe = {
        id: recipeId,
        chefId: state.chefProfile.id,
        title: action.payload.title,
        description: action.payload.description,
        cuisine: action.payload.cuisine || '',
        dietary: action.payload.dietary || [],
        prepTime: action.payload.prepTime || 0,
        cookTime: action.payload.cookTime || 0,
        servings: action.payload.servings || 0,
        status: 'pending',
        categories: action.payload.categories || [],
        image: action.payload.image || '',
        gallery: action.payload.gallery || [],
        ingredients: action.payload.ingredients || [],
        steps: action.payload.steps || [],
        reviews: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const nextRecipeStats = {
        ...(state.chefEngagement?.recipeStats || {}),
        [recipeId]: {
          views: 0,
          saves: 0,
          averageRating: 0,
          ratingsCount: 0,
          comments: 0,
        },
      };

      return {
        ...state,
        recipes: [...state.recipes, newRecipe],
        chefEngagement: {
          totals: state.chefEngagement?.totals || emptyChefEngagement.totals,
          recipeStats: nextRecipeStats,
        },
      };
    }
    case 'UPDATE_CHEF_RECIPE': {
      const { recipeId, changes, changeType = 'minor' } = action.payload;
      const updatedRecipes = state.recipes.map((recipe) => {
        if (recipe.id !== recipeId) {
          return recipe;
        }
        const isMajorChange = changeType === 'major' && recipe.status === 'approved';
        return {
          ...recipe,
          ...changes,
          status: isMajorChange ? 'pending' : recipe.status,
          updatedAt: new Date().toISOString(),
        };
      });
      return {
        ...state,
        recipes: updatedRecipes,
      };
    }
    case 'ADD_REVIEW_REPLY': {
      const { recipeId, reviewId, reply } = action.payload;
      const updatedRecipes = state.recipes.map((recipe) => {
        if (recipe.id !== recipeId) {
          return recipe;
        }
        const reviews = recipe.reviews.map((review) => {
          if (review.id !== reviewId) {
            return review;
          }
          const replies = review.replies ? [...review.replies] : [];
          replies.push({
            id: generateId('reply'),
            author: reply.author,
            comment: reply.comment,
            createdAt: new Date().toISOString(),
          });
          return {
            ...review,
            replies,
          };
        });
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
  const memoizedState = useMemo(() => {
    const recipeSummaries = state.recipes.map((recipe) => ({
      ...recipe,
      rating: calculateAverageRating(recipe.reviews),
    }));
    const chefRecipeSummaries = state.chefProfile
      ? recipeSummaries.filter((recipe) => recipe.chefId === state.chefProfile.id)
      : [];

    return {
      ...state,
      recipeSummaries,
      chefRecipeSummaries,
    };
  }, [state]);

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

export const selectChefProfile = (state) => state.chefProfile;

export const selectChefRecipes = (state) => state.chefRecipeSummaries;

export const selectChefEngagement = (state) => state.chefEngagement;

export default AppStateProvider;
