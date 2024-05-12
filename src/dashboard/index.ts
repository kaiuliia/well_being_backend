import { Router } from "express";
import { getAdvice } from "./advice";
import { authMiddleware } from "../common/middleware/auth";

export const dashboard = Router();
dashboard.use(authMiddleware);
dashboard.get("/dashboard/advice", getAdvice);
