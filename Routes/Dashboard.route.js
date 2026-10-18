
const express = require("express");
const router = express.Router();

const {
    getDashboard,
    getDashboardEvaluations,
    getHospitalDashboard
} = require("../Controllers/Dashboard.controller.js");

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard statistics and training evaluation
 */

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard data
 *     description: Returns the main dashboard statistics and AI training results.
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *       500:
 *         description: Failed to retrieve dashboard data
 */
router.get("/", getDashboard);

/**
 * @swagger
 * /api/dashboard/evaluations:
 *   get:
 *     summary: Get model evaluation results
 *     description: Returns evaluation metrics for local, centralized, and federated models.
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Evaluation results retrieved successfully
 *       500:
 *         description: Failed to retrieve evaluation results
 */
router.get("/evaluations", getDashboardEvaluations);

/**
 * @swagger
 * /api/dashboard/hospitals/{hospitalId}:
 *   get:
 *     summary: Get dashboard data for a hospital
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB hospital ID
 *     responses:
 *       200:
 *         description: Hospital dashboard data retrieved successfully
 *       400:
 *         description: Invalid hospital ID
 *       404:
 *         description: Hospital not found
 *       500:
 *         description: Failed to retrieve hospital dashboard data
 */
router.get("/hospitals/:hospitalId", getHospitalDashboard);

module.exports = router;
