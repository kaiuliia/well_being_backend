import {Request, Response} from "express";
import {client} from "../database/client";
import {activityTips, calmnessTips, meTimeTips, moodBoostingTips, sleepTips} from "./advicesList";
// import { Survey } from "../common/survey";

interface oneDayData {
  id: string,
  user_id: string,
  date:string,
  general_mood: string,
  sleep:string,
  activities:string,
  yourself_time: string,
  calmness: string,

}

const getRandomElements = (obj: Record<string, string>, title:string): { title: string; advices: string[] } => {
  const values = Object.values(obj);
  const randomAdvices = values.sort(() => Math.random() - 0.5).slice(0, 3);
  return {
    title: title,
    advices: randomAdvices,
  };
};
const moodResponse = (rows:oneDayData[]) => {
  const advices  = [];
  console.log('rows', rows)
  const today = rows.filter((element)=>element.date === new Date().toISOString().split('T')[0])
if(Number(today[0].general_mood)<50) {
  advices.push(getRandomElements(moodBoostingTips, 'general_mood'))
}
  if(Number(today[0].sleep)<50) {
    advices.push(getRandomElements(sleepTips, 'sleep'))
  }
  if(Number(today[0].activities)<50) {
    advices.push(getRandomElements(activityTips,'activities'))
  }
  if(Number(today[0].yourself_time)<50) {
    advices.push(getRandomElements(meTimeTips,'yourself_time'))
  }
  if(Number(today[0].calmness)<50) {
    advices.push(getRandomElements(calmnessTips,'calmness'))
  }

  return advices;
};

export const getAdvice = async (
  req: Request<{} /*p*/>,
  res: Response,
): Promise<void> => {
  const  userId  = req.session?.userId
  const { rows } = await client.query(
    `SELECT * FROM public.survey WHERE user_id = '${userId}'`,
  );


//   const response = [{'yourself_time': {advice: 'random advice', link: 'random link'}
// }, {'activities': {advice: 'random advice', link: 'random link'}}, {'sleep': {advice: 'random advice', link: 'random link'}}  ]
  res.send(moodResponse(rows));


};
