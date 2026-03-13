"use client";

import { useEffect } from "react";

/**
 * This page is the final callback for the OAuth flow success.
 * It notifies the parent window and closes itself.
 */
export default function AuthCallbackPage() {
    useEffect(() => {
        if (window.opener) {
            window.opener.postMessage("auth-success", window.location.origin);
            window.close();
        }
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
            Authentication successful! Closing window...
        </div>
    );
}
