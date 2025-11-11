import React from 'react';
import { useParams } from 'react-router-dom';
import ReglasPage from './ReglasPage';
import { deslugify } from '../utils/deslugify';

const ReglasCategoriaPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  if (slug === 'ver-todas') return <ReglasPage mode="view" />;
  const categoria = slug ? deslugify(slug) : '';
  return <ReglasPage mode="view" categoria={categoria} />;
};

export default ReglasCategoriaPage; 