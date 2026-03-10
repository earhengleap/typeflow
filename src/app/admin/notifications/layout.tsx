import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function AdminNotificationsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // @ts-ignore - role is added to the user object in auth.ts
    const isAdmin = session?.user?.role === "admin";

    if (!isAdmin) {
        redirect("/");
    }

    return <>{children}</>;
}
