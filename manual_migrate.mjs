import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function migrate() {
    const sql = neon(process.env.DATABASE_URL);

    console.log('Running migrations...');

    try {
        await sql`
            CREATE TABLE IF NOT EXISTS "passwordResetToken" (
                "id" text PRIMARY KEY NOT NULL,
                "email" text NOT NULL,
                "token" text NOT NULL,
                "expires" timestamp NOT NULL,
                CONSTRAINT "passwordResetToken_token_unique" UNIQUE("token")
            );
        `;
        console.log('Table passwordResetToken created.');

        // Check if password column exists first to avoid error on reruns
        const columns = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'user' AND column_name = 'password';
        `;

        if (columns.length === 0) {
            await sql`ALTER TABLE "user" ADD COLUMN "password" text;`;
            console.log('Column password added to user table.');
        } else {
            console.log('Column password already exists.');
        }

    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrate();
