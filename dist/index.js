"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = require("pg");
const uuid_1 = require("uuid");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const zod_1 = require("zod");
const RegisterRequestSchema = zod_1.z.object({
    name: zod_1.z.string(),
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
const client = new pg_1.Client({ database: "wellbeing" });
client.connect().catch(console.log);
//For env File
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, body_parser_1.json)());
app.use((0, cors_1.default)());
app.use((0, cookie_parser_1.default)());
const port = process.env.PORT || 9090;
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = RegisterRequestSchema.safeParse(req.body);
    if (!result.success) {
        const error = result.error;
        res.status(400).send({ error });
        return;
    }
    else {
        const { name, email, password } = result.data;
        const userId = (0, uuid_1.v4)();
        yield client.query(`INSERT INTO public.users (name, email, password, id) VALUES ('${name}', '${email}', '${password}', '${userId}')`);
        res.cookie("id", { userId });
        res.status(201).end();
    }
}));
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const { rows } = yield client.query(`SELECT * FROM public.users WHERE email = '${email}' AND password = '${password}'`);
    if (rows.length > 0) {
        // res.cookie("id", { userId });
        res
            .status(201)
            .send({ name: `${rows[0].name}.` })
            .end();
    }
    else {
        res.status(404).send({ error: "Sorry, we cannot find that!" });
    }
}));
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
