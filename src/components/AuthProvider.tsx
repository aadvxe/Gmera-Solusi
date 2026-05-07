"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/authStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setRole, setIsLoading } = useAuthStore();
  const router = useRouter();

  /** Enrich user object with profile data from public.users */
  const enrichWithProfile = useCallback(async (userObj: any) => {
    try {
      const supabase = createClient();
      const { data: profile } = await supabase
        .from("users")
        .select("name, role, phone, department, is_active")
        .eq("id", userObj.id)
        .single();

      if (!profile) return; // No profile row yet — session user is already set, skip

      const userRole = profile.role || userObj.user_metadata?.role || "viewer";

      const enriched = {
        ...userObj,
        user_metadata: {
          ...userObj.user_metadata,
          role: userRole,
          full_name: profile.name || userObj.user_metadata?.full_name,
          phone: profile.phone,
          department: profile.department,
          is_active: profile.is_active,
        },
      };

      setUser(enriched as any);
      setRole(userRole);
    } catch (err) {
      // Profile fetch failed — user is already set from session, do nothing
      console.warn("[AuthProvider] Profile enrichment failed (non-fatal):", err);
    }
  }, [setUser, setRole]);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    const init = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (session?.user) {
          // ✅ STEP 1: Set user immediately from session — prevents null user state
          const baseRole = session.user.user_metadata?.role || "viewer";
          setUser(session.user as any);
          setRole(baseRole);

          // ✅ STEP 2: Enrich with DB profile (async, non-blocking for loading state)
          enrichWithProfile(session.user);
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        console.error("[AuthProvider] Session check failed:", err);
        if (isMounted) {
          setUser(null);
          setRole(null);
        }
      } finally {
        // Always unblock the UI, regardless of what happened
        if (isMounted) setIsLoading(false);
      }
    };

    init();

    // Listen for auth state changes (sign out, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (event === "SIGNED_OUT") {
          setUser(null);
          setRole(null);
          router.push("/login");
          return;
        }

        if (
          (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") &&
          session?.user
        ) {
          // Silently re-enrich on token refresh — user won't notice
          enrichWithProfile(session.user);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [enrichWithProfile, setIsLoading, setRole, setUser, router]);

  return <>{children}</>;
}
