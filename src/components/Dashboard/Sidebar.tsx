"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/Modal/Modal";
import { useProfile } from "@/hooks/useProfile";

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const Sidebar = ({ isMobileOpen = false, onMobileClose }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
    // Dispatch storage event for other components to listen
    window.dispatchEvent(new Event("storage"));
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // Redirect to signin page after logout
      router.push("/signin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const menuItems: Array<{
    name: string;
    href: string;
    onClick?: () => void;
    icon: React.ReactNode;
  }> = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: "Browse Classes",
      href: "/book-classes",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      name: "My Bookings",
      href: "/my-bookings",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: "Buy Tokens",
      href: "/packages",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: "My Packages",
      href: "/my-packages",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      name: "Token History",
      href: "/tokens",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
  ];

  const bottomMenuItems = [
    {
      name: "Profile",
      href: "/profile",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      name: "Settings",
      href: "/settings",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobileOpen && onMobileClose) {
      onMobileClose();
    }
  }, [pathname]); // Only depend on pathname, not onMobileClose

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-[10035] bg-black/50 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-[10040] flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-[min(100vw-2rem,17rem)] lg:w-64"
        } h-[100dvh] max-h-[100dvh] bg-zinc-950 border-r border-zinc-800 shadow-xl lg:shadow-none ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
      {/* Logo & Toggle */}
      <div className="relative flex h-14 shrink-0 items-center border-b border-zinc-800 px-4 lg:h-16">
        {/* Logo - centered in both states */}
        <div className="flex-1 flex items-center justify-center">
          {!isCollapsed ? (
            <Link href="/dashboard" className="flex items-center justify-center w-full">
              <Image
                src="/logo/One step fitness logo.png"
                alt="One Step Fitness Logo"
                width={180}
                height={60}
                className="sidebar-logo h-12 w-auto object-contain"
                priority
              />
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center justify-center">
              <Image
                src="/logo/One step fitness logo.png"
                alt="One Step Fitness"
                width={40}
                height={40}
                className="sidebar-logo-collapsed h-8 w-8 object-contain"
                priority
              />
            </Link>
          )}
        </div>
        
        {/* Mobile Close Button - absolute positioned */}
        <button
          onClick={onMobileClose}
          className="absolute right-1 rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Desktop Collapse Toggle - absolute positioned */}
        <button
          onClick={toggleCollapse}
          className="absolute right-2 hidden lg:block p-2 rounded-lg hover:bg-gray-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg
            className={`w-5 h-5 text-gray-300 transition-transform ${
              isCollapsed ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* User Info */}
      <div
        className={`shrink-0 border-b border-zinc-800 p-4 ${isCollapsed ? "text-center" : ""}`}
      >
        <div
          className={`flex items-center gap-3 ${!isCollapsed ? "rounded-2xl bg-zinc-900/80 p-2 lg:bg-transparent lg:p-0" : ""}`}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-800 ring-2 ring-lime-400/30">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={user?.name || "User"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('span')) {
                    const span = document.createElement('span');
                    span.className = 'text-lime-400 font-semibold';
                    span.textContent = user?.name?.charAt(0)?.toUpperCase() || "U";
                    parent.appendChild(span);
                  }
                }}
              />
            ) : (
              <span className="text-lime-400 font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            )}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="truncate font-bold text-white">{user?.name || "User"}</p>
              <p className="truncate text-xs text-zinc-500">{user?.email || ""}</p>
            </div>
          )}
        </div>
      </div>

      {/* Nav — on mobile, items stack without a huge empty gap above Profile */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-[max(1rem,env(safe-area-inset-bottom))] lg:overflow-hidden">
        <nav className="space-y-1 p-3 lg:flex-1 lg:overflow-y-auto lg:p-4">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onMobileClose}
                data-onboarding={`user-${item.name.toLowerCase().replace(/\s+/g, "-")}-menu`}
                className={`flex items-center gap-3 rounded-full px-3 py-3 transition-colors active:scale-[0.99] lg:rounded-lg lg:py-2.5 ${
                  isActive
                    ? "bg-lime-400 font-bold text-zinc-900"
                    : "font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
                title={isCollapsed ? item.name : undefined}
              >
                {item.icon}
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="mt-2 shrink-0 border-t border-zinc-800 p-3 lg:mt-auto lg:pb-5">
          <p className="mb-2 hidden px-3 text-[10px] font-semibold uppercase tracking-wide text-zinc-600 lg:block">
            Account
          </p>
          <div className="space-y-1">
            {bottomMenuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onMobileClose}
                  data-onboarding={`user-${item.name.toLowerCase().replace(/\s+/g, "-")}-menu`}
                  className={`flex items-center gap-3 rounded-full px-3 py-3 transition-colors active:scale-[0.99] lg:rounded-lg lg:py-2.5 ${
                    isActive
                      ? "bg-lime-400 font-bold text-zinc-900"
                      : "font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  } ${isCollapsed ? "justify-center px-2" : ""}`}
                  title={isCollapsed ? item.name : undefined}
                >
                  {item.icon}
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className={`mt-2 flex w-full items-center gap-3 rounded-full px-3 py-3 font-medium text-red-400 transition-colors hover:bg-red-950/50 active:scale-[0.99] lg:rounded-lg lg:py-2.5 ${
              isCollapsed ? "justify-center" : ""
            }`}
            title={isCollapsed ? "Logout" : undefined}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Logout"
        description="Are you sure you want to logout? You'll need to sign in again to access your account."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-body-color dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        }
      >
        <div className="space-y-2">
          <p className="text-body-color dark:text-gray-400">
            You will be signed out of your account and redirected to the sign in page.
          </p>
        </div>
      </Modal>
      </aside>
    </>
  );
};

export default Sidebar;
