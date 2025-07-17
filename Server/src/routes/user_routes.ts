import express from "express";
const router = express.Router();

import authController from "../controllers/user_controller";
import { verifyAccessToken } from "../middleware/user_token_middleware";

router.post("/register", authController.register);
router.post("/login", authController.login);

router.post("/logout", verifyAccessToken, authController.logout);
router.post("/refresh", verifyAccessToken, authController.refresh);



export default router;
