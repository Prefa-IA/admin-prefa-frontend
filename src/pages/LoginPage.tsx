import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

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
        // Forgot password
        if (!email) {
          toast.error('Ingresá tu email para recuperar tu contraseña');
          return;
        }
        try {
          await fetch('/admin/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          }).then(async r => {
            if (!r.ok) {
              const d = await r.json().catch(() => ({}));
              throw new Error(d.error || 'No se pudo enviar el email');
            }
            toast.success('Te enviamos un correo para recuperar tu contraseña');
            setMode('login');
            setEmail('');
          });
        } catch (err: any) {
          toast.error(err.message || 'Error al enviar el correo');
        }
      }
    } catch (err: any) {
      // El error ya se maneja en AuthContext con toast
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen pt-[90px] flex justify-center items-center w-full px-4 sm:px-0">
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded shadow w-full sm:w-auto" style={{ maxWidth: '28rem', width: '95%' }}>
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
        
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
          <div className="rounded-md shadow-sm flex flex-col gap-4">
            <div className="flex flex-col">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {mode !== 'forgot' && (
              <div className="flex flex-col">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
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
                onClick={() => {
                  setMode('forgot');
                  setPassword('');
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 