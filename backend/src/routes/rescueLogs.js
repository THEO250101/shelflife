import { createCrudRouter } from './crudRouter.js';
import { validateRescueLog } from './validators.js';

export default createCrudRouter({
  collectionName: 'rescueLogs',
  allowedFields: [
    'pantryItemName',
    'action',
    'recipeTitle',
    'estimatedSavedValue',
    'rescuedAt',
    'notes',
  ],
  filters: ['action'],
  sort: { rescuedAt: -1 },
  validate: validateRescueLog,
});
