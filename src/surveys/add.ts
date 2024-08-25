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
const SleepRequestSchema = z.object({
  // general_mood: z.number(),
  // activities: z.number(),
  sleep: z.number(),
  // calmness: z.number(),
  // yourself_time: z.number(),
  date: z.string(),
});

type SleepRequest = z.infer<typeof SleepRequestSchema>;
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
      // await client.query(
      //   `SELECT NOT EXISTS (
      //    SELECT 1
      //    FROM public.survey
      //    WHERE user_id = $1
      //      AND date = $2
      //  ) AS does_not_exist`,
      //   [userId, date],
      // );

      await client.query(
        `INSERT INTO public.survey (
              id, user_id, general_mood, activities, sleep, calmness, yourself_time, date
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (user_id, date)  -- Conflict on unique constraint
               DO UPDATE SET
                             general_mood = EXCLUDED.general_mood,
                             activities = EXCLUDED.activities,
                             sleep = EXCLUDED.sleep,
                             calmness = EXCLUDED.calmness,
                             yourself_time = EXCLUDED.yourself_time`,
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

export const addSleep = async (
  req: Request<{}, SurveyResponse, SleepRequest>,
  res: Response,
): Promise<void> => {
  const { userId } = req.cookies;

  const result = SleepRequestSchema.safeParse(req.body);
  if (!result.success) {
    const error = result.error;
    res.status(400).send({ error });
    return;
  } else {
    const { sleep, date } = result.data;

    const id = uuidv4();
    try {
      await client.query(
        `INSERT INTO public.survey (
           id, user_id, sleep, date
         ) VALUES ($1, $2, $3, $4)`,
        [id, userId, sleep, date],
      );

      res.status(201).send({ id }).end();
    } catch (error) {
      console.error("Error inserting survey:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  }
};
