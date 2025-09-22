const express = require('express');
const auth = require('../middleware/auth');
const idempotency = require('../middleware/idempotency');
const controller = require('../controllers/support');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Support
 *   description: Support ticket workflows
 */

/**
 * @swagger
 * /support-tickets:
 *   get:
 *     summary: List all support tickets
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of support tickets.
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, controller.list.bind(controller));

/**
 * @swagger
 * /support-tickets:
 *   post:
 *     summary: Create a new support ticket
 *     tags: [Support]
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
 *         description: Support ticket created.
 *       400:
 *         description: Validation error
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
