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

type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

const client = new Client({ database: "wellbeing" });
client.connect().catch(console.log);

//For env File
dotenv.config();

const app: Application = express();
app.use(json());
app.use(cors());
app.use(cookieParser());

const port = process.env.PORT || 9090;

interface RegisterResponse {
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
      res.cookie("id", { userId });
      res.status(201).end();
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
      // res.cookie("id", { userId });
      res
        .status(201)
        .send({ name: `${rows[0].name}.` })
        .end();
    } else {
      res.status(404).send({ error: "Sorry, we cannot find that!" });
    }
  },
);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
