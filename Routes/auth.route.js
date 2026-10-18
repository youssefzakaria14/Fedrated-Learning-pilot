
const express = require("express");
const router = express.Router();

const {
    register,
    createAdmin,
    login,
    getMe,
    updateMe,
    getHospitals
} = require("../Controllers/auth.controller");

const { protect } = require("../Middleware/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and account management
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Registration fields required by the controller
 *             additionalProperties: true
 *           example:
 *             name: Test User
 *             email: test@example.com
 *             password: Password123
 *     responses:
 *       201:
 *         description: Account created successfully
 *       400:
 *         description: Invalid registration data
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in to an account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *           example:
 *             email: test@example.com
 *             password: Password123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/admin:
 *   post:
 *     summary: Create an admin account
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Not authorized
 */
router.post("/admin", protect, createAdmin);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get the current authenticated user
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get("/me", protect, getMe);

/**
 * @swagger
 * /api/auth/me:
 *   patch:
 *     summary: Update the current user's account
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *           example:
 *             name: Updated User
 *     responses:
 *       200:
 *         description: Account updated successfully
 *       401:
 *         description: Authentication required
 *       400:
 *         description: Invalid update data
 */
router.patch("/me", protect, updateMe);

/**
 * @swagger
 * /api/auth/hospitals:
 *   get:
 *     summary: Get hospitals available through the authentication API
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Hospitals retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/hospitals", getHospitals);

module.exports = router;
