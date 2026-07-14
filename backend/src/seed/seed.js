import dotenv from 'dotenv';
import { closeDb, collection, connectDb } from '../db/mongo.js';
import { hashPassword } from '../middleware/auth.js';
import { dataSources, pantryCatalog, recipeTemplates } from './realFoodCatalog.js';

dotenv.config();

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function pick(list, index) {
  return list[index % list.length];
}

function sourceLabel() {
  return dataSources.map((source) => source.name).join(' + ');
}

function statusForExpiration(days) {
  if (days < 0) {
    return 'Expired';
  }
  if (days <= 5) {
    return 'Use Soon';
  }
  return 'Fresh';
}

function makePantryItems(userId, count = 520) {
  return Array.from({ length: count }, (_, index) => {
    const ingredient = pick(pantryCatalog, index);
    const shelfLife = ingredient.storageDays;
    const perishableWindow = shelfLife <= 35 ? shelfLife + 9 : Math.min(shelfLife, 120);
    const age = index % perishableWindow;
    const days = shelfLife - age;
    const quantity = Number((((index % 5) + 1) * (ingredient.unit === 'lb' ? 0.75 : 1)).toFixed(2));
    const use = pick(ingredient.uses, index);
    return {
      userId,
      name: ingredient.name,
      category: ingredient.category,
      quantity,
      unit: ingredient.unit,
      location: ingredient.location,
      purchaseDate: addDays(-age),
      expirationDate: addDays(days),
      status: statusForExpiration(days),
      storageDays: shelfLife,
      estimatedUnitValue: ingredient.value,
      dataSource: sourceLabel(),
      notes:
        days <= 5
          ? `Use soon: best for ${use}. Storage window modeled from public food-safety guidance.`
          : `Common use: ${use}. Estimated value is kept for rescue tracking.`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
}

function makeRecipes(userId, count = 180) {
  return Array.from({ length: count }, (_, index) => {
    const template = pick(recipeTemplates, index);
    const batch = Math.floor(index / recipeTemplates.length);
    const title = batch === 0 ? template.title : `${template.title} ${batch + 1}`;
    return {
      userId,
      title,
      ingredients: template.ingredients,
      tags: template.tags,
      cookTimeMinutes: template.cookTimeMinutes + (batch % 3) * 2,
      difficulty: template.difficulty,
      instructions: [
        'Open ShelfLife and sort pantry items by expiration date.',
        `Pull the oldest ${template.ingredients.slice(0, 2).join(' and ')} first.`,
        'Cook, taste, and log any rescued ingredient back into the rescue log.',
      ],
      notes: `Recipe assembled from realistic pantry ingredients. Source context: ${sourceLabel()}.`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
}

function makeShoppingListItems(userId, count = 160) {
  const reasons = [
    'Restock after meal planning',
    'Missing from a matched recipe',
    'Price looks good this week',
    'Backup for a use-soon rescue meal',
  ];
  return Array.from({ length: count }, (_, index) => {
    const ingredient = pick(pantryCatalog, index + 7);
    return {
      userId,
      name: ingredient.name,
      category: ingredient.category,
      quantity: (index % 3) + 1,
      unit: ingredient.unit,
      checked: index % 5 === 0,
      reason: pick(reasons, index),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
}

function makeMealPlans(userId, count = 120) {
  return Array.from({ length: count }, (_, index) => {
    const recipe = pick(recipeTemplates, index + 3);
    const leadIngredient = pick(recipe.ingredients, index);
    return {
      userId,
      plannedDate: addDays(index % 21),
      mealSlot: pick(['Breakfast', 'Lunch', 'Dinner', 'Prep'], index),
      title: recipe.title,
      recipeId: '',
      notes:
        index % 4 === 0
          ? `Use ${leadIngredient} before buying more.`
          : `Meal uses ${recipe.ingredients.slice(0, 3).join(', ')}.`,
      status: pick(['Planned', 'Cooked', 'Skipped'], index),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
}

function makeRescueLogs(userId, count = 140) {
  return Array.from({ length: count }, (_, index) => {
    const ingredient = pick(pantryCatalog, index + 11);
    const recipe = pick(recipeTemplates, index + 2);
    const action = pick(['Rescued', 'Used', 'Discarded'], index);
    const savedValue =
      action === 'Discarded'
        ? 0
        : Number((ingredient.value * (0.45 + (index % 4) * 0.15)).toFixed(2));
    return {
      userId,
      pantryItemName: ingredient.name,
      action,
      recipeTitle: recipe.title,
      estimatedSavedValue: savedValue,
      rescuedAt: addDays(-(index % 60)),
      notes:
        action === 'Discarded'
          ? 'Logged honestly so the dashboard does not count it as saved value.'
          : `Moved into ${recipe.title} before the storage window closed.`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
}

async function resetDemoUser() {
  const existingDemo = await collection('users').findOne({ username: 'demo' });
  if (!existingDemo) {
    return;
  }

  const demoIds = [existingDemo._id, existingDemo._id.toString()];
  await Promise.all([
    collection('pantryItems').deleteMany({ userId: { $in: demoIds } }),
    collection('recipes').deleteMany({ userId: { $in: demoIds } }),
    collection('shoppingListItems').deleteMany({ userId: { $in: demoIds } }),
    collection('mealPlans').deleteMany({ userId: { $in: demoIds } }),
    collection('rescueLogs').deleteMany({ userId: { $in: demoIds } }),
    collection('users').deleteOne({ _id: existingDemo._id }),
  ]);
}

import { fileURLToPath } from 'node:url';
import path from 'node:path';

export async function seed(shouldConnect = true) {
  if (shouldConnect) {
    await connectDb();
  }

  await resetDemoUser();

  const { salt, hash } = hashPassword('shelflife');
  const userResult = await collection('users').insertOne({
    username: 'demo',
    displayName: 'Demo Cook',
    salt,
    passwordHash: hash,
    createdAt: new Date(),
  });
  const userId = userResult.insertedId.toString();

  const docs = {
    pantryItems: makePantryItems(userId),
    recipes: makeRecipes(userId),
    shoppingListItems: makeShoppingListItems(userId),
    mealPlans: makeMealPlans(userId),
    rescueLogs: makeRescueLogs(userId),
  };

  await Promise.all(
    Object.entries(docs).map(([name, items]) => collection(name).insertMany(items))
  );

  const total = Object.values(docs).reduce((sum, items) => sum + items.length, 0);
  console.log(`Seeded ShelfLife demo user and ${total} records.`);
  console.log(`Seed data source context: ${sourceLabel()}.`);
  console.log('Demo login: demo / shelflife');
  return total;
}

const __filename = fileURLToPath(import.meta.url);
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectRun) {
  seed(true)
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(async () => {
      await closeDb();
    });
}

