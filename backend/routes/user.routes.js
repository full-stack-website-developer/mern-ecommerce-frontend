import express from 'express';

import userController from '../controllers/user.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import { registerSchema, loginSchema } from '../validators/user.validator.js';

const UserRouter = express.Router();

UserRouter.post('/register', validate(registerSchema), userController.register);
UserRouter.post('/login',  validate(loginSchema), userController.login);
// UserRouter.get('/users', authMiddleware.authenticateToken, userController.getUsers);
// UserRouter.get('/verifyToken', authenticateToken, userController.verifyToken)

export default UserRouter;