"use client";

import React, { useEffect, useState } from "react";
import { 
    Users, 
    Zap, 
    Share2, 
    TrendingUp, 
    Clock, 
    ArrowUpRight, 
    Loader2,
    Activity,
    Terminal,
    ChevronRight,
    Search,
    ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { THEMES } from "@/constants/themes";
import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";
import { getAdminStats, getLiveActivity } from "@/app/actions/admin";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const themeName = useMonkeyTypeStore((state) => state.theme);
    const activeTheme = THEMES[themeName] || THEMES.codex;

    useEffect(() => {
        const loadData = async () => {
            const [statsRes, eventsRes] = await Promise.all([
                getAdminStats(),
                getLiveActivity()
            ]);
            if (statsRes.success) setStats(statsRes.data);
            if (eventsRes.success && eventsRes.events) setEvents(eventsRes.events);
            setLoading(false);
        };
        loadData();

        const interval = setInterval(async () => {
            const res = await getLiveActivity();
            if (res.success && res.events) setEvents(res.events);
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#ffaa00]" />
            </div>
        );
    }

    const cards = [
        { title: "Total Users", value: stats?.totalUsers || 0, icon: Users, trend: `+${stats?.newUsersLast7Days || 0} this week`, color: "#ffaa00" },
        { title: "Typing Tests", value: stats?.totalTests || 0, icon: Zap, trend: "Overall Activity", color: "#00eeff" },
        { title: "Referrals", value: stats?.totalReferrals || 0, icon: Share2, trend: "Community Growth", color: "#ff00ee" },
        { title: "Conversions", value: "84%", icon: TrendingUp, trend: "+2.4% from last month", color: "#00ff88" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tight" style={{ color: activeTheme.text }}>Command Center</h1>
                <p className="text-sm opacity-50 font-medium" style={{ color: activeTheme.textDim }}>Operation Status: <span className="text-[#00ff88]">OPTIMAL</span></p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-6 rounded-[2.5rem] border relative overflow-hidden group hover:scale-[1.02] transition-all cursor-default shadow-2xl"
                        style={{ backgroundColor: activeTheme.bgAlt + "15", borderColor: activeTheme.bgAlt }}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <card.icon size={64} style={{ color: card.color }} />
                        </div>
                        
                        <div className="flex flex-col gap-1 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{card.title}</span>
                            <span className="text-4xl font-black" style={{ color: activeTheme.text }}>{card.value.toLocaleString()}</span>
                            <div className="flex items-center gap-1.5 mt-4 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-white/5 w-fit">
                                <ArrowUpRight size={12} style={{ color: card.color }} />
                                <span style={{ color: card.color }}>{card.trend}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Activity & Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                            <Activity size={14} /> Global Feed
                        </h2>
                        <span className="text-[10px] font-bold opacity-30 tracking-widest uppercase">Latest Synchronizations</span>
                    </div>

                    <div className="rounded-[3rem] border overflow-hidden bg-black/20" style={{ borderColor: activeTheme.bgAlt }}>
                        <table className="w-full text-left">
                            <thead className="text-[10px] uppercase font-black tracking-[0.2em] opacity-40 border-b border-dashed" style={{ borderColor: activeTheme.bgAlt }}>
                                <tr>
                                    <th className="px-10 py-6">Operative</th>
                                    <th className="px-10 py-6 text-center">Output (WPM)</th>
                                    <th className="px-10 py-6 text-center">Precision</th>
                                    <th className="px-10 py-6 text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm font-bold">
                                {stats?.recentTests.map((test: any, i: number) => (
                                    <tr 
                                        key={test.id} 
                                        className="border-b border-dashed last:border-0 hover:bg-white/[0.03] transition-colors"
                                        style={{ borderColor: activeTheme.bgAlt + "20" }}
                                    >
                                        <td className="px-10 py-5 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-[#ffaa00]/10 flex items-center justify-center text-xs font-black text-[#ffaa00] border border-[#ffaa00]/20 shadow-[0_0_15px_rgba(255,170,0,0.1)]">
                                                {(test.userName || "U").charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{ color: activeTheme.text }}>{test.userName || "ANONYMOUS"}</span>
                                        </td>
                                        <td className="px-10 py-5 text-center font-black text-xl" style={{ color: activeTheme.primary }}>{test.wpm}</td>
                                        <td className="px-10 py-5 text-center opacity-60">{test.accuracy}%</td>
                                        <td className="px-10 py-5 text-right opacity-30 text-[10px] font-black tracking-tighter">
                                            {new Date(test.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Live Activity Terminal */}
                <div className="space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-widest opacity-60 flex items-center gap-2 px-2">
                        <Terminal size={14} /> Logic Execution
                    </h2>
                    
                    <div className="p-8 rounded-[3rem] border bg-black/40 font-mono space-y-6 relative overflow-hidden" style={{ borderColor: activeTheme.bgAlt }}>
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Activity size={120} style={{ color: activeTheme.primary }} />
                        </div>

                        <div className="flex flex-col gap-3 min-h-[400px]">
                            <AnimatePresence initial={false}>
                                {events.map((event) => (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col gap-1 border-l-2 pl-4 py-1"
                                        style={{ borderLeftColor: event.type === 'NEW_USER' ? '#ffaa00' : activeTheme.primary }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: event.type === 'NEW_USER' ? '#ffaa00' : activeTheme.primary }}>
                                                [{event.type}]
                                            </span>
                                            <span className="text-[9px] opacity-20 font-bold">
                                                {new Date(event.time).toLocaleTimeString([], { hour12: false })}
                                            </span>
                                        </div>
                                        <p className="text-[11px] leading-relaxed opacity-60 font-medium">
                                            <span className="text-[#00ff88] mr-2">&gt;</span>
                                            {event.meta}
                                        </p>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            
                            {/* Blinking cursor effect */}
                            <div className="flex items-center gap-2 mt-4 text-[10px] opacity-20 font-black">
                                <span className="animate-pulse">_</span>
                                <span>WAITING FOR EVENTS...</span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 space-y-4">
                             <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-40">
                                <span>SYSTEM STATUS</span>
                                <span className="text-[#00ff88]">STABLE</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    animate={{ x: [-100, 400] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="w-1/4 h-full bg-[#00ff88]/40"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
