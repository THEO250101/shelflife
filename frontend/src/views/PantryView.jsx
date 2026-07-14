import { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { api } from '../api/client.js';
import './PantryView.css';

const CATEGORIES = [
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
const STATUSES = ['Fresh', 'Use Soon', 'Expired', 'Rescued'];

const emptyForm = {
  name: '',
  category: 'Produce',
  quantity: 1,
  unit: 'pcs',
  location: 'Fridge',
  purchaseDate: new Date().toISOString().slice(0, 10),
  expirationDate: new Date().toISOString().slice(0, 10),
  status: 'Fresh',
  notes: '',
};

export default function PantryView() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [filters, setFilters] = useState({ q: '', status: '', category: '', location: '' });
  const [error, setError] = useState('');

  const filteredItems = useMemo(() => items, [items]);

  const loadItems = useCallback(
    async (nextFilters = filters) => {
      try {
        const data = await api.list('pantry-items', nextFilters);
        setItems(data.items);
        setTotal(data.total || data.items.length);
        setError('');
      } catch (err) {
        setError(err.message);
      }
    },
    [filters]
  );

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: name === 'quantity' ? Number(value) : value }));
  }

  function updateFilter(event) {
    const next = { ...filters, [event.target.name]: event.target.value };
    setFilters(next);
    loadItems(next);
  }

  function clearFilters() {
    const cleared = { q: '', status: '', category: '', location: '' };
    setFilters(cleared);
    loadItems(cleared);
  }

  function editItem(item) {
    setEditingId(item._id);
    setForm({
      name: item.name || '',
      category: item.category || 'Produce',
      quantity: item.quantity || 1,
      unit: item.unit || 'pcs',
      location: item.location || 'Fridge',
      purchaseDate: item.purchaseDate || new Date().toISOString().slice(0, 10),
      expirationDate: item.expirationDate || new Date().toISOString().slice(0, 10),
      status: item.status || 'Fresh',
      notes: item.notes || '',
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
        await api.update('pantry-items', editingId, form);
      } else {
        await api.create('pantry-items', form);
      }
      setForm(emptyForm);
      setEditingId('');
      await loadItems();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteItem(id) {
    try {
      await api.remove('pantry-items', id);
      await loadItems();
    } catch (err) {
      setError(err.message);
    }
  }

  const hasActiveFilters = filters.q || filters.status || filters.category || filters.location;

  return (
    <section>
      <PageHeader
        kicker="Pantry"
        title="Ingredients, dates, and locations"
        image="/images/grocery-bag.jpg"
        imageAlt="Fresh greens in a grocery case"
      >
        Search and maintain your pantry without leaving the list.
      </PageHeader>

      <ErrorBanner message={error} />

      <div className="grid-two">
        {/* List side */}
        <section className="surface-panel list-panel">
          <div className="toolbar">
            <input
              name="q"
              value={filters.q}
              onChange={updateFilter}
              placeholder="Search ingredients..."
              aria-label="Search pantry"
              className="search-input"
            />
            <select name="status" value={filters.status} onChange={updateFilter}>
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select name="location" value={filters.location} onChange={updateFilter}>
              <option value="">All locations</option>
              {LOCATIONS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
            {hasActiveFilters ? (
              <button type="button" className="secondary-button" onClick={clearFilters}>
                Clear filters
              </button>
            ) : null}
          </div>

          <div className="list-summary">
            <span>
              <strong>{filteredItems.length}</strong> items
              {total > filteredItems.length ? ` of ${total}` : ''}
            </span>
            <span>{editingId ? 'Editing item...' : 'Select an item to edit'}</span>
          </div>

          <div className="item-list">
            {filteredItems.length ? (
              filteredItems.map((item) => (
                <article
                  className={`item-row ${editingId === item._id ? 'item-row--active' : ''}`}
                  key={item._id}
                >
                  <div>
                    <h3>{item.name}</h3>
                    <p>
                      {item.quantity} {item.unit} &middot; {item.location} &middot; Expires{' '}
                      {item.expirationDate}
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
              <EmptyState emoji="&#x1F96C;" title="No pantry items found">
                Add a few ingredients or change the filters.
              </EmptyState>
            )}
          </div>
        </section>

        {/* Form side */}
        <form className="surface-panel form-panel" onSubmit={saveItem}>
          <h2>{editingId ? 'Edit ingredient' : 'Add ingredient'}</h2>
          <div className="field-grid">
            <div className="form-field">
              <label htmlFor="name">Name *</label>
              <input id="name" name="name" value={form.name} onChange={updateForm} required />
            </div>
            <div className="form-field">
              <label htmlFor="category">Category</label>
              <select id="category" name="category" value={form.category} onChange={updateForm}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
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
              <input
                id="unit"
                name="unit"
                value={form.unit}
                onChange={updateForm}
                placeholder="pcs, lb, bag..."
              />
            </div>
            <div className="form-field">
              <label htmlFor="location">Location</label>
              <select id="location" name="location" value={form.location} onChange={updateForm}>
                {LOCATIONS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={form.status} onChange={updateForm}>
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="purchaseDate">Purchased</label>
              <input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                value={form.purchaseDate}
                onChange={updateForm}
              />
            </div>
            <div className="form-field">
              <label htmlFor="expirationDate">Expires</label>
              <input
                id="expirationDate"
                name="expirationDate"
                type="date"
                value={form.expirationDate}
                onChange={updateForm}
              />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" value={form.notes} onChange={updateForm} rows="2" />
          </div>
          <div className="form-actions">
            <button type="submit" className="primary-button">
              {editingId ? 'Save changes' : 'Add ingredient'}
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

PantryView.propTypes = {};
