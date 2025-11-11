import React from 'react';
import { Modal } from './ui';

interface Props {
  show: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

const BasicModal: React.FC<Props> = ({ show, title, onClose, children, size = 'md', footer }) => {
  return (
    <Modal
      show={show}
      title={title}
      onClose={onClose}
      size={size}
      footer={footer}
    >
      {children}
    </Modal>
  );
};
export default BasicModal;
