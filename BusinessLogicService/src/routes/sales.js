const express = require('express');
const auth = require('../middleware/auth');
const idempotency = require('../middleware/idempotency');
const controller = require('../controllers/sales');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Sales
 *   description: Sales processing
 */

/**
 * @swagger
 * /sales:
 *   post:
 *     summary: Process a sales transaction
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Sales transaction processed.
 *       400:
 *         description: Validation error or business rule violation
 *       401:
 *         description: Unauthorized
 *     headers:
 *       Idempotency-Key:
 *         description: Optional idempotency key to ensure exactly-once processing
 *         schema:
 *           type: string
 */
router.post('/', auth, idempotency, controller.create.bind(controller));

module.exports = router;
