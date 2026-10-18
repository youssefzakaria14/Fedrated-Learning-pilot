
const express = require("express");

const {
    getAllHospitals,
    getHospitalById
} = require("../Controllers/Hospital.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Hospitals
 *   description: Hospital management endpoints
 */

/**
 * @swagger
 * /api/hospitals:
 *   get:
 *     summary: Get all hospitals
 *     tags: [Hospitals]
 *     responses:
 *       200:
 *         description: Hospitals retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/", getAllHospitals);

/**
 * @swagger
 * /api/hospitals/{id}:
 *   get:
 *     summary: Get a hospital by ID
 *     tags: [Hospitals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB hospital ID
 *     responses:
 *       200:
 *         description: Hospital retrieved successfully
 *       400:
 *         description: Invalid hospital ID
 *       404:
 *         description: Hospital not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getHospitalById);

module.exports = router;
