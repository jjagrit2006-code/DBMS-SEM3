import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, walletService, sessionService } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('vortex_active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    const defaultUser = {
      user_id: 5,
      username: 'aarav_sharma',
      email: 'aarav@vortexgamer.in',
      role: 'PLAYER',
      full_name: 'Aarav Sharma',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      tier: { name: 'Vortex VIP', hourly_discount_percent: 25, loyalty_points: 3850 },
      wallet: { balance: 2450.00, currency: 'INR' }
    };
    try {
      localStorage.setItem('vortex_active_user', JSON.stringify(defaultUser));
    } catch (e) {}
    return defaultUser;
  });

  const [activeSession, setActiveSession] = useState(null);
  
  const [wallet, setWallet] = useState(() => {
    try {
      const savedBal = localStorage.getItem('vortex_wallet_balance');
      if (savedBal !== null) {
        const num = parseFloat(savedBal);
        if (!isNaN(num)) return { balance: num, currency: 'INR' };
      }
    } catch (e) {}
    return currentUser?.wallet || { balance: 2450.00, currency: 'INR' };
  });

  const [demoAccounts, setDemoAccounts] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    authService.getDemoUsers()
      .then(res => setDemoAccounts(res.data.accounts || []))
      .catch(err => console.warn('Could not load demo accounts:', err.message));
  }, []);

  // Top up money to wallet (persists across state, localStorage, and backend)
  const topupWallet = async (amount, paymentMethod = 'UPI') => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return { error: 'Invalid amount' };

    const currentBal = parseFloat(wallet?.balance || 0);
    const newBal = Math.round((currentBal + amt) * 100) / 100;
    const updatedWallet = { balance: newBal, currency: 'INR' };

    // Update wallet React state & localStorage
    setWallet(updatedWallet);
    try {
      localStorage.setItem('vortex_wallet_balance', newBal.toString());
    } catch (e) {}

    // Update current user & loyalty points
    const earnedPoints = Math.floor(amt / 10);
    const updatedUser = {
      ...currentUser,
      wallet: updatedWallet,
      tier: {
        ...currentUser?.tier,
        loyalty_points: (currentUser?.tier?.loyalty_points || 0) + earnedPoints
      }
    };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('vortex_active_user', JSON.stringify(updatedUser));
    } catch (e) {}

    // Update transaction ledger in localStorage
    let existingTx = [];
    try {
      const savedTx = localStorage.getItem('vortex_wallet_transactions');
      if (savedTx) existingTx = JSON.parse(savedTx);
    } catch (e) {}

    const newTx = {
      transaction_id: Date.now(),
      amount: amt,
      transaction_type: 'TOPUP',
      description: `Digital wallet credit top-up via ${paymentMethod}`,
      balance_after: newBal,
      created_at: new Date().toISOString()
    };
    const updatedTxList = [newTx, ...existingTx];
    try {
      localStorage.setItem('vortex_wallet_transactions', JSON.stringify(updatedTxList));
    } catch (e) {}

    // Sync with backend API if online
    try {
      await walletService.topup({
        user_id: currentUser?.user_id,
        amount: amt,
        payment_method: paymentMethod
      });
    } catch (e) {
      // Offline fallback succeeded
    }

    return { new_balance: newBal, transactions: updatedTxList };
  };

  // Deduct from wallet (for sessions or café orders)
  const deductWallet = async (amount, description = 'Session checkout settlement') => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return false;

    const currentBal = parseFloat(wallet?.balance || 0);
    if (currentBal < amt) return false;

    const newBal = Math.max(0, Math.round((currentBal - amt) * 100) / 100);
    const updatedWallet = { balance: newBal, currency: 'INR' };

    setWallet(updatedWallet);
    try {
      localStorage.setItem('vortex_wallet_balance', newBal.toString());
    } catch (e) {}

    const updatedUser = {
      ...currentUser,
      wallet: updatedWallet
    };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('vortex_active_user', JSON.stringify(updatedUser));
    } catch (e) {}

    let existingTx = [];
    try {
      const savedTx = localStorage.getItem('vortex_wallet_transactions');
      if (savedTx) existingTx = JSON.parse(savedTx);
    } catch (e) {}

    const newTx = {
      transaction_id: Date.now(),
      amount: -amt,
      transaction_type: 'DEBIT',
      description,
      balance_after: newBal,
      created_at: new Date().toISOString()
    };
    const updatedTxList = [newTx, ...existingTx];
    try {
      localStorage.setItem('vortex_wallet_transactions', JSON.stringify(updatedTxList));
    } catch (e) {}

    return true;
  };

  const switchAccount = async (targetUser) => {
    setLoading(true);
    try {
      localStorage.setItem('vortex_active_user', JSON.stringify(targetUser));
      setCurrentUser(targetUser);
      showToast(`Switched active user: ${targetUser.full_name} (${targetUser.role})`, 'success');

      if (targetUser.role === 'PLAYER') {
        const wRes = await walletService.getWallet(targetUser.user_id).catch(() => null);
        if (wRes && wRes.data.wallet) {
          setWallet(wRes.data.wallet);
        }
        const sRes = await sessionService.getMy().catch(() => null);
        if (sRes && sRes.data) {
          setActiveSession(sRes.data.activeSession);
        }
      } else {
        setActiveSession(null);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!currentUser) return;
    try {
      if (currentUser.role === 'PLAYER') {
        const [wRes, sRes] = await Promise.all([
          walletService.getWallet(currentUser.user_id).catch(() => null),
          sessionService.getMy().catch(() => null)
        ]);
        if (wRes && wRes.data?.wallet) setWallet(wRes.data.wallet);
        if (sRes && sRes.data?.activeSession) setActiveSession(sRes.data.activeSession);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    refreshUser();
  }, [currentUser?.user_id]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      setCurrentUser,
      activeSession,
      setActiveSession,
      wallet,
      setWallet,
      topupWallet,
      deductWallet,
      demoAccounts,
      switchAccount,
      refreshUser,
      showToast,
      loading
    }}>
      {children}
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg border text-xs font-medium shadow-xl transition-all ${
          toast.type === 'error'
            ? 'bg-[#1A1E24] border-rose-500/40 text-rose-200'
            : toast.type === 'success'
            ? 'bg-[#1A1E24] border-emerald-500/40 text-emerald-200'
            : 'bg-[#1A1E24] border-blue-500/40 text-blue-200'
        }`}>
          <span className="h-2 w-2 rounded-full bg-current" />
          <span>{toast.message}</span>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
