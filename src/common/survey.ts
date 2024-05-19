import { Router } from "express";
import { authMiddleware } from "./middleware/auth";
import { getSurveyList } from "../surveys/list";

export interface Survey {
  general_mood: number;
  calmness: number;
  sleep: number;
  activities: number;
  yourself_time: number;
}

export const survey = Router();
survey.use(authMiddleware);
survey.get("/dashboard/", getSurveyList);
