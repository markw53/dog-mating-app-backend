import { Router } from "express";
import { authenticateUser } from "../middleware/auth";
import { sendMessage, getMessages } from "../controllers/messageController";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       required:
 *         - matchId
 *         - content
 *       properties:
 *         id:
 *           type: string
 *         matchId:
 *           type: string
 *         senderId:
 *           type: string
 *         content:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a new message
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - matchId
 *               - content
 *             properties:
 *               matchId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 */
router.post("/", authenticateUser, sendMessage);

/**
 * @swagger
 * /api/messages/{matchId}:
 *   get:
 *     summary: Get all messages for a match
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 */
router.get("/:matchId", authenticateUser, getMessages);

export default router;
