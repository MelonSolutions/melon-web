import { useModal } from '@/components/ui/Modal';

export function useModalActions() {
  const { openModal, closeModal, openConfirmModal, openUploadModal } = useModal();

  // Delete confirmation modal
  const confirmDelete = (itemName: string, onConfirm: () => void | Promise<void>) => {
    openConfirmModal({
      title: 'Delete Item',
      description: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm
    });
  };

  // Generic confirmation modal
  const confirmAction = (
    title: string, 
    description: string, 
    onConfirm: () => void | Promise<void>,
    options?: {
      confirmText?: string;
      cancelText?: string;
      variant?: 'danger' | 'warning' | 'info';
    }
  ) => {
    openConfirmModal({
      title,
      description,
      confirmText: options?.confirmText || 'Confirm',
      cancelText: options?.cancelText || 'Cancel',
      variant: options?.variant || 'warning',
      onConfirm
    });
  };

  // File upload modal
  const uploadFiles = (
    title: string,
    onUpload: (files: FileList) => void | Promise<void>,
    options?: {
      description?: string;
      accept?: string;
      maxSize?: number;
      multiple?: boolean;
    }
  ) => {
    openUploadModal({
      title,
      description: options?.description,
      accept: options?.accept,
      maxSize: options?.maxSize,
      multiple: options?.multiple,
      onUpload
    });
  };
    return {
        openModal,
        closeModal,
        confirmDelete,
        confirmAction,
        uploadFiles
    };
}
