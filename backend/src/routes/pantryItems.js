import { createCrudRouter } from './crudRouter.js';
import { validatePantryItem } from './validators.js';

export default createCrudRouter({
  collectionName: 'pantryItems',
  allowedFields: [
    'name',
    'category',
    'quantity',
    'unit',
    'location',
    'purchaseDate',
    'expirationDate',
    'status',
    'notes',
  ],
  filters: ['category', 'location', 'status'],
  sort: { expirationDate: 1, name: 1 },
  validate: validatePantryItem,
});
