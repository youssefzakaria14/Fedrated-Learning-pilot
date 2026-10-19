
const express = require("express");
const router = express.Router();

const {
    createPrediction,
    getAllPredictions,
    getPredictionById
} = require("../Controllers/Prediction.controller");

const { protect } = require("../Middleware/auth.middleware.js");

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     PredictionInput:
 *       type: object
 *       required:
 *         - age
 *         - operationYear
 *         - positiveNodes
 *         - hospital
 *       properties:
 *         age:
 *           type: integer
 *           example: 45
 *         operationYear:
 *           type: integer
 *           example: 2018
 *         positiveNodes:
 *           type: integer
 *           example: 2
 *         hospital:
 *           type: string
 *           example: 6ad4d4cdcf72830a02988b6d
 */

/**
 * @swagger
 * tags:
 *   name: Prediction
 *   description: AI prediction endpoints
 */

/**
 * @swagger
 * /api/v1/predict:
 *   get:
 *     summary: Get all saved predictions
 *     tags: [Prediction]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Predictions retrieved successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get("/", protect, getAllPredictions);

/**
 * @swagger
 * /api/v1/predict/{id}:
 *   get:
 *     summary: Get prediction by ID
 *     tags: [Prediction]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Prediction MongoDB ID
 *     responses:
 *       200:
 *         description: Prediction retrieved successfully
 *       400:
 *         description: Invalid prediction ID
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Prediction not found
 *       500:
 *         description: Server error
 */
router.get("/:id", protect, getPredictionById);

/**
 * @swagger
 * /api/v1/predict:
 *   post:
 *     summary: Create an AI prediction
 *     description: Sends patient data to the AI service and saves the prediction.
 *     tags: [Prediction]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PredictionInput'
 *     responses:
 *       201:
 *         description: Prediction created successfully
 *       400:
 *         description: Invalid input or hospital ID
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Hospital not found
 *       500:
 *         description: Prediction failed
 */
router.post("/", protect, createPrediction);

module.exports = router;
