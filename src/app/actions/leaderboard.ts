"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { typingResults, users } from "@/db/schema";
import { desc, eq, and, sql, gte } from "drizzle-orm";

export async function getTopLeaderboard(
    limit = 50,
    type: "allTime" | "weekly" | "daily" = "allTime",
    gameMode: string = "time",
    config: string = "15",
    language: string = "english"
) {
    try {
        const now = new Date();
        let dateFilter = undefined;

        if (type === "daily") {
            const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
            dateFilter = gte(typingResults.createdAt, startOfDay);
        } else if (type === "weekly") {
            const startOfWeek = new Date(now);
            const day = now.getUTCDay();
            const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1); // Adjust to start of week (Monday)
            startOfWeek.setUTCDate(diff);
            startOfWeek.setUTCHours(0, 0, 0, 0);
            dateFilter = gte(typingResults.createdAt, startOfWeek);
        }

        const conditions = [
            eq(typingResults.mode, gameMode),
            eq(typingResults.config, Number(config)),
            eq(typingResults.language, language),
        ];

        if (dateFilter) {
            conditions.push(dateFilter);
        }

        // Subquery to get rank #1 per user based on WPM
        const sq = db
            .select({
                userId: typingResults.userId,
                wpm: typingResults.wpm,
                accuracy: typingResults.accuracy,
                rawWpm: typingResults.rawWpm,
                consistency: typingResults.consistency,
                missedChars: typingResults.missedChars,
                createdAt: typingResults.createdAt,
                rn: sql<number>`row_number() over (partition by ${typingResults.userId} order by ${typingResults.wpm} desc, ${typingResults.createdAt} desc)`.as("rn"),
            })
            .from(typingResults)
            .where(and(...conditions))
            .as("sq");

        const results = await db
            .select({
                userId: sq.userId,
                name: users.name,
                image: users.image,
                level: users.level,
                wpm: sq.wpm,
                accuracy: sq.accuracy,
                rawWpm: sq.rawWpm,
                consistency: sq.consistency,
                missedChars: sq.missedChars,
                date: sq.createdAt,
            })
            .from(sq)
            .innerJoin(users, eq(sq.userId, users.id))
            .where(eq(sq.rn, 1))
            .orderBy(desc(sq.wpm))
            .limit(limit);

        return results.map(r => ({
            ...r,
            wpm: Number(r.wpm),
            accuracy: Number(r.accuracy),
            rawWpm: Number(r.rawWpm),
            consistency: r.consistency ? Number(r.consistency) : null,
            date: r.date.toISOString(),
        }));
    } catch (error) {
        console.error("Database Leaderboard Error:", error);
        return [];
    }
}
