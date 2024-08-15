"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = require("./auth");
const dashboard_1 = require("./dashboard");
const surveys_1 = require("./surveys");
const mongo_1 = require("./mongo/mongo");
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
app.use(auth_1.auth);
app.use(dashboard_1.dashboard);
app.use(surveys_1.surveys);
const port = process.env.PORT || 9090;
//function counts your mood and gives you respond
app.listen(port, async () => {
    console.log(`Server listening at http://localhost:${port}`);
    await (0, mongo_1.start)();
});
