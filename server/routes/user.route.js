const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { requireAuth } = require('../middleware/auth');
const { User, Recipe, Collection, ShoppingList, Review } = require('../models');

const router = express.Router();

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const sanitizeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  status: user.status,
  avatarUrl: user.avatarUrl,
});

const getDefaultCollection = async (userId) => {
  let collection = await Collection.findOne({ user: userId, isDefault: true });
  if (!collection) {
    collection = await Collection.create({ user: userId, name: 'Saved', isDefault: true });
  }
  return collection;
};

const consolidateIngredients = (recipes) => {
  const map = new Map();
  recipes.forEach((recipe) => {
    (recipe.ingredients || []).forEach((ing) => {
      const key = `${(ing.name || '').toLowerCase()}|${ing.unit || ''}`;
      const existing = map.get(key) || { name: ing.name, quantity: 0, unit: ing.unit || '' };
      existing.quantity += Number(ing.quantity || 0);
      map.set(key, existing);
    });
  });
  return Array.from(map.values());
};

router.get('/profile', requireAuth, async (req, res) => {
  return res.json({ user: sanitizeUser(req.user) });
});

router.patch('/profile', requireAuth, async (req, res) => {
  try {
    const { username, email, avatarUrl } = req.body || {};
    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (typeof avatarUrl === 'string') updates.avatarUrl = avatarUrl;

    if (updates.username) {
      const exists = await User.findOne({ _id: { $ne: req.user._id }, username: updates.username });
      if (exists) return res.status(409).json({ error: 'Username already taken' });
    }
    if (updates.email) {
      const exists = await User.findOne({ _id: { $ne: req.user._id }, email: updates.email });
      if (exists) return res.status(409).json({ error: 'Email already taken' });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('Update profile error', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.patch('/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }

    const user = await User.findById(req.user._id);
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.json({ success: true });
  } catch (error) {
    console.error('Change password error', error);
    return res.status(500).json({ error: 'Failed to change password' });
  }
});

router.get('/recipes', async (req, res) => {
  try {
    const { search, cuisine, dietary, page = 1, limit = 20, sort } = req.query;
    const filter = { status: 'approved' };
    if (cuisine) filter.cuisine = cuisine;
    if (dietary) {
      const dietaryArr = Array.isArray(dietary) ? dietary : [dietary];
      filter.dietary = { $all: dietaryArr };
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const sortOption = sort === 'rating' ? { 'ratingSummary.average': -1 } : { createdAt: -1 };

    const [items, total] = await Promise.all([
      Recipe.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .select('-rejectionNote')
        .lean(),
      Recipe.countDocuments(filter),
    ]);

    return res.json({ items, page: pageNum, pageSize: limitNum, total });
  } catch (error) {
    console.error('List recipes error', error);
    return res.status(500).json({ error: 'Failed to list recipes' });
  }
});

router.get('/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid recipe id' });

    const recipe = await Recipe.findById(id)
      .populate('categories', 'label type')
      .populate('owner', 'username role')
      .lean();
    if (!recipe || recipe.status !== 'approved') return res.status(404).json({ error: 'Recipe not found' });
    return res.json(recipe);
  } catch (error) {
    console.error('Recipe detail error', error);
    return res.status(500).json({ error: 'Failed to load recipe' });
  }
});

router.post('/recipes/:id/save', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid recipe id' });

    const recipe = await Recipe.findById(id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    const providedCollectionIds = req.body?.collectionIds || [];
    const targetCollectionIds = providedCollectionIds.length > 0 ? providedCollectionIds : [(await getDefaultCollection(req.user._id))._id];

    const updatedCollections = [];
    for (const colId of targetCollectionIds) {
      const collection = await Collection.findOne({ _id: colId, user: req.user._id });
      if (!collection) continue;
      const exists = collection.recipeIds.some((r) => r.toString() === id.toString());
      if (exists) {
        collection.recipeIds = collection.recipeIds.filter((r) => r.toString() !== id.toString());
      } else {
        collection.recipeIds.push(id);
      }
      await collection.save();
      updatedCollections.push(collection);
    }

    return res.json({ collections: updatedCollections });
  } catch (error) {
    console.error('Toggle save error', error);
    return res.status(500).json({ error: 'Failed to toggle save' });
  }
});

router.get('/collections', requireAuth, async (req, res) => {
  try {
    const collections = await Collection.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    return res.json({ items: collections });
  } catch (error) {
    console.error('List collections error', error);
    return res.status(500).json({ error: 'Failed to list collections' });
  }
});

router.post('/collections', requireAuth, async (req, res) => {
  try {
    const { name, description = '', visibility = 'private' } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name is required' });

    const existing = await Collection.findOne({ user: req.user._id, name });
    if (existing) return res.status(409).json({ error: 'Collection name already exists' });

    const collection = await Collection.create({ user: req.user._id, name, description, visibility });
    return res.status(201).json(collection);
  } catch (error) {
    console.error('Create collection error', error);
    return res.status(500).json({ error: 'Failed to create collection' });
  }
});

router.patch('/collections/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid collection id' });
    const { name, description, visibility, addRecipeIds = [], removeRecipeIds = [] } = req.body || {};

    const collection = await Collection.findOne({ _id: id, user: req.user._id });
    if (!collection) return res.status(404).json({ error: 'Collection not found' });

    if (name && name !== collection.name) {
      const exists = await Collection.findOne({ user: req.user._id, name });
      if (exists) return res.status(409).json({ error: 'Collection name already exists' });
      collection.name = name;
    }
    if (typeof description === 'string') collection.description = description;
    if (visibility) collection.visibility = visibility;

    if (Array.isArray(addRecipeIds)) {
      addRecipeIds.forEach((rid) => {
        if (isValidObjectId(rid) && !collection.recipeIds.some((r) => r.toString() === rid.toString())) {
          collection.recipeIds.push(rid);
        }
      });
    }
    if (Array.isArray(removeRecipeIds) && removeRecipeIds.length > 0) {
      collection.recipeIds = collection.recipeIds.filter(
        (r) => !removeRecipeIds.some((rid) => rid.toString() === r.toString()),
      );
    }

    await collection.save();
    return res.json(collection);
  } catch (error) {
    console.error('Update collection error', error);
    return res.status(500).json({ error: 'Failed to update collection' });
  }
});

router.delete('/collections/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid collection id' });

    const collection = await Collection.findOne({ _id: id, user: req.user._id, isDefault: { $ne: true } });
    if (!collection) return res.status(404).json({ error: 'Collection not found or cannot delete default' });

    await collection.deleteOne();
    return res.json({ success: true });
  } catch (error) {
    console.error('Delete collection error', error);
    return res.status(500).json({ error: 'Failed to delete collection' });
  }
});

router.get('/shopping-list', requireAuth, async (req, res) => {
  try {
    const list = await ShoppingList.findOne({ user: req.user._id }).lean();
    return res.json(list || { recipeIds: [], consolidatedItems: [] });
  } catch (error) {
    console.error('Get shopping list error', error);
    return res.status(500).json({ error: 'Failed to load shopping list' });
  }
});

router.post('/shopping-list', requireAuth, async (req, res) => {
  try {
    const { recipeIds } = req.body || {};
    const ids = Array.isArray(recipeIds) ? recipeIds.filter((id) => isValidObjectId(id)) : [];
    if (ids.length === 0) return res.status(400).json({ error: 'recipeIds are required' });

    const recipes = await Recipe.find({ _id: { $in: ids } }).lean();
    const consolidatedItems = consolidateIngredients(recipes);

    const list = await ShoppingList.findOneAndUpdate(
      { user: req.user._id },
      { recipeIds: ids, consolidatedItems, generatedAt: new Date() },
      { upsert: true, new: true },
    );

    return res.json(list);
  } catch (error) {
    console.error('Update shopping list error', error);
    return res.status(500).json({ error: 'Failed to update shopping list' });
  }
});

router.delete('/shopping-list', requireAuth, async (req, res) => {
  try {
    await ShoppingList.findOneAndUpdate(
      { user: req.user._id },
      { recipeIds: [], consolidatedItems: [], generatedAt: null },
      { upsert: true },
    );
    return res.json({ success: true });
  } catch (error) {
    console.error('Clear shopping list error', error);
    return res.status(500).json({ error: 'Failed to clear shopping list' });
  }
});

router.delete('/shopping-list/recipes/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid recipe id' });

    const list = await ShoppingList.findOne({ user: req.user._id });
    if (!list) return res.status(404).json({ error: 'Shopping list not found' });

    list.recipeIds = list.recipeIds.filter((rid) => rid.toString() !== id.toString());
    const recipes = await Recipe.find({ _id: { $in: list.recipeIds } }).lean();
    list.consolidatedItems = consolidateIngredients(recipes);
    await list.save();

    return res.json(list);
  } catch (error) {
    console.error('Remove recipe from shopping list error', error);
    return res.status(500).json({ error: 'Failed to update shopping list' });
  }
});

router.post('/recipes/:id/reviews', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid recipe id' });
    const { rating, comment } = req.body || {};
    if (!rating || !comment) return res.status(400).json({ error: 'rating and comment are required' });

    const recipe = await Recipe.findById(id);
    if (!recipe || recipe.status !== 'approved') return res.status(404).json({ error: 'Recipe not found' });

    const review = await Review.create({
      recipe: id,
      author: req.user._id,
      displayName: req.user.username,
      rating,
      comment,
      status: 'visible',
    });

    const count = recipe.ratingSummary.count || 0;
    const avg = recipe.ratingSummary.average || 0;
    const newCount = count + 1;
    const newAvg = (avg * count + rating) / newCount;
    recipe.ratingSummary = { average: newAvg, count: newCount };
    await recipe.save();

    return res.status(201).json(review);
  } catch (error) {
    console.error('Create review error', error);
    return res.status(500).json({ error: 'Failed to create review' });
  }
});

router.get('/recipes/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid recipe id' });
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Review.find({ recipe: id, status: { $ne: 'removed' } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Review.countDocuments({ recipe: id, status: { $ne: 'removed' } }),
    ]);

    return res.json({ items, page: pageNum, pageSize: limitNum, total });
  } catch (error) {
    console.error('List reviews error', error);
    return res.status(500).json({ error: 'Failed to list reviews' });
  }
});

module.exports = router;
