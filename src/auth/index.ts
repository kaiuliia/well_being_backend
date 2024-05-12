import { Router } from "express";
import { login } from "./login";
import { register } from "./register";
import { logout } from "./logout";
import { authMiddleware } from "../common/middleware/auth";

export const auth = Router();

auth.post("/login", login);
auth.post("/register", register);
auth.post("/logout", authMiddleware, logout);
