import { Request, Response } from "express";
import { client } from "../database/client";

export const getSurveyList = async (
  req: Request<{} /*p*/>,
  // RegisterResponse /*resbody - то что я должна ответить*/,
  // RegisterRequest /*reqbody - то что я принимаю*/
  res: Response,
): Promise<void> => {
  const { userId } = req.cookies;
  const { startDate, endDate } = req.query;

  const { rows } = await client.query(
    `SELECT * FROM public.survey WHERE user_id = '${userId}' AND date >= '${startDate}' AND date <= '${endDate}'; `,
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
