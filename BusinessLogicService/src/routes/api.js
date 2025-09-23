'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/business');

/**
 * Inventory endpoints
 */

// PUBLIC_INTERFACE
router.get('/inventory', controller.getInventory.bind(controller));
/**
 * @swagger
 * /inventory:
 *   get:
 *     summary: List all inventory items
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: A list of inventory items.
 */

// PUBLIC_INTERFACE
router.post('/inventory', controller.postInventory.bind(controller));
/**
 * @swagger
 * /inventory:
 *   post:
 *     summary: Create a new inventory item
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Inventory item created
 */

/**
 * Sales endpoints
 */

// PUBLIC_INTERFACE
router.post('/sales', controller.postSales.bind(controller));
/**
 * @swagger
 * /sales:
 *   post:
 *     summary: Process a sales transaction
 *     tags: [Sales]
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Sales transaction processed
 */

/**
 * Customer endpoints
 */

// PUBLIC_INTERFACE
router.get('/customers', controller.getCustomers.bind(controller));
/**
 * @swagger
 * /customers:
 *   get:
 *     summary: List all customers
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: A list of customers
 */

// PUBLIC_INTERFACE
router.post('/customers', controller.postCustomers.bind(controller));
/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Customer created
 */

/**
 * Support endpoints
 */

// PUBLIC_INTERFACE
router.get('/support-tickets', controller.getSupportTickets.bind(controller));
/**
 * @swagger
 * /support-tickets:
 *   get:
 *     summary: List all support tickets
 *     tags: [Support]
 *     responses:
 *       200:
 *         description: A list of support tickets
 */

// PUBLIC_INTERFACE
router.post('/support-tickets', controller.postSupportTickets.bind(controller));
/**
 * @swagger
 * /support-tickets:
 *   post:
 *     summary: Create a new support ticket
 *     tags: [Support]
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Support ticket created
 */

module.exports = router;
