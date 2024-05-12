import { Request, Response } from "express";

export const logout = async (
  req: Request<{} /*p*/>,
  res: Response,
): Promise<void> => {
  res.cookie("userId", "", { expires: new Date(0) });
  res.status(200).end();
};
