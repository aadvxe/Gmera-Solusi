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
        // Use getUser() for better security and server-sync
        const { data: { user }, error } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (user) {
          // ✅ STEP 1: Set user immediately from session
          const baseRole = user.user_metadata?.role || "viewer";
          setUser(user as any);
          setRole(baseRole);

          // ✅ STEP 2: Enrich with DB profile
          enrichWithProfile(user);
        } else {
          // If there's an error like "Refresh Token Not Found", just sign out cleanly
          if (error) {
            console.warn("[AuthProvider] Session invalidated:", error.message);
          }
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        console.error("[AuthProvider] Initialization error:", err);
        if (isMounted) {
          setUser(null);
          setRole(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    init();

    // Listen for auth state changes (sign out, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
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
