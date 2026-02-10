import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import MissionList from './components/MissionList';
import LogistiqueView from './components/LogistiqueView';
import MissionForm from './components/MissionForm';
import ClientList from './components/ClientList';
import ExpenseLog from './components/ExpenseLog';
import Header from './components/Header';
import Settings from './components/Settings';
import Login from './components/Login';

function AppContent() {
  const { user, isInitialLoad } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!isInitialLoad && !user && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [user, isInitialLoad, navigate, location]);

  if (isInitialLoad) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Chargement...</span>
          </div>
          <h5 className="fw-bold text-dark">MissionDz</h5>
          <p className="text-muted small">Synchronisation des données en cours...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="d-flex" style={{ overflowX: 'hidden' }}>
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column" style={{ height: '100vh', overflowY: 'auto' }}>
        <Header />
        <div className="container-fluid p-4">
          <Routes>
            <Route path="/" element={['SUPER_ADMIN', 'ADMIN'].includes(user.role) ? <AdminDashboard /> : <Dashboard />} />
            <Route path="/missions" element={<MissionList type="my" />} />
            <Route path="/team-missions" element={<MissionList type="team" />} />
            <Route path="/logistique" element={<LogistiqueView />} />
            <Route path="/new-mission" element={<MissionForm />} />
            <Route path="/clients" element={<ClientList />} />
            <Route path="/expenses" element={<ExpenseLog />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;
