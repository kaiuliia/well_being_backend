import { Router } from "express";
import { addSurvey } from "./add";
import { getSurveyList } from "./list";

export const surveys = Router();

surveys.post("/survey", addSurvey);
surveys.get("/survey", getSurveyList);
