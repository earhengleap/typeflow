"use client";

import React, { useState, useEffect } from "react";
import { 
    Settings, 
    ShieldAlert, 
    Zap, 
    Save, 
    RefreshCcw, 
    Loader2, 
    AlertTriangle,
    Eye,
    Lock
} from "lucide-react";
import { motion } from "framer-motion";
import { THEMES } from "@/constants/themes";
import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";
import { toggleMaintenanceMode, updateXPMultiplier, getSystemSettings, updateReferralBonus } from "@/app/actions/admin-settings";
import { toast } from "sonner";

export default function AdminSettingsPage() {
    const [maintenance, setMaintenance] = useState(false);
    const [xpMultiplier, setXpMultiplier] = useState(1);
    const [referralBonus, setReferralBonus] = useState(50);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const themeName = useMonkeyTypeStore((state) => state.theme);
    const activeTheme = THEMES[themeName] || THEMES.codex;

    useEffect(() => {
        const fetchSettings = async () => {
            const res = await getSystemSettings();
            if (res.success && res.settings) {
                setMaintenance(res.settings.maintenance_mode === "true");
                setXpMultiplier(parseFloat(res.settings.xp_multiplier || "1"));
                setReferralBonus(parseInt(res.settings.referral_bonus || "50"));
            }
            setLoading(false);
        };
        fetchSettings();
    }, []);

    const handleSaveMaintenance = async () => {
        setSaving("maintenance");
        const nextState = !maintenance;
        const res = await toggleMaintenanceMode(nextState);
        if (res.success) {
            setMaintenance(nextState);
            toast.success(`Maintenance mode ${nextState ? 'activated' : 'deactivated'}`);
        } else {
            toast.error(res.error);
        }
        setSaving(null);
    };

    const handleSyncEconomics = async () => {
        setSaving("economics");
        try {
            await Promise.all([
                updateXPMultiplier(xpMultiplier),
                updateReferralBonus(referralBonus)
            ]);
            toast.success("Economic parameters synced successfully");
        } catch (error) {
            toast.error("Failed to sync economic parameters");
        }
        setSaving(null);
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#ffaa00]/20" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tight" style={{ color: activeTheme.text }}>System Control</h1>
                <p className="text-sm opacity-50 font-medium" style={{ color: activeTheme.textDim }}>Modify global parameters and oversee high-level security protocols.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Security Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 px-2 text-xs font-black uppercase tracking-widest opacity-40">
                        <Lock size={14} /> Critical Security
                    </div>

                    <div className="p-8 rounded-[2.5rem] border space-y-8" style={{ backgroundColor: activeTheme.bgAlt + "15", borderColor: activeTheme.bgAlt }}>
                        <div className="flex items-start justify-between gap-6">
                            <div className="space-y-1">
                                <h3 className="font-bold text-lg">Maintenance Mode</h3>
                                <p className="text-xs opacity-50 leading-relaxed">
                                    Instantly restrict access to the public site. Only admins will be able to login and interact with the platform.
                                </p>
                            </div>
                            <button 
                                onClick={handleSaveMaintenance}
                                disabled={saving === "maintenance"}
                                className={`shrink-0 w-14 h-8 rounded-full transition-all relative ${maintenance ? 'bg-red-500' : 'bg-white/10'}`}
                            >
                                <motion.div 
                                    animate={{ x: maintenance ? 24 : 4 }}
                                    className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg"
                                />
                            </button>
                        </div>

                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                            <AlertTriangle className="shrink-0 w-4 h-4 text-red-400 mt-0.5" />
                            <p className="text-[10px] font-bold text-red-300 leading-normal uppercase tracking-wider">
                                CAUTION: Activating maintenance mode will terminate all active non-admin sessions immediately.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Economic Settings */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 px-2 text-xs font-black uppercase tracking-widest opacity-40">
                        <Zap size={14} /> Platform Economics
                    </div>

                    <div className="p-8 rounded-[2.5rem] border space-y-6" style={{ backgroundColor: activeTheme.bgAlt + "15", borderColor: activeTheme.bgAlt }}>
                        <div className="space-y-4">
                            <label className="text-xs font-bold opacity-60 uppercase tracking-widest">Global XP Multiplier</label>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="5" 
                                    step="0.1" 
                                    value={xpMultiplier}
                                    onChange={(e) => setXpMultiplier(parseFloat(e.target.value))}
                                    className="flex-1 accent-[#ffaa00] h-1.5 bg-white/5 rounded-full appearance-none outline-none"
                                />
                                <span className="w-12 text-center font-black text-[#ffaa00]">{xpMultiplier}x</span>
                            </div>
                            <p className="text-[10px] opacity-40 italic">Controls how much XP users gain from every test globally.</p>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-bold opacity-60 uppercase tracking-widest">Referral Bounty (XP)</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number"
                                    value={referralBonus}
                                    onChange={(e) => setReferralBonus(parseInt(e.target.value))}
                                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-[#ffaa00] transition-all w-24"
                                />
                                <span className="text-xs font-bold opacity-30">XP per success</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleSyncEconomics}
                            disabled={saving === "economics"}
                            className="w-full py-4 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-xl"
                            style={{ backgroundColor: activeTheme.primary, color: activeTheme.bg }}
                        >
                            {saving === "economics" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Sync Economic Parameters
                        </button>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-8">
                <div className="p-8 rounded-[3rem] border border-red-500/20 bg-red-500/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500">
                            <ShieldAlert size={32} />
                        </div>
                        <div className="space-y-1 text-center md:text-left">
                            <h3 className="font-black text-xl text-red-500 tracking-tight">System Purge</h3>
                            <p className="text-sm opacity-50 max-w-md font-medium">Clear all system logs and temporary cache. This action is irreversible and recorded in the audit trail.</p>
                        </div>
                    </div>
                    <button className="px-8 py-4 rounded-2xl font-black text-sm border border-red-500/40 text-red-500 hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest shadow-lg shadow-red-500/10">
                        Initiate Purge
                    </button>
                </div>
            </div>
        </div>
    );
}
