import express from 'express';
import { collection } from '../db/mongo.js';

const router = express.Router();

function daysUntil(dateValue) {
  const target = new Date(dateValue);
  const today = new Date();
  const diff = target.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function countBy(items, field) {
  return items.reduce((counts, item) => {
    const key = item[field] || 'Unsorted';
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

router.get('/', async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [pantryItems, recipes, shoppingItems, rescueLogs, mealPlans] = await Promise.all([
      collection('pantryItems').find({ userId }).toArray(),
      collection('recipes').find({ userId }).toArray(),
      collection('shoppingListItems').find({ userId }).toArray(),
      collection('rescueLogs').find({ userId }).toArray(),
      collection('mealPlans').find({ userId }).toArray(),
    ]);

    const useSoon = pantryItems.filter((item) => {
      const days = daysUntil(item.expirationDate);
      return days >= 0 && days <= 5 && item.status !== 'Rescued';
    });
    const expired = pantryItems.filter((item) => daysUntil(item.expirationDate) < 0);
    const openShopping = shoppingItems.filter((item) => !item.checked);
    const savedLogs = rescueLogs.filter((log) => log.action === 'Rescued' || log.action === 'Used');
    const rescuedThisMonth = rescueLogs.filter((log) => {
      const date = new Date(log.rescuedAt);
      const now = new Date();
      return (
        log.action === 'Rescued' &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });

    const savedValue = savedLogs.reduce(
      (sum, log) => sum + Number(log.estimatedSavedValue || 0),
      0
    );

    res.json({
      totals: {
        pantryItems: pantryItems.length,
        recipes: recipes.length,
        openShoppingItems: openShopping.length,
        plannedMeals: mealPlans.length,
        rescuedThisMonth: rescuedThisMonth.length,
        savedValue: Number(savedValue.toFixed(2)),
        useSoon: useSoon.length,
        expired: expired.length,
      },
      locationCounts: countBy(pantryItems, 'location'),
      categoryCounts: countBy(pantryItems, 'category'),
      useSoon: useSoon
        .sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate))
        .slice(0, 8)
        .map((item) => ({
          _id: item._id.toString(),
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          location: item.location,
          expirationDate: item.expirationDate,
          daysLeft: daysUntil(item.expirationDate),
        })),
      recentRescues: savedLogs
        .sort((a, b) => new Date(b.rescuedAt) - new Date(a.rescuedAt))
        .slice(0, 5)
        .map((log) => ({
          _id: log._id.toString(),
          pantryItemName: log.pantryItemName,
          action: log.action,
          recipeTitle: log.recipeTitle,
          estimatedSavedValue: log.estimatedSavedValue,
          rescuedAt: log.rescuedAt,
        })),
      shoppingPreview: openShopping.slice(0, 5).map((item) => ({
        _id: item._id.toString(),
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        reason: item.reason,
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
