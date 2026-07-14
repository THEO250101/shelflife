import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { api } from '../api/client.js';
import './MealPlanView.css';

const emptyForm = {
  plannedDate: new Date().toISOString().slice(0, 10),
  mealSlot: 'Dinner',
  recipeId: '',
  title: '',
  notes: '',
  status: 'Planned',
};

export default function MealPlanView() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState('');

  async function load() {
    try {
      const data = await api.list('meal-plans');
      setItems(data.items);
      setTotal(data.total || data.items.length);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateForm(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function editItem(item) {
    setEditingId(item._id);
    setForm({
      plannedDate: item.plannedDate || emptyForm.plannedDate,
      mealSlot: item.mealSlot || 'Dinner',
      recipeId: item.recipeId || '',
      title: item.title || '',
      notes: item.notes || '',
      status: item.status || 'Planned',
    });
  }

  function cancelEdit() {
    setEditingId('');
    setForm(emptyForm);
  }

  async function saveItem(event) {
    event.preventDefault();
    try {
      if (editingId) {
        await api.update('meal-plans', editingId, form);
      } else {
        await api.create('meal-plans', form);
      }
      setEditingId('');
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteItem(id) {
    try {
      await api.remove('meal-plans', id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <PageHeader
        kicker="Meal plan"
        title="Scheduled meals at a glance"
        image="/images/kitchen-counter.jpg"
        imageAlt="A person cooking at a kitchen counter"
      >
        Plan your week with meals linked to pantry ingredients.
      </PageHeader>

      <ErrorBanner message={error} />

      <div className="grid-two">
        {/* List */}
        <section className="surface-panel list-panel">
          <div className="list-summary">
            <span>
              <strong>{items.length}</strong> planned meals
              {total > items.length ? ` of ${total}` : ''}
            </span>
            <span>{editingId ? 'Editing...' : 'Select a meal to edit'}</span>
          </div>
          <div className="item-list">
            {items.length ? (
              items.map((item) => (
                <article className="item-row" key={item._id}>
                  <div>
                    <h3>{item.title}</h3>
                    <p>
                      <span className="meal-plan-date">{item.plannedDate}</span>
                      &nbsp;&middot;&nbsp;
                      <span className="meal-plan-slot">{item.mealSlot}</span>
                      {item.notes ? <>&nbsp;&middot;&nbsp;{item.notes}</> : ''}
                    </p>
                  </div>
                  <div className="row-actions">
                    <StatusBadge status={item.status} />
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => editItem(item)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => deleteItem(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState emoji="&#x1F4C5;" title="No meals planned yet">
                Plan your meals for the week and connect them to pantry decisions.
              </EmptyState>
            )}
          </div>
        </section>

        {/* Form */}
        <form className="surface-panel form-panel" onSubmit={saveItem}>
          <h2>{editingId ? 'Edit meal' : 'Plan a meal'}</h2>
          <div className="field-grid">
            <div className="form-field">
              <label htmlFor="plannedDate">Date</label>
              <input
                id="plannedDate"
                name="plannedDate"
                type="date"
                value={form.plannedDate}
                onChange={updateForm}
              />
            </div>
            <div className="form-field">
              <label htmlFor="mealSlot">Meal slot</label>
              <select id="mealSlot" name="mealSlot" value={form.mealSlot} onChange={updateForm}>
                <option>Breakfast</option>
                <option>Lunch</option>
                <option>Dinner</option>
                <option>Prep</option>
              </select>
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="title">Title *</label>
            <input id="title" name="title" value={form.title} onChange={updateForm} required />
          </div>
          <div className="form-field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={form.status} onChange={updateForm}>
              <option>Planned</option>
              <option>Cooked</option>
              <option>Skipped</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" value={form.notes} onChange={updateForm} rows="2" />
          </div>
          <div className="form-actions">
            <button type="submit" className="primary-button">
              {editingId ? 'Save changes' : 'Add meal'}
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

MealPlanView.propTypes = {};
