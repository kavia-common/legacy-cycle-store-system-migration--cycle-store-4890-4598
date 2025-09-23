'use strict';

const express = require('express');
const router = express.Router();

// Simple in-memory stores for bootstrap
const inventory = [
  { id: 'i-1', name: 'Road Bike', quantity: 10, price: 899.99 },
  { id: 'i-2', name: 'Helmet', quantity: 50, price: 49.99 },
];

const sales = [];

// PUBLIC_INTERFACE
router.get('/inventory', (_req, res) => {
  /** List all inventory items (bootstrap in-memory). */
  res.status(200).json(inventory);
});

// PUBLIC_INTERFACE
router.post('/sales', (req, res) => {
  /** Create a sales transaction, adjust inventory (bootstrap). */
  const tx = req.body || {};
  if (!Array.isArray(tx.items) || typeof tx.customerId !== 'string') {
    return res.status(400).json({ error: 'ValidationError', message: 'Invalid sales payload', code: 400 });
  }
  // Calculate total and basic stock check
  let total = 0;
  for (const item of tx.items) {
    const inv = inventory.find((i) => i.id === item.id);
    if (!inv) return res.status(400).json({ error: 'ValidationError', message: `Unknown item ${item.id}`, code: 400 });
    const qty = item.quantity || 1;
    if (inv.quantity < qty) return res.status(400).json({ error: 'ValidationError', message: `Insufficient stock ${item.id}`, code: 400 });
    total += (inv.price * qty);
  }
  // Deduct
  for (const item of tx.items) {
    const inv = inventory.find((i) => i.id === item.id);
    inv.quantity -= (item.quantity || 1);
  }
  const record = {
    id: `s-${sales.length + 1}`,
    customerId: tx.customerId,
    items: tx.items,
    total: Math.round(total * 100) / 100,
    timestamp: new Date().toISOString()
  };
  sales.push(record);
  res.status(201).json(record);
});

module.exports = router;
