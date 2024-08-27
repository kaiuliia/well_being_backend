import { Client, types } from "pg";

types.setTypeParser(types.builtins.DATE, (val) => val);

export const client = new Client({ database: "wellbeing" });
client.connect().catch(console.log);
