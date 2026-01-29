"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Dashboard/Sidebar";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import CheckInButton from "@/components/CheckInButton";
import UserOnboardingTour from "@/components/onboarding/UserOnboardingTour";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user, signOut } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isActiveChecked, setIsActiveChecked] = useState(false);
  const hasRedirectedRef = useRef(false);
  const hasCheckedActiveRef = useRef(false);

  // Check if sidebar is collapsed from Sidebar component (via localStorage or state)
  useEffect(() => {
    const handleStorageChange = () => {
      const collapsed = localStorage.getItem("sidebarCollapsed") === "true";
      setSidebarCollapsed(collapsed);
    };

    // Listen for changes
    window.addEventListener("storage", handleStorageChange);
    handleStorageChange(); // Initial check

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Check if user is active - deactivated users cannot access protected routes
  useEffect(() => {
    const checkUserActive = async () => {
      // Skip if already checked
      if (hasCheckedActiveRef.current) {
        return;
      }

      // Wait for auth to load
      if (isLoading) {
        return;
      }

      // If not authenticated, skip active check (session check will handle redirect)
      if (!isAuthenticated) {
        return;
      }

      // If user is null (deactivated), sign out and redirect
      if (!user) {
        console.warn('[Dashboard] User is null (likely deactivated), signing out...');
        hasCheckedActiveRef.current = true;
        await signOut();
        return;
      }

      // Check user active status from database
      try {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('is_active')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('[Dashboard] Error checking user active status:', error);
          // On error, allow access (fail open for backwards compatibility)
          setIsActiveChecked(true);
          return;
        }

        // If user is deactivated, sign out and redirect
        if (profile && profile.is_active === false) {
          console.warn('[Dashboard] User account is deactivated, signing out...');
          hasCheckedActiveRef.current = true;
          await signOut();
          return;
        }

        // User is active
        setIsActiveChecked(true);
        hasCheckedActiveRef.current = true;
      } catch (error) {
        console.error('[Dashboard] Error checking user active status:', error);
        // On error, allow access (fail open for backwards compatibility)
        setIsActiveChecked(true);
      }
    };

    checkUserActive();
  }, [isLoading, isAuthenticated, user, signOut]);

  // Check session directly as a fallback to avoid race conditions
  useEffect(() => {
    const checkSession = async () => {
      // If already authenticated via context, no need to check session
      if (isAuthenticated) {
        setSessionChecked(true);
        return;
      }

      // If still loading, wait
      if (isLoading) {
        return;
      }

      // Context says not authenticated - double-check with Supabase directly
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Session exists but context hasn't updated yet - wait a bit
          setSessionChecked(true);
          return;
        }
      } catch (error) {
        console.error('[Dashboard] Error checking session:', error);
      }

      // No session found - redirect to signin (but only once)
      if (!hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        router.push(`/signin?redirect=${pathname}`);
      }
    };

    // Add a small delay to allow auth state to propagate
    const timeoutId = setTimeout(checkSession, 100);
    return () => clearTimeout(timeoutId);
  }, [isLoading, isAuthenticated, router, pathname]);

  // Show loading while checking auth or user active status
  if (isLoading || (!isAuthenticated && !sessionChecked) || (isAuthenticated && !isActiveChecked)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a2e]">
      {/* Sidebar */}
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        {/* Header */}
        <DashboardHeader 
          sidebarCollapsed={sidebarCollapsed}
          onMobileMenuClick={() => setIsMobileSidebarOpen(true)}
        />
        
        {/* Page Content */}
        <div className="pt-28 sm:pt-32 p-4 sm:p-6">
          {children}
        </div>
      </div>
      
      {/* Check-In Button - Only on authenticated pages */}
      <CheckInButton />
      
      {/* User Onboarding Tour */}
      <UserOnboardingTour />
    </div>
  );
};

export default DashboardLayout;
