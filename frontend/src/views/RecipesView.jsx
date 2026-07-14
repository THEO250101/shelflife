import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { api } from '../api/client.js';
import './RecipesView.css';

const emptyForm = {
  title: '',
  ingredients: '',
  tags: '',
  cookTimeMinutes: 25,
  difficulty: 'Easy',
  instructions: '',
  notes: '',
};

function parseList(value) {
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function RecipesView() {
  const [recipes, setRecipes] = useState([]);
  const [total, setTotal] = useState(0);
  const [matches, setMatches] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function load() {
    try {
      const [recipeData, matchData] = await Promise.all([api.list('recipes'), api.recipeMatches()]);
      setRecipes(recipeData.items);
      setTotal(recipeData.total || recipeData.items.length);
      setMatches(matchData.items);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === 'cookTimeMinutes' ? Number(value) : value,
    }));
  }

  function editRecipe(recipe) {
    setEditingId(recipe._id);
    setForm({
      title: recipe.title || '',
      ingredients: (recipe.ingredients || []).join(', '),
      tags: (recipe.tags || []).join(', '),
      cookTimeMinutes: recipe.cookTimeMinutes || 25,
      difficulty: recipe.difficulty || 'Easy',
      instructions: (recipe.instructions || []).join('\n'),
      notes: recipe.notes || '',
    });
  }

  function cancelEdit() {
    setEditingId('');
    setForm(emptyForm);
  }

  async function saveRecipe(event) {
    event.preventDefault();
    const body = {
      ...form,
      ingredients: parseList(form.ingredients),
      tags: parseList(form.tags),
      instructions: String(form.instructions)
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    };
    try {
      if (editingId) {
        await api.update('recipes', editingId, body);
      } else {
        await api.create('recipes', body);
      }
      setForm(emptyForm);
      setEditingId('');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteRecipe(id) {
    try {
      await api.remove('recipes', id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function addMissing(recipe) {
    try {
      const data = await api.addMissingIngredients(recipe._id);
      setNotice(`Added ${data.added} missing ingredients to shopping list.`);
      window.setTimeout(() => setNotice(''), 4000);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <PageHeader
        kicker="Recipes"
        title="Recipe library and pantry matches"
        image="/images/dinner-plate.jpg"
        imageAlt="Pasta with tomatoes and greens"
      >
        Recipes ranked by what you already have. Add missing items to the shopping list.
      </PageHeader>

      <ErrorBanner message={error || notice} />

      <div className="grid-two">
        {/* List */}
        <section className="surface-panel list-panel">
          <h2>&#x1F373; Best matches</h2>
          <div className="recipe-match-grid">
            {matches.length ? (
              matches.slice(0, 6).map((recipe) => (
                <article className="recipe-match-card" key={recipe._id}>
                  <div className="match-score-badge">
                    <strong>{recipe.matchScore}%</strong>
                    <span>match</span>
                  </div>
                  <div>
                    <h3>{recipe.title}</h3>
                    <p>
                      Have {recipe.availableCount} &middot; Missing {recipe.missingCount}
                    </p>
                    <div className="match-ingredients">
                      {(recipe.available || []).slice(0, 3).map((ing) => (
                        <span key={ing}>{ing}</span>
                      ))}
                      {recipe.missingCount > 0 ? (
                        <span className="match-ingredient--missing">
                          +{recipe.missingCount} missing
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => addMissing(recipe)}
                    disabled={recipe.missingCount === 0}
                  >
                    {recipe.missingCount === 0 ? 'Complete' : 'Add missing'}
                  </button>
                </article>
              ))
            ) : (
              <EmptyState emoji="&#x1F373;" title="No recipe matches yet">
                Add pantry items and recipes to compare ingredients.
              </EmptyState>
            )}
          </div>

          <h2>&#x1F4D6; Recipe library</h2>
          <div className="list-summary">
            <span>
              <strong>{recipes.length}</strong> recipes
              {total > recipes.length ? ` of ${total}` : ''}
            </span>
            <span>{editingId ? 'Editing recipe...' : 'Select a recipe to edit'}</span>
          </div>
          <div className="item-list">
            {recipes.map((recipe) => (
              <article className="item-row" key={recipe._id}>
                <div>
                  <h3>{recipe.title}</h3>
                  <p>
                    {(recipe.ingredients || []).join(', ')} &middot; {recipe.cookTimeMinutes} min
                    &middot; {recipe.difficulty}
                  </p>
                </div>
                <div className="row-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => editRecipe(recipe)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => deleteRecipe(recipe._id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Form */}
        <form className="surface-panel form-panel" onSubmit={saveRecipe}>
          <h2>{editingId ? 'Edit recipe' : 'New recipe'}</h2>
          <div className="form-field">
            <label htmlFor="title">Title *</label>
            <input id="title" name="title" value={form.title} onChange={updateForm} required />
          </div>
          <div className="form-field">
            <label htmlFor="ingredients">Ingredients (comma-separated) *</label>
            <textarea
              id="ingredients"
              name="ingredients"
              value={form.ingredients}
              onChange={updateForm}
              rows="3"
              required
            />
          </div>
          <div className="field-grid">
            <div className="form-field">
              <label htmlFor="cookTimeMinutes">Cook time (min)</label>
              <input
                id="cookTimeMinutes"
                name="cookTimeMinutes"
                type="number"
                value={form.cookTimeMinutes}
                onChange={updateForm}
              />
            </div>
            <div className="form-field">
              <label htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                name="difficulty"
                value={form.difficulty}
                onChange={updateForm}
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Weekend</option>
              </select>
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input id="tags" name="tags" value={form.tags} onChange={updateForm} />
          </div>
          <div className="form-field">
            <label htmlFor="instructions">Instructions (one per line)</label>
            <textarea
              id="instructions"
              name="instructions"
              value={form.instructions}
              onChange={updateForm}
              rows="4"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="primary-button">
              {editingId ? 'Save changes' : 'Add recipe'}
            </button>
            {editingId ? (
              <button type="button" className="secondary-button" onClick={cancelEdit}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  );
}

RecipesView.propTypes = {};
