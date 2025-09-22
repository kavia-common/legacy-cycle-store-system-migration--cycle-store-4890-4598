const Joi = require('joi');
const data = require('../services/dataService');
const notifier = require('../services/notificationService');

const ticketSchema = Joi.object({
  customer_id: Joi.number().integer().required(),
  subject: Joi.string().max(255).required(),
  description: Joi.string().allow('', null),
});

class SupportController {
  /**
   * PUBLIC_INTERFACE
   * list - List support tickets
   */
  async list(req, res, next) {
    try {
      const result = await data.listEntities('SupportTicket', req.query || {});
      return res.status(200).json(result);
    } catch (e) {
      return next(e);
    }
  }

  /**
   * PUBLIC_INTERFACE
   * create - Create a support ticket and send acknowledgement notification
   */
  async create(req, res, next) {
    try {
      const { error, value } = ticketSchema.validate(req.body || {}, { abortEarly: false, stripUnknown: true });
      if (error) {
        return res.status(400).json({ error: 'validation_error', message: 'Invalid support ticket', code: 400, details: error.details });
      }

      const payload = {
        customer_id: value.customer_id,
        subject: value.subject,
        description: value.description || '',
        status: 'open',
        created_at: new Date().toISOString(),
      };
      const created = await data.createEntity('SupportTicket', payload);

      // Best-effort: acknowledgement notification
      try {
        await notifier.sendNotification({
          type: 'email',
          recipients: [{ recipientId: String(value.customer_id), type: 'user' }],
          templateId: 'support_ack',
          parameters: { subject: value.subject },
        });
      } catch (_) { /* ignore */ }

      return res.status(201).json(created);
    } catch (e) {
      return next(e);
    }
  }
}

module.exports = new SupportController();
