const express = require('express');
const mongoose = require('mongoose');
const { requireAuth, requireRole } = require('../middleware/auth');
const { ChefProfile, Recipe, Review, User, Category } = require('../models');

const router = express.Router();
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get('/profile', requireAuth, requireRole('chef', 'admin'), async (req, res) => {
  try {
    const profile = await ChefProfile.findOne({ user: req.user._id }).lean();
    if (!profile) return res.status(404).json({ error: 'Chef profile not found' });
    return res.json(profile);
  } catch (error) {
    console.error('Get chef profile error', error);
    return res.status(500).json({ error: 'Failed to load chef profile' });
  }
});

router.post('/apply', requireAuth, async (req, res) => {
  try {
    const {
      fullName,
      email,
      displayName,
      bio = '',
      specialties = [],
      yearsExperience = 0,
      signatureDish = '',
      phone = '',
      website = '',
    } = req.body || {};

    const existing = await ChefProfile.findOne({ user: req.user._id });
    if (existing) return res.status(409).json({ error: 'Chef application already submitted' });

    const profile = await ChefProfile.create({
      user: req.user._id,
      displayName: displayName || fullName || req.user.username,
      bio,
      specialties,
      yearsExperience,
      signatureDish,
      phone,
      website,
      status: 'pending',
      submissionNote: '',
      termsAcceptedAt: new Date(),
    });

    await User.findByIdAndUpdate(req.user._id, { role: 'chef', status: 'pending' });

    return res.status(201).json({ id: profile._id, status: profile.status, submittedAt: profile.submittedAt });
  } catch (error) {
    console.error('Chef apply error', error);
    return res.status(500).json({ error: 'Failed to submit chef application' });
  }
});

router.patch('/profile', requireAuth, requireRole('chef', 'admin'), async (req, res) => {
  try {
    const allowed = ['displayName', 'bio', 'specialties', 'yearsExperience', 'phone', 'website', 'signatureDish'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body && Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    });

    const profile = await ChefProfile.findOneAndUpdate({ user: req.user._id }, updates, { new: true });
    if (!profile) return res.status(404).json({ error: 'Chef profile not found' });

    return res.json(profile);
  } catch (error) {
    console.error('Update chef profile error', error);
    return res.status(500).json({ error: 'Failed to update chef profile' });
  }
});

router.get('/recipes', requireAuth, requireRole('chef', 'admin'), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { owner: req.user._id };
    if (status) filter.status = status;

    const recipes = await Recipe.find(filter).sort({ createdAt: -1 }).lean();
    return res.json({ items: recipes });
  } catch (error) {
    console.error('Chef list recipes error', error);
    return res.status(500).json({ error: 'Failed to list recipes' });
  }
});

router.post('/recipes', requireAuth, requireRole('chef', 'admin'), async (req, res) => {
  try {
    const data = req.body || {};
    if (!data.title || !data.description) {
      return res.status(400).json({ error: 'title and description are required' });
    }

    // Resolve categories
    if (data.categories && Array.isArray(data.categories)) {
      const categoryIds = [];
      for (const label of data.categories) {
        if (typeof label === 'string') {
          const slug = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
          let category = await Category.findOne({ slug });
          if (!category) {
            category = await Category.create({
              label: label.trim(),
              slug,
              type: 'category',
            });
          }
          categoryIds.push(category._id);
        } else if (isValidObjectId(label)) {
           categoryIds.push(label);
        }
      }
      data.categories = categoryIds;
    }

    const profile = await ChefProfile.findOne({ user: req.user._id });
    const recipe = await Recipe.create({
      ...data,
      owner: req.user._id,
      chefProfile: profile ? profile._id : null,
      status: 'pending',
      submittedAt: new Date(),
      approvedAt: null,
      rejectedAt: null,
      rejectionNote: '',
    });

    return res.status(201).json({ id: recipe._id, status: recipe.status });
  } catch (error) {
    console.error('Chef create recipe error', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message || 'Failed to create recipe' });
  }
});

router.patch('/recipes/:id', requireAuth, requireRole('chef', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid recipe id' });

    const recipe = await Recipe.findOne({ _id: id, owner: req.user._id });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    const before = recipe.toObject();
    
    // Resolve categories if present
    if (req.body.categories && Array.isArray(req.body.categories)) {
      const categoryIds = [];
      for (const label of req.body.categories) {
        if (typeof label === 'string') {
          const slug = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
          let category = await Category.findOne({ slug });
          if (!category) {
            category = await Category.create({
              label: label.trim(),
              slug,
              type: 'category',
            });
          }
          categoryIds.push(category._id);
        } else if (isValidObjectId(label)) {
           categoryIds.push(label);
        }
      }
      req.body.categories = categoryIds;
    }

    Object.assign(recipe, req.body || {});

    const majorFields = ['title', 'description', 'cuisine', 'dietary', 'categories', 'ingredients', 'steps'];
    const changedMajor = majorFields.some((field) => JSON.stringify(before[field]) !== JSON.stringify(recipe[field]));
    if (changedMajor && recipe.status === 'approved') {
      recipe.status = 'pending';
      recipe.approvedAt = null;
    }

    await recipe.save();
    return res.json(recipe);
  } catch (error) {
    console.error('Chef update recipe error', error);
    return res.status(500).json({ error: 'Failed to update recipe' });
  }
});

router.delete('/recipes/:id', requireAuth, requireRole('chef', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid recipe id' });

    const recipe = await Recipe.findOne({ _id: id, owner: req.user._id });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    recipe.status = 'archived';
    await recipe.save();
    return res.json({ success: true });
  } catch (error) {
    console.error('Chef delete recipe error', error);
    return res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

router.post('/recipes/:id/replies', requireAuth, requireRole('chef', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewId, comment } = req.body || {};
    if (!isValidObjectId(id) || !isValidObjectId(reviewId)) return res.status(400).json({ error: 'Invalid id' });
    if (!comment) return res.status(400).json({ error: 'comment is required' });

    const recipe = await Recipe.findOne({ _id: id, owner: req.user._id });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    const review = await Review.findOne({ _id: reviewId, recipe: id });
    if (!review) return res.status(404).json({ error: 'Review not found' });

    review.replies.push({ author: req.user._id, displayName: req.user.username, comment, createdAt: new Date() });
    await review.save();

    return res.status(201).json(review);
  } catch (error) {
    console.error('Chef reply error', error);
    return res.status(500).json({ error: 'Failed to add reply' });
  }
});

router.get('/analytics', requireAuth, requireRole('chef', 'admin'), async (req, res) => {
  try {
    const recipes = await Recipe.find({ owner: req.user._id })
      .select('title engagement ratingSummary createdAt status')
      .lean();
    return res.json({ items: recipes });
  } catch (error) {
    console.error('Chef analytics error', error);
    return res.status(500).json({ error: 'Failed to load analytics' });
  }
});

module.exports = router;
