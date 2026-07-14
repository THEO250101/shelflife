import { useEffect, useState } from 'react';
import AppShell from './components/AppShell.jsx';
import LoginView from './views/LoginView.jsx';
import DashboardView from './views/DashboardView.jsx';
import PantryView from './views/PantryView.jsx';
import RecipesView from './views/RecipesView.jsx';
import MealPlanView from './views/MealPlanView.jsx';
import ShoppingListView from './views/ShoppingListView.jsx';
import RescueLogView from './views/RescueLogView.jsx';
import { api } from './api/client.js';

const viewMap = {
  dashboard: DashboardView,
  pantry: PantryView,
  recipes: RecipesView,
  meals: MealPlanView,
  shopping: ShoppingListView,
  rescue: RescueLogView,
};

export default function App() {
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(
    () => window.localStorage.getItem('shelflife-theme') || 'dark'
  );

  useEffect(() => {
    api
      .me()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('shelflife-theme', theme);
  }, [theme]);

  async function handleLogout() {
    await api.logout();
    setUser(null);
    setActiveView('dashboard');
  }

  function toggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  const ActiveView = viewMap[activeView] || DashboardView;
  const activeViewProps = activeView === 'dashboard' ? { onNavigate: setActiveView } : {};

  if (loading) {
    return <main className="boot-screen">Opening the pantry...</main>;
  }

  if (!user) {
    return <LoginView onLogin={setUser} error={error} setError={setError} />;
  }

  return (
    <AppShell
      user={user}
      activeView={activeView}
      onNavigate={setActiveView}
      onLogout={handleLogout}
      onToggleTheme={toggleTheme}
      theme={theme}
    >
      <ActiveView {...activeViewProps} />
    </AppShell>
  );
}

App.propTypes = {};
