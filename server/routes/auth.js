import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * Register user for all roles
 */
router.post('/register', register);

/**
 * @route POST /api/auth/login
 * Login user for all roles
 */
router.post('/login', login);

export default router;
