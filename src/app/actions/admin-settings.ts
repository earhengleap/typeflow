"use server";

import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";

export async function getSystemSettings() {
    try {
        const session = await auth();
        if (session?.user?.role !== "admin" && session?.user?.role !== "superadmin") {
            throw new Error("Unauthorized");
        }

        const results = await db.select().from(systemSettings);
        const settings: Record<string, string> = {};
        results.forEach(row => {
            settings[row.key] = row.value;
        });

        return { success: true, settings };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function toggleMaintenanceMode(enabled: boolean) {
    try {
        const session = await auth();
        if (session?.user?.role !== "superadmin") throw new Error("Unauthorized");

        await db.insert(systemSettings)
            .values({ key: "maintenance_mode", value: enabled.toString(), updatedAt: new Date() })
            .onConflictDoUpdate({
                target: [systemSettings.key],
                set: { value: enabled.toString(), updatedAt: new Date() }
            });

        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateXPMultiplier(multiplier: number) {
    try {
        const session = await auth();
        if (session?.user?.role !== "superadmin") throw new Error("Unauthorized");

        await db.insert(systemSettings)
            .values({ key: "xp_multiplier", value: multiplier.toString(), updatedAt: new Date() })
            .onConflictDoUpdate({
                target: [systemSettings.key],
                set: { value: multiplier.toString(), updatedAt: new Date() }
            });

        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateReferralBonus(bonus: number) {
    try {
        const session = await auth();
        if (session?.user?.role !== "superadmin") throw new Error("Unauthorized");

        await db.insert(systemSettings)
            .values({ key: "referral_bonus", value: bonus.toString(), updatedAt: new Date() })
            .onConflictDoUpdate({
                target: [systemSettings.key],
                set: { value: bonus.toString(), updatedAt: new Date() }
            });

        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
