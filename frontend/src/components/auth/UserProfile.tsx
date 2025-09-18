import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface CreditTransaction {
  id: number;
  amount: number;
  type: string;
  description: string;
  created_at: string;
  tokens_used?: number;
  model_used?: string;
}

interface CreditsData {
  balance: number;
  spent: number;
  transactions: CreditTransaction[];
}

const UserProfile: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [credits, setCredits] = useState<CreditsData | null>(null);
  const [showTransactions, setShowTransactions] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && token) {
      fetchCredits();
    }
  }, [user, token]);

  const fetchCredits = async () => {
    setLoading(true);
    try {
      const response = await fetch('/auth/credits', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCredits(data);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
        {user.picture_url && (
          <img
            src={user.picture_url}
            alt={user.name || user.email}
            className="w-8 h-8 rounded-full"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user.name || user.email}
          </p>
          <p className="text-xs text-gray-500">
            ${user.credits_balance.toFixed(2)} credits
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowTransactions(!showTransactions)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Credits
          </button>
          <button
            onClick={logout}
            className="text-xs text-gray-600 hover:text-gray-800"
          >
            Logout
          </button>
        </div>
      </div>

      {showTransactions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-900">Credit Usage</h3>
              <button
                onClick={fetchCredits}
                disabled={loading}
                className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {credits && (
              <>
                <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                  <div>
                    <span className="text-gray-500">Balance:</span>
                    <span className="ml-1 font-medium text-green-600">
                      ${credits.balance.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Spent:</span>
                    <span className="ml-1 font-medium text-red-600">
                      ${credits.spent.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-700">Recent Transactions</h4>
                  {credits.transactions.length === 0 ? (
                    <p className="text-xs text-gray-500">No transactions yet</p>
                  ) : (
                    <div className="space-y-1">
                      {credits.transactions.slice(0, 5).map((tx) => (
                        <div key={tx.id} className="flex justify-between items-start text-xs">
                          <div className="flex-1">
                            <p className="text-gray-700">{tx.description}</p>
                            <p className="text-gray-500">
                              {new Date(tx.created_at).toLocaleDateString()}
                              {tx.tokens_used && ` • ${tx.tokens_used} tokens`}
                            </p>
                          </div>
                          <span className={`ml-2 font-medium ${
                            tx.amount >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;