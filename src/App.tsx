
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AgreementProvider } from './context/AgreementContext';
import { Toaster } from '@/components/ui/toaster';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CreateAgreement from './pages/CreateAgreement';
import AgreementDetail from './pages/AgreementDetail';
import MyAgreements from './pages/MyAgreements';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';

function App() {
  // Update the document title for the entire app
  document.title = "Friendly Agreements";
  
  return (
    <AuthProvider>
      <AgreementProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/create" element={<CreateAgreement />} />
            <Route path="/agreements/:id" element={<AgreementDetail />} />
            <Route path="/my-agreements" element={<MyAgreements />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </AgreementProvider>
    </AuthProvider>
  );
}

export default App;
