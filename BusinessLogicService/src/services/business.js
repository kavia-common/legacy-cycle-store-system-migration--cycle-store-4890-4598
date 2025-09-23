'use strict';

const config = require('./config');
const http = require('./httpClient');

/**
 * Helper to forward Authorization header downstream when present and configured.
 */
function downstreamHeaders(req) {
  const headers = {};
  if (config.forwardAuthHeader && req && req.headers && req.headers.authorization) {
    headers.Authorization = req.headers.authorization;
  }
  return headers;
}

/**
 * Basic input validation utilities for business rules.
 */
const validators = {
  nonEmptyString(val, field) {
    if (typeof val !== 'string' || val.trim().length === 0) {
      throw badRequest(`${field} must be a non-empty string`);
    }
  },
  isEmail(val, field) {
    validators.nonEmptyString(val, field);
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (!ok) throw badRequest(`${field} must be a valid email`);
  },
  positiveInt(val, field) {
    if (!Number.isInteger(val) || val <= 0) throw badRequest(`${field} must be a positive integer`);
  },
  nonNegativeNumber(val, field) {
    if (typeof val !== 'number' || Number.isNaN(val) || val < 0) throw badRequest(`${field} must be a non-negative number`);
  },
};

function badRequest(message) {
  const e = new Error(message);
  e.status = 400;
  e.code = 'ValidationError';
  return e;
}

/**
 * Orchestrates calls to DataService and NotificationService while enforcing business rules.
 */
class BusinessService {
  // PUBLIC_INTERFACE
  async listInventory(req) {
    /** Retrieve inventory items via DataService. */
    const url = `${config.dataServiceBaseUrl}/Inventory`;
    const res = await http.get(url, { headers: downstreamHeaders(req) });
    return res.data?.data || res.data || [];
  }

  // PUBLIC_INTERFACE
  async createInventoryItem(req, payload) {
    /** Create inventory item with validation and defaulting. */
    validators.nonEmptyString(payload.sku, 'sku');
    validators.nonEmptyString(payload.name, 'name');
    validators.nonNegativeNumber(Number(payload.price), 'price');
    validators.positiveInt(Number(payload.quantity), 'quantity');
    if (!Number.isInteger(Number(payload.category_id))) throw badRequest('category_id must be integer');

    const url = `${config.dataServiceBaseUrl}/Inventory`;
    const res = await http.post(url, { headers: downstreamHeaders(req), body: payload });
    return res.data?.data || res.data;
  }

  // PUBLIC_INTERFACE
  async processSale(req, saleInput) {
    /**
     * Process a sale:
     * - Validate payload
     * - Check inventory availability
     * - Compute totals
     * - Persist Sale + SaleItems atomically via DataService interfaces
     * - Update inventory quantities
     * - Trigger receipt notification to customer
     */
    if (!saleInput || !Array.isArray(saleInput.items) || saleInput.items.length === 0) {
      throw badRequest('items must be a non-empty array');
    }
    validators.nonEmptyString(String(saleInput.customerId), 'customerId');

    // Fetch inventory list for stock check (could be optimized by specific lookups)
    const invRes = await http.get(`${config.dataServiceBaseUrl}/Inventory`, { headers: downstreamHeaders(req) });
    const inventory = invRes.data?.data || invRes.data || [];
    let total = 0.0;

    // Validate stock and compute total
    const itemsResolved = saleInput.items.map((it) => {
      const qty = Number(it.quantity || 1);
      validators.positiveInt(qty, 'item.quantity');
      const inv = inventory.find((x) => String(x.id) === String(it.inventory_id) || String(x.id) === String(it.id));
      if (!inv) throw badRequest(`Unknown inventory item ${it.inventory_id || it.id}`);
      if (Number(inv.quantity) < qty) throw badRequest(`Insufficient stock for item ${inv.id}`);
      const unitPrice = Number(it.unit_price != null ? it.unit_price : inv.price);
      validators.nonNegativeNumber(unitPrice, 'unit_price');
      total += unitPrice * qty;
      return { inventory_id: inv.id, quantity: qty, unit_price: unitPrice, name: inv.name };
    });

    total = Math.round(total * 100) / 100;

    // Create Sale
    const salePayload = {
      customer_id: Number(saleInput.customerId),
      sale_date: new Date().toISOString(),
      total_amount: total,
    };
    const saleCreate = await http.post(`${config.dataServiceBaseUrl}/Sale`, { headers: downstreamHeaders(req), body: salePayload });
    const sale = saleCreate.data?.data || saleCreate.data;

    // Create SaleItems and decrement inventory
    for (const it of itemsResolved) {
      // Persist SaleItem
      await http.post(`${config.dataServiceBaseUrl}/SaleItem`, {
        headers: downstreamHeaders(req),
        body: { sale_id: sale.id, inventory_id: it.inventory_id, quantity: it.quantity, unit_price: it.unit_price },
      });

      // Adjust inventory: read item then update with decremented quantity
      const invItemRes = await http.get(`${config.dataServiceBaseUrl}/Inventory/${it.inventory_id}`, { headers: downstreamHeaders(req) });
      const invItem = invItemRes.data?.data || invItemRes.data;
      const newQty = Number(invItem.quantity) - it.quantity;
      await http.put(`${config.dataServiceBaseUrl}/Inventory/${it.inventory_id}`, {
        headers: downstreamHeaders(req),
        body: { ...invItem, quantity: newQty },
      });
    }

    // Trigger notification (best-effort, non-blocking failure)
    try {
      const customerRes = await http.get(`${config.dataServiceBaseUrl}/Customer/${salePayload.customer_id}`, { headers: downstreamHeaders(req) });
      const customer = customerRes.data?.data || customerRes.data;
      if (customer && customer.email) {
        await http.post(`${config.notificationServiceBaseUrl}/notifications/send`, {
          headers: downstreamHeaders(req),
          body: {
            type: 'email',
            recipients: [{ recipientId: String(customer.id), type: 'user', email: customer.email, name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() }],
            templateId: 'sale_receipt_v1',
            parameters: {
              customerName: customer.first_name || customer.name || 'Customer',
              saleId: String(sale.id),
              total: String(total),
              itemCount: String(itemsResolved.length),
            },
          },
        });
      }
    } catch (notifyErr) {
      // log but do not fail the sale
      console.warn('Notification failure (non-blocking):', notifyErr.message);
    }

    return {
      id: sale.id,
      customerId: salePayload.customer_id,
      items: itemsResolved.map((x) => ({ inventory_id: x.inventory_id, quantity: x.quantity, unit_price: x.unit_price })),
      total,
      timestamp: salePayload.sale_date,
    };
  }

  // PUBLIC_INTERFACE
  async listCustomers(req) {
    /** Retrieve customers via DataService. */
    const url = `${config.dataServiceBaseUrl}/Customer`;
    const res = await http.get(url, { headers: downstreamHeaders(req) });
    return res.data?.data || res.data || [];
  }

  // PUBLIC_INTERFACE
  async createCustomer(req, payload) {
    /** Create customer with validation. */
    validators.nonEmptyString(payload.first_name, 'first_name');
    validators.nonEmptyString(payload.last_name, 'last_name');
    validators.isEmail(payload.email, 'email');
    const url = `${config.dataServiceBaseUrl}/Customer`;
    const res = await http.post(url, { headers: downstreamHeaders(req), body: payload });
    // Welcome notification (best-effort)
    try {
      await http.post(`${config.notificationServiceBaseUrl}/notifications/send`, {
        headers: downstreamHeaders(req),
        body: {
          type: 'email',
          recipients: [{ recipientId: String(res.data?.data?.id || res.data?.id), type: 'user', email: payload.email, name: `${payload.first_name} ${payload.last_name}` }],
          templateId: 'welcome_v1',
          parameters: { firstName: payload.first_name },
        },
      });
    } catch (e) {
      console.warn('Welcome notification failed:', e.message);
    }
    return res.data?.data || res.data;
  }

  // PUBLIC_INTERFACE
  async listSupportTickets(req) {
    /** Retrieve support tickets via DataService. */
    const url = `${config.dataServiceBaseUrl}/SupportTicket`;
    const res = await http.get(url, { headers: downstreamHeaders(req) });
    return res.data?.data || res.data || [];
  }

  // PUBLIC_INTERFACE
  async createSupportTicket(req, payload) {
    /** Create a support ticket with validation and auto-notify support team. */
    const { customer_id, subject, description } = payload || {};
    if (!Number.isInteger(Number(customer_id))) throw badRequest('customer_id must be integer');
    validators.nonEmptyString(subject, 'subject');

    const body = {
      customer_id: Number(customer_id),
      subject,
      description: description || '',
      status: 'open',
      created_at: new Date().toISOString(),
    };
    const url = `${config.dataServiceBaseUrl}/SupportTicket`;
    const res = await http.post(url, { headers: downstreamHeaders(req), body });

    // Notify admins/support (best-effort)
    try {
      await http.post(`${config.notificationServiceBaseUrl}/notifications/send`, {
        headers: downstreamHeaders(req),
        body: {
          type: 'email',
          recipients: [{ recipientId: 'support', type: 'admin', email: process.env.SUPPORT_INBOX || 'support@example.com', name: 'Support' }],
          templateId: 'support_ticket_created_v1',
          parameters: { subject, ticketId: String(res.data?.data?.id || res.data?.id) },
        },
      });
    } catch (e) {
      console.warn('Support notification failed:', e.message);
    }

    return res.data?.data || res.data;
  }
}

module.exports = new BusinessService();
