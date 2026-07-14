import { createCrudRouter } from './crudRouter.js';
import { validateShoppingListItem } from './validators.js';

export default createCrudRouter({
  collectionName: 'shoppingListItems',
  allowedFields: ['name', 'category', 'quantity', 'unit', 'checked', 'reason'],
  filters: ['category', 'checked'],
  sort: { checked: 1, category: 1, name: 1 },
  validate: validateShoppingListItem,
});
