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
  appetite: z.number(),
  sleep: z.number(),
  anxiety: z.number(),
  yourself_time: z.number(),
  screen_time: z.number(),
});
export const addSurvey = async (
  req: Request<
    {} /*p*/,
    SurveyResponse /*resbody - то что я должна ответить*/,
    SurveyRequest /*reqbody - то что я принимаю*/
  >,
  res: Response,
): Promise<void> => {
  const { userId } = req.cookies;

  if (!userId) {
    res.status(401).send({ error: "no userId" });
    return;
  }

  const { rows } = await client.query(
    `SELECT * FROM public.users WHERE id = '${userId}'`,
  );
  if (rows.length === 0) {
    res.status(401).send({ error: "no userId" });
    return;
  }
  const result = SurveyRequestSchema.safeParse(req.body);
  if (!result.success) {
    const error = result.error;
    res.status(400).send({ error });
    return;
  } else {
    const {
      general_mood,
      appetite,
      sleep,
      anxiety,
      yourself_time,
      screen_time,
    } = result.data;

    const id = uuidv4();
    await client.query(
      `INSERT INTO public.survey ( id, user_id, date, general_mood,
                       appetite,
                       sleep,
                       anxiety,
                       yourself_time,
                       screen_time
       ) VALUES ('${id}', '${userId}', CURRENT_TIMESTAMP,'${general_mood}', '${appetite}', '${sleep}','${anxiety}','${yourself_time}','${screen_time}')`,
    );

    res.status(201).send({ id }).end();
  }
};
