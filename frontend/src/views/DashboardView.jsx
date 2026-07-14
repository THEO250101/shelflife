import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import StatTile from '../components/StatTile.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { api } from '../api/client.js';
import './DashboardView.css';

const foodPhotos = [
  '/images/market-produce.jpg',
  '/images/kitchen-table.jpg',
  '/images/dinner-plate.jpg',
  '/images/grocery-bag.jpg',
  '/images/cooking-prep.jpg',
  '/images/kitchen-counter.jpg',
];

function photoFor(index) {
  return foodPhotos[index % foodPhotos.length];
}

function currentGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 18) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

const recordingSteps = [
  {
    view: 'pantry',
    eyebrow: '1',
    title: 'Show the kitchen inventory',
    body: 'Filter the pantry by Use Soon, then edit one item so the CRUD workflow is visible on screen.',
    action: 'Open pantry',
  },
  {
    view: 'recipes',
    eyebrow: '2',
    title: 'Explain recipe matching',
    body: 'Point out the match percentages, then add missing ingredients from one recipe to the shopping list.',
    action: 'Open recipes',
  },
  {
    view: 'shopping',
    eyebrow: '3',
    title: 'Close the shopping loop',
    body: 'Toggle one item as bought and show that open items stay separated from completed groceries.',
    action: 'Open shopping',
  },
  {
    view: 'rescue',
    eyebrow: '4',
    title: 'Log rescued food',
    body: 'Create a rescue entry and connect it back to the saved-value stat on this dashboard.',
    action: 'Open rescue log',
  },
];

export default function DashboardView({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.stats(), api.recipeMatches()])
      .then(([statsData, matchData]) => {
        setStats(statsData);
        setMatches(matchData.items || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  const totals = stats?.totals || {};
  const useSoonItems = stats?.useSoon || [];
  const shoppingItems = stats?.shoppingPreview || [];
  const recentRescues = stats?.recentRescues || [];
  const locationEntries = Object.entries(stats?.locationCounts || {}).sort((a, b) => b[1] - a[1]);
  const categoryEntries = Object.entries(stats?.categoryCounts || {}).sort((a, b) => b[1] - a[1]);
  const leadItem = useSoonItems[0];
  const leadRecipe = matches[0];
  const greeting = currentGreeting();

  return (
    <section className="dashboard-view">
      <ErrorBanner message={error} />

      {/* Welcome row */}
      <div className="welcome-row">
        <div>
          <h1 className="welcome-title">{greeting}, Chef &#x1F44B;</h1>
          <p className="welcome-sub">
            {totals.pantryItems || 0} pantry items &middot; {totals.recipes || 0} recipes &middot;{' '}
            {totals.plannedMeals || 0} meals planned
          </p>
        </div>
        <div className="quick-actions">
          <button type="button" className="quick-chip" onClick={() => onNavigate('pantry')}>
            + Add ingredient
          </button>
          <button type="button" className="quick-chip" onClick={() => onNavigate('shopping')}>
            + Shopping item
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-stats">
        <StatTile label="Use soon" value={totals.useSoon || 0} tone="warning" emoji="&#x23F0;" />
        <StatTile
          label="Rescued this month"
          value={totals.rescuedThisMonth || 0}
          tone="good"
          emoji="&#x1F3C6;"
        />
        <StatTile label="Open to buy" value={totals.openShoppingItems || 0} emoji="&#x1F6D2;" />
        <StatTile
          label="Saved value"
          value={`$${totals.savedValue || 0}`}
          tone="good"
          emoji="&#x1F4B0;"
        />
      </div>

      <section className="recording-guide" aria-labelledby="recording-guide-title">
        <div className="recording-guide-intro">
          <span className="guide-kicker">Recording guide</span>
          <h2 id="recording-guide-title">Use this path for the demo video</h2>
          <p>
            Start here after login. Each step opens the next view and gives you a concrete action to
            narrate, so the recording feels like a real kitchen workflow instead of a page tour.
          </p>
        </div>
        <div className="guide-steps">
          {recordingSteps.map((step) => (
            <article className="guide-step" key={step.view}>
              <span className="guide-step-number">{step.eyebrow}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
              <button
                type="button"
                className="secondary-button"
                onClick={() => onNavigate(step.view)}
              >
                {step.action}
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* Hero food cards */}
      <section className="food-card-grid" aria-label="Highlights">
        <button
          type="button"
          className="food-card food-card--hero"
          onClick={() => onNavigate('pantry')}
        >
          <img src={photoFor(0)} alt="Market produce arranged in crates" />
          <div className="food-card-body">
            <span className="food-card-badge">&#x26A0;&#xFE0F; Use first</span>
            <h2>{leadItem ? leadItem.name : 'No urgent items'}</h2>
            <p>
              {leadItem
                ? `${leadItem.quantity} ${leadItem.unit} · ${leadItem.location} · ${leadItem.daysLeft} days left`
                : 'Add pantry items with dates to build your rescue queue.'}
            </p>
            <span className="food-card-action">Open pantry</span>
          </div>
        </button>

        <button type="button" className="food-card" onClick={() => onNavigate('recipes')}>
          <img src={photoFor(2)} alt="Cooked dinner plate with vegetables" />
          <div className="food-card-body">
            <span className="food-card-badge food-card-badge--match">&#x1F373; Best match</span>
            <h2>{leadRecipe ? leadRecipe.title : 'No matches yet'}</h2>
            <p>
              {leadRecipe
                ? `${leadRecipe.matchScore}% pantry match · Have ${leadRecipe.availableCount}, need ${leadRecipe.missingCount}`
                : 'Add recipes and pantry items to see matches.'}
            </p>
            <span className="food-card-action">Open recipes</span>
          </div>
        </button>

        <button type="button" className="food-card" onClick={() => onNavigate('shopping')}>
          <img src={photoFor(3)} alt="Grocery bag with fresh food" />
          <div className="food-card-body">
            <span className="food-card-badge food-card-badge--shop">&#x1F6D2; Buy next</span>
            <h2>{shoppingItems[0]?.name || 'List clear'}</h2>
            <p>
              {shoppingItems[0]
                ? `${shoppingItems[0].quantity} ${shoppingItems[0].unit} · ${shoppingItems[0].reason || 'Manual item'}`
                : 'Missing ingredients and manual items appear here.'}
            </p>
            <span className="food-card-action">Open shopping</span>
          </div>
        </button>

        <button type="button" className="food-card" onClick={() => onNavigate('rescue')}>
          <img src={photoFor(4)} alt="Hands preparing ingredients on a kitchen counter" />
          <div className="food-card-body">
            <span className="food-card-badge food-card-badge--rescue">
              &#x1F3F7;&#xFE0F; Recent rescue
            </span>
            <h2>{recentRescues[0]?.pantryItemName || 'Start rescuing'}</h2>
            <p>
              {recentRescues[0]
                ? `${recentRescues[0].action} · $${Number(recentRescues[0].estimatedSavedValue || 0).toFixed(2)} saved`
                : 'Log food you saved to track your impact.'}
            </p>
            <span className="food-card-action">Open rescue log</span>
          </div>
        </button>
      </section>

      {/* Bottom panels */}
      <div className="dashboard-grid">
        {/* Use-soon panel */}
        <section className="surface-panel">
          <div className="panel-heading">
            <h2>&#x23F0; Use-soon queue</h2>
            <span className="panel-count">{useSoonItems.length} items</span>
          </div>
          <div className="item-list">
            {useSoonItems.length ? (
              useSoonItems.slice(0, 6).map((item) => (
                <article className="item-row" key={item._id}>
                  <div>
                    <h3>{item.name}</h3>
                    <p>
                      {item.quantity} {item.unit} &middot; {item.location}
                    </p>
                  </div>
                  <div className="item-row-right">
                    <span className="days-badge">{item.daysLeft}d left</span>
                    <StatusBadge status="Use Soon" />
                  </div>
                </article>
              ))
            ) : (
              <EmptyState title="Nothing urgent">
                Add pantry items with expiration dates.
              </EmptyState>
            )}
          </div>
        </section>

        {/* Recipe matches */}
        <section className="surface-panel">
          <div className="panel-heading">
            <h2>&#x1F373; Top matches</h2>
            <span className="panel-count">{matches.length} recipes</span>
          </div>
          <div className="match-list">
            {matches.length ? (
              matches.slice(0, 4).map((recipe, i) => (
                <article className="compact-match" key={recipe._id}>
                  <img src={photoFor(i + 1)} alt={`${recipe.title} visual cue`} />
                  <div className="match-pct">{recipe.matchScore}%</div>
                  <div>
                    <h3>{recipe.title}</h3>
                    <p>
                      Have {recipe.availableCount} &middot; Missing {recipe.missingCount}
                    </p>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState title="No matches yet">
                Add pantry items and recipes to compare.
              </EmptyState>
            )}
          </div>
        </section>

        {/* Sidebar: storage + categories + shopping */}
        <aside className="dashboard-side">
          <section className="surface-panel">
            <div className="panel-heading">
              <h2>&#x1F4CD; Storage</h2>
              <span className="panel-count">{locationEntries.length} zones</span>
            </div>
            <div className="zone-stack">
              {locationEntries.map(([location, count]) => (
                <div className="zone-row" key={location}>
                  <span>{location}</span>
                  <div className="zone-bar">
                    <div
                      className="zone-bar-fill"
                      style={{
                        width: `${Math.min(100, (count / (totals.pantryItems || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-panel">
            <div className="panel-heading">
              <h2>&#x1F3F7;&#xFE0F; Categories</h2>
              <span className="panel-count">{categoryEntries.length} types</span>
            </div>
            <div className="category-chips">
              {categoryEntries.slice(0, 8).map(([cat, count]) => (
                <span className="category-chip" key={cat}>
                  {cat} <strong>{count}</strong>
                </span>
              ))}
            </div>
          </section>

          <section className="surface-panel">
            <div className="panel-heading">
              <h2>&#x1F6D2; Shopping gaps</h2>
              <span className="panel-count">{shoppingItems.length} open</span>
            </div>
            <div className="quiet-list">
              {shoppingItems.slice(0, 4).map((item) => (
                <p key={item._id}>
                  <strong>{item.name}</strong>
                  <span>
                    {item.quantity} {item.unit}
                  </span>
                </p>
              ))}
              {shoppingItems.length === 0 && (
                <EmptyState title="All clear">Shopping list is empty or done.</EmptyState>
              )}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

DashboardView.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};
