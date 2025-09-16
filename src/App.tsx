import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import FacturacionPage from './pages/FacturacionPage';
import CapasPage from './pages/CapasPage';
import NormativaPage from './pages/NormativaPage';
import CodigoUrbanisticoPage from './pages/CodigoUrbanisticoPage';
import ParametrosEdificabilidadPage from './pages/ParametrosEdificabilidadPage';
import AfectacionesPage from './pages/AfectacionesPage';
import ApiServiciosPage from './pages/ApiServiciosPage';
import AlgoritmosScoringPage from './pages/AlgoritmosScoringPage';
import ReglasAdminPage from './pages/ReglasAdminPage';
import ReglasCategoriaPage from './pages/ReglasCategoriaPage';
import PromptTemplatesPage from './pages/PromptTemplatesPage';
import EmailTemplatesPage from './pages/EmailTemplatesPage';
import PlanTagsPage from './pages/PlanTagsPage';
import ConstantesTronerasPage from './pages/ConstantesTronerasPage';

const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // o spinner
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
            path="/api-servicios"
            element={
              <PrivateRoute>
                <Layout>
                  <ApiServiciosPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/algoritmos-scoring"
            element={
              <PrivateRoute>
                <Layout>
                  <AlgoritmosScoringPage />
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
            path="/analytics"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
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
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App; 