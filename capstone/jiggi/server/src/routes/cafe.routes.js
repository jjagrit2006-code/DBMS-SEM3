const express = require('express');
const router = express.Router();
const { isLive, getPool, memoryState } = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get menu items grouped by category
router.get('/menu', async (req, res, next) => {
  try {
    if (isLive()) {
      const pool = getPool();
      const [cats] = await pool.query('SELECT * FROM cafe_categories ORDER BY display_order ASC');
      const [items] = await pool.query(`
        SELECT 
          ci.*,
          cc.name AS category_name
        FROM cafe_items ci
        JOIN cafe_categories cc ON ci.cafe_cat_id = cc.cafe_cat_id
        WHERE ci.is_available = TRUE
        ORDER BY ci.item_id ASC
      `);
      return res.json({ categories: cats, items });
    } else {
      const items = memoryState.cafe_items.filter(i => i.is_available).map(i => {
        const cat = memoryState.cafe_categories.find(c => c.cafe_cat_id === i.cafe_cat_id);
        return { ...i, category_name: cat ? cat.name : 'General' };
      });
      return res.json({ categories: memoryState.cafe_categories, items });
    }
  } catch (err) {
    next(err);
  }
});

// Place café order
router.post('/order', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { items, station_id, session_id, delivery_note, payment_method } = req.body;
    const method = payment_method || 'WALLET';

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must include at least one menu item.' });
    }

    if (isLive()) {
      const pool = getPool();
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        // Calculate total amount and check stock
        let totalAmount = 0;
        const processedItems = [];

        for (const orderItem of items) {
          const [itemRows] = await conn.query('SELECT * FROM cafe_items WHERE item_id = ? FOR UPDATE', [orderItem.item_id]);
          if (itemRows.length === 0) {
            throw new Error(`Menu item ID ${orderItem.item_id} does not exist.`);
          }
          const item = itemRows[0];
          if (item.stock_quantity < orderItem.quantity) {
            throw new Error(`Insufficient stock for '${item.name}' (available: ${item.stock_quantity}).`);
          }
          const subtotal = item.price * orderItem.quantity;
          totalAmount += subtotal;
          processedItems.push({
            item_id: item.item_id,
            quantity: orderItem.quantity,
            unit_price: item.price,
            subtotal
          });
        }

        // Deduct from wallet if method is WALLET
        if (method === 'WALLET') {
          const [wRows] = await conn.query('SELECT * FROM player_wallets WHERE user_id = ? FOR UPDATE', [userId]);
          if (wRows.length === 0 || wRows[0].balance < totalAmount) {
            throw new Error('Insufficient digital wallet balance to pay for café order.');
          }
          await conn.query('UPDATE player_wallets SET balance = balance - ? WHERE user_id = ?', [totalAmount, userId]);
          await conn.query(`
            INSERT INTO wallet_transactions (wallet_id, amount, transaction_type, description, balance_after)
            VALUES (?, ?, 'CAFE_PURCHASE', 'Lounge Café snack & beverage purchase', ?)
          `, [wRows[0].wallet_id, -totalAmount, wRows[0].balance - totalAmount]);
        }

        // Create cafe_order
        const [orderResult] = await conn.query(`
          INSERT INTO cafe_orders (user_id, session_id, station_id, order_status, payment_status, payment_method, total_amount, delivery_note)
          VALUES (?, ?, ?, 'PLACED', 'PAID', ?, ?, ?)
        `, [userId, session_id || null, station_id || null, method, totalAmount, delivery_note || null]);

        const orderId = orderResult.insertId;

        // Insert order items (trigger trg_after_cafe_order_item_insert will decrement stock automatically!)
        for (const pi of processedItems) {
          await conn.query(`
            INSERT INTO cafe_order_items (order_id, item_id, quantity, unit_price, subtotal)
            VALUES (?, ?, ?, ?, ?)
          `, [orderId, pi.item_id, pi.quantity, pi.unit_price, pi.subtotal]);
        }

        await conn.commit();
        return res.status(201).json({ success: true, order_id: orderId, total_amount: totalAmount });
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    } else {
      // In-Memory order handling
      let total = 0;
      const orderItemsList = [];

      for (const reqItem of items) {
        const item = memoryState.cafe_items.find(i => i.item_id === parseInt(reqItem.item_id, 10));
        if (!item) throw new Error(`Item ${reqItem.item_id} not found`);
        if (item.stock_quantity < reqItem.quantity) {
          throw new Error(`Insufficient stock for '${item.name}'`);
        }
        item.stock_quantity -= reqItem.quantity;
        const subtotal = item.price * reqItem.quantity;
        total += subtotal;
        orderItemsList.push({
          item_id: item.item_id,
          name: item.name,
          quantity: reqItem.quantity,
          unit_price: item.price,
          subtotal
        });
      }

      if (method === 'WALLET') {
        const wallet = memoryState.player_wallets.find(w => w.user_id === userId);
        if (!wallet || wallet.balance < total) {
          throw new Error('Insufficient wallet balance');
        }
        wallet.balance = Math.round((wallet.balance - total) * 100) / 100;
        memoryState.wallet_transactions.push({
          transaction_id: memoryState.wallet_transactions.length + 1,
          wallet_id: wallet.wallet_id,
          amount: -total,
          transaction_type: 'CAFE_PURCHASE',
          reference_id: `ORD-${Date.now()}`,
          description: 'Lounge Café snack & beverage purchase',
          balance_after: wallet.balance,
          created_at: new Date().toISOString()
        });
      }

      const newOrder = {
        order_id: memoryState.cafe_orders.length + 100,
        user_id: userId,
        session_id: session_id || null,
        station_id: station_id || null,
        order_status: 'PLACED',
        payment_status: 'PAID',
        payment_method: method,
        total_amount: Math.round(total * 100) / 100,
        delivery_note: delivery_note || null,
        created_at: new Date().toISOString(),
        items: orderItemsList
      };

      memoryState.cafe_orders.unshift(newOrder);
      return res.status(201).json({ success: true, order: newOrder });
    }
  } catch (err) {
    next(err);
  }
});

// Get kitchen/bar fulfillment queue (Staff / Admin)
router.get('/orders', authenticateToken, async (req, res, next) => {
  try {
    const isStaffOrAdmin = req.user.role === 'STAFF' || req.user.role === 'ADMIN';
    const userId = req.user.user_id;

    if (isLive()) {
      const pool = getPool();
      let query = `
        SELECT 
          co.order_id,
          co.user_id,
          co.session_id,
          co.station_id,
          co.order_status,
          co.payment_status,
          co.payment_method,
          co.total_amount,
          co.delivery_note,
          co.created_at,
          u.username,
          u.full_name,
          gs.station_code,
          gs.location_zone
        FROM cafe_orders co
        JOIN users u ON co.user_id = u.user_id
        LEFT JOIN gaming_stations gs ON co.station_id = gs.station_id
      `;
      const params = [];
      if (!isStaffOrAdmin) {
        query += ' WHERE co.user_id = ?';
        params.push(userId);
      }
      query += ' ORDER BY co.order_id DESC LIMIT 50';

      const [orders] = await pool.query(query, params);

      // Fetch items for these orders
      for (const order of orders) {
        const [items] = await pool.query(`
          SELECT coi.*, ci.name 
          FROM cafe_order_items coi
          JOIN cafe_items ci ON coi.item_id = ci.item_id
          WHERE coi.order_id = ?
        `, [order.order_id]);
        order.items = items;
      }

      return res.json({ orders });
    } else {
      let orders = memoryState.cafe_orders;
      if (!isStaffOrAdmin) {
        orders = orders.filter(o => o.user_id === userId);
      }
      const mapped = orders.map(o => {
        const user = memoryState.users.find(u => u.user_id === o.user_id) || {};
        const station = memoryState.gaming_stations.find(s => s.station_id === o.station_id) || {};
        return {
          ...o,
          username: user.username,
          full_name: user.full_name,
          station_code: station.station_code || 'Counter Pickup',
          location_zone: station.location_zone || 'Lounge Bar'
        };
      });
      return res.json({ orders: mapped });
    }
  } catch (err) {
    next(err);
  }
});

// Update order status (Staff / Admin)
router.patch('/orders/:id/status', authenticateToken, requireRole(['STAFF', 'ADMIN']), async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { status } = req.body;
    const valid = ['PLACED', 'PREPARING', 'SERVED', 'CANCELLED'];

    if (!valid.includes(status)) {
      return res.status(400).json({ error: `Invalid order status. Must be one of: ${valid.join(', ')}` });
    }

    if (isLive()) {
      const pool = getPool();
      await pool.query('UPDATE cafe_orders SET order_status = ? WHERE order_id = ?', [status, orderId]);
      return res.json({ success: true, order_id: orderId, status });
    } else {
      const order = memoryState.cafe_orders.find(o => o.order_id === orderId);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      order.order_status = status;
      return res.json({ success: true, order_id: orderId, status });
    }
  } catch (err) {
    next(err);
  }
});

// Update stock quantity (Admin / Staff)
router.patch('/items/:id/stock', authenticateToken, requireRole(['STAFF', 'ADMIN']), async (req, res, next) => {
  try {
    const itemId = parseInt(req.params.id, 10);
    const { stock_quantity } = req.body;

    if (stock_quantity === undefined || stock_quantity < 0) {
      return res.status(400).json({ error: 'Stock quantity must be non-negative.' });
    }

    if (isLive()) {
      const pool = getPool();
      await pool.query('UPDATE cafe_items SET stock_quantity = ? WHERE item_id = ?', [stock_quantity, itemId]);
      return res.json({ success: true, item_id: itemId, stock_quantity });
    } else {
      const item = memoryState.cafe_items.find(i => i.item_id === itemId);
      if (!item) return res.status(404).json({ error: 'Item not found' });
      item.stock_quantity = stock_quantity;
      return res.json({ success: true, item_id: itemId, stock_quantity });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
