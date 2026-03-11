"use server";

import { db } from "@/db";
import { referrals, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/auth";

/**
 * Retrieves the total number of users successfully invited by the current authenticated user.
 */
export async function getReferralCount() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return { count: 0, error: "Unauthorized" };
    }

    try {
        const results = await db
            .select()
            .from(referrals)
            .where(eq(referrals.referrerId, userId));
            
        return { count: results.length, success: true };
    } catch (error) {
        console.error("Error fetching referrals:", error);
        return { count: 0, error: "Failed to fetch referrals" };
    }
}
