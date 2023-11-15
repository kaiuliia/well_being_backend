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

app.use(cookieParser());

const port = process.env.PORT || 9090;

interface RegisterResponse {
  userId: string;
}

interface SurwayResponse {
  userId: string;
}

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
      SurwayResponse /*resbody - то что я должна ответить*/,
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
        `INSERT INTO public.survey ( id, user_id, general_mood,
                                       appetite,
                                       sleep,
                                       anxiety,
                                       yourself_time,
                                       screen_time) VALUES ('${id}', '${userId}', '${general_mood}', '${appetite}', '${sleep}','${anxiety}','${yourself_time}','${screen_time}')`,
      );

      res.status(201).send({ id }).end();
    }
  },
);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
