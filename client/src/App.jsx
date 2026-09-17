import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import NotFound from './pages/NotFound';

// =========================================================
// PATIENT PAGES
// =========================================================

import PatientDashboard from './pages/patient/Dashboard';
import MemoryBook from './pages/patient/MemoryBook';
import MindGames from './pages/patient/MindGames';
import Exercise from './pages/patient/Exercise';
import PeriodTracker from './pages/patient/PeriodTracker';
import PatientProfile from './pages/patient/Profile';

// =========================================================
// CAREGIVER PAGES
// =========================================================

import CaregiverDashboard from './pages/caregiver/Dashboard';
import Schedule from './pages/caregiver/Schedule';
import Appointments from './pages/caregiver/Appointments';
import Chat from './pages/caregiver/Chat';
import Reports from './pages/caregiver/Reports';
import CaregiverProfile from './pages/caregiver/Profile';

// =========================================================
// DOCTOR PAGES
// =========================================================

import DoctorDashboard from './pages/doctor/Dashboard';

// =========================================================
// CONTEXT
// =========================================================

import { AuthProvider } from './context/AuthContext';

// =========================================================
// COMPONENTS
// =========================================================

import PrivateRoute from './components/PrivateRoute';

// =========================================================
// SCROLL TO TOP
// =========================================================

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, [pathname]);

  return null;
}

// =========================================================
// APP
// =========================================================

function App() {
  return (
    <AuthProvider>
      <Router>

        <ScrollToTop />

        <Routes>

          {/* =================================================
              PUBLIC ROUTES
          ================================================= */}

          <Route
            path="/"
            element={<LandingPage />}
          />

          <Route
            path="/auth/:role/:mode"
            element={<AuthPage />}
          />


          {/* =================================================
              PATIENT ROUTES
          ================================================= */}

          {/* PATIENT DASHBOARD */}

          <Route
            path="/patient/dashboard"
            element={
              <PrivateRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </PrivateRoute>
            }
          />


          {/* MEMORY BOOK */}

          <Route
            path="/patient/memory-book"
            element={
              <PrivateRoute allowedRoles={['patient']}>
                <MemoryBook />
              </PrivateRoute>
            }
          />


          {/* MIND GAMES */}

          <Route
            path="/patient/mind-games"
            element={
              <PrivateRoute allowedRoles={['patient']}>
                <MindGames />
              </PrivateRoute>
            }
          />


          {/* EXERCISE */}

          <Route
            path="/patient/exercise"
            element={
              <PrivateRoute allowedRoles={['patient']}>
                <Exercise />
              </PrivateRoute>
            }
          />


          {/* PERIOD TRACKER */}

          <Route
            path="/patient/period-tracker"
            element={
              <PrivateRoute allowedRoles={['patient']}>
                <PeriodTracker />
              </PrivateRoute>
            }
          />


          {/* PATIENT APPOINTMENTS */}

          <Route
            path="/patient/appointments"
            element={
              <PrivateRoute allowedRoles={['patient']}>
                <div className="min-h-screen bg-slate-50 p-8">
                  <div className="mx-auto max-w-5xl">
                    <div className="rounded-3xl bg-white p-8 shadow-sm">

                      <h1 className="text-3xl font-bold text-slate-900">
                        Appointments
                      </h1>

                      <p className="mt-2 text-slate-500">
                        Your appointments will appear here.
                      </p>

                    </div>
                  </div>
                </div>
              </PrivateRoute>
            }
          />


          {/* PATIENT PROFILE */}

          <Route
            path="/patient/profile"
            element={
              <PrivateRoute allowedRoles={['patient']}>
                <PatientProfile />
              </PrivateRoute>
            }
          />


          {/* PATIENT SOS */}

          <Route
            path="/patient/sos"
            element={
              <PrivateRoute allowedRoles={['patient']}>
                <div className="min-h-screen bg-slate-50 p-8">
                  <div className="mx-auto max-w-5xl">
                    <div className="rounded-3xl bg-white p-8 shadow-sm">

                      <h1 className="text-3xl font-bold text-red-600">
                        Emergency SOS
                      </h1>

                      <p className="mt-2 text-slate-500">
                        Emergency assistance will appear here.
                      </p>

                    </div>
                  </div>
                </div>
              </PrivateRoute>
            }
          />


          {/* =================================================
              CAREGIVER ROUTES
          ================================================= */}

          {/* CAREGIVER DASHBOARD */}

          <Route
            path="/caregiver/dashboard"
            element={
              <PrivateRoute allowedRoles={['caregiver']}>
                <CaregiverDashboard />
              </PrivateRoute>
            }
          />


          {/* CAREGIVER SCHEDULE */}

          <Route
            path="/caregiver/schedule"
            element={
              <PrivateRoute allowedRoles={['caregiver']}>
                <Schedule />
              </PrivateRoute>
            }
          />


          {/* CAREGIVER APPOINTMENTS */}

          <Route
            path="/caregiver/appointments"
            element={
              <PrivateRoute allowedRoles={['caregiver']}>
                <Appointments />
              </PrivateRoute>
            }
          />


          {/* CAREGIVER CHAT */}

          <Route
            path="/caregiver/chat"
            element={
              <PrivateRoute allowedRoles={['caregiver']}>
                <Chat />
              </PrivateRoute>
            }
          />


          {/* CAREGIVER REPORTS */}

          <Route
            path="/caregiver/reports"
            element={
              <PrivateRoute allowedRoles={['caregiver']}>
                <Reports />
              </PrivateRoute>
            }
          />


          {/* CAREGIVER PROFILE */}

          <Route
            path="/caregiver/profile"
            element={
              <PrivateRoute allowedRoles={['caregiver']}>
                <CaregiverProfile />
              </PrivateRoute>
            }
          />


          {/* =================================================
              DOCTOR ROUTES
          ================================================= */}

          <Route
            path="/doctor/dashboard"
            element={
              <PrivateRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </PrivateRoute>
            }
          />


          {/* =================================================
              404 ROUTES
          ================================================= */}

          <Route
            path="/404"
            element={<NotFound />}
          />

          <Route
            path="*"
            element={<Navigate to="/404" replace />}
          />

        </Routes>

      </Router>
    </AuthProvider>
  );
}

export default App;