import { client } from "../../database/client";
import { Request, Response, NextFunction } from "express";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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

  next();
};
