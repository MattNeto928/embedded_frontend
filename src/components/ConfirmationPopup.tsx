import React, { useState, useEffect } from 'react';

interface ConfirmationPopupProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonColor?: string;
  isSuccess?: boolean;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  confirmButtonColor = 'bg-blue-500 hover:bg-blue-600',
  isSuccess = false,
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  // Reset checkbox state when popup opens
  useEffect(() => {
    if (isOpen) {
      setIsChecked(false);
      setIsRendered(true);
      // Small delay to ensure the component is rendered before adding the visible class
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      // Wait for the animation to complete before removing from DOM
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  const handleConfirm = () => {
    if (isSuccess || isChecked) {
      onConfirm();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-300 ease-in-out ${
        isVisible ? 'bg-opacity-50 opacity-100' : 'bg-opacity-0 opacity-0'
      }`}
    >
      <div
        className={`bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transition-transform duration-300 ease-in-out ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="mb-6 text-gray-700">{message}</p>
        
        {!isSuccess && (
          <div className="mb-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
              />
              <span className="ml-2 text-gray-700">
                I understand this action will affect all students
              </span>
            </label>
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          {!isSuccess && (
            <button
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}
          <button
            className={`px-4 py-2 ${confirmButtonColor} text-white rounded-md ${
              !isSuccess && !isChecked ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleConfirm}
            disabled={!isSuccess && !isChecked}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;