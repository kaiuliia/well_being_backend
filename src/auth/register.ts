import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
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
});

export const register = async (
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
    res.cookie("userId", userId,{
      sameSite: "none",
      secure: true,
      httpOnly: true
    });
    res.status(201).send({ name: name }).end();
  }
};
