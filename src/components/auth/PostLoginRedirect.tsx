"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const ENTRY_PATHS = new Set(["/", "/explore", "/signin", "/signup"]);

/**
 * After Google OAuth, Supabase sometimes lands users on the site URL (/)
 * instead of /magic-link-callback. Once the session exists, send them to
 * dashboard or onboarding.
 */
export default function PostLoginRedirect() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const hasRedirectedRef = useRef(false);

  // OAuth PKCE code on a non-callback page → hand off to the callback route.
  useEffect(() => {
    if (pathname === "/magic-link-callback") return;

    const code = searchParams.get("code");
    if (!code) return;

    const redirectTo = searchParams.get("redirectTo") || "/dashboard";
    const params = new URLSearchParams({ code, redirectTo });
    window.location.replace(`/magic-link-callback?${params.toString()}`);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || hasRedirectedRef.current) return;
    if (!pathname || !ENTRY_PATHS.has(pathname)) return;

    hasRedirectedRef.current = true;

    const go = async () => {
      let destination = "/dashboard";

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          hasRedirectedRef.current = false;
          return;
        }

        const res = await fetch("/api/onboarding", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json();
        if (data?.success && data.data?.completed === false) {
          destination = "/onboarding";
        }
      } catch {
        // fail open — dashboard is fine
      }

      router.replace(destination);
    };

    go();
  }, [isLoading, isAuthenticated, pathname, router]);

  return null;
}
