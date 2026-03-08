"use client";

import { useEffect, useState } from "react";
import { getTopLeaderboard } from "@/app/actions/leaderboard";
import { Trophy, Medal, User, Award, X, Clock, Calendar, Globe, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
    userId: string;
    name: string;
    image?: string;
    wpm: number;
    accuracy: number;
    rawWpm: number;
    date: string;
}

interface LeaderboardProps {
    theme: any;
    isOpen: boolean;
    onClose: () => void;
}

export function Leaderboard({ theme, isOpen, onClose }: LeaderboardProps) {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"allTime" | "weekly" | "daily">("allTime");
    const [activeMode, setActiveMode] = useState<"15" | "60">("15");

    useEffect(() => {
        if (!isOpen) return;

        const fetchLeaderboard = async () => {
            setLoading(true);
            const data = await getTopLeaderboard(50);
            setEntries(data as LeaderboardEntry[]);
            setLoading(false);
        };

        fetchLeaderboard();
    }, [isOpen, activeTab, activeMode]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return {
                date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
            };
        } catch {
            return { date: 'Unknown', time: '' };
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="relative w-full h-full max-w-6xl md:h-auto md:max-h-[90vh] bg-[#2c2e31] rounded-none md:rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/5"
                        style={{ backgroundColor: theme.bg }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Static Header/Title */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: theme.text }}>
                                All-time English Time {activeMode} Leaderboard
                            </h1>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl transition-all hover:bg-white/5 opacity-50 hover:opacity-100"
                                style={{ color: theme.textDim }}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex flex-1 overflow-hidden">
                            {/* Sidebar */}
                            <div className="w-20 md:w-64 border-r border-white/5 p-4 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
                                <div className="space-y-4">
                                    <h3 className="hidden md:block text-[10px] uppercase tracking-[0.2em] font-black opacity-20 px-4">Category</h3>
                                    <div className="flex flex-col gap-1">
                                        {[
                                            { id: 'allTime', label: 'all-time english', icon: Globe },
                                            { id: 'weekly', label: 'weekly xp', icon: Award },
                                            { id: 'daily', label: 'daily', icon: Calendar },
                                        ].map(tab => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id as any)}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 rounded-xl transition-all group",
                                                    activeTab === tab.id ? "bg-[#e2b714]" : "hover:bg-white/5"
                                                )}
                                                style={{
                                                    backgroundColor: activeTab === tab.id ? theme.primary : undefined,
                                                    color: activeTab === tab.id ? theme.bg : theme.textDim
                                                }}
                                            >
                                                <tab.icon className="w-5 h-5 shrink-0" />
                                                <span className="hidden md:block font-bold text-sm tracking-tight">{tab.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="hidden md:block text-[10px] uppercase tracking-[0.2em] font-black opacity-20 px-4">Mode</h3>
                                    <div className="flex flex-col gap-1">
                                        {[
                                            { id: '15', label: 'time 15', icon: Clock },
                                            { id: '60', label: 'time 60', icon: Clock },
                                        ].map(mode => (
                                            <button
                                                key={mode.id}
                                                onClick={() => setActiveMode(mode.id as any)}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 rounded-xl transition-all",
                                                    activeMode === mode.id ? "bg-[#e2b714]" : "hover:bg-white/5"
                                                )}
                                                style={{
                                                    backgroundColor: activeMode === mode.id ? theme.primary : undefined,
                                                    color: activeMode === mode.id ? theme.bg : theme.textDim
                                                }}
                                            >
                                                <mode.icon className="w-5 h-5 shrink-0" />
                                                <span className="hidden md:block font-bold text-sm tracking-tight">{mode.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Main Table */}
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="p-4 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-left border-separate border-spacing-y-1">
                                        <thead>
                                            <tr className="text-[10px] uppercase tracking-[0.2em] font-black opacity-20">
                                                <th className="px-4 py-2 w-12 text-center">#</th>
                                                <th className="px-4 py-2">name</th>
                                                <th className="px-4 py-2 text-right">wpm</th>
                                                <th className="px-4 py-2 text-right">accuracy</th>
                                                <th className="px-4 py-2 text-right md:table-cell hidden">raw</th>
                                                <th className="px-4 py-2 text-right md:table-cell hidden">date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                Array(10).fill(0).map((_, i) => (
                                                    <tr key={i} className="animate-pulse">
                                                        <td colSpan={6} className="h-12 bg-white/5 rounded-xl border-y-[6px] border-transparent" />
                                                    </tr>
                                                ))
                                            ) : entries.length > 0 ? (
                                                entries.map((entry, index) => {
                                                    const { date, time } = formatDate(entry.date);
                                                    return (
                                                        <tr key={entry.userId} className="group hover:bg-white/5 transition-colors">
                                                            <td className="px-4 py-3 text-center rounded-l-2xl">
                                                                {index === 0 ? (
                                                                    <div className="flex justify-center">
                                                                        <Trophy className="w-5 h-5" style={{ color: theme.primary }} />
                                                                    </div>
                                                                ) : (
                                                                    <span className="font-mono text-sm opacity-30">{index + 1}</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                                                        {entry.image ? (
                                                                            <img src={entry.image} alt="" className="w-full h-full rounded-full" />
                                                                        ) : (
                                                                            <User className="w-4 h-4 opacity-50" />
                                                                        )}
                                                                    </div>
                                                                    <span className="font-bold tracking-tight truncate max-w-[120px] md:max-w-none">{entry.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <span className="text-lg font-black italic tracking-tighter" style={{ color: theme.primary }}>
                                                                    {entry.wpm.toFixed(2)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <span className="font-bold tabular-nums">
                                                                    {entry.accuracy.toFixed(2)}%
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right md:table-cell hidden">
                                                                <span className="opacity-50 tabular-nums">{entry.rawWpm.toFixed(2)}</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right rounded-r-2xl md:table-cell hidden">
                                                                <div className="flex flex-col leading-tight">
                                                                    <span className="text-[10px] font-bold">{date}</span>
                                                                    <span className="text-[10px] opacity-30">{time}</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="py-20 text-center opacity-30 italic">
                                                        No results yet. Be the first to join the leaderboard!
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-8 py-4 bg-white/5 text-[10px] uppercase font-black tracking-[0.2em] opacity-20 text-center">
                                    Real-time rankings powered by Upstash Redis
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
