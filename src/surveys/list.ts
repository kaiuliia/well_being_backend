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
    `SELECT * FROM public.survey WHERE user_id = $1 AND date >= $2 AND date <= $3;`,
    [userId, startDate, endDate],
  );

  res.send(rows);
};

// {
//   date: new Date(2024, 4, 13),
//       mood: 15,
//     activities: 0,
//     sleep: 14,
//     calmness: 0,
//     yourself_time: 0,
// },
