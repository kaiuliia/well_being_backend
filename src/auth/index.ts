import { Router } from "express";
import { login } from "./login";
import { register } from "./register";

export const auth = Router();

auth.post("/login", login);
auth.post("/register", register);
