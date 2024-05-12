import { Router } from "express";
import { getAdvice } from "./advice";

export const dashboard = Router();

dashboard.get("/dashboard/advice", getAdvice);
