"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function SetPasswordPage() {
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Check for hash fragments (Supabase recovery links use hash fragments)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const type = hashParams.get("type");
        
        // If we have a recovery token, exchange it for a session
        if (accessToken && type === 'recovery') {
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get("refresh_token") || '',
          });
          
          if (session && !error) {
            // Check if user is an admin/staff - redirect to admin app
            const userRole = session.user?.user_metadata?.role;
            const isAdminUser = userRole === 'admin' || userRole === 'super_admin' || userRole === 'staff' || userRole === 'receptionist' || userRole === 'instructor';
            
            if (isAdminUser) {
              // Redirect admin users to admin app's set-password page
              window.location.href = `https://admin.zumbaton.sg/set-password${window.location.hash}`;
              return;
            }
          }
        }
        
        // Check existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const userRole = session.user?.user_metadata?.role;
          const isAdminUser = userRole === 'admin' || userRole === 'super_admin' || userRole === 'staff' || userRole === 'receptionist' || userRole === 'instructor';
          
          if (isAdminUser) {
            // Redirect admin users to admin app's set-password page
            window.location.href = `https://admin.zumbaton.sg/set-password${window.location.hash}`;
            return;
          }
        }
        
        // Regular users - redirect to reset-password page
        window.location.href = `/reset-password${window.location.hash}`;
      } catch (error) {
        console.error('Error in set-password redirect:', error);
        // Fallback: redirect to reset-password
        window.location.href = `/reset-password${window.location.hash}`;
      }
    };

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
