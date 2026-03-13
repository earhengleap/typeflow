"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
    LayoutDashboard, 
    Users, 
    Bell, 
    ScrollText, 
    ChevronLeft, 
    ChevronRight, 
    Shield,
    ArrowLeft
} from "lucide-react";
import { AuthenticSettings } from "@/components/icons/AuthenticSettings";
import { THEMES } from "@/constants/themes";
import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";

const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users, superOnly: true },
    { name: "Notifications", href: "/admin/notifications", icon: Bell },
    { name: "Audit Logs", href: "/admin/audit", icon: ScrollText, superOnly: true },
    { name: "Settings", href: "/admin/settings", icon: AuthenticSettings },
];

export function AdminSidebar({ userRole }: { userRole: string }) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const themeName = useMonkeyTypeStore((state) => state.theme);
    const activeTheme = THEMES[themeName] || THEMES.codex;

    // Persist collapse state
    useEffect(() => {
        const saved = localStorage.getItem("admin_sidebar_collapsed");
        if (saved !== null) setIsCollapsed(JSON.parse(saved));
    }, []);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
        localStorage.setItem("admin_sidebar_collapsed", JSON.stringify(!isCollapsed));
    };

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 280 }}
            className="fixed left-0 top-0 h-screen border-r border-white/10 z-50 flex flex-col transition-all duration-300 backdrop-blur-3xl"
            style={{ backgroundColor: `${activeTheme.bg}cc` }}
        >
            {/* Logo Section */}
            <div className="p-6 flex items-center justify-between border-b border-white/5">
                <AnimatePresence mode="wait">
                    {!isCollapsed ? (
                        <motion.div
                            key="full"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex items-center gap-2"
                        >
                            <div className="w-8 h-8 rounded-lg bg-[#ffaa00] flex items-center justify-center font-black text-black text-xs">A</div>
                            <span className="font-black tracking-tight text-[#ffaa00]">ADMIN PANEL</span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="icon"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full flex justify-center"
                        >
                            <div className="w-8 h-8 rounded-lg bg-[#ffaa00] flex items-center justify-center font-black text-black text-xs shadow-[0_0_15px_rgba(255,170,0,0.3)]">A</div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {!isCollapsed && (
                    <button 
                        onClick={toggleCollapse}
                        className="p-1 rounded-md hover:bg-white/5 opacity-40 hover:opacity-100 transition-all text-white"
                    >
                        <ChevronLeft size={16} />
                    </button>
                )}
            </div>

            {/* Collapse Toggle for Small View */}
            {isCollapsed && (
                <button 
                    onClick={toggleCollapse}
                    className="absolute -right-3 top-16 w-6 h-6 rounded-full border border-white/10 flex items-center justify-center z-50 transition-all hover:scale-110"
                    style={{ backgroundColor: activeTheme.bg }}
                >
                    <ChevronRight size={12} style={{ color: activeTheme.text }} />
                </button>
            )}

            {/* Navigation */}
            <nav className="flex-1 p-4 flex flex-col gap-2 mt-4">
                {navItems.map((item) => {
                    if (item.superOnly && userRole !== "superadmin") return null;

                    const isActive = pathname === item.href;
                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all group relative ${isActive ? 'bg-[#ffaa00]/10' : 'hover:bg-white/5 opacity-50 hover:opacity-100'}`}
                        >
                            <item.icon size={20} style={{ color: isActive ? activeTheme.primary : 'inherit' }} />
                            {!isCollapsed && (
                                <span className={`font-bold text-sm tracking-tight ${isActive ? 'text-[#ffaa00]' : 'text-white'}`}>
                                    {item.name}
                                </span>
                            )}
                            {isActive && (
                                <motion.div 
                                    layoutId="sidebar-active"
                                    className="absolute left-0 w-1 h-6 bg-[#ffaa00] rounded-r-full"
                                />
                            )}
                            
                            {/* Tooltip for collapsed state */}
                            {isCollapsed && (
                                <div className="absolute left-16 px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-md border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100] shadow-2xl">
                                    {item.name}
                                </div>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t border-white/5 flex flex-col gap-2">
                <Link 
                    href="/"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 opacity-40 hover:opacity-100 transition-all group relative"
                >
                    <ArrowLeft size={20} />
                    {!isCollapsed && <span className="font-bold text-sm">Exit Panel</span>}
                    {isCollapsed && (
                        <div className="absolute left-16 px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-md border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-2xl">
                            Exit Panel
                        </div>
                    )}
                </Link>
            </div>
        </motion.aside>
    );
}
