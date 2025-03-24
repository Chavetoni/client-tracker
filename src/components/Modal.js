
import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ children, onClose, className = "" }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 overflow-y-auto py-8">
    <div className={`bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-6 relative max-h-[90vh] overflow-y-auto ${className}`}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 z-10"
      >
        <X size={20} />
      </button>
      {children}
    </div>
  </div>
);

export default Modal;