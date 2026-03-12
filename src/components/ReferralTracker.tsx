"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export function ReferralTracker() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { status } = useSession();

    useEffect(() => {
        const refId = searchParams.get("ref");
        if (refId) {
            // 1. Always store referral ID in cookie for 7 days (in case they log out and create new account)
            const expires = new Date();
            expires.setDate(expires.getDate() + 7);
            document.cookie = `typeflow_ref=${refId}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
            console.log("[REFERRAL] Captured referrer ID:", refId);

            // 2. If authenticated, notify that they are already a member
            if (status === "authenticated") {
                toast.info("Recruitment link identified, but you are already an active operative.", {
                    description: "Referral rewards are dedicated to new recruits.",
                    duration: 5000,
                });
            }

            // 3. Clean up the URL
            const params = new URLSearchParams(searchParams.toString());
            params.delete("ref");
            router.replace(`?${params.toString()}`, { scroll: false });
        }
    }, [searchParams, status, router]);

    return null;
}
