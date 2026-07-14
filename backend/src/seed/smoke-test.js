const baseUrl = process.env.SMOKE_BASE_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.cookie ? { cookie: options.cookie } : {}),
      ...(options.headers || {}),
    },
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${path} failed: ${response.status} ${text}`);
  }

  return { response, data };
}

async function login() {
  const { response, data } = await request('/api/auth/login', {
    method: 'POST',
    body: { username: 'demo', password: 'shelflife' },
  });
  const cookie = response.headers.get('set-cookie');
  if (!cookie || !data.user) {
    throw new Error('Login did not return a session cookie and user.');
  }
  return cookie;
}

async function crudCycle(cookie, resource, body, update) {
  const created = await request(`/api/${resource}`, { method: 'POST', cookie, body });
  const id = created.data.item?._id;
  if (!id) {
    throw new Error(`${resource} create did not return an id.`);
  }

  const listed = await request(`/api/${resource}`, { cookie });
  if (!Array.isArray(listed.data.items)) {
    throw new Error(`${resource} list did not return items.`);
  }

  await request(`/api/${resource}/${id}`, { method: 'PUT', cookie, body: { ...body, ...update } });
  await request(`/api/${resource}/${id}`, { method: 'DELETE', cookie });
  return id;
}

async function run() {
  const health = await request('/api/health');
  if (!health.data.ok) {
    throw new Error('Health check failed.');
  }

  const cookie = await login();
  const stats = await request('/api/stats', { cookie });
  if (!stats.data.totals || stats.data.totals.pantryItems < 100) {
    throw new Error('Stats endpoint did not return seeded totals.');
  }

  await crudCycle(
    cookie,
    'pantry-items',
    {
      name: 'smoke basil',
      category: 'Produce',
      quantity: 1,
      unit: 'bunch',
      location: 'Fridge',
      purchaseDate: '2026-07-07',
      expirationDate: '2026-07-10',
      status: 'Use Soon',
      notes: 'Created by smoke test.',
    },
    { status: 'Rescued' }
  );

  await crudCycle(
    cookie,
    'recipes',
    {
      title: 'Smoke Test Pasta',
      ingredients: ['pasta', 'tomatoes', 'smoke basil'],
      tags: ['quick'],
      cookTimeMinutes: 20,
      difficulty: 'Easy',
      instructions: ['Boil pasta', 'Use what is fresh'],
      notes: 'Created by smoke test.',
    },
    { difficulty: 'Medium' }
  );

  const missingRecipe = await request('/api/recipes', {
    method: 'POST',
    cookie,
    body: {
      title: 'Smoke Missing Ingredient Check',
      ingredients: ['smoke dragonfruit', 'smoke pantry salt'],
      tags: ['smoke'],
      cookTimeMinutes: 10,
      difficulty: 'Easy',
      instructions: ['Check generated shopping items'],
      notes: 'Temporary smoke test recipe.',
    },
  });
  const missingRecipeId = missingRecipe.data.item._id;
  const addMissing = await request(`/api/recipes/${missingRecipeId}/add-missing-to-shopping-list`, {
    method: 'POST',
    cookie,
  });
  await request(`/api/recipes/${missingRecipeId}`, { method: 'DELETE', cookie });

  const generatedShoppingItems = await request('/api/shopping-list-items?q=smoke', { cookie });
  await Promise.all(
    generatedShoppingItems.data.items
      .filter((item) => item.reason === 'Needed for Smoke Missing Ingredient Check')
      .map((item) => request(`/api/shopping-list-items/${item._id}`, { method: 'DELETE', cookie }))
  );

  await crudCycle(
    cookie,
    'meal-plans',
    {
      plannedDate: '2026-07-08',
      mealSlot: 'Dinner',
      recipeId: '',
      title: 'Smoke test dinner',
      notes: 'Created by smoke test.',
      status: 'Planned',
    },
    { status: 'Cooked' }
  );

  await crudCycle(
    cookie,
    'shopping-list-items',
    {
      name: 'smoke lemons',
      category: 'Produce',
      quantity: 2,
      unit: 'pcs',
      checked: false,
      reason: 'Created by smoke test.',
    },
    { checked: true }
  );

  await crudCycle(
    cookie,
    'rescue-logs',
    {
      pantryItemName: 'smoke basil',
      action: 'Rescued',
      recipeTitle: 'Smoke Test Pasta',
      estimatedSavedValue: 3.25,
      rescuedAt: '2026-07-07',
      notes: 'Created by smoke test.',
    },
    { action: 'Used' }
  );

  const matches = await request('/api/recipes/matches', { cookie });
  if (!Array.isArray(matches.data.items)) {
    throw new Error('Recipe matches did not return items.');
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        baseUrl,
        seededPantryItems: stats.data.totals.pantryItems,
        recipeMatchesChecked: matches.data.items.length,
        missingIngredientsAdded: addMissing.data.added,
      },
      null,
      2
    )
  );
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
