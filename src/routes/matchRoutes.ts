import { Router } from "express";
import { authenticateUser } from "../middleware/auth";
import {
  createMatch,
  getMatch,
  updateMatchStatus,
  getMatches
} from "../controllers/matchController";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Match:
 *       type: object
 *       required:
 *         - dog1Id
 *         - dog2Id
 *       properties:
 *         id:
 *           type: string
 *         dog1Id:
 *           type: string
 *         dog2Id:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/matches:
 *   post:
 *     summary: Create a new match
 *     tags: [Matches]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dog1Id
 *               - dog2Id
 *             properties:
 *               dog1Id:
 *                 type: string
 *               dog2Id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Match created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 */
router.post("/", authenticateUser, createMatch);

/**
 * @swagger
 * /api/matches/{id}:
 *   get:
 *     summary: Get a match by ID
 *     tags: [Matches]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Match retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 */
router.get("/:id", authenticateUser, getMatch);

/**
 * @swagger
 * /api/matches/{id}/status:
 *   put:
 *     summary: Update match status
 *     tags: [Matches]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected]
 *     responses:
 *       200:
 *         description: Match status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 */
router.put("/:id/status", authenticateUser, updateMatchStatus);

/**
 * @swagger
 * /api/matches:
 *   get:
 *     summary: Get all matches for user's dogs
 *     tags: [Matches]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of matches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Match'
 */
router.get("/", authenticateUser, getMatches);

export default router;
