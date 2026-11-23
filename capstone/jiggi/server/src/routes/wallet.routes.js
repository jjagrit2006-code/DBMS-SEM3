const express = require('express');
const router = express.Router();
const { isLive, getPool, memoryState, executeSimulation } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get wallet balance and transactions
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const targetUserId = (req.query.user_id && (req.user.role === 'ADMIN' || req.user.role === 'STAFF'))
      ? parseInt(req.query.user_id, 10)
      : req.user.user_id;

    if (isLive()) {
      const pool = getPool();
      const [wRows] = await pool.query('SELECT * FROM player_wallets WHERE user_id = ?', [targetUserId]);
      const wallet = wRows[0] || { balance: 0.00, currency: 'USD' };

      const [txRows] = await pool.query(`
        SELECT * FROM wallet_transactions 
        WHERE wallet_id = ? 
        ORDER BY transaction_id DESC 
        LIMIT 30
      `, [wallet.wallet_id || 0]);

      return res.json({ wallet, transactions: txRows });
    } else {
      const wallet = memoryState.player_wallets.find(w => w.user_id === targetUserId) || { balance: 0.00, currency: 'USD' };
      const txs = memoryState.wallet_transactions
        .filter(t => t.wallet_id === wallet.wallet_id)
        .sort((a, b) => b.transaction_id - a.transaction_id);

      return res.json({ wallet, transactions: txs });
    }
  } catch (err) {
    next(err);
  }
});

// Top-up wallet credits (triggers sp_topup_wallet)
router.post('/topup', authenticateToken, async (req, res, next) => {
  try {
    const targetUserId = (req.body.user_id && (req.user.role === 'ADMIN' || req.user.role === 'STAFF'))
      ? parseInt(req.body.user_id, 10)
      : req.user.user_id;

    const { amount, payment_method, reference_id } = req.body;
    const topupAmount = parseFloat(amount);
    const method = payment_method || 'CREDIT_CARD';
    const ref = reference_id || `TOP-${Date.now()}`;

    if (isNaN(topupAmount) || topupAmount <= 0) {
      return res.status(400).json({ error: 'Top-up amount must be strictly greater than zero.' });
    }

    if (isLive()) {
      const pool = getPool();
      await pool.query(
        'CALL sp_topup_wallet(?, ?, ?, ?, @p_new_balance)',
        [targetUserId, topupAmount, method, ref]
      );
      const [outRows] = await pool.query('SELECT @p_new_balance AS new_balance');
      const newBalance = outRows[0]?.new_balance;

      return res.json({
        success: true,
        message: `Successfully topped up $${topupAmount.toFixed(2)} to digital lounge wallet.`,
        new_balance: newBalance
      });
    } else {
      const result = executeSimulation('sp_topup_wallet', [targetUserId, topupAmount, method, ref]);
      return res.json({
        success: true,
        message: `Successfully topped up $${topupAmount.toFixed(2)} to digital lounge wallet.`,
        new_balance: result.new_balance
      });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
