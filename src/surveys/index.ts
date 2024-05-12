import { Router } from "express";
import { addSurvey } from "./add";
import { getSurveyList } from "./list";

export const auth = Router();

auth.post("/survey", addSurvey);
auth.get("/survey", getSurveyList);
