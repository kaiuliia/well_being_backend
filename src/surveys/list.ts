import { Request, Response } from "express";
import { client } from "../database/client";

export const getSurveyList = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { userId } = req.cookies;
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    res.status(400).send({ error: "Provide start and end date" });
    return;
  }

  const { rows } = await client.query(
    `SELECT * FROM public.survey WHERE user_id = $1 AND date BETWEEN $2 AND $3;`,
    [userId, startDate, endDate],
  );

  res.send(rows);
};

export const getToday = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.cookies;
  // const { startDate, endDate } = req.query;

  // if (!startDate || !endDate) {
  //   res.status(400).send({ error: "Provide start and end date" });
  //   return;
  // }

  const { rows } = await client.query(
    `SELECT * FROM public.survey WHERE user_id = $1 AND date = CURRENT_DATE;`,
    [userId],
  );

  res.send(rows);
};
