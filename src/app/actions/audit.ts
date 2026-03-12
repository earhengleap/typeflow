"use server";

import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { auth } from "@/auth";
import { desc, eq } from "drizzle-orm";

export async function getAuditLogs() {
    try {
        const session = await auth();
        if (session?.user?.role !== "superadmin") throw new Error("Unauthorized");

        const logs = await db.select({
            id: auditLogs.id,
            adminId: auditLogs.adminId,
            adminName: users.name,
            action: auditLogs.action,
            targetId: auditLogs.targetId,
            details: auditLogs.details,
            createdAt: auditLogs.createdAt,
        })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.adminId, users.id))
        .orderBy(desc(auditLogs.createdAt))
        .limit(50);

        return { success: true, data: logs };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function createAuditLog(action: string, targetId?: string, details?: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return;

        await db.insert(auditLogs).values({
            adminId: session.user.id,
            action,
            targetId: targetId || null,
            details: details || null,
        });
    } catch (e) {
        console.error("[AUDIT] Failed to create log:", e);
    }
}
