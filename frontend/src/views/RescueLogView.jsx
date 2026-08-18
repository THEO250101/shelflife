import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { api } from '../api/client.js';
import './RescueLogView.css';

const emptyForm = {
  pantryItemName: '',
  action: 'Rescued',
  recipeTitle: '',
  estimatedSavedValue: 3,
  rescuedAt: new Date().toISOString().slice(0, 10),
  notes: '',
};

export default function RescueLogView() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const data = await api.list('rescue-logs');
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
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === 'estimatedSavedValue' ? Number(value) : value,
    }));
  }

  function editItem(item) {
    setEditingId(item._id);
    setForm({
      pantryItemName: item.pantryItemName || '',
      action: item.action || 'Rescued',
      recipeTitle: item.recipeTitle || '',
      estimatedSavedValue: item.estimatedSavedValue || 0,
      rescuedAt: item.rescuedAt || emptyForm.rescuedAt,
      notes: item.notes || '',
    });
  }

  function cancelEdit() {
    setEditingId('');
    setForm(emptyForm);
  }

  async function saveItem(event) {
    event.preventDefault();
    if (submitting) {
      return;
    }
    const action = editingId ? 'updated' : 'added';
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      if (editingId) {
        await api.update('rescue-logs', editingId, form);
      } else {
        await api.create('rescue-logs', form);
      }
      setEditingId('');
      setForm(emptyForm);
      await load();
      setNotice(`Rescue log ${action}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteItem(item) {
    if (
      !window.confirm(`Delete this rescue log for ${item.pantryItemName}? This can't be undone.`)
    ) {
      return;
    }
    try {
      await api.remove('rescue-logs', item._id);
      await load();
      setNotice('Rescue log deleted.');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <PageHeader
        kicker="Rescue log"
        title="Your food rescue history"
        image="/images/cooking-prep.jpg"
        imageAlt="People cooking together in a kitchen"
      >
        Record rescued, used, or discarded food with dollar value and meal context.
      </PageHeader>

      <ErrorBanner message={error} />
      <ErrorBanner message={notice} tone="success" />

      <div className="grid-two">
        {/* List */}
        <section className="surface-panel list-panel" aria-label="Rescue log history">
          <div className="list-summary">
            <span>
              <strong>{items.length}</strong> rescue logs
              {total > items.length ? ` of ${total}` : ''}
            </span>
            <span>{editingId ? 'Editing log...' : 'Select to edit'}</span>
          </div>
          <ul className="item-list">
            {items.length ? (
              items.map((item) => (
                <li className="item-row" key={item._id}>
                  <div>
                    <h3>{item.pantryItemName}</h3>
                    <p>
                      <span className="rescue-date">{item.rescuedAt}</span>
                      &nbsp;&middot;&nbsp;
                      {item.recipeTitle ? (
                        <span className="rescue-recipe-ref">{item.recipeTitle}</span>
                      ) : (
                        'No recipe linked'
                      )}
                      &nbsp;&middot;&nbsp;
                      <span className="rescue-value">
                        $ {Number(item.estimatedSavedValue || 0).toFixed(2)} saved
                      </span>
                    </p>
                  </div>
                  <div className="row-actions">
                    <StatusBadge status={item.action} />
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => editItem(item)}
                      aria-label={`Edit rescue log for ${item.pantryItemName}`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => deleteItem(item)}
                      aria-label={`Delete rescue log for ${item.pantryItemName}`}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <li>
                <EmptyState emoji="&#x1F3F7;&#xFE0F;" title="No rescue history yet">
                  Log rescued items to see your impact on the dashboard.
                </EmptyState>
              </li>
            )}
          </ul>
        </section>

        {/* Form */}
        <form className="surface-panel form-panel" onSubmit={saveItem} aria-busy={submitting}>
          <h2>{editingId ? 'Edit log' : 'Record rescue'}</h2>
          <div className="field-grid">
            <div className="form-field">
              <label htmlFor="pantryItemName">Item name *</label>
              <input
                id="pantryItemName"
                name="pantryItemName"
                value={form.pantryItemName}
                onChange={updateForm}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="action">Action</label>
              <select id="action" name="action" value={form.action} onChange={updateForm}>
                <option>Rescued</option>
                <option>Used</option>
                <option>Discarded</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="estimatedSavedValue">Saved value ($)</label>
              <input
                id="estimatedSavedValue"
                name="estimatedSavedValue"
                type="number"
                min="0"
                step="0.25"
                value={form.estimatedSavedValue}
                onChange={updateForm}
              />
            </div>
            <div className="form-field">
              <label htmlFor="rescuedAt">Date</label>
              <input
                id="rescuedAt"
                name="rescuedAt"
                type="date"
                value={form.rescuedAt}
                onChange={updateForm}
              />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="recipeTitle">Meal or recipe</label>
            <input
              id="recipeTitle"
              name="recipeTitle"
              value={form.recipeTitle}
              onChange={updateForm}
            />
          </div>
          <div className="form-field">
            <label htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" value={form.notes} onChange={updateForm} rows="2" />
          </div>
          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? 'Saving...' : editingId ? 'Save changes' : 'Record rescue'}
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

RescueLogView.propTypes = {};
