const express = require('express');
const healthController = require('../controllers/health');
const { authenticateJWT } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

const inventoryController = require('../controllers/inventory');
const salesController = require('../controllers/sales');
const customersController = require('../controllers/customers');
const supportController = require('../controllers/support');

const router = express.Router();

// Health (public)
/**
 * @swagger
 * /:
 *   get:
 *     summary: Health endpoint
 *     responses:
 *       200:
 *         description: Service health check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
router.get('/', healthController.check.bind(healthController));

// Authenticated routes below
router.use(authenticateJWT);

// Inventory
/**
 * @swagger
 * /inventory:
 *   get:
 *     summary: List all inventory items
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: A list of inventory items.
 *   post:
 *     summary: Create a new inventory item
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Inventory item created.
 */
router.get('/inventory', requirePermission('inventory:read'), inventoryController.list);
router.post('/inventory', requirePermission('inventory:write'), inventoryController.create);
/**
 * @swagger
 * /inventory/{id}:
 *   get:
 *     summary: Retrieve inventory by ID
 *     security: [{ bearerAuth: [] }]
 *   put:
 *     summary: Update inventory by ID
 *     security: [{ bearerAuth: [] }]
 *   delete:
 *     summary: Delete inventory by ID
 *     security: [{ bearerAuth: [] }]
 */
router.get('/inventory/:id', requirePermission('inventory:read'), inventoryController.getById);
router.put('/inventory/:id', requirePermission('inventory:write'), inventoryController.update);
router.delete('/inventory/:id', requirePermission('inventory:write'), inventoryController.remove);

// Sales
/**
 * @swagger
 * /sales:
 *   post:
 *     summary: Process a sales transaction
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Sales transaction processed.
 */
router.post('/sales', requirePermission('sales:write'), salesController.process);

// Customers
/**
 * @swagger
 * /customers:
 *   get:
 *     summary: List all customers
 *     security: [{ bearerAuth: [] }]
 *   post:
 *     summary: Create a new customer
 *     security: [{ bearerAuth: [] }]
 */
router.get('/customers', requirePermission('customers:read'), customersController.list);
router.post('/customers', requirePermission('customers:write'), customersController.create);

// Support Tickets
/**
 * @swagger
 * /support-tickets:
 *   get:
 *     summary: List all support tickets
 *     security: [{ bearerAuth: [] }]
 *   post:
 *     summary: Create a new support ticket
 *     security: [{ bearerAuth: [] }]
 */
router.get('/support-tickets', requirePermission('tickets:read'), supportController.list);
router.post('/support-tickets', requirePermission('tickets:write'), supportController.create);

module.exports = router;
