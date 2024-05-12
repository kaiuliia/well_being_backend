import express, { Application } from "express";
import { json } from "body-parser";
import dotenv from "dotenv";

import cors from "cors";
import cookieParser from "cookie-parser";
import { auth } from "./auth";
import { dashboard } from "./dashboard";
import { surveys } from "./surveys";

//For env File
dotenv.config();

const app: Application = express();
app.use(json());
// READ ABOUT WHAT IS CORS AND WHY IT IS NEEDED
app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      console.log(origin);
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "https://wellbeing.rusanova.eu",
      ];

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }

      return callback(null, true);
    },
  }),
);
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "http://localhost:3001");
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   res.header("Access-Control-Allow-Headers", "Content-Type");
//   next();
// });
app.use(cookieParser());
app.use(auth);
app.use(dashboard);
app.use(surveys);
const port = process.env.PORT || 9090;

//function counts your mood and gives you respond

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
