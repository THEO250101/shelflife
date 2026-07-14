import express from 'express';
import { collection, serializeDoc, toObjectId } from '../db/mongo.js';
import { createCrudRouter } from './crudRouter.js';
import { validateRecipe } from './validators.js';

const router = express.Router();
const crud = createCrudRouter({
  collectionName: 'recipes',
  allowedFields: [
    'title',
    'ingredients',
    'tags',
    'cookTimeMinutes',
    'difficulty',
    'instructions',
    'notes',
  ],
  filters: ['difficulty'],
  sort: { title: 1 },
  validate: validateRecipe,
});

router.get('/matches', async (req, res, next) => {
  try {
    const pantryItems = await collection('pantryItems')
      .find({ userId: req.user._id, status: { $ne: 'Expired' } })
      .toArray();
    const owned = new Set(pantryItems.map((item) => String(item.name).toLowerCase()));

    const recipes = await collection('recipes')
      .find({ userId: req.user._id })
      .sort({ title: 1 })
      .toArray();
    const matches = recipes.map((recipe) => {
      const ingredients = recipe.ingredients || [];
      const available = ingredients.filter((ingredient) =>
        owned.has(String(ingredient).toLowerCase())
      );
      const missing = ingredients.filter(
        (ingredient) => !owned.has(String(ingredient).toLowerCase())
      );
      return {
        ...serializeDoc(recipe),
        availableCount: available.length,
        missingCount: missing.length,
        available,
        missing,
        matchScore: ingredients.length
          ? Math.round((available.length / ingredients.length) * 100)
          : 0,
      };
    });

    matches.sort((a, b) => b.matchScore - a.matchScore || a.missingCount - b.missingCount);
    res.json({ items: matches.slice(0, 24) });
  } catch (err) {
    next(err);
  }
});

router.use(crud);

router.post('/:id/add-missing-to-shopping-list', async (req, res, next) => {
  try {
    const recipe = await collection('recipes').findOne({
      _id: toObjectId(req.params.id),
      userId: req.user._id,
    });
    if (!recipe) {
      res.status(404).json({ error: 'Recipe not found' });
      return;
    }

    const pantryItems = await collection('pantryItems').find({ userId: req.user._id }).toArray();
    const owned = new Set(pantryItems.map((item) => String(item.name).toLowerCase()));
    const missing = [
      ...new Set(
        (recipe.ingredients || []).filter((name) => !owned.has(String(name).toLowerCase()))
      ),
    ];
    const reason = `Needed for ${recipe.title}`;
    const existingItems = await collection('shoppingListItems')
      .find({
        userId: req.user._id,
        checked: false,
        reason,
        name: { $in: missing },
      })
      .toArray();
    const existing = new Set(existingItems.map((item) => String(item.name).toLowerCase()));
    const docs = missing
      .filter((name) => !existing.has(String(name).toLowerCase()))
      .map((name) => ({
        name,
        category: 'Recipe missing',
        quantity: 1,
        unit: 'item',
        checked: false,
        reason,
        userId: req.user._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

    if (docs.length > 0) {
      await collection('shoppingListItems').insertMany(docs);
    }
    res.status(201).json({ added: docs.length });
  } catch (err) {
    next(err);
  }
});

export default router;
