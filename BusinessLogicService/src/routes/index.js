const express = require('express');
const healthController = require('../controllers/health');
const inventoryRoutes = require('./inventory');
const customersRoutes = require('./customers');
const salesRoutes = require('./sales');
const supportRoutes = require('./support');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Health
 *     description: Service healthcheck
 */

// Health endpoint
/**
 * @swagger
 * /:
 *   get:
 *     summary: Health endpoint
 *     tags: [Health]
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

// Domain routers
router.use('/inventory', inventoryRoutes);
router.use('/customers', customersRoutes);
router.use('/sales', salesRoutes);
router.use('/support-tickets', supportRoutes);

module.exports = router;
