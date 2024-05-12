import { Request, Response } from "express";
import { client } from "../database/client";

export const logout = async (
  req: Request<{} /*p*/>,
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

  res.cookie("userId", "", { expires: new Date(0) });
  res.status(200).end();
};
