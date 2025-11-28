const express = require('express');
const mongoose = require('mongoose');
const { Category, Recipe, User, Flag, Review, ChefProfile } = require('../models');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

const slugify = (label = '') =>
  label
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const parseBoolean = (value) => value === true || value === 'true' || value === 1 || value === '1';
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

router.use(requireAuth, requireRole('admin'));

router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalRecipes,
      pendingRecipes,
      approvedRecipes,
      rejectedRecipes,
      draftRecipes,
      archivedRecipes,
      totalReviews,
      totalUsers,
      chefUsers,
      adminUsers,
      activeUsers,
      pendingUsers,
      totalFlags,
      openFlags,
      taxonomyCounts,
      cuisineCounts,
      dietaryCounts,
    ] = await Promise.all([
      Recipe.countDocuments(),
      Recipe.countDocuments({ status: 'pending' }),
      Recipe.countDocuments({ status: 'approved' }),
      Recipe.countDocuments({ status: 'rejected' }),
      Recipe.countDocuments({ status: 'draft' }),
      Recipe.countDocuments({ status: 'archived' }),
      Review.countDocuments(),
      User.countDocuments(),
      User.countDocuments({ role: 'chef' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'pending' }),
      Flag.countDocuments(),
      Flag.countDocuments({ status: 'open' }),
      Category.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
      Recipe.aggregate([
        { $match: { cuisine: { $nin: [null, ''] } } },
        { $group: { _id: '$cuisine', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Recipe.aggregate([
        { $unwind: '$dietary' },
        { $match: { dietary: { $nin: [null, ''] } } },
        { $group: { _id: '$dietary', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const taxonomy = taxonomyCounts.reduce((acc, entry) => {
      acc[entry._id || 'unknown'] = entry.count;
      return acc;
    }, {});

    return res.json({
      recipes: {
        total: totalRecipes,
        pending: pendingRecipes,
        approved: approvedRecipes,
        rejected: rejectedRecipes,
        draft: draftRecipes,
        archived: archivedRecipes,
      },
      reviews: { total: totalReviews },
      users: {
        total: totalUsers,
        active: activeUsers,
        pending: pendingUsers,
        chefs: chefUsers,
        admins: adminUsers,
      },
      flags: { total: totalFlags, open: openFlags },
      taxonomy: {
        counts: taxonomy,
        cuisineTop: cuisineCounts,
        dietaryTop: dietaryCounts,
      },
    });
  } catch (error) {
    console.error('Admin dashboard error', error);
    return res.status(500).json({ error: 'Failed to load dashboard metrics' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const categories = await Category.find(filter).sort({ label: 1 }).lean();
    return res.json({ items: categories });
  } catch (error) {
    console.error('List categories error', error);
    return res.status(500).json({ error: 'Failed to list categories' });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const { label, type } = req.body || {};
    if (!label || !type) {
      return res.status(400).json({ error: 'label and type are required' });
    }

    const slug = slugify(label);
    const existing = await Category.findOne({ slug, type });
    if (existing) {
      return res.status(409).json({ error: 'Category already exists for this type' });
    }

    const category = await Category.create({ label, type, slug });
    return res.status(201).json(category);
  } catch (error) {
    console.error('Create category error', error);
    return res.status(500).json({ error: 'Failed to create category' });
  }
});

router.patch('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid category id' });
    }

    const { label, type, isActive } = req.body || {};
    const updates = {};

    if (label) {
      updates.label = label;
      updates.slug = slugify(label);
    }
    if (type) {
      updates.type = type;
    }
    if (typeof isActive === 'boolean') {
      updates.isActive = isActive;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No update fields provided' });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (updates.slug || updates.type) {
      const slug = updates.slug || category.slug;
      const typeToCheck = updates.type || category.type;
      const duplicate = await Category.findOne({ _id: { $ne: id }, slug, type: typeToCheck });
      if (duplicate) {
        return res.status(409).json({ error: 'Another category with this label/type exists' });
      }
    }

    Object.assign(category, updates);
    await category.save();
    return res.json(category);
  } catch (error) {
    console.error('Update category error', error);
    return res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid category id' });
    }

    const force = parseBoolean(req.query.force);
    if (!force) {
      const inUse = await Recipe.countDocuments({ categories: id });
      if (inUse > 0) {
        return res
          .status(409)
          .json({ error: 'Category is in use by recipes; pass force=true to delete anyway', inUse });
      }
    }

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Category not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete category error', error);
    return res.status(500).json({ error: 'Failed to delete category' });
  }
});

router.get('/recipes', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const recipes = await Recipe.find(filter)
      .sort({ submittedAt: -1 })
      .limit(100)
      .populate('owner', 'username email role')
      .populate('chefProfile', 'displayName status')
      .lean();

    return res.json({ items: recipes });
  } catch (error) {
    console.error('List recipes error', error);
    return res.status(500).json({ error: 'Failed to list recipes' });
  }
});

router.patch('/recipes/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid recipe id' });
    }

    const { status, note } = req.body || {};
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'status must be approved, rejected, or pending' });
    }

    const updates = { status };
    if (status === 'approved') {
      updates.approvedAt = new Date();
      updates.rejectedAt = null;
      updates.rejectionNote = '';
    }
    if (status === 'rejected') {
      updates.rejectedAt = new Date();
      updates.approvedAt = null;
      updates.rejectionNote = note || '';
    }
    if (status === 'pending') {
      updates.approvedAt = null;
      updates.rejectedAt = null;
      updates.rejectionNote = '';
    }

    const recipe = await Recipe.findByIdAndUpdate(id, updates, { new: true });
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    return res.json(recipe);
  } catch (error) {
    console.error('Update recipe status error', error);
    return res.status(500).json({ error: 'Failed to update recipe status' });
  }
});

router.delete('/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid recipe id' });
    }

    const deleted = await Recipe.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete recipe error', error);
    return res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

router.get('/flags', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const flags = await Flag.find(filter).sort({ flaggedAt: -1 }).limit(100).lean();
    return res.json({ items: flags });
  } catch (error) {
    console.error('List flags error', error);
    return res.status(500).json({ error: 'Failed to list flags' });
  }
});

router.patch('/flags/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid flag id' });
    }

    const { status, actionNote } = req.body || {};
    if (!['open', 'dismissed', 'removed'].includes(status)) {
      return res.status(400).json({ error: 'status must be open, dismissed, or removed' });
    }

    const updates = { status, actionNote: actionNote || '' };
    if (status !== 'open') {
      updates.handledAt = new Date();
      updates.handledBy = req.user ? req.user._id : null;
    } else {
      updates.handledAt = null;
      updates.handledBy = null;
    }

    const flag = await Flag.findByIdAndUpdate(id, updates, { new: true });
    if (!flag) {
      return res.status(404).json({ error: 'Flag not found' });
    }

    return res.json(flag);
  } catch (error) {
    console.error('Update flag error', error);
    return res.status(500).json({ error: 'Failed to update flag' });
  }
});

router.delete('/flags/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid flag id' });
    }

    const cascade = parseBoolean(req.query.cascade);
    const flag = await Flag.findById(id);
    if (!flag) {
      return res.status(404).json({ error: 'Flag not found' });
    }

    if (cascade) {
      try {
        if (flag.targetModel === 'Recipe') await Recipe.findByIdAndDelete(flag.reference);
        if (flag.targetModel === 'Review') await Review.findByIdAndDelete(flag.reference);
        if (flag.targetModel === 'User') await User.findByIdAndDelete(flag.reference);
        if (flag.targetModel === 'ChefProfile') await ChefProfile.findByIdAndDelete(flag.reference);
      } catch (cascadeError) {
        console.error('Cascade delete error', cascadeError);
      }
    }

    await flag.deleteOne();
    return res.json({ success: true, cascaded: cascade });
  } catch (error) {
    console.error('Delete flag error', error);
    return res.status(500).json({ error: 'Failed to delete flag' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { role, status, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ email: regex }, { username: regex }];
    }

    const users = await User.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    return res.json({ items: users });
  } catch (error) {
    console.error('List users error', error);
    return res.status(500).json({ error: 'Failed to list users' });
  }
});

router.patch('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const { status } = req.body || {};
    if (!['active', 'pending', 'deactivated'].includes(status)) {
      return res.status(400).json({ error: 'status must be active, pending, or deactivated' });
    }

    const user = await User.findByIdAndUpdate(id, { status }, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Update user status error', error);
    return res.status(500).json({ error: 'Failed to update user status' });
  }
});

router.patch('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const { role } = req.body || {};
    if (!['user', 'chef', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'role must be user, chef, or admin' });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Update user role error', error);
    return res.status(500).json({ error: 'Failed to update user role' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    if (req.user && req.user._id && req.user._id.toString() === id.toString()) {
      return res.status(400).json({ error: 'Admins cannot delete their own account' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete an admin user' });
    }

    await user.deleteOne();
    return res.json({ success: true });
  } catch (error) {
    console.error('Delete user error', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
