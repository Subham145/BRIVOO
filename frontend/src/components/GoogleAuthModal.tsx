import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { X, Loader2 } from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
  role?: 'customer' | 'admin';
  title?: string;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  role = 'customer',
  title = 'Continue to BRIVOO'
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGoogleSuccess = async (credential?: string) => {
    if (!credential || loading) {
      setErrorMsg('Google did not return a valid authentication credential.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const result = await api.googleLogin(credential);

      if (!result.success || !result.user || !result.token) {
        setErrorMsg(result.message || 'Google authentication failed.');
        return;
      }

      if (role === 'admin' && result.user.role !== 'admin') {
        setErrorMsg('This Google account is not authorized for administrator access.');
        return;
      }

      onSuccess(result.user, result.token);
      onClose();
    } catch {
      setErrorMsg('Unable to complete Google sign-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget && !loading) onClose();
      }}
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
        {!loading && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Google sign-in"
            className="absolute right-3 top-3 rounded-full p-2 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <h2 className="mb-2 mt-3 text-lg font-bold text-gray-900">
          {title}
        </h2>

        <p className="mb-6 text-sm text-gray-500">
          Sign in securely with your Google account.
        </p>

        {errorMsg && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {errorMsg}
          </div>
        )}

        <div className="flex min-h-11 justify-center">
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          ) : (
            <GoogleLogin
              onSuccess={(response) => {
                void handleGoogleSuccess(response.credential);
              }}
              onError={() => {
                setErrorMsg('Google sign-in could not be completed. Please try again.');
              }}
              useOneTap={false}
              text="continue_with"
              shape="rectangular"
              theme="outline"
              width="280"
            />
          )}
        </div>

        <p className="mt-5 text-xs leading-relaxed text-gray-500">
          Google verifies your identity before BRIVOO creates your session.
        </p>
      </div>
    </div>
  );
};
