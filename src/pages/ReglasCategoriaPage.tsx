import React from 'react';
import { useParams } from 'react-router-dom';
import ReglasPage from './ReglasPage';

function deslugify(str: string) {
  if (!str) return '';
  return str
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const ReglasCategoriaPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const categoria = slug ? deslugify(slug) : '';
  return <ReglasPage mode="view" categoria={categoria} />;
};

export default ReglasCategoriaPage; 