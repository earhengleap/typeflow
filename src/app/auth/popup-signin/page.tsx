"use client";

import { signIn } from "next-auth/react";
import { useEffect } from "react";

/**
 * This page is intended to be opened in a popup window.
 * It initiates the Google sign-in flow immediately.
 */
export default function PopupSignInPage() {
    useEffect(() => {
        signIn("google", { callbackUrl: "/auth/callback" });
    }, []);

    return (
        <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            height: "100vh",
            fontFamily: "monospace",
            backgroundColor: "#0b0e14",
            color: "#646669"
        }}>
            Redirecting to Google...
        </div>
    );
}
