import React from 'react';

import { Card as UICard } from './ui';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  title?: string;
  headerActions?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ className = '', children, title, headerActions }) => {
  const props: { className: string; title?: string; headerActions?: React.ReactNode } = {
    className,
  };
  if (title !== undefined) {
    props.title = title;
  }
  if (headerActions !== undefined) {
    props.headerActions = headerActions;
  }
  return <UICard {...props}>{children}</UICard>;
};

export default Card;
