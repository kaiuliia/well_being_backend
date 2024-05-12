import { Router } from "express";
import { addSurvey } from "./add";
import { getSurveyList } from "./list";
import { authMiddleware } from "../common/middleware/auth";

export const surveys = Router();
surveys.use(authMiddleware);
surveys.post("/survey", addSurvey);
surveys.get("/survey", getSurveyList);
