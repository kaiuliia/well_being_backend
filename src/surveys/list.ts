import { Request, Response } from "express";
import { client } from "../database/client";

export const getSurveyList = async (
  req: Request<{} /*p*/>,
  // RegisterResponse /*resbody - то что я должна ответить*/,
  // RegisterRequest /*reqbody - то что я принимаю*/
  res: Response,
): Promise<void> => {
  const { userId } = req.cookies;

  const { rows } = await client.query(
    `SELECT * FROM public.survey WHERE user_id = '${userId}'`,
  );
  res.send(rows);
};
