import express, { Request, Response, Application } from "express";
import { json } from "body-parser";
import dotenv from "dotenv";
import { Client } from "pg";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import cookieParser from "cookie-parser";
import { z } from "zod";

const RegisterRequestSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
});

const SurveyRequestSchema = z.object({
  general_mood: z.number(),
  appetite: z.number(),
  sleep: z.number(),
  anxiety: z.number(),
  yourself_time: z.number(),
  screen_time: z.number(),
});

type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
type SurveyRequest = z.infer<typeof SurveyRequestSchema>;

const client = new Client({ database: "wellbeing" });
client.connect().catch(console.log);

//For env File
dotenv.config();

const app: Application = express();
app.use(json());
// READ ABOUT WHAT IS CORS AND WHY IT IS NEEDED
app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      console.log(origin);
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "https://wellbeing.rusanova.eu",
      ];

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }

      return callback(null, true);
    },
  }),
);
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "http://localhost:3001");
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   res.header("Access-Control-Allow-Headers", "Content-Type");
//   next();
// });
app.use(cookieParser());

const port = process.env.PORT || 9090;

interface RegisterResponse {
  userId: string;
}

interface SurveyResponse {
  userId: string;
}

interface Survey {
  general_mood: number;
  appetite: number;
  sleep: number;
  anxiety: number;
  yourself_time: number;
  screen_time: number;
}

//function counts your mood and gives you respond
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

app.post(
  "/register",
  async (
    req: Request<
      {} /*p*/,
      RegisterResponse /*resbody - то что я должна ответить*/,
      RegisterRequest /*reqbody - то что я принимаю*/
    >,
    res: Response,
  ): Promise<void> => {
    const result = RegisterRequestSchema.safeParse(req.body);

    if (!result.success) {
      const error = result.error;
      res.status(400).send({ error });
      return;
    } else {
      const { name, email, password } = result.data;
      const userId = uuidv4();
      await client.query(
        `INSERT INTO public.users (name, email, password, id) VALUES ('${name}', '${email}', '${password}', '${userId}')`,
      );
      res.cookie("userId", userId);
      res.status(201).send({ name: name }).end();
    }
  },
);

app.post(
  "/login",
  async (
    req: Request<
      {} /*p*/,
      RegisterResponse /*resbody - то что я должна ответить*/,
      RegisterRequest /*reqbody - то что я принимаю*/
    >,
    res: Response,
  ): Promise<void> => {
    const { email, password } = req.body;
    const { rows } = await client.query(
      `SELECT * FROM public.users WHERE email = '${email}' AND password = '${password}'`,
    );

    if (rows.length > 0) {
      res.cookie("userId", rows[0].id);
      res
        .status(201)
        .send({ name: `${rows[0].name}.` })
        .end();
    } else {
      res.status(404).send({ error: "Sorry, we cannot find that!" });
    }
  },
);

app.post(
  "/survey",
  async (
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
  },
);

app.get(
  "/survey",
  async (
    req: Request<
      {} /*p*/,
      RegisterResponse /*resbody - то что я должна ответить*/,
      RegisterRequest /*reqbody - то что я принимаю*/
    >,
    res: Response,
  ): Promise<void> => {
    const { userId } = req.cookies;
    if (!userId) {
      res.status(401).send({ error: "no userId" });
      return;
    }
    const { rows } = await client.query(
      `SELECT * FROM public.survey WHERE user_id = '${userId}'`,
    );
    res.send(rows);
  },
);
app.get(
  "/advice",
  async (
    req: Request<
      {} /*p*/,
      RegisterResponse /*resbody - то что я должна ответить*/,
      RegisterRequest /*reqbody - то что я принимаю*/
    >,
    res: Response,
  ): Promise<void> => {
    const { userId } = req.cookies;
    if (!userId) {
      res.status(401).send({ error: "no userId" });
      return;
    }
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
  },
);
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
