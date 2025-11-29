require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, ChefProfile, Recipe, Collection, Review, Category } = require('./models');
const { connectDB } = require('./db');

class Seeder {
  constructor() {
    this.users = [];
    this.chefProfiles = [];
    this.recipes = [];
    this.categories = [];
  }

  async connect() {
    await connectDB();
    console.log('Connected to database for seeding');
  }

  async clearData() {
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      ChefProfile.deleteMany({}),
      Recipe.deleteMany({}),
      Collection.deleteMany({}),
      Review.deleteMany({}),
      Category.deleteMany({}),
    ]);
    console.log('Data cleared');
  }

  async seedUsers() {
    console.log('Seeding users...');
    const passwordHash = await bcrypt.hash('password123', 10);

    const usersData = [
      {
        username: 'admin',
        email: 'admin@example.com',
        passwordHash,
        role: 'admin',
        status: 'active',
      },
      {
        username: 'chef1',
        email: 'chef@example.com',
        passwordHash,
        role: 'chef',
        status: 'active',
      },
      {
        username: 'user1',
        email: 'user@example.com',
        passwordHash,
        role: 'user',
        status: 'active',
      },
    ];

    this.users = await User.insertMany(usersData);
    console.log(`Created ${this.users.length} users`);
  }

  async seedChefProfiles() {
    console.log('Seeding chef profiles...');
    const chefUser = this.users.find((u) => u.role === 'chef');

    if (!chefUser) return;

    const profileData = {
      user: chefUser._id,
      displayName: 'Chef Gordon',
      bio: 'Passionate about Italian and French cuisine. 10 years of experience in top restaurants.',
      specialties: ['Italian', 'French', 'Pastry'],
      yearsExperience: 10,
      status: 'approved',
      approvedAt: new Date(),
    };

    const profile = await ChefProfile.create(profileData);
    this.chefProfiles.push(profile);
    console.log('Created chef profile');
  }

  async seedCategories() {
    console.log('Seeding categories...');
    const categoriesData = [
      { label: 'Italian', slug: 'italian', type: 'cuisine' },
      { label: 'Dinner', slug: 'dinner', type: 'category' },
      { label: 'Quick & Easy', slug: 'quick-easy', type: 'dietary' },
      { label: 'Dessert', slug: 'dessert', type: 'category' },
    ];

    this.categories = await Category.insertMany(categoriesData);
    console.log(`Created ${this.categories.length} categories`);
  }

  async seedRecipes() {
    console.log('Seeding recipes...');
    const chefUser = this.users.find((u) => u.role === 'chef');
    const chefProfile = this.chefProfiles.find((p) => p.user.toString() === chefUser._id.toString());
    const italianCat = this.categories.find(c => c.slug === 'italian');
    const dinnerCat = this.categories.find(c => c.slug === 'dinner');

    if (!chefUser || !chefProfile) return;

    const recipesData = [
      {
        owner: chefUser._id,
        chefProfile: chefProfile._id,
        title: 'Classic Spaghetti Carbonara',
        description: 'Authentic Roman pasta dish with eggs, cheese, guanciale, and pepper.',
        cuisine: 'Italian',
        categories: [italianCat._id, dinnerCat._id],
        prepTime: 15,
        cookTime: 20,
        servings: 4,
        status: 'approved',
        image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1200&q=80',
        ingredients: [
          { name: 'Spaghetti', quantity: 400, unit: 'g' },
          { name: 'Guanciale', quantity: 150, unit: 'g' },
          { name: 'Pecorino Romano', quantity: 100, unit: 'g' },
          { name: 'Eggs', quantity: 4, unit: 'large' },
        ],
        steps: [
          { description: 'Boil water and cook pasta.', order: 1 },
          { description: 'Fry guanciale until crisp.', order: 2 },
          { description: 'Mix eggs and cheese.', order: 3 },
          { description: 'Combine pasta, guanciale, and egg mixture off heat.', order: 4 },
        ],
        ratingSummary: { average: 4.5, count: 2 },
      },
      {
        owner: chefUser._id,
        chefProfile: chefProfile._id,
        title: 'Tiramisu',
        description: 'Elegant and rich layered Italian dessert.',
        cuisine: 'Italian',
        categories: [italianCat._id],
        prepTime: 30,
        cookTime: 0,
        servings: 8,
        status: 'approved',
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
        ingredients: [
          { name: 'Ladyfingers', quantity: 200, unit: 'g' },
          { name: 'Mascarpone', quantity: 500, unit: 'g' },
          { name: 'Espresso', quantity: 1, unit: 'cup' },
        ],
        steps: [
          { description: 'Dip ladyfingers in espresso.', order: 1 },
          { description: 'Layer with mascarpone cream.', order: 2 },
          { description: 'Dust with cocoa powder.', order: 3 },
        ],
        ratingSummary: { average: 5, count: 1 },
      },
    ];

    this.recipes = await Recipe.insertMany(recipesData);
    console.log(`Created ${this.recipes.length} recipes`);
  }

  async seedCollections() {
    console.log('Seeding collections...');
    const regularUser = this.users.find((u) => u.role === 'user');
    if (!regularUser || this.recipes.length === 0) return;

    const collectionData = {
      user: regularUser._id,
      name: 'My Favorites',
      description: 'Recipes I love',
      recipeIds: [this.recipes[0]._id],
      visibility: 'private',
    };

    await Collection.create(collectionData);
    console.log('Created collection');
  }

  async seedReviews() {
    console.log('Seeding reviews...');
    const regularUser = this.users.find((u) => u.role === 'user');
    const recipe = this.recipes[0];

    if (!regularUser || !recipe) return;

    const reviewData = {
      recipe: recipe._id,
      author: regularUser._id,
      displayName: 'Foodie User',
      rating: 5,
      comment: 'Absolutely delicious! Best carbonara I have ever had.',
    };

    await Review.create(reviewData);
    console.log('Created review');
  }

  async run() {
    try {
      await this.connect();
      await this.clearData();
      await this.seedUsers();
      await this.seedChefProfiles();
      await this.seedCategories();
      await this.seedRecipes();
      await this.seedCollections();
      await this.seedReviews();
      console.log('Seeding completed successfully!');
      process.exit(0);
    } catch (error) {
      console.error('Seeding failed:', error);
      process.exit(1);
    }
  }
}

const seeder = new Seeder();
seeder.run();
