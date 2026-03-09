import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function main() {
    console.log("🚀 Starting database synchronization for Achievements & Settings...");

    try {
        // 1. Add settings column to user table
        console.log("Checking for 'settings' column in 'user' table...");
        await sql`
            ALTER TABLE "user" 
            ADD COLUMN IF NOT EXISTS "settings" JSONB DEFAULT '{"appearance": {"theme": "codex", "font": "inter", "fontSize": 16}, "gameplay": {"showWpm": true, "showAccuracy": true, "sound": true}}'::jsonb NOT NULL;
        `;
        console.log("✅ 'settings' column verified/added.");

        // 2. Create user_achievement table
        console.log("Creating 'user_achievement' table...");
        await sql`
            CREATE TABLE IF NOT EXISTS "user_achievement" (
                "id" TEXT PRIMARY KEY,
                "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
                "achievement_id" VARCHAR(100) NOT NULL,
                "unlocked_at" TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `;
        console.log("✅ 'user_achievement' table verified/created.");

        console.log("🎉 Database synchronization complete!");
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

main();
