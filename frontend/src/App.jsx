import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import ReportIssue from './pages/ReportIssue/ReportIssue';
import IssueDetails from './pages/IssueDetails/IssueDetails';
import MunicipalityDashboard from './pages/MunicipalityDashboard/MunicipalityDashboard';
import Profile from './pages/Profile/Profile';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import RoleBasedRoute from './components/RoleBasedRoute/RoleBasedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Citizen routes */}
              <Route
                path="/dashboard"
                element={
                  <RoleBasedRoute allowedRoles={['citizen', 'admin']}>
                    <Dashboard />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/report-issue"
                element={
                  <PrivateRoute>
                    <ReportIssue />
                  </PrivateRoute>
                }
              />

              {/* Issue details */}
              <Route
                path="/issues/:id"
                element={
                  <PrivateRoute>
                    <IssueDetails />
                  </PrivateRoute>
                }
              />

              {/* Department routes */}
              <Route
                path="/department/dashboard"
                element={
                  <RoleBasedRoute allowedRoles={['department', 'admin']}>
                    <MunicipalityDashboard />
                  </RoleBasedRoute>
                }
              />

              {/* User profile  */}
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
          <ToastContainer position="bottom-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App
