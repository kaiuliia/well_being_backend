import { Client } from "pg";

export const client = new Client({ database: "wellbeing" });
client.connect().catch(console.log);
