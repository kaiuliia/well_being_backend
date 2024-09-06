import { Router } from "express";
import { addSurvey, addSleep } from "./add";
import { getSurveyList, getToday } from "./list";
import { authMiddleware } from "../common/middleware/auth";

export const surveys = Router();
surveys.use(authMiddleware);
surveys.post("/survey", addSurvey);
surveys.post("/survey/sleep", addSleep);
surveys.get("/survey", getSurveyList);
surveys.get("/survey/today", getToday);
