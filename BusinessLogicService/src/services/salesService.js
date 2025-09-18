'use strict';

const dataClient = require('./dataClient');

function validateSalePayload(payload) {
  const errors = [];
  if (!payload) errors.push('payload is required');
  if (payload && !payload.customerId) errors.push('customerId is required');
  if (!Array.isArray(payload?.items) || payload.items.length === 0) errors.push('items must be a non-empty array');
  if (Array.isArray(payload?.items)) {
    payload.items.forEach((it, idx) => {
      if (!it || !it.id) errors.push(`items[${idx}].id (inventory id) is required`);
      if (!Number.isInteger(it.quantity) || it.quantity <= 0) errors.push(`items[${idx}].quantity must be > 0`);
    });
  }
  if (errors.length) {
    const err = new Error('Validation failed');
    err.status = 400;
    err.details = { errors };
    throw err;
  }
}

// PUBLIC_INTERFACE
async function processSale(req, payload) {
  /** Process a sales transaction:
   * - Validate payload
   * - Fetch inventory items
   * - Verify stock levels
   * - Compute total and unit prices
   * - Persist Sale and SaleItems using DataService
   * - Decrement inventory quantities
   */
  validateSalePayload(payload);

  // Fetch inventory details and verify stock
  const enrichedItems = [];
  let computedTotal = 0;

  for (const item of payload.items) {
    const invResp = await dataClient.getEntity(req, 'Inventory', item.id);
    const inv = invResp?.data || invResp;
    if (!inv) {
      const err = new Error(`Inventory item ${item.id} not found`);
      err.status = 404;
      throw err;
    }
    if ((inv.quantity || 0) < item.quantity) {
      const err = new Error(`Insufficient stock for item ${inv.name} (id=${inv.id})`);
      err.status = 400;
      throw err;
    }
    const unitPrice = Number(inv.price);
    const lineTotal = unitPrice * item.quantity;
    computedTotal += lineTotal;
    enrichedItems.push({
      inventory_id: inv.id,
      quantity: item.quantity,
      unit_price: unitPrice,
    });
  }

  const salePayload = {
    customer_id: payload.customerId,
    sale_date: new Date().toISOString(),
    total_amount: Number(computedTotal.toFixed(2)),
  };

  // Create Sale record
  const saleCreated = await dataClient.createEntity(req, 'Sale', salePayload);
  const sale = saleCreated?.data || saleCreated;

  // Create SaleItems
  for (const si of enrichedItems) {
    await dataClient.createEntity(req, 'SaleItem', { ...si, sale_id: sale.id });
  }

  // Decrement inventory
  for (const it of enrichedItems) {
    const current = await dataClient.getEntity(req, 'Inventory', it.inventory_id);
    const inv = current?.data || current;
    const newQty = Math.max(0, (inv.quantity || 0) - it.quantity);
    await dataClient.updateEntity(req, 'Inventory', inv.id, { ...inv, quantity: newQty });
  }

  // Return composed sales transaction view
  return {
    id: sale.id,
    customerId: payload.customerId,
    items: payload.items,
    total: sale.total_amount,
    timestamp: sale.sale_date,
  };
}

module.exports = {
  processSale,
};
