import React from 'react';
import { Card as UICard } from './ui';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  title?: string;
  headerActions?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ className = '', children, title, headerActions }) => (
  <UICard className={className} title={title} headerActions={headerActions}>
    {children}
  </UICard>
);

export default Card; 