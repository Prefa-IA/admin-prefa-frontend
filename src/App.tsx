import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminUsersPage from './pages/AdminUsersPage';
import AfectacionesPage from './pages/AfectacionesPage';
import CalculoPasosPage from './pages/CalculoPasosPage';
import CapasPage from './pages/CapasPage';
import CodigoUrbanisticoPage from './pages/CodigoUrbanisticoPage';
import ConstantesTronerasPage from './pages/ConstantesTronerasPage';
import Dashboard from './pages/Dashboard';
import EmailTemplatesPage from './pages/EmailTemplatesPage';
import FacturacionPage from './pages/FacturacionPage';
import LoginPage from './pages/LoginPage';
import NewsletterHistoryPage from './pages/NewsletterHistoryPage';
import NormativaPage from './pages/NormativaPage';
import ParametrosEdificabilidadPage from './pages/ParametrosEdificabilidadPage';
import PlanTagsPage from './pages/PlanTagsPage';
import PromptTemplatesPage from './pages/PromptTemplatesPage';
import ReglasAdminPage from './pages/ReglasAdminPage';
import ReglasAllPage from './pages/ReglasAllPage';
import ReglasCategoriaPage from './pages/ReglasCategoriaPage';
import ReglasLogicasPage from './pages/ReglasLogicasPage';
import ReportsPage from './pages/ReportsPage';
import SendNewsletterPage from './pages/SendNewsletterPage';
import UsersPage from './pages/UsersPage';

const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user && user.role === 'admin' ? children : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/email-templates"
            element={
              <PrivateRoute>
                <Layout>
                  <EmailTemplatesPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </>
              </PrivateRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <PrivateRoute>
                <>
                  <Layout>
                    <UsersPage />
                  </Layout>
                </>
              </PrivateRoute>
            }
          />
          <Route
            path="/informes"
            element={
              <PrivateRoute>
                <>
                  <Layout>
                    <ReportsPage />
                  </Layout>
                </>
              </PrivateRoute>
            }
          />
          <Route
            path="/facturacion"
            element={
              <PrivateRoute>
                <Layout>
                  <FacturacionPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/capas"
            element={
              <PrivateRoute>
                <Layout>
                  <CapasPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/normativa"
            element={
              <PrivateRoute>
                <Layout>
                  <NormativaPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/codigo-urbanistico"
            element={
              <PrivateRoute>
                <Layout>
                  <CodigoUrbanisticoPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/parametros-edificabilidad"
            element={
              <PrivateRoute>
                <Layout>
                  <ParametrosEdificabilidadPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/afectaciones"
            element={
              <PrivateRoute>
                <Layout>
                  <AfectacionesPage />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/prompts"
            element={
              <PrivateRoute>
                <Layout>
                  <PromptTemplatesPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/reglas"
            element={
              <PrivateRoute>
                <Layout>
                  <ReglasAdminPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/reglas/:slug"
            element={
              <PrivateRoute>
                <Layout>
                  <ReglasCategoriaPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/reglas/ver-todas"
            element={
              <PrivateRoute>
                <Layout>
                  <ReglasAllPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/plan-tags"
            element={
              <PrivateRoute>
                <Layout>
                  <PlanTagsPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/constantes-troneras"
            element={
              <PrivateRoute>
                <Layout>
                  <ConstantesTronerasPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/newsletter"
            element={
              <PrivateRoute>
                <Layout>
                  <SendNewsletterPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/newsletter-history"
            element={
              <PrivateRoute>
                <Layout>
                  <NewsletterHistoryPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/calculo-pasos"
            element={
              <PrivateRoute>
                <Layout>
                  <CalculoPasosPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/reglas-logicas"
            element={
              <PrivateRoute>
                <Layout>
                  <ReglasLogicasPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-users"
            element={
              <PrivateRoute>
                <Layout>
                  <AdminUsersPage />
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
