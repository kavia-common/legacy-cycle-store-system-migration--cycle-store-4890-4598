const Joi = require('joi');
const data = require('../services/dataService');
const notifier = require('../services/notificationService');

const saleItemSchema = Joi.object({
  inventory_id: Joi.number().integer().required(),
  quantity: Joi.number().integer().min(1).required(),
});

const saleSchema = Joi.object({
  customer_id: Joi.number().integer().required(),
  items: Joi.array().items(saleItemSchema).min(1).required(),
  client_total: Joi.number().precision(2).min(0).optional(),
});

class SalesController {
  /**
   * PUBLIC_INTERFACE
   * create - Process a sales transaction:
   *  - Validate payload
   *  - Fetch inventory to enforce stock and pricing
   *  - Compute total and compare with client_total if provided
   *  - Create Sale, SaleItems, and update Inventory quantities
   *  - Emit notification (best-effort)
   */
  async create(req, res, next) {
    try {
      const { error, value } = saleSchema.validate(req.body || {}, { abortEarly: false, stripUnknown: true });
      if (error) {
        return res.status(400).json({ error: 'validation_error', message: 'Invalid sales transaction', code: 400, details: error.details });
      }

      const { customer_id, items, client_total } = value;

      // Fetch all inventory items referenced
      const inventoryDetails = [];
      for (const it of items) {
        const inv = await data.getEntityById('Inventory', it.inventory_id);
        if (!inv || !inv.data) {
          return res.status(400).json({ error: 'validation_error', message: `Inventory item ${it.inventory_id} not found`, code: 400 });
        }
        const invItem = inv.data;
        // Enforce stock rule
        if (Number(invItem.quantity) < Number(it.quantity)) {
          return res.status(400).json({ error: 'business_rule_violation', message: `Insufficient stock for item ${invItem.id}`, code: 400 });
        }
        // Enforce pricing rule (non-negative)
        if (Number(invItem.price) < 0) {
          return res.status(400).json({ error: 'business_rule_violation', message: `Invalid price for item ${invItem.id}`, code: 400 });
        }
        inventoryDetails.push(invItem);
      }

      // Compute authoritative total from current prices
      let serverTotal = 0;
      items.forEach((it) => {
        const inv = inventoryDetails.find(x => Number(x.id) === Number(it.inventory_id));
        serverTotal += Number(inv.price) * Number(it.quantity);
      });
      serverTotal = Math.round(serverTotal * 100) / 100;

      // If client_total provided, enforce acceptable difference <= 1 cent
      if (client_total != null) {
        const diff = Math.abs(Number(client_total) - serverTotal);
        if (diff > 0.01) {
          return res.status(400).json({ error: 'pricing_mismatch', message: `Client total does not match server total. Server total: ${serverTotal}`, code: 400 });
        }
      }

      // Create Sale
      const salePayload = {
        customer_id,
        sale_date: new Date().toISOString(),
        total_amount: serverTotal,
      };
      const createdSale = await data.createEntity('Sale', salePayload);
      const saleId = createdSale?.data?.id || createdSale?.id;

      // Create SaleItems and update Inventory quantities
      for (const it of items) {
        const inv = inventoryDetails.find(x => Number(x.id) === Number(it.inventory_id));
        await data.createEntity('SaleItem', {
          sale_id: saleId,
          inventory_id: it.inventory_id,
          quantity: it.quantity,
          unit_price: inv.price,
        });
        await data.updateEntity('Inventory', it.inventory_id, {
          ...inv,
          quantity: Number(inv.quantity) - Number(it.quantity),
        });
      }

      // Best-effort notification to customer/admin
      try {
        await notifier.sendNotification({
          type: 'email',
          recipients: [{ recipientId: String(customer_id), type: 'user' }],
          templateId: 'sale_confirmation',
          parameters: {
            saleId: String(saleId),
            total: String(serverTotal),
            itemCount: String(items.length),
          },
        });
      } catch (_) { /* ignore */ }

      return res.status(201).json({
        status: 'success',
        message: 'Sales transaction processed.',
        data: {
          saleId,
          total: serverTotal,
          items,
        },
      });
    } catch (e) {
      return next(e);
    }
  }
}

module.exports = new SalesController();
