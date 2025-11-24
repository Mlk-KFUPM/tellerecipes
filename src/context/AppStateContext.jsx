import { createContext, useContext, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';
import mockRecipes from '../data/mockRecipes.js';
import { adminUsersSeed, flaggedContentSeed, adminCategoriesSeed } from '../data/mockAdmin.js';

const AppStateContext = createContext();
const AppDispatchContext = createContext();

const generateId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
const normalizeUsername = (email, fallback = 'user') => {
  if (!email) {
    return fallback;
  }
  const candidate = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
  return candidate || fallback;
};

const chefProfileSeed = {
  id: 'chef-001',
  userId: 'user-001',
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
    ownerId: 'user-001',
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
    ownerId: 'user-001',
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

const baseRecipes = [...mockRecipes];

const initialState = {
  session: {
    isAuthenticated: false,
    role: null,
    actorId: null,
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
  chefProfile: null,
  chefEngagement: emptyChefEngagement,
  recipes: baseRecipes,
  shoppingList: {
    recipeIds: ['recipe-003'],
  },
  admin: {
    users: adminUsersSeed,
    flaggedContent: flaggedContentSeed,
    categories: adminCategoriesSeed,
    actionLog: [],
  },
};

const calculateAverageRating = (reviews) => {
  if (!reviews.length) {
    return { average: 0, count: 0 };
  }
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return { average: Number((total / reviews.length).toFixed(1)), count: reviews.length };
};

const buildChefEngagement = (state, recipeSummaries) => {
  if (!state.chefProfile) {
    return emptyChefEngagement;
  }
  const chefRecipes = recipeSummaries.filter((recipe) => recipe.chefId === state.chefProfile.id);
  if (!chefRecipes.length) {
    return emptyChefEngagement;
  }

  const collectionCounts = new Map();
  (state.user?.collections || []).forEach((collection) => {
    collection.recipeIds.forEach((recipeId) => {
      collectionCounts.set(recipeId, (collectionCounts.get(recipeId) ?? 0) + 1);
    });
  });
  const shoppingSet = new Set(state.shoppingList?.recipeIds || []);

  const recipeStats = {};
  let totalViews = 0;
  let totalSaves = 0;
  let totalRatings = 0;
  let ratingSum = 0;

  chefRecipes.forEach((recipe) => {
    const rating = recipe.rating || { average: 0, count: 0 };
    const saves = collectionCounts.get(recipe.id) ?? 0;
    const shoppingBump = shoppingSet.has(recipe.id) ? 8 : 0;
    const views = Math.max(12, rating.count * 18 + saves * 6 + shoppingBump + (recipe.status === 'approved' ? 30 : 15));
    const comments = (recipe.reviews || []).length;
    recipeStats[recipe.id] = {
      views,
      saves,
      averageRating: rating.average,
      ratingsCount: rating.count,
      comments,
    };
    totalViews += views;
    totalSaves += saves;
    totalRatings += rating.count;
    ratingSum += rating.average * rating.count;
  });

  const totals = {
    views: totalViews,
    saves: totalSaves,
    ratingsCount: totalRatings,
    averageRating: totalRatings ? Number((ratingSum / totalRatings).toFixed(1)) : 0,
  };

  return {
    totals,
    recipeStats,
  };
};

const appendAdminLog = (state, message) => ({
  ...state,
  admin: {
    ...state.admin,
    actionLog: [
      {
        id: generateId('log'),
        message,
        timestamp: new Date().toISOString(),
      },
      ...state.admin.actionLog,
    ].slice(0, 25),
  },
});

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SIGN_IN': {
      const { role, actorId } = action.payload;
      const isChef = role === 'chef';
      const hasChefSeeds = state.recipes.some((recipe) => recipe.id === chefRecipesSeed[0].id);
      const nextRecipes = isChef && !hasChefSeeds ? [...state.recipes, ...chefRecipesSeed] : state.recipes;
      const nextActorId = actorId ?? state.user.id;

      return {
        ...state,
        session: {
          isAuthenticated: true,
          role,
          actorId: nextActorId,
        },
        chefProfile: isChef ? state.chefProfile ?? chefProfileSeed : state.chefProfile,
        chefEngagement: isChef ? state.chefEngagement ?? chefEngagementSeed : state.chefEngagement,
        recipes: nextRecipes,
      };
    }
    case 'REGISTER_USER_ACCOUNT': {
      const userId = generateId('user');
      const username = normalizeUsername(action.payload.email, `user-${userId.slice(-4)}`);
      const joinedAt = new Date().toISOString();
      const filteredUsers = state.admin.users.filter(
        (user) => user.email?.toLowerCase() !== action.payload.email?.toLowerCase(),
      );
      const nextAdminUsers = [
        ...filteredUsers,
        {
          id: userId,
          username,
          name: action.payload.fullName,
          role: 'User',
          status: 'Active',
          email: action.payload.email,
          joinedAt,
        },
      ];
      return {
        ...state,
        user: {
          id: userId,
          name: action.payload.fullName,
          email: action.payload.email,
          avatarUrl: null,
          isEmailVerified: false,
          collections: [],
        },
        shoppingList: {
          recipeIds: [],
        },
        admin: {
          ...state.admin,
          users: nextAdminUsers,
        },
        session: {
          ...state.session,
          actorId: userId,
        },
      };
    }
    case 'SIGN_OUT': {
      return {
        ...state,
        session: {
          isAuthenticated: false,
          role: null,
          actorId: null,
        },
        // keep recipes created during the session so other roles can review them
        chefProfile: null,
        chefEngagement: emptyChefEngagement,
      };
    }
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
      return {
        ...state,
        user: {
          ...state.user,
          passwordUpdatedAt: new Date().toISOString(),
        },
      };
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
    case 'SET_RECIPE_STATUS': {
      const { recipeId, status } = action.payload;
      const updatedRecipes = state.recipes.map((recipe) =>
        recipe.id === recipeId ? { ...recipe, status, updatedAt: new Date().toISOString() } : recipe,
      );
      return {
        ...state,
        recipes: updatedRecipes,
      };
    }
    case 'REMOVE_RECIPE': {
      const { recipeId } = action.payload;
      const updatedRecipes = state.recipes.filter((recipe) => recipe.id !== recipeId);
      const updatedCollections = state.user.collections.map((collection) => ({
        ...collection,
        recipeIds: collection.recipeIds.filter((id) => id !== recipeId),
      }));
      const recipeStats = state.chefEngagement?.recipeStats || {};
      const { [recipeId]: _removedStat, ...restStats } = recipeStats;
      const nextState = {
        ...state,
        recipes: updatedRecipes,
        user: {
          ...state.user,
          collections: updatedCollections,
        },
        shoppingList: {
          ...state.shoppingList,
          recipeIds: state.shoppingList.recipeIds.filter((id) => id !== recipeId),
        },
        chefEngagement: state.chefEngagement
          ? {
              ...state.chefEngagement,
              recipeStats: restStats,
            }
          : state.chefEngagement,
      };
      const removedTitle = state.recipes.find((recipe) => recipe.id === recipeId)?.title || recipeId;
      return appendAdminLog(nextState, `Removed recipe “${removedTitle}” from the catalog`);
    }
    case 'SET_SESSION_ROLE': {
      // Preserve compatibility with existing dispatchers while ensuring authentication is on
      return {
        ...state,
        session: {
          isAuthenticated: true,
          role: action.payload,
          actorId: state.session.actorId ?? state.user.id,
        },
      };
    }
    case 'SUBMIT_CHEF_APPLICATION': {
      const applicationId = generateId('chef');
      const actorId = state.session.actorId ?? state.user.id;
      const username = normalizeUsername(action.payload.email, `chef-${applicationId.slice(-4)}`);
      const existingIndex = state.admin.users.findIndex((user) => user.id === actorId);
      const userEntry = {
        id: actorId,
        username,
        name: action.payload.fullName,
        role: 'Chef',
        status: 'Pending',
        email: action.payload.email,
        joinedAt: new Date().toISOString(),
      };
      const updatedUsers =
        existingIndex >= 0
          ? state.admin.users.map((user, index) =>
              index === existingIndex
                ? { ...user, name: action.payload.fullName, email: action.payload.email, role: 'Chef', status: 'Pending' }
                : user,
            )
          : [...state.admin.users, userEntry];
      return {
        ...state,
        chefProfile: {
          id: applicationId,
          userId: actorId,
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
        user: {
          ...state.user,
          name: action.payload.fullName,
          email: action.payload.email,
        },
        admin: {
          ...state.admin,
          users: updatedUsers,
        },
        chefEngagement: emptyChefEngagement,
        recipes: state.recipes.filter((recipe) => recipe.chefId !== state.chefProfile?.id),
        session: {
          ...state.session,
          isAuthenticated: true,
          role: 'chef',
          actorId,
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
        ownerId: state.session.actorId ?? state.chefProfile.userId ?? state.user.id,
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
        return {
          ...recipe,
          ...changes,
          status: 'pending',
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
    case 'ADMIN_UPDATE_USER_STATUS': {
      const { userId, status } = action.payload;
      const updatedUsers = state.admin.users.map((user) => (user.id === userId ? { ...user, status } : user));
      const target = state.admin.users.find((user) => user.id === userId);
      return appendAdminLog(
        {
          ...state,
          admin: {
            ...state.admin,
            users: updatedUsers,
          },
        },
        `Changed status for ${target?.username ?? userId} to ${status}`,
      );
    }
    case 'ADMIN_DELETE_USER': {
      const { userId } = action.payload;
      const target = state.admin.users.find((user) => user.id === userId);
      const updatedUsers = state.admin.users.filter((user) => user.id !== userId);
      return appendAdminLog(
        {
          ...state,
          admin: {
            ...state.admin,
            users: updatedUsers,
          },
        },
        `Deleted user account ${target?.username ?? userId}`,
      );
    }
    case 'ADMIN_UPDATE_USER_ROLE': {
      const { userId, role } = action.payload;
      const updatedUsers = state.admin.users.map((user) => (user.id === userId ? { ...user, role } : user));
      const target = state.admin.users.find((user) => user.id === userId);
      return appendAdminLog(
        {
          ...state,
          admin: {
            ...state.admin,
            users: updatedUsers,
          },
        },
        `Updated ${target?.username ?? userId} role to ${role}`,
      );
    }
    case 'ADMIN_DISMISS_FLAG': {
      const { flagId } = action.payload;
      const flag = state.admin.flaggedContent.find((item) => item.id === flagId);
      const updatedFlags = state.admin.flaggedContent.filter((item) => item.id !== flagId);
      return appendAdminLog(
        {
          ...state,
          admin: {
            ...state.admin,
            flaggedContent: updatedFlags,
          },
        },
        `Dismissed flag on ${flag?.title ?? 'content'}`,
      );
    }
    case 'ADMIN_REMOVE_FLAGGED_ITEM': {
      const { flagId, removalType } = action.payload;
      const flag = state.admin.flaggedContent.find((item) => item.id === flagId);
      const updatedFlags = state.admin.flaggedContent.filter((item) => item.id !== flagId);
      let nextState = {
        ...state,
        admin: {
          ...state.admin,
          flaggedContent: updatedFlags,
        },
      };
      if (flag?.type === 'recipe') {
        nextState = appReducer(nextState, { type: 'REMOVE_RECIPE', payload: { recipeId: flag.referenceId } });
      }
      return appendAdminLog(nextState, `Removed ${removalType || 'flagged content'} for ${flag?.title ?? flagId}`);
    }
    case 'ADMIN_ADD_CATEGORY': {
      const { label, type } = action.payload;
      const newCategory = {
        id: generateId('category'),
        label,
        type,
      };
      return appendAdminLog(
        {
          ...state,
          admin: {
            ...state.admin,
            categories: [...state.admin.categories, newCategory],
          },
        },
        `Added ${type} “${label}”`,
      );
    }
    case 'ADMIN_UPDATE_CATEGORY': {
      const { id, label } = action.payload;
      const updatedCategories = state.admin.categories.map((category) =>
        category.id === id ? { ...category, label } : category,
      );
      return appendAdminLog(
        {
          ...state,
          admin: {
            ...state.admin,
            categories: updatedCategories,
          },
        },
        `Renamed category to “${label}”`,
      );
    }
    case 'ADMIN_DELETE_CATEGORY': {
      const { id } = action.payload;
      const target = state.admin.categories.find((category) => category.id === id);
      const updatedCategories = state.admin.categories.filter((category) => category.id !== id);
      return appendAdminLog(
        {
          ...state,
          admin: {
            ...state.admin,
            categories: updatedCategories,
          },
        },
        `Deleted ${target?.type ?? 'category'} “${target?.label ?? id}”`,
      );
    }
    case 'ADMIN_LOG_ACTION': {
      return appendAdminLog(state, action.payload.message);
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
    const chefEngagement = buildChefEngagement(state, recipeSummaries);

    return {
      ...state,
      recipeSummaries,
      chefRecipeSummaries,
      chefEngagement,
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
