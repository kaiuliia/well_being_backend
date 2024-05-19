import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { client } from "../database/client";

interface SurveyResponse {
  userId: string;
}

type SurveyRequest = z.infer<typeof SurveyRequestSchema>;
const SurveyRequestSchema = z.object({
  general_mood: z.number(),
  activities: z.number(),
  sleep: z.number(),
  calmness: z.number(),
  yourself_time: z.number(),
  date: z.string(),
});

export const addSurvey = async (
  req: Request<{}, SurveyResponse, SurveyRequest>,
  res: Response,
): Promise<void> => {
  const { userId } = req.cookies;

  const result = SurveyRequestSchema.safeParse(req.body);
  if (!result.success) {
    const error = result.error;
    res.status(400).send({ error });
    return;
  } else {
    const { general_mood, activities, sleep, calmness, yourself_time, date } =
      result.data;

    const id = uuidv4();
    try {
      await client.query(
        `INSERT INTO public.survey (
           id, user_id, general_mood, activities, sleep, calmness, yourself_time, date
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          id,
          userId,
          general_mood,
          activities,
          sleep,
          calmness,
          yourself_time,
          date,
        ],
      );

      res.status(201).send({ id }).end();
    } catch (error) {
      console.error("Error inserting survey:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  }
};
