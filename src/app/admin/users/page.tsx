"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getUsersList, updateUserRole, deleteUser } from "@/app/actions/admin";
import { Loader2, ShieldAlert, ShieldCheck, User, Search, Trash2, ChevronLeft, ChevronRight, ChevronDown, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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

    // Close on click outside
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
                className={`flex items-center justify-between gap-2 bg-black/40 border border-white/10 rounded-lg text-xs px-3 py-2 min-w-[110px] transition-colors focus:outline-none focus:ring-1 focus:ring-[#ffaa00] ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5 cursor-pointer'}`}
            >
                <span className="capitalize font-medium">{user.role}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-32 bg-[#111] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                        {roles.map((r) => (
                            <button
                                key={r}
                                onClick={() => {
                                    onRoleChange(user.id, r);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-xs capitalize transition-colors flex items-center gap-2 ${
                                    user.role === r ? 'bg-white/10 text-[#ffaa00] font-bold' : 'hover:bg-white/5 text-white/70 hover:text-white'
                                }`}
                            >
                                {r === "superadmin" && <ShieldAlert className="w-3 h-3 text-red-400" />}
                                {r === "admin" && <ShieldCheck className="w-3 h-3 text-[#ffaa00]" />}
                                {r === "user" && <User className="w-3 h-3 opacity-50" />}
                                {r}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


// --- Main Page Component ---
export default function AdminUsersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<DBUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Custom Modal State
    const [userToDelete, setUserToDelete] = useState<DBUser | null>(null);

    // Filter & Pagination State
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

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
                toast.success("User account deleted permanently.");
                setUsers(users.filter(u => u.id !== userToDelete.id));
                setUserToDelete(null); // close modal
            } else {
                toast.error(res.error || "Failed to delete user");
            }
        } catch (error) {
            toast.error("Error deleting user");
        } finally {
            setDeletingId(null);
        }
    };

    // Derived State
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
        <div className="space-y-6 relative">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-[#ffaa00]">User Management</h2>
                    <p className="text-sm opacity-60">Manage roles, permissions, and accounts for all registered users.</p>
                </div>
                
                <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 opacity-40" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#ffaa00] focus:border-[#ffaa00] transition-colors shadow-inner"
                    />
                </div>
            </div>

            {/* Main Table Card */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-white/[0.03] text-[#ffaa00] border-b border-white/10">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-black tracking-wider">User</th>
                                <th scope="col" className="px-6 py-4 font-black tracking-wider">Current Role</th>
                                <th scope="col" className="px-6 py-4 text-center font-black tracking-wider">Level / XP</th>
                                <th scope="col" className="px-6 py-4 text-center font-black tracking-wider">Tests Completed</th>
                                <th scope="col" className="px-6 py-4 text-right font-black tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.map((user) => (
                                <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white/90">{user.name || "Anonymous"}</span>
                                            <span className="text-xs text-white/50">{user.email}</span>
                                            <span className="text-[10px] text-white/30 mt-1 font-mono">
                                                Joined: {new Date(user.joinedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {user.role === "superadmin" && <ShieldAlert className="w-4 h-4 text-red-500" />}
                                            {user.role === "admin" && <ShieldCheck className="w-4 h-4 text-[#ffaa00]" />}
                                            {user.role === "user" && <User className="w-4 h-4 opacity-50" />}
                                            <span className={`font-bold uppercase text-[10px] tracking-wider px-2 py-1 rounded-md ${
                                                user.role === "superadmin" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                                user.role === "admin" ? "bg-[#ffaa00]/10 text-[#ffaa00] border border-[#ffaa00]/20" :
                                                "bg-white/5 opacity-70 border border-white/10"
                                            }`}>
                                                {user.role}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                         <div className="flex flex-col items-center">
                                            <span className="font-bold text-[#ffaa00] bg-[#ffaa00]/10 px-2 py-0.5 rounded-md">
                                                Lvl {user.level || 1}
                                            </span>
                                            <span className="text-[10px] opacity-50 mt-1 font-mono">{user.xp || 0} XP</span>
                                         </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center justify-center bg-white/5 px-3 py-1 rounded-lg text-xs font-mono opacity-80 border border-white/10">
                                            {user.testsCompleted || 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            
                                            <div className="relative flex items-center justify-center">
                                                <RoleDropdown 
                                                    user={user} 
                                                    onRoleChange={handleRoleChange} 
                                                    disabled={updatingId === user.id || deletingId === user.id}
                                                />
                                                {updatingId === user.id && (
                                                    <div className="absolute -left-6">
                                                        <Loader2 className="w-4 h-4 animate-spin text-[#ffaa00]" />
                                                    </div>
                                                )}
                                            </div>

                                            <button 
                                                onClick={() => {
                                                    if (session?.user?.email === user.email) {
                                                        toast.error("You cannot delete your own account while logged in.");
                                                        return;
                                                    }
                                                    setUserToDelete(user);
                                                }}
                                                disabled={deletingId === user.id || session?.user?.email === user.email}
                                                className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-20 flex items-center justify-center min-w-[36px]"
                                                title="Delete User permanently"
                                            >
                                                {deletingId === user.id ? (
                                                     <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paginatedUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center opacity-50">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="p-4 bg-white/5 rounded-full">
                                                <Search className="w-8 h-8 opacity-40" />
                                            </div>
                                            <p className="font-medium text-lg">No users found</p>
                                            <p className="text-xs max-w-xs mx-auto">Try adjusting your search query or check if the user exists.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {filteredUsers.length > 0 && (
                    <div className="border-t border-white/10 bg-white/[0.02] p-4 flex items-center justify-between text-sm">
                        <span className="opacity-50 text-xs font-mono">
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} entries
                        </span>
                        
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-20 disabled:hover:bg-white/5 transition-colors focus:ring-1 focus:ring-[#ffaa00] focus:outline-none"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="w-16 flex items-center justify-center text-xs font-bold font-mono">
                                <span className="text-[#ffaa00]">{currentPage}</span>
                                <span className="opacity-40 mx-1">/</span>
                                <span className="opacity-70">{totalPages}</span>
                            </div>
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-20 disabled:hover:bg-white/5 transition-colors focus:ring-1 focus:ring-[#ffaa00] focus:outline-none"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Delete Confirmation Modal using Framer Motion */}
            <AnimatePresence>
                {userToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setUserToDelete(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        
                        {/* Modal Content */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-[#0f0f0f] border border-red-500/30 shadow-2xl shadow-red-500/10 rounded-2xl p-6 md:p-8 max-w-md w-full"
                        >
                            <button 
                                onClick={() => setUserToDelete(null)}
                                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                                    <AlertTriangle className="w-8 h-8 text-red-500" />
                                </div>
                                
                                <h3 className="text-xl font-black tracking-tight mb-2 text-red-500">
                                    Confirm Account Deletion
                                </h3>
                                
                                <p className="text-sm text-white/70 mb-6">
                                    You are about to permanently delete the account for <span className="text-white font-bold">{userToDelete.email || userToDelete.name || "this user"}</span>. 
                                    This action will erase all their typing statistics, XP, and settings. <br/><br/>
                                    <span className="text-red-400 font-bold uppercase text-xs tracking-wider">This action cannot be undone.</span>
                                </p>

                                <div className="flex items-center gap-3 w-full">
                                    <button 
                                        onClick={() => setUserToDelete(null)}
                                        className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 border border-white/10 transition-colors focus:ring-1 focus:ring-white/30 focus:outline-none"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={confirmDelete}
                                        className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-red-500/90 hover:bg-red-500 text-white shadow-lg shadow-red-500/20 transition-colors focus:ring-2 focus:ring-red-500/50 focus:outline-none flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Terminate
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
