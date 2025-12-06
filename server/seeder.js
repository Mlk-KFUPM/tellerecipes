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
      { label: 'Asian', slug: 'asian', type: 'cuisine' },
      { label: 'Mexican', slug: 'mexican', type: 'cuisine' },
      { label: 'American', slug: 'american', type: 'cuisine' },
      { label: 'Dinner', slug: 'dinner', type: 'category' },
      { label: 'Lunch', slug: 'lunch', type: 'category' },
      { label: 'Breakfast', slug: 'breakfast', type: 'category' },
      { label: 'Quick & Easy', slug: 'quick-easy', type: 'dietary' },
      { label: 'Healthy', slug: 'healthy', type: 'dietary' },
      { label: 'Vegan', slug: 'vegan', type: 'dietary' },
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
    const asianCat = this.categories.find(c => c.slug === 'asian');
    const mexicanCat = this.categories.find(c => c.slug === 'mexican');
    const americanCat = this.categories.find(c => c.slug === 'american');
    const dinnerCat = this.categories.find(c => c.slug === 'dinner');
    const lunchCat = this.categories.find(c => c.slug === 'lunch');
    const breakfastCat = this.categories.find(c => c.slug === 'breakfast');
    const quickCat = this.categories.find(c => c.slug === 'quick-easy');
    const healthyCat = this.categories.find(c => c.slug === 'healthy');
    const veganCat = this.categories.find(c => c.slug === 'vegan');
    const dessertCat = this.categories.find(c => c.slug === 'dessert');

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
        categories: [italianCat._id, dessertCat._id],
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
      {
        owner: chefUser._id,
        chefProfile: chefProfile._id,
        title: 'Chicken Tikka Masala',
        description: 'Chunks of roasted marinated chicken in a spiced curry sauce.',
        cuisine: 'Asian',
        categories: [asianCat._id, dinnerCat._id],
        prepTime: 20,
        cookTime: 40,
        servings: 4,
        status: 'approved',
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1200&q=80',
        ingredients: [
          { name: 'Chicken Breast', quantity: 500, unit: 'g' },
          { name: 'Yogurt', quantity: 1, unit: 'cup' },
          { name: 'Tomato Puree', quantity: 400, unit: 'g' },
          { name: 'Garam Masala', quantity: 2, unit: 'tbsp' },
        ],
        steps: [
          { description: 'Marinate chicken in yogurt and spices.', order: 1 },
          { description: 'Grill chicken pieces.', order: 2 },
          { description: 'Simmer in tomato sauce with cream.', order: 3 },
        ],
        ratingSummary: { average: 4.8, count: 5 },
      },
      {
        owner: chefUser._id,
        chefProfile: chefProfile._id,
        title: 'Beef Tacos',
        description: 'Classic Mexican street food with seasoned beef and fresh toppings.',
        cuisine: 'Mexican',
        categories: [mexicanCat._id, dinnerCat._id, quickCat._id],
        prepTime: 15,
        cookTime: 15,
        servings: 3,
        status: 'approved',
        image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1200&q=80',
        ingredients: [
          { name: 'Ground Beef', quantity: 500, unit: 'g' },
          { name: 'Corn Tortillas', quantity: 6, unit: 'pcs' },
          { name: 'Onion', quantity: 1, unit: 'medium' },
          { name: 'Cilantro', quantity: 1, unit: 'bunch' },
        ],
        steps: [
          { description: 'Cook beef with spices.', order: 1 },
          { description: 'Warm tortillas.', order: 2 },
          { description: 'Assemble with toppings.', order: 3 },
        ],
        ratingSummary: { average: 4.6, count: 3 },
      },
      {
        owner: chefUser._id,
        chefProfile: chefProfile._id,
        title: 'Avocado Toast',
        description: 'Simple, healthy, and delicious breakfast staple.',
        cuisine: 'American',
        categories: [breakfastCat._id, quickCat._id, veganCat._id, healthyCat._id],
        prepTime: 5,
        cookTime: 5,
        servings: 1,
        status: 'approved',
        image: 'https://images.unsplash.com/photo-1588137372308-15f75323ca8d?auto=format&fit=crop&w=1200&q=80',
        ingredients: [
          { name: 'Sourdough Bread', quantity: 2, unit: 'slices' },
          { name: 'Avocado', quantity: 1, unit: 'ripe' },
          { name: 'Chili Flakes', quantity: 1, unit: 'pinch' },
          { name: 'Lemon Juice', quantity: 1, unit: 'tsp' },
        ],
        steps: [
          { description: 'Toast the bread.', order: 1 },
          { description: 'Mash avocado with lemon and salt.', order: 2 },
          { description: 'Spread on toast and top with chili flakes.', order: 3 },
        ],
        ratingSummary: { average: 4.9, count: 10 },
      },
      {
        owner: chefUser._id,
        chefProfile: chefProfile._id,
        title: 'Classic Cheeseburger',
        description: 'Juicy beef patty with melted cheese and fresh veggies.',
        cuisine: 'American',
        categories: [americanCat._id, dinnerCat._id],
        prepTime: 15,
        cookTime: 10,
        servings: 2,
        status: 'approved',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
        ingredients: [
          { name: 'Ground Beef', quantity: 300, unit: 'g' },
          { name: 'Burger Buns', quantity: 2, unit: 'pcs' },
          { name: 'Cheddar Cheese', quantity: 2, unit: 'slices' },
          { name: 'Lettuce', quantity: 2, unit: 'leaves' },
        ],
        steps: [
          { description: 'Form beef patties.', order: 1 },
          { description: 'Grill patties and melt cheese.', order: 2 },
          { description: 'Assemble burger with buns and veggies.', order: 3 },
        ],
        ratingSummary: { average: 4.7, count: 8 },
      },
      {
        owner: chefUser._id,
        chefProfile: chefProfile._id,
        title: 'Vegetable Stir Fry',
        description: 'Colorful mix of vegetables in a savory soy-ginger sauce.',
        cuisine: 'Asian',
        categories: [asianCat._id, dinnerCat._id, healthyCat._id, veganCat._id],
        prepTime: 15,
        cookTime: 10,
        servings: 2,
        status: 'approved',
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80',
        ingredients: [
          { name: 'Broccoli', quantity: 1, unit: 'head' },
          { name: 'Bell Peppers', quantity: 2, unit: 'pcs' },
          { name: 'Soy Sauce', quantity: 3, unit: 'tbsp' },
          { name: 'Ginger', quantity: 1, unit: 'inch' },
        ],
        steps: [
          { description: 'Chop all vegetables.', order: 1 },
          { description: 'Stir fry in hot wok.', order: 2 },
          { description: 'Add sauce and toss.', order: 3 },
        ],
        ratingSummary: { average: 4.4, count: 4 },
      },
      {
        owner: chefUser._id,
        chefProfile: chefProfile._id,
        title: 'Fluffy Pancakes',
        description: 'Thick and fluffy pancakes served with maple syrup.',
        cuisine: 'American',
        categories: [breakfastCat._id, dessertCat._id],
        prepTime: 10,
        cookTime: 15,
        servings: 4,
        status: 'approved',
        image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1200&q=80',
        ingredients: [
          { name: 'Flour', quantity: 2, unit: 'cups' },
          { name: 'Milk', quantity: 1.5, unit: 'cups' },
          { name: 'Eggs', quantity: 2, unit: 'large' },
          { name: 'Baking Powder', quantity: 2, unit: 'tsp' },
        ],
        steps: [
          { description: 'Mix dry and wet ingredients separately.', order: 1 },
          { description: 'Combine gently.', order: 2 },
          { description: 'Cook on griddle until golden.', order: 3 },
        ],
        ratingSummary: { average: 4.8, count: 12 },
      },
      {
        owner: chefUser._id,
        chefProfile: chefProfile._id,
        title: 'Mushroom Risotto',
        description: 'Creamy Italian rice dish with wild mushrooms.',
        cuisine: 'Italian',
        categories: [italianCat._id, dinnerCat._id],
        prepTime: 10,
        cookTime: 30,
        servings: 4,
        status: 'approved',
        image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=1200&q=80',
        ingredients: [
          { name: 'Arborio Rice', quantity: 300, unit: 'g' },
          { name: 'Mushrooms', quantity: 200, unit: 'g' },
          { name: 'Vegetable Broth', quantity: 1, unit: 'liter' },
          { name: 'Parmesan', quantity: 50, unit: 'g' },
        ],
        steps: [
          { description: 'Sauté mushrooms.', order: 1 },
          { description: 'Toast rice and add wine.', order: 2 },
          { description: 'Add broth gradually while stirring.', order: 3 },
        ],
        ratingSummary: { average: 4.6, count: 6 },
      },
      {
        owner: chefUser._id,
        chefProfile: chefProfile._id,
        title: 'Greek Salad',
        description: 'Fresh and crisp salad with feta, olives, and tomatoes.',
        cuisine: 'Mediterranean',
        categories: [lunchCat._id, healthyCat._id, quickCat._id],
        prepTime: 15,
        cookTime: 0,
        servings: 2,
        status: 'approved',
        image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80',
        ingredients: [
          { name: 'Cucumber', quantity: 1, unit: 'large' },
          { name: 'Tomatoes', quantity: 3, unit: 'medium' },
          { name: 'Feta Cheese', quantity: 100, unit: 'g' },
          { name: 'Kalamata Olives', quantity: 50, unit: 'g' },
        ],
        steps: [
          { description: 'Chop vegetables.', order: 1 },
          { description: 'Toss with olive oil and oregano.', order: 2 },
          { description: 'Top with feta and olives.', order: 3 },
        ],
        ratingSummary: { average: 4.5, count: 3 },
      },
      {
        owner: chefUser._id,
        chefProfile: chefProfile._id,
        title: 'Chocolate Lava Cake',
        description: 'Decadent chocolate cake with a molten center.',
        cuisine: 'French',
        categories: [dessertCat._id],
        prepTime: 15,
        cookTime: 12,
        servings: 4,
        status: 'approved',
        image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=1200&q=80',
        ingredients: [
          { name: 'Dark Chocolate', quantity: 100, unit: 'g' },
          { name: 'Butter', quantity: 100, unit: 'g' },
          { name: 'Eggs', quantity: 2, unit: 'large' },
          { name: 'Sugar', quantity: 100, unit: 'g' },
        ],
        steps: [
          { description: 'Melt chocolate and butter.', order: 1 },
          { description: 'Whisk eggs and sugar.', order: 2 },
          { description: 'Combine and bake.', order: 3 },
        ],
        ratingSummary: { average: 4.9, count: 15 },
      },
      {
        owner: chefUser._id,
        chefProfile: chefProfile._id,
        title: 'Pad Thai',
        description: 'Stir-fried rice noodle dish commonly served as street food in Thailand.',
        cuisine: 'Asian',
        categories: [asianCat._id, dinnerCat._id],
        prepTime: 20,
        cookTime: 15,
        servings: 2,
        status: 'approved',
        image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=1200&q=80',
        ingredients: [
          { name: 'Rice Noodles', quantity: 200, unit: 'g' },
          { name: 'Shrimp', quantity: 150, unit: 'g' },
          { name: 'Peanuts', quantity: 50, unit: 'g' },
          { name: 'Bean Sprouts', quantity: 100, unit: 'g' },
        ],
        steps: [
          { description: 'Soak noodles.', order: 1 },
          { description: 'Stir fry shrimp and tofu.', order: 2 },
          { description: 'Add noodles and sauce.', order: 3 },
        ],
        ratingSummary: { average: 4.7, count: 9 },
      }
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
