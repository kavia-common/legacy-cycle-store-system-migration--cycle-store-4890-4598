'use strict';

const businessService = require('../services/business');

function handleError(res, err) {
  const status = err.status || 500;
  res.status(status).json({
    error: err.code || 'Error',
    message: err.message || 'Internal Server Error',
    code: status,
  });
}

class BusinessController {
  // PUBLIC_INTERFACE
  async getInventory(req, res) {
    /** List inventory items through BusinessService. */
    try {
      const items = await businessService.listInventory(req);
      res.status(200).json(items);
    } catch (err) {
      handleError(res, err);
    }
  }

  // PUBLIC_INTERFACE
  async postInventory(req, res) {
    /** Create a new inventory item. */
    try {
      const created = await businessService.createInventoryItem(req, req.body || {});
      res.status(201).json(created);
    } catch (err) {
      handleError(res, err);
    }
  }

  // PUBLIC_INTERFACE
  async postSales(req, res) {
    /** Process a new sale transaction. */
    try {
      const result = await businessService.processSale(req, req.body || {});
      res.status(201).json(result);
    } catch (err) {
      handleError(res, err);
    }
  }

  // PUBLIC_INTERFACE
  async getCustomers(req, res) {
    /** List customers. */
    try {
      const data = await businessService.listCustomers(req);
      res.status(200).json(data);
    } catch (err) {
      handleError(res, err);
    }
  }

  // PUBLIC_INTERFACE
  async postCustomers(req, res) {
    /** Create a new customer. */
    try {
      const created = await businessService.createCustomer(req, req.body || {});
      res.status(201).json(created);
    } catch (err) {
      handleError(res, err);
    }
  }

  // PUBLIC_INTERFACE
  async getSupportTickets(req, res) {
    /** List support tickets. */
    try {
      const data = await businessService.listSupportTickets(req);
      res.status(200).json(data);
    } catch (err) {
      handleError(res, err);
    }
  }

  // PUBLIC_INTERFACE
  async postSupportTickets(req, res) {
    /** Create a support ticket. */
    try {
      const created = await businessService.createSupportTicket(req, req.body || {});
      res.status(201).json(created);
    } catch (err) {
      handleError(res, err);
    }
  }
}

module.exports = new BusinessController();
