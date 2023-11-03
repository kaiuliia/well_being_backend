import express, { Request, Response, Application } from "express";
import { json } from "body-parser";
import dotenv from "dotenv";
import { Client } from "pg";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import cookieParser from "cookie-parser";

const client = new Client({ database: "wellbeing" });
client.connect().catch(console.log);

//For env File
dotenv.config();

const app: Application = express();
app.use(json());
app.use(cors());
app.use(cookieParser());

const port = process.env.PORT || 9090;

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

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
    const { name, email, password } = req.body;
    const userId = uuidv4();
    await client.query(
      `INSERT INTO public.users (name, email, password, id) VALUES ('${name}', '${email}', '${password}', '${userId}')`,
    );
    res.cookie("id", { userId });
    res.status(201).end();
  },
);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
