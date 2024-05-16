import { Router } from "express";
import { authMiddleware } from "./middleware/auth";
import { getSurveyList } from "../surveys/list";

export interface Survey {
  general_mood: number;
  appetite: number;
  sleep: number;
  anxiety: number;
  yourself_time: number;
  screen_time: number;
}

export const survey = Router();
survey.use(authMiddleware);
survey.get("/dashboard/", getSurveyList);
