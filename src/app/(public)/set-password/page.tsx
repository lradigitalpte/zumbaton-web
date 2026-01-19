"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SetPasswordPage() {
  const [redirecting, setRedirecting] = useState(true);

  useEffect(() => {
    const handleRedirect = () => {
      try {
        // Check for hash fragments (Supabase recovery links use hash fragments)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const type = hashParams.get("type");
        
        // If we have a recovery token, try to decode it to check role WITHOUT API call
        if (accessToken && type === 'recovery') {
          try {
            // Decode JWT token to get user metadata without API call
            const parts = accessToken.split('.');
            if (parts.length === 3) {
              // Decode the payload (second part)
              const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
              const userRole = payload?.user_metadata?.role;
              const isAdminUser = userRole === 'admin' || userRole === 'super_admin' || userRole === 'staff' || userRole === 'receptionist' || userRole === 'instructor';
              
              console.log('[SetPassword] Decoded role from token:', userRole, 'isAdmin:', isAdminUser);
              
              if (isAdminUser) {
                // Redirect immediately without waiting for API call
                console.log('[SetPassword] Redirecting admin user to admin app');
                window.location.replace(`https://admin.zumbaton.sg/set-password${window.location.hash}`);
                return;
              }
            }
          } catch (decodeError) {
            console.warn('[SetPassword] Could not decode token, will check session:', decodeError);
          }
        }
        
        // If we couldn't decode or no token, check session (this is an API call but happens in parallel)
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            const userRole = session.user?.user_metadata?.role;
            const isAdminUser = userRole === 'admin' || userRole === 'super_admin' || userRole === 'staff' || userRole === 'receptionist' || userRole === 'instructor';
            
            if (isAdminUser) {
              console.log('[SetPassword] Redirecting admin user to admin app (from session)');
              window.location.replace(`https://admin.zumbaton.sg/set-password${window.location.hash}`);
              return;
            }
          }
          
          // Regular users - redirect to reset-password page
          console.log('[SetPassword] Redirecting regular user to reset-password');
          window.location.replace(`/reset-password${window.location.hash}`);
        }).catch((error) => {
          console.error('[SetPassword] Error checking session:', error);
          // Fallback: redirect to reset-password
          window.location.replace(`/reset-password${window.location.hash}`);
        });
        
        // If no token at all, redirect to reset-password
        if (!accessToken) {
          window.location.replace(`/reset-password${window.location.hash || ''}`);
        }
      } catch (error) {
        console.error('[SetPassword] Error in redirect:', error);
        // Fallback: redirect to reset-password
        window.location.replace(`/reset-password${window.location.hash || ''}`);
      }
    };

    // Execute immediately - no delay needed
    handleRedirect();
  }, []);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
      </div>
    </div>
  );
}
