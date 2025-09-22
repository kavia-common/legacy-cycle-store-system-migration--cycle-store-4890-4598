const Joi = require('joi');
const data = require('../services/dataService');

const inventorySchema = Joi.object({
  sku: Joi.string().max(100).required(),
  name: Joi.string().max(255).required(),
  quantity: Joi.number().integer().min(0).required(),
  price: Joi.number().precision(2).min(0).required(),
  category_id: Joi.number().integer().required(),
});

class InventoryController {
  /**
   * PUBLIC_INTERFACE
   * list - List all inventory items
   */
  async list(req, res, next) {
    try {
      const result = await data.listEntities('Inventory', req.query || {});
      return res.status(200).json(result);
    } catch (e) {
      return next(e);
    }
  }

  /**
   * PUBLIC_INTERFACE
   * create - Create a new inventory item
   */
  async create(req, res, next) {
    try {
      const { error, value } = inventorySchema.validate(req.body || {}, { abortEarly: false, stripUnknown: true });
      if (error) {
        return res.status(400).json({ error: 'validation_error', message: 'Invalid inventory item', code: 400, details: error.details });
      }

      // Optionally call validation endpoint in DataService
      try {
        await data.validateEntity('Inventory', value);
      } catch (_) {
        // best-effort validation; continue
      }

      const created = await data.createEntity('Inventory', value);
      return res.status(201).json(created);
    } catch (e) {
      return next(e);
    }
  }
}

module.exports = new InventoryController();
