import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

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
          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800">
              Forgot your password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export const SignUpForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const { signUp, confirmSignUp, resendVerificationCode } = useAuth();

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

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await signUp(email, password);
      setShowConfirmation(true);
    } catch (err) {
      const errorMessage = (err as Error).message;
      
      // Check for specific errors and display user-friendly messages
      if (errorMessage.includes("Exceeded daily email limit")) {
        setError(
          "You are unable to sign up at this time. As this website is currently under construction " +
          "with the ECE 4180 TA's, we are facing a quota of a maximum of 50 sign ups per day due to " +
          "AWS restrictions. Please try again tomorrow or email mneto6@gatech.edu"
        );
      } else if (errorMessage.includes("Attempt limit exceeded")) {
        setError(
          "For security reasons, there's a limit on sign-up attempts. " +
          "Please wait for 15-30 minutes before trying again, or contact mneto6@gatech.edu for assistance."
        );
      } else {
        setError(errorMessage);
      }
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
      const errorMessage = (err as Error).message;
      
      // Check for specific errors and display user-friendly messages
      if (errorMessage.includes("Exceeded daily email limit")) {
        setError(
          "You are unable to sign up at this time. As this website is currently under construction " +
          "with the ECE 4180 TA's, we are facing a quota of a maximum of 50 sign ups per day due to " +
          "AWS restrictions. Please try again tomorrow or email mneto6@gatech.edu"
        );
      } else if (errorMessage.includes("Attempt limit exceeded")) {
        setError(
          "For security reasons, there's a limit on verification attempts. " +
          "Please wait for 15-30 minutes before trying again, or contact mneto6@gatech.edu for assistance."
        );
      } else {
        setError(errorMessage);
      }
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
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-blue-600 hover:text-blue-800"
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  resendVerificationCode(email)
                    .then(() => {
                      alert('A new verification code has been sent to your email.');
                    })
                    .catch((err: Error) => {
                      const errorMessage = err.message;
                      
                      // Check for specific errors and display user-friendly messages
                      if (errorMessage.includes("Exceeded daily email limit")) {
                        setError(
                          "You are unable to sign up at this time. As this website is currently under construction " +
                          "with the ECE 4180 TA's, we are facing a quota of a maximum of 50 sign ups per day due to " +
                          "AWS restrictions. Please try again tomorrow or email mneto6@gatech.edu"
                        );
                      } else if (errorMessage.includes("Attempt limit exceeded")) {
                        setError(
                          "For security reasons, there's a limit on verification attempts. " +
                          "Please wait for 15-30 minutes before trying again, or contact mneto6@gatech.edu for assistance."
                        );
                      } else {
                        setError(errorMessage);
                      }
                    })
                    .finally(() => {
                      setIsLoading(false);
                    });
                }}
                disabled={isLoading}
              >
                Resend verification code
              </button>
            </div>
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
          <div className="mb-4">
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
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 8 characters long and include uppercase, lowercase, and numbers
            </p>
          </div>
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="input w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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

export const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { forgotPassword, confirmForgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await forgotPassword(email);
      setShowConfirmation(true);
    } catch (err) {
      const errorMessage = (err as Error).message;
      
      // Check for specific errors and display user-friendly messages
      if (errorMessage.includes("Exceeded daily email limit")) {
        setError(
          "You are unable to reset your password at this time. As this website is currently under construction " +
          "with the ECE 4180 TA's, we are facing a quota of a maximum of 50 emails per day due to " +
          "AWS restrictions. Please try again tomorrow or email mneto6@gatech.edu"
        );
      } else if (errorMessage.includes("Attempt limit exceeded")) {
        setError(
          "For security reasons, there's a limit on password reset attempts. " +
          "Please wait for 15-30 minutes before trying again, or contact mneto6@gatech.edu for assistance."
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await confirmForgotPassword(email, confirmationCode, newPassword);
      alert('Password reset successfully. You can now sign in with your new password.');
      navigate('/signin');
    } catch (err) {
      const errorMessage = (err as Error).message;
      
      // Check for specific errors and display user-friendly messages
      if (errorMessage.includes("Exceeded daily email limit")) {
        setError(
          "You are unable to reset your password at this time. As this website is currently under construction " +
          "with the ECE 4180 TA's, we are facing a quota of a maximum of 50 emails per day due to " +
          "AWS restrictions. Please try again tomorrow or email mneto6@gatech.edu"
        );
      } else if (errorMessage.includes("Attempt limit exceeded")) {
        setError(
          "For security reasons, there's a limit on password reset attempts. " +
          "Please wait for 15-30 minutes before trying again, or contact mneto6@gatech.edu for assistance."
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="card">
          <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <p className="mb-4">
            We've sent a password reset code to your email. Please enter it below along with your new password.
          </p>
          <form onSubmit={handleConfirmation}>
            <div className="mb-4">
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
            <div className="mb-6">
              <label htmlFor="newPassword" className="label">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                className="input w-full"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters long and include uppercase, lowercase, and numbers
              </p>
            </div>
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <p className="mb-4">
          Enter your email address and we'll send you a code to reset your password.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
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
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Sending Reset Code...' : 'Send Reset Code'}
          </button>
          <div className="mt-4 text-center">
            <Link to="/signin" className="text-blue-600 hover:text-blue-800">
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ResendVerificationForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { resendVerificationCode } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await resendVerificationCode(email);
      setSuccess('Verification code has been sent to your email.');
    } catch (err) {
      const errorMessage = (err as Error).message;
      
      // Check for specific errors and display user-friendly messages
      if (errorMessage.includes("Exceeded daily email limit")) {
        setError(
          "You are unable to request a verification code at this time. As this website is currently under construction " +
          "with the ECE 4180 TA's, we are facing a quota of a maximum of 50 emails per day due to " +
          "AWS restrictions. Please try again tomorrow or email mneto6@gatech.edu"
        );
      } else if (errorMessage.includes("Attempt limit exceeded")) {
        setError(
          "For security reasons, there's a limit on verification code requests. " +
          "Please wait for 15-30 minutes before trying again, or contact mneto6@gatech.edu for assistance."
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 text-center">Resend Verification Code</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        <p className="mb-4">
          Enter your email address and we'll send you a new verification code.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
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
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Sending Code...' : 'Send Verification Code'}
          </button>
          <div className="mt-4 text-center">
            <Link to="/signin" className="text-blue-600 hover:text-blue-800">
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
