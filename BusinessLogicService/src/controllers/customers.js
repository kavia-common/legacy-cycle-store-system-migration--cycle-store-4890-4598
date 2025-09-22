const Joi = require('joi');
const data = require('../services/dataService');

const customerSchema = Joi.object({
  first_name: Joi.string().max(100).required(),
  last_name: Joi.string().max(100).required(),
  email: Joi.string().email().max(255).required(),
  phone: Joi.string().max(20).allow('', null),
});

class CustomersController {
  /**
   * PUBLIC_INTERFACE
   * list - List customers
   */
  async list(req, res, next) {
    try {
      const result = await data.listEntities('Customer', req.query || {});
      return res.status(200).json(result);
    } catch (e) {
      return next(e);
    }
  }

  /**
   * PUBLIC_INTERFACE
   * create - Create a customer
   */
  async create(req, res, next) {
    try {
      const { error, value } = customerSchema.validate(req.body || {}, { abortEarly: false, stripUnknown: true });
      if (error) {
        return res.status(400).json({ error: 'validation_error', message: 'Invalid customer', code: 400, details: error.details });
      }

      try {
        await data.validateEntity('Customer', value);
      } catch (_) { /* ignore */ }

      const created = await data.createEntity('Customer', value);
      return res.status(201).json(created);
    } catch (e) {
      return next(e);
    }
  }
}

module.exports = new CustomersController();
