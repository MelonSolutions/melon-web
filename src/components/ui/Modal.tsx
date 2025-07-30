/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { ReactNode, useEffect, createContext, useContext, useState } from 'react';
import { X } from 'lucide-react';

interface ModalContextType {
  openModal: (content: ReactNode, options?: ModalOptions) => void;
  closeModal: () => void;
}

interface ModalOptions {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
  onClose?: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);
  const [options, setOptions] = useState<ModalOptions>({});

  const openModal = (content: ReactNode, modalOptions: ModalOptions = {}) => {
    setContent(content);
    setOptions(modalOptions);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setContent(null);
      setOptions({});
      if (options.onClose) {
        options.onClose();
      }
    }, 150);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && options.closable !== false) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, options.closable]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={options.closable !== false ? closeModal : undefined}
            />
            
            {/* Modal */}
            <div
              className={`relative transform transition-all duration-300 ease-out ${
                isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
              }`}
            >
              <div className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[options.size || 'md']}`}>
                {options.closable !== false && (
                  <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                {content}
              </div>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}