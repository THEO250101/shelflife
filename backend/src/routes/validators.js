const PANTRY_CATEGORIES = [
  'Produce',
  'Dairy',
  'Grains',
  'Protein',
  'Frozen',
  'Canned',
  'Spices',
  'Bakery',
  'Condiments',
];
const LOCATIONS = ['Fridge', 'Freezer', 'Pantry', 'Counter'];
const PANTRY_STATUSES = ['Fresh', 'Use Soon', 'Expired', 'Rescued'];
const DIFFICULTIES = ['Easy', 'Medium', 'Weekend'];
const MEAL_SLOTS = ['Breakfast', 'Lunch', 'Dinner', 'Prep'];
const MEAL_STATUSES = ['Planned', 'Cooked', 'Skipped'];
const RESCUE_ACTIONS = ['Rescued', 'Used', 'Discarded'];

function fail(message) {
  const err = new Error(message);
  err.status = 400;
  throw err;
}

function hasField(doc, field) {
  return Object.prototype.hasOwnProperty.call(doc, field);
}

function requireText(doc, field, label, { partial = false, max = 160 } = {}) {
  if (!hasField(doc, field)) {
    if (!partial) {
      fail(`${label} is required.`);
    }
    return;
  }
  const value = String(doc[field] || '').trim();
  if (!value) {
    fail(`${label} is required.`);
  }
  if (value.length > max) {
    fail(`${label} must be ${max} characters or fewer.`);
  }
  doc[field] = value;
}

function optionalText(doc, field, label, max = 500) {
  if (!hasField(doc, field)) {
    return;
  }
  const value = String(doc[field] || '').trim();
  if (value.length > max) {
    fail(`${label} must be ${max} characters or fewer.`);
  }
  doc[field] = value;
}

function numberField(doc, field, label, { min = 0, max = 10000 } = {}) {
  if (!hasField(doc, field)) {
    return;
  }
  const value = Number(doc[field]);
  if (!Number.isFinite(value) || value < min || value > max) {
    fail(`${label} must be a number from ${min} to ${max}.`);
  }
  doc[field] = value;
}

function booleanField(doc, field) {
  if (!hasField(doc, field)) {
    return;
  }
  if (doc[field] === 'true') {
    doc[field] = true;
    return;
  }
  if (doc[field] === 'false') {
    doc[field] = false;
    return;
  }
  doc[field] = Boolean(doc[field]);
}

function dateField(doc, field, label) {
  if (!hasField(doc, field) || doc[field] === '') {
    return;
  }
  const value = String(doc[field]);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(new Date(value).getTime())) {
    fail(`${label} must be a valid YYYY-MM-DD date.`);
  }
  doc[field] = value;
}

function oneOf(doc, field, label, values) {
  if (!hasField(doc, field) || doc[field] === '') {
    return;
  }
  if (!values.includes(doc[field])) {
    fail(`${label} must be one of: ${values.join(', ')}.`);
  }
}

function textArray(doc, field, label, { partial = false, maxItems = 20 } = {}) {
  if (!hasField(doc, field)) {
    if (!partial) {
      fail(`${label} is required.`);
    }
    return;
  }
  const values = Array.isArray(doc[field])
    ? doc[field]
    : String(doc[field] || '')
        .split(',')
        .map((item) => item.trim());
  const cleaned = [...new Set(values.map((item) => String(item).trim()).filter(Boolean))];
  if (!cleaned.length && !partial) {
    fail(`${label} is required.`);
  }
  if (cleaned.length > maxItems) {
    fail(`${label} must have ${maxItems} items or fewer.`);
  }
  doc[field] = cleaned;
}

export function validatePantryItem(input, { partial = false } = {}) {
  const doc = { ...input };
  requireText(doc, 'name', 'Name', { partial });
  optionalText(doc, 'category', 'Category', 80);
  optionalText(doc, 'unit', 'Unit', 40);
  optionalText(doc, 'location', 'Location', 80);
  optionalText(doc, 'notes', 'Notes');
  numberField(doc, 'quantity', 'Quantity', { min: 0, max: 1000 });
  dateField(doc, 'purchaseDate', 'Purchase date');
  dateField(doc, 'expirationDate', 'Expiration date');
  oneOf(doc, 'category', 'Category', PANTRY_CATEGORIES);
  oneOf(doc, 'location', 'Location', LOCATIONS);
  oneOf(doc, 'status', 'Status', PANTRY_STATUSES);
  return doc;
}

export function validateRecipe(input, { partial = false } = {}) {
  const doc = { ...input };
  requireText(doc, 'title', 'Title', { partial });
  textArray(doc, 'ingredients', 'Ingredients', { partial });
  textArray(doc, 'tags', 'Tags', { partial: true, maxItems: 10 });
  textArray(doc, 'instructions', 'Instructions', { partial: true, maxItems: 12 });
  optionalText(doc, 'notes', 'Notes');
  numberField(doc, 'cookTimeMinutes', 'Cook time', { min: 0, max: 600 });
  oneOf(doc, 'difficulty', 'Difficulty', DIFFICULTIES);
  return doc;
}

export function validateMealPlan(input, { partial = false } = {}) {
  const doc = { ...input };
  requireText(doc, 'title', 'Title', { partial });
  optionalText(doc, 'recipeId', 'Recipe id', 80);
  optionalText(doc, 'notes', 'Notes');
  dateField(doc, 'plannedDate', 'Planned date');
  oneOf(doc, 'mealSlot', 'Meal slot', MEAL_SLOTS);
  oneOf(doc, 'status', 'Status', MEAL_STATUSES);
  return doc;
}

export function validateShoppingListItem(input, { partial = false } = {}) {
  const doc = { ...input };
  requireText(doc, 'name', 'Name', { partial });
  optionalText(doc, 'category', 'Category', 80);
  optionalText(doc, 'unit', 'Unit', 40);
  optionalText(doc, 'reason', 'Reason');
  numberField(doc, 'quantity', 'Quantity', { min: 0, max: 1000 });
  booleanField(doc, 'checked');
  return doc;
}

export function validateRescueLog(input, { partial = false } = {}) {
  const doc = { ...input };
  requireText(doc, 'pantryItemName', 'Item name', { partial });
  optionalText(doc, 'recipeTitle', 'Meal or recipe', 160);
  optionalText(doc, 'notes', 'Notes');
  numberField(doc, 'estimatedSavedValue', 'Saved value', { min: 0, max: 10000 });
  dateField(doc, 'rescuedAt', 'Rescue date');
  oneOf(doc, 'action', 'Action', RESCUE_ACTIONS);
  return doc;
}
