import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [submitting,setSubmitting]=useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error de autenticación');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-6 text-center">Admin Login</h1>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="input-field"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium text-gray-700">Contraseña</label>
          <input
            type="password"
            className="input-field"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary w-full disabled:opacity-50" disabled={submitting}>
          {submitting? 'Ingresando…':'Iniciar sesión'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage; 