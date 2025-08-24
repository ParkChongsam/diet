
import React, { useEffect } from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ExclamationIcon } from './icons/ExclamationIcon';
import { InfoIcon } from './icons/InfoIcon';

export interface ToastMessage {
  type: 'success' | 'error' | 'warning';
  message: string;
}

interface ToastProps {
  message: ToastMessage;
  onDismiss: () => void;
}

const icons = {
  success: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
  error: <ExclamationIcon className="w-6 h-6 text-red-500" />,
  warning: <InfoIcon className="w-6 h-6 text-yellow-500" />,
};

const colors = {
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  warning: 'bg-yellow-50 border-yellow-200',
};

export const Toast: React.FC<ToastProps> = ({ message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [message, onDismiss]);

  return (
    <div className={`fixed top-5 right-5 z-50 p-4 rounded-lg shadow-lg border flex items-center space-x-3 ${colors[message.type]}`}>
      <div>{icons[message.type]}</div>
      <p className="font-medium text-gray-700">{message.message}</p>
    </div>
  );
};
