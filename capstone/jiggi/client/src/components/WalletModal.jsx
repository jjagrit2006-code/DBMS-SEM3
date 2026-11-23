import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { walletService } from '../services/api';
import { Wallet, X, ArrowUpRight, CreditCard, Smartphone, Sparkles } from 'lucide-react';

export default function WalletModal({ isOpen, onClose }) {
  const { currentUser, wallet, topupWallet, showToast } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadTransactions();
    }
  }, [isOpen, currentUser?.user_id]);

  const loadTransactions = async () => {
    try {
      const res = await walletService.getWallet(currentUser.user_id);
      if (res.data?.transactions) {
        setTransactions(res.data.transactions);
      }
    } catch (err) {
      console.warn('Could not load transactions:', err.message);
    }
  };

  const handleTopup = async (e) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (isNaN(finalAmount) || finalAmount <= 0) {
      showToast('Enter a valid credit top-up amount', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await topupWallet(finalAmount, paymentMethod);
      if (result?.error) {
        showToast(result.error, 'error');
        return;
      }
      showToast(`Added ₹${finalAmount.toLocaleString('en-IN')} to lounge wallet!`, 'success');
      setCustomAmount('');
      if (result?.transactions) {
        setTransactions(result.transactions);
      }
    } catch (err) {
      showToast(err.message || 'Error topping up wallet', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentBalance = parseFloat(wallet?.balance || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl bg-[#14171C] border border-[#272D37] shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1F242C] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#0D0F12] border border-[#272D37] text-blue-400">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F8FAFC]">Digital Lounge Wallet</h2>
              <p className="text-[11px] text-[#94A3B8]">Prepaid gaming credits for battle rigs and café refreshments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E232B] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Balance Card */}
        <div className="rounded-lg bg-[#0D0F12] p-4 border border-[#20252D] mb-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">Available Balance</span>
            <div className="font-mono tabular-nums text-2xl font-bold text-[#F8FAFC] mt-0.5">
              ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-[#94A3B8] mt-0.5">
              {currentUser?.tier?.name || 'Standard'} Tier • {currentUser?.tier?.hourly_discount_percent || 0}% Hourly Pass
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] flex items-center justify-end gap-1">
              <Sparkles className="h-3 w-3 text-amber-400" /> Loyalty
            </span>
            <div className="font-mono tabular-nums text-base font-bold text-amber-400">
              {currentUser?.tier?.loyalty_points || 0} pts
            </div>
            <span className="text-[10px] text-[#64748B] font-mono">1 pt / ₹10 spent</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleTopup} className="space-y-4 mb-5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8]">
            Select Top-Up Amount
          </div>

          {/* Quick presets in INR */}
          <div className="grid grid-cols-4 gap-2">
            {[200, 500, 1000, 2000].map(amt => (
              <button
                type="button"
                key={amt}
                onClick={() => {
                  setSelectedAmount(amt);
                  setCustomAmount('');
                }}
                className={`py-2 rounded-lg font-mono tabular-nums text-xs font-semibold border transition-all ${
                  selectedAmount === amt && !customAmount
                    ? 'bg-[#20252D] text-white border-[#3B82F6]'
                    : 'bg-[#16191E] border-[#222730] text-[#CBD5E1] hover:border-[#323946]'
                }`}
              >
                +₹{amt.toLocaleString('en-IN')}
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="relative">
            <span className="absolute left-3 top-2.5 font-mono text-xs text-[#94A3B8]">₹</span>
            <input
              type="number"
              placeholder="Custom rupee amount (e.g. 750)..."
              value={customAmount}
              onChange={e => {
                setCustomAmount(e.target.value);
                setSelectedAmount(0);
              }}
              min="50"
              step="50"
              className="w-full pl-7 pr-3 py-2 rounded-lg bg-[#0D0F12] border border-[#222730] text-xs font-mono tabular-nums text-[#F8FAFC] focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Payment Method */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'UPI', label: 'UPI / QR', icon: Smartphone },
              { id: 'CREDIT_CARD', label: 'Card', icon: CreditCard },
              { id: 'CASH', label: 'Desk Cash', icon: Wallet }
            ].map(pm => {
              const Icon = pm.icon;
              return (
                <button
                  type="button"
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    paymentMethod === pm.id
                      ? 'bg-[#20252D] border-[#3B82F6] text-white'
                      : 'bg-[#16191E] border-[#222730] text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 text-blue-400" />
                  {pm.label}
                </button>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs shadow-sm transition-all active:scale-[0.99]"
          >
            {loading ? 'Processing Transaction...' : `Add ₹${(customAmount || selectedAmount).toLocaleString('en-IN')} Credits`}
          </button>
        </form>

        {/* Recent Ledger */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] mb-2 flex items-center justify-between">
            <span>Recent Ledger</span>
            <span className="text-[#64748B]">Auto-Settled</span>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1.5 pr-0.5">
            {transactions.length === 0 ? (
              <div className="text-xs text-[#64748B] py-2">No transactions recorded.</div>
            ) : (
              transactions.slice(0, 5).map(tx => {
                const isCredit = parseFloat(tx.amount) > 0;
                return (
                  <div
                    key={tx.transaction_id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#101317] border border-[#1E232B] text-xs"
                  >
                    <div className="truncate pr-2">
                      <div className="text-[#F8FAFC] truncate">{tx.description}</div>
                      <div className="text-[10px] text-[#64748B] font-mono">
                        {new Date(tx.created_at).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <div className={`font-mono tabular-nums font-semibold shrink-0 ${isCredit ? 'text-emerald-400' : 'text-[#F8FAFC]'}`}>
                      {isCredit ? '+' : ''}₹{Math.abs(parseFloat(tx.amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
