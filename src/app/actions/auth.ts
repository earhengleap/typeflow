"use server";

import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";

const RegisterSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function registerUser(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const verifyPassword = formData.get("verifyPassword") as string;

    if (password !== verifyPassword) {
        return { error: "Passwords do not match" };
    }

    const validatedFields = RegisterSchema.safeParse({ name, email, password });

    if (!validatedFields.success) {
        return { error: validatedFields.error.errors[0].message };
    }

    try {
        const [existingUser] = await db.select().from(users).where(eq(users.email, email));

        if (existingUser) {
            if (existingUser.password) {
                return { error: "User already exists with this email" };
            }

            // User exists via OAuth but has no password. Let's add it.
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.update(users)
                .set({ password: hashedPassword, name: name || existingUser.name })
                .where(eq(users.id, existingUser.id));

            return { success: "Account linked with password! You can now sign in." };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.insert(users).values({
            name,
            email,
            password: hashedPassword,
        });

        return { success: "Account created! You can now sign in." };
    } catch (error) {
        console.error("Registration error:", error);
        return { error: "Something went wrong during registration" };
    }
}

export async function forgotPassword(formData: FormData) {
    const email = formData.get("email") as string;

    if (!email) return { error: "Email is required" };

    try {
        const [user] = await db.select().from(users).where(eq(users.email, email));

        if (!user) {
            // Don't reveal if user exists or not for security, but we'll return success anyway
            return { success: "If an account exists with this email, a reset link will be sent." };
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 3600000); // 1 hour expiration

        // In a real app, delete old tokens first
        await db.insert(passwordResetTokens).values({
            email,
            token,
            expires,
        });

        // Simulate sending email
        console.log(`[AUTH] Password reset requested for ${email}. Token: ${token}`);
        console.log(`[AUTH] Reset URL: http://localhost:3001/reset-password?token=${token}`);

        return { success: "If an account exists with this email, a reset link will be sent." };
    } catch (error) {
        console.error("Forgot password error:", error);
        return { error: "Failed to process request" };
    }
}

export async function resetPassword(token: string, formData: FormData) {
    const password = formData.get("password") as string;
    const verifyPassword = formData.get("verifyPassword") as string;

    if (password !== verifyPassword) return { error: "Passwords do not match" };
    if (password.length < 6) return { error: "Password must be at least 6 characters" };

    try {
        const [resetToken] = await db.select()
            .from(passwordResetTokens)
            .where(eq(passwordResetTokens.token, token));

        if (!resetToken || resetToken.expires < new Date()) {
            return { error: "Invalid or expired token" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.email, resetToken.email));

        // Delete the token after use
        await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, resetToken.id));

        return { success: "Password reset successful! You can now sign in." };
    } catch (error) {
        console.error("Reset password error:", error);
        return { error: "Failed to reset password" };
    }
}
