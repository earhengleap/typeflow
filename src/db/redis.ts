import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
    if (typeof window === "undefined") {
        console.warn("⚠️ Upstash Redis environment variables are missing. Leaderboard features will be disabled.");
    }
}

export const redis = new Redis({
    url: url || "",
    token: token || "",
});
