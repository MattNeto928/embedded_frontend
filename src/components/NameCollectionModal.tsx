import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface NameCollectionModalProps {
  isOpen: boolean;
  onClose?: () => void; // Optional since modal should only close on successful submission
}

const NameCollectionModal: React.FC<NameCollectionModalProps> = ({
  isOpen,
  onClose
}) => {
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  
  const { updateUserAttributes } = useAuth();

  // Handle modal visibility animations
  useEffect(() => {
    if (isOpen) {
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

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFullName('');
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (fullName.trim().length < 2) {
      setError('Please enter a valid full name');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateUserAttributes(fullName.trim());
      // Modal will close automatically when the auth state updates
      if (onClose) {
        onClose();
      }
    } catch (err) {
      setError((err as Error).message);
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
    if (error) {
      setError(null);
    }
  };

  if (!isRendered) return null;

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
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
          <p className="text-gray-600">
            To personalize your experience, please enter your full name as it appears on Canvas.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              value={fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name as it appears on Canvas"
              disabled={isSubmitting}
              autoFocus
              required
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  This helps the staff identify you for checkoffs!
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !fullName.trim()}
              className={`px-6 py-2 rounded-md text-white font-medium transition-colors ${
                isSubmitting || !fullName.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </div>
              ) : (
                'Continue'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NameCollectionModal;
