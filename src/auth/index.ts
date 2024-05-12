import { Router } from "express";
import { login } from "./login";
import { register } from "./register";
import { logout } from "./logout";

export const auth = Router();

auth.post("/login", login);
auth.post("/register", register);
auth.post("/logout", logout);
