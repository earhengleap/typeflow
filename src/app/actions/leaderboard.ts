"use server";

import { redis } from "@/db/redis";
import { auth } from "@/auth";

const LEADERBOARD_WPM_KEY = "typing_leaderboard_wpm_v2";
const LEADERBOARD_METADATA_KEY = "typing_leaderboard_metadata_v2";

export async function saveLeaderboardResult(wpm: number, accuracy: number, rawWpm: number) {
    const session = await auth();
    if (!session?.user) return { error: "You must be signed in to submit results." };
    if (!process.env.UPSTASH_REDIS_REST_URL) return { error: "Redis not configured." };

    const userId = session.user.id;
    if (!userId) return { error: "Invalid user session." };

    const userName = session.user.name || "Anonymous";
    const userImage = session.user.image || "";

    try {
        // Only update if it's the user's best WPM
        const currentBest = await redis.zscore(LEADERBOARD_WPM_KEY, userId);

        if (!currentBest || wpm > Number(currentBest)) {
            await redis.zadd(LEADERBOARD_WPM_KEY, { score: wpm, member: userId });

            const metadata = {
                userId,
                name: userName,
                image: userImage,
                wpm,
                accuracy,
                rawWpm,
                date: new Date().toISOString()
            };

            await redis.hset(LEADERBOARD_METADATA_KEY, { [userId]: JSON.stringify(metadata) });
        }

        return { success: true };
    } catch (error) {
        console.error("Redis Error:", error);
        return { error: "Failed to update leaderboard." };
    }
}

export async function getTopLeaderboard(limit = 25) {
    if (!process.env.UPSTASH_REDIS_REST_URL) return [];

    try {
        const userIds = await redis.zrange(LEADERBOARD_WPM_KEY, 0, limit - 1, {
            rev: true,
        }) as string[];

        if (userIds.length === 0) return [];

        // Fetch metadata for all these users
        const metadataList = await redis.hmget(LEADERBOARD_METADATA_KEY, ...userIds);

        if (!metadataList) return [];

        return (metadataList as unknown as (string | null)[])
            .filter((m): m is string => !!m)
            .map(m => JSON.parse(m));
    } catch (error) {
        console.error("Redis Fetch Error:", error);
        return [];
    }
}
