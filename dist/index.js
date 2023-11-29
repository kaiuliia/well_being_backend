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
const SurveyRequestSchema = zod_1.z.object({
    general_mood: zod_1.z.number(),
    appetite: zod_1.z.number(),
    sleep: zod_1.z.number(),
    anxiety: zod_1.z.number(),
    yourself_time: zod_1.z.number(),
    screen_time: zod_1.z.number(),
});
const client = new pg_1.Client({ database: "wellbeing" });
client.connect().catch(console.log);
//For env File
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, body_parser_1.json)());
// READ ABOUT WHAT IS CORS AND WHY IT IS NEEDED
app.use((0, cors_1.default)({
    credentials: true,
    origin: (origin, callback) => {
        console.log(origin);
        if (!origin)
            return callback(null, true);
        const allowedOrigins = [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
            "http://localhost:3003",
            "https://wellbeing.rusanova.eu",
        ];
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = "The CORS policy for this site does not " +
                "allow access from the specified Origin.";
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
}));
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "http://localhost:3001");
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   res.header("Access-Control-Allow-Headers", "Content-Type");
//   next();
// });
app.use((0, cookie_parser_1.default)());
const port = process.env.PORT || 9090;
//function counts your mood and gives you respond
const moodResponse = (rows) => {
    let advices = [];
    for (let i = 0; i < rows.length; i++) {
        if (rows[i].general_mood < 5) {
            advices.push("Your general mood is bad today! You need more care today");
        }
        if (rows[i].appetite < 5) {
            advices.push("Try to feel what would you like ti eat. Sweet or salt, fresh veggies or bread. If you are not hungry, it's ok. Let your body feel what it wants ");
        }
        if (rows[i].sleep < 5) {
            advices.push("Try to get sleep earlier today. See there is comfortable in your room or not");
        }
        if (rows[i].anxiety < 5) {
            advices.push(" Use grounding techniques to stay present in the moment. Focus on your senses by observing what you see, hear, touch, taste, and smell. This can help shift your attention away from anxious thoughts.");
        }
        if (rows[i].yourself_time < 5) {
            advices.push("Treat your personal time as a non-negotiable appointment. Block off specific time slots in your calendar for self-care activities, and stick to them as you would any other commitment.");
        }
        if (rows[i].screen_time < 5) {
            advices.push("Your general mood is bad today! You need more care today");
        }
    }
    let message = console.log(message);
};
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
        res.cookie("userId", userId);
        res.status(201).send({ name: name }).end();
    }
}));
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const { rows } = yield client.query(`SELECT * FROM public.users WHERE email = '${email}' AND password = '${password}'`);
    if (rows.length > 0) {
        res.cookie("userId", rows[0].id);
        res
            .status(201)
            .send({ name: `${rows[0].name}.` })
            .end();
    }
    else {
        res.status(404).send({ error: "Sorry, we cannot find that!" });
    }
}));
app.post("/survey", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.cookies;
    if (!userId) {
        res.status(401).send({ error: "no userId" });
        return;
    }
    const { rows } = yield client.query(`SELECT * FROM public.users WHERE id = '${userId}'`);
    if (rows.length === 0) {
        res.status(401).send({ error: "no userId" });
        return;
    }
    const result = SurveyRequestSchema.safeParse(req.body);
    if (!result.success) {
        const error = result.error;
        res.status(400).send({ error });
        return;
    }
    else {
        const { general_mood, appetite, sleep, anxiety, yourself_time, screen_time, } = result.data;
        const id = (0, uuid_1.v4)();
        yield client.query(`INSERT INTO public.survey ( id, user_id, date, general_mood,
                       appetite,
                       sleep,
                       anxiety,
                       yourself_time,
                       screen_time
       ) VALUES ('${id}', '${userId}', CURRENT_TIMESTAMP,'${general_mood}', '${appetite}', '${sleep}','${anxiety}','${yourself_time}','${screen_time}')`);
        res.status(201).send({ id }).end();
    }
}));
app.get("/survey", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.cookies;
    if (!userId) {
        res.status(401).send({ error: "no userId" });
        return;
    }
    const { rows } = yield client.query(`SELECT * FROM public.survey WHERE user_id = '${userId}'`);
    res.send(rows);
}));
app.get("/advice", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.cookies;
    if (!userId) {
        res.status(401).send({ error: "no userId" });
        return;
    }
    const { rows } = yield client.query(`SELECT * FROM public.survey WHERE user_id = '${userId}'`);
    // [
    // {
    //
    //     "general_mood": "1",
    //     "sleep": "a",
    //     "appetite": "2",
    //     "anxiety": "3",
    //     "yourself_time": "1",
    //     "screen_time": "1"
    // },
    // {
    //     "general_mood": "1",
    //     "sleep": "4",
    //     "appetite": "2",
    //     "anxiety": "3",
    //     "yourself_time": "1",
    //     "screen_time": "1"
    // }
    // ]
    for (let i = 0; i < rows.length; i++) {
        if (rows[i].general_mood < 5) {
        }
    }
    res.send(rows);
}));
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
