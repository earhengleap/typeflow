import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { THEMES } from "@/constants/themes";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    
    const role = session?.user?.role;
    const isAdmin = role === "admin" || role === "superadmin";

    if (!isAdmin) {
        // Just render the children (which will be the login page).
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen flex bg-black text-white selection:bg-[#ffaa00] selection:bg-opacity-30">
            <AdminSidebar userRole={role as string} />
            <main className="flex-1 flex flex-col p-4 md:p-8 ml-[80px] md:ml-[var(--sidebar-width,280px)] transition-all duration-300">
                <style dangerouslySetInnerHTML={{ __html: `
                    :root {
                        --sidebar-width: 280px;
                    }
                    [data-sidebar-collapsed="true"] {
                        --sidebar-width: 80px;
                    }
                `}} />
                {/* Content Container with standard max-width for consistency */}
                <div className="max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
