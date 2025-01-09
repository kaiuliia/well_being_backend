import { Request, Response } from "express";

export const logout = async (
  req: Request,
  res: Response,
): Promise<void> => {
  req.session = null;
  res.status(200).end();
};
