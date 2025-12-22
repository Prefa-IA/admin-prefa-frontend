import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AdminLogsPage from './pages/AdminLogsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AfectacionesPage from './pages/AfectacionesPage';
import CalculoPasosPage from './pages/CalculoPasosPage';
import CapasPage from './pages/CapasPage';
import CareersPage from './pages/CareersPage';
import ChatbotPage from './pages/ChatbotPage';
import CodigoUrbanisticoPage from './pages/CodigoUrbanisticoPage';
import ConstantesTronerasPage from './pages/ConstantesTronerasPage';
import CreditsConfigPage from './pages/CreditsConfigPage';
import Dashboard from './pages/Dashboard';
import EmailTemplatesPage from './pages/EmailTemplatesPage';
import FacturacionPage from './pages/FacturacionPage';
import FailedConsultationsPage from './pages/FailedConsultationsPage';
import LegalContentPage from './pages/LegalContentPage';
import LoginPage from './pages/LoginPage';
import NewsletterHistoryPage from './pages/NewsletterHistoryPage';
import NormativaPage from './pages/NormativaPage';
import ParametrosEdificabilidadPage from './pages/ParametrosEdificabilidadPage';
import PlanTagsPage from './pages/PlanTagsPage';
import PromptTemplatesPage from './pages/PromptTemplatesPage';
import RedesSocialesPage from './pages/RedesSocialesPage';
import ReglasAdminPage from './pages/ReglasAdminPage';
import ReglasAllPage from './pages/ReglasAllPage';
import ReglasCategoriaPage from './pages/ReglasCategoriaPage';
import ReglasLogicasPage from './pages/ReglasLogicasPage';
import ReportsPage from './pages/ReportsPage';
import SendNewsletterPage from './pages/SendNewsletterPage';
import StrategicDataPage from './pages/StrategicDataPage';
import UsersPage from './pages/UsersPage';

const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user && user.role === 'admin' ? children : <Navigate to="/login" />;
};

const RouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PrivateRoute>
    <Layout>{children}</Layout>
  </PrivateRoute>
);

const createMainRoutes = (): React.ReactElement[] => [
  <Route key="login" path="/login" element={<LoginPage />} />,
  <Route
    key="dashboard"
    path="/"
    element={
      <RouteWrapper>
        <Dashboard />
      </RouteWrapper>
    }
  />,
  <Route
    key="usuarios"
    path="/usuarios"
    element={
      <RouteWrapper>
        <UsersPage />
      </RouteWrapper>
    }
  />,
  <Route
    key="datos-estrategicos"
    path="/usuarios/datos-estrategicos"
    element={
      <RouteWrapper>
        <StrategicDataPage />
      </RouteWrapper>
    }
  />,
  <Route
    key="informes"
    path="/informes"
    element={
      <RouteWrapper>
        <ReportsPage />
      </RouteWrapper>
    }
  />,
  <Route
    key="consultas-fallidas"
    path="/consultas-fallidas"
    element={
      <RouteWrapper>
        <FailedConsultationsPage />
      </RouteWrapper>
    }
  />,
  <Route
    key="facturacion"
    path="/facturacion"
    element={
      <RouteWrapper>
        <FacturacionPage />
      </RouteWrapper>
    }
  />,
];

const createContentRoutes = (): React.ReactElement[] => [
  <Route
    key="capas"
    path="/capas"
    element={
      <RouteWrapper>
        <CapasPage />
      </RouteWrapper>
    }
  />,
  <Route
    key="normativa"
    path="/normativa"
    element={
      <RouteWrapper>
        <NormativaPage />
      </RouteWrapper>
    }
  />,
  <Route
    key="codigo-urbanistico"
    path="/codigo-urbanistico"
    element={
      <RouteWrapper>
        <CodigoUrbanisticoPage />
      </RouteWrapper>
    }
  />,
  <Route
    key="parametros-edificabilidad"
    path="/parametros-edificabilidad"
    element={
      <RouteWrapper>
        <ParametrosEdificabilidadPage />
      </RouteWrapper>
    }
  />,
  <Route
    key="afectaciones"
    path="/afectaciones"
    element={
      <RouteWrapper>
        <AfectacionesPage />
      </RouteWrapper>
    }
  />,
];

const createRulesRoutes = (): React.ReactElement[] => [
  <Route
    key="reglas"
    path="/reglas"
    element={
      <RouteWrapper>
        <ReglasAdminPage />
      </RouteWrapper>
    }
  />,
  <Route
    key="reglas-slug"
    path="/reglas/:slug"
    element={
      <RouteWrapper>
        <ReglasCategoriaPage />
      </RouteWrapper>
    }
  />,
  <Route
    key="reglas-todas"
    path="/reglas/ver-todas"
    element={
      <RouteWrapper>
        <ReglasAllPage />
      </RouteWrapper>
    }
  />,
  <Route
    key="reglas-logicas"
    path="/reglas-logicas"
    element={
      <RouteWrapper>
        <ReglasLogicasPage />
      </RouteWrapper>
    }
  />,
];

const createAdminRoutesPart1 = (): React.ReactElement[] => [
  <Route
    key="email-templates"
    path="/email-templates"
    element={
      <RouteWrapper>
        <EmailTemplatesPage />
      </RouteWrapper>
    }
  />,
  <Route
    key="prompts"
    path="/prompts"
    element={
      <RouteWrapper>
        <PromptTemplatesPage />
      </RouteWrapper>
    }
  />,
  <Route
    key="plan-tags"
    path="/plan-tags"
    element={
      <RouteWrapper>
        <PlanTagsPage />
      </RouteWrapper>
    }
  />,
  <Route
    key="redes-sociales"
    path="/redes-sociales"
    element={
      <RouteWrapper>
        <RedesSocialesPage />
      </RouteWrapper>
    }
  />,
  <Route
    key="careers"
    path="/careers"
    element={
      <RouteWrapper>
        <CareersPage />
      </RouteWrapper>
    }
  />,
  <Route
    key="constantes-troneras"
    path="/constantes-troneras"
    element={
      <RouteWrapper>
        <ConstantesTronerasPage />
      </RouteWrapper>
    }
  />,
  <Route
    key="creditos"
    path="/creditos"
    element={
      <RouteWrapper>
        <CreditsConfigPage />
      </RouteWrapper>
    }
  />,
];

const createAdminRoutesPart2 = (): React.ReactElement[] => [
  <Route
    key="newsletter"
    path="/newsletter"
    element={
      <RouteWrapper>
        <SendNewsletterPage />
      </RouteWrapper>
    }
  />,
  <Route
    key="newsletter-history"
    path="/newsletter-history"
    element={
      <RouteWrapper>
        <NewsletterHistoryPage />
      </RouteWrapper>
    }
  />,
  <Route
    key="calculo-pasos"
    path="/calculo-pasos"
    element={
      <RouteWrapper>
        <CalculoPasosPage />
      </RouteWrapper>
    }
  />,
  <Route
    key="admin-users"
    path="/admin-users"
    element={
      <RouteWrapper>
        <AdminUsersPage />
      </RouteWrapper>
    }
  />,
  <Route
    key="admin-logs"
    path="/admin-logs"
    element={
      <RouteWrapper>
        <AdminLogsPage />
      </RouteWrapper>
    }
  />,
  <Route
    key="legal-content"
    path="/legal-content"
    element={
      <RouteWrapper>
        <LegalContentPage />
      </RouteWrapper>
    }
  />,
  <Route
    key="chatbot"
    path="/chatbot"
    element={
      <RouteWrapper>
        <ChatbotPage />
      </RouteWrapper>
    }
  />,
];

const createAdminRoutes = (): React.ReactElement[] => [
  ...createAdminRoutesPart1(),
  ...createAdminRoutesPart2(),
];

const AppRoutes: React.FC = () => (
  <Routes>
    {createMainRoutes()}
    {createContentRoutes()}
    {createRulesRoutes()}
    {createAdminRoutes()}
  </Routes>
);

const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
