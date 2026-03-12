"use client";

import React, { useEffect, useState } from "react";
import { getAuditLogs } from "@/app/actions/audit";
import { 
    ScrollText, 
    User, 
    Clock, 
    Search,
    Loader2,
    Shield,
    Database,
    Fingerprint
} from "lucide-react";
import { motion } from "framer-motion";
import { THEMES } from "@/constants/themes";
import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";

const actionColors: Record<string, string> = {
    'USER_DELETE': '#ff4444',
    'ROLE_CHANGE': '#ffaa00',
    'MAINTENANCE_TOGGLE': '#00eeff',
    'XP_UPDATE': '#00ff88',
    'PURGE': '#ff00ee'
};

export default function AdminAuditPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const themeName = useMonkeyTypeStore((state) => state.theme);
    const activeTheme = THEMES[themeName] || THEMES.codex;

    useEffect(() => {
        getAuditLogs().then(res => {
            if (res.success) {
                setLogs(res.data || []);
            }
            setLoading(false);
        });
    }, []);

    const filteredLogs = logs.filter(log => 
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.adminName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#ffaa00]" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight" style={{ color: activeTheme.text }}>Audit Trail</h1>
                    <p className="text-sm opacity-50 font-medium" style={{ color: activeTheme.textDim }}>Immutable ledger of all high-level administrative operations.</p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                    <input 
                        type="text"
                        placeholder="Filter ledger..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#ffaa00] transition-all"
                    />
                </div>
            </div>

            <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-0 bottom-0 w-px bg-white/5 hidden md:block" />

                <div className="space-y-6">
                    {filteredLogs.map((log, i) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex flex-col md:flex-row gap-6 relative"
                        >
                            {/* Icon / Marker */}
                            <div className="shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center relative z-10 border transition-all" 
                                 style={{ 
                                    backgroundColor: (actionColors[log.action] || activeTheme.primary) + '10',
                                    borderColor: (actionColors[log.action] || activeTheme.primary) + '20'
                                 }}>
                                <Fingerprint size={24} style={{ color: actionColors[log.action] || activeTheme.primary }} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-6 rounded-[2.5rem] border bg-white/[0.02] hover:bg-white/[0.04] transition-all group" style={{ borderColor: activeTheme.bgAlt }}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" 
                                              style={{ backgroundColor: (actionColors[log.action] || activeTheme.primary) + '20', color: actionColors[log.action] || activeTheme.primary }}>
                                            {log.action.replace('_', ' ')}
                                        </span>
                                        <div className="h-1 w-1 rounded-full bg-white/20" />
                                        <div className="flex items-center gap-2 text-xs font-bold opacity-60">
                                            <User size={12} />
                                            {log.adminName || "System Entity"}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold opacity-30">
                                        <Clock size={12} />
                                        {new Date(log.createdAt).toLocaleString()}
                                    </div>
                                </div>

                                <p className="text-sm font-medium leading-relaxed opacity-80" style={{ color: activeTheme.text }}>
                                    {log.details || "No supplementary data provided for this entry."}
                                </p>

                                {log.targetId && (
                                    <div className="mt-4 pt-4 border-t flex items-center gap-2 text-[10px] font-mono opacity-30" style={{ borderColor: activeTheme.bgAlt + '40' }}>
                                        <Database size={12} />
                                        TARGET_ID: {log.targetId}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {filteredLogs.length === 0 && (
                        <div className="p-20 text-center border border-dashed rounded-[3rem] opacity-20" style={{ borderColor: activeTheme.bgAlt }}>
                            <ScrollText size={64} className="mx-auto mb-4" />
                            <p className="font-black uppercase tracking-widest">End of Ledger</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
