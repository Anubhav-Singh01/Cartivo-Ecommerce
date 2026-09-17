import { Router } from "express";
import { createStreamToken } from "../controllers/streamController";

const router = Router();

router.post("/token", createStreamToken)

export default router;