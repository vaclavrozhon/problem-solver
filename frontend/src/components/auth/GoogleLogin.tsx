import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

declare global {
  interface Window {
    google: any;
  }
}

const GoogleLogin: React.FC = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Google OAuth script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      // Initialize Google OAuth when script loads
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: 'your_google_client_id', // This will be replaced with actual client ID
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            width: 250
          }
        );
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = async (response: any) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(response.credential);
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the test user endpoint for development
      const response = await fetch('/auth/dev/create-test-user', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Test login failed');
      }

      const data = await response.json();

      // Manually set the auth state for test user
      localStorage.setItem('authToken', data.access_token);
      localStorage.setItem('authUser', JSON.stringify(data.user));
      window.location.reload(); // Simple reload to trigger auth context update
    } catch (err) {
      setError('Test login failed. Please try again.');
      console.error('Test login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Automatic Researcher
          </h2>
          <p className="mt-2 text-gray-600">
            Sign in to start your AI research journey
          </p>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col items-center space-y-4">
            <div id="google-signin-button" className="flex justify-center"></div>

            {/* Development test login button */}
            <div className="text-center">
              <button
                onClick={handleTestLogin}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Test Login (Development)'}
              </button>
              <p className="mt-2 text-xs text-gray-500">
                For development and testing purposes
              </p>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>By signing in, you agree to our terms of service.</p>
            <p className="mt-1">You'll start with $10.00 in research credits.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleLogin;