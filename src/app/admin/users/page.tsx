"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getUsersList, updateUserRole, deleteUser } from "@/app/actions/admin";
import { 
    Loader2, 
    ShieldAlert, 
    ShieldCheck, 
    User, 
    Search, 
    Trash2, 
    ChevronLeft, 
    ChevronRight, 
    ChevronDown, 
    AlertTriangle, 
    X,
    Eye,
    Shield,
    Users
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { THEMES } from "@/constants/themes";
import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";

type DBUser = {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    joinedAt: Date;
    level: number;
    xp: number;
    testsCompleted: number;
};

// --- Custom Role Dropdown Component ---
function RoleDropdown({ 
    user, 
    onRoleChange, 
    disabled 
}: { 
    user: DBUser; 
    onRoleChange: (userId: string, role: string) => void;
    disabled: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const roles = ["user", "admin", "superadmin"];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className="flex items-center justify-between gap-2 bg-black/40 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest px-4 py-2.5 min-w-[120px] transition-all hover:bg-white/5 active:scale-95 disabled:opacity-50"
            >
                <span className="truncate">{user.role}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute right-0 top-full mt-3 w-40 bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        {roles.map((r) => (
                            <button
                                key={r}
                                onClick={() => {
                                    onRoleChange(user.id, r);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-3 ${
                                    user.role === r ? 'bg-[#ffaa00]/10 text-[#ffaa00]' : 'hover:bg-white/5 text-white/40 hover:text-white'
                                }`}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full ${user.role === r ? 'bg-[#ffaa00]' : 'bg-white/10'}`} />
                                {r}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- User Inspect Drawer Component ---
function UserInspectDrawer({ 
    user, 
    onClose,
    activeTheme
}: { 
    user: DBUser | null; 
    onClose: () => void;
    activeTheme: any;
}) {
    const [referrals, setReferrals] = useState<{ id: string; name: string | null; joinedAt: Date | null }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setLoading(true);
            import("@/app/actions/referrals").then(({ getUserReferralsForAdmin }) => {
                getUserReferralsForAdmin(user.id).then(res => {
                    if (res.success && res.data) {
                        setReferrals(res.data);
                    }
                    setLoading(false);
                });
            });
        }
    }, [user]);

    return (
        <AnimatePresence>
            {user && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />
                    
                    <motion.div 
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="relative w-full max-w-xl h-full border-l flex flex-col shadow-2xl"
                        style={{ backgroundColor: activeTheme.bg, borderColor: activeTheme.bgAlt }}
                    >
                        {/* Header */}
                        <div className="p-10 border-b flex items-center justify-between" style={{ borderColor: activeTheme.bgAlt }}>
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-black shadow-2xl" style={{ backgroundColor: activeTheme.bgAlt, color: activeTheme.primary }}>
                                    {user.name?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-3xl font-black tracking-tight" style={{ color: activeTheme.text }}>{user.name || "Anonymous Operative"}</h2>
                                    <span className="text-sm opacity-40 font-bold" style={{ color: activeTheme.textDim }}>{user.email}</span>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-4 rounded-full hover:bg-white/5 transition-colors group"
                            >
                                <X size={24} className="opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: activeTheme.text }} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-12">
                            {/* Detailed Stats */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-8 rounded-[2.5rem] border flex flex-col gap-2" style={{ borderColor: activeTheme.bgAlt, backgroundColor: activeTheme.bgAlt + "10" }}>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Cumulative XP</span>
                                    <span className="text-3xl font-black" style={{ color: activeTheme.primary }}>{user.xp.toLocaleString()}</span>
                                </div>
                                <div className="p-8 rounded-[2.5rem] border flex flex-col gap-2" style={{ borderColor: activeTheme.bgAlt, backgroundColor: activeTheme.bgAlt + "10" }}>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Clearance Level</span>
                                    <span className="text-3xl font-black" style={{ color: activeTheme.text }}>{user.level}</span>
                                </div>
                            </div>

                            {/* Referral Tree */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-2">
                                        <Shield size={14} className="text-[#ffaa00]" /> Operative Recruitment
                                    </h3>
                                    <span className="text-[10px] font-black opacity-20">{referrals.length} DIRECT HIRES</span>
                                </div>
                                
                                {loading ? (
                                    <div className="flex justify-center p-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-[#ffaa00]/20" />
                                    </div>
                                ) : referrals.length === 0 ? (
                                    <div className="p-12 border-2 border-dashed rounded-[3rem] text-center opacity-20" style={{ borderColor: activeTheme.bgAlt }}>
                                        <p className="text-xs font-black uppercase tracking-widest">No recruitment data found</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {referrals.map(ref => (
                                            <div key={ref.id} className="p-5 rounded-[1.5rem] border flex items-center justify-between group hover:scale-[1.01] transition-all" style={{ borderColor: activeTheme.bgAlt, backgroundColor: activeTheme.bgAlt + "05" }}>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all group-hover:bg-[#ffaa00]/10 group-hover:text-[#ffaa00]" style={{ backgroundColor: activeTheme.bgAlt, color: activeTheme.text }}>
                                                        {ref.name?.charAt(0).toUpperCase() || "U"}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black" style={{ color: activeTheme.text }}>{ref.name || "Anonymous Operative"}</span>
                                                        <span className="text-[10px] opacity-30 font-bold uppercase tracking-wider">Active Status</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] opacity-40 font-black uppercase tracking-widest">
                                                        {new Date(ref.joinedAt!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-10 border-t flex items-center gap-4" style={{ borderColor: activeTheme.bgAlt }}>
                            <button className="flex-1 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] border transition-all hover:bg-white/5 active:scale-95" style={{ borderColor: activeTheme.bgAlt, color: activeTheme.text }}>
                                Trigger Password Reset
                            </button>
                            <button className="flex-1 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white active:scale-95 shadow-xl shadow-red-500/10">
                                Permanent Suspension
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default function AdminUsersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<DBUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [userToDelete, setUserToDelete] = useState<DBUser | null>(null);
    const [selectedUser, setSelectedUser] = useState<DBUser | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkLoading, setIsBulkLoading] = useState(false);

    const themeName = useMonkeyTypeStore((state) => state.theme);
    const activeTheme = THEMES[themeName] || THEMES.codex;

    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedUsers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(paginatedUsers.map(u => u.id));
        }
    };

    const toggleSelectUser = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkRoleChange = async (role: "user" | "admin" | "superadmin") => {
        if (selectedIds.length === 0) return;
        setIsBulkLoading(true);
        const { bulkUpdateRole } = await import("@/app/actions/admin");
        const res = await bulkUpdateRole(selectedIds, role);
        if (res.success) {
            toast.success(`Updated ${selectedIds.length} operatives`);
            fetchUsers();
            setSelectedIds([]);
        } else {
            toast.error(res.error || "Bulk update failed");
        }
        setIsBulkLoading(false);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Are you sure you want to terminate ${selectedIds.length} operatives?`)) return;
        
        setIsBulkLoading(true);
        const { bulkDeleteUsers } = await import("@/app/actions/admin");
        const res = await bulkDeleteUsers(selectedIds);
        if (res.success) {
            toast.success(`Terminated ${selectedIds.length} operatives`);
            fetchUsers();
            setSelectedIds([]);
        } else {
            toast.error(res.error || "Bulk deletion failed");
        }
        setIsBulkLoading(false);
    };

    useEffect(() => {
        if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "superadmin")) {
            router.push("/");
            return;
        }

        if (status === "authenticated") {
            fetchUsers();
        }
    }, [status, session, router]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await getUsersList();
            if (res.success && res.data) {
                setUsers(res.data as DBUser[]);
            } else {
                toast.error(res.error || "Failed to load users");
            }
        } catch (error) {
            toast.error("Error fetching users");
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (newRole !== "user" && newRole !== "admin" && newRole !== "superadmin") return;
        
        try {
            setUpdatingId(userId);
            const res = await updateUserRole(userId, newRole as "user" | "admin" | "superadmin");
            
            if (res.success) {
                toast.success(`Role updated to ${newRole}`);
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
                const { createAuditLog } = await import("@/app/actions/audit");
                await createAuditLog("ROLE_CHANGE", userId, `Changed role to ${newRole}`);
            } else {
                toast.error(res.error || "Failed to update role");
            }
        } catch (error) {
            toast.error("Error updating role");
        } finally {
            setUpdatingId(null);
        }
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;

        try {
            setDeletingId(userToDelete.id);
            const res = await deleteUser(userToDelete.id);
            if (res.success) {
                toast.success("Operative terminated successfully.");
                setUsers(users.filter(u => u.id !== userToDelete.id));
                const { createAuditLog } = await import("@/app/actions/audit");
                await createAuditLog("USER_DELETE", userToDelete.id, `Deleted user ${userToDelete.email}`);
                setUserToDelete(null);
            } else {
                toast.error(res.error || "Failed to delete user");
            }
        } catch (error) {
            toast.error("Error deleting user");
        } finally {
            setDeletingId(null);
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = 
                (user.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (user.email?.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesSearch;
        });
    }, [users, searchQuery]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#ffaa00]" />
            </div>
        );
    }

    return (
        <div className="space-y-10 relative selection:bg-[#ffaa00]/30" style={{ color: activeTheme.text }}>
            <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter" style={{ color: activeTheme.text }}>Personnel File</h2>
                    <p className="text-sm opacity-40 font-bold mt-1 tracking-tight" style={{ color: activeTheme.textDim }}>Manage platform operatives and clearance levels.</p>
                </div>
                
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                    <input
                        type="text"
                        placeholder="Scan operatives name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-[2rem] pl-14 pr-6 py-4 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-[#ffaa00]/50 transition-all shadow-2xl"
                    />
                </div>
            </div>

            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 px-10 py-6 rounded-[3rem] border shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
                        style={{ backgroundColor: activeTheme.bgAlt, borderColor: activeTheme.primary + "40" }}
                    >
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Operatives Selected</span>
                            <span className="text-xl font-black" style={{ color: activeTheme.primary }}>{selectedIds.length.toString().padStart(2, '0')}</span>
                        </div>

                        <div className="h-10 w-px bg-white/10" />

                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => handleBulkRoleChange("user")}
                                disabled={isBulkLoading}
                                className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-30"
                            >
                                Set User
                            </button>
                            <button 
                                onClick={() => handleBulkRoleChange("admin")}
                                disabled={isBulkLoading}
                                className="px-6 py-3 rounded-2xl bg-[#ffaa00]/10 border border-[#ffaa00]/20 text-[10px] font-black uppercase tracking-widest text-[#ffaa00] hover:bg-[#ffaa00]/20 transition-all disabled:opacity-30"
                            >
                                Set Admin
                            </button>
                            <button 
                                onClick={handleBulkDelete}
                                disabled={isBulkLoading}
                                className="px-6 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-30"
                            >
                                {isBulkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Terminate"}
                            </button>
                        </div>

                        <button 
                            onClick={() => setSelectedIds([])}
                            className="ml-4 p-2 opacity-30 hover:opacity-100 transition-opacity"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="border rounded-[3.5rem] overflow-hidden bg-white/[0.01] backdrop-blur-xl" style={{ borderColor: activeTheme.bgAlt }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 border-b" style={{ borderColor: activeTheme.bgAlt }}>
                            <tr>
                                <th className="pl-10 pr-4 py-8">
                                    <div 
                                        onClick={toggleSelectAll}
                                        className={`w-5 h-5 rounded-lg border-2 cursor-pointer flex items-center justify-center transition-all ${selectedIds.length === paginatedUsers.length ? 'bg-[#ffaa00] border-[#ffaa00]' : 'border-white/20'}`}
                                    >
                                        {selectedIds.length === paginatedUsers.length && <div className="w-2 h-2 bg-black rounded-sm" />}
                                    </div>
                                </th>
                                <th className="px-10 py-8"> operative </th>
                                <th className="px-10 py-8"> clearance </th>
                                <th className="px-10 py-8 text-center"> seniority </th>
                                <th className="px-10 py-8 text-center"> deployments </th>
                                <th className="px-10 py-8 text-right"> controls </th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-bold">
                            {paginatedUsers.map((user) => (
                                <tr 
                                    key={user.id} 
                                    className={`border-b last:border-0 hover:bg-white/[0.02] transition-all cursor-pointer group ${selectedIds.includes(user.id) ? 'bg-[#ffaa00]/5' : ''}`}
                                    style={{ borderColor: activeTheme.bgAlt + "40" }}
                                    onClick={() => setSelectedUser(user)}
                                >
                                    <td className="pl-10 pr-4 py-8" onClick={(e) => e.stopPropagation()}>
                                        <div 
                                            onClick={() => toggleSelectUser(user.id)}
                                            className={`w-5 h-5 rounded-lg border-2 cursor-pointer flex items-center justify-center transition-all ${selectedIds.includes(user.id) ? 'bg-[#ffaa00] border-[#ffaa00]' : 'border-white/20'}`}
                                        >
                                            {selectedIds.includes(user.id) && <div className="w-2 h-2 bg-black rounded-sm" />}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all group-hover:scale-110 shadow-lg" style={{ backgroundColor: activeTheme.bgAlt, color: activeTheme.primary }}>
                                                {user.name?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                            <div className="flex flex-col">
                                                <span style={{ color: activeTheme.text }}>{user.name || "Anonymous"}</span>
                                                <span className="text-[10px] opacity-30 font-black uppercase tracking-widest">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-2 rounded-lg border ${
                                            user.role === "superadmin" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                            user.role === "admin" ? "bg-[#ffaa00]/10 text-[#ffaa00] border-[#ffaa00]/20" :
                                            "bg-white/5 text-white/40 border-white/10"
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                         <div className="flex flex-col items-center gap-1">
                                            <span className="text-xs font-black" style={{ color: activeTheme.primary }}>RANK {user.level || 1}</span>
                                            <span className="text-[10px] opacity-20 font-black tracking-widest uppercase">{user.xp?.toLocaleString()} XP</span>
                                         </div>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/5 text-xs opacity-60">
                                            {user.testsCompleted || 0}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-3">
                                            <RoleDropdown 
                                                user={user} 
                                                onRoleChange={handleRoleChange} 
                                                disabled={updatingId === user.id || deletingId === user.id}
                                            />
                                            <button 
                                                onClick={() => setSelectedUser(user)}
                                                className="p-3 text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    if (session?.user?.email === user.email) {
                                                        toast.error("Self-termination is restricted.");
                                                        return;
                                                    }
                                                    setUserToDelete(user);
                                                }}
                                                disabled={deletingId === user.id || session?.user?.email === user.email}
                                                className="p-3 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-5"
                                            >
                                                {deletingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {paginatedUsers.length === 0 && (
                    <div className="p-20 text-center opacity-20 italic font-bold">
                        No operatives found matching current scan parameters.
                    </div>
                )}

                {filteredUsers.length > 0 && (
                    <div className="p-10 border-t flex items-center justify-between" style={{ borderColor: activeTheme.bgAlt }}>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20">
                            {filteredUsers.length} total operatives found
                        </span>
                        
                        <div className="flex items-center gap-6">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-4 rounded-2xl border transition-all disabled:opacity-5 hover:bg-white/5"
                                style={{ borderColor: activeTheme.bgAlt }}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span className="text-[11px] font-black tracking-[0.5em] opacity-50">
                                {currentPage} <span className="opacity-20 text-[6px] align-middle">/</span> {totalPages}
                            </span>
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-4 rounded-2xl border transition-all disabled:opacity-5 hover:bg-white/5"
                                style={{ borderColor: activeTheme.bgAlt }}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <UserInspectDrawer 
                user={selectedUser} 
                onClose={() => setSelectedUser(null)} 
                activeTheme={activeTheme}
            />

            <AnimatePresence>
                {userToDelete && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setUserToDelete(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className="relative bg-[#0a0a0a] border border-red-500/20 rounded-[4rem] p-12 max-w-lg w-full text-center shadow-[0_0_100px_rgba(239,68,68,0.1)]"
                        >
                            <div className="w-24 h-24 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-red-500 border border-red-500/20">
                                <AlertTriangle size={48} />
                            </div>
                            <h3 className="text-3xl font-black tracking-tighter mb-4 text-red-500">TERMINATE OPERATIVE?</h3>
                            <p className="text-sm opacity-40 mb-10 font-bold leading-relaxed px-6">You are about to permanently erase account data for <span className="text-white">{userToDelete.email}</span>. This action is terminal and cannot be reversed.</p>
                            <div className="flex gap-4">
                                <button onClick={() => setUserToDelete(null)} className="flex-1 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest border border-white/5 hover:bg-white/5 transition-all outline-none">Abort Mission</button>
                                <button onClick={confirmDelete} className="flex-1 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 transition-all shadow-2xl shadow-red-500/20 outline-none">Confirm Deletion</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
