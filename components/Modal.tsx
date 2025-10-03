import React, { useEffect, useRef } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { ImageWithLoader } from './ImageWithLoader';
import { X } from 'lucide-react';

interface ModalProps {
  imageUrl: string;
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ imageUrl, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Accessibility: Trap focus within the modal
  useFocusTrap(modalRef);

  // Accessibility: Close on Escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Enlarged image view"
    >
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden w-full h-full max-w-7xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <ImageWithLoader src={imageUrl} alt="Enlarged view" />
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-black/40 text-white rounded-full h-8 w-8 flex items-center justify-center hover:bg-black/60 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
