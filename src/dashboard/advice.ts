import { Request, Response } from "express";
import { client } from "../database/client";
import { Survey } from "../common/survey";

const moodResponse = (rows: Survey[]) => {
  let advices: any[] = [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].general_mood < 5) {
      advices.push("Your general mood is bad today! You need more care today");
    }
    if (rows[i].appetite < 5) {
      advices.push(
        "Try to feel what would you like ti eat. Sweet or salt, fresh veggies or bread. If you are not hungry, it's ok. Let your body feel what it wants ",
      );
    }
    if (rows[i].sleep < 5) {
      advices.push(
        "Try to get sleep earlier today. See there is comfortable in your room or not",
      );
    }
    if (rows[i].anxiety < 5) {
      advices.push(
        " Use grounding techniques to stay present in the moment. Focus on your senses by observing what you see, hear, touch, taste, and smell. This can help shift your attention away from anxious thoughts.",
      );
    }
    if (rows[i].yourself_time < 5) {
      advices.push(
        "Treat your personal time as a non-negotiable appointment. Block off specific time slots in your calendar for self-care activities, and stick to them as you would any other commitment.",
      );
    }
    if (rows[i].screen_time < 5) {
      advices.push(
        "Use the built-in screen time or digital well-being features on your phone to set daily limits for specific apps.\n" +
          "Set a timer for social media or other time-consuming apps to remind you to take breaks.",
      );
    }
  }
  return advices;
};

export const getAdvice = async (
  req: Request<{} /*p*/>,
  // RegisterResponse /*resbody - то что я должна ответить*/,
  // RegisterRequest /*reqbody - то что я принимаю*/
  res: Response,
): Promise<void> => {
  const { userId } = req.cookies;
  const { rows } = await client.query(
    `SELECT * FROM public.survey WHERE user_id = '${userId}'`,
  );
  // [
  // {
  //
  //     "general_mood": "1",
  //     "sleep": "a",
  //     "appetite": "2",
  //     "anxiety": "3",
  //     "yourself_time": "1",
  //     "screen_time": "1"
  // },

  // {

  //     "general_mood": "1",
  //     "sleep": "4",
  //     "appetite": "2",
  //     "anxiety": "3",
  //     "yourself_time": "1",
  //     "screen_time": "1"
  // }
  // ]

  res.send(moodResponse(rows));
};
