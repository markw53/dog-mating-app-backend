import { Router } from "express";
import { authenticateUser } from "../middleware/auth";
import {
  createDog,
  getDog,
  updateDog,
  deleteDog,
  getNearbyDogs,
  getMyDogs
} from "../controllers/dogController";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Dog:
 *       type: object
 *       required:
 *         - name
 *         - breed
 *         - age
 *         - gender
 *         - location
 *       properties:
 *         id:
 *           type: string
 *         ownerId:
 *           type: string
 *         name:
 *           type: string
 *         breed:
 *           type: string
 *         age:
 *           type: number
 *         gender:
 *           type: string
 *           enum: [male, female]
 *         photos:
 *           type: array
 *           items:
 *             type: string
 *         description:
 *           type: string
 *         location:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *             longitude:
 *               type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/dogs:
 *   post:
 *     summary: Create a new dog profile
 *     tags: [Dogs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Dog'
 *     responses:
 *       201:
 *         description: Dog profile created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dog'
 */
router.post("/", authenticateUser, createDog);

/**
 * @swagger
 * /api/dogs/my-dogs:
 *   get:
 *     summary: Get all dogs owned by the authenticated user
 *     tags: [Dogs]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's dogs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Dog'
 */
router.get("/my-dogs", authenticateUser, getMyDogs);

/**
 * @swagger
 * /api/dogs/{id}:
 *   get:
 *     summary: Get a dog profile by ID
 *     tags: [Dogs]
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
 *         description: Dog profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dog'
 */
router.get("/:id", authenticateUser, getDog);

/**
 * @swagger
 * /api/dogs/{id}:
 *   put:
 *     summary: Update a dog profile
 *     tags: [Dogs]
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
 *             $ref: '#/components/schemas/Dog'
 *     responses:
 *       200:
 *         description: Dog profile updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dog'
 */
router.put("/:id", authenticateUser, updateDog);

/**
 * @swagger
 * /api/dogs/{id}:
 *   delete:
 *     summary: Delete a dog profile
 *     tags: [Dogs]
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
 *         description: Dog profile deleted
 */
router.delete("/:id", authenticateUser, deleteDog);

/**
 * @swagger
 * /api/dogs/nearby:
 *   get:
 *     summary: Get nearby dogs
 *     tags: [Dogs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
 *     responses:
 *       200:
 *         description: List of nearby dogs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Dog'
 */
router.get("/nearby", authenticateUser, getNearbyDogs);

export default router;
