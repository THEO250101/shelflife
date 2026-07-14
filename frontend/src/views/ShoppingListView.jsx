import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { api } from '../api/client.js';
import './ShoppingListView.css';

const emptyForm = {
  name: '',
  category: 'Produce',
  quantity: 1,
  unit: 'item',
  checked: false,
  reason: '',
};

export default function ShoppingListView() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState('');

  async function load() {
    try {
      const data = await api.list('shopping-list-items');
      const sorted = [...data.items].sort((a, b) => a.checked - b.checked);
      setItems(sorted);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateForm(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : name === 'quantity' ? Number(value) : value,
    }));
  }

  function editItem(item) {
    setEditingId(item._id);
    setForm({
      name: item.name || '',
      category: item.category || 'Produce',
      quantity: item.quantity || 1,
      unit: item.unit || 'item',
      checked: Boolean(item.checked),
      reason: item.reason || '',
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
        await api.update('shopping-list-items', editingId, form);
      } else {
        await api.create('shopping-list-items', form);
      }
      setEditingId('');
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleItem(item) {
    try {
      await api.update('shopping-list-items', item._id, { ...item, checked: !item.checked });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteItem(id) {
    try {
      await api.remove('shopping-list-items', id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const openCount = items.filter((i) => !i.checked).length;
  const boughtCount = items.filter((i) => i.checked).length;

  return (
    <section>
      <PageHeader
        kicker="Shopping"
        title="Grocery gaps and restocks"
        image="/images/market-produce.jpg"
        imageAlt="Colorful produce at a market"
      >
        Track items to buy. Toggle bought, or add missing ingredients from recipes.
      </PageHeader>

      <ErrorBanner message={error} />

      <div className="grid-two">
        {/* List */}
        <section className="surface-panel list-panel">
          <div className="list-summary">
            <span>
              <strong>{openCount}</strong> to buy &middot; <strong>{boughtCount}</strong> bought
            </span>
            <span>{editingId ? 'Editing item...' : 'Click an item to toggle'}</span>
          </div>
          <div className="item-list">
            {items.length ? (
              items.map((item) => (
                <article
                  className={`item-row shop-item-row ${item.checked ? 'shop-item-row--bought' : ''}`}
                  key={item._id}
                >
                  <div>
                    <h3 className={item.checked ? 'shop-item-name--done' : ''}>{item.name}</h3>
                    <p>
                      {item.quantity} {item.unit} &middot; {item.category}
                      {item.reason ? ` · ${item.reason}` : ''}
                    </p>
                  </div>
                  <div className="row-actions">
                    <button
                      type="button"
                      className={item.checked ? 'secondary-button' : 'primary-button'}
                      onClick={() => toggleItem(item)}
                    >
                      {item.checked ? '↩ Open' : '✓ Bought'}
                    </button>
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
              <EmptyState emoji="&#x1F6D2;" title="Shopping list is empty">
                Add items manually or generate missing ingredients from recipes.
              </EmptyState>
            )}
          </div>
        </section>

        {/* Form */}
        <form className="surface-panel form-panel" onSubmit={saveItem}>
          <h2>{editingId ? 'Edit item' : 'Add item'}</h2>
          <div className="field-grid">
            <div className="form-field">
              <label htmlFor="name">Name *</label>
              <input id="name" name="name" value={form.name} onChange={updateForm} required />
            </div>
            <div className="form-field">
              <label htmlFor="category">Category</label>
              <input id="category" name="category" value={form.category} onChange={updateForm} />
            </div>
            <div className="form-field">
              <label htmlFor="quantity">Quantity</label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                step="0.25"
                value={form.quantity}
                onChange={updateForm}
              />
            </div>
            <div className="form-field">
              <label htmlFor="unit">Unit</label>
              <input id="unit" name="unit" value={form.unit} onChange={updateForm} />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="reason">Reason</label>
            <textarea
              id="reason"
              name="reason"
              value={form.reason}
              onChange={updateForm}
              rows="2"
              placeholder="e.g. Missing from a matched recipe"
            />
          </div>
          <label className="checkbox-row">
            <input name="checked" type="checkbox" checked={form.checked} onChange={updateForm} />
            Already bought
          </label>
          <div className="form-actions">
            <button type="submit" className="primary-button">
              {editingId ? 'Save changes' : 'Add to list'}
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

ShoppingListView.propTypes = {};
