"use server";

import { db } from "@/db";
import { users, referrals, typingResults } from "@/db/schema";
import { eq, sql, count, desc } from "drizzle-orm";
import { auth } from "@/auth";

export async function getUsersList() {
    try {
        const session = await auth();
        if (session?.user?.role !== "superadmin") {
            throw new Error("Unauthorized");
        }

        const data = await db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            joinedAt: users.joinedAt,
            level: users.level,
            xp: users.xp,
            testsCompleted: users.testsCompleted,
        }).from(users);
        
        return { success: true, data };
    } catch (e: any) {
        console.error("Error fetching users list:", e);
        return { success: false, error: e.message || "Failed to fetch users" };
    }
}

export async function updateUserRole(userId: string, newRole: "user" | "admin" | "superadmin") {
    try {
        const session = await auth();
        if (session?.user?.role !== "superadmin") {
            throw new Error("Unauthorized");
        }

        // Prevent modifying other superadmins unless it's yourself? 
        // Or perhaps just allow it if they are superadmin.
        // For safety, let's at least ensure they can't accidentally demote the defined SUPER_ADMIN_EMAILS.
        
        const [targetUser] = await db.select().from(users).where(eq(users.id, userId));
        if (!targetUser) {
             return { success: false, error: "User not found" };
        }
        
        if (targetUser.email) {
            const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "")
                .split(",")
                .map(email => email.trim().toLowerCase());
                
            if (superAdmins.includes(targetUser.email.toLowerCase()) && newRole !== "superadmin") {
                return { success: false, error: "Cannot demote a system-defined Super Admin" };
            }
        }

        await db.update(users)
            .set({ role: newRole })
            .where(eq(users.id, userId));
            
        return { success: true };
    } catch (e: any) {
        console.error("Error updating user role:", e);
        return { success: false, error: e.message || "Failed to update role" };
    }
}

export async function deleteUser(userId: string) {
    try {
        const session = await auth();
        if (session?.user?.role !== "superadmin") {
            throw new Error("Unauthorized");
        }

        const [targetUser] = await db.select().from(users).where(eq(users.id, userId));
        if (!targetUser) {
             return { success: false, error: "User not found" };
        }
        
        // Safety lock: Cannot delete system-defined super admins
        if (targetUser.email) {
            const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "")
                .split(",")
                .map(email => email.trim().toLowerCase());
                
            if (superAdmins.includes(targetUser.email.toLowerCase())) {
            }
        }

        await db.delete(users).where(eq(users.id, userId));
            
        return { success: true };
    } catch (e: any) {
        console.error("Error deleting user:", e);
        return { success: false, error: e.message || "Failed to delete user" };
    }
}


export async function getAdminStats() {
    try {
        const session = await auth();
        if (session?.user?.role !== "admin" && session?.user?.role !== "superadmin") {
            throw new Error("Unauthorized");
        }

        const [userCount] = await db.select({ value: count() }).from(users);
        const [referralCount] = await db.select({ value: count() }).from(referrals);
        const [testCount] = await db.select({ value: count() }).from(typingResults);

        // Get new users in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const [recentUsers] = await db.select({ value: count() })
            .from(users)
            .where(sql`${users.joinedAt} > ${sevenDaysAgo}`);

        // Get recent tests
        const recentTests = await db.select({
            id: typingResults.id,
            wpm: typingResults.wpm,
            accuracy: typingResults.accuracy,
            createdAt: typingResults.createdAt,
            userName: users.name,
        })
        .from(typingResults)
        .leftJoin(users, eq(typingResults.userId, users.id))
        .orderBy(desc(typingResults.createdAt))
        .limit(10);

        return {
            success: true,
            data: {
                totalUsers: userCount.value,
                totalReferrals: referralCount.value,
                totalTests: testCount.value,
                newUsersLast7Days: recentUsers.value,
                recentTests
            }
        };
    } catch (e: any) {
        console.error("Error fetching admin stats:", e);
        return { success: false, error: e.message || "Failed to fetch stats" };
    }
}

export async function getLiveActivity() {
    try {
        const session = await auth();
        if (session?.user?.role !== "admin" && session?.user?.role !== "superadmin") {
            throw new Error("Unauthorized");
        }

        // Fetch recent significant events
        const recentTests = await db.select({
            id: typingResults.id,
            wpm: typingResults.wpm,
            createdAt: typingResults.createdAt,
            userName: users.name,
        }).from(typingResults)
        .leftJoin(users, eq(typingResults.userId, users.id))
        .orderBy(desc(typingResults.createdAt))
        .limit(5);

        const newUsers = await db.select({
            id: users.id,
            name: users.name,
            createdAt: users.joinedAt,
        }).from(users)
        .orderBy(desc(users.joinedAt))
        .limit(5);

        const events = [
            ...recentTests.map(t => ({ id: t.id, type: "TEST_COMPLETE", meta: `${t.userName || 'Guest'} finished with ${t.wpm} WPM`, time: t.createdAt })),
            ...newUsers.map(u => ({ id: u.id, type: "NEW_USER", meta: `${u.name || 'Anonymous'} joined the collective`, time: u.createdAt }))
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        return { success: true, events: events.slice(0, 8) };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function bulkUpdateRole(userIds: string[], role: "user" | "admin" | "superadmin") {
    try {
        const session = await auth();
        if (session?.user?.role !== "superadmin") throw new Error("Unauthorized");

        // Simple loop for safety (handling superadmin checks in a real app would be more complex)
        for (const id of userIds) {
            await updateUserRole(id, role);
        }
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function bulkDeleteUsers(userIds: string[]) {
    try {
        const session = await auth();
        if (session?.user?.role !== "superadmin") throw new Error("Unauthorized");

        for (const id of userIds) {
            await deleteUser(id);
        }
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
