import PropTypes from 'prop-types';
import NavButton from './NavButton.jsx';
import './AppShell.css';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', emoji: '📊' },
  { id: 'pantry', label: 'Pantry', emoji: '🥬' },
  { id: 'recipes', label: 'Recipes', emoji: '🍳' },
  { id: 'meals', label: 'Meal Plan', emoji: '📅' },
  { id: 'shopping', label: 'Shopping', emoji: '🛒' },
  { id: 'rescue', label: 'Rescue Log', emoji: '🏷️' },
];

export default function AppShell({
  user,
  activeView,
  onNavigate,
  onLogout,
  onToggleTheme,
  theme,
  children,
}) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <button type="button" className="brand-lockup" onClick={() => onNavigate('dashboard')}>
          <img src="/images/shelflife-logo.svg" alt="ShelfLife" className="brand-logo" />
          <div className="brand-text">
            <strong>ShelfLife</strong>
            <span>Fresh tracking, less waste</span>
          </div>
        </button>

        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavButton
              key={item.id}
              label={item.label}
              emoji={item.emoji}
              active={activeView === item.id}
              onClick={() => onNavigate(item.id)}
            />
          ))}
        </nav>

        <div className="user-panel">
          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <span aria-hidden="true">{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <span className="user-avatar" aria-hidden="true">
            👤
          </span>
          <div>
            <strong>{user.displayName || user.username}</strong>
            <button type="button" className="text-button" onClick={onLogout}>
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="workspace">{children}</main>
    </div>
  );
}

AppShell.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
    displayName: PropTypes.string,
  }).isRequired,
  activeView: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onToggleTheme: PropTypes.func.isRequired,
  theme: PropTypes.oneOf(['dark', 'light']).isRequired,
  children: PropTypes.node.isRequired,
};
