/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import { ReactNode, useEffect, createContext, useContext, useState, isValidElement } from 'react';
import { X, AlertTriangle, CheckCircle, Info, Upload, Trash2 } from 'lucide-react';

interface ModalContextType {
  openModal: (content: ReactNode | ModalConfig, options?: ModalOptions) => void;
  closeModal: () => void;
  openConfirmModal: (config: ConfirmModalConfig) => void;
  openUploadModal: (config: UploadModalConfig) => void;
}

interface ModalOptions {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  onClose?: () => void;
  backdrop?: 'blur' | 'dark' | 'light';
  className?: string;
}

interface ModalConfig {
  type: 'info' | 'success' | 'warning' | 'error' | 'custom';
  title: string;
  description?: string;
  content?: ReactNode;
  footer?: ReactNode;
  icon?: ReactNode;
  actions?: ModalAction[];
}

interface ModalAction {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  onClick: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
}

interface ConfirmModalConfig {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface UploadModalConfig {
  title: string;
  description?: string;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  onUpload: (files: FileList) => void | Promise<void>;
  onCancel?: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode; }) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);
  const [options, setOptions] = useState<ModalOptions>({});

  const openModal = (content: ReactNode | ModalConfig, modalOptions: ModalOptions = {}) => {
    if (!isValidElement(content) && typeof content === 'object' && content !== null && 'type' in content) {
      // Handle ModalConfig
      const config = content as ModalConfig;
      setContent(<StandardModalContent config={config} onClose={closeModal} />);
    } else {
      // Handle ReactNode
      setContent(content as ReactNode);
    }
    setOptions(modalOptions);
    setIsOpen(true);
  };

  const openConfirmModal = (config: ConfirmModalConfig) => {
    const modalConfig: ModalConfig = {
      type: config.variant === 'danger' ? 'error' : (config.variant || 'warning'),
      title: config.title,
      description: config.description,
      actions: [
        {
          label: config.cancelText || 'Cancel',
          variant: 'secondary',
          onClick: () => {
            config.onCancel?.();
            closeModal();
          }
        },
        {
          label: config.confirmText || 'Confirm',
          variant: config.variant === 'danger' ? 'danger' : 'primary',
          onClick: async () => {
            await config.onConfirm();
            closeModal();
          }
        }
      ]
    };

    openModal(modalConfig, { size: 'sm', closable: true });
  };

  const openUploadModal = (config: UploadModalConfig) => {
    setContent(<UploadModalContent config={config} onClose={closeModal} />);
    setOptions({ size: 'md', closable: true });
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
    xs: 'max-w-sm',
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]'
  };

  const backdropClasses = {
    blur: 'bg-black/40 backdrop-blur-sm',
    dark: 'bg-black/70',
    light: 'bg-black/10'
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal, openConfirmModal, openUploadModal }}>
      {children}

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className={`fixed inset-0 transition-opacity ${backdropClasses[options.backdrop || 'blur']}`}
              onClick={options.closable !== false ? closeModal : undefined}
            />

            <div className={`relative transform transition-all duration-200 ease-out w-full ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
              } ${sizeClasses[options.size || 'md']} ${options.className || ''}`}>
              <div className="bg-surface rounded-lg shadow-xl max-h-[90vh] overflow-hidden border border-border">
                {options.closable !== false && (
                  <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 z-10 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-surface-secondary rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                <div className="max-h-[90vh] overflow-y-auto">
                  {content}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

// Standard Modal Content Component
function StandardModalContent({ config, onClose }: { config: ModalConfig; onClose: () => void; }) {
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});

  const getIcon = () => {
    if (config.icon) return config.icon;

    const iconClass = "w-6 h-6";
    switch (config.type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-600`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-yellow-600`} />;
      case 'error':
        return <AlertTriangle className={`${iconClass} text-red-600`} />;
      case 'info':
        return <Info className={`${iconClass} text-blue-500 dark:text-blue-400`} />;
      default:
        return null;
    }
  };

  const handleActionClick = async (action: ModalAction, index: number) => {
    if (action.disabled || loadingStates[index]) return;

    setLoadingStates(prev => ({ ...prev, [index]: true }));
    try {
      await action.onClick();
    } finally {
      setLoadingStates(prev => ({ ...prev, [index]: false }));
    }
  };

  const getButtonVariant = (variant: ModalAction['variant']) => {
    const base = "px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
    switch (variant) {
      case 'primary':
        return `${base} bg-blue-600 text-white hover:bg-blue-700`;
      case 'danger':
        return `${base} bg-red-600 text-white hover:bg-red-700`;
      case 'success':
        return `${base} bg-green-600 text-white hover:bg-green-700`;
      case 'secondary':
      default:
        return `${base} bg-surface text-gray-700 dark:text-gray-300 border border-border hover:bg-surface-secondary`;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start gap-4">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{config.title}</h3>
            {config.description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{config.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {config.content && (
        <div className="p-6">
          {config.content}
        </div>
      )}

      {/* Footer */}
      {(config.footer || config.actions) && (
        <div className="p-6 border-t border-border bg-surface-secondary">
          {config.footer || (
            <div className="flex items-center justify-end gap-3">
              {config.actions?.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleActionClick(action, index)}
                  disabled={action.disabled || loadingStates[index]}
                  className={getButtonVariant(action.variant)}
                >
                  {loadingStates[index] ? 'Loading...' : action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Upload Modal Content Component
function UploadModalContent({ config, onClose }: { config: UploadModalConfig; onClose: () => void; }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (files: FileList) => {
    if (!files.length) return;

    // Check file size if maxSize is specified
    if (config.maxSize) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > config.maxSize) {
          alert(`File ${files[i].name} exceeds maximum size of ${(config.maxSize / 1024 / 1024).toFixed(1)}MB`);
          return;
        }
      }
    }

    setIsUploading(true);
    try {
      await config.onUpload(files);
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length) {
      handleFileSelect(files);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <Upload className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{config.title}</h3>
            {config.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{config.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="p-6">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-border-hover'
            }`}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = config.accept || '*';
            input.multiple = config.multiple || false;
            input.onchange = (e) => {
              const target = e.target as HTMLInputElement;
              if (target.files?.length) {
                handleFileSelect(target.files);
              }
            };
            input.click();
          }}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {isDragOver ? 'Drop files here' : 'Upload Files'}
          </h4>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Drag and drop files here, or click to browse
          </p>
          <button
            disabled={isUploading}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : 'Choose Files'}
          </button>
          {config.maxSize && (
            <p className="text-xs text-gray-500 mt-2">
              Maximum file size: {(config.maxSize / 1024 / 1024).toFixed(1)}MB
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border bg-surface-secondary">
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => {
              config.onCancel?.();
              onClose();
            }}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-surface border border-border rounded-lg hover:bg-surface-secondary transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}