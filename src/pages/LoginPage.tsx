import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

import { useAuth } from '../contexts/AuthContext';

const handleForgotPassword = async (email: string): Promise<void> => {
  if (!email) {
    toast.error('Ingresá tu email para recuperar tu contraseña');
    return;
  }
  const response = await fetch('/admin/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'No se pudo enviar el email');
  }
  toast.success('Te enviamos un correo para recuperar tu contraseña');
};

const EmailField: React.FC<{
  email: string;
  onEmailChange: (value: string) => void;
}> = ({ email, onEmailChange }) => (
  <div className="flex flex-col">
    <label
      htmlFor="email"
      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
    >
      Email
    </label>
    <input
      id="email"
      name="email"
      type="email"
      required
      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150"
      placeholder="tu@email.com"
      value={email}
      onChange={(e) => onEmailChange(e.target.value)}
      autoComplete="email"
    />
  </div>
);

const PasswordField: React.FC<{
  password: string;
  showPassword: boolean;
  onPasswordChange: (value: string) => void;
  onShowPasswordToggle: () => void;
}> = ({ password, showPassword, onPasswordChange, onShowPasswordToggle }) => (
  <div className="flex flex-col">
    <label
      htmlFor="password"
      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
    >
      Contraseña
    </label>
    <div className="relative">
      <input
        id="password"
        name="password"
        type={showPassword ? 'text' : 'password'}
        required
        className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150"
        placeholder="••••••••"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        autoComplete="current-password"
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 pr-3 flex items-center"
        onClick={onShowPasswordToggle}
      >
        {showPassword ? (
          <EyeSlashIcon className="h-5 w-5 text-gray-500" />
        ) : (
          <EyeIcon className="h-5 w-5 text-gray-500" />
        )}
      </button>
    </div>
  </div>
);

const LoginForm: React.FC<{
  email: string;
  password: string;
  showPassword: boolean;
  loading: boolean;
  mode: 'login' | 'forgot';
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onShowPasswordToggle: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPasswordClick: () => void;
}> = ({
  email,
  password,
  showPassword,
  loading,
  mode,
  onEmailChange,
  onPasswordChange,
  onShowPasswordToggle,
  onSubmit,
  onForgotPasswordClick,
}) => (
  <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-6">
    <div className="rounded-md shadow-sm flex flex-col gap-4">
      <EmailField email={email} onEmailChange={onEmailChange} />
      {mode !== 'forgot' && (
        <PasswordField
          password={password}
          showPassword={showPassword}
          onPasswordChange={onPasswordChange}
          onShowPasswordToggle={onShowPasswordToggle}
        />
      )}
    </div>

    <div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full justify-center items-center px-3 py-2 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Ingresando…' : mode === 'login' ? 'Iniciar sesión' : 'Enviar correo'}
      </button>
    </div>

    {mode === 'login' && (
      <div className="text-center">
        <button
          type="button"
          className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
          onClick={onForgotPasswordClick}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>
    )}
  </form>
);

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'login' | 'forgot'>('login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        await login(email, password);
        navigate('/');
      } else {
        await handleForgotPassword(email);
        setMode('login');
        setEmail('');
      }
    } catch (err: unknown) {
      if (mode === 'forgot') {
        const error = err as { message?: string };
        toast.error(error.message || 'Error al enviar el correo');
      }
      // El error de login ya se maneja en AuthContext con toast
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen pt-[90px] flex justify-center items-center w-full px-4 sm:px-0">
      <div
        className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded shadow w-full sm:w-auto"
        style={{ maxWidth: '28rem', width: '95%' }}
      >
        {mode === 'forgot' && (
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setEmail('');
            }}
            className="mb-4 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            <span className="text-sm">Volver</span>
          </button>
        )}

        <LoginForm
          email={email}
          password={password}
          showPassword={showPassword}
          loading={loading}
          mode={mode}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onShowPasswordToggle={() => setShowPassword(!showPassword)}
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          onForgotPasswordClick={() => {
            setMode('forgot');
            setPassword('');
          }}
        />
      </div>
    </div>
  );
};

export default LoginPage;
