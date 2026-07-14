async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export const api = {
  me: () => request('/api/auth/me'),
  login: (body) => request('/api/auth/login', { method: 'POST', body }),
  register: (body) => request('/api/auth/register', { method: 'POST', body }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  list: (resource, params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== '' && value !== undefined)
    );
    return request(`/api/${resource}${query.toString() ? `?${query}` : ''}`);
  },
  create: (resource, body) => request(`/api/${resource}`, { method: 'POST', body }),
  update: (resource, id, body) => request(`/api/${resource}/${id}`, { method: 'PUT', body }),
  remove: (resource, id) => request(`/api/${resource}/${id}`, { method: 'DELETE' }),
  stats: () => request('/api/stats'),
  recipeMatches: () => request('/api/recipes/matches'),
  addMissingIngredients: (id) =>
    request(`/api/recipes/${id}/add-missing-to-shopping-list`, { method: 'POST' }),
};
