import { createCrudRouter } from './crudRouter.js';
import { validateMealPlan } from './validators.js';

export default createCrudRouter({
  collectionName: 'mealPlans',
  allowedFields: ['plannedDate', 'mealSlot', 'recipeId', 'title', 'notes', 'status'],
  filters: ['status', 'mealSlot'],
  sort: { plannedDate: 1 },
  validate: validateMealPlan,
});
