import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Adding 'afk' column to 'typing_result' table...");
    try {
        await db.execute(sql`ALTER TABLE "typing_result" ADD COLUMN IF NOT EXISTS "afk" integer DEFAULT 0`);
        console.log("Success: added 'afk' column.");
    } catch (error) {
        console.error("Migration failed:", error);
    }
}

main();
