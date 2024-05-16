import { Request, Response } from "express";
import { z } from "zod";
import { client } from "../database/client";

interface RegisterResponse {
  userId: string;
}

type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

const RegisterRequestSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  isChecked: z.boolean(),
});
export const login = async (
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
};
