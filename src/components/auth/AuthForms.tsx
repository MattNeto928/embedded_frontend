import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const SignInForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, authState } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to home page if already authenticated
  useEffect(() => {
    if (authState.isAuthenticated) {
      navigate('/');
    }
  }, [authState.isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signIn(email, password);
      // Successful sign-in will update authState.isAuthenticated
      // which will trigger the useEffect hook to redirect
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export const SignUpForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const { signUp, confirmSignUp } = useAuth();

  const validateEmail = (email: string): boolean => {
    return email.endsWith('@gatech.edu');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate email domain
    if (!validateEmail(email)) {
      setError('Only @gatech.edu email addresses are allowed');
      setIsLoading(false);
      return;
    }

    try {
      await signUp(email, password);
      setShowConfirmation(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await confirmSignUp(email, confirmationCode);
      // Redirect to sign in page
      window.location.href = '/signin';
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="card">
          <h2 className="text-2xl font-bold mb-6 text-center">Confirm Sign Up</h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <p className="mb-4">
            We've sent a confirmation code to your email. Please enter it below.
          </p>
          <form onSubmit={handleConfirmation}>
            <div className="mb-6">
              <label htmlFor="confirmationCode" className="label">
                Confirmation Code
              </label>
              <input
                id="confirmationCode"
                type="text"
                className="input w-full"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Confirming...' : 'Confirm'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="label">
              Email (must be a @gatech.edu address)
            </label>
            <input
              id="email"
              type="email"
              className="input w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              pattern=".*@gatech\.edu$"
              title="Must be a valid @gatech.edu email address"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Only Georgia Tech email addresses are allowed</p>
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
};

export const SignOutButton: React.FC = () => {
  const { signOut } = useAuth();
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">You are signed in!</h1>
      <button onClick={signOut} className="btn-primary">
        Sign Out
      </button>
    </div>
  );
};
